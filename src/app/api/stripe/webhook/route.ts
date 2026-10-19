import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.info("[stripe] checkout.session.completed", {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription,
        email: session.customer_details?.email ?? session.customer_email,
      });
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.info(`[stripe] ${event.type}`, {
        id: sub.id,
        status: sub.status,
        customer: sub.customer,
      });
      break;
    }
    default:
      break;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe/webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error("[stripe/webhook] handler", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
