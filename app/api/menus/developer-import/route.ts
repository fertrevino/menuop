import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DevMenuData {
  name: string;
  restaurant_name: string;
  description?: string;
  currency?: string;
  sections: {
    name: string;
    description?: string;
    items: {
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      is_available?: boolean;
    }[];
  }[];
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

    const menuData: DevMenuData = await request.json();

    // Validate required fields
    if (!menuData.name?.trim()) {
      return NextResponse.json(
        { error: "Menu name is required" },
        { status: 400 }
      );
    }

    if (!menuData.restaurant_name?.trim()) {
      return NextResponse.json(
        { error: "Restaurant name is required" },
        { status: 400 }
      );
    }

    if (
      !menuData.sections ||
      !Array.isArray(menuData.sections) ||
      menuData.sections.length === 0
    ) {
      return NextResponse.json(
        { error: "At least one section is required" },
        { status: 400 }
      );
    }

    // Validate sections
    for (let i = 0; i < menuData.sections.length; i++) {
      const section = menuData.sections[i];
      if (!section.name?.trim()) {
        return NextResponse.json(
          { error: `Section ${i + 1}: name is required` },
          { status: 400 }
        );
      }

      if (!section.items || !Array.isArray(section.items)) {
        return NextResponse.json(
          { error: `Section "${section.name}": items array is required` },
          { status: 400 }
        );
      }

      // Validate items
      for (let j = 0; j < section.items.length; j++) {
        const item = section.items[j];
        if (!item.name?.trim()) {
          return NextResponse.json(
            {
              error: `Section "${section.name}", Item ${
                j + 1
              }: name is required`,
            },
            { status: 400 }
          );
        }

        if (typeof item.price !== "number" || item.price < 0) {
          return NextResponse.json(
            {
              error: `Section "${section.name}", Item "${item.name}": price must be a positive number`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Create menu
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        name: menuData.name,
        restaurant_name: menuData.restaurant_name,
        description: menuData.description || null,
        currency: menuData.currency || "USD",
      })
      .select()
      .single();

    if (menuError) {
      console.error("Error creating menu:", menuError);
      return NextResponse.json(
        { error: "Failed to create menu" },
        { status: 500 }
      );
    }

    // Create sections and items
    for (let i = 0; i < menuData.sections.length; i++) {
      const sectionData = menuData.sections[i];

      const { data: section, error: sectionError } = await supabase
        .from("menu_sections")
        .insert({
          menu_id: menu.id,
          name: sectionData.name,
          description: sectionData.description || null,
          sort_order: i,
        })
        .select()
        .single();

      if (sectionError) {
        console.error("Error creating section:", sectionError);
        return NextResponse.json(
          { error: `Failed to create section "${sectionData.name}"` },
          { status: 500 }
        );
      }

      // Create items for this section
      if (sectionData.items.length > 0) {
        const itemsToInsert = sectionData.items.map((item, j) => ({
          section_id: section.id,
          name: item.name,
          description: item.description || null,
          price: item.price,
          image_url: item.image_url || null,
          is_available: item.is_available ?? true,
          sort_order: j,
        }));

        const { error: itemsError } = await supabase
          .from("menu_items")
          .insert(itemsToInsert);

        if (itemsError) {
          console.error("Error creating items:", itemsError);
          return NextResponse.json(
            {
              error: `Failed to create items for section "${sectionData.name}"`,
            },
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
      console.error("Error fetching complete menu:", fetchError);
      return NextResponse.json(
        { error: "Menu created but failed to fetch complete data" },
        { status: 500 }
      );
    }

    // Sort sections and items by their sort_order
    completeMenu.sections = completeMenu.sections
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((section: any) => ({
        ...section,
        items: section.items.sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ),
      }));

    return NextResponse.json({
      menu: completeMenu,
      message: "Menu imported successfully",
    });
  } catch (error) {
    console.error("Error in developer import:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
