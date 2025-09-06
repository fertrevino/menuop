import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function handleStripeCustomerCreated(customer: Stripe.Customer) {
  try {
    const supabase = await createClient();

    // Check if we have a user associated with this customer's email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", customer.email)
      .single();

    if (userError) {
      console.error("Error finding user:", userError);
      return;
    }

    // Insert the customer record
    const { error: insertError } = await supabase
      .from("stripe_customers")
      .insert({
        user_id: userData?.id,
        stripe_customer_id: customer.id,
        email: customer.email,
        name: customer.name,
      });

    if (insertError) {
      console.error("Error inserting stripe customer:", insertError);
      return;
    }

    console.log("Successfully stored Stripe customer:", customer.id);
  } catch (error) {
    console.error("Error in handleStripeCustomerCreated:", error);
  }
}

export async function handleStripeSubscriptionCreated(
  subscription: Stripe.Subscription & {
    current_period_start: number;
    current_period_end: number;
  }
) {
  try {
    const supabase = await createClient();

    // Get the customer record
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("id")
      .eq("stripe_customer_id", subscription.customer)
      .single();

    if (customerError) {
      console.error("Error finding stripe customer:", customerError);
      return;
    }

    // Insert the subscription record
    const { error: insertError } = await supabase
      .from("stripe_subscriptions")
      .insert({
        customer_id: customerData.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: subscription.items.data[0].price.id,
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      });

    if (insertError) {
      console.error("Error inserting subscription:", insertError);
      return;
    }

    console.log("Successfully stored subscription:", subscription.id);
  } catch (error) {
    console.error("Error in handleStripeSubscriptionCreated:", error);
  }
}
