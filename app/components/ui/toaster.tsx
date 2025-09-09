"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      theme="dark"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "border border-gray-700 bg-gray-800 text-white shadow-lg backdrop-blur-sm",
          success: "bg-green-600/20 border-green-500",
          error: "bg-red-600/20 border-red-500",
          warning: "bg-yellow-600/20 border-yellow-500",
        },
      }}
    />
  );
}
