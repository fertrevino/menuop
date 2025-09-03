"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserMenus } from "@/hooks/useMenu";
import QRCodeManager from "@/app/components/QRCodeManager";

export default function ViewMenus() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMenuForQR, setSelectedMenuForQR] = useState<string | null>(
    null
  );
  const {
    menus,
    loading: menusLoading,
    error,
    deleteMenu,
    togglePublishMenu,
    clearError,
  } = useUserMenus();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleDeleteMenu = async (menuId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this menu? This action cannot be undone."
      )
    ) {
      try {
        await deleteMenu(menuId);
        alert("Menu deleted successfully!");
      } catch {
        // Error is already handled by the hook
      }
    }
  };

  const handleTogglePublish = async (menuId: string, isPublished: boolean) => {
    try {
      await togglePublishMenu(menuId, !isPublished);
      // If we're unpublishing and have the QR modal open for this menu, close it
      if (isPublished && selectedMenuForQR === menuId) {
        setSelectedMenuForQR(null);
      }
    } catch {
      // Error is already handled by the hook
    }
  };

  const handleEditMenu = (menuId: string) => {
    router.push(`/dashboard/edit-menu/${menuId}`);
  };

  const handleViewMenu = (menuId: string) => {
    window.open(`/menu/${menuId}`, "_blank");
  };

  const calculateItemCount = () => {
    // This is a placeholder since we don't have sections data in the menu list
    // In a real implementation, you might want to add this to the database query
    return 0;
  };

  if (loading || menusLoading) {
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
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-300 hover:text-white transition-color cursor-pointer"
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
              <h1 className="text-xl font-bold text-white">My Menus</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard/create-menu")}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
              >
                Create New Menu
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
        {menus.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-[#1F8349]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No menus yet</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
              Start creating your first digital menu to showcase your delicious
              offerings to customers.
            </p>
            <button
              onClick={() => router.push("/dashboard/create-menu")}
              className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Create Your First Menu
            </button>
          </div>
        ) : (
          // Menus grid
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Your Menus
                </h2>
                <p className="text-gray-400">
                  Manage and share your digital menus
                </p>
              </div>
              <div className="text-gray-400">
                {menus.length} {menus.length === 1 ? "menu" : "menus"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 flex flex-col"
                >
                  {/* Menu Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1 truncate">
                          {menu.name}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">
                          {menu.restaurant_name}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          menu.is_published
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {menu.is_published ? "Published" : "Draft"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{calculateItemCount()} items</span>
                      <span>
                        Created {new Date(menu.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-auto border-t border-gray-600/30">
                    <div className="px-6 py-3 flex items-center justify-between">
                      {/* Left Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleViewMenu(menu.id)}
                          className="text-gray-300 hover:text-sky-400 flex items-center gap-2 transition-colors px-2 py-1 rounded-md hover:bg-gray-600/30 cursor-pointer"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">View</span>
                        </button>

                        <button
                          onClick={(e) => handleEditMenu(menu.id)}
                          className="text-gray-300 hover:text-indigo-400 flex items-center gap-2 transition-colors px-2 py-1 rounded-md hover:bg-gray-600/30 cursor-pointer"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => setSelectedMenuForQR(menu.id)}
                          className="text-gray-300 hover:text-violet-400 transition-colors p-1.5 rounded-md hover:bg-gray-600/30 cursor-pointer"
                          title="Generate QR Code"
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
                              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={(e) =>
                            handleTogglePublish(menu.id, menu.is_published)
                          }
                          className={`transition-colors p-1.5 rounded-md hover:bg-gray-600/30 cursor-pointer ${
                            menu.is_published
                              ? "text-amber-400 hover:text-amber-300"
                              : "text-gray-300 hover:text-emerald-400"
                          }`}
                          title={
                            menu.is_published
                              ? "Unpublish Menu"
                              : "Publish Menu"
                          }
                        >
                          {menu.is_published ? (
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
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                              />
                            </svg>
                          ) : (
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={(e) => handleDeleteMenu(menu.id)}
                          className="text-gray-300 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-gray-600/30 cursor-pointer"
                          title="Delete Menu"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedMenuForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  QR Code Management
                </h2>
                <button
                  onClick={() => setSelectedMenuForQR(null)}
                  className="text-gray-400 hover:text-white transition-colors"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {(() => {
                const selectedMenu = menus.find(
                  (m) => m.id === selectedMenuForQR
                );
                return selectedMenu ? (
                  <QRCodeManager
                    menuId={selectedMenu.id}
                    menuSlug={selectedMenu.slug || undefined}
                    isPublished={selectedMenu.is_published}
                    restaurantName={selectedMenu.restaurant_name}
                    menuName={selectedMenu.name}
                  />
                ) : null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
