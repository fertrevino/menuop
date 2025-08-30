-- Add theme configuration to menus table
ALTER TABLE menus 
ADD COLUMN theme_config JSONB DEFAULT '{
  "preset": "modern_dark",
  "colors": {
    "primary": "#1F8349",
    "secondary": "#2ea358",
    "background": "#111827",
    "surface": "#1f2937",
    "text": "#ffffff",
    "textSecondary": "#9ca3af",
    "headerText": "#ffffff",
    "accent": "#1F8349",
    "border": "#374151"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter",
    "headingSize": "2xl",
    "bodySize": "base"
  },
  "spacing": {
    "section": "12",
    "item": "6",
    "padding": "6"
  },
  "corners": {
    "sections": "xl",
    "items": "lg"
  }
}';

-- Add comment to describe the schema
COMMENT ON COLUMN menus.theme_config IS 'JSON configuration for menu theme including colors, fonts, spacing, and layout preferences';
