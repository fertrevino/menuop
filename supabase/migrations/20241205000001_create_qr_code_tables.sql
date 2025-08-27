-- Create the qr_codes table for storing QR code information
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    qr_data TEXT NOT NULL, -- Base64 encoded QR code image
    url TEXT NOT NULL, -- The URL that the QR code points to
    design_config JSONB DEFAULT '{}', -- Customization settings (colors, logo, etc.)
    format VARCHAR(10) DEFAULT 'png', -- png, svg, jpg
    size INTEGER DEFAULT 256, -- QR code size in pixels
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the qr_code_analytics table for tracking QR code scans
CREATE TABLE IF NOT EXISTS public.qr_code_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address TEXT,
    referrer TEXT,
    location JSONB, -- Store geo-location data if available
    device_info JSONB DEFAULT '{}', -- Device type, browser, etc.
    session_id TEXT -- To track unique sessions
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_menu_id ON public.qr_codes(menu_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_active ON public.qr_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_qr_code_id ON public.qr_code_analytics(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_menu_id ON public.qr_code_analytics(menu_id);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_scan_timestamp ON public.qr_code_analytics(scan_timestamp);
CREATE INDEX IF NOT EXISTS idx_qr_analytics_session_id ON public.qr_code_analytics(session_id);

-- Create function to automatically update updated_at timestamp for qr_codes
CREATE TRIGGER update_qr_codes_updated_at 
    BEFORE UPDATE ON public.qr_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_code_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for qr_codes table
CREATE POLICY "Users can view QR codes of their own menus" ON public.qr_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_codes.menu_id 
            AND menus.user_id = auth.uid()
            AND menus.deleted_on IS NULL
        )
    );

CREATE POLICY "Users can insert QR codes to their own menus" ON public.qr_codes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_codes.menu_id 
            AND menus.user_id = auth.uid()
            AND menus.deleted_on IS NULL
        )
    );

CREATE POLICY "Users can update QR codes of their own menus" ON public.qr_codes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_codes.menu_id 
            AND menus.user_id = auth.uid()
            AND menus.deleted_on IS NULL
        )
    );

CREATE POLICY "Users can delete QR codes of their own menus" ON public.qr_codes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_codes.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

-- Allow public access to QR codes of published menus
CREATE POLICY "Anyone can view QR codes of published menus" ON public.qr_codes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_codes.menu_id 
            AND menus.is_published = true
            AND menus.deleted_on IS NULL
        )
    );

-- Create policies for qr_code_analytics table
CREATE POLICY "Users can view analytics of their own menu QR codes" ON public.qr_code_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = qr_code_analytics.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

-- Allow analytics insertion for any QR code (for tracking scans)
CREATE POLICY "Anyone can insert QR code analytics" ON public.qr_code_analytics
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.qr_codes 
            WHERE qr_codes.id = qr_code_analytics.qr_code_id
            AND qr_codes.is_active = true
        )
    );

-- Function to automatically generate QR code when menu is published
CREATE OR REPLACE FUNCTION generate_qr_code_on_publish()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate QR code if menu is being published and doesn't have one already
    IF NEW.is_published = true AND OLD.is_published = false THEN
        -- Check if QR code already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.qr_codes 
            WHERE menu_id = NEW.id AND is_active = true
        ) THEN
            -- Insert a placeholder QR code entry that will be populated by the application
            INSERT INTO public.qr_codes (menu_id, qr_data, url, is_active)
            VALUES (
                NEW.id, 
                '', -- Will be populated by the application
                CONCAT(current_setting('app.base_url', true), '/menu/', NEW.slug),
                true
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate QR code when menu is published
CREATE TRIGGER trigger_generate_qr_code_on_publish
    AFTER UPDATE ON public.menus
    FOR EACH ROW EXECUTE FUNCTION generate_qr_code_on_publish();

-- Function to get QR code analytics summary
CREATE OR REPLACE FUNCTION get_qr_analytics_summary(p_menu_id UUID)
RETURNS TABLE (
    total_scans BIGINT,
    unique_sessions BIGINT,
    scans_today BIGINT,
    scans_this_week BIGINT,
    scans_this_month BIGINT,
    top_devices JSONB,
    hourly_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Total scans
        (SELECT COUNT(*) FROM public.qr_code_analytics WHERE menu_id = p_menu_id)::BIGINT,
        
        -- Unique sessions
        (SELECT COUNT(DISTINCT session_id) FROM public.qr_code_analytics WHERE menu_id = p_menu_id)::BIGINT,
        
        -- Scans today
        (SELECT COUNT(*) FROM public.qr_code_analytics 
         WHERE menu_id = p_menu_id AND scan_timestamp >= CURRENT_DATE)::BIGINT,
        
        -- Scans this week
        (SELECT COUNT(*) FROM public.qr_code_analytics 
         WHERE menu_id = p_menu_id AND scan_timestamp >= DATE_TRUNC('week', CURRENT_DATE))::BIGINT,
        
        -- Scans this month
        (SELECT COUNT(*) FROM public.qr_code_analytics 
         WHERE menu_id = p_menu_id AND scan_timestamp >= DATE_TRUNC('month', CURRENT_DATE))::BIGINT,
        
        -- Top devices (simplified)
        (SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'device', COALESCE(device_info->>'device_type', 'Unknown'),
                'count', device_count
            ) ORDER BY device_count DESC
        ), '[]'::jsonb)
        FROM (
            SELECT 
                COALESCE(device_info->>'device_type', 'Unknown') as device_type,
                COUNT(*) as device_count
            FROM public.qr_code_analytics 
            WHERE menu_id = p_menu_id
            GROUP BY device_info->>'device_type'
            LIMIT 5
        ) device_stats),
        
        -- Hourly distribution
        (SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
                'hour', hour_of_day,
                'count', scan_count
            ) ORDER BY hour_of_day
        ), '[]'::jsonb)
        FROM (
            SELECT 
                EXTRACT(HOUR FROM scan_timestamp) as hour_of_day,
                COUNT(*) as scan_count
            FROM public.qr_code_analytics 
            WHERE menu_id = p_menu_id
            GROUP BY EXTRACT(HOUR FROM scan_timestamp)
        ) hourly_stats);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
