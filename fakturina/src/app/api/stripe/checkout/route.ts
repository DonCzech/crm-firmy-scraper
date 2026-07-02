import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getStripe, PLANS, type PlanKey } from "@/lib/stripe";
import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({ plan: z.enum(["start", "pro", "business"]) });

export async function POST(req: NextRequest) {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe není nakonfigurován" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Neplatný tarif" }, { status: 400 });

  const { plan } = parsed.data;
  const planConfig = PLANS[plan as PlanKey];
  if (!planConfig.priceId) return NextResponse.json({ error: "Cena není nastavena" }, { status: 400 });

  const { rows } = await query(
    "SELECT stripe_customer_id FROM fak_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  const existingCustomerId = rows[0]?.stripe_customer_id;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3020";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer: existingCustomerId ?? undefined,
    customer_email: existingCustomerId ? undefined : user.email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/settings/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/settings/billing?cancelled=1`,
    metadata: { userId: user.id, plan },
    locale: "cs",
  });

  return NextResponse.json({ url: session.url });
}
