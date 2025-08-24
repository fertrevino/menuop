"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useMenu } from "@/hooks/useMenu";

interface EditMenuProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditMenu({ params }: EditMenuProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSaveMenu = async () => {
    if (!menuFormData.name.trim() || !menuFormData.restaurant_name.trim()) {
      alert("Please fill in both menu name and restaurant name");
      return;
    }

    try {
      const savedMenu = await saveMenu();
      if (savedMenu) {
        alert("Menu updated successfully!");
        router.push("/dashboard/view-menus");
      }
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        router.push("/dashboard/view-menus");
      }
    } else {
      router.push("/dashboard/view-menus");
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
            This menu may have been deleted or you don't have permission to edit
            it.
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  ></path>
                </svg>
              </button>
              <h1 className="text-xl font-bold text-white">Edit Menu</h1>
              {hasUnsavedChanges && (
                <span className="text-yellow-400 text-sm">
                  • Unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={resetForm}
                className="text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSaveMenu}
                disabled={saving}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
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
              </div>
            </div>

            {/* Menu Status */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Status</h3>
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
                      updateSection(currentSectionIndex, "name", e.target.value)
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
                            Price ($)
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
    </div>
  );
}
