// Theme system for menu styling
export interface MenuThemeConfig {
  preset: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string; // Main content text (food items, descriptions)
    textSecondary: string; // Secondary content text
    headerText: string; // Text on colored headers (restaurant name, section titles)
    accent: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    headingSize: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    bodySize: "xs" | "sm" | "base" | "lg" | "xl";
  };
  spacing: {
    section: string;
    item: string;
    padding: string;
  };
  corners: {
    sections: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
    items: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  };
  // Image appearance customization
  images?: {
    // Overall displayed size for menu item images
    size: "sm" | "md" | "lg" | "xl";
    // Shape / border radius style
    shape: "rounded" | "square" | "circle";
  };
}

export interface MenuThemePreset {
  id: string;
  name: string;
  description: string;
  config: MenuThemeConfig;
  category: "light" | "dark" | "colorful";
  preview: {
    headerColor: string;
    backgroundColor: string;
    textColor: string;
  };
}

// Predefined theme presets
export const THEME_PRESETS: MenuThemePreset[] = [
  {
    id: "modern_dark",
    name: "Modern Dark",
    description: "Sleek dark theme with green accents",
    category: "dark",
    preview: {
      headerColor: "#1F8349",
      backgroundColor: "#111827",
      textColor: "#ffffff",
    },
    config: {
      preset: "modern_dark",
      colors: {
        primary: "#1F8349",
        secondary: "#2ea358",
        background: "#111827",
        surface: "#1f2937",
        text: "#ffffff",
        textSecondary: "#9ca3af",
        headerText: "#ffffff",
        accent: "#1F8349",
        border: "#374151",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "12",
        item: "6",
        padding: "6",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "elegant_light",
    name: "Elegant Light",
    description: "Clean light theme with sophisticated typography",
    category: "light",
    preview: {
      headerColor: "#1f2937",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    },
    config: {
      preset: "elegant_light",
      colors: {
        primary: "#1f2937",
        secondary: "#374151",
        background: "#ffffff",
        surface: "#f9fafb",
        text: "#1f2937",
        textSecondary: "#6b7280",
        headerText: "#ffffff",
        accent: "#059669",
        border: "#e5e7eb",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Source Sans Pro",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "warm_cream",
    name: "Warm Cream",
    description: "Cozy warm tones with cream background",
    category: "light",
    preview: {
      headerColor: "#92400e",
      backgroundColor: "#fef7ed",
      textColor: "#451a03",
    },
    config: {
      preset: "warm_cream",
      colors: {
        primary: "#92400e",
        secondary: "#b45309",
        background: "#fef7ed",
        surface: "#fed7aa",
        text: "#451a03",
        textSecondary: "#78716c",
        headerText: "#ffffff",
        accent: "#92400e",
        border: "#fdba74",
      },
      fonts: {
        heading: "Merriweather",
        body: "Open Sans",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "12",
        item: "6",
        padding: "8",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "vibrant_gradient",
    name: "Vibrant Gradient",
    description: "Bold colors with gradient elements",
    category: "colorful",
    preview: {
      headerColor: "#7c3aed",
      backgroundColor: "#1e1b4b",
      textColor: "#ffffff",
    },
    config: {
      preset: "vibrant_gradient",
      colors: {
        primary: "#7c3aed",
        secondary: "#a855f7",
        background: "#1e1b4b",
        surface: "#312e81",
        text: "#ffffff",
        textSecondary: "#c4b5fd",
        headerText: "#ffffff",
        accent: "#f59e0b",
        border: "#4c1d95",
      },
      fonts: {
        heading: "Poppins",
        body: "Inter",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "6",
      },
      corners: {
        sections: "2xl",
        items: "xl",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "minimalist_mono",
    name: "Minimalist Mono",
    description: "Clean monochrome design with subtle accents",
    category: "light",
    preview: {
      headerColor: "#000000",
      backgroundColor: "#ffffff",
      textColor: "#000000",
    },
    config: {
      preset: "minimalist_mono",
      colors: {
        primary: "#000000",
        secondary: "#404040",
        background: "#ffffff",
        surface: "#f5f5f5",
        text: "#000000",
        textSecondary: "#666666",
        headerText: "#ffffff",
        accent: "#2563eb",
        border: "#e0e0e0",
      },
      fonts: {
        heading: "Space Mono",
        body: "Inter",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "20",
        item: "10",
        padding: "4",
      },
      corners: {
        sections: "none",
        items: "sm",
      },
      images: { size: "md", shape: "square" },
    },
  },
  {
    id: "italian_trattoria",
    name: "Italian Trattoria",
    description: "Rustic Italian restaurant with warm earth tones",
    category: "colorful",
    preview: {
      headerColor: "#8b4513",
      backgroundColor: "#fdf6e3",
      textColor: "#3c2414",
    },
    config: {
      preset: "italian_trattoria",
      colors: {
        primary: "#8b4513",
        secondary: "#cd853f",
        background: "#fdf6e3",
        surface: "#f4e4bc",
        text: "#3c2414",
        textSecondary: "#8b7355",
        headerText: "#ffffff",
        accent: "#8b4513",
        border: "#deb887",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Crimson Text",
        headingSize: "3xl",
        bodySize: "lg",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "japanese_zen",
    name: "Japanese Zen",
    description: "Minimalist Japanese aesthetic with natural colors",
    category: "light",
    preview: {
      headerColor: "#2d5016",
      backgroundColor: "#f7f5f3",
      textColor: "#1a1a1a",
    },
    config: {
      preset: "japanese_zen",
      colors: {
        primary: "#2d5016",
        secondary: "#4a7c59",
        background: "#f7f5f3",
        surface: "#ffffff",
        text: "#1a1a1a",
        textSecondary: "#666666",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#e8e2db",
      },
      fonts: {
        heading: "Noto Sans JP",
        body: "Source Sans Pro",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "20",
        item: "12",
        padding: "10",
      },
      corners: {
        sections: "sm",
        items: "sm",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "mexican_cantina",
    name: "Mexican Cantina",
    description: "Vibrant Mexican colors with festive atmosphere",
    category: "colorful",
    preview: {
      headerColor: "#dc2626",
      backgroundColor: "#fef3c7",
      textColor: "#7c2d12",
    },
    config: {
      preset: "mexican_cantina",
      colors: {
        primary: "#dc2626",
        secondary: "#f59e0b",
        background: "#fef3c7",
        surface: "#fed7aa",
        text: "#7c2d12",
        textSecondary: "#92400e",
        headerText: "#ffffff",
        accent: "#059669",
        border: "#f59e0b",
      },
      fonts: {
        heading: "Fredoka One",
        body: "Nunito",
        headingSize: "3xl",
        bodySize: "lg",
      },
      spacing: {
        section: "12",
        item: "6",
        padding: "6",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "french_bistro",
    name: "French Bistro",
    description: "Classic Parisian bistro with elegant navy and gold",
    category: "dark",
    preview: {
      headerColor: "#1e3a8a",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
    },
    config: {
      preset: "french_bistro",
      colors: {
        primary: "#1e3a8a",
        secondary: "#3b82f6",
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#1e293b",
        textSecondary: "#64748b",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#cbd5e1",
      },
      fonts: {
        heading: "Playfair Display",
        body: "Source Sans Pro",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "indian_spice",
    name: "Indian Spice",
    description: "Rich spice-inspired colors with gold accents",
    category: "colorful",
    preview: {
      headerColor: "#b91c1c",
      backgroundColor: "#fef7ed",
      textColor: "#451a03",
    },
    config: {
      preset: "indian_spice",
      colors: {
        primary: "#b91c1c",
        secondary: "#ea580c",
        background: "#fef7ed",
        surface: "#fed7aa",
        text: "#451a03",
        textSecondary: "#92400e",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#fdba74",
      },
      fonts: {
        heading: "Cinzel",
        body: "Lato",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "thai_garden",
    name: "Thai Garden",
    description: "Fresh green tones inspired by Thai gardens",
    category: "colorful",
    preview: {
      headerColor: "#166534",
      backgroundColor: "#f0fdf4",
      textColor: "#14532d",
    },
    config: {
      preset: "thai_garden",
      colors: {
        primary: "#166534",
        secondary: "#22c55e",
        background: "#f0fdf4",
        surface: "#dcfce7",
        text: "#14532d",
        textSecondary: "#166534",
        headerText: "#ffffff",
        accent: "#059669",
        border: "#bbf7d0",
      },
      fonts: {
        heading: "Kanit",
        body: "Sarabun",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "14",
        item: "7",
        padding: "7",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "greek_taverna",
    name: "Greek Taverna",
    description: "Mediterranean blue and white with rustic charm",
    category: "colorful",
    preview: {
      headerColor: "#1e40af",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
    },
    config: {
      preset: "greek_taverna",
      colors: {
        primary: "#1e40af",
        secondary: "#3b82f6",
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#1e293b",
        textSecondary: "#64748b",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#cbd5e1",
      },
      fonts: {
        heading: "Roboto Slab",
        body: "Open Sans",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "american_diner",
    name: "American Diner",
    description: "Classic 50s diner with red, white, and chrome",
    category: "colorful",
    preview: {
      headerColor: "#dc2626",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    },
    config: {
      preset: "american_diner",
      colors: {
        primary: "#dc2626",
        secondary: "#991b1b",
        background: "#ffffff",
        surface: "#f3f4f6",
        text: "#1f2937",
        textSecondary: "#6b7280",
        headerText: "#ffffff",
        accent: "#1d4ed8",
        border: "#d1d5db",
      },
      fonts: {
        heading: "Bebas Neue",
        body: "Roboto",
        headingSize: "4xl",
        bodySize: "lg",
      },
      spacing: {
        section: "12",
        item: "6",
        padding: "6",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "chinese_dragon",
    name: "Chinese Dragon",
    description: "Traditional Chinese red and gold theme",
    category: "colorful",
    preview: {
      headerColor: "#dc2626",
      backgroundColor: "#fef2f2",
      textColor: "#7f1d1d",
    },
    config: {
      preset: "chinese_dragon",
      colors: {
        primary: "#dc2626",
        secondary: "#ef4444",
        background: "#fef2f2",
        surface: "#fee2e2",
        text: "#7f1d1d",
        textSecondary: "#991b1b",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#fecaca",
      },
      fonts: {
        heading: "Noto Sans SC",
        body: "Source Sans Pro",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "lg",
        items: "md",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "korean_modern",
    name: "Korean Modern",
    description: "Clean Korean aesthetic with subtle colors",
    category: "light",
    preview: {
      headerColor: "#374151",
      backgroundColor: "#ffffff",
      textColor: "#111827",
    },
    config: {
      preset: "korean_modern",
      colors: {
        primary: "#374151",
        secondary: "#6b7280",
        background: "#ffffff",
        surface: "#f9fafb",
        text: "#111827",
        textSecondary: "#6b7280",
        headerText: "#ffffff",
        accent: "#2563eb",
        border: "#e5e7eb",
      },
      fonts: {
        heading: "Noto Sans KR",
        body: "Inter",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "18",
        item: "10",
        padding: "8",
      },
      corners: {
        sections: "md",
        items: "sm",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "spanish_tapas",
    name: "Spanish Tapas",
    description: "Warm Spanish colors with terracotta and gold",
    category: "colorful",
    preview: {
      headerColor: "#c2410c",
      backgroundColor: "#fefbf3",
      textColor: "#7c2d12",
    },
    config: {
      preset: "spanish_tapas",
      colors: {
        primary: "#c2410c",
        secondary: "#ea580c",
        background: "#fefbf3",
        surface: "#fed7aa",
        text: "#7c2d12",
        textSecondary: "#92400e",
        headerText: "#ffffff",
        accent: "#c2410c",
        border: "#fdba74",
      },
      fonts: {
        heading: "Montserrat",
        body: "Open Sans",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "moroccan_nights",
    name: "Moroccan Nights",
    description: "Exotic Moroccan theme with deep purples and gold",
    category: "dark",
    preview: {
      headerColor: "#581c87",
      backgroundColor: "#1e1b4b",
      textColor: "#ffffff",
    },
    config: {
      preset: "moroccan_nights",
      colors: {
        primary: "#581c87",
        secondary: "#7c3aed",
        background: "#1e1b4b",
        surface: "#312e81",
        text: "#ffffff",
        textSecondary: "#c4b5fd",
        headerText: "#ffffff",
        accent: "#d4af37",
        border: "#4c1d95",
      },
      fonts: {
        heading: "Amiri",
        body: "Lato",
        headingSize: "3xl",
        bodySize: "base",
      },
      spacing: {
        section: "16",
        item: "8",
        padding: "8",
      },
      corners: {
        sections: "xl",
        items: "lg",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
  {
    id: "nordic_minimalist",
    name: "Nordic Minimalist",
    description: "Scandinavian simplicity with muted colors",
    category: "light",
    preview: {
      headerColor: "#475569",
      backgroundColor: "#f8fafc",
      textColor: "#334155",
    },
    config: {
      preset: "nordic_minimalist",
      colors: {
        primary: "#475569",
        secondary: "#64748b",
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#334155",
        textSecondary: "#64748b",
        headerText: "#ffffff",
        accent: "#0ea5e9",
        border: "#e2e8f0",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
        headingSize: "2xl",
        bodySize: "base",
      },
      spacing: {
        section: "20",
        item: "12",
        padding: "10",
      },
      corners: {
        sections: "sm",
        items: "sm",
      },
      images: { size: "md", shape: "rounded" },
    },
  },
];

// Utility type and size maps
export const FONT_SIZE_MAP = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

export const SPACING_MAP = {
  "4": "space-y-4",
  "6": "space-y-6",
  "8": "space-y-8",
  "10": "space-y-10",
  "12": "space-y-12",
  "14": "space-y-14",
  "16": "space-y-16",
  "18": "space-y-18",
  "20": "space-y-20",
};

export const PADDING_MAP = {
  "4": "p-4",
  "6": "p-6",
  "7": "p-7",
  "8": "p-8",
  "10": "p-10",
};

export const CORNER_MAP = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Source Sans Pro",
  "Merriweather",
  "Open Sans",
  "Poppins",
  "Space Mono",
  "Crimson Text",
  "Noto Sans JP",
  "Fredoka One",
  "Nunito",
  "Bebas Neue",
  "Roboto",
  "Cinzel",
  "Lato",
  "Kanit",
  "Sarabun",
  "Roboto Slab",
  "Noto Sans SC",
  "Noto Sans KR",
  "Montserrat",
  "Amiri",
];

// Generate CSS for theme
export const generateThemeCSS = (theme: MenuThemeConfig): string => {
  return `
    --theme-primary: ${theme.colors.primary};
    --theme-secondary: ${theme.colors.secondary};
    --theme-background: ${theme.colors.background};
    --theme-surface: ${theme.colors.surface};
    --theme-text: ${theme.colors.text};
    --theme-text-secondary: ${theme.colors.textSecondary};
    --theme-header-text: ${theme.colors.headerText};
    --theme-accent: ${theme.colors.accent};
    --theme-border: ${theme.colors.border};
  `;
};

// Helper functions
export const getThemePreset = (id: string): MenuThemePreset | undefined => {
  return THEME_PRESETS.find((preset) => preset.id === id);
};

export const createCustomTheme = (
  basePreset: string,
  overrides: Partial<MenuThemeConfig>
): MenuThemeConfig => {
  const base = getThemePreset(basePreset)?.config || THEME_PRESETS[0].config;
  return { ...base, ...overrides };
};

export default THEME_PRESETS;
