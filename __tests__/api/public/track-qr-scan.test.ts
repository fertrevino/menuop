/**
 * Tests for QR Code Tracking API Route
 * These tests help prevent issues with menu ID/slug resolution in QR tracking
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/public/track-qr-scan/[id]/route";

// Mock the dependencies
jest.mock("@/lib/services/qrCode", () => ({
  QRCodeService: jest.fn().mockImplementation(() => ({
    trackScan: jest.fn(),
  })),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(),
}));

describe("QR Code Tracking API", () => {
  let mockSupabase: any;
  let mockQRCodeService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const { createClient } = require("@/lib/supabase/client");
    createClient.mockReturnValue(mockSupabase);

    // Mock QRCodeService
    const { QRCodeService } = require("@/lib/services/qrCode");
    mockQRCodeService = {
      trackScan: jest.fn(),
    };
    QRCodeService.mockImplementation(() => mockQRCodeService);
  });

  describe("POST /api/public/track-qr-scan/[id]", () => {
    it("should track QR scan for menu accessed by UUID", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const qrCodeId = "qr-code-123";

      // Mock finding menu by UUID
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null }) // menu lookup
        .mockResolvedValueOnce({ data: { id: qrCodeId }, error: null }); // QR code lookup

      mockQRCodeService.trackScan.mockResolvedValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuUUID,
        {
          method: "POST",
          headers: {
            "user-agent": "Mozilla/5.0 Test Browser",
            "x-forwarded-for": "192.168.1.1",
          },
        }
      );

      const params = Promise.resolve({ id: menuUUID });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", menuUUID);
      expect(mockQRCodeService.trackScan).toHaveBeenCalledWith(
        qrCodeId,
        menuUUID,
        expect.objectContaining({
          userAgent: "Mozilla/5.0 Test Browser",
          ipAddress: "192.168.1.1",
          sessionId: expect.any(String),
        })
      );
    });

    it("should track QR scan for menu accessed by slug", async () => {
      const menuSlug = "test-restaurant-test-menu";
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const qrCodeId = "qr-code-123";

      // Mock finding menu by slug
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null }) // menu lookup
        .mockResolvedValueOnce({ data: { id: qrCodeId }, error: null }); // QR code lookup

      mockQRCodeService.trackScan.mockResolvedValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuSlug,
        {
          method: "POST",
          headers: {
            "user-agent": "Mozilla/5.0 Test Browser",
            referer: "https://example.com",
          },
        }
      );

      const params = Promise.resolve({ id: menuSlug });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(mockSupabase.eq).toHaveBeenCalledWith("slug", menuSlug);
      expect(mockQRCodeService.trackScan).toHaveBeenCalledWith(
        qrCodeId,
        menuUUID,
        expect.objectContaining({
          userAgent: "Mozilla/5.0 Test Browser",
          referrer: "https://example.com",
          sessionId: expect.any(String),
        })
      );
    });

    it("should return 404 when menu is not found", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/nonexistent",
        {
          method: "POST",
        }
      );

      const params = Promise.resolve({ id: "nonexistent" });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe("Menu not found");
    });

    it("should return 404 when QR code is not found for menu", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null }) // menu found
        .mockResolvedValueOnce({ data: null, error: null }); // QR code not found

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuUUID,
        {
          method: "POST",
        }
      );

      const params = Promise.resolve({ id: menuUUID });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe("QR code not found");
    });

    it("should return 500 when tracking fails", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const qrCodeId = "qr-code-123";

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null })
        .mockResolvedValueOnce({ data: { id: qrCodeId }, error: null });

      mockQRCodeService.trackScan.mockResolvedValue(false); // tracking failed

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuUUID,
        {
          method: "POST",
        }
      );

      const params = Promise.resolve({ id: menuUUID });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Failed to track scan");
    });

    it("should extract tracking information from headers", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const qrCodeId = "qr-code-123";

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null })
        .mockResolvedValueOnce({ data: { id: qrCodeId }, error: null });

      mockQRCodeService.trackScan.mockResolvedValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuUUID,
        {
          method: "POST",
          headers: {
            "user-agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
            "x-forwarded-for": "203.0.113.1, 192.168.1.1",
            "x-real-ip": "203.0.113.1",
            referer: "https://qr-scanner.app/",
          },
        }
      );

      const params = Promise.resolve({ id: menuUUID });

      await POST(request, { params });

      expect(mockQRCodeService.trackScan).toHaveBeenCalledWith(
        qrCodeId,
        menuUUID,
        expect.objectContaining({
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
          ipAddress: "203.0.113.1, 192.168.1.1", // x-forwarded-for takes precedence
          referrer: "https://qr-scanner.app/",
          sessionId: expect.any(String),
        })
      );
    });

    it("should generate unique session IDs", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const qrCodeId = "qr-code-123";

      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: menuUUID }, error: null })
        .mockResolvedValueOnce({ data: { id: qrCodeId }, error: null });

      mockQRCodeService.trackScan.mockResolvedValue(true);

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuUUID,
        {
          method: "POST",
          headers: {
            "user-agent": "Test Browser",
          },
        }
      );

      const params = Promise.resolve({ id: menuUUID });

      await POST(request, { params });

      const trackingCall = mockQRCodeService.trackScan.mock.calls[0];
      const sessionId = trackingCall[2].sessionId;

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeLessThanOrEqual(32);
    });

    it("should filter for published and non-deleted menus", async () => {
      const menuSlug = "test-menu";
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/" + menuSlug,
        {
          method: "POST",
        }
      );

      const params = Promise.resolve({ id: menuSlug });

      await POST(request, { params });

      expect(mockSupabase.eq).toHaveBeenCalledWith("is_published", true);
      expect(mockSupabase.is).toHaveBeenCalledWith("deleted_on", null);
    });

    it("should handle server errors gracefully", async () => {
      mockSupabase.single.mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost:3000/api/public/track-qr-scan/test-menu",
        {
          method: "POST",
        }
      );

      const params = Promise.resolve({ id: "test-menu" });

      const response = await POST(request, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Internal server error");
    });
  });

  describe("Menu Identifier Detection", () => {
    const testCases = [
      {
        identifier: "4611407c-5aa8-4087-9dc0-97215c79a447",
        expectedField: "id",
        description: "UUID",
      },
      {
        identifier: "test-restaurant-menu",
        expectedField: "slug",
        description: "slug",
      },
      {
        identifier: "my-awesome-restaurant-special-menu",
        expectedField: "slug",
        description: "long slug",
      },
      {
        identifier: "123-not-uuid",
        expectedField: "slug",
        description: "number-starting slug",
      },
    ];

    testCases.forEach(({ identifier, expectedField, description }) => {
      it(`should correctly identify ${description} and query by ${expectedField}`, async () => {
        mockSupabase.single
          .mockResolvedValueOnce({ data: { id: "menu-id" }, error: null })
          .mockResolvedValueOnce({ data: { id: "qr-id" }, error: null });

        mockQRCodeService.trackScan.mockResolvedValue(true);

        const request = new NextRequest(
          `http://localhost:3000/api/public/track-qr-scan/${identifier}`,
          {
            method: "POST",
          }
        );

        const params = Promise.resolve({ id: identifier });

        await POST(request, { params });

        expect(mockSupabase.eq).toHaveBeenCalledWith(expectedField, identifier);
      });
    });
  });
});
