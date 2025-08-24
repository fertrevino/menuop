"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface EditMenuProps {
  params: {
    id: string;
  };
}

export default function EditMenu({ params }: EditMenuProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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
              <button
                onClick={() => router.push("/dashboard/view-menus")}
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
              <h1 className="text-xl font-bold text-white">Edit Menu</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#1F8349]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Edit Menu Feature
          </h2>
          <p className="text-gray-400 mb-6">
            The edit menu functionality is coming soon! For now, you can create
            new menus and view your existing ones.
          </p>
          <p className="text-sm text-gray-500 mb-6">Menu ID: {params.id}</p>
          <div className="space-x-4">
            <button
              onClick={() => router.push("/dashboard/view-menus")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Back to Menus
            </button>
            <button
              onClick={() => router.push("/dashboard/create-menu")}
              className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
            >
              Create New Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
