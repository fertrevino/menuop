import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  buildTemplateMenu,
  getMenuTemplate,
} from "@/lib/templates/menuTemplates";
import { MenuFormData } from "@/lib/types/menu";

interface QuickStartPayload {
  templateId?: string; // optional; if missing use first template
  currency?: string;
  override?: Partial<
    Pick<MenuFormData, "name" | "restaurant_name" | "description" | "currency">
  >;
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

    const body: QuickStartPayload = await request.json().catch(() => ({}));
    const template =
      getMenuTemplate(body.templateId) || getMenuTemplate("coffee-shop-basic");
    if (!template) {
      return NextResponse.json(
        { error: "No template available" },
        { status: 400 }
      );
    }

    // Build base data from template
    const form = buildTemplateMenu(template.id, body.currency) as MenuFormData;

    // Apply any user overrides (only simple scalar fields)
    if (body.override) {
      if (body.override.name) form.name = body.override.name;
      if (body.override.restaurant_name)
        form.restaurant_name = body.override.restaurant_name;
      if (body.override.description)
        form.description = body.override.description;
      if (body.override.currency) form.currency = body.override.currency;
    }

    // Persist menu
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .insert({
        user_id: user.id,
        name: form.name,
        restaurant_name: form.restaurant_name,
        description: form.description || null,
        currency: form.currency || "USD",
        theme_config: form.theme_config || null,
        // Add a marker flag if schema supports it later (ignored if column missing)
      })
      .select()
      .single();

    if (menuError) {
      return NextResponse.json({ error: menuError.message }, { status: 500 });
    }

    // Insert sections and items
    for (let i = 0; i < form.sections.length; i++) {
      const sectionData = form.sections[i];
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
        return NextResponse.json(
          { error: sectionError.message },
          { status: 500 }
        );
      }
      if (sectionData.items.length) {
        const items = sectionData.items.map((item, j) => ({
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
          .insert(items);
        if (itemsError) {
          return NextResponse.json(
            { error: itemsError.message },
            { status: 500 }
          );
        }
      }
    }

    // Retrieve full nested menu
    const { data: completeMenu, error: fetchError } = await supabase
      .from("menus")
      .select(`*, sections:menu_sections(*, items:menu_items(*))`)
      .eq("id", menu.id)
      .single();
    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ menu: completeMenu, templateId: template.id });
  } catch (err) {
    console.error("Quick start creation failed", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
