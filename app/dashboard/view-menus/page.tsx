"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useUserMenus } from "@/hooks/useMenu";
import QRCodeManager from "@/app/components/QRCodeManager";

export default function ViewMenus() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMenuForQR, setSelectedMenuForQR] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const {
    menus,
    loading: menusLoading,
    error,
    deleteMenu,
    togglePublishMenu,
    pendingPublishIds,
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
      // Optimistically close QR modal immediately if unpublishing
      if (isPublished && selectedMenuForQR === menuId)
        setSelectedMenuForQR(null);
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

  // items_count is provided by the API (computed server-side). Fallback to 0 if missing.
  const getItemCount = (menu: { items_count?: number }) =>
    menu.items_count ?? 0;

  const filteredAndSortedMenus = useMemo(() => {
    let result = [...menus];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (menu) =>
          menu.name.toLowerCase().includes(query) ||
          menu.restaurant_name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "status":
        result.sort((a, b) => {
          if (a.is_published === b.is_published) return 0;
          return a.is_published ? -1 : 1;
        });
        break;
    }

    return result;
  }, [menus, searchQuery, sortBy]);

  if (loading || menusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-700/50 rounded animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg border border-gray-600/50 p-6 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-6 w-3/4 bg-gray-600/50 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-600/50 rounded"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-1/4 bg-gray-600/50 rounded"></div>
                    <div className="h-4 w-1/4 bg-gray-600/50 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
            <div className="flex-1 flex items-center space-x-2 min-w-0">
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
                <span className="hidden sm:inline">Dashboard</span>
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
              <h1 className="text-xl font-bold text-white flex items-center gap-2 truncate">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <span className="truncate">My Menus</span>
              </h1>
            </div>
            {/* Right side actions (desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard/create-menu")}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
              >
                Create New Menu
              </button>
            </div>

            {/* Mobile actions */}
            <div className="md:hidden">
              <details className="relative">
                <summary className="list-none cursor-pointer p-2 rounded-md hover:bg-gray-800/60 active:bg-gray-800/80 text-gray-300 hover:text-white select-none">
                  <span className="sr-only">Open menu</span>
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-700/50 bg-gray-900/95 backdrop-blur-md shadow-xl py-2 z-50">
                  <div className="px-4 py-2 text-xs text-gray-400">Actions</div>
                  <button
                    onClick={() => router.push("/dashboard/create-menu")}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/70 cursor-pointer"
                  >
                    Create New Menu
                  </button>
                </div>
              </details>
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
            <div className="flex flex-col space-y-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h2 className="text-3xl font-bold text-white">
                      Your Menus
                    </h2>
                    <div className="px-3 py-1 bg-gray-700/50 rounded-full text-gray-400 text-sm">
                      {menus.length} {menus.length === 1 ? "menu" : "menus"}
                    </div>
                  </div>
                  <p className="text-gray-400">
                    Manage and share your digital menus
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menus..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1F8349] focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-base border border-gray-600 rounded-lg bg-gray-800/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F8349] focus:border-transparent cursor-pointer transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="status">Status</option>
                  </select>

                  <button
                    className="p-2 text-gray-400 hover:text-white bg-gray-800/50 border border-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1F8349] focus:border-transparent"
                    title="View as grid"
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
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="group bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#1F8349]/5 flex flex-col"
                >
                  {/* Menu Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <button
                            onClick={() => handleEditMenu(menu.id)}
                            className="text-left w-full text-xl font-semibold text-white mb-1 truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8349] hover:text-[#2ea358] cursor-pointer"
                            aria-label={menu.name}
                          >
                            {menu.name}
                          </button>
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {menu.restaurant_name}
                        </p>
                      </div>
                      {menu.is_published ? (
                        <div className="relative group/tooltip">
                          <button
                            onClick={() =>
                              handleTogglePublish(menu.id, menu.is_published)
                            }
                            className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={pendingPublishIds.has(menu.id)}
                            title="Unpublish Menu"
                            aria-label="Unpublish Menu"
                          >
                            {pendingPublishIds.has(menu.id)
                              ? "Updating…"
                              : "Published"}
                          </button>
                          <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-gray-200 opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                            Unpublish menu
                          </span>
                        </div>
                      ) : (
                        <div className="relative group/tooltip">
                          <button
                            onClick={() =>
                              handleTogglePublish(menu.id, menu.is_published)
                            }
                            className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={pendingPublishIds.has(menu.id)}
                            title="Publish Menu"
                            aria-label="Publish Menu"
                          >
                            {pendingPublishIds.has(menu.id)
                              ? "Updating…"
                              : "Not published"}
                          </button>
                          <span className="pointer-events-none absolute -top-8 right-0 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-gray-200 opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                            Publish menu
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{getItemCount(menu)} items</span>
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
                        {menu.is_published && (
                          <button
                            onClick={() => handleViewMenu(menu.id)}
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
                        )}

                        {/* Edit action removed; menu name is now clickable to edit */}
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2">
                        {/* QR Button + Helper Text */}
                        <div className="relative group/tooltip">
                          <button
                            onClick={() => setSelectedMenuForQR(menu.id)}
                            className="text-gray-300 hover:text-violet-400 transition-colors p-1.5 rounded-md hover:bg-gray-600/30 cursor-pointer"
                            title="Generate QR Code"
                            aria-label="Generate QR Code"
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
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-gray-200 opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                            Generate QR
                          </span>
                        </div>

                        {/* Publish/Unpublish Button + Helper Text */}
                        {/* Publish/unpublish is handled by the status chip; avoid duplicate action button */}

                        {/* Delete Button + Helper Text */}
                        <div className="relative group/tooltip">
                          <button
                            onClick={() => handleDeleteMenu(menu.id)}
                            className="text-gray-300 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-gray-600/30 cursor-pointer"
                            title="Delete Menu"
                            aria-label="Delete Menu"
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
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-gray-200 opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                            Delete
                          </span>
                        </div>
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
