import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { AppToaster } from "@/app/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menuop",
  description: "Beautiful digital menus",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    other: [
      { url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  themeColor: "#1F8349",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&family=Georgia:wght@400;700&family=Playfair+Display:wght@400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&family=Crimson+Text:wght@400;600;700&family=Merriweather:wght@400;700&family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
