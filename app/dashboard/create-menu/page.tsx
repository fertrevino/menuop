"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export default function CreateMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [menuName, setMenuName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [sections, setSections] = useState<MenuSection[]>([
    {
      id: "1",
      name: "Appetizers",
      items: [],
    },
  ]);
  const [currentSection, setCurrentSection] = useState<string>("1");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const addSection = () => {
    const newSection: MenuSection = {
      id: Date.now().toString(),
      name: "New Section",
      items: [],
    };
    setSections([...sections, newSection]);
    setCurrentSection(newSection.id);
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, name } : section
      )
    );
  };

  const deleteSection = (sectionId: string) => {
    if (sections.length > 1) {
      setSections(sections.filter((section) => section.id !== sectionId));
      if (currentSection === sectionId) {
        setCurrentSection(sections[0].id);
      }
    }
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      category: currentSection,
    };

    setSections(
      sections.map((section) =>
        section.id === currentSection
          ? { ...section, items: [...section.items, newItem] }
          : section
      )
    );
  };

  const updateMenuItem = (
    itemId: string,
    field: keyof MenuItem,
    value: string | number
  ) => {
    setSections(
      sections.map((section) => ({
        ...section,
        items: section.items.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        ),
      }))
    );
  };

  const deleteMenuItem = (itemId: string) => {
    setSections(
      sections.map((section) => ({
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      }))
    );
  };

  const handleSaveMenu = async () => {
    if (!menuName.trim() || !restaurantName.trim()) {
      alert("Please fill in both menu name and restaurant name");
      return;
    }

    setIsCreating(true);
    // TODO: Implement actual save functionality with Supabase
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Menu saved successfully!");
      router.push("/dashboard");
    } catch (error) {
      alert("Error saving menu. Please try again.");
    } finally {
      setIsCreating(false);
    }
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

  const currentSectionData = sections.find(
    (section) => section.id === currentSection
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-300 hover:text-white transition-colors"
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
              <h1 className="text-xl font-bold text-white">Create New Menu</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSaveMenu}
                disabled={isCreating}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
              >
                {isCreating ? "Saving..." : "Save Menu"}
              </button>
            </div>
          </div>
        </div>
      </nav>

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
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
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
                    value={menuName}
                    onChange={(e) => setMenuName(e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    placeholder="Enter menu name"
                  />
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
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSection === section.id
                        ? "bg-[#1F8349]/20 border border-[#1F8349]/50"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setCurrentSection(section.id)}
                  >
                    <span className="text-white font-medium">
                      {section.name}
                    </span>
                    {sections.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
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
            {currentSectionData && (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <input
                    type="text"
                    value={currentSectionData.name}
                    onChange={(e) =>
                      updateSectionName(currentSection, e.target.value)
                    }
                    className="text-2xl font-bold text-white bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  />
                  <button
                    onClick={addMenuItem}
                    className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {currentSectionData.items.map((item) => (
                    <div
                      key={item.id}
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
                              updateMenuItem(item.id, "name", e.target.value)
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
                                item.id,
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
                            onClick={() => deleteMenuItem(item.id)}
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
                          value={item.description}
                          onChange={(e) =>
                            updateMenuItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                          placeholder="Item description"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {currentSectionData.items.length === 0 && (
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
                        onClick={addMenuItem}
                        className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
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
