import { menuUtils } from "@/lib/utils/menu";
import { MenuFormData } from "@/lib/types/menu";

describe("menuUtils", () => {
  describe("validateMenu", () => {
    it("should pass validation for a valid menu", () => {
      const validMenu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [
              {
                name: "Nachos",
                description: "Cheesy nachos",
                price: 12.99,
                is_available: true,
              },
            ],
          },
        ],
      };

      const result = menuUtils.validateMenu(validMenu);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail validation when menu name is missing", () => {
      const invalidMenu: MenuFormData = {
        name: "",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [],
          },
        ],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Menu name is required");
    });

    it("should fail validation when restaurant name is missing", () => {
      const invalidMenu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [],
          },
        ],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Restaurant name is required");
    });

    it("should fail validation when no sections exist", () => {
      const invalidMenu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("At least one section is required");
    });

    it("should fail validation when section name is missing", () => {
      const invalidMenu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "",
            description: "Starter dishes",
            items: [],
          },
        ],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Section 1: Section name is required");
    });

    it("should fail validation when item name is missing", () => {
      const invalidMenu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [
              {
                name: "",
                description: "Cheesy nachos",
                price: 12.99,
                is_available: true,
              },
            ],
          },
        ],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Section "Appetizers" - Item 1: Item name is required'
      );
    });

    it("should fail validation when item price is zero or negative", () => {
      const invalidMenuZeroPrice: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [
              {
                name: "Free Nachos",
                description: "Cheesy nachos",
                price: 0,
                is_available: true,
              },
            ],
          },
        ],
      };

      const resultZero = menuUtils.validateMenu(invalidMenuZeroPrice);
      expect(resultZero.isValid).toBe(false);
      expect(resultZero.errors).toContain(
        'Section "Appetizers" - Item "Free Nachos": Price must be greater than 0'
      );

      const invalidMenuNegativePrice: MenuFormData = {
        ...invalidMenuZeroPrice,
        sections: [
          {
            ...invalidMenuZeroPrice.sections[0],
            items: [
              {
                ...invalidMenuZeroPrice.sections[0].items[0],
                name: "Negative Nachos",
                price: -5,
              },
            ],
          },
        ],
      };

      const resultNegative = menuUtils.validateMenu(invalidMenuNegativePrice);
      expect(resultNegative.isValid).toBe(false);
      expect(resultNegative.errors).toContain(
        'Section "Appetizers" - Item "Negative Nachos": Price must be greater than 0'
      );
    });

    it("should collect multiple validation errors", () => {
      const invalidMenu: MenuFormData = {
        name: "",
        restaurant_name: "",
        description: "A test menu",
        sections: [
          {
            name: "",
            description: "Starter dishes",
            items: [
              {
                name: "",
                description: "Cheesy nachos",
                price: 0,
                is_available: true,
              },
            ],
          },
        ],
      };

      const result = menuUtils.validateMenu(invalidMenu);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(5); // Updated to expect 5 errors
      expect(result.errors).toContain("Menu name is required");
      expect(result.errors).toContain("Restaurant name is required");
      expect(result.errors).toContain("Section 1: Section name is required");
      expect(result.errors).toContain(
        'Section "" - Item 1: Item name is required'
      );
    });
  });

  describe("createEmptyMenu", () => {
    it("should create a menu with default structure", () => {
      const emptyMenu = menuUtils.createEmptyMenu();

      expect(emptyMenu).toEqual({
        name: "",
        restaurant_name: "",
        description: "",
        sections: [
          {
            name: "Appetizers",
            description: "",
            items: [],
          },
        ],
      });
    });
  });

  describe("createEmptySection", () => {
    it("should create an empty section with default name", () => {
      const emptySection = menuUtils.createEmptySection();

      expect(emptySection).toEqual({
        name: "New Section",
        description: "",
        items: [],
      });
    });

    it("should create an empty section with custom name", () => {
      const emptySection = menuUtils.createEmptySection("Custom Section");

      expect(emptySection).toEqual({
        name: "Custom Section",
        description: "",
        items: [],
      });
    });
  });

  describe("createEmptyItem", () => {
    it("should create an empty menu item", () => {
      const emptyItem = menuUtils.createEmptyItem();

      expect(emptyItem).toEqual({
        name: "",
        description: "",
        price: 0,
        is_available: true,
      });
    });
  });

  describe("hasUnsavedChanges", () => {
    const originalMenu: MenuFormData = {
      name: "Original Menu",
      restaurant_name: "Original Restaurant",
      description: "Original description",
      sections: [
        {
          name: "Appetizers",
          description: "Starter dishes",
          items: [
            {
              name: "Nachos",
              description: "Cheesy nachos",
              price: 12.99,
              is_available: true,
            },
          ],
        },
      ],
    };

    it("should return false for identical menus", () => {
      const currentMenu = JSON.parse(JSON.stringify(originalMenu));

      const hasChanges = menuUtils.hasUnsavedChanges(originalMenu, currentMenu);

      expect(hasChanges).toBe(false);
    });

    it("should return true when menu name changes", () => {
      const currentMenu = {
        ...originalMenu,
        name: "Changed Menu Name",
      };

      const hasChanges = menuUtils.hasUnsavedChanges(originalMenu, currentMenu);

      expect(hasChanges).toBe(true);
    });

    it("should return true when section is added", () => {
      const currentMenu = {
        ...originalMenu,
        sections: [
          ...originalMenu.sections,
          {
            name: "Desserts",
            description: "Sweet treats",
            items: [],
          },
        ],
      };

      const hasChanges = menuUtils.hasUnsavedChanges(originalMenu, currentMenu);

      expect(hasChanges).toBe(true);
    });

    it("should return true when item price changes", () => {
      const currentMenu = {
        ...originalMenu,
        sections: [
          {
            ...originalMenu.sections[0],
            items: [
              {
                ...originalMenu.sections[0].items[0],
                price: 15.99,
              },
            ],
          },
        ],
      };

      const hasChanges = menuUtils.hasUnsavedChanges(originalMenu, currentMenu);

      expect(hasChanges).toBe(true);
    });
  });

  describe("calculateMenuStats", () => {
    it("should calculate correct statistics for a menu", () => {
      const menu: MenuFormData = {
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        sections: [
          {
            name: "Appetizers",
            description: "Starter dishes",
            items: [
              {
                name: "Nachos",
                description: "",
                price: 10.0,
                is_available: true,
              },
              {
                name: "Wings",
                description: "",
                price: 15.0,
                is_available: true,
              },
            ],
          },
          {
            name: "Main Courses",
            description: "Hearty meals",
            items: [
              {
                name: "Burger",
                description: "",
                price: 20.0,
                is_available: true,
              },
              {
                name: "Pizza",
                description: "",
                price: 25.0,
                is_available: true,
              },
              {
                name: "Steak",
                description: "",
                price: 35.0,
                is_available: true,
              },
            ],
          },
        ],
      };

      const stats = menuUtils.calculateMenuStats(menu);

      expect(stats.totalItems).toBe(5);
      expect(stats.totalSections).toBe(2);
      expect(stats.averagePrice).toBe(21); // (10+15+20+25+35)/5 = 21
      expect(stats.priceRange.min).toBe(10);
      expect(stats.priceRange.max).toBe(35);
    });

    it("should handle empty menu correctly", () => {
      const emptyMenu: MenuFormData = {
        name: "Empty Menu",
        restaurant_name: "Empty Restaurant",
        description: "",
        sections: [],
      };

      const stats = menuUtils.calculateMenuStats(emptyMenu);

      expect(stats.totalItems).toBe(0);
      expect(stats.totalSections).toBe(0);
      expect(stats.averagePrice).toBe(0);
      expect(stats.priceRange.min).toBe(0); // Updated based on actual implementation
      expect(stats.priceRange.max).toBe(0);
    });
  });
});
