import { NextRequest } from "next/server";
import { getTenantBySlug, query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Demo skladový feed pro modul „Synchronizace skladu" — CSV sku,qty
 * s deterministicky obměněnými stavy (simulace externího skladu/ERP).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return new Response("Not found", { status: 404 });

  const variants = await query<{ id: number; sku: string | null }>(
    `SELECT v.id, v.sku FROM product_variants v
     JOIN products p ON p.id = v.product_id
     WHERE p.tenant_id = $1 AND v.sku IS NOT NULL AND v.sku <> ''
     ORDER BY v.id`,
    [tenant.id]
  );

  // Stavy se mění po hodinách, aby opakovaný sync měl co aktualizovat
  const hourSeed = Math.floor(Date.now() / 3_600_000);
  const lines = ["sku,qty"];
  for (const v of variants) {
    const qty = (v.id * 7 + hourSeed * 13) % 42;
    lines.push(`${v.sku},${qty}`);
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8" },
  });
}
