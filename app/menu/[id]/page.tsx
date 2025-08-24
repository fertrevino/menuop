"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PublicMenuProps {
  params: {
    id: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuData {
  id: string;
  name: string;
  restaurantName: string;
  sections: MenuSection[];
}

export default function PublicMenu({ params }: PublicMenuProps) {
  const router = useRouter();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMenuData();
  }, [params.id]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call to fetch menu data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data for demonstration
      const mockMenu: MenuData = {
        id: params.id,
        name: "Dinner Menu",
        restaurantName: "Bella Italia",
        sections: [
          {
            id: "1",
            name: "Appetizers",
            items: [
              {
                id: "1",
                name: "Bruschetta",
                description:
                  "Grilled bread topped with fresh tomatoes, garlic, and basil",
                price: 8.99,
              },
              {
                id: "2",
                name: "Caesar Salad",
                description:
                  "Crisp romaine lettuce with parmesan cheese and croutons",
                price: 12.99,
              },
            ],
          },
          {
            id: "2",
            name: "Main Courses",
            items: [
              {
                id: "3",
                name: "Spaghetti Carbonara",
                description:
                  "Fresh pasta with pancetta, eggs, and parmesan cheese",
                price: 18.99,
              },
              {
                id: "4",
                name: "Grilled Salmon",
                description:
                  "Atlantic salmon with lemon butter sauce and seasonal vegetables",
                price: 24.99,
              },
            ],
          },
          {
            id: "3",
            name: "Desserts",
            items: [
              {
                id: "5",
                name: "Tiramisu",
                description:
                  "Classic Italian dessert with coffee-soaked ladyfingers",
                price: 7.99,
              },
            ],
          },
        ],
      };

      setMenuData(mockMenu);
    } catch (err) {
      setError("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Menu not found</div>
          <p className="text-gray-400">
            This menu may have been removed or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            {menuData.restaurantName}
          </h1>
          <p className="text-xl text-gray-300">{menuData.name}</p>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          {menuData.sections.map((section) => (
            <div
              key={section.id}
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] px-6 py-4">
                <h2 className="text-2xl font-bold text-white">
                  {section.name}
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#1F8349]">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            Powered by{" "}
            <span
              onClick={() => router.push("/")}
              className="text-[#1F8349] hover:text-[#2ea358] font-semibold cursor-pointer transition-colors"
            >
              Menuop
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
