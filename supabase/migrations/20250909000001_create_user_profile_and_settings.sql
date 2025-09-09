-- User profile and settings tables
-- Creates user_profiles and user_settings with RLS policies

BEGIN;

-- user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    business_name TEXT,
    business_type TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications JSONB NOT NULL DEFAULT '{"email_updates":true,"menu_analytics":false,"new_features":true,"marketing_emails":false}',
    menu_preferences JSONB NOT NULL DEFAULT '{"default_currency":"USD","time_format":"12h"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS 'Extended profile information for each user';
COMMENT ON TABLE public.user_settings IS 'Per-user application settings (notifications, menu preferences, etc.)';
COMMENT ON COLUMN public.user_settings.notifications IS 'Notification preference toggles';
COMMENT ON COLUMN public.user_settings.menu_preferences IS 'Menu-related preferences like default currency, time format';

-- update timestamp trigger function (reuse if already present)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Allow user to select own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow user to insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Allow user to select own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow user to insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

COMMIT;
