"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
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
            <div className="flex items-center">
              <a
                href="/"
                className="text-2xl font-bold text-white hover:text-[#1F8349] transition-colors cursor-pointer"
              >
                Menuop
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome, {user.user_metadata?.full_name || user.email}!
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white font-medium cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to your Dashboard!
          </h1>
          <p className="text-xl text-gray-300">
            Start creating your beautiful digital menus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-[#1F8349]"
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
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Create New Menu
            </h3>
            <p className="text-gray-300 mb-6">
              Start building your first digital menu with our easy-to-use
              editor.
            </p>
            <button
              onClick={() => router.push("/dashboard/create-menu")}
              className="w-full bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Create Menu
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-[#1F8349]"
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
            <h3 className="text-xl font-semibold text-white mb-4">My Menus</h3>
            <p className="text-gray-300 mb-6">
              View and manage all your existing digital menus.
            </p>
            <button
              onClick={() => router.push("/dashboard/view-menus")}
              className="w-full border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
            >
              View Menus
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6">
              <svg
                className="w-6 h-6 text-[#1F8349]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Settings</h3>
            <p className="text-gray-300 mb-6">
              Manage your account settings and preferences.
            </p>
            <button 
              onClick={() => router.push("/dashboard/settings")}
              className="w-full border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
