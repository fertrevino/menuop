/**
 * Utility functions for handling menu item images
 */

interface ImageConfig {
  width: number;
  height: number;
  className: string;
}

export const IMAGE_SIZES = {
  small: { width: 60, height: 60, className: "w-15 h-15" },
  medium: { width: 80, height: 80, className: "w-20 h-20" },
  large: { width: 120, height: 120, className: "w-30 h-30" },
} as const;

/**
 * Get the optimal image size based on screen size
 */
export function getResponsiveImageSize(
  screenSize: "mobile" | "tablet" | "desktop"
): ImageConfig {
  switch (screenSize) {
    case "mobile":
      return IMAGE_SIZES.small;
    case "tablet":
      return IMAGE_SIZES.medium;
    case "desktop":
      return IMAGE_SIZES.large;
    default:
      return IMAGE_SIZES.medium;
  }
}

/**
 * Generate responsive image classes for different breakpoints
 */
export function getResponsiveImageClasses(): string {
  return "w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg";
}

/**
 * Check if an image URL is valid
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // Check for data URLs (base64 encoded images)
  if (url.startsWith("data:image/")) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

/**
 * Generate alt text for menu item images
 */
export function generateImageAlt(itemName: string): string {
  return `${itemName} - Menu item image`;
}

/**
 * Common image optimization parameters for various CDNs
 */
export const IMAGE_OPTIMIZATION = {
  // For Cloudinary
  cloudinary: (url: string, width = 400, height = 400) => {
    if (url.includes("cloudinary.com")) {
      // Insert transformation parameters
      return url.replace("/upload/", `/upload/w_${width},h_${height},c_fill/`);
    }
    return url;
  },

  // Generic optimization for supported formats
  optimize: (url: string, width = 400, height = 400) => {
    // Apply Cloudinary optimization if applicable
    return IMAGE_OPTIMIZATION.cloudinary(url, width, height);
  },
};
