import { Database } from "../database.types";

export type Menu = Database["public"]["Tables"]["menus"]["Row"];
export type MenuInsert = Database["public"]["Tables"]["menus"]["Insert"];
export type MenuUpdate = Database["public"]["Tables"]["menus"]["Update"];

export type MenuSection = Database["public"]["Tables"]["menu_sections"]["Row"];
export type MenuSectionInsert =
  Database["public"]["Tables"]["menu_sections"]["Insert"];
export type MenuSectionUpdate =
  Database["public"]["Tables"]["menu_sections"]["Update"];

export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type MenuItemInsert =
  Database["public"]["Tables"]["menu_items"]["Insert"];
export type MenuItemUpdate =
  Database["public"]["Tables"]["menu_items"]["Update"];

// Extended types for working with nested data
export interface MenuWithSections extends Menu {
  sections: MenuSectionWithItems[];
}

export interface MenuSectionWithItems extends MenuSection {
  items: MenuItem[];
}

// Types for form data used in the UI
export interface MenuFormData {
  name: string;
  restaurant_name: string;
  description?: string;
  sections: MenuSectionFormData[];
}

export interface MenuSectionFormData {
  id?: string;
  name: string;
  description?: string;
  items: MenuItemFormData[];
}

export interface MenuItemFormData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available?: boolean;
}

// Utility types
export interface MenuStats {
  totalMenus: number;
  publishedMenus: number;
  draftMenus: number;
  deletedMenus: number;
  totalItems: number;
}

export interface PublicMenuData {
  id: string;
  name: string;
  restaurant_name: string;
  description?: string;
  slug: string;
  sections: {
    id: string;
    name: string;
    description?: string;
    items: {
      id: string;
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      is_available: boolean;
    }[];
  }[];
}

// Soft delete utility types
export interface DeletedMenusResponse {
  menus: Menu[];
  total: number;
}
