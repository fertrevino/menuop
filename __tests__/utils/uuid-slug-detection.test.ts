/**
 * Tests for UUID vs Slug Detection Logic
 * These tests help prevent issues with menu identifier resolution
 */

describe("Menu Identifier Resolution", () => {
  // The UUID detection logic from the API route
  function isUUID(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id
    );
  }

  // Function that mimics the API route logic
  function getQueryField(identifier: string): "id" | "slug" {
    return isUUID(identifier) ? "id" : "slug";
  }

  describe("UUID Detection", () => {
    const validUUIDs = [
      "4611407c-5aa8-4087-9dc0-97215c79a447",
      "00000000-0000-0000-0000-000000000000",
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
      "12345678-1234-5678-9abc-123456789abc",
      "ABCDEF01-2345-6789-ABCD-EF0123456789", // uppercase
    ];

    const invalidUUIDs = [
      "test-menu-slug",
      "not-a-uuid",
      "4611407c-5aa8-4087-9dc0", // too short
      "4611407c-5aa8-4087-9dc0-97215c79a447-extra", // too long
      "GGGGGGGG-5aa8-4087-9dc0-97215c79a447", // invalid chars
      "4611407c_5aa8_4087_9dc0_97215c79a447", // underscores instead of hyphens
      "4611407c 5aa8 4087 9dc0 97215c79a447", // spaces
      "",
      "test-restaurant-menu",
      "my-awesome-restaurant-special-menu-2024",
      "123-not-uuid",
    ];

    validUUIDs.forEach((uuid) => {
      it(`should recognize "${uuid}" as a valid UUID`, () => {
        expect(isUUID(uuid)).toBe(true);
        expect(getQueryField(uuid)).toBe("id");
      });
    });

    invalidUUIDs.forEach((notUuid) => {
      it(`should recognize "${notUuid}" as a slug, not UUID`, () => {
        expect(isUUID(notUuid)).toBe(false);
        expect(getQueryField(notUuid)).toBe("slug");
      });
    });
  });

  describe("Query Field Selection", () => {
    const testCases = [
      {
        identifier: "4611407c-5aa8-4087-9dc0-97215c79a447",
        expectedField: "id",
        description: "UUID",
      },
      {
        identifier: "test-restaurant-menu",
        expectedField: "slug",
        description: "basic slug",
      },
      {
        identifier: "my-awesome-restaurant-special-menu",
        expectedField: "slug",
        description: "long slug",
      },
      {
        identifier: "123-not-uuid",
        expectedField: "slug",
        description: "number-starting slug",
      },
      {
        identifier: "restaurant-menu-2024",
        expectedField: "slug",
        description: "slug with year",
      },
    ];

    testCases.forEach(({ identifier, expectedField, description }) => {
      it(`should query by ${expectedField} for ${description}: "${identifier}"`, () => {
        expect(getQueryField(identifier)).toBe(expectedField);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle case-insensitive UUID detection", () => {
      const mixedCase = "4611407C-5aa8-4087-9dc0-97215C79a447";
      expect(isUUID(mixedCase)).toBe(true);
      expect(getQueryField(mixedCase)).toBe("id");
    });

    it("should reject UUIDs with invalid characters", () => {
      const invalidChars = [
        "4611407g-5aa8-4087-9dc0-97215c79a447", // 'g' is not hex
        "4611407c-5aa8-4087-9dc0-97215c79a44z", // 'z' is not hex
        "4611407c-5aa8-4087-9dc0-97215c79a44@", // special char
      ];

      invalidChars.forEach((invalid) => {
        expect(isUUID(invalid)).toBe(false);
        expect(getQueryField(invalid)).toBe("slug");
      });
    });

    it("should handle very long slugs", () => {
      const longSlug =
        "very-long-restaurant-name-with-many-words-and-descriptive-menu-name-that-goes-on-and-on";
      expect(isUUID(longSlug)).toBe(false);
      expect(getQueryField(longSlug)).toBe("slug");
    });

    it("should handle single character inputs", () => {
      expect(isUUID("a")).toBe(false);
      expect(getQueryField("a")).toBe("slug");
    });

    it("should handle empty string", () => {
      expect(isUUID("")).toBe(false);
      expect(getQueryField("")).toBe("slug");
    });
  });

  describe("Real-world scenarios", () => {
    // Based on the actual issue that occurred
    it("should handle the problematic case: test-res-test", () => {
      const problematicSlug = "test-res-test";
      expect(isUUID(problematicSlug)).toBe(false);
      expect(getQueryField(problematicSlug)).toBe("slug");
    });

    it("should handle realistic menu slugs", () => {
      const realisticSlugs = [
        "joes-diner-breakfast-menu",
        "the-best-restaurant-special-menu",
        "cafe-francais-menu-du-jour",
        "pizza-palace-dinner-specials",
        "sushi-bar-omakase-menu",
        "taco-truck-street-food-menu",
      ];

      realisticSlugs.forEach((slug) => {
        expect(isUUID(slug)).toBe(false);
        expect(getQueryField(slug)).toBe("slug");
      });
    });

    it("should handle realistic UUIDs from QR codes", () => {
      const realisticUUIDs = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "01234567-89ab-cdef-0123-456789abcdef",
      ];

      realisticUUIDs.forEach((uuid) => {
        expect(isUUID(uuid)).toBe(true);
        expect(getQueryField(uuid)).toBe("id");
      });
    });
  });
});
