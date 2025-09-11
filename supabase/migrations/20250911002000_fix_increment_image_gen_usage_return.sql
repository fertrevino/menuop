-- Fix RETURN semantics for increment_image_gen_usage so rows are actually returned
-- Previous version used early RETURN without RETURN NEXT / RETURN QUERY causing undefined result client-side

BEGIN;

CREATE OR REPLACE FUNCTION public.increment_image_gen_usage(p_user_id UUID, p_limit INT)
RETURNS TABLE(new_count INT, within_limit BOOLEAN) AS $$
DECLARE
  v_date DATE := (CURRENT_DATE AT TIME ZONE 'utc');
  v_existing INT;
BEGIN
  -- Lock row if exists
  SELECT count INTO v_existing
  FROM image_generation_usage
  WHERE user_id = p_user_id AND usage_date = v_date
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO image_generation_usage(user_id, usage_date, count)
    VALUES (p_user_id, v_date, 1);
    new_count := 1;
    within_limit := true;
  ELSIF v_existing >= p_limit THEN
    new_count := v_existing; -- do not increment further
    within_limit := false;
  ELSE
    UPDATE image_generation_usage
      SET count = v_existing + 1, updated_at = NOW()
      WHERE user_id = p_user_id AND usage_date = v_date
      RETURNING count INTO new_count;
    within_limit := true;
  END IF;

  RETURN NEXT; -- emit the single row
  RETURN;      -- finish
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION public.increment_image_gen_usage IS 'Atomically increments daily image generation usage (if below limit) and returns (new_count, within_limit).';

COMMIT;
