import { NextRequest, NextResponse } from "next/server";
import { QRCodeService } from "@/lib/services/qrCode";
import { createClient } from "@/lib/supabase/client";

const qrCodeService = new QRCodeService();

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuId } = await context.params;

    // Get user agent and other tracking info from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    const referrer = request.headers.get("referer") || undefined;

    // Get IP address (in production you might use a service like CF-Connecting-IP)
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Generate a simple session ID based on user agent + timestamp
    const sessionId = Buffer.from(`${userAgent}-${Date.now()}-${Math.random()}`)
      .toString("base64")
      .substring(0, 32);

    // Get the QR code for this menu
    const supabase = createClient();
    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("menu_id", menuId)
      .eq("is_active", true)
      .single();

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Track the scan
    const success = await qrCodeService.trackScan(qrCode.id, menuId, {
      userAgent,
      ipAddress,
      referrer,
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
