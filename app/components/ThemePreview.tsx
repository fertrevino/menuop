"use client";

import React from "react";
import {
  MenuThemeConfig,
  FONT_SIZE_MAP,
  SPACING_MAP,
  PADDING_MAP,
  CORNER_MAP,
  generateThemeCSS,
} from "@/lib/types/theme";

interface ThemePreviewProps {
  theme: MenuThemeConfig;
  restaurantName: string;
  menuName: string;
}

export default function ThemePreview({
  theme,
  restaurantName,
  menuName,
}: ThemePreviewProps) {
  const sampleSection = {
    name: "Main Courses",
    description: "Our signature dishes made with fresh ingredients",
    items: [
      {
        name: "Grilled Salmon",
        description: "Fresh Atlantic salmon with herbs and lemon",
        price: 24.99,
      },
      {
        name: "Chicken Parmesan",
        description: "Crispy chicken breast with marinara sauce",
        price: 19.99,
      },
    ],
  };

  const themeCSS = generateThemeCSS(theme);
  const sectionSpacing =
    SPACING_MAP[theme.spacing.section as keyof typeof SPACING_MAP] ||
    "space-y-8";
  const itemSpacing =
    SPACING_MAP[theme.spacing.item as keyof typeof SPACING_MAP] || "space-y-4";
  const padding =
    PADDING_MAP[theme.spacing.padding as keyof typeof PADDING_MAP] || "p-6";
  const sectionCorners = CORNER_MAP[theme.corners.sections] || "rounded-xl";
  const itemCorners = CORNER_MAP[theme.corners.items] || "rounded-lg";
  const headingSize = FONT_SIZE_MAP[theme.fonts.headingSize] || "text-2xl";
  const bodySize = FONT_SIZE_MAP[theme.fonts.bodySize] || "text-base";

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Live Preview</h3>
        <p className="text-green-100 text-sm mt-1">
          See how your menu will look to customers
        </p>
      </div>

      <div className="p-6">
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            fontFamily: theme.fonts.body,
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-8 text-center"
            style={{
              background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
            }}
          >
            <h1
              className={`${headingSize} font-bold mb-2`}
              style={{
                color: theme.colors.headerText,
                fontFamily: theme.fonts.heading,
              }}
            >
              {restaurantName || "Your Restaurant"}
            </h1>
            <p
              className={`${bodySize} opacity-90`}
              style={{ color: theme.colors.headerText }}
            >
              {menuName || "Your Menu"}
            </p>
          </div>

          {/* Content */}
          <div
            className={padding}
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className={sectionSpacing}>
              {/* Sample Section */}
              <div
                className={`${sectionCorners} border overflow-hidden`}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }}
              >
                <div
                  className="px-6 py-4"
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
                    {sampleSection.name}
                  </h2>
                  <p
                    className={`${bodySize} mt-1 opacity-90`}
                    style={{ color: theme.colors.headerText }}
                  >
                    {sampleSection.description}
                  </p>
                </div>

                <div className={padding}>
                  <div className={itemSpacing}>
                    {sampleSection.items.map((item, index) => (
                      <div
                        key={index}
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
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: theme.colors.textSecondary }}
                          >
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`${bodySize} font-bold`}
                            style={{ color: theme.colors.accent }}
                          >
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="text-center mt-8 pt-6 border-t text-sm"
              style={{ borderColor: theme.colors.border }}
            >
              <p style={{ color: theme.colors.textSecondary }}>
                Powered by{" "}
                <span
                  className="font-semibold cursor-pointer"
                  style={{ color: theme.colors.accent }}
                >
                  Menuop
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Variables Display (for development) */}
      <div className="hidden">
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeCSS} }` }} />
      </div>
    </div>
  );
}
