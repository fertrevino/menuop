import { createClient } from "@/lib/supabase/server";

export interface ImageUsageResult {
  newCount: number;
  withinLimit: boolean;
}

/**
 * Increment image generation usage for a user (only if below limit).
 * Returns the new count and whether the user is still within the limit.
 */
export async function incrementImageGenerationUsage(
  userId: string,
  limit: number
): Promise<ImageUsageResult> {
  const supabase = await createClient();
  const start = Date.now();
  console.log(
    `[usage] Calling increment_image_gen_usage user=${userId} limit=${limit}`
  );
  const { data, error } = await supabase.rpc("increment_image_gen_usage", {
    p_user_id: userId,
    p_limit: limit,
  });
  const duration = Date.now() - start;

  if (error) {
    console.error(
      `[usage] RPC error user=${userId} limit=${limit} durationMs=${duration}`,
      error
    );
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  console.log(
    `[usage] RPC raw result user=${userId} limit=${limit} durationMs=${duration} raw=`,
    row
  );

  let result: ImageUsageResult;
  if (!row) {
    // Fallback: fetch current stored count (function may not yet be migrated)
    console.warn(
      `[usage] RPC returned no row; performing fallback select user=${userId}`
    );
    const fallback = await supabase
      .from("image_generation_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("usage_date", new Date().toISOString().slice(0, 10))
      .maybeSingle();
    const current = fallback.data?.count ?? 0;
    result = {
      newCount: current,
      withinLimit: current < limit,
    };
  } else {
    result = {
      newCount: row.new_count ?? 0,
      withinLimit: row.within_limit ?? false,
    };
  }

  console.log(
    `[usage] Parsed result user=${userId} count=${result.newCount} withinLimit=${result.withinLimit}`
  );
  return result;
}
