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
export function getResponsiveImageClasses(options?: {
  size?: "sm" | "md" | "lg" | "xl";
  shape?: "rounded" | "square" | "circle";
}): string {
  const size = options?.size || "md";
  const shape = options?.shape || "rounded";

  const sizeMap: Record<string, string> = {
    sm: "w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20",
    md: "w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28",
    lg: "w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32",
    xl: "w-32 h-32 sm:w-36 sm:h-36 lg:w-44 lg:h-44", // Significantly larger XL
  };

  const shapeMap: Record<string, string> = {
    rounded: "rounded-lg",
    square: "rounded-none",
    circle: "rounded-full",
  };

  return `${sizeMap[size]} object-cover ${shapeMap[shape]}`;
}

// Map logical size to approximate target pixel dimensions for optimization
export function getImageOptimizationDimensions(
  size: "sm" | "md" | "lg" | "xl"
) {
  switch (size) {
    case "sm":
      return { width: 250, height: 250 };
    case "md":
      return { width: 350, height: 350 };
    case "lg":
      return { width: 500, height: 500 };
    case "xl":
      return { width: 700, height: 700 }; // Bigger for clearer XL images
    default:
      return { width: 350, height: 350 };
  }
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
