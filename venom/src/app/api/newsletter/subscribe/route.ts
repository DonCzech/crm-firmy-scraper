import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

/** Newsletter subscription — persistuje do newsletter_subscribers.
 *  TODO: wire up Mailchimp / Resend / Brevo when API key is available. */

export const dynamic = "force-dynamic";

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  tableReady = true;
}

export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, "newsletter", 5, 60 * 60_000);
  if (!limited.ok) return limited.response;
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Neplatný e-mail" }, { status: 400 });
    }

    await ensureTable();
    await query(
      `INSERT INTO newsletter_subscribers (email, source_url)
       VALUES ($1, $2)
       ON CONFLICT (email) DO NOTHING`,
      [email, req.headers.get("referer") ?? null]
    );

    /* TODO: forward to Mailchimp/Resend list */

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/newsletter/subscribe] error:", err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
