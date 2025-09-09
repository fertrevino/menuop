import {
  MenuFormData,
  MenuSectionFormData,
  MenuItemFormData,
  Menu,
  MenuWithSections,
  MenuSectionWithItems,
} from "../types/menu";
import { MenuThemeConfig, THEME_PRESETS } from "../types/theme";
import { getCurrencyByCode } from "./currency";

export const menuUtils = {
  // Generate a random ID for temporary use in forms
  generateTempId: (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  // Create empty menu form data
  // Create empty menu form
  createEmptyMenu: (): MenuFormData => ({
    name: "",
    restaurant_name: "",
    description: "",
    currency: "USD",
    sections: [],
    theme_config: THEME_PRESETS[0].config,
  }),

  // Create empty section
  createEmptySection: (name: string = "New Section"): MenuSectionFormData => ({
    name,
    description: "",
    items: [],
  }),

  // Create empty menu item
  createEmptyItem: (): MenuItemFormData => ({
    name: "",
    description: "",
    // Use -1 sentinel so input field can be cleared ("" shows) before entering a real price
    price: -1,
    is_available: true,
  }),

  // Validate menu data before saving
  validateMenu: (
    menuData: MenuFormData
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!menuData.name.trim()) {
      errors.push("Menu name is required");
    }

    if (!menuData.restaurant_name.trim()) {
      errors.push("Restaurant name is required");
    }

    if (menuData.sections.length === 0) {
      errors.push("At least one section is required");
    }

    menuData.sections.forEach((section, sectionIndex) => {
      if (!section.name.trim()) {
        errors.push(`Section ${sectionIndex + 1}: Section name is required`);
      }

      section.items.forEach((item, itemIndex) => {
        if (!item.name.trim()) {
          errors.push(
            `Section "${section.name}" - Item ${
              itemIndex + 1
            }: Item name is required`
          );
        }

        // Treat sentinel -1 and 0 or negative as invalid when validating for save
        if (item.price <= 0) {
          errors.push(
            `Section "${section.name}" - Item "${item.name}": Price must be greater than 0`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Calculate menu statistics
  calculateMenuStats: (menuData: MenuFormData) => {
    const totalItems = menuData.sections.reduce(
      (total, section) => total + section.items.length,
      0
    );

    const totalSections = menuData.sections.length;

    const averagePrice =
      menuData.sections.reduce((total, section) => {
        const sectionTotal = section.items.reduce(
          (sum, item) => sum + item.price,
          0
        );
        return total + sectionTotal;
      }, 0) / Math.max(totalItems, 1);

    const priceRange = menuData.sections.reduce(
      (range, section) => {
        section.items.forEach((item) => {
          if (item.price > 0) {
            range.min = Math.min(range.min, item.price);
            range.max = Math.max(range.max, item.price);
          }
        });
        return range;
      },
      { min: Infinity, max: 0 }
    );

    return {
      totalItems,
      totalSections,
      averagePrice: isFinite(averagePrice) ? averagePrice : 0,
      priceRange: {
        min: isFinite(priceRange.min) ? priceRange.min : 0,
        max: priceRange.max,
      },
    };
  },

  // Format price for display
  formatPrice: (price: number, currency: string = "USD"): string => {
    const currencyObj = getCurrencyByCode(currency);
    const locale = currencyObj?.locale || "en-US";

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(price);
  },

  // Generate menu slug from restaurant and menu name
  generateSlug: (restaurantName: string, menuName: string): string => {
    const combined = `${restaurantName}-${menuName}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  // Sort sections and items by sort_order
  sortMenuData: (menuData: MenuWithSections) => {
    if (menuData.sections) {
      menuData.sections.sort(
        (a: MenuSectionWithItems, b: MenuSectionWithItems) =>
          (a.sort_order || 0) - (b.sort_order || 0)
      );

      menuData.sections.forEach((section: MenuSectionWithItems) => {
        if (section.items) {
          section.items.sort(
            (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
          );
        }
      });
    }

    return menuData;
  },

  // Convert database menu to form data
  convertMenuToFormData: (menu: MenuWithSections): MenuFormData => {
    // Parse theme_config if it exists, otherwise use default theme
    let themeConfig: MenuThemeConfig;
    try {
      themeConfig = menu.theme_config
        ? typeof menu.theme_config === "string"
          ? JSON.parse(menu.theme_config)
          : (menu.theme_config as unknown as MenuThemeConfig)
        : THEME_PRESETS[0].config;
    } catch {
      themeConfig = THEME_PRESETS[0].config;
    }

    return {
      name: menu.name,
      restaurant_name: menu.restaurant_name,
      description: menu.description || "",
      currency: menu.currency || "USD",
      theme_config: themeConfig,
      sections:
        menu.sections?.map((section: MenuSectionWithItems) => ({
          id: section.id,
          name: section.name,
          description: section.description || "",
          items:
            section.items?.map((item) => ({
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: item.price,
              image_url: item.image_url || "",
              is_available: item.is_available ?? true,
            })) || [],
        })) || [],
    };
  },

  // Deep clone menu data to avoid mutations
  cloneMenuData: (menuData: MenuFormData): MenuFormData => {
    return JSON.parse(JSON.stringify(menuData));
  },

  // Check if menu has unsaved changes
  hasUnsavedChanges: (
    original: MenuFormData,
    current: MenuFormData
  ): boolean => {
    return JSON.stringify(original) !== JSON.stringify(current);
  },

  // Soft delete utility functions
  isMenuDeleted: (menu: Menu): boolean => {
    return menu.deleted_on !== null;
  },

  getDeletedDate: (menu: Menu): Date | null => {
    return menu.deleted_on ? new Date(menu.deleted_on) : null;
  },

  formatDeletedDate: (menu: Menu): string => {
    const deletedDate = menuUtils.getDeletedDate(menu);
    if (!deletedDate) return "";

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(deletedDate);
  },

  // Calculate days since deletion (useful for showing how long ago it was deleted)
  daysSinceDeletion: (menu: Menu): number => {
    const deletedDate = menuUtils.getDeletedDate(menu);
    if (!deletedDate) return 0;

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Filter active (non-deleted) menus
  filterActiveMenus: (menus: Menu[]): Menu[] => {
    return menus.filter((menu) => !menuUtils.isMenuDeleted(menu));
  },

  // Filter deleted menus (for viewing deleted items only)
  filterDeletedMenus: (menus: Menu[]): Menu[] => {
    return menus.filter((menu) => menuUtils.isMenuDeleted(menu));
  },
};
