import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MenuFormData } from "@/lib/types/menu";

type ItemsCountRow = {
  menu_id: string;
  items: Array<{ id: string }> | null;
};

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: menus, error } = await supabase
      .from("menus")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_on", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compute items_count per menu with a single grouped query
    const { data: countsData, error: countsError } = await supabase
      .from("menu_sections")
      .select(`menu_id, items:menu_items(id)`);

    if (countsError) {
      return NextResponse.json({ error: countsError.message }, { status: 500 });
    }

    // Build a map of menu_id -> items count
    const countsMap = new Map<string, number>();
    if (countsData) {
      // countsData is an array where each row has menu_id and nested items
      for (const row of countsData as ItemsCountRow[]) {
        const menuId = row.menu_id as string;
        const itemsCount = Array.isArray(row.items) ? row.items.length : 0;
        countsMap.set(menuId, (countsMap.get(menuId) || 0) + itemsCount);
      }
    }

    const menusWithCounts = menus.map((m) => ({
      ...m,
      items_count: countsMap.get(m.id) || 0,
    }));

    return NextResponse.json({ menus: menusWithCounts });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const menuData: MenuFormData = await request.json();

    // Validate required fields
    if (!menuData.name?.trim() || !menuData.restaurant_name?.trim()) {
      return NextResponse.json(
        { error: "Menu name and restaurant name are required" },
        { status: 400 }
      );
    }

    // Create menu
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        name: menuData.name,
        restaurant_name: menuData.restaurant_name,
        description: menuData.description,
        currency: menuData.currency || "USD",
        theme_config: menuData.theme_config || null,
      })
      .select()
      .single();

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    // Create sections and items
    for (let i = 0; i < menuData.sections.length; i++) {
      const sectionData = menuData.sections[i];
      const { data: section, error: sectionError } = await supabase
        .from("menu_sections")
        .insert({
          menu_id: menu.id,
          name: sectionData.name,
          description: sectionData.description,
          sort_order: i,
        })
        .select()
        .single();

      if (sectionError) {
        return NextResponse.json(
          { error: sectionError.message },
          { status: 500 }
        );
      }

      // Create items for this section
      if (sectionData.items.length > 0) {
        const itemsToInsert = sectionData.items.map((item, j) => ({
          section_id: section.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.image_url,
          is_available: item.is_available ?? true,
          sort_order: j,
        }));

        const { error: itemsError } = await supabase
          .from("menu_items")
          .insert(itemsToInsert);

        if (itemsError) {
          return NextResponse.json(
            { error: itemsError.message },
            { status: 500 }
          );
        }
      }
    }

    // Fetch the complete menu with sections and items
    const { data: completeMenu, error: fetchError } = await supabase
      .from("menus")
      .select(
        `
        *,
        sections:menu_sections(
          *,
          items:menu_items(*)
        )
      `
      )
      .eq("id", menu.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ menu: completeMenu });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
