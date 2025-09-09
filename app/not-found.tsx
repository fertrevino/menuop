import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden px-6 text-center">
      {/* Subtle background accents */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#1F8349]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-xl mx-auto">
        <div className="mx-auto mb-8 relative w-40 h-40">
          {/* Playful QR-ish icon with a "bite" missing */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600/60 shadow-xl flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 120 120"
              className="w-32 h-32 text-[#1F8349]"
              aria-hidden="true"
            >
              <rect
                x="8"
                y="8"
                width="32"
                height="32"
                rx="4"
                fill="currentColor"
                fillOpacity="0.25"
              />
              <rect
                x="8"
                y="48"
                width="20"
                height="20"
                rx="3"
                fill="currentColor"
                fillOpacity="0.15"
              />
              <rect
                x="48"
                y="8"
                width="20"
                height="20"
                rx="3"
                fill="currentColor"
                fillOpacity="0.15"
              />
              <rect
                x="48"
                y="48"
                width="32"
                height="32"
                rx="4"
                fill="currentColor"
                fillOpacity="0.3"
              />
              <rect
                x="88"
                y="48"
                width="20"
                height="20"
                rx="3"
                fill="currentColor"
                fillOpacity="0.15"
              />
              {/* "Bite" cut-out – using a mask-like illusion by placing a circle with bg color */}
              <circle cx="96" cy="24" r="18" fill="#0f172a" />
              <circle cx="108" cy="36" r="10" fill="#0f172a" />
            </svg>
          </div>
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-6">
          Page Not Found
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-10">
          That menu item isn&apos;t on today&apos;s specials.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 text-gray-600 text-xs tracking-wide">
        Menuop • Page Not Found
      </div>
    </div>
  );
}
