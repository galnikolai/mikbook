import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/** Confirm Checkout Session and return customer id for cookie on success page. */
export async function GET(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    const sessionId = new URL(request.url).searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Session not complete" }, { status: 400 });
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;

    if (!customerId) {
      return NextResponse.json({ error: "No customer on session" }, { status: 400 });
    }

    const response = NextResponse.json({
      customerId,
      email: session.customer_details?.email ?? session.customer_email,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id,
    });

    response.cookies.set("mikbook_stripe_customer", customerId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session lookup failed";
    console.error("[stripe/session]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
