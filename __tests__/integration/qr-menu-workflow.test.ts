/**
 * Integration Tests for QR Code Menu Access Workflow
 * These tests help prevent issues with the complete QR code -> menu access flow
 */

import { MenuService } from "@/lib/services/menu";
import { trackQRScan } from "@/lib/utils/qrTracking";

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock window and document
Object.defineProperty(global, "window", {
  value: {
    location: { search: "", href: "http://localhost:3000/menu/test-menu" },
  },
  writable: true,
});

Object.defineProperty(global, "document", {
  value: { referrer: "" },
  writable: true,
});

describe("QR Code Menu Access Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset window and document
    (global.window as any).location.search = "";
    (global.window as any).location.href =
      "http://localhost:3000/menu/test-menu";
    (global.document as any).referrer = "";
  });

  describe("Menu Access via QR Code", () => {
    it("should successfully access menu by slug when QR scanned", async () => {
      const mockMenu = {
        id: "4611407c-5aa8-4087-9dc0-97215c79a447",
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        slug: "test-restaurant-test-menu",
        description: "A test menu",
        sections: [
          {
            id: "section-1",
            name: "Appetizers",
            description: "Starter dishes",
            sort_order: 1,
            items: [
              {
                id: "item-1",
                name: "Nachos",
                description: "Cheesy nachos",
                price: 12.99,
                image_url: null,
                is_available: true,
                sort_order: 1,
              },
            ],
          },
        ],
      };

      // Mock successful menu fetch
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menu: mockMenu }),
      });

      const menu = await MenuService.getPublicMenuById(
        "test-restaurant-test-menu"
      );

      expect(fetch).toHaveBeenCalledWith(
        "/api/public/menus/test-restaurant-test-menu"
      );
      expect(menu).toEqual(mockMenu);
    });

    it("should track QR scan when menu accessed with qr=1 parameter", async () => {
      // Simulate QR code access
      (global.window as any).location.search = "?qr=1";

      // Mock successful tracking
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      trackQRScan("test-restaurant-test-menu");

      expect(fetch).toHaveBeenCalledWith(
        "/api/public/track-qr-scan/test-restaurant-test-menu",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    it("should not track QR scan when menu accessed normally", () => {
      // Simulate normal access (no QR parameters)
      (global.window as any).location.search = "";
      (global.document as any).referrer = "https://example.com";

      trackQRScan("test-restaurant-test-menu");

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should handle menu not found gracefully", async () => {
      // Mock 404 response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Menu not found" }),
      });

      await expect(
        MenuService.getPublicMenuById("nonexistent-menu")
      ).rejects.toThrow("Menu not found");

      expect(fetch).toHaveBeenCalledWith("/api/public/menus/nonexistent-menu");
    });
  });

  describe("Complete QR Workflow Scenarios", () => {
    it("should handle the complete workflow: QR scan -> menu access -> tracking", async () => {
      const menuSlug = "amazing-restaurant-dinner-menu";
      const mockMenu = {
        id: "menu-uuid-123",
        name: "Dinner Menu",
        restaurant_name: "Amazing Restaurant",
        slug: menuSlug,
        sections: [],
      };

      // Simulate QR code scan access
      (global.window as any).location.search = "?qr=1";

      // Mock both menu fetch and tracking
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ menu: mockMenu }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      // 1. Access menu
      const menu = await MenuService.getPublicMenuById(menuSlug);
      expect(menu).toEqual(mockMenu);

      // 2. Track QR scan
      trackQRScan(menuSlug);

      // Verify both calls were made
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenNthCalledWith(1, `/api/public/menus/${menuSlug}`);
      expect(fetch).toHaveBeenNthCalledWith(
        2,
        `/api/public/track-qr-scan/${menuSlug}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
    });

    it("should work with UUID-based menu access", async () => {
      const menuUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const mockMenu = {
        id: menuUUID,
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        slug: "test-restaurant-test-menu",
        sections: [],
      };

      window.location.search = "?qr=1";

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ menu: mockMenu }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const menu = await MenuService.getPublicMenuById(menuUUID);
      trackQRScan(menuUUID);

      expect(menu.id).toBe(menuUUID);
      expect(fetch).toHaveBeenCalledWith(`/api/public/menus/${menuUUID}`);
      expect(fetch).toHaveBeenCalledWith(
        `/api/public/track-qr-scan/${menuUUID}`,
        expect.any(Object)
      );
    });

    it("should handle tracking failure gracefully without affecting menu access", async () => {
      const menuSlug = "test-menu";
      const mockMenu = {
        id: "123",
        name: "Test",
        restaurant_name: "Test",
        slug: menuSlug,
        sections: [],
      };

      window.location.search = "?qr=1";

      // Menu fetch succeeds, tracking fails
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ menu: mockMenu }),
        })
        .mockRejectedValueOnce(new Error("Network error"));

      const menu = await MenuService.getPublicMenuById(menuSlug);
      expect(menu).toEqual(mockMenu);

      // Tracking should fail silently
      expect(() => trackQRScan(menuSlug)).not.toThrow();
    });
  });

  describe("Error Recovery Scenarios", () => {
    it("should handle network failures appropriately", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(MenuService.getPublicMenuById("test-menu")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle malformed responses", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(MenuService.getPublicMenuById("test-menu")).rejects.toThrow(
        "Invalid JSON"
      );
    });

    it("should handle server errors", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      await expect(MenuService.getPublicMenuById("test-menu")).rejects.toThrow(
        "Internal server error"
      );
    });
  });

  describe("QR Detection Edge Cases", () => {
    const qrIndicators = [
      { search: "?qr=1", description: "standard QR parameter" },
      { search: "?source=qr", description: "source parameter" },
      { search: "?qr=1&other=value", description: "QR with other params" },
      { search: "?other=value&qr=1", description: "QR after other params" },
    ];

    qrIndicators.forEach(({ search, description }) => {
      it(`should detect QR access with ${description}`, () => {
        (global.window as any).location.search = search;

        (fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        });

        trackQRScan("test-menu");

        expect(fetch).toHaveBeenCalled();
      });
    });

    it("should detect QR access with empty referrer (direct access)", () => {
      (global.window as any).location.search = "";
      (global.document as any).referrer = "";

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      trackQRScan("test-menu");

      expect(fetch).toHaveBeenCalled();
    });

    const nonQrCases = [
      {
        search: "",
        referrer: "https://example.com",
        description: "normal web access",
      },
      {
        search: "?qr=0",
        referrer: "",
        description: "explicit non-QR parameter",
      },
      {
        search: "?other=value",
        referrer: "https://google.com",
        description: "other parameters with referrer",
      },
    ];

    nonQrCases.forEach(({ search, referrer, description }) => {
      it(`should not track for ${description}`, () => {
        (global.window as any).location.search = search;
        (global.document as any).referrer = referrer;

        trackQRScan("test-menu");

        expect(fetch).not.toHaveBeenCalled();
      });
    });
  });
});
