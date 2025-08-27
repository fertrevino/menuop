/**
 * Tests for Public Menu API Routes
 * These tests help prevent issues with slug-based vs ID-based menu lookups
 */

// Mock Next.js request/response before importing the handler
const mockNextRequest = jest.fn();
const mockNextResponse = {
  json: jest.fn().mockImplementation((data, init) => ({
    json: () => Promise.resolve(data),
    status: init?.status || 200,
  })),
};

jest.mock("next/server", () => ({
  NextRequest: mockNextRequest,
  NextResponse: mockNextResponse,
}));

// Mock the Supabase client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

// Now import the handler after mocks are set up
import { GET } from "@/app/api/public/menus/[id]/route";

// Create a helper to create mock requests
const createMockRequest = (url: string) => ({
  url,
  method: "GET",
  headers: new Map(),
});

describe("Public Menu API", () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const { createClient } = require("@/lib/supabase/server");
    createClient.mockResolvedValue(mockSupabase);
  });

  describe("GET /api/public/menus/[id]", () => {
    it("should lookup menu by UUID when provided valid UUID", async () => {
      const validUUID = "4611407c-5aa8-4087-9dc0-97215c79a447";
      const mockMenu = {
        id: validUUID,
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        slug: "test-restaurant-test-menu",
        sections: [],
      };

      mockSupabase.single.mockResolvedValue({ data: mockMenu, error: null });

      const request = createMockRequest(
        "http://localhost:3000/api/public/menus/" + validUUID
      );
      const params = Promise.resolve({ id: validUUID });

      const response = await GET(request, { params });
      const result = await response.json();

      expect(mockSupabase.eq).toHaveBeenCalledWith("id", validUUID);
      expect(response.status).toBe(200);
      expect(result.menu.id).toBe(validUUID);
    });

    it("should lookup menu by slug when provided non-UUID string", async () => {
      const slug = "test-restaurant-test-menu";
      const mockMenu = {
        id: "4611407c-5aa8-4087-9dc0-97215c79a447",
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        slug: slug,
        sections: [],
      };

      mockSupabase.single.mockResolvedValue({ data: mockMenu, error: null });

      const request = new NextRequest(
        "http://localhost:3000/api/public/menus/" + slug
      );
      const params = Promise.resolve({ id: slug });

      const response = await GET(request, { params });
      const result = await response.json();

      expect(mockSupabase.eq).toHaveBeenCalledWith("slug", slug);
      expect(response.status).toBe(200);
      expect(result.menu.slug).toBe(slug);
    });

    it("should return 404 when menu is not found", async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: "Not found" },
      });

      const request = new NextRequest(
        "http://localhost:3000/api/public/menus/nonexistent"
      );
      const params = Promise.resolve({ id: "nonexistent" });

      const response = await GET(request, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe("Menu not found");
    });

    it("should filter for published menus only", async () => {
      const slug = "test-menu";
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const request = new NextRequest(
        "http://localhost:3000/api/public/menus/" + slug
      );
      const params = Promise.resolve({ id: slug });

      await GET(request, { params });

      expect(mockSupabase.eq).toHaveBeenCalledWith("is_published", true);
      expect(mockSupabase.is).toHaveBeenCalledWith("deleted_on", null);
    });

    it("should sort sections and items by sort_order", async () => {
      const mockMenu = {
        id: "test-id",
        name: "Test Menu",
        restaurant_name: "Test Restaurant",
        description: "A test menu",
        slug: "test-menu",
        sections: [
          {
            id: "section-2",
            name: "Section 2",
            sort_order: 2,
            items: [
              { id: "item-2", name: "Item 2", sort_order: 2, price: 20 },
              { id: "item-1", name: "Item 1", sort_order: 1, price: 10 },
            ],
          },
          {
            id: "section-1",
            name: "Section 1",
            sort_order: 1,
            items: [],
          },
        ],
      };

      mockSupabase.single.mockResolvedValue({ data: mockMenu, error: null });

      const request = new NextRequest(
        "http://localhost:3000/api/public/menus/test-menu"
      );
      const params = Promise.resolve({ id: "test-menu" });

      const response = await GET(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);

      // Check that sections are sorted by sort_order
      expect(result.menu.sections[0].name).toBe("Section 1");
      expect(result.menu.sections[1].name).toBe("Section 2");

      // Check that items are sorted by sort_order
      expect(result.menu.sections[1].items[0].name).toBe("Item 1");
      expect(result.menu.sections[1].items[1].name).toBe("Item 2");
    });

    it("should handle server errors gracefully", async () => {
      mockSupabase.single.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest(
        "http://localhost:3000/api/public/menus/test-menu"
      );
      const params = Promise.resolve({ id: "test-menu" });

      const response = await GET(request, { params });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe("Internal server error");
    });
  });

  describe("UUID Detection", () => {
    const validUUIDs = [
      "4611407c-5aa8-4087-9dc0-97215c79a447",
      "00000000-0000-0000-0000-000000000000",
      "ffffffff-ffff-ffff-ffff-ffffffffffff",
    ];

    const invalidUUIDs = [
      "test-menu-slug",
      "not-a-uuid",
      "4611407c-5aa8-4087-9dc0", // too short
      "4611407c-5aa8-4087-9dc0-97215c79a447-extra", // too long
      "GGGGGGGG-5aa8-4087-9dc0-97215c79a447", // invalid chars
    ];

    validUUIDs.forEach((uuid) => {
      it(`should recognize ${uuid} as a valid UUID`, async () => {
        mockSupabase.single.mockResolvedValue({
          data: { id: uuid },
          error: null,
        });

        const request = new NextRequest(
          "http://localhost:3000/api/public/menus/" + uuid
        );
        const params = Promise.resolve({ id: uuid });

        await GET(request, { params });

        expect(mockSupabase.eq).toHaveBeenCalledWith("id", uuid);
      });
    });

    invalidUUIDs.forEach((notUuid) => {
      it(`should recognize ${notUuid} as a slug, not UUID`, async () => {
        mockSupabase.single.mockResolvedValue({
          data: { slug: notUuid },
          error: null,
        });

        const request = new NextRequest(
          "http://localhost:3000/api/public/menus/" + notUuid
        );
        const params = Promise.resolve({ id: notUuid });

        await GET(request, { params });

        expect(mockSupabase.eq).toHaveBeenCalledWith("slug", notUuid);
      });
    });
  });
});
