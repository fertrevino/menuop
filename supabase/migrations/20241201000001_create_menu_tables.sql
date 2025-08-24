-- Create the menus table
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    restaurant_name TEXT NOT NULL,
    description TEXT,
    is_published BOOLEAN DEFAULT false,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the menu_sections table
CREATE TABLE IF NOT EXISTS public.menu_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON public.menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON public.menus(slug);
CREATE INDEX IF NOT EXISTS idx_menus_published ON public.menus(is_published);
CREATE INDEX IF NOT EXISTS idx_menu_sections_menu_id ON public.menu_sections(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_sections_sort_order ON public.menu_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_section_id ON public.menu_items(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON public.menu_items(sort_order);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_menus_updated_at 
    BEFORE UPDATE ON public.menus 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_sections_updated_at 
    BEFORE UPDATE ON public.menu_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON public.menu_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for menus table
CREATE POLICY "Users can view their own menus" ON public.menus
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menus" ON public.menus
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus" ON public.menus
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus" ON public.menus
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public access to published menus
CREATE POLICY "Anyone can view published menus" ON public.menus
    FOR SELECT USING (is_published = true);

-- Create policies for menu_sections table
CREATE POLICY "Users can view sections of their own menus" ON public.menu_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_sections.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sections to their own menus" ON public.menu_sections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_sections.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sections of their own menus" ON public.menu_sections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_sections.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sections of their own menus" ON public.menu_sections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_sections.menu_id 
            AND menus.user_id = auth.uid()
        )
    );

-- Allow public access to sections of published menus
CREATE POLICY "Anyone can view sections of published menus" ON public.menu_sections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menus 
            WHERE menus.id = menu_sections.menu_id 
            AND menus.is_published = true
        )
    );

-- Create policies for menu_items table
CREATE POLICY "Users can view items of their own menus" ON public.menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menu_sections 
            JOIN public.menus ON menus.id = menu_sections.menu_id
            WHERE menu_sections.id = menu_items.section_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items to their own menus" ON public.menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.menu_sections 
            JOIN public.menus ON menus.id = menu_sections.menu_id
            WHERE menu_sections.id = menu_items.section_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update items of their own menus" ON public.menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.menu_sections 
            JOIN public.menus ON menus.id = menu_sections.menu_id
            WHERE menu_sections.id = menu_items.section_id 
            AND menus.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items of their own menus" ON public.menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.menu_sections 
            JOIN public.menus ON menus.id = menu_sections.menu_id
            WHERE menu_sections.id = menu_items.section_id 
            AND menus.user_id = auth.uid()
        )
    );

-- Allow public access to items of published menus
CREATE POLICY "Anyone can view items of published menus" ON public.menu_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.menu_sections 
            JOIN public.menus ON menus.id = menu_sections.menu_id
            WHERE menu_sections.id = menu_items.section_id 
            AND menus.is_published = true
        )
    );

-- Create function to generate unique slug for menus
CREATE OR REPLACE FUNCTION generate_menu_slug(restaurant_name TEXT, menu_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from restaurant name and menu name
    base_slug := lower(regexp_replace(
        trim(restaurant_name || '-' || menu_name), 
        '[^a-zA-Z0-9]+', 
        '-', 
        'g'
    ));
    
    -- Remove leading/trailing hyphens
    base_slug := trim(base_slug, '-');
    
    final_slug := base_slug;
    
    -- Check if slug exists and increment counter if needed
    WHILE EXISTS (SELECT 1 FROM public.menus WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slug for new menus
CREATE OR REPLACE FUNCTION set_menu_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_menu_slug(NEW.restaurant_name, NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_menu_slug
    BEFORE INSERT ON public.menus
    FOR EACH ROW EXECUTE FUNCTION set_menu_slug();
