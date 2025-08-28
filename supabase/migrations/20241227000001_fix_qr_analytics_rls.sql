-- Fix QR code analytics RLS policy to allow public insertions for tracking

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can insert QR code analytics" ON public.qr_code_analytics;

-- Drop the policy if it exists, then recreate it
DROP POLICY IF EXISTS "Allow public QR scan tracking" ON public.qr_code_analytics;

-- Create a more permissive policy for insertions from public tracking
CREATE POLICY "Allow public QR scan tracking" ON public.qr_code_analytics
    FOR INSERT WITH CHECK (true);

-- Keep the existing SELECT policy for owners only
-- (This should already exist from the original migration)

-- Also ensure the QR codes table allows public access for the analytics policy check
-- Drop and recreate to avoid conflicts
DROP POLICY IF EXISTS "Public can view active QR codes for analytics" ON public.qr_codes;

-- Add a policy to allow public access to active QR codes for analytics verification
CREATE POLICY "Public can view active QR codes for analytics" ON public.qr_codes
    FOR SELECT USING (is_active = true);

-- PREVENT DUPLICATE QR CODES
-- First, clean up any existing duplicates before creating the unique constraint

-- Step 1: Identify and deactivate duplicate QR codes (keep only the most recent one per menu)
WITH ranked_qr_codes AS (
    SELECT id, menu_id,
           ROW_NUMBER() OVER (PARTITION BY menu_id ORDER BY created_at DESC) as rn
    FROM public.qr_codes 
    WHERE is_active = true
)
UPDATE public.qr_codes 
SET is_active = false 
WHERE id IN (
    SELECT id FROM ranked_qr_codes WHERE rn > 1
);

-- Step 2: Drop the index if it exists, then recreate it (handles case where it already exists)
DROP INDEX IF EXISTS idx_qr_codes_menu_active;

-- Step 3: Now create the unique constraint to prevent multiple active QR codes per menu
CREATE UNIQUE INDEX idx_qr_codes_menu_active 
    ON public.qr_codes (menu_id) 
    WHERE is_active = true;

-- Improve the auto-generation trigger to handle race conditions better
CREATE OR REPLACE FUNCTION generate_qr_code_on_publish()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate QR code if menu is being published and doesn't have one already
    IF NEW.is_published = true AND OLD.is_published = false THEN
        -- Use INSERT ... ON CONFLICT to handle race conditions
        INSERT INTO public.qr_codes (menu_id, qr_data, url, is_active)
        VALUES (
            NEW.id, 
            '', -- Will be populated by the application
            CONCAT(COALESCE(current_setting('app.base_url', true), 'http://localhost:3000'), '/menu/', NEW.slug),
            true
        )
        ON CONFLICT (menu_id) WHERE is_active = true
        DO NOTHING; -- If a QR code already exists, do nothing
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
