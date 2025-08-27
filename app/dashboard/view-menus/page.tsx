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
                  className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1"
                >
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

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                      <span>{calculateItemCount()} items</span>
                      <span>
                        Created {new Date(menu.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditMenu(menu.id)}
                          className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewMenu(menu.id)}
                          className="flex-1 border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-2 px-3 rounded-lg text-sm font-medium transition-all"
                        >
                          View
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleTogglePublish(menu.id, menu.is_published)
                          }
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            menu.is_published
                              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                              : "bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white"
                          }`}
                        >
                          {menu.is_published ? "Unpublish" : "Publish"}
                        </button>
                        {menu.is_published && (
                          <button
                            onClick={() => setSelectedMenuForQR(menu.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                          >
                            QR Code
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
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
