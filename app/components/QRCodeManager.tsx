"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useQRCode, useQRCodeAnalytics } from "@/hooks/useQRCode";
import { QRCodeData, QRCodeOptions } from "@/lib/services/qrCode";

interface QRCodeManagerProps {
  menuId: string;
  menuSlug?: string;
  isPublished: boolean;
  restaurantName: string;
  menuName: string;
}

export default function QRCodeManager({
  menuId,
  menuSlug,
  isPublished,
  restaurantName,
  menuName,
}: QRCodeManagerProps) {
  const {
    loading,
    error,
    verifyDatabase,
    getQRCode,
    generateQRCode,
    updateQRCode,
    downloadQRCode,
    cleanupDuplicates,
    clearError,
  } = useQRCode();

  const { analytics, loadAnalytics } = useQRCodeAnalytics(menuId);

  const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"design" | "analytics">("design");
  const [designConfig, setDesignConfig] = useState<QRCodeOptions>({
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
    margin: 2,
    errorCorrection: "M",
    format: "png",
    size: 256,
  });

  // Generate preview QR code when design config changes
  const generatePreview = useCallback(
    async (config: QRCodeOptions) => {
      if (!qrCode) return;

      try {
        const menuUrl = `${window.location.origin}/menu/${menuSlug || menuId}`;
        const QRCode = (await import("qrcode")).default;

        const qrOptions = {
          width: config.size,
          margin: config.margin,
          color: {
            dark: config.foregroundColor,
            light: config.backgroundColor,
          },
          errorCorrectionLevel: config.errorCorrection as "L" | "M" | "Q" | "H",
        };

        const qrDataUrl = await QRCode.toDataURL(menuUrl, qrOptions);
        setPreviewQRCode(qrDataUrl);
        setPreviewKey((prev) => prev + 1);
      } catch (err) {
        console.error("Error generating preview:", err);
        setPreviewQRCode(null);
      }
    },
    [qrCode, menuSlug, menuId]
  );

  // Generate preview when design config changes
  useEffect(() => {
    if (showDesignPanel && qrCode) {
      const debounceTimer = setTimeout(() => {
        generatePreview(designConfig);
      }, 150); // Fast, responsive debounce

      return () => clearTimeout(debounceTimer);
    }
  }, [designConfig, showDesignPanel, qrCode, generatePreview]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingDesign, setIsUpdatingDesign] = useState(false);
  const [previewQRCode, setPreviewQRCode] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const handleGenerateQRCode = useCallback(async () => {
    // Prevent multiple simultaneous generations
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      // Verify database first
      const dbReady = await verifyDatabase();

      if (!dbReady) {
        return;
      }

      const generated = await generateQRCode(menuId, designConfig);

      if (generated) {
        setQrCode(generated);
        setShowDesignPanel(false); // Close the design panel on success
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [menuId, designConfig, generateQRCode, verifyDatabase]);

  const loadQRCode = useCallback(
    async (shouldUpdateDesignConfig = false) => {
      try {
        const existing = await getQRCode(menuId);

        if (existing) {
          setQrCode(existing);
          // Only update design config when explicitly requested
          if (existing.design_config && shouldUpdateDesignConfig) {
            setDesignConfig((prev) => ({
              ...prev,
              ...existing.design_config,
            }));
          }
        } else {
          setQrCode(null);
        }
      } catch (err) {
        console.error("Error loading QR code:", err);
      }
    },
    [menuId, getQRCode]
  ); // Removed dependencies that cause infinite loops

  // Single effect to handle initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const existing = await getQRCode(menuId);

        if (existing) {
          setQrCode(existing);
          // Only update design config on initial load
          if (existing.design_config) {
            setDesignConfig((prev) => ({
              ...prev,
              ...existing.design_config,
            }));
          }
          setInitialLoadComplete(true);
        } else {
          // No QR code exists
          setQrCode(null);
          setInitialLoadComplete(true);

          // Auto-generate if menu is published
          if (isPublished) {
            // Use default design config for auto-generation
            const defaultConfig = {
              foregroundColor: "#000000",
              backgroundColor: "#FFFFFF",
              margin: 2,
              errorCorrection: "M" as const,
              format: "png" as const,
              size: 256,
            };
            const generated = await generateQRCode(menuId, defaultConfig);
            if (generated) {
              setQrCode(generated);
            }
          }
        }
      } catch (err) {
        console.error("Error loading QR code:", err);
        setInitialLoadComplete(true);
      }
    };

    if (!initialLoadComplete) {
      initialLoad();
    }
  }, [menuId, getQRCode, isPublished, initialLoadComplete, generateQRCode]); // Added generateQRCode dependency

  const handleUpdateDesign = useCallback(async () => {
    if (!qrCode) return;

    setIsUpdatingDesign(true);
    try {
      const updated = await updateQRCode(menuId, designConfig);
      if (updated) {
        setQrCode(updated);
        setShowDesignPanel(false);
      }
    } finally {
      setIsUpdatingDesign(false);
    }
  }, [menuId, designConfig, updateQRCode, qrCode]);

  const handleDownload = useCallback(
    async (format: "png" | "svg" | "jpg" = "png") => {
      const filename = `${restaurantName}-${menuName}-qr-code`.replace(
        /[^a-zA-Z0-9]/g,
        "-"
      );
      await downloadQRCode(menuId, format, filename);
    },
    [menuId, restaurantName, menuName, downloadQRCode]
  );

  const handleCleanupDuplicates = useCallback(async () => {
    const success = await cleanupDuplicates(menuId);
    if (success) {
      // Reload the QR code after cleanup (without updating design config)
      loadQRCode(false);
    }
  }, [menuId, cleanupDuplicates, loadQRCode]);

  if (!isPublished) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            QR Code Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            QR codes can only be generated for published menus. Please publish
            your menu first.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton loading state until initial load is complete
  if (!initialLoadComplete) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        {/* Shimmer effect styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200px 0;
            }
            100% {
              background-position: calc(200px + 100%) 0;
            }
          }
          .shimmer {
            background: linear-gradient(
              90deg,
              #374151 0%,
              #4b5563 50%,
              #374151 100%
            );
            background-size: 200px 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>

        {/* Skeleton Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-7 w-24 bg-gray-700 rounded shimmer"></div>
          <div className="h-8 w-20 bg-gray-700 rounded shimmer"></div>
        </div>

        {/* Skeleton Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Skeleton QR Code Area */}
          <div className="flex-1">
            <div className="bg-white rounded-lg p-4 inline-block">
              <div className="w-64 h-64 bg-gray-200 rounded-lg shimmer flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm0 8h8v8H3v-8zm2 2v4h4v-4H5zm8-12h8v8h-8V3zm2 2v4h4V5h-4z" />
                  <path d="M13 13h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm0-8h2v2h-2V9z" />
                </svg>
              </div>
            </div>

            {/* Skeleton Download Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="h-9 w-28 bg-gray-700 rounded shimmer"></div>
              <div className="h-9 w-28 bg-gray-700 rounded shimmer"></div>
              <div className="h-9 w-28 bg-gray-700 rounded shimmer"></div>
            </div>
          </div>

          {/* Skeleton Analytics */}
          <div className="flex-1">
            <div className="h-6 w-32 bg-gray-700 rounded shimmer mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="h-8 w-12 bg-gray-600 rounded shimmer mb-2"></div>
                <div className="h-4 w-20 bg-gray-600 rounded shimmer"></div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="h-8 w-12 bg-gray-600 rounded shimmer mb-2"></div>
                <div className="h-4 w-24 bg-gray-600 rounded shimmer"></div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="h-8 w-8 bg-gray-600 rounded shimmer mb-2"></div>
                <div className="h-4 w-12 bg-gray-600 rounded shimmer"></div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <div className="h-8 w-12 bg-gray-600 rounded shimmer mb-2"></div>
                <div className="h-4 w-16 bg-gray-600 rounded shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      {/* Custom CSS for smooth animations */}
      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">QR Code</h3>
        {qrCode && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowDesignPanel(!showDesignPanel)}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Customize
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {error}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleGenerateQRCode}
                  disabled={loading || isGenerating}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                >
                  {loading || isGenerating ? "Retrying..." : "Retry"}
                </button>
                <button
                  onClick={handleCleanupDuplicates}
                  disabled={loading}
                  className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-xs"
                >
                  {loading ? "Cleaning..." : "Fix Duplicates"}
                </button>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-300 hover:text-red-100 ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {!qrCode ? (
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-700 rounded-lg flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p className="text-gray-400 mb-4">No QR code generated yet</p>
          <button
            onClick={handleGenerateQRCode}
            disabled={loading || isGenerating}
            className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {loading || isGenerating ? "Generating..." : "Generate QR Code"}
          </button>
        </div>
      ) : (
        <div>
          {/* QR Code Display */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-white rounded-lg p-4 inline-block">
                {qrCode.format === "svg" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: qrCode.qr_data }}
                    className="w-64 h-64"
                  />
                ) : (
                  <Image
                    src={qrCode.qr_data}
                    alt="Menu QR Code"
                    width={256}
                    height={256}
                    className="w-64 h-64"
                  />
                )}
              </div>

              {/* Download Options */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleDownload("png")}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Download PNG
                </button>
                <button
                  onClick={() => handleDownload("svg")}
                  className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Download SVG
                </button>
                <button
                  onClick={() => handleDownload("jpg")}
                  className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Download JPG
                </button>
              </div>
            </div>

            {/* Analytics */}
            {analytics && (
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Scan Analytics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-[#1F8349]">
                      {analytics.total_scans}
                    </div>
                    <div className="text-sm text-gray-400">Total Scans</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">
                      {analytics.unique_sessions}
                    </div>
                    <div className="text-sm text-gray-400">Unique Visitors</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">
                      {analytics.scans_today}
                    </div>
                    <div className="text-sm text-gray-400">Today</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">
                      {analytics.scans_this_week}
                    </div>
                    <div className="text-sm text-gray-400">This Week</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Design Customization Panel */}
          {showDesignPanel && (
            <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-4">
                Customize Design
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Design Controls */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-3 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={designConfig.foregroundColor}
                      onChange={(e) => {
                        setDesignConfig({
                          ...designConfig,
                          foregroundColor: e.target.value,
                        });
                      }}
                      className="w-full h-12 rounded-lg border border-gray-600 bg-gray-800 transition-all duration-300 hover:border-gray-500 hover:shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:scale-105"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-3 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={designConfig.backgroundColor}
                      onChange={(e) =>
                        setDesignConfig({
                          ...designConfig,
                          backgroundColor: e.target.value,
                        })
                      }
                      className="w-full h-12 rounded-lg border border-gray-600 bg-gray-800 transition-all duration-300 hover:border-gray-500 hover:shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:scale-105"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-3 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                      Margin
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={designConfig.margin}
                      onChange={(e) =>
                        setDesignConfig({
                          ...designConfig,
                          margin: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-3 accent-[#1F8349] transition-all duration-300 hover:accent-[#2ea358]"
                      style={{
                        background: `linear-gradient(to right, #1F8349 0%, #1F8349 ${
                          ((designConfig.margin || 2) - 1) * 11.11
                        }%, #374151 ${
                          ((designConfig.margin || 2) - 1) * 11.11
                        }%, #374151 100%)`,
                      }}
                    />
                    <div className="text-sm text-gray-400 mt-2 transition-all duration-300 group-hover:text-gray-300 group-hover:font-medium">
                      Margin: {designConfig.margin}
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-300 mb-3 transition-all duration-300 group-hover:text-white group-hover:translate-x-1">
                      Error Correction
                    </label>
                    <select
                      value={designConfig.errorCorrection}
                      onChange={(e) =>
                        setDesignConfig({
                          ...designConfig,
                          errorCorrection: e.target.value as
                            | "L"
                            | "M"
                            | "Q"
                            | "H",
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white transition-all duration-300 hover:border-gray-500 hover:shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:scale-105"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="flex flex-col items-center">
                  <h5 className="text-md font-medium text-gray-300 mb-3">
                    Live Preview
                  </h5>
                  <div className="bg-white rounded-lg p-4 inline-block mb-4 shadow-lg">
                    {previewQRCode ? (
                      <Image
                        key={previewKey}
                        src={previewQRCode}
                        alt="QR Code Preview"
                        width={192}
                        height={192}
                        className="w-48 h-48 transition-all duration-300 ease-out hover:scale-105"
                        style={{
                          animation: "fadeIn 0.3s ease-out",
                        }}
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                        <span className="text-gray-500 text-sm">
                          Preview not available
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Preview updates as you change the design options
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleUpdateDesign}
                  disabled={isUpdatingDesign}
                  className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {isUpdatingDesign ? "Updating Design..." : "Update Design"}
                </button>
                <button
                  onClick={() => {
                    setShowDesignPanel(false);
                    setPreviewQRCode(null); // Clear preview when closing
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
