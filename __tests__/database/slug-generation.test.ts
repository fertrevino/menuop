/**
 * Tests for Database Slug Generation Logic
 * These tests ensure that menu slugs are generated correctly and uniquely
 */

describe("Menu Slug Generation", () => {
  describe("generate_menu_slug function behavior", () => {
    // Note: These are tests for the expected behavior of the PostgreSQL function
    // In a real test environment, you would test against an actual database

    const testCases = [
      {
        restaurant: "Joe's Diner",
        menu: "Breakfast Menu",
        expected: "joes-diner-breakfast-menu",
        description: "basic slug generation with apostrophe",
      },
      {
        restaurant: "The Best Restaurant!!!",
        menu: "Special Menu",
        expected: "the-best-restaurant-special-menu",
        description: "removes special characters",
      },
      {
        restaurant: "Café Français",
        menu: "Menu du Jour",
        expected: "cafe-francais-menu-du-jour",
        description: "handles accented characters",
      },
      {
        restaurant: "123 Number Restaurant",
        menu: "Menu #1",
        expected: "123-number-restaurant-menu-1",
        description: "handles numbers and special chars",
      },
      {
        restaurant: "   Spaced   Restaurant   ",
        menu: "   Spaced   Menu   ",
        expected: "spaced-restaurant-spaced-menu",
        description: "trims and normalizes spaces",
      },
      {
        restaurant: "Short",
        menu: "A",
        expected: "short-a",
        description: "handles very short names",
      },
      {
        restaurant:
          "Restaurant With Very Very Very Long Name That Goes On And On",
        menu: "Menu With Extremely Long Name That Also Goes On",
        expected:
          "restaurant-with-very-very-very-long-name-that-goes-on-and-on-menu-with-extremely-long-name-that-also-goes-on",
        description: "handles very long names",
      },
    ];

    testCases.forEach(({ restaurant, menu, expected, description }) => {
      it(`should generate correct slug for ${description}`, () => {
        // This would be the expected behavior of our PostgreSQL function
        const result = generateSlugMock(restaurant, menu);
        expect(result).toBe(expected);
      });
    });

    it("should handle duplicate slugs by appending counter", () => {
      // Simulate existing slugs in database
      const existingSlugs = ["test-restaurant-menu", "test-restaurant-menu-1"];

      const result = generateSlugWithConflictHandling(
        "Test Restaurant",
        "Menu",
        existingSlugs
      );
      expect(result).toBe("test-restaurant-menu-2");
    });

    it("should handle multiple duplicate slugs", () => {
      const existingSlugs = [
        "popular-restaurant-menu",
        "popular-restaurant-menu-1",
        "popular-restaurant-menu-2",
        "popular-restaurant-menu-3",
      ];

      const result = generateSlugWithConflictHandling(
        "Popular Restaurant",
        "Menu",
        existingSlugs
      );
      expect(result).toBe("popular-restaurant-menu-4");
    });

    it("should return base slug when no conflicts exist", () => {
      const existingSlugs = ["other-restaurant-menu"];

      const result = generateSlugWithConflictHandling(
        "Unique Restaurant",
        "Menu",
        existingSlugs
      );
      expect(result).toBe("unique-restaurant-menu");
    });
  });

  describe("Slug validation rules", () => {
    it("should ensure slugs are URL-safe", () => {
      const testSlugs = [
        "simple-slug",
        "with-numbers-123",
        "very-long-slug-with-many-words",
        "a", // single character
      ];

      testSlugs.forEach((slug) => {
        expect(isUrlSafe(slug)).toBe(true);
      });
    });

    it("should reject invalid slugs", () => {
      const invalidSlugs = [
        "slug with spaces",
        "slug_with_underscores",
        "slug.with.dots",
        "slug/with/slashes",
        "slug?with=query",
        "slug#with-hash",
        "",
      ];

      invalidSlugs.forEach((slug) => {
        expect(isUrlSafe(slug)).toBe(false);
      });
    });

    it("should enforce reasonable length limits", () => {
      const veryLongSlug = "a".repeat(300);
      expect(veryLongSlug.length).toBeGreaterThan(255); // Most DB varchar limits

      // In practice, we might want to truncate very long slugs
      const truncatedSlug = truncateSlug(veryLongSlug, 255);
      expect(truncatedSlug.length).toBeLessThanOrEqual(255);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty or whitespace-only inputs", () => {
      const result = generateSlugMock("", "");
      expect(result).toBe(""); // Or some default like "menu"
    });

    it("should handle inputs with only special characters", () => {
      const result = generateSlugMock("!!!", "???");
      expect(result).toBe(""); // Should strip all invalid chars
    });

    it("should handle Unicode characters appropriately", () => {
      const result = generateSlugMock("Café François", "Menú Español");
      // Depending on implementation, might normalize or strip Unicode
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

// Mock implementation of slug generation (mirrors PostgreSQL function logic)
function generateSlugMock(restaurantName: string, menuName: string): string {
  const combined = `${restaurantName}-${menuName}`;

  return (
    combined
      .toLowerCase()
      .trim()
      // Normalize accented characters (basic replacement)
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[ç]/g, "c")
      .replace(/[ñ]/g, "n")
      .replace(/[^a-zA-Z0-9\s-]/g, "") // Remove special chars except spaces and hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, "")
  ); // Remove leading/trailing hyphens
}

function generateSlugWithConflictHandling(
  restaurantName: string,
  menuName: string,
  existingSlugs: string[]
): string {
  const baseSlug = generateSlugMock(restaurantName, menuName);
  let finalSlug = baseSlug;
  let counter = 0;

  while (existingSlugs.includes(finalSlug)) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  return finalSlug;
}

function isUrlSafe(slug: string): boolean {
  if (!slug || slug.length === 0) return false;

  // Only allow lowercase letters, numbers, and hyphens
  const urlSafePattern = /^[a-z0-9-]+$/;
  return urlSafePattern.test(slug);
}

function truncateSlug(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;

  // Truncate at word boundary if possible
  const truncated = slug.substring(0, maxLength);
  const lastHyphen = truncated.lastIndexOf("-");

  if (lastHyphen > maxLength * 0.7) {
    return truncated.substring(0, lastHyphen);
  }

  return truncated;
}
