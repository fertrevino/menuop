import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties
    const { id } = await params;
    
    const supabase = await createClient();

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
          sort_order,
          items:menu_items(
            id,
            name,
            description,
            price,
            image_url,
            is_available,
            sort_order
          )
        )
      `
      )
      .eq("id", id)
      .eq("is_published", true)
      .is("deleted_on", null)
      .single();

    if (error || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Sort sections and items by their sort_order
    menu.sections = menu.sections
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((section) => ({
        ...section,
        items: section.items.sort((a, b) => a.sort_order - b.sort_order),
      }));

    return NextResponse.json({ menu });
  } catch (error) {
    console.error("Error fetching public menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
