"use client";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-gray-700/70 bg-gray-850 bg-gradient-to-br from-gray-900/95 to-gray-800/95 shadow-2xl animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[#1F8349] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {description}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/60 hover:bg-gray-600/70 text-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500/40 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8349]/40 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed",
                variant === "danger"
                  ? "bg-red-600 hover:bg-red-500 text-white"
                  : "bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white"
              )}
            >
              {loading ? "Please wait..." : confirmText}
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fade-in 120ms ease-out;
        }
        .animate-scale-in {
          animation: scale-in 160ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
