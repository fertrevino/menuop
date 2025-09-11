-- Image generation usage tracking (daily quota for free users)
-- Creates table + RLS + helper function for atomic-ish increment respecting limit

BEGIN;

CREATE TABLE IF NOT EXISTS public.image_generation_usage (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'utc'),
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT image_generation_usage_pkey PRIMARY KEY (user_id, usage_date)
);

COMMENT ON TABLE public.image_generation_usage IS 'Daily image generation counts per user';
COMMENT ON COLUMN public.image_generation_usage.count IS 'Number of image generations performed this day (UTC)';

-- Reuse/update timestamp trigger function if present
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_image_generation_usage_updated_at ON public.image_generation_usage;
CREATE TRIGGER trg_image_generation_usage_updated_at
  BEFORE UPDATE ON public.image_generation_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.image_generation_usage ENABLE ROW LEVEL SECURITY;

-- Policies: user can manage only their own rows (drop first for idempotency)
DROP POLICY IF EXISTS "Allow user select own image usage" ON public.image_generation_usage;
DROP POLICY IF EXISTS "Allow user insert own image usage" ON public.image_generation_usage;
DROP POLICY IF EXISTS "Allow user update own image usage" ON public.image_generation_usage;

CREATE POLICY "Allow user select own image usage" ON public.image_generation_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow user insert own image usage" ON public.image_generation_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user update own image usage" ON public.image_generation_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Helper function: increment only if below limit; otherwise return current count unchanged
CREATE OR REPLACE FUNCTION public.increment_image_gen_usage(p_user_id UUID, p_limit INT)
RETURNS TABLE(new_count INT, within_limit BOOLEAN) AS $$
DECLARE
  v_date DATE := (CURRENT_DATE AT TIME ZONE 'utc');
  v_row image_generation_usage%ROWTYPE;
BEGIN
  -- Upsert row, but only increment if current count < p_limit
  INSERT INTO image_generation_usage (user_id, usage_date, count)
  VALUES (p_user_id, v_date, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET count = CASE
      WHEN image_generation_usage.count < p_limit THEN image_generation_usage.count + 1
      ELSE image_generation_usage.count
    END,
    updated_at = NOW()
  RETURNING * INTO v_row;

  new_count := v_row.count;
  within_limit := (v_row.count <= p_limit);
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.increment_image_gen_usage IS 'Increments daily image generation count if below limit, returns new_count and whether still within limit.';

COMMIT;
