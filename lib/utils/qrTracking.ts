/**
 * QR Code Scan Tracking Utility
 * This script tracks when a menu is accessed via QR code
 */

export function trackQRScan(menuId: string) {
  // Only track if we're in the browser and have the required URL parameters
  if (typeof window === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const isFromQR =
    urlParams.get("qr") === "1" ||
    urlParams.get("source") === "qr" ||
    document.referrer === ""; // Direct access often indicates QR scan

  if (!isFromQR) return;

  try {
    // Track the scan
    fetch(`/api/public/track-qr-scan/${menuId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(console.error); // Silently fail if tracking fails
  } catch (error) {
    console.error("Error tracking QR scan:", error);
  }
}

/**
 * Automatically track QR scans when the page loads
 * Call this in the menu page component
 */
export function useQRScanTracking(menuId: string) {
  if (typeof window !== "undefined") {
    // Track on page load
    window.addEventListener("load", () => {
      trackQRScan(menuId);
    });

    // Also track immediately in case the event already fired
    if (document.readyState === "complete") {
      trackQRScan(menuId);
    }
  }
}
