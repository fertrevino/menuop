"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use, useCallback } from "react";
import { MenuService } from "@/lib/services/menu";
import { PublicMenuData } from "@/lib/types/menu";
import { trackQRScan } from "@/lib/utils/qrTracking";
import { formatPrice } from "@/lib/utils/currency";
import {
  MenuThemeConfig,
  THEME_PRESETS,
  FONT_SIZE_MAP,
  SPACING_MAP,
  PADDING_MAP,
  CORNER_MAP,
  generateThemeCSS,
} from "@/lib/types/theme";

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

  const loadMenuData = useCallback(async () => {
    try {
      setIsLoading(true);
      const menu = await MenuService.getPublicMenuById(id);

      if (menu) {
        setMenuData(menu);
      } else {
        setError("Menu not found or not published");
      }
    } catch {
      setError("Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMenuData();

    // Track QR scan if menu accessed via QR code
    trackQRScan(id);
  }, [id, loadMenuData]);

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
            This menu may have been removed, unpublished, or doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Get theme configuration or use default
  const theme: MenuThemeConfig =
    menuData.theme_config || THEME_PRESETS[0].config;
  const themeCSS = generateThemeCSS(theme);

  // Get CSS classes from theme
  const sectionSpacing =
    SPACING_MAP[theme.spacing.section as keyof typeof SPACING_MAP] ||
    "space-y-12";
  const itemSpacing =
    SPACING_MAP[theme.spacing.item as keyof typeof SPACING_MAP] || "space-y-6";
  const padding =
    PADDING_MAP[theme.spacing.padding as keyof typeof PADDING_MAP] || "p-6";
  const sectionCorners = CORNER_MAP[theme.corners.sections] || "rounded-xl";
  const itemCorners = CORNER_MAP[theme.corners.items] || "rounded-lg";
  const headingSize = FONT_SIZE_MAP[theme.fonts.headingSize] || "text-2xl";
  const bodySize = FONT_SIZE_MAP[theme.fonts.bodySize] || "text-base";

  return (
    <>
      {/* Inject theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: `:root { ${themeCSS} }` }} />

      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme.colors.background,
          fontFamily: theme.fonts.body,
        }}
      >
        {/* Header */}
        <div
          className="border-b"
          style={{
            background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
            borderColor: theme.colors.border,
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <h1
              className={`${headingSize} font-bold mb-2`}
              style={{
                color: theme.colors.headerText,
                fontFamily: theme.fonts.heading,
              }}
            >
              {menuData.restaurant_name}
            </h1>
            <p
              className={`${bodySize} opacity-90`}
              style={{ color: theme.colors.headerText }}
            >
              {menuData.name}
            </p>
            {menuData.description && (
              <p
                className={`${bodySize} mt-2 opacity-75`}
                style={{ color: theme.colors.headerText }}
              >
                {menuData.description}
              </p>
            )}
          </div>
        </div>

        {/* Menu Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={sectionSpacing}>
            {menuData.sections.map((section) => (
              <div
                key={section.id}
                className={`${sectionCorners} border overflow-hidden`}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div
                  className={padding}
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  }}
                >
                  <h2
                    className={`${headingSize} font-bold`}
                    style={{
                      color: theme.colors.headerText,
                      fontFamily: theme.fonts.heading,
                    }}
                  >
                    {section.name}
                  </h2>
                  {section.description && (
                    <p
                      className={`${bodySize} mt-1 opacity-90`}
                      style={{ color: theme.colors.headerText }}
                    >
                      {section.description}
                    </p>
                  )}
                </div>

                <div className={padding}>
                  <div className={itemSpacing}>
                    {section.items
                      .filter((item) => item.is_available)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-start"
                        >
                          <div className="flex-1 pr-4">
                            <h3
                              className={`${bodySize} font-semibold mb-2`}
                              style={{
                                color: theme.colors.text,
                                fontFamily: theme.fonts.heading,
                              }}
                            >
                              {item.name}
                            </h3>
                            {item.description && (
                              <p
                                className="text-sm leading-relaxed"
                                style={{ color: theme.colors.textSecondary }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span
                              className={`${bodySize} font-bold`}
                              style={{ color: theme.colors.accent }}
                            >
                              {formatPrice(item.price, menuData.currency)}
                            </span>
                          </div>
                        </div>
                      ))}

                    {section.items.filter((item) => item.is_available)
                      .length === 0 && (
                      <div className="text-center py-8">
                        <p
                          className="text-sm"
                          style={{ color: theme.colors.textSecondary }}
                        >
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
                <p
                  className={`${bodySize}`}
                  style={{ color: theme.colors.textSecondary }}
                >
                  This menu is currently empty.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="text-center mt-12 py-8 border-t text-sm"
            style={{ borderColor: theme.colors.border }}
          >
            <p style={{ color: theme.colors.textSecondary }}>
              Powered by{" "}
              <span
                onClick={() => router.push("/")}
                className="font-semibold cursor-pointer transition-colors hover:opacity-80"
                style={{ color: theme.colors.accent }}
              >
                Menuop
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
