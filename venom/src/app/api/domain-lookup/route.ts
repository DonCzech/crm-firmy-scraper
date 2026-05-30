import { NextRequest } from "next/server";
import { queryOne } from "@/lib/db";

// Internal endpoint used only by proxy/middleware for custom domain resolution.
// Protected by INTERNAL_API_TOKEN to prevent abuse.
export async function GET(req: NextRequest) {
  const token = req.headers.get("x-internal-token");
  if (token !== (process.env.INTERNAL_API_TOKEN ?? "")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const domain = req.nextUrl.searchParams.get("domain");
  if (!domain) return Response.json({ error: "Missing domain" }, { status: 400 });

  const row = await queryOne<{ slug: string; www_redirect: string }>(
    `SELECT t.slug, d.www_redirect
     FROM tenants t
     JOIN domains d ON d.tenant_id = t.id
     WHERE d.domain = $1 AND d.verified = true`,
    [domain]
  );

  if (!row) return Response.json({ slug: null }, { status: 200 });

  return Response.json({ slug: row.slug, www_redirect: row.www_redirect });
}
