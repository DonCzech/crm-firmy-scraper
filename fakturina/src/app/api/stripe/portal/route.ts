import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { query } from "@/lib/db";

export async function POST() {
  const user = await requireSession().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe není nakonfigurován" }, { status: 503 });

  const { rows } = await query(
    "SELECT stripe_customer_id FROM fak_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) return NextResponse.json({ error: "Žádné předplatné" }, { status: 404 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3020";
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/dashboard/settings/billing`,
  });

  return NextResponse.json({ url: session.url });
}
