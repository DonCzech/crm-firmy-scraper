import { NextRequest } from "next/server";
import { jsonOk } from "@/lib/apiAuth";

/**
 * Sběr klientských chyb — loguje do server konzole (viditelné v provozních
 * lozích). Při nasazení Sentry stačí tento endpoint nahradit SDK.
 */
export async function POST(req: NextRequest) {
  try {
    const { message, stack, url, digest } = await req.json();
    console.error(
      `[client-error] ${new Date().toISOString()} ${url || "?"}\n${message || ""}${digest ? `\ndigest: ${digest}` : ""}\n${(stack || "").slice(0, 1500)}`
    );
  } catch {
    // nevalidní payload ignorujeme
  }
  return jsonOk({ ok: true });
}
