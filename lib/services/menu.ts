import {
  Menu,
  MenuWithSections,
  MenuFormData,
  PublicMenuData,
  DeletedMenusResponse,
} from "../types/menu";
import { createClient as createSupabaseClient } from "../supabase/client";

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

  // Upload any data URL images in the payload to Supabase Storage and replace with public URLs
  private static async sanitizeMenuImages(
    menuData: MenuFormData
  ): Promise<MenuFormData> {
    // Quick check before doing any work
    const hasDataUrls = menuData.sections.some((section) =>
      section.items.some((item) => item.image_url?.startsWith("data:image/"))
    );
    if (!hasDataUrls) {
      return menuData;
    }

    const supabase = createSupabaseClient();
    const bucket = "menu-images";

    // Auth is handled upstream; no verbose logging here

    const dataUrlToBlob = (dataUrl: string): Blob => {
      const [header, base64] = dataUrl.split(",");
      const mimeMatch = /data:(.*?);base64/.exec(header || "");
      const mime = mimeMatch?.[1] || "image/jpeg";
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    };

    const uploadToStorage = async (blob: Blob, preferredExt?: string) => {
      const extFromType = blob.type.split("/")[1] || "jpg";
      const ext = (preferredExt || extFromType || "jpg").toLowerCase();
      const filePath = `items/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      // minimal path generation; no verbose logging

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, blob, {
          cacheControl: "3600",
          contentType: blob.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl as string;
    };

    // Deep clone and replace data URLs with uploaded URLs
    const cloned: MenuFormData = JSON.parse(JSON.stringify(menuData));
    for (const [sIdx, section] of cloned.sections.entries()) {
      for (const [iIdx, item] of section.items.entries()) {
        if (item.image_url && item.image_url.startsWith("data:image/")) {
          const blob = dataUrlToBlob(item.image_url);
          const publicUrl = await uploadToStorage(blob);
          item.image_url = publicUrl;
        }
      }
    }

    return cloned;
  }

  // Menu CRUD operations via API routes
  static async createMenu(menuData: MenuFormData): Promise<MenuWithSections> {
    const sanitized = await this.sanitizeMenuImages(menuData);
    const response = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });

    const result = await this.handleResponse<{ menu: MenuWithSections }>(
      response
    );
    return result.menu;
  }

  static async getUserMenus(): Promise<(Menu & { items_count?: number })[]> {
    const response = await fetch("/api/menus");
    const result = await this.handleResponse<{
      menus: (Menu & { items_count?: number })[];
    }>(response);
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
    const sanitized = await this.sanitizeMenuImages(menuData);
    const response = await fetch(`/api/menus/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
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

  static async getDeletedMenus(): Promise<DeletedMenusResponse> {
    const response = await fetch("/api/menus/deleted");
    const result = await this.handleResponse<DeletedMenusResponse>(response);
    return result;
  }

  static async permanentlyDeleteMenu(menuId: string): Promise<void> {
    const response = await fetch(`/api/menus/${menuId}?permanent=true`, {
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
