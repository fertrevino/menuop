import { stripe } from "./stripe";
import type Stripe from "stripe";

/**
 * Get a customer's active subscription
 */
export async function getActiveSubscription(stripeCustomerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
    limit: 1,
  });
  return subscriptions.data[0];
}

/**
 * Get subscription details including the product information
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });
}

/**
 * Get a customer's payment method
 */
export async function getCustomerPaymentMethod(stripeCustomerId: string) {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: stripeCustomerId,
    type: "card",
  });
  return paymentMethods.data[0];
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  return await stripe.subscriptions.update(subscriptionId, {
    items: [{ price: priceId }],
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Create a checkout session for subscription
 */
export async function createSubscriptionCheckout(
  priceId: string,
  customerId: string,
  successUrl: string,
  cancelUrl: string
) {
  return await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
