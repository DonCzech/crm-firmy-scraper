import { NextRequest } from "next/server";
import { query, withTransaction } from "@/lib/db";
import { requireCommerceAdmin, jsonError } from "@/lib/commerce/api-guard";
import { applyTreeUpdates, hasCycle, validateTreeUpdates, type CategoryTreeNode } from "@/lib/commerce/category-tree";

export const dynamic = "force-dynamic";

type TreeNode = CategoryTreeNode & { sort_order: number };

export async function POST(req: NextRequest, { params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const guard = await requireCommerceAdmin(req, tenantSlug);
  if (!guard.ok) return guard.response;

  const { tree } = await req.json() as { tree: TreeNode[] };
  if (!Array.isArray(tree)) return jsonError("Neplatná data");

  // Every id and parent_id must belong to this tenant.
  const existing = await query<{ id: number; parent_id: number | null }>(
    "SELECT id, parent_id FROM product_categories WHERE tenant_id = $1",
    [guard.tenant.id]
  );
  const invalid = validateTreeUpdates(new Set(existing.map((c) => c.id)), tree);
  if (invalid) return jsonError(invalid);

  // Simulate the final parent map and reject any cycle before touching the DB.
  if (hasCycle(applyTreeUpdates(existing, tree))) {
    return jsonError("Přeuspořádání by vytvořilo cyklus v kategoriích");
  }

  await withTransaction(async (client) => {
    for (const node of tree) {
      await client.query(
        `UPDATE product_categories
         SET parent_id = $1, sort_order = $2, updated_at = now()
         WHERE tenant_id = $3 AND id = $4`,
        [node.parent_id, node.sort_order, guard.tenant.id, node.id]
      );
    }
  });

  return Response.json({ ok: true });
}
