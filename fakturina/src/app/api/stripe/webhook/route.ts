import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";
import Stripe from "stripe";
import { PLANS, type PlanKey } from "@/lib/stripe";

function planForPrice(priceId: string | null): PlanKey | null {
  if (!priceId) return null;
  const match = (Object.entries(PLANS) as Array<[PlanKey, (typeof PLANS)[PlanKey]]>)
    .find(([, plan]) => plan.priceId === priceId);
  return match?.[0] ?? null;
}

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

  const claimed = await query(
    `INSERT INTO fak_webhook_events (id, provider, event_type, status)
     VALUES ($1, 'stripe', $2, 'processing') ON CONFLICT (id) DO NOTHING RETURNING id`,
    [event.id, event.type]
  );
  if (!claimed.rows[0]) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
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

        const plan = planForPrice(priceId);
        if (!plan) throw new Error(`Neznámé Stripe Price ID: ${priceId ?? "missing"}`);

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
    await query(
      "UPDATE fak_webhook_events SET status = 'processed', processed_at = $1 WHERE id = $2",
      [Math.floor(Date.now() / 1000), event.id]
    );
  } catch (err) {
    console.error("Webhook handler error:", err);
    await query(
      "UPDATE fak_webhook_events SET status = 'error', error = $1 WHERE id = $2",
      [err instanceof Error ? err.message.slice(0, 1000) : "Unknown error", event.id]
    ).catch(() => undefined);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Raw body is needed for Stripe signature verification — Next.js App Router reads it via req.text()
