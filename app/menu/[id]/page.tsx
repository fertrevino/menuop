"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { MenuService } from "@/lib/services/menu";
import { PublicMenuData } from "@/lib/types/menu";

interface PublicMenuProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PublicMenu({ params }: PublicMenuProps) {
  const router = useRouter();
  const [menuData, setMenuData] = useState<PublicMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap the params Promise using React.use()
  const { id } = use(params);

  useEffect(() => {
    loadMenuData();
  }, [id]);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      const menu = await MenuService.getPublicMenuById(id);

      if (menu) {
        setMenuData(menu);
      } else {
        setError("Menu not found or not published");
      }
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
            This menu may have been removed, unpublished, or doesn't exist.
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
            {menuData.restaurant_name}
          </h1>
          <p className="text-xl text-gray-300">{menuData.name}</p>
          {menuData.description && (
            <p className="text-gray-400 mt-2">{menuData.description}</p>
          )}
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
                {section.description && (
                  <p className="text-green-100 mt-1">{section.description}</p>
                )}
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {section.items
                    .filter((item) => item.is_available)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-400 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#1F8349]">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                  {section.items.filter((item) => item.is_available).length ===
                    0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No items available in this section
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {menuData.sections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                This menu is currently empty.
              </p>
            </div>
          )}
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
