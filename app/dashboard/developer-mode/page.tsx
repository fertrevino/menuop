"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DevMenuData {
  name: string;
  restaurant_name: string;
  description?: string;
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

export default function DeveloperMode() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const exampleData: DevMenuData = {
    name: "Lunch Special",
    restaurant_name: "Mario's Pizzeria",
    description: "Our delicious lunch offerings",
    sections: [
      {
        name: "Appetizers",
        description: "Start your meal right",
        items: [
          {
            name: "Garlic Bread",
            description: "Fresh baked bread with garlic and herbs",
            price: 8.99,
            is_available: true,
          },
          {
            name: "Caesar Salad",
            description: "Crisp romaine with parmesan and croutons",
            price: 12.99,
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
            is_available: true,
          },
          {
            name: "Chicken Parmesan",
            description: "Breaded chicken with marinara and mozzarella",
            price: 24.99,
            is_available: true,
          },
        ],
      },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jsonInput.trim()) {
      setMessage({ type: "error", content: "Please enter JSON data" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Validate JSON
      const menuData = JSON.parse(jsonInput);

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
        setMessage({
          type: "success",
          content: `Menu "${result.menu.name}" created successfully! ID: ${result.menu.id}`,
        });
        setJsonInput("");
      } else {
        setMessage({
          type: "error",
          content: result.error || "Failed to create menu",
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        setMessage({
          type: "error",
          content: "Invalid JSON format. Please check your syntax.",
        });
      } else {
        setMessage({
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

  const loadExample = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
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
              </Link>
              <h1 className="text-xl font-semibold text-white">
                Developer Mode
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

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
                    This is a developer-focused feature for rapid menu creation.
                    Ensure your JSON follows the required structure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onClick={loadExample}
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

            {message && (
              <div
                className={`p-4 rounded-lg border ${
                  message.type === "success"
                    ? "bg-green-900/20 border-green-700/50 text-green-300"
                    : "bg-red-900/20 border-red-700/50 text-red-300"
                }`}
              >
                <div className="flex items-start">
                  <svg
                    className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                      message.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {message.type === "success" ? (
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
                  <span className="text-sm">{message.content}</span>
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

              <Link
                href="/dashboard/view-menus"
                className="border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 text-center"
              >
                View My Menus
              </Link>
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
                <strong>Optional fields:</strong> description,
                section.description, item.description, item.image_url,
                item.is_available (defaults to true)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
