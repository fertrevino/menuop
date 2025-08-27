"use client";

import { useState, useEffect, useCallback } from "react";
import {
  QRCodeService,
  QRCodeData,
  QRCodeOptions,
  QRCodeAnalyticsSummary,
} from "@/lib/services/qrCode";

const qrCodeService = new QRCodeService();

export function useQRCode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await qrCodeService.verifyDatabaseTables();

      if (!result.tablesExist) {
        console.error("Database tables do not exist:", result.details);
        setError("Database tables are not set up. Please run the migrations.");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Database verification failed:", err);
      setError("Failed to verify database setup");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQRCode = useCallback(
    async (menuId: string): Promise<QRCodeData | null> => {
      try {
        setLoading(true);
        setError(null);

        // Verify database first
        const dbReady = await verifyDatabase();
        if (!dbReady) {
          return null;
        }

        const qrCode = await qrCodeService.getQRCodeByMenuId(menuId);

        return qrCode;
      } catch (err) {
        console.error("Error getting QR code:", err);
        setError(
          `Failed to fetch QR code: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [verifyDatabase]
  );

  const generateQRCode = useCallback(
    async (
      menuId: string,
      options?: QRCodeOptions
    ): Promise<QRCodeData | null> => {
      try {
        setLoading(true);
        setError(null);

        // Verify database first
        const dbReady = await verifyDatabase();
        if (!dbReady) {
          return null;
        }

        const qrCode = await qrCodeService.generateQRCode(menuId, options);

        return qrCode;
      } catch (err) {
        console.error("❌ useQRCode: Error generating QR code:", err);
        setError(
          `Failed to generate QR code: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [verifyDatabase]
  );

  const updateQRCode = useCallback(
    async (
      menuId: string,
      options: QRCodeOptions
    ): Promise<QRCodeData | null> => {
      try {
        setLoading(true);
        setError(null);

        const qrCode = await qrCodeService.updateQRCodeDesign(menuId, options);
        return qrCode;
      } catch (err) {
        setError(
          `Failed to update QR code: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteQRCode = useCallback(async (menuId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await qrCodeService.deleteQRCode(menuId);
      return success;
    } catch (err) {
      setError(
        `Failed to delete QR code: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadQRCode = useCallback(
    async (
      menuId: string,
      format: "png" | "svg" | "jpg" = "png",
      filename?: string
    ): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        await qrCodeService.downloadQRCode(menuId, format, filename);
      } catch (err) {
        setError(
          `Failed to download QR code: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cleanupDuplicates = useCallback(
    async (menuId: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);

        const success = await qrCodeService.cleanupDuplicateQRCodes(menuId);

        return success;
      } catch (err) {
        console.error("Error cleaning up duplicates:", err);
        setError(
          `Failed to cleanup duplicates: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    verifyDatabase,
    getQRCode,
    generateQRCode,
    updateQRCode,
    deleteQRCode,
    downloadQRCode,
    cleanupDuplicates,
    clearError: () => setError(null),
  };
}

export function useQRCodeAnalytics(menuId?: string) {
  const [analytics, setAnalytics] = useState<QRCodeAnalyticsSummary | null>(
    null
  );
  const [detailedAnalytics, setDetailedAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (menuId) {
      loadAnalytics();
    }
  }, [menuId]);

  const loadAnalytics = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      if (!menuId) return;

      try {
        setLoading(true);
        setError(null);

        const [summary, detailed] = await Promise.all([
          qrCodeService.getAnalyticsSummary(menuId),
          qrCodeService.getDetailedAnalytics(menuId, startDate, endDate),
        ]);

        setAnalytics(summary);
        setDetailedAnalytics(detailed);
      } catch (err) {
        console.error("Error loading analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    },
    [menuId]
  );

  return {
    analytics,
    detailedAnalytics,
    loading,
    error,
    loadAnalytics,
    clearError: () => setError(null),
  };
}
