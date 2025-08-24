import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MenuFormData } from "@/lib/types/menu";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: menu, error } = await supabase
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
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user owns this menu
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json({ menu });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Update menu
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .update({
        name: menuData.name,
        restaurant_name: menuData.restaurant_name,
        description: menuData.description,
      })
      .eq("id", params.id)
      .eq("user_id", user.id) // Ensure user owns this menu
      .select()
      .single();

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Delete existing sections (cascade will handle items)
    const { error: deleteError } = await supabase
      .from("menu_sections")
      .delete()
      .eq("menu_id", params.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Create new sections and items
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

    // Fetch the complete updated menu
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
      .eq("id", params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ menu: completeMenu });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("menus")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id); // Ensure user owns this menu

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
