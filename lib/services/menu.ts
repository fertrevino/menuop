import {
  Menu,
  MenuWithSections,
  MenuFormData,
  PublicMenuData,
} from "../types/menu";

// Client-side API service (makes HTTP requests to our API routes)
export class MenuService {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Menu CRUD operations via API routes
  static async createMenu(menuData: MenuFormData): Promise<MenuWithSections> {
    const response = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuData),
    });

    const result = await this.handleResponse<{ menu: MenuWithSections }>(
      response
    );
    return result.menu;
  }

  static async getUserMenus(): Promise<Menu[]> {
    const response = await fetch("/api/menus");
    const result = await this.handleResponse<{ menus: Menu[] }>(response);
    return result.menus;
  }

  static async getMenuById(menuId: string): Promise<MenuWithSections> {
    const response = await fetch(`/api/menus/${menuId}`);
    const result = await this.handleResponse<{ menu: MenuWithSections }>(
      response
    );
    return result.menu;
  }

  static async updateMenu(
    menuId: string,
    menuData: MenuFormData
  ): Promise<MenuWithSections> {
    const response = await fetch(`/api/menus/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuData),
    });

    const result = await this.handleResponse<{ menu: MenuWithSections }>(
      response
    );
    return result.menu;
  }

  static async deleteMenu(menuId: string): Promise<void> {
    const response = await fetch(`/api/menus/${menuId}`, {
      method: "DELETE",
    });

    await this.handleResponse<{ success: boolean }>(response);
  }

  static async publishMenu(menuId: string): Promise<Menu> {
    const response = await fetch(`/api/menus/${menuId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: true }),
    });

    const result = await this.handleResponse<{ menu: Menu }>(response);
    return result.menu;
  }

  static async unpublishMenu(menuId: string): Promise<Menu> {
    const response = await fetch(`/api/menus/${menuId}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: false }),
    });

    const result = await this.handleResponse<{ menu: Menu }>(response);
    return result.menu;
  }

  // Convenience method for saving (create or update)
  static async saveCompleteMenu(
    menuData: MenuFormData,
    menuId?: string
  ): Promise<MenuWithSections> {
    if (menuId) {
      return this.updateMenu(menuId, menuData);
    } else {
      return this.createMenu(menuData);
    }
  }

  // Public menu access (no authentication required)
  static async getPublicMenuById(menuId: string): Promise<PublicMenuData> {
    const response = await fetch(`/api/public/menus/${menuId}`);
    const result = await this.handleResponse<{ menu: PublicMenuData }>(
      response
    );
    return result.menu;
  }
}
