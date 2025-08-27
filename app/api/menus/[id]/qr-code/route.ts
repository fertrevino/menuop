import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { QRCodeService } from "@/lib/services/qrCode";

const qrCodeService = new QRCodeService();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: menuId } = await context.params;

    // Check if user is authenticated and owns the menu
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify menu ownership
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id, user_id")
      .eq("id", menuId)
      .eq("user_id", user.id)
      .eq("deleted_on", null)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get QR code
    const qrCode = await qrCodeService.getQRCodeByMenuId(menuId);

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: menuId } = await context.params;

    // Check if user is authenticated and owns the menu
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify menu ownership and that it's published
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id, user_id, is_published, slug")
      .eq("id", menuId)
      .eq("user_id", user.id)
      .eq("deleted_on", null)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    if (!menu.is_published) {
      return NextResponse.json(
        { error: "Menu must be published to generate QR code" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { designConfig = {}, format = "png", size = 256 } = body;

    // Create QR code options
    const qrOptions = {
      foregroundColor: designConfig.foregroundColor || "#000000",
      backgroundColor: designConfig.backgroundColor || "#FFFFFF",
      margin: designConfig.margin || 2,
      errorCorrection: designConfig.errorCorrection || "M",
      format: format,
      size: size,
    };

    // Generate QR code
    const qrCode = await qrCodeService.generateQRCode(menuId, qrOptions);

    if (!qrCode) {
      return NextResponse.json(
        { error: "Failed to generate QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ qrCode }, { status: 201 });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: menuId } = await context.params;

    // Check if user is authenticated and owns the menu
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify menu ownership
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id, user_id")
      .eq("id", menuId)
      .eq("user_id", user.id)
      .eq("deleted_on", null)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { designConfig, format, size } = body;

    // Create QR code options
    const qrOptions = {
      foregroundColor: designConfig?.foregroundColor || "#000000",
      backgroundColor: designConfig?.backgroundColor || "#FFFFFF",
      margin: designConfig?.margin || 2,
      errorCorrection: designConfig?.errorCorrection || "M",
      format: format || "png",
      size: size || 256,
    };

    // Update QR code design
    const updatedQRCode = await qrCodeService.updateQRCodeDesign(
      menuId,
      qrOptions
    );

    if (!updatedQRCode) {
      return NextResponse.json(
        { error: "Failed to update QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ qrCode: updatedQRCode });
  } catch (error) {
    console.error("Error updating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: menuId } = await context.params;

    // Check if user is authenticated and owns the menu
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify menu ownership
    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id, user_id")
      .eq("id", menuId)
      .eq("user_id", user.id)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Delete QR code
    const success = await qrCodeService.deleteQRCode(menuId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete QR code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
