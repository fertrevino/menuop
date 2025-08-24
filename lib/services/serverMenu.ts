import { createClient as createServerClient } from "../supabase/server";
import { PublicMenuData } from "../types/menu";

// Server-side functions (for use in API routes and server components)
export class ServerMenuService {
  static async createServerClient() {
    return await createServerClient();
  }

  static async getPublicMenuBySlug(
    slug: string
  ): Promise<PublicMenuData | null> {
    const supabase = await this.createServerClient();

    const { data: menu, error } = await supabase
      .from("menus")
      .select(
        `
        id,
        name,
        restaurant_name,
        description,
        slug,
        sections:menu_sections(
          id,
          name,
          description,
          items:menu_items(
            id,
            name,
            description,
            price,
            image_url,
            is_available
          )
        )
      `
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .is("deleted_on", null)
      .single();

    if (error) {
      console.error("Error fetching public menu:", error);
      return null;
    }

    return menu as PublicMenuData;
  }

  static async getPublicMenuById(
    menuId: string
  ): Promise<PublicMenuData | null> {
    const supabase = await this.createServerClient();

    const { data: menu, error } = await supabase
      .from("menus")
      .select(
        `
        id,
        name,
        restaurant_name,
        description,
        slug,
        sections:menu_sections(
          id,
          name,
          description,
          items:menu_items(
            id,
            name,
            description,
            price,
            image_url,
            is_available
          )
        )
      `
      )
      .eq("id", menuId)
      .eq("is_published", true)
      .is("deleted_on", null)
      .single();

    if (error) {
      console.error("Error fetching public menu:", error);
      return null;
    }

    return menu as PublicMenuData;
  }
}
