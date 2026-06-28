import { NextRequest, NextResponse } from "next/server";

/** Newsletter subscription stub. Logs to console.
 *  TODO: wire up Mailchimp / Resend / Brevo when API key is available. */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Neplatný e-mail" }, { status: 400 });
    }

    /* eslint-disable-next-line no-console */
    console.log("[newsletter] new subscriber:", email);

    /* TODO: forward to Mailchimp/Resend list */

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/newsletter/subscribe] error:", err);
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
