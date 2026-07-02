import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan ?? "start";
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) break;

        const { rows } = await query(
          "SELECT id FROM fak_subscriptions WHERE user_id = $1",
          [userId]
        );

        let priceId: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          priceId = sub.items.data[0]?.price.id ?? null;
        }

        if (rows.length > 0) {
          await query(
            `UPDATE fak_subscriptions SET
               stripe_customer_id=$1, stripe_subscription_id=$2, stripe_price_id=$3,
               plan=$4, status='active', updated_at=$5
             WHERE user_id=$6`,
            [customerId, subscriptionId, priceId, plan, Math.floor(Date.now() / 1000), userId]
          );
        } else {
          await query(
            `INSERT INTO fak_subscriptions
               (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, plan, status)
             VALUES ($1,$2,$3,$4,$5,$6,'active')`,
            [randomUUID(), userId, customerId, subscriptionId, priceId, plan]
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const status = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "inactive";
        const priceId = sub.items.data[0]?.price.id ?? null;
        const periodEnd = sub.current_period_end;

        await query(
          `UPDATE fak_subscriptions SET
             stripe_price_id=$1, status=$2, current_period_end=$3,
             cancel_at_period_end=$4, updated_at=$5
           WHERE stripe_customer_id=$6`,
          [priceId, status, periodEnd, sub.cancel_at_period_end, Math.floor(Date.now() / 1000), customerId]
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        await query(
          "UPDATE fak_subscriptions SET plan='free', status='active', stripe_subscription_id=NULL WHERE stripe_customer_id=$1",
          [customerId]
        );
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = inv.customer as string;
        await query(
          "UPDATE fak_subscriptions SET status='past_due' WHERE stripe_customer_id=$1",
          [customerId]
        );
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
  }

  return NextResponse.json({ received: true });
}

// Raw body is needed for Stripe signature verification — Next.js App Router reads it via req.text()

