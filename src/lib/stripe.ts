import Stripe from "stripe";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  return new Stripe(key);
}

export type PlanId = "monthly" | "yearly";

export const PLAN_AMOUNTS_EUR_CENTS: Record<PlanId, number> = {
  monthly: Number(process.env.STRIPE_AMOUNT_MONTHLY_CENTS ?? 1999),
  yearly: Number(process.env.STRIPE_AMOUNT_YEARLY_CENTS ?? 14900),
};

export function getPriceId(plan: PlanId): string | undefined {
  if (plan === "monthly") return process.env.STRIPE_PRICE_MONTHLY || undefined;
  return process.env.STRIPE_PRICE_YEARLY || undefined;
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://127.0.0.1:3000";
}

export function buildSubscriptionLineItem(plan: PlanId): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = getPriceId(plan);
  if (priceId) {
    return { price: priceId, quantity: 1 };
  }

  const amount = PLAN_AMOUNTS_EUR_CENTS[plan];
  return {
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: amount,
      recurring: {
        interval: plan === "monthly" ? "month" : "year",
      },
      product_data: {
        name: plan === "monthly" ? "MIKBOOK — Mensuel" : "MIKBOOK — Annuel",
        description: "Accès abonnement à la plateforme MIKBOOK",
      },
    },
  };
}
