import { NextResponse } from "next/server";
import {
  buildSubscriptionLineItem,
  getAppUrl,
  getStripe,
  type PlanId,
} from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured (STRIPE_SECRET_KEY)" },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { plan?: string };
    const plan = body.plan as PlanId | undefined;
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [buildSubscriptionLineItem(plan)],
      success_url: `${appUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/subscribe/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "fr",
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
