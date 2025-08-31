import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import {
  getImageRecommendations,
  getBestImageRecommendation,
} from "../../lib/services/imageRecommendation";

// Mock fetch for testing
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("Image Recommendation Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getImageRecommendations", () => {
    test("should return AI-generated suggestions when available", async () => {
      // Mock successful AI image generation
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imageUrl: "https://ai-generated-image.com/test.jpg",
          }),
      } as Response);

      const suggestions = await getImageRecommendations("pizza");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty("url");
      expect(suggestions[0]).toHaveProperty("alt");
      expect(suggestions[0]).toHaveProperty("source");
      expect(suggestions[0].source).toBe("ai-generated");
    });

    test("should return empty array when AI generation fails", async () => {
      // Mock failed AI generation
      mockFetch.mockRejectedValue(new Error("AI generation failed"));

      const suggestions = await getImageRecommendations("caesar salad");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBe(0);
    });

    test("should limit results based on maxResults parameter", async () => {
      // Mock multiple successful AI generations
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imageUrl: "https://ai-generated-image.com/test.jpg",
          }),
      } as Response);

      const suggestions = await getImageRecommendations("burger", undefined, {
        maxResults: 2,
      });

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    test("should return empty array for empty dish name", async () => {
      const suggestions = await getImageRecommendations("");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBe(0);
    });
  });

  describe("getBestImageRecommendation", () => {
    test("should return a single AI-generated suggestion", async () => {
      // Mock successful AI generation
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imageUrl: "https://ai-generated-image.com/pizza.jpg",
          }),
      } as Response);

      const suggestion = await getBestImageRecommendation("margherita pizza");

      expect(suggestion).toBeDefined();
      if (suggestion) {
        expect(suggestion).toHaveProperty("url");
        expect(suggestion).toHaveProperty("alt");
        expect(suggestion).toHaveProperty("source");
        expect(suggestion.source).toBe("ai-generated");
      }
    });

    test("should return null when AI generation fails", async () => {
      // Mock failed AI generation
      mockFetch.mockRejectedValue(new Error("AI generation failed"));

      const suggestion = await getBestImageRecommendation("test dish");

      expect(suggestion).toBeNull();
    });

    test("should return null for empty dish name", async () => {
      const suggestion = await getBestImageRecommendation("");

      expect(suggestion).toBeNull();
    });
  });

  describe("search term generation", () => {
    test("should handle dish names with special characters", async () => {
      // Mock successful AI generation
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imageUrl: "https://ai-generated-image.com/fish-chips.jpg",
          }),
      } as Response);

      const suggestions = await getImageRecommendations("Fish & Chips");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    test("should handle dish names with articles", async () => {
      // Mock successful AI generation
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            imageUrl: "https://ai-generated-image.com/burger.jpg",
          }),
      } as Response);

      const suggestions = await getImageRecommendations("The Ultimate Burger");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    test("should handle API failures gracefully", async () => {
      // Mock all API responses to fail
      mockFetch.mockRejectedValue(new Error("API Error"));

      const suggestions = await getImageRecommendations("test dish");

      // Should return empty array when AI generation fails
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBe(0);
    });

    test("should handle non-AI mode gracefully", async () => {
      const suggestions = await getImageRecommendations(
        "test dish",
        undefined,
        {
          useAI: false,
        }
      );

      // Should return empty array when AI is disabled
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBe(0);
    });
  });
});
