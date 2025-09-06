import { NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import { formatStripePrice } from "@/lib/services/stripe";

export async function GET() {
  try {
    // Get all active products
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"], // This will include the default price in the response
    });

    // Format the response to include price information
    const formattedProducts = products.data.map((product) => {
      const price = product.default_price as any; // We'll improve this typing later
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.images?.[0],
        active: product.active,
        price: price
          ? {
              id: price.id,
              currency: price.currency,
              unitAmount: price.unit_amount,
              formattedPrice: formatStripePrice(
                price.unit_amount || 0,
                price.currency
              ),
              interval: price.recurring?.interval,
              intervalCount: price.recurring?.interval_count,
            }
          : null,
        metadata: product.metadata,
        marketing_features: product.marketing_features,
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
