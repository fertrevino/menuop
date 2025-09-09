"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { toast } from "sonner";
import { useMenu } from "@/hooks/useMenu";
import ThemeSelector from "@/app/components/ThemeSelector";
import ThemePreview from "@/app/components/ThemePreview";
import ImageInput from "@/app/components/ImageInput";
import { MenuThemeConfig, THEME_PRESETS } from "@/lib/types/theme";
import {
  CURRENCY_OPTIONS,
  POPULAR_CURRENCIES,
  getCurrencySymbol,
} from "@/lib/utils/currency";

interface EditMenuProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMenu({ params }: EditMenuProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"content" | "theme">("content");
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const [cachedJson, setCachedJson] = useState("");
  const [copied, setCopied] = useState(false);

  // Unwrap the params Promise using React.use()
  const { id } = use(params);

  const {
    menu,
    menuFormData,
    loading: menuLoading,
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
    resetForm,
    clearError,
  } = useMenu(id);

  // Surface errors via toast instead of only a top banner
  useEffect(() => {
    if (error) {
      toast.error("Menu error", { description: error });
    }
  }, [error]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSaveMenu = async () => {
    if (!menuFormData.name.trim() || !menuFormData.restaurant_name.trim()) {
      toast.error("Missing required fields", {
        description: "Fill in both menu name and restaurant name.",
      });
      return;
    }

    try {
      const result = await saveMenu();
      if (result) {
        toast.success("Menu updated", {
          description: "Your changes have been saved.",
        });
      }
    } catch (e) {
      toast.error("Failed to save menu", {
        description: "Please review changes and try again.",
      });
    }
  };

  const handleThemeChange = (newTheme: MenuThemeConfig) => {
    updateMenuField("theme_config", newTheme);
  };

  // Developer Mode types and helpers
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

  const loadFromCurrentMenu = () => {
    if (!menuFormData) return;
    const data: DevMenuData = {
      name: menuFormData.name,
      restaurant_name: menuFormData.restaurant_name,
      description: menuFormData.description,
      currency: menuFormData.currency || "USD",
      sections: menuFormData.sections.map((s) => ({
        name: s.name,
        description: s.description,
        items: s.items.map((i) => ({
          name: i.name,
          description: i.description,
          price: i.price,
          image_url: i.image_url,
          is_available: i.is_available ?? true,
        })),
      })),
    };
    const json = JSON.stringify(data, null, 2);
    setJsonInput(json);
    setCachedJson(json);
  };

  // Precompute JSON when the visual form changes to keep Dev Mode toggle instant
  useEffect(() => {
    if (!menuFormData) return;
    const generate = () => {
      try {
        const data: DevMenuData = {
          name: menuFormData.name,
          restaurant_name: menuFormData.restaurant_name,
          description: menuFormData.description,
          currency: menuFormData.currency || "USD",
          sections: menuFormData.sections.map((s) => ({
            name: s.name,
            description: s.description,
            items: s.items.map((i) => ({
              name: i.name,
              description: i.description,
              price: i.price,
              image_url: i.image_url,
              is_available: i.is_available ?? true,
            })),
          })),
        };
        setCachedJson(JSON.stringify(data, null, 2));
      } catch {
        // noop: keep previous cache on error
      }
    };

    // Prefer requestIdleCallback to avoid blocking the UI
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const win = window as Window & {
        requestIdleCallback?: (
          callback: (() => void) | IdleRequestCallback,
          options?: { timeout?: number }
        ) => number;
      };
      win.requestIdleCallback?.(generate, { timeout: 200 });
    } else {
      // Fallback: schedule after paint
      setTimeout(generate, 0);
    }
  }, [menuFormData]);

  const handleJsonUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      setImportMessage({ type: "error", content: "Please enter JSON data" });
      return;
    }

    setIsSubmitting(true);
    setImportMessage(null);

    try {
      const data: DevMenuData = JSON.parse(jsonInput);

      if (!data.name || !data.restaurant_name || !data.sections) {
        throw new Error(
          "Invalid menu structure. Required fields: name, restaurant_name, sections"
        );
      }

      // Build payload for existing PUT endpoint, preserving current theme_config
      const payload = {
        name: data.name,
        restaurant_name: data.restaurant_name,
        description: data.description ?? undefined,
        currency: data.currency || "USD",
        sections: data.sections.map((s) => ({
          name: s.name,
          description: s.description ?? undefined,
          items: s.items.map((i) => ({
            name: i.name,
            description: i.description ?? undefined,
            price: i.price,
            image_url: i.image_url ?? undefined,
            is_available: i.is_available ?? true,
          })),
        })),
        theme_config: menuFormData.theme_config || null,
      };

      const response = await fetch(`/api/menus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setImportMessage({
          type: "success",
          content: `Menu "${result.menu.name}" updated successfully!`,
        });
        // Optionally reload current form data from result by navigating back or staying
        // For now, switch back to visual builder after a short delay
        setTimeout(() => {
          setIsDeveloperMode(false);
          setImportMessage(null);
        }, 1500);
      } else {
        setImportMessage({
          type: "error",
          content: result.error || "Failed to update menu",
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

  const copyJsonToClipboard = async () => {
    if (!jsonInput) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonInput);
      } else {
        // Fallback for older browsers
        const ta = document.createElement("textarea");
        ta.value = jsonInput;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // No-op on failure; user can still manually select and copy
    }
  };

  if (loading || menuLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Menu not found</div>
          <p className="text-gray-400">
            This menu may have been deleted or you don&apos;t have permission to
            edit it.
          </p>
          <button
            onClick={() => router.push("/dashboard/view-menus")}
            className="mt-4 bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Back to Menus
          </button>
        </div>
      </div>
    );
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
                onClick={() => router.push("/dashboard")}
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
              <h1 className="text-xl font-bold text-white">Edit Menu</h1>
              {!isDeveloperMode && hasUnsavedChanges && (
                <span className="text-yellow-400 text-sm">
                  • Unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Keep Reset/Save visible; disable in Dev Mode to reduce confusion */}
              <button
                onClick={resetForm}
                disabled={isDeveloperMode}
                title={
                  isDeveloperMode
                    ? "Disabled in Dev Mode. Use Apply JSON Update instead."
                    : undefined
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDeveloperMode
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Reset
              </button>
              <button
                onClick={handleSaveMenu}
                disabled={saving || isDeveloperMode}
                title={
                  isDeveloperMode
                    ? "Disabled in Dev Mode. Use Apply JSON Update instead."
                    : undefined
                }
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer bg-gradient-to-r ${
                  saving || isDeveloperMode
                    ? "from-gray-600 to-gray-700 opacity-50 cursor-not-allowed"
                    : "from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {/* Dev Mode Toggle at the end */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const next = !isDeveloperMode;
                    setIsDeveloperMode(next);
                    setImportMessage(null);
                    if (next) {
                      // Use cached JSON for instant toggle; fallback to building immediately
                      if (cachedJson) {
                        setJsonInput(cachedJson);
                      } else {
                        loadFromCurrentMenu();
                      }
                    }
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
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
          </div>
        </div>
      </nav>

      {/* Persistent Error Banner (modern) */}
      {error && !isDeveloperMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="relative overflow-hidden rounded-lg border border-red-600/40 bg-gradient-to-br from-red-900/40 via-red-900/30 to-red-800/30 backdrop-blur-sm px-4 py-3 text-sm text-red-200 shadow-md">
            <div className="flex items-start gap-3 pr-6">
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 5c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
                />
              </svg>
              <div className="flex-1 leading-relaxed">
                <p className="font-medium text-red-300">Problem saving menu</p>
                <p className="mt-0.5 text-red-200/90">{error}</p>
                <p className="mt-2 text-xs text-red-300/70">
                  Fix the issue above and click{" "}
                  <span className="font-semibold">Save Changes</span> again.
                </p>
              </div>
              <button
                onClick={clearError}
                aria-label="Dismiss error"
                className="absolute top-2 right-2 rounded p-1 text-red-300/70 hover:text-red-100 hover:bg-red-800/40 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeveloperMode ? (
        /* Developer Mode Interface */
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl border border-gray-700/50 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                🚀 Developer Mode - JSON Update
              </h2>
              <p className="text-gray-300 mb-4">
                Update this menu by editing/importing JSON. Perfect for
                extending menus quickly as a developer.
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
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="text-yellow-400 font-medium mb-1">
                      Heads up
                    </h3>
                    <p className="text-yellow-200 text-sm">
                      When you apply a JSON update, the menu sections and items
                      will be replaced by the provided data. Theme is preserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleJsonUpdate} className="space-y-6">
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
                    onClick={copyJsonToClipboard}
                    disabled={!jsonInput}
                    className={`text-sm px-2 py-1 rounded transition-colors ${
                      jsonInput
                        ? "text-[#1F8349] hover:text-[#2ea358] cursor-pointer"
                        : "text-gray-500 cursor-not-allowed"
                    }`}
                    aria-label="Copy JSON"
                    title={copied ? "Copied!" : "Copy JSON"}
                  >
                    {copied ? "Copied" : "Copy"}
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
                  className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {isSubmitting ? "Updating Menu..." : "Apply JSON Update"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeveloperMode(false)}
                  className="border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Switch to Visual Builder
                </button>
              </div>

              {/* JSON Structure Documentation */}
              <div className="mt-12 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Required JSON Structure
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">{`{
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
}`}</pre>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tab Navigation */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "content"
                        ? "text-white bg-[#1F8349]"
                        : "text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    }`}
                  >
                    Content
                  </button>
                  <button
                    onClick={() => setActiveTab("theme")}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === "theme"
                        ? "text-white bg-[#1F8349]"
                        : "text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    }`}
                  >
                    Theme
                  </button>
                </div>
              </div>

              {activeTab === "content" && (
                <>
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
                          onChange={(e) =>
                            updateMenuField("name", e.target.value)
                          }
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

                  {/* Menu Status */}
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Status
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Published</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            menu.is_published
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {menu.is_published ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Created</span>
                        <span className="text-gray-400 text-sm">
                          {new Date(menu.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Updated</span>
                        <span className="text-gray-400 text-sm">
                          {new Date(menu.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Sections
                      </h3>
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
                </>
              )}

              {activeTab === "theme" && (
                <>
                  {/* Theme Preview */}
                  <ThemePreview
                    theme={menuFormData.theme_config || THEME_PRESETS[0].config}
                    restaurantName={menuFormData.restaurant_name}
                    menuName={menuFormData.name}
                  />
                </>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === "content" && currentSection && (
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
                      className="inline-flex items-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 active:scale-[.97]"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 5v14m7-7H5"
                        />
                      </svg>
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
                    {/* Top insertion zone */}
                    {currentSection.items.length > 0 && (
                      <div className="relative flex items-center my-2 group">
                        <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                        <button
                          onClick={() => addMenuItem(currentSectionIndex, -1)}
                          aria-label="Add item at top"
                          className="mx-2 p-1 text-[#1F8349] hover:text-white transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/40 rounded transform scale-75 group-hover:scale-100 will-change-transform cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                      </div>
                    )}
                    {currentSection.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
                        <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
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
                                value={item.price < 0 ? "" : item.price}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  if (raw === "") {
                                    updateMenuItem(
                                      currentSectionIndex,
                                      itemIndex,
                                      "price",
                                      -1
                                    );
                                    return;
                                  }
                                  const num = parseFloat(raw);
                                  updateMenuItem(
                                    currentSectionIndex,
                                    itemIndex,
                                    "price",
                                    isNaN(num) ? -1 : num
                                  );
                                }}
                                className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="flex items-center justify-end pt-6">
                              <button
                                aria-label="Delete item"
                                onClick={() =>
                                  deleteMenuItem(currentSectionIndex, itemIndex)
                                }
                                className="inline-flex items-center gap-2 text-red-500 hover:text-red-700 active:text-red-800 px-2 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/25 active:scale-[.97] cursor-pointer"
                              >
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Delete</span>
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
                            value={item.image_url}
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
                        {/* Separator with add button (between items) */}
                        {itemIndex < currentSection.items.length - 1 && (
                          <div className="relative flex items-center group">
                            <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                            <button
                              onClick={() =>
                                addMenuItem(currentSectionIndex, itemIndex)
                              }
                              aria-label="Add item here"
                              className="mx-2 p-1 text-[#1F8349] hover:text-white transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/40 rounded transform scale-75 group-hover:scale-100 will-change-transform cursor-pointer"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                            <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                          </div>
                        )}
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
                    {currentSection.items.length > 0 && (
                      <div className="relative flex items-center mt-6 group">
                        <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                        <button
                          onClick={() => addMenuItem(currentSectionIndex)}
                          aria-label="Add item at bottom"
                          className="mx-2 p-1.5 text-[#1F8349] hover:text-white transition-all duration-200 ease-out opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#1F8349]/40 rounded transform scale-75 group-hover:scale-100 will-change-transform cursor-pointer"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <div className="flex-1 h-px bg-gray-600 opacity-0 scale-x-50 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 transition-all duration-300 ease-out origin-center" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "theme" && (
                <div className="space-y-6">
                  <ThemeSelector
                    currentTheme={
                      menuFormData.theme_config || THEME_PRESETS[0].config
                    }
                    onThemeChange={handleThemeChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
