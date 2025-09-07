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
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    // Get analytics summary
    const analytics = await qrCodeService.getAnalyticsSummary(menuId);

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("Error fetching QR code analytics:", error);
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
    const { id: menuId } = await context.params;
    const body = await request.json();

    const { qrCodeId, userAgent, ipAddress, referrer, location, sessionId } =
      body;

    if (!qrCodeId) {
      return NextResponse.json(
        { error: "QR code ID is required" },
        { status: 400 }
      );
    }

    // Track the scan
    const success = await qrCodeService.trackScan(qrCodeId, menuId, {
      userAgent,
      ipAddress,
      referrer,
      location,
      sessionId,
    });

    if (!success) {
      return NextResponse.json(
        { error: "Failed to track scan" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error tracking QR code scan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
