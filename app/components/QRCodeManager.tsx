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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingDesign, setIsUpdatingDesign] = useState(false);

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

  const loadQRCode = useCallback(async () => {
    try {
      const existing = await getQRCode(menuId);

      if (existing) {
        setQrCode(existing);
        // Update design config from existing QR code
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
          handleGenerateQRCode();
        }
      }
    } catch (err) {
      console.error("Error loading QR code:", err);
      setInitialLoadComplete(true);
    }
  }, [menuId, getQRCode, isPublished, handleGenerateQRCode]);

  // Single effect to handle initial load
  useEffect(() => {
    loadQRCode();
  }, [loadQRCode]);

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
      // Reload the QR code after cleanup
      loadQRCode();
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

  // Show loading screen until initial load is complete
  if (!initialLoadComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Loading QR Code Manager
            </h2>
            <p className="text-gray-600">Checking for existing QR codes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Foreground Color
                  </label>
                  <input
                    type="color"
                    value={designConfig.foregroundColor}
                    onChange={(e) =>
                      setDesignConfig({
                        ...designConfig,
                        foregroundColor: e.target.value,
                      })
                    }
                    className="w-full h-10 rounded border border-gray-600 bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full h-10 rounded border border-gray-600 bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full"
                  />
                  <div className="text-sm text-gray-400 mt-1">
                    {designConfig.margin}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleUpdateDesign}
                  disabled={isUpdatingDesign}
                  className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  {isUpdatingDesign ? "Updating Design..." : "Update Design"}
                </button>
                <button
                  onClick={() => setShowDesignPanel(false)}
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
