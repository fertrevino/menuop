"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMenu } from "@/hooks/useMenu";
import ImageInput from "@/app/components/ImageInput";
import { getBestImageRecommendation } from "@/lib/services/imageRecommendation";
import {
  CURRENCY_OPTIONS,
  POPULAR_CURRENCIES,
  getCurrencySymbol,
} from "@/lib/utils/currency";

interface DevMenuData {
  name: string;
  restaurant_name: string;
  description?: string;
  currency?: string;
  sections: {
    name: string;
    description?: string;
    items: {
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      is_available?: boolean;
    }[];
  }[];
}

export default function CreateMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);

  const {
    menuFormData,
    saving,
    error,
    hasUnsavedChanges,
    saveMenu,
    updateMenuField,
    addSection,
    updateSection,
    deleteSection,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    clearError,
  } = useMenu();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Warn user before leaving the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleBackNavigation = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to leave without saving?"
      );
      if (!confirmed) return;
    }
    router.push("/dashboard");
  };

  const resetForm = () => {
    // Reset form logic can be added here if needed
  };

  const handleSaveMenu = async () => {
    if (!menuFormData.name.trim() || !menuFormData.restaurant_name.trim()) {
      alert("Please fill in both menu name and restaurant name");
      return;
    }

    try {
      const savedMenu = await saveMenu();
      if (savedMenu) {
        alert("Menu saved successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleJsonImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      setImportMessage({ type: "error", content: "Please enter JSON data" });
      return;
    }

    setIsSubmitting(true);
    setImportMessage(null);

    try {
      // Validate JSON
      const menuData: DevMenuData = JSON.parse(jsonInput);

      // Basic validation
      if (!menuData.name || !menuData.restaurant_name || !menuData.sections) {
        throw new Error(
          "Invalid menu structure. Required fields: name, restaurant_name, sections"
        );
      }

      // Submit to API
      const response = await fetch("/api/menus/developer-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(menuData),
      });

      const result = await response.json();

      if (response.ok) {
        setImportMessage({
          type: "success",
          content: `Menu "${result.menu.name}" created successfully!`,
        });
        setJsonInput("");
        // Redirect to view menus after successful import
        setTimeout(() => {
          router.push("/dashboard/view-menus");
        }, 2000);
      } else {
        setImportMessage({
          type: "error",
          content: result.error || "Failed to create menu",
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        setImportMessage({
          type: "error",
          content: "Invalid JSON format. Please check your syntax.",
        });
      } else {
        setImportMessage({
          type: "error",
          content:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExampleData = () => {
    const exampleData: DevMenuData = {
      name: "Lunch Special",
      restaurant_name: "Mario's Pizzeria",
      description: "Our delicious lunch offerings",
      currency: "USD",
      sections: [
        {
          name: "Appetizers",
          description: "Start your meal right",
          items: [
            {
              name: "Garlic Bread",
              description: "Fresh baked bread with garlic and herbs",
              price: 8.99,
              image_url: "",
              is_available: true,
            },
            {
              name: "Caesar Salad",
              description: "Crisp romaine with parmesan and croutons",
              price: 12.99,
              image_url: "",
              is_available: true,
            },
          ],
        },
        {
          name: "Main Courses",
          description: "Hearty and satisfying",
          items: [
            {
              name: "Margherita Pizza",
              description: "Fresh mozzarella, tomato sauce, and basil",
              price: 18.99,
              image_url: "",
              is_available: true,
            },
            {
              name: "Chicken Parmesan",
              description: "Breaded chicken with marinara and mozzarella",
              price: 24.99,
              image_url: "",
              is_available: true,
            },
          ],
        },
      ],
    };
    setJsonInput(JSON.stringify(exampleData, null, 2));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentSection = menuFormData.sections[currentSectionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 flex items-center space-x-2">
              <button
                onClick={handleBackNavigation}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-700/50 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </button>
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#1F8349]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Create New Menu
              </h1>
            </div>

            {/* Right side elements */}
            <div className="flex items-center justify-end flex-1 space-x-4">
              {!isDeveloperMode && (
                <button
                  onClick={handleSaveMenu}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Menu"}
                </button>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsDeveloperMode(!isDeveloperMode);
                    setImportMessage(null);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isDeveloperMode ? "bg-[#1F8349]" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      isDeveloperMode ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs font-medium ${
                    isDeveloperMode ? "text-[#1F8349]" : "text-gray-400"
                  }`}
                >
                  Dev Mode
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && !isDeveloperMode && (
                <span className="text-yellow-400 text-sm">
                  • Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && !isDeveloperMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {isDeveloperMode ? (
        /* Developer Mode Interface */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700/50 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                🚀 Developer Mode - JSON Menu Import
              </h2>
              <p className="text-gray-300 mb-4">
                Quickly create menus by importing JSON data. Perfect for
                developers who want to programmatically create menus or import
                existing menu data.
              </p>

              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-yellow-400 font-medium mb-1">
                      Developer Feature
                    </h3>
                    <p className="text-yellow-200 text-sm">
                      Toggle back to standard mode to use the visual menu
                      builder, or use JSON import for rapid creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleJsonImport} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="json-input"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Menu JSON Data
                  </label>
                  <button
                    type="button"
                    onClick={loadExampleData}
                    className="text-sm text-[#1F8349] hover:text-[#2ea358] transition-colors"
                  >
                    Load Example
                  </button>
                </div>
                <textarea
                  id="json-input"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-96 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#1F8349] transition-colors resize-none"
                  placeholder="Paste your JSON menu data here..."
                  disabled={isSubmitting}
                />
              </div>

              {importMessage && (
                <div
                  className={`p-4 rounded-lg border ${
                    importMessage.type === "success"
                      ? "bg-green-900/20 border-green-700/50 text-green-300"
                      : "bg-red-900/20 border-red-700/50 text-red-300"
                  }`}
                >
                  <div className="flex items-start">
                    <svg
                      className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                        importMessage.type === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {importMessage.type === "success" ? (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <span className="text-sm">{importMessage.content}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !jsonInput.trim()}
                  className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? "Creating Menu..." : "Import Menu"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeveloperMode(false)}
                  className="border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Switch to Visual Builder
                </button>
              </div>
            </form>

            {/* JSON Structure Documentation */}
            <div className="mt-12 pt-8 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                Required JSON Structure
              </h3>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {`{
  "name": "Menu Name (required)",
  "restaurant_name": "Restaurant Name (required)",
  "description": "Optional description",
  "currency": "USD",
  "sections": [
    {
      "name": "Section Name (required)",
      "description": "Optional section description",
      "items": [
        {
          "name": "Item Name (required)",
          "description": "Optional item description",
          "price": 12.99,
          "image_url": "Optional image URL",
          "is_available": true
        }
      ]
    }
  ]
}`}
                </pre>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                <p>
                  <strong>Required fields:</strong> name, restaurant_name,
                  sections, section.name, item.name, item.price
                </p>
                <p>
                  <strong>Optional fields:</strong> description, currency
                  (defaults to USD), section.description, item.description,
                  item.image_url, item.is_available (defaults to true)
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Visual Builder Interface */

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Menu Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={menuFormData.restaurant_name}
                      onChange={(e) =>
                        updateMenuField("restaurant_name", e.target.value)
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Menu Name
                    </label>
                    <input
                      type="text"
                      value={menuFormData.name}
                      onChange={(e) => updateMenuField("name", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter menu name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={menuFormData.description || ""}
                      onChange={(e) =>
                        updateMenuField("description", e.target.value)
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter menu description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={menuFormData.currency || "USD"}
                      onChange={(e) =>
                        updateMenuField("currency", e.target.value)
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    >
                      <optgroup label="Popular Currencies">
                        {POPULAR_CURRENCIES.map((code) => {
                          const currency = CURRENCY_OPTIONS.find(
                            (c) => c.code === code
                          );
                          return currency ? (
                            <option key={code} value={code}>
                              {currency.code} ({currency.symbol}) -{" "}
                              {currency.name}
                            </option>
                          ) : null;
                        })}
                      </optgroup>
                      <optgroup label="All Currencies">
                        {CURRENCY_OPTIONS.filter(
                          (c) => !POPULAR_CURRENCIES.includes(c.code)
                        ).map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} ({currency.symbol}) -{" "}
                            {currency.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Sections</h3>
                  <button
                    onClick={addSection}
                    className="text-[#1F8349] hover:text-[#2ea358] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      ></path>
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  {menuFormData.sections.map((section, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSectionIndex === index
                          ? "bg-[#1F8349]/20 border border-[#1F8349]/50"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => setCurrentSectionIndex(index)}
                    >
                      <span className="text-white font-medium">
                        {section.name}
                      </span>
                      {menuFormData.sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSection(index);
                            if (currentSectionIndex >= index) {
                              setCurrentSectionIndex(
                                Math.max(0, currentSectionIndex - 1)
                              );
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            ></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentSection && (
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <input
                      type="text"
                      value={currentSection.name}
                      onChange={(e) =>
                        updateSection(
                          currentSectionIndex,
                          "name",
                          e.target.value
                        )
                      }
                      className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                    />
                    <button
                      onClick={() => addMenuItem(currentSectionIndex)}
                      className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
                    >
                      Add Item
                    </button>
                  </div>

                  {/* Section Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Section Description (Optional)
                    </label>
                    <textarea
                      value={currentSection.description || ""}
                      onChange={(e) =>
                        updateSection(
                          currentSectionIndex,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Section description"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-4">
                    {currentSection.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Item Name
                            </label>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                updateMenuItem(
                                  currentSectionIndex,
                                  itemIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                              placeholder="Item name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Price (
                              {getCurrencySymbol(
                                menuFormData.currency || "USD"
                              )}
                              )
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                updateMenuItem(
                                  currentSectionIndex,
                                  itemIndex,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() =>
                                deleteMenuItem(currentSectionIndex, itemIndex)
                              }
                              className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={item.description || ""}
                            onChange={(e) =>
                              updateMenuItem(
                                currentSectionIndex,
                                itemIndex,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                            placeholder="Item description"
                            rows={2}
                          />
                        </div>
                        <ImageInput
                          value={item.image_url || ""}
                          onChange={(url) =>
                            updateMenuItem(
                              currentSectionIndex,
                              itemIndex,
                              "image_url",
                              url
                            )
                          }
                          itemName={item.name}
                          className="mt-4"
                        />
                        <div className="mt-4 flex items-center">
                          <input
                            type="checkbox"
                            id={`available-${itemIndex}`}
                            checked={item.is_available ?? true}
                            onChange={(e) =>
                              updateMenuItem(
                                currentSectionIndex,
                                itemIndex,
                                "is_available",
                                e.target.checked
                              )
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor={`available-${itemIndex}`}
                            className="text-sm text-gray-300"
                          >
                            Available for ordering
                          </label>
                        </div>
                      </div>
                    ))}

                    {currentSection.items.length === 0 && (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            ></path>
                          </svg>
                        </div>
                        <p className="text-gray-400 text-lg mb-4">
                          No items in this section yet
                        </p>
                        <button
                          onClick={() => addMenuItem(currentSectionIndex)}
                          className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
                        >
                          Add Your First Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
