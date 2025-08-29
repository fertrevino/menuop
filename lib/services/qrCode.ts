import QRCode from "qrcode";
import { createClient } from "../supabase/client";

export interface QRCodeData {
  id: string;
  menu_id: string;
  qr_data: string;
  url: string;
  design_config: QRCodeDesignConfig;
  format: "png" | "svg" | "jpg";
  size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QRCodeDesignConfig {
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string;
  logoSize?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export interface QRCodeOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
  format?: "png" | "svg" | "jpg";
  size?: number;
}

export interface QRCodeAnalytics {
  id: string;
  qr_code_id: string;
  menu_id: string;
  scan_timestamp: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  location?: Record<string, unknown>;
  device_info: Record<string, unknown>;
  session_id?: string;
}

export interface QRCodeAnalyticsSummary {
  total_scans: number;
  unique_sessions: number;
  scans_today: number;
  scans_this_week: number;
  scans_this_month: number;
  top_devices: Array<{ device: string; count: number }>;
  hourly_distribution: Array<{ hour: number; count: number }>;
}

interface DatabaseVerificationDetails {
  qr_codes: {
    accessible: boolean;
    error?: string;
    sample_data?: Array<{ id: string }>;
  };
  qr_code_analytics: {
    accessible: boolean;
    error?: string;
    sample_data?: Array<{ id: string }>;
  };
}

export class QRCodeService {
  private supabase = createClient();

  // Add this method to check database tables
  async verifyDatabaseTables(): Promise<{
    tablesExist: boolean;
    details: DatabaseVerificationDetails;
  }> {
    try {
      // Check if qr_codes table exists by trying to query it
      const { data: qrCodesTest, error: qrCodesError } = await this.supabase
        .from("qr_codes")
        .select("id")
        .limit(1);

      // Check if qr_code_analytics table exists
      const { data: analyticsTest, error: analyticsError } = await this.supabase
        .from("qr_code_analytics")
        .select("id")
        .limit(1);

      const results: DatabaseVerificationDetails = {
        qr_codes: {
          accessible: !qrCodesError,
          error: qrCodesError?.message,
          sample_data: qrCodesTest || undefined,
        },
        qr_code_analytics: {
          accessible: !analyticsError,
          error: analyticsError?.message,
          sample_data: analyticsTest || undefined,
        },
      };

      return {
        tablesExist: !qrCodesError && !analyticsError,
        details: results,
      };
    } catch (err) {
      console.error("Error verifying database tables:", err);
      return {
        tablesExist: false,
        details: {
          qr_codes: { accessible: false, error: "Verification failed" },
          qr_code_analytics: {
            accessible: false,
            error: "Verification failed",
          },
        },
      };
    }
  }

  async getQRCodeByMenuId(menuId: string): Promise<QRCodeData | null> {
    try {
      // First, let's check if the menu exists
      const { data: menu, error: menuError } = await this.supabase
        .from("menus")
        .select("id, slug, is_published, user_id")
        .eq("id", menuId)
        .single();

      if (menuError) {
        console.error("Error fetching menu:", menuError);
        return null;
      }

      if (!menu) {
        return null;
      }

      // Now check if QR code exists - get the most recent one
      const { data, error } = await this.supabase
        .from("qr_codes")
        .select("*")
        .eq("menu_id", menuId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching QR code:", error);
        return null;
      }

      if (!data) {
        return null;
      }

      return data;
    } catch (err) {
      console.error("Unexpected error in getQRCodeByMenuId:", err);
      return null;
    }
  }

  async generateQRCode(
    menuId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData | null> {
    try {
      // First, let's verify the menu exists and get its details
      const { data: menu, error: menuError } = await this.supabase
        .from("menus")
        .select("id, slug, name, is_published, user_id")
        .eq("id", menuId)
        .single();

      if (menuError) {
        console.error("Error fetching menu for QR generation:", menuError);
        return null;
      }

      if (!menu) {
        return null;
      }

      // Generate the URL
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const menuUrl = `${baseUrl}/menu/${menu.slug}?qr=1`;

      // QR Code generation options
      const qrOptions = {
        width: options.size || 256,
        margin: options.margin || 2,
        color: {
          dark: options.foregroundColor || "#000000",
          light: options.backgroundColor || "#FFFFFF",
        },
        errorCorrectionLevel: (options.errorCorrection || "M") as
          | "L"
          | "M"
          | "Q"
          | "H",
      };

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(menuUrl, qrOptions);

      // IMPROVED: Use atomic upsert operation to prevent duplicates
      const qrCodeData = {
        menu_id: menuId,
        qr_data: qrDataUrl,
        url: menuUrl,
        design_config: {
          foregroundColor: options.foregroundColor || "#000000",
          backgroundColor: options.backgroundColor || "#FFFFFF",
          margin: options.margin || 2,
          errorCorrectionLevel: options.errorCorrection || "M",
        },
        format: options.format || "png",
        size: options.size || 256,
        is_active: true,
      };

      // IMPROVED: Handle the unique constraint properly
      // First, try to update existing active QR code
      const { data: existingQR } = await this.supabase
        .from("qr_codes")
        .select("id")
        .eq("menu_id", menuId)
        .eq("is_active", true)
        .single();

      let data, error;

      if (existingQR) {
        // Update existing QR code
        const result = await this.supabase
          .from("qr_codes")
          .update({
            qr_data: qrDataUrl,
            url: menuUrl,
            design_config: options,
            format: options.format,
            size: options.size,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingQR.id)
          .select()
          .single();

        data = result.data;
        error = result.error;
      } else {
        // Insert new QR code
        const result = await this.supabase
          .from("qr_codes")
          .insert(qrCodeData)
          .select()
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error creating/updating QR code:", error);

        // Fallback: Try the old approach if upsert fails
        return await this.generateQRCodeFallback(menuId, options);
      }

      return data;
    } catch (err) {
      console.error("Unexpected error in generateQRCode:", err);
      return null;
    }
  }

  /**
   * Fallback method for QR code generation (original approach)
   */
  private async generateQRCodeFallback(
    menuId: string,
    options: QRCodeOptions = {}
  ): Promise<QRCodeData | null> {
    try {
      // Get existing QR code
      const existingQR = await this.getQRCodeByMenuId(menuId);

      // Generate QR data
      const menu = await this.supabase
        .from("menus")
        .select("slug")
        .eq("id", menuId)
        .single();

      if (!menu.data) return null;

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const menuUrl = `${baseUrl}/menu/${menu.data.slug}?qr=1`;

      const qrOptions = {
        width: options.size || 256,
        margin: options.margin || 2,
        color: {
          dark: options.foregroundColor || "#000000",
          light: options.backgroundColor || "#FFFFFF",
        },
        errorCorrectionLevel: (options.errorCorrection || "M") as
          | "L"
          | "M"
          | "Q"
          | "H",
      };

      const qrDataUrl = await QRCode.toDataURL(menuUrl, qrOptions);

      const qrCodeData = {
        menu_id: menuId,
        qr_data: qrDataUrl,
        url: menuUrl,
        design_config: {
          foregroundColor: options.foregroundColor || "#000000",
          backgroundColor: options.backgroundColor || "#FFFFFF",
          margin: options.margin || 2,
          errorCorrectionLevel: options.errorCorrection || "M",
        },
        format: options.format || "png",
        size: options.size || 256,
        is_active: true,
      };

      if (existingQR) {
        // Update existing QR code
        const { data, error } = await this.supabase
          .from("qr_codes")
          .update(qrCodeData)
          .eq("id", existingQR.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating QR code:", error);
          return null;
        }

        return data;
      } else {
        // Create new QR code with atomic operation
        const { data, error } = await this.supabase
          .from("qr_codes")
          .insert(qrCodeData)
          .select()
          .single();

        if (error) {
          console.error("Error creating QR code:", error);
          return null;
        }

        return data;
      }
    } catch (err) {
      console.error("Error in fallback QR generation:", err);
      return null;
    }
  }

  /**
   * Update QR code design
   */
  async updateQRCodeDesign(
    menuId: string,
    options: QRCodeOptions
  ): Promise<QRCodeData | null> {
    try {
      // Get current QR code
      const currentQR = await this.getQRCodeByMenuId(menuId);
      if (!currentQR) {
        throw new Error("QR code not found");
      }

      // Regenerate with new design
      return await this.generateQRCode(menuId, options);
    } catch (error) {
      console.error("Error updating QR code design:", error);
      return null;
    }
  }

  /**
   * Clean up duplicate QR codes for a menu (keeps only the most recent one)
   * Enhanced version with better error handling and atomic operations
   */
  async cleanupDuplicateQRCodes(menuId: string): Promise<boolean> {
    try {
      // Get all QR codes for this menu, ordered by creation date (newest first)
      const { data: allQRCodes, error: fetchError } = await this.supabase
        .from("qr_codes")
        .select("id, created_at, is_active")
        .eq("menu_id", menuId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("❌ Error fetching QR codes for cleanup:", fetchError);
        return false;
      }

      if (!allQRCodes || allQRCodes.length <= 1) {
        return true;
      }

      // Keep the first (newest) QR code, deactivate the rest
      const qrCodesToDeactivate = allQRCodes.slice(1).map((qr) => qr.id);

      // Use a transaction-like approach: deactivate in a single operation
      const { error: deactivateError } = await this.supabase
        .from("qr_codes")
        .update({ is_active: false })
        .in("id", qrCodesToDeactivate);

      if (deactivateError) {
        console.error(
          "❌ Error deactivating duplicate QR codes:",
          deactivateError
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("💥 Error in cleanup:", error);
      return false;
    }
  }

  /**
   * Comprehensive cleanup for all menus with duplicate QR codes
   */
  async cleanupAllDuplicateQRCodes(): Promise<{
    success: boolean;
    processed: number;
    errors: string[];
  }> {
    try {
      // Find all menus with multiple active QR codes
      const { data: qrCodes, error } = await this.supabase
        .from("qr_codes")
        .select("menu_id")
        .eq("is_active", true);

      if (error) {
        return { success: false, processed: 0, errors: [error.message] };
      }

      // Count QR codes per menu
      const menuCounts =
        qrCodes?.reduce((acc, qr) => {
          acc[qr.menu_id] = (acc[qr.menu_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const menusWithDuplicates = Object.entries(menuCounts)
        .filter(([, count]) => count > 1)
        .map(([menuId]) => menuId);

      const errors: string[] = [];
      let processed = 0;

      // Clean up each menu
      for (const menuId of menusWithDuplicates) {
        const success = await this.cleanupDuplicateQRCodes(menuId);
        if (success) {
          processed++;
        } else {
          errors.push(`Failed to cleanup menu: ${menuId}`);
        }
      }

      return {
        success: errors.length === 0,
        processed,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        processed: 0,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Delete QR code
   */
  async deleteQRCode(menuId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("qr_codes")
        .update({ is_active: false })
        .eq("menu_id", menuId);

      if (error) {
        console.error("Error deleting QR code:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting QR code:", error);
      return false;
    }
  }

  /**
   * Track QR code scan
   */
  async trackScan(
    qrCodeId: string,
    menuId: string,
    scanData: {
      userAgent?: string;
      ipAddress?: string;
      referrer?: string;
      location?: Record<string, unknown>;
      sessionId?: string;
    }
  ): Promise<boolean> {
    try {
      // Parse user agent for device info
      const deviceInfo = this.parseUserAgent(scanData.userAgent || "");

      const { data, error } = await this.supabase
        .from("qr_code_analytics")
        .insert({
          qr_code_id: qrCodeId,
          menu_id: menuId,
          user_agent: scanData.userAgent,
          ip_address: scanData.ipAddress,
          referrer: scanData.referrer,
          location: scanData.location,
          device_info: deviceInfo,
          session_id: scanData.sessionId,
        })
        .select();

      if (error) {
        console.error("❌ Error tracking QR scan:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("💥 Unexpected error tracking QR scan:", error);
      return false;
    }
  }

  /**
   * Get QR code analytics summary
   */
  async getAnalyticsSummary(
    menuId: string
  ): Promise<QRCodeAnalyticsSummary | null> {
    try {
      // First check if we have any analytics data
      const { data: analyticsCheck, error: checkError } = await this.supabase
        .from("qr_code_analytics")
        .select("id")
        .eq("menu_id", menuId)
        .limit(1);

      if (checkError) {
        console.error("Error checking analytics data:", checkError);
        return null;
      }

      // If we have analytics data, try to get summary
      if (analyticsCheck && analyticsCheck.length > 0) {
        // Try the database function first
        const { data: functionData, error: functionError } =
          await this.supabase.rpc("get_qr_analytics_summary", {
            p_menu_id: menuId,
          });

        if (!functionError && functionData && functionData.length > 0) {
          return functionData[0];
        }

        // Fallback: Calculate analytics manually
        const [
          totalScans,
          uniqueSessions,
          scansToday,
          scansThisWeek,
          scansThisMonth,
        ] = await Promise.all([
          // Total scans
          this.supabase
            .from("qr_code_analytics")
            .select("id", { count: "exact" })
            .eq("menu_id", menuId),

          // Unique sessions
          this.supabase
            .from("qr_code_analytics")
            .select("session_id")
            .eq("menu_id", menuId)
            .not("session_id", "is", null),

          // Scans today
          this.supabase
            .from("qr_code_analytics")
            .select("id", { count: "exact" })
            .eq("menu_id", menuId)
            .gte("scan_timestamp", new Date().toISOString().split("T")[0]),

          // Scans this week
          this.supabase
            .from("qr_code_analytics")
            .select("id", { count: "exact" })
            .eq("menu_id", menuId)
            .gte("scan_timestamp", this.getStartOfWeek().toISOString()),

          // Scans this month
          this.supabase
            .from("qr_code_analytics")
            .select("id", { count: "exact" })
            .eq("menu_id", menuId)
            .gte("scan_timestamp", this.getStartOfMonth().toISOString()),
        ]);

        const summary: QRCodeAnalyticsSummary = {
          total_scans: totalScans.count || 0,
          unique_sessions: uniqueSessions.data
            ? new Set(uniqueSessions.data.map((d) => d.session_id)).size
            : 0,
          scans_today: scansToday.count || 0,
          scans_this_week: scansThisWeek.count || 0,
          scans_this_month: scansThisMonth.count || 0,
          top_devices: [],
          hourly_distribution: [],
        };

        return summary;
      }

      // No analytics data yet
      return {
        total_scans: 0,
        unique_sessions: 0,
        scans_today: 0,
        scans_this_week: 0,
        scans_this_month: 0,
        top_devices: [],
        hourly_distribution: [],
      };
    } catch (error) {
      console.error("❌ Error fetching analytics summary:", error);
      return null;
    }
  }

  /**
   * Helper function to get start of current week
   */
  private getStartOfWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff));
  }

  /**
   * Helper function to get start of current month
   */
  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  /**
   * Get detailed analytics
   */
  async getDetailedAnalytics(
    menuId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<QRCodeAnalytics[]> {
    try {
      let query = this.supabase
        .from("qr_code_analytics")
        .select("*")
        .eq("menu_id", menuId)
        .order("scan_timestamp", { ascending: false });

      if (startDate) {
        query = query.gte("scan_timestamp", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("scan_timestamp", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching detailed analytics:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
      return [];
    }
  }

  /**
   * Download QR code as file
   */
  async downloadQRCode(
    menuId: string,
    format: "png" | "svg" | "jpg" = "png",
    filename?: string
  ): Promise<void> {
    try {
      const qrCode = await this.getQRCodeByMenuId(menuId);
      if (!qrCode) {
        throw new Error("QR code not found");
      }

      let dataUrl = qrCode.qr_data;

      if (format === "svg") {
        // Convert SVG to data URL
        const svgBlob = new Blob([qrCode.qr_data], { type: "image/svg+xml" });
        dataUrl = URL.createObjectURL(svgBlob);
      } else if (format === "jpg") {
        // Convert PNG to JPG if needed
        dataUrl = await this.convertToJPG(qrCode.qr_data);
      }

      // Create download link
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename || `menu-qr-code.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up object URL if created
      if (format === "svg") {
        URL.revokeObjectURL(dataUrl);
      }
    } catch (error) {
      console.error("Error downloading QR code:", error);
      throw error;
    }
  }

  /**
   * Convert PNG data URL to JPG
   */
  private async convertToJPG(pngDataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Fill with white background
        ctx!.fillStyle = "#FFFFFF";
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx!.drawImage(img, 0, 0);

        // Convert to JPG
        const jpgDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        resolve(jpgDataUrl);
      };

      img.onerror = reject;
      img.src = pngDataUrl;
    });
  }

  /**
   * Parse user agent for device information
   */
  private parseUserAgent(userAgent: string): Record<string, unknown> {
    const deviceInfo: Record<string, unknown> = {
      device_type: "Unknown",
      browser: "Unknown",
      os: "Unknown",
    };

    if (!userAgent) return deviceInfo;

    // Detect device type
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) {
        deviceInfo.device_type = "Tablet";
      } else {
        deviceInfo.device_type = "Mobile";
      }
    } else {
      deviceInfo.device_type = "Desktop";
    }

    // Detect browser
    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
      deviceInfo.browser = "Chrome";
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      deviceInfo.browser = "Safari";
    } else if (/Firefox/.test(userAgent)) {
      deviceInfo.browser = "Firefox";
    } else if (/Edge/.test(userAgent)) {
      deviceInfo.browser = "Edge";
    }

    // Detect OS
    if (/Windows/.test(userAgent)) {
      deviceInfo.os = "Windows";
    } else if (/Mac/.test(userAgent)) {
      deviceInfo.os = "macOS";
    } else if (/Linux/.test(userAgent)) {
      deviceInfo.os = "Linux";
    } else if (/Android/.test(userAgent)) {
      deviceInfo.os = "Android";
    } else if (/iOS|iPhone|iPad/.test(userAgent)) {
      deviceInfo.os = "iOS";
    }

    return deviceInfo;
  }
}
