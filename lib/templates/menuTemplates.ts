// Quick start menu templates
// These are lightweight scaffolds to help new users get started fast.
// They intentionally keep item counts low (<= 6) to avoid overwhelming the edit view.

import { MenuFormData } from "../types/menu";
import { THEME_PRESETS } from "../types/theme";

export interface MenuTemplateDefinition {
  id: string;
  label: string;
  description: string;
  // Partial override of MenuFormData fields (excluding dynamic user-specific ones like user_id)
  build: (options?: { currency?: string }) => Omit<
    MenuFormData,
    "theme_config"
  > & {
    theme_config?: MenuFormData["theme_config"];
  };
  recommendedThemeIndex?: number; // index into THEME_PRESETS
  tags?: string[];
}

// Helper for price to keep templates concise
const p = (value: number) => value;

export const MENU_TEMPLATES: MenuTemplateDefinition[] = [
  {
    id: "coffee-shop-basic",
    label: "Coffee Shop",
    description: "Espresso drinks and pastries starter layout.",
    recommendedThemeIndex: 1,
    tags: ["coffee", "cafe", "breakfast"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Daily Menu",
      restaurant_name: "Your Coffee Bar",
      description: "Freshly brewed coffee and artisan pastries.",
      currency,
      sections: [
        {
          name: "Drinks",
          description: "Signature espresso & classics",
          items: [
            {
              name: "Espresso",
              description: "Rich double shot",
              price: p(3.5),
              is_available: true,
            },
            {
              name: "Latte",
              description: "Smooth with microfoam",
              price: p(4.75),
              is_available: true,
            },
            {
              name: "Cold Brew",
              description: "Slow steeped 18h",
              price: p(4.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Pastries",
          description: "Baked fresh each morning",
          items: [
            {
              name: "Croissant",
              description: "Buttery & flaky",
              price: p(3.95),
              is_available: true,
            },
            {
              name: "Blueberry Muffin",
              description: "Seasonal berries",
              price: p(3.25),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "casual-dining-basic",
    label: "Casual Dining",
    description: "Starters, mains and desserts foundation.",
    recommendedThemeIndex: 0,
    tags: ["restaurant", "lunch", "dinner"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Main Menu",
      restaurant_name: "Your Kitchen",
      description: "Comfort food favorites crafted daily.",
      currency,
      sections: [
        {
          name: "Starters",
          description: "To begin",
          items: [
            {
              name: "House Salad",
              description: "Seasonal greens & vinaigrette",
              price: p(9.5),
              is_available: true,
            },
            {
              name: "Bruschetta",
              description: "Tomato, basil, olive oil",
              price: p(8.0),
              is_available: true,
            },
          ],
        },
        {
          name: "Mains",
          description: "Hearty plates",
          items: [
            {
              name: "Grilled Chicken",
              description: "Herb marinade, roasted veggies",
              price: p(18.0),
              is_available: true,
            },
            {
              name: "Pasta Primavera",
              description: "Seasonal vegetables & parmesan",
              price: p(17.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Desserts",
          description: "Sweet finish",
          items: [
            {
              name: "Chocolate Cake",
              description: "Dark ganache & cream",
              price: p(7.5),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "italian-trattoria",
    label: "Italian Trattoria",
    description: "Classic pasta, pizza and antipasti starter set.",
    recommendedThemeIndex: 0,
    tags: ["italian", "pasta", "pizza"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Trattoria Menu",
      restaurant_name: "Your Trattoria",
      description: "Authentic Italian flavors with fresh ingredients.",
      currency,
      sections: [
        {
          name: "Antipasti",
          description: "To begin",
          items: [
            {
              name: "Bruschetta al Pomodoro",
              description: "Tomato, basil, EVOO",
              price: p(8.5),
              is_available: true,
            },
            {
              name: "Caprese",
              description: "Mozzarella, tomato, basil",
              price: p(11),
              is_available: true,
            },
          ],
        },
        {
          name: "Primi",
          description: "Pastas",
          items: [
            {
              name: "Spaghetti Carbonara",
              description: "Pecorino & guanciale",
              price: p(18),
              is_available: true,
            },
            {
              name: "Tagliatelle al Ragu",
              description: "Slow beef ragu",
              price: p(19),
              is_available: true,
            },
          ],
        },
        {
          name: "Pizza",
          description: "Wood-fired",
          items: [
            {
              name: "Margherita",
              description: "Fior di latte, basil",
              price: p(16),
              is_available: true,
            },
            {
              name: "Diavola",
              description: "Spicy salami",
              price: p(17.5),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "turkish-meze-grill",
    label: "Turkish Meze & Grill",
    description: "Meze starters and charcoal grilled mains.",
    recommendedThemeIndex: 1,
    tags: ["turkish", "meze", "grill"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Meze & Grill",
      restaurant_name: "Your Ocakbasi",
      description: "Traditional meze and Anatolian grill favorites.",
      currency,
      sections: [
        {
          name: "Cold Meze",
          description: "Shared starters",
          items: [
            {
              name: "Hummus",
              description: "Chickpeas & tahini",
              price: p(7.5),
              is_available: true,
            },
            {
              name: "Ezme",
              description: "Spicy crushed salad",
              price: p(7),
              is_available: true,
            },
          ],
        },
        {
          name: "Hot Meze",
          description: "Warm bites",
          items: [
            {
              name: "Sigara Böreği",
              description: "Feta pastry rolls",
              price: p(8.5),
              is_available: true,
            },
            {
              name: "Sautéed Sucuk",
              description: "Spiced beef sausage",
              price: p(9),
              is_available: true,
            },
          ],
        },
        {
          name: "Grill",
          description: "Charcoal skewers",
          items: [
            {
              name: "Adana Kebab",
              description: "Hand-minced lamb",
              price: p(19),
              is_available: true,
            },
            {
              name: "Chicken Shish",
              description: "Marinated cubes",
              price: p(18),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "german-biergarten",
    label: "German Biergarten",
    description: "Hearty classics and shared platters.",
    recommendedThemeIndex: 2,
    tags: ["german", "biergarten"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Biergarten Menu",
      restaurant_name: "Your Biergarten",
      description: "Traditional Bavarian-inspired bites.",
      currency,
      sections: [
        {
          name: "Starters",
          description: "Snack & share",
          items: [
            {
              name: "Pretzel",
              description: "Warm with mustard",
              price: p(6.5),
              is_available: true,
            },
            {
              name: "Obatzda",
              description: "Cheese spread",
              price: p(9),
              is_available: true,
            },
          ],
        },
        {
          name: "Mains",
          description: "Hearty plates",
          items: [
            {
              name: "Bratwurst",
              description: "Sauerkraut & mustard",
              price: p(14.5),
              is_available: true,
            },
            {
              name: "Schnitzel",
              description: "Crisp pork cutlet",
              price: p(19.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Sides",
          description: "Add-ons",
          items: [
            {
              name: "Spaetzle",
              description: "Butter noodles",
              price: p(6.5),
              is_available: true,
            },
            {
              name: "Red Cabbage",
              description: "Braised & spiced",
              price: p(5.5),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "american-diner",
    label: "American Diner",
    description: "All-day comfort plates & sandwiches.",
    recommendedThemeIndex: 3,
    tags: ["american", "diner"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Diner Menu",
      restaurant_name: "Your Diner",
      description: "Classic roadside favorites all day.",
      currency,
      sections: [
        {
          name: "Breakfast",
          description: "Served all day",
          items: [
            {
              name: "Pancake Stack",
              description: "Maple syrup & butter",
              price: p(11),
              is_available: true,
            },
            {
              name: "Eggs & Bacon",
              description: "2 eggs any style",
              price: p(10.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Burgers",
          description: "Griddled patties",
          items: [
            {
              name: "Classic Cheeseburger",
              description: "Cheddar & pickles",
              price: p(14),
              is_available: true,
            },
            {
              name: "Veggie Burger",
              description: "Roasted mushroom blend",
              price: p(13.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Plates",
          description: "Comfort mains",
          items: [
            {
              name: "Fried Chicken",
              description: "Buttermilk brined",
              price: p(17.5),
              is_available: true,
            },
            {
              name: "Meatloaf",
              description: "Brown gravy",
              price: p(16.5),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
  {
    id: "brunch-classic",
    label: "Brunch Classics",
    description: "Sweet & savory late morning favorites.",
    recommendedThemeIndex: 4,
    tags: ["brunch", "weekend"],
    build: ({ currency = "USD" } = {}) => ({
      name: "Brunch Menu",
      restaurant_name: "Your Brunch Spot",
      description: "Weekend classics with a twist.",
      currency,
      sections: [
        {
          name: "Savory",
          description: "Egg-based dishes",
          items: [
            {
              name: "Avocado Toast",
              description: "Seeded sourdough",
              price: p(13),
              is_available: true,
            },
            {
              name: "Eggs Benedict",
              description: "Hollandaise & ham",
              price: p(15.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Sweet",
          description: "Baked & griddled",
          items: [
            {
              name: "French Toast",
              description: "Cinnamon brioche",
              price: p(14),
              is_available: true,
            },
            {
              name: "Berry Parfait",
              description: "Yogurt & granola",
              price: p(9.5),
              is_available: true,
            },
          ],
        },
        {
          name: "Beverages",
          description: "Wake-ups",
          items: [
            {
              name: "Fresh Orange Juice",
              description: "Cold pressed",
              price: p(6),
              is_available: true,
            },
            {
              name: "House Mimosa",
              description: "Sparkling citrus",
              price: p(11),
              is_available: true,
            },
          ],
        },
      ],
    }),
  },
];

export function getMenuTemplate(id: string | undefined) {
  if (!id) return null;
  return MENU_TEMPLATES.find((t) => t.id === id) || null;
}

export function buildTemplateMenu(templateId: string, currency?: string) {
  const def = getMenuTemplate(templateId);
  if (!def) return null;
  const base = def.build({ currency });
  const themePreset =
    typeof def.recommendedThemeIndex === "number" &&
    THEME_PRESETS[def.recommendedThemeIndex]
      ? THEME_PRESETS[def.recommendedThemeIndex].config
      : THEME_PRESETS[0].config;
  return { ...base, theme_config: themePreset } as MenuFormData;
}

export function listMenuTemplates() {
  return MENU_TEMPLATES.map(({ id, label, description, tags }) => ({
    id,
    label,
    description,
    tags: tags || [],
  }));
}
