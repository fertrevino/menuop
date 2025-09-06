"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignInModal from "./components/SignInModal";
import { useAuth } from "@/hooks/useAuth";

// Interactive Preview Component
function InteractivePreview() {
  const [selectedColor, setSelectedColor] = useState("#1F8349");
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [selectedLayout, setSelectedLayout] = useState("rounded-sm");

  const colorOptions = [
    { name: "Forest Green", value: "#1F8349" },
    { name: "Ocean Blue", value: "#0066CC" },
    { name: "Sunset Orange", value: "#FF6B35" },
    { name: "Royal Purple", value: "#8B5CF6" },
  ];

  const fontOptions = [
    { name: "Inter", label: "Inter • Clean & Modern" },
    { name: "Playfair", label: "Playfair • Elegant" },
    { name: "Roboto", label: "Roboto • Professional" },
  ];

  const layoutOptions = [
    { name: "rounded-sm", label: "Minimal" },
    { name: "rounded-md", label: "Balanced" },
    { name: "rounded-lg", label: "Rounded" },
  ];

  return (
    <div className="space-y-4">
      {/* Color Palette Section */}
      <div
        className="bg-gray-700 p-4 rounded-lg border border-gray-600/30 transition-all duration-300 group"
        style={{ borderColor: `${selectedColor}50` }}
        onMouseEnter={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}80`;
        }}
        onMouseLeave={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}50`;
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
            Color Palette
          </span>
          <div className="flex space-x-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 group-hover:scale-110 ${
                  selectedColor === color.value
                    ? "ring-2 ring-white scale-110"
                    : ""
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <div className="text-white font-semibold mb-2 transition-colors duration-300">
          Restaurant Name
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm transform group-hover:-translate-y-1 transition-all duration-300">
            <span className="text-gray-300 group-hover:text-white transition-colors">
              Menu Item
            </span>
            <span
              className="font-semibold group-hover:scale-105 transition-all duration-300"
              style={{ color: selectedColor }}
            >
              $12.99
            </span>
          </div>
          <div className="flex justify-between text-sm transform group-hover:-translate-y-1 transition-all duration-300 delay-75">
            <span className="text-gray-300 group-hover:text-white transition-colors">
              Another Item
            </span>
            <span
              className="font-semibold group-hover:scale-105 transition-all duration-300"
              style={{ color: selectedColor }}
            >
              $8.50
            </span>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div
        className="bg-gray-700 p-4 rounded-lg border border-gray-600/30 transition-all duration-300 group"
        style={{ borderColor: `${selectedColor}50` }}
        onMouseEnter={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}80`;
        }}
        onMouseLeave={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}50`;
        }}
      >
        <div className="text-gray-300 text-sm mb-2 group-hover:text-white transition-colors">
          Typography
        </div>
        <div className="space-y-1 text-sm">
          {fontOptions.map((font) => (
            <button
              key={font.name}
              onClick={() => setSelectedFont(font.name)}
              className={`block w-full text-left transition-all duration-300 origin-left hover:scale-105 group-hover:scale-105 ${
                selectedFont === font.name
                  ? "text-white font-bold"
                  : "text-gray-300 group-hover:text-white"
              } ${font.name === "Playfair" ? "font-serif" : ""}`}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Style Section */}
      <div
        className="bg-gray-700 p-4 rounded-lg border border-gray-600/30 transition-all duration-300 group"
        style={{ borderColor: `${selectedColor}50` }}
        onMouseEnter={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}80`;
        }}
        onMouseLeave={(e) => {
          (
            e.currentTarget as HTMLElement
          ).style.borderColor = `${selectedColor}50`;
        }}
      >
        <div className="text-gray-300 text-sm mb-2 group-hover:text-white transition-colors">
          Layout Style
        </div>
        <div className="grid grid-cols-3 gap-2">
          {layoutOptions.map((layout, index) => (
            <button
              key={layout.name}
              onClick={() => setSelectedLayout(layout.name)}
              className={`h-6 transition-all duration-300 cursor-pointer hover:scale-105 group-hover:scale-105 ${
                layout.name
              } ${selectedLayout === layout.name ? "scale-105" : ""}`}
              style={{
                backgroundColor:
                  selectedLayout === layout.name ? selectedColor : "#4B5563",
                transitionDelay: `${index * 75}ms`,
              }}
              onMouseEnter={(e) => {
                if (selectedLayout !== layout.name) {
                  (e.target as HTMLElement).style.backgroundColor =
                    selectedColor;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLayout !== layout.name) {
                  (e.target as HTMLElement).style.backgroundColor = "#4B5563";
                }
              }}
              title={layout.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const openSignInModal = () => setIsSignInModalOpen(true);
  const closeSignInModal = () => setIsSignInModalOpen(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of the sticky navigation (h-16 = 64px)
      const elementPosition = element.offsetTop - navHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard");
    } else {
      openSignInModal();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a
                href="#"
                className="text-2xl font-bold text-white hover:text-[#1F8349] transition-colors cursor-pointer"
              >
                Menuop
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!loading &&
                (user ? (
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
                ) : (
                  <button
                    onClick={openSignInModal}
                    className="text-gray-300 hover:text-white font-medium cursor-pointer transition-colors"
                  >
                    Sign In
                  </button>
                ))}
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                {user ? "Dashboard" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1F8349]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Create Beautiful
              <span className="text-[#1F8349] block">Digital Menus</span>
              for Your Restaurant
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your food business with stunning digital menus. Easy to
              create, simple to manage, and designed to increase your sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </button>
              <button className="border border-gray-600 hover:border-[#1F8349] bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer backdrop-blur-sm">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative"
      >
        {/* Background accents */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#1F8349]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our platform provides all the tools you need to create, manage,
              and share your digital menus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* First row - 4 features */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Easy Menu Creation
              </h3>
              <p className="text-gray-300">
                Build stunning menus in minutes with our intuitive drag-and-drop
                editor. No technical skills required.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                AI Image Generation
              </h3>
              <p className="text-gray-300">
                Generate stunning food images instantly with AI. Perfect visuals
                for every dish, even without professional photography.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Instant Publishing
              </h3>
              <p className="text-gray-300">
                Publish your menu instantly and get a shareable link. Update
                prices and items in real-time.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Menu Analytics Dashboard
              </h3>
              <p className="text-gray-300">
                Track menu views and customer engagement with detailed
                analytics. Export comprehensive reports to grow your business.
              </p>
            </div>
          </div>

          {/* Second row - 4 features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h4M4 8h4m0 0V4m0 4h.01M16 16h.01"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                QR Code Generation
              </h3>
              <p className="text-gray-300">
                Auto-generate branded QR codes for each menu. Track scans and
                analytics with downloadable codes in multiple formats.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Theme Templates
              </h3>
              <p className="text-gray-300">
                Choose from 18+ professionally designed themes. Italian
                Trattoria, Japanese Zen, French Bistro, and more.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Advanced Customization
              </h3>
              <p className="text-gray-300">
                Customize colors, fonts, spacing, and layouts. Create your
                unique brand experience with powerful design tools.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1F8349]/20 to-[#2ea358]/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-[#1F8349] group-hover:text-[#2ea358] transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Mobile Optimized
              </h3>
              <p className="text-gray-300">
                Your menus look perfect on all devices. Customers can easily
                browse and order from any smartphone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Templates Showcase Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1F8349]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Beautiful Theme Templates
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose from 18+ professionally designed themes that match your
              restaurant&apos;s personality. From elegant French bistros to
              vibrant Mexican cantinas, we have the perfect look for your
              business.
            </p>
          </div>

          {/* Theme Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600/50 h-full">
                <div className="w-12 h-12 bg-[#1F8349]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Light & Elegant
                </h3>
                <p className="text-gray-300 text-sm">
                  Clean, sophisticated designs perfect for upscale dining
                  establishments
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600/50 h-full">
                <div className="w-12 h-12 bg-[#1F8349]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Dark & Modern
                </h3>
                <p className="text-gray-300 text-sm">
                  Sleek contemporary themes ideal for trendy restaurants and
                  bars
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-6 rounded-xl border border-gray-600/50 h-full">
                <div className="w-12 h-12 bg-[#1F8349]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Cultural Themes
                </h3>
                <p className="text-gray-300 text-sm">
                  Culturally-inspired designs that celebrate global cuisines
                </p>
              </div>
            </div>
          </div>

          {/* Featured Theme Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Italian Trattoria Theme */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-[#8b4513] to-[#cd853f] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border-2 border-transparent hover:border-[#8b4513]/50">
                <div className="bg-[#fdf6e3] p-4 rounded-lg mb-4">
                  <div className="text-[#8b4513] font-bold text-lg mb-2">
                    Nonna&apos;s Kitchen
                  </div>
                  <div className="text-[#3c2414] text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Margherita Pizza</span>
                      <span className="text-[#dc143c] font-semibold">$16</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pasta Carbonara</span>
                      <span className="text-[#dc143c] font-semibold">$14</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-center">
                  Italian Trattoria
                </h3>
              </div>
            </div>

            {/* Japanese Zen Theme */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-[#2d5016] to-[#4a7c59] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1 border-2 border-transparent hover:border-[#2d5016]/50">
                <div className="bg-[#f7f5f3] p-4 rounded-lg mb-4">
                  <div className="text-[#2d5016] font-bold text-lg mb-2">
                    Zen Garden
                  </div>
                  <div className="text-[#1a1a1a] text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Salmon Sashimi</span>
                      <span className="text-[#d4af37] font-semibold">
                        ¥1800
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Miso Ramen</span>
                      <span className="text-[#d4af37] font-semibold">
                        ¥1200
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-center">
                  Japanese Zen
                </h3>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">
              + 16 more themes including Mexican Cantina, French Bistro, Korean
              Modern, Spanish Tapas, and Nordic Minimalist
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {user ? "Explore Themes in Dashboard" : "Try All Themes Free"}
            </button>
          </div>
        </div>
      </section>

      {/* Customization Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        {/* Background accents */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#1F8349]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Powerful Customization Tools
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Create a truly unique menu experience with our advanced
                customization features. Every aspect of your menu can be
                tailored to match your brand perfectly.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1F8349]/30 to-[#2ea358]/20 rounded-lg flex items-center justify-center">
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
                          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Color Customization
                    </h3>
                    <p className="text-gray-300">
                      Choose from unlimited color combinations. Set primary,
                      secondary, background, and accent colors to match your
                      brand identity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1F8349]/30 to-[#2ea358]/20 rounded-lg flex items-center justify-center">
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
                          d="M4 6h16M4 12h16M4 18h7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Typography Control
                    </h3>
                    <p className="text-gray-300">
                      Select from 20+ professional fonts including Inter,
                      Playfair Display, and culture-specific options like Noto
                      Sans JP.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1F8349]/30 to-[#2ea358]/20 rounded-lg flex items-center justify-center">
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
                          d="M4 8V4a1 1 0 011-1h4m0 0V2a1 1 0 011-1h4a1 1 0 011 1v1m4 0h4a1 1 0 011 1v4m0 4v4a1 1 0 01-1 1h-4m0 0v1a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1m-4 0H4a1 1 0 01-1-1v-4"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Layout & Spacing
                    </h3>
                    <p className="text-gray-300">
                      Adjust section spacing, item padding, and corner radius to
                      create the perfect visual hierarchy for your menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1F8349]/30 to-[#2ea358]/20 rounded-lg flex items-center justify-center">
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
                          d="M12 3v1m0 12v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Multi-Currency Support
                    </h3>
                    <p className="text-gray-300">
                      Display prices in 150+ currencies with proper formatting.
                      Perfect for international restaurants and tourism.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl border border-gray-600 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                  Live Preview
                </h3>

                {/* Interactive Demo State */}
                <InteractivePreview />

                {/* Customization indicator */}
                <div className="mt-6 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">
                    Click colors, fonts, and layouts to customize
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="about" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Boost your restaurant&apos;s success
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Join thousands of restaurant owners who&apos;ve transformed
                their business with digital menus.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#1F8349] rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Save Time & Money
                    </h3>
                    <p className="text-gray-300">
                      No more printing costs or outdated menus. Update instantly
                      and save thousands.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#1F8349] rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Increase Sales
                    </h3>
                    <p className="text-gray-300">
                      Beautiful visuals and smart recommendations help customers
                      order more.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-[#1F8349] rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-white">
                      Better Customer Experience
                    </h3>
                    <p className="text-gray-300">
                      Fast loading, easy navigation, and contactless ordering
                      for modern diners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl border border-gray-600">
                <div className="bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-600">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Sample Digital Menu
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-200">Classic Burger</span>
                      <span className="font-semibold text-[#1F8349]">
                        $12.99
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-200">Caesar Salad</span>
                      <span className="font-semibold text-[#1F8349]">
                        $9.99
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-600">
                      <span className="text-gray-200">Margherita Pizza</span>
                      <span className="font-semibold text-[#1F8349]">
                        $15.99
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-200">Craft Beer</span>
                      <span className="font-semibold text-[#1F8349]">
                        $5.99
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="pricing"
        className="py-20 bg-gradient-to-br from-[#1F8349] via-[#2ea358] to-[#1F8349] relative overflow-hidden"
      >
        {/* Background accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/3 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your restaurant&apos;s success?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of restaurants already using Menuop to create
            beautiful digital menus.
          </p>
          <button className="bg-white text-[#1F8349] hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 cursor-pointer">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold mb-4">Menuop</div>
              <p className="text-gray-400 mb-4 max-w-md">
                The easiest way to create and manage digital menus for your food
                business.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Templates
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#1F8349] transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Menuop. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
    </div>
  );
}
