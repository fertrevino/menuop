"use client";

import React, { useState, useEffect } from "react";
import {
  MenuThemeConfig,
  MenuThemePreset,
  THEME_PRESETS,
  FONT_OPTIONS,
} from "@/lib/types/theme";

interface ThemeSelectorProps {
  currentTheme: MenuThemeConfig;
  onThemeChange: (theme: MenuThemeConfig) => void;
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
}: ThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [selectedPreset, setSelectedPreset] = useState(currentTheme.preset);
  const [customConfig, setCustomConfig] =
    useState<MenuThemeConfig>(currentTheme);

  // Sync customConfig when currentTheme prop changes
  useEffect(() => {
    setCustomConfig(currentTheme);
    setSelectedPreset(currentTheme.preset);
  }, [currentTheme]);

  const handlePresetSelect = (preset: MenuThemePreset) => {
    setSelectedPreset(preset.id);
    setCustomConfig(preset.config); // Update custom config to match the selected preset
    onThemeChange(preset.config);
  };

  const handleCustomChange = (
    section: keyof MenuThemeConfig | "images",
    key: string,
    value: string
  ) => {
    const updatedConfig = { ...customConfig };

    if (
      section === "colors" ||
      section === "fonts" ||
      section === "spacing" ||
      section === "corners"
    ) {
      const sectionObj = updatedConfig[section] as Record<string, string>;
      sectionObj[key] = value;
    } else if (section === "images") {
      updatedConfig.images = {
        ...(updatedConfig.images || { size: "md", shape: "rounded" }),
        [key]: value,
      } as any;
    }

    setCustomConfig(updatedConfig);
    onThemeChange(updatedConfig);
  };

  const categoryPresets = {
    dark: THEME_PRESETS.filter((p) => p.category === "dark"),
    light: THEME_PRESETS.filter((p) => p.category === "light"),
    colorful: THEME_PRESETS.filter((p) => p.category === "colorful"),
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Menu Theme</h3>
        <p className="text-green-100 text-sm mt-1">
          Customize the appearance of your menu
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-700 border-b border-gray-600">
        <div className="flex">
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "presets"
                ? "text-white bg-gray-800 border-b-2 border-[#1F8349]"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            Theme Presets
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "custom"
                ? "text-white bg-gray-800 border-b-2 border-[#1F8349]"
                : "text-gray-300 hover:text-white hover:bg-gray-600"
            }`}
          >
            Custom Settings
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === "presets" && (
          <div className="space-y-6">
            {Object.entries(categoryPresets).map(([category, presets]) => (
              <div key={category}>
                <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                  {category} Themes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        selectedPreset === preset.id
                          ? "border-[#1F8349] bg-[#1F8349]/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      {/* Preview */}
                      <div
                        className="h-24 rounded-md mb-3 relative overflow-hidden"
                        style={{
                          backgroundColor: preset.preview.backgroundColor,
                        }}
                      >
                        <div
                          className="h-8 w-full"
                          style={{
                            backgroundColor: preset.preview.headerColor,
                          }}
                        />
                        <div className="p-2">
                          <div
                            className="h-2 rounded mb-1"
                            style={{
                              backgroundColor: preset.preview.textColor,
                              opacity: 0.8,
                              width: "80%",
                            }}
                          />
                          <div
                            className="h-2 rounded"
                            style={{
                              backgroundColor: preset.preview.textColor,
                              opacity: 0.5,
                              width: "60%",
                            }}
                          />
                        </div>
                      </div>

                      {/* Theme Info */}
                      <h5 className="font-semibold text-white text-sm mb-1">
                        {preset.name}
                      </h5>
                      <p className="text-gray-400 text-xs">
                        {preset.description}
                      </p>

                      {/* Selected Indicator */}
                      {selectedPreset === preset.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#1F8349] rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "custom" && (
          <div className="space-y-8">
            {/* Colors */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Colors</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(customConfig.colors).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) =>
                          handleCustomChange("colors", key, e.target.value)
                        }
                        className="w-12 h-10 rounded border border-gray-600 bg-gray-700"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          handleCustomChange("colors", key, e.target.value)
                        }
                        className="flex-1 bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Typography
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heading Font
                  </label>
                  <select
                    value={customConfig.fonts.heading}
                    onChange={(e) =>
                      handleCustomChange("fonts", "heading", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Body Font
                  </label>
                  <select
                    value={customConfig.fonts.body}
                    onChange={(e) =>
                      handleCustomChange("fonts", "body", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heading Size
                  </label>
                  <select
                    value={customConfig.fonts.headingSize}
                    onChange={(e) =>
                      handleCustomChange("fonts", "headingSize", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="xl">XL</option>
                    <option value="2xl">2XL</option>
                    <option value="3xl">3XL</option>
                    <option value="4xl">4XL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Body Size
                  </label>
                  <select
                    value={customConfig.fonts.bodySize}
                    onChange={(e) =>
                      handleCustomChange("fonts", "bodySize", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="sm">Small</option>
                    <option value="base">Base</option>
                    <option value="lg">Large</option>
                    <option value="xl">XL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Spacing</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Section Spacing
                  </label>
                  <select
                    value={customConfig.spacing.section}
                    onChange={(e) =>
                      handleCustomChange("spacing", "section", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="4">Small (4)</option>
                    <option value="6">Medium (6)</option>
                    <option value="8">Large (8)</option>
                    <option value="10">Extra Large (10)</option>
                    <option value="12">Huge (12)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Item Spacing
                  </label>
                  <select
                    value={customConfig.spacing.item}
                    onChange={(e) =>
                      handleCustomChange("spacing", "item", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="2">Small (2)</option>
                    <option value="4">Medium (4)</option>
                    <option value="6">Large (6)</option>
                    <option value="8">Extra Large (8)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Container Padding
                  </label>
                  <select
                    value={customConfig.spacing.padding}
                    onChange={(e) =>
                      handleCustomChange("spacing", "padding", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="4">Small (4)</option>
                    <option value="6">Medium (6)</option>
                    <option value="8">Large (8)</option>
                    <option value="10">Extra Large (10)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Corner Radius */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Corner Radius
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Section Corners
                  </label>
                  <select
                    value={customConfig.corners.sections}
                    onChange={(e) =>
                      handleCustomChange("corners", "sections", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                    <option value="2xl">Huge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Item Corners
                  </label>
                  <select
                    value={customConfig.corners.items}
                    onChange={(e) =>
                      handleCustomChange("corners", "items", e.target.value)
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                    <option value="2xl">Huge</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Item Images
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image Size
                  </label>
                  <select
                    value={customConfig.images?.size || "md"}
                    onChange={(e) =>
                      handleCustomChange(
                        "images" as any,
                        "size",
                        e.target.value
                      )
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image Shape
                  </label>
                  <select
                    value={customConfig.images?.shape || "rounded"}
                    onChange={(e) =>
                      handleCustomChange(
                        "images" as any,
                        "shape",
                        e.target.value
                      )
                    }
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="square">Square</option>
                    <option value="circle">Circle</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Controls the size and shape of images displayed next to each
                menu item.
              </p>
            </div>

            {/* Reset to Preset */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">
                Reset to Preset
              </h4>
              <div className="flex flex-wrap gap-2">
                {THEME_PRESETS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setCustomConfig(preset.config);
                      onThemeChange(preset.config);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Reset to {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
