import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: "Free", price: 0, priceId: null },
  start: { name: "Start", price: 149, priceId: process.env.STRIPE_PRICE_START_MONTHLY ?? null },
  pro: { name: "Pro", price: 249, priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null },
  business: { name: "Business", price: 449, priceId: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? null },
} as const;

export type PlanKey = keyof typeof PLANS;
