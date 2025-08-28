import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuIdentifier } = await context.params;

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

    const supabase = await createClient();

    // First, get the menu ID from either ID or slug
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        menuIdentifier
      );

    const { data: menu, error: menuError } = await supabase
      .from("menus")
      .select("id")
      .eq(isUUID ? "id" : "slug", menuIdentifier)
      .eq("is_published", true)
      .is("deleted_on", null)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    const menuId = menu.id;

    // Get the QR code for this menu - get the most recent one if multiple exist
    const { data: qrCode, error: qrError } = await supabase
      .from("qr_codes")
      .select("id")
      .eq("menu_id", menuId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (qrError || !qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Track the scan using server client for analytics insertion to bypass RLS
    const { error: insertError } = await supabase
      .from("qr_code_analytics")
      .insert({
        qr_code_id: qrCode.id,
        menu_id: menuId,
        user_agent: userAgent,
        ip_address: ipAddress,
        referrer: referrer,
        location: undefined,
        device_info: {
          device_type: /Mobile|Android|iPhone|iPad/.test(userAgent || "")
            ? /iPad/.test(userAgent || "")
              ? "Tablet"
              : "Mobile"
            : "Desktop",
          browser:
            /Chrome/.test(userAgent || "") && !/Edge/.test(userAgent || "")
              ? "Chrome"
              : /Safari/.test(userAgent || "") &&
                !/Chrome/.test(userAgent || "")
              ? "Safari"
              : /Firefox/.test(userAgent || "")
              ? "Firefox"
              : "Unknown",
          os: /Windows/.test(userAgent || "")
            ? "Windows"
            : /Mac/.test(userAgent || "")
            ? "macOS"
            : /Linux/.test(userAgent || "")
            ? "Linux"
            : /Android/.test(userAgent || "")
            ? "Android"
            : /iOS|iPhone|iPad/.test(userAgent || "")
            ? "iOS"
            : "Unknown",
        },
        session_id: sessionId,
      });

    if (insertError) {
      console.error("Error tracking QR code scan:", insertError);
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
