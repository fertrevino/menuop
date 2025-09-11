import { createClient } from "@/lib/supabase/client";
import { TablesInsert } from "@/lib/database.types";

export type UserProfile = {
  full_name?: string | null;
  phone?: string | null;
  business_name?: string | null;
  business_type?: string | null;
  website?: string | null;
};

export type NotificationSettings = {
  email_updates: boolean;
  menu_analytics: boolean;
  new_features: boolean;
  marketing_emails: boolean;
};

export type MenuPreferences = {
  default_currency: string;
  time_format: "12h" | "24h";
};

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("full_name, phone, business_name, business_type, website")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data || null;
}

export async function upsertUserProfile(userId: string, profile: UserProfile) {
  const supabase = createClient();
  const payload: TablesInsert<"user_profiles"> = {
    user_id: userId,
    full_name: profile.full_name ?? null,
    phone: profile.phone ?? null,
    business_name: profile.business_name ?? null,
    business_type: profile.business_type ?? null,
    website: profile.website ?? null,
  };
  const { error } = await supabase.from("user_profiles").upsert(payload, {
    onConflict: "user_id",
  });
  if (error) throw error;
}

export async function getUserSettings(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("notifications, menu_preferences")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function upsertNotifications(
  userId: string,
  notifications: NotificationSettings
) {
  const supabase = createClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      notifications,
    } as TablesInsert<"user_settings">,
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export async function upsertMenuPreferences(
  userId: string,
  menuPreferences: MenuPreferences
) {
  const supabase = createClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      menu_preferences: menuPreferences,
    } as TablesInsert<"user_settings">,
    { onConflict: "user_id" }
  );
  if (error) throw error;
}

export async function getAllSettings(userId: string) {
  const profile = await getUserProfile(userId);
  const settings = await getUserSettings(userId);
  return { profile, settings };
}
