import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil", // Use the latest API version
});

// Client-side Stripe instance
export const getStripeClient = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Missing Stripe publishable key");
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

// Helper to format price for display
export const formatStripePrice = (amount: number, currency: string) => {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
  return numberFormat.format((amount || 0) / 100);
};
