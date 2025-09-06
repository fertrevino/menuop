import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/services/stripe";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    console.log("Received webhook request");
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    console.log("Webhook signature:", sig ? "Present" : "Missing");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Log important events but don't store them
    console.log("Processing webhook event:", event.type);
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        console.log(`Subscription ${event.type}:`, event.data.object.id);
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        console.log(`Invoice ${event.type}:`, event.data.object.id);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Configure segment size for raw body
export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60, // Set maximum duration to 60 seconds
};
