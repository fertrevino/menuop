import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, formatStripePrice } from "@/lib/services/stripe";
import type Stripe from "stripe";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: "No subscription found",
      });
    }

    // Get customer's active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        success: true,
        subscription: null,
        message: "No active subscription",
      });
    }

    const currentSubscription = subscriptions.data[0];

    // Get subscription with expanded details
    const subscription = await stripe.subscriptions.retrieve(
      currentSubscription.id
    );
    // Get price and product details separately
    const price = await stripe.prices.retrieve(
      currentSubscription.items.data[0].price.id,
      { expand: ["product"] }
    );
    const product = price.product as Stripe.Product;

    // Get the period end date safely
    const subscriptionData = subscription as any;
    const timestamp = subscriptionData.current_period_end;
    const periodEndDate = new Date(timestamp * 1000);
    const periodEnd = !isNaN(periodEndDate.getTime())
      ? periodEndDate.toISOString()
      : new Date().toISOString();
    return NextResponse.json({
      success: true,
      subscription: {
        id: currentSubscription.id,
        status: currentSubscription.status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: currentSubscription.cancel_at_period_end,
        product: {
          name: product.name,
          description: product.description,
        },
        price: {
          amount: price.unit_amount,
          currency: price.currency,
          formattedAmount: formatStripePrice(
            price.unit_amount || 0,
            price.currency
          ),
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
        },
      },
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
