import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/services/stripe";
import { incrementImageGenerationUsage } from "@/lib/services/usage";
import { FREE_IMAGE_DAILY_LIMIT } from "@/lib/config/limits";

// Initialize Gemini AI for image generation
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

// Structured response type for the generated image payload
interface ImageGenerationResponse {
  imageUrl: string;
  alt: string;
  prompt: string;
  source: "gemini-generated";
  subscription: "paid" | "free";
  limit?: number;
  count?: number;
  remaining?: number;
  reset?: string; // ISO timestamp for when quota resets
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dishName, description, style = "professional" } = body;

    console.log(`🤖 AI Image generation request for: "${dishName}"`);

    if (!dishName) {
      return NextResponse.json(
        { error: "Dish name is required" },
        { status: 400 }
      );
    }

    // Auth & usage limiting
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Determine subscription status (active => skip limit). Simple Stripe lookup by email.
    let isPaid = false;
    try {
      const customers = await stripe.customers.list({
        email: user.email || undefined,
        limit: 1,
      });
      if (customers.data.length) {
        const subs = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: "active",
          limit: 1,
        });
        isPaid = subs.data.length > 0;
      }
    } catch (subErr) {
      console.error("Subscription check failed", subErr);
      // Default to treating user as free if check fails
    }

    let usageInfo: { count: number; remaining: number; limit: number } | null =
      null;

    if (!isPaid) {
      try {
        console.log(
          `[rate] Pre-increment user=${user.id} limit=${FREE_IMAGE_DAILY_LIMIT}`
        );
        const usage = await incrementImageGenerationUsage(
          user.id,
          FREE_IMAGE_DAILY_LIMIT
        );
        console.log(
          `[rate] Post-increment user=${user.id} newCount=${usage.newCount} withinLimit=${usage.withinLimit} limit=${FREE_IMAGE_DAILY_LIMIT}`
        );
        if (!usage.withinLimit) {
          const resetTs = new Date();
          resetTs.setUTCHours(24, 0, 0, 0);
          const headers: Record<string, string> = {
            "X-RateLimit-Limit": String(FREE_IMAGE_DAILY_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(resetTs.getTime() / 1000)),
          };
          console.warn(
            `[rate] LIMIT REACHED user=${user.id} count=${usage.newCount} limit=${FREE_IMAGE_DAILY_LIMIT}`
          );
          return new NextResponse(
            JSON.stringify({
              error: "Daily free image generation limit reached",
              code: "RATE_LIMIT_EXCEEDED",
              limit: FREE_IMAGE_DAILY_LIMIT,
              count: usage.newCount,
              remaining: 0,
              upgrade: true,
              reset: resetTs.toISOString(),
            }),
            {
              status: 429,
              headers: { "Content-Type": "application/json", ...headers },
            }
          );
        }
        const remaining = Math.max(0, FREE_IMAGE_DAILY_LIMIT - usage.newCount);
        usageInfo = {
          count: usage.newCount,
          remaining,
          limit: FREE_IMAGE_DAILY_LIMIT,
        };
        console.log(
          `Image generation usage for user ${user.id}: ${usageInfo.count}/${FREE_IMAGE_DAILY_LIMIT}`
        );
      } catch (usageErr) {
        console.error(
          `[rate] Usage tracking failed user=${user.id} limit=${FREE_IMAGE_DAILY_LIMIT}`,
          usageErr
        );
        // Fail closed: block generation if we cannot enforce quota
        return NextResponse.json(
          { error: "Usage tracking error" },
          { status: 500 }
        );
      }
    }

    // Check if Gemini API is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.log("⚠️ No Gemini API key configured");
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    try {
      // Create a detailed prompt for food photography
      const prompt = createFoodImagePrompt(dishName, description, style);

      console.log(`📝 Generated prompt: ${prompt}`);

      // Generate image using Gemini 2.5 Flash Image model
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
      });

      // Process the response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          console.log(`✅ Successfully generated image for "${dishName}"`);

          // Convert base64 to data URL
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;

          const jsonBody: ImageGenerationResponse = {
            imageUrl,
            alt: dishName,
            prompt,
            source: "gemini-generated",
            subscription: isPaid ? "paid" : "free",
          };
          if (usageInfo) {
            jsonBody.limit = usageInfo.limit;
            jsonBody.count = usageInfo.count;
            jsonBody.remaining = usageInfo.remaining;
            const resetTs = new Date();
            resetTs.setUTCHours(24, 0, 0, 0);
            jsonBody.reset = resetTs.toISOString();
            const response = NextResponse.json(jsonBody);
            response.headers.set("X-RateLimit-Limit", String(usageInfo.limit));
            response.headers.set(
              "X-RateLimit-Remaining",
              String(usageInfo.remaining)
            );
            response.headers.set(
              "X-RateLimit-Reset",
              String(Math.floor(resetTs.getTime() / 1000))
            );
            return response;
          }
          return NextResponse.json(jsonBody);
        }

        if (part.text) {
          console.log(`� Gemini response text: ${part.text}`);
        }
      }

      // If we get here, no image was generated
      console.log("❌ No image generated in response");
      const errorResp = NextResponse.json(
        { error: "No image was generated by Gemini" },
        { status: 500 }
      );
      if (usageInfo) {
        errorResp.headers.set("X-RateLimit-Limit", String(usageInfo.limit));
        errorResp.headers.set(
          "X-RateLimit-Remaining",
          String(usageInfo.remaining)
        );
      }
      return errorResp;
    } catch (aiError: unknown) {
      console.error("🚫 Gemini AI error:", aiError);
      const errorResp = NextResponse.json(
        {
          error: `AI generation failed: ${
            aiError instanceof Error ? aiError.message : "Unknown error"
          }`,
        },
        { status: 500 }
      );
      if (usageInfo) {
        errorResp.headers.set("X-RateLimit-Limit", String(usageInfo.limit));
        errorResp.headers.set(
          "X-RateLimit-Remaining",
          String(usageInfo.remaining)
        );
      }
      return errorResp;
    }
  } catch (error) {
    console.error("💥 Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}

function createFoodImagePrompt(
  dishName: string,
  description?: string,
  style: string = "professional"
): string {
  const baseDesc = description?.trim()
    ? `${dishName} – ${description.trim()}`
    : dishName;

  const stylePrompts = {
    professional:
      "restaurant menu style, balanced lighting, appetizing, subtle depth of field",
    rustic:
      "rustic homestyle setting, warm natural light, wooden surface, authentic",
    elegant: "fine dining plating, refined minimal garnish, soft side lighting",
    casual: "casual everyday presentation, natural daylight, approachable",
    modern: "modern minimalist plating, clean background, contemporary styling",
    minimalist: "minimalist composition, neutral background, simple styling",
    simple: "simple straightforward plating, neutral backdrop",
    artistic:
      "creative plating, vibrant but tasteful colors, slight overhead angle",
    realistic: "true-to-life look, natural colors, natural light",
  } as const;

  const selectedStyle =
    stylePrompts[(style as keyof typeof stylePrompts) || "professional"] ||
    stylePrompts.professional;

  const variability = [
    "soft shadows",
    "45-degree angle",
    "slight overhead angle",
    "natural color grading",
    "balanced composition",
    "gentle depth of field",
  ];
  const picked = variability.sort(() => 0.5 - Math.random()).slice(0, 2);

  // Aim for less over-produced look (avoid always ultra-high resolution phrasing)
  return `Square 1:1 food photograph of ${baseDesc}. Style focus: ${selectedStyle}. Include ${picked.join(
    " and "
  )}. Realistic portion size, no text, no watermark, natural appealing lighting.`;
}

export async function GET() {
  return NextResponse.json({
    status: "Gemini AI Image Generation API",
    configured: !!process.env.GOOGLE_GEMINI_API_KEY,
    model: "gemini-2.5-flash-image-preview",
    capabilities: ["text-to-image", "professional-food-photography"],
  });
}
