import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAppUrl, getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 },
      );
    }

    const jar = await cookies();
    const customerId = jar.get("mikbook_stripe_customer")?.value;
    if (!customerId) {
      return NextResponse.json(
        { error: "No active customer — subscribe first" },
        { status: 401 },
      );
    }

    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getAppUrl(),
    });

    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal failed";
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
