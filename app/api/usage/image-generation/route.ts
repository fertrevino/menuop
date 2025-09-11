import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_IMAGE_DAILY_LIMIT } from "@/lib/config/limits";

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch today's usage row
    const { data, error } = await supabase
      .from("image_generation_usage")
      .select("count, usage_date")
      .eq("user_id", user.id)
      .eq("usage_date", new Date().toISOString().slice(0, 10))
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const count = data?.count ?? 0;
    const remaining = Math.max(0, FREE_IMAGE_DAILY_LIMIT - count);
    const resetTs = new Date();
    resetTs.setUTCHours(24, 0, 0, 0);

    return NextResponse.json({
      success: true,
      count,
      limit: FREE_IMAGE_DAILY_LIMIT,
      remaining,
      reset: resetTs.toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
