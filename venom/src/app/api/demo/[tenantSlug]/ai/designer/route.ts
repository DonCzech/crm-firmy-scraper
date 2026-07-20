import { NextRequest } from "next/server";
import { z } from "zod";
import { query, queryOne, auditLog } from "@/lib/db";
import { assertSameOrigin, requireTenantAdmin } from "@/lib/demo-auth";
import { MODE_PRICING, type AiDesignMode } from "@/lib/ai-designer/pricing";
import { getWallet, holdCredits, settleHold, releaseHold } from "@/lib/ai-designer/credits";
import { buildDesignContext } from "@/lib/ai-designer/context";
import { classifyMode, runDesignRequest } from "@/lib/ai-designer/engine";
import { applyOperations, snapshotTenantDesign, recordCreatedCommerce } from "@/lib/ai-designer/apply";
import { revalidatePath } from "next/cache";

/**
 * POST /api/demo/<slug>/ai/designer — AI Designér (Claude Opus 4.8).
 *
 * Tok s garancí proti přečerpání kreditů:
 *   1. atomická rezervace kreditů (bez ní se AI vůbec nevolá),
 *   2. snapshot dotčených vrstev (plné undo),
 *   3. volání Claude → strukturované operace (žádný přístup k souborům),
 *   4. validace + aplikace na per-tenant DB vrstvy,
 *   5. settle rezervace / plná vratka při jakékoli chybě.
 */
export const maxDuration = 300;

interface RouteParams { params: Promise<{ tenantSlug: string }> }

const BodySchema = z.object({
  prompt: z.string().min(3).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(12)
    .default([]),
});

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data" }, { status: 422 });
  }

  const { prompt, history } = parsed.data;

  // Režim se určuje automaticky podle rozsahu požadavku — uživatel nic nevybírá,
  // platí férovou cenu 5/12/30 kreditů podle skutečné náročnosti.
  const mode: AiDesignMode = await classifyMode(prompt);
  const pricing = MODE_PRICING[mode];

  // 0) záznam požadavku (audit i UI historie)
  const requestRow = await queryOne<{ id: number }>(
    `INSERT INTO ai_design_requests (tenant_id, mode, prompt, credits_held)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [tenant.id, mode, prompt, pricing.credits]
  );
  const requestId = requestRow?.id ?? 0;

  // 1) atomická rezervace — jediná brána ke spotřebě kreditů
  const held = await holdCredits(tenant.id, pricing.credits, requestId);
  if (!held) {
    const wallet = await getWallet(tenant.id);
    await query(
      `UPDATE ai_design_requests SET status = 'failed', error = 'insufficient_credits', completed_at = now() WHERE id = $1`,
      [requestId]
    );
    return Response.json(
      { error: "insufficient_credits", message: "Nedostatek kreditů. Dobijte si prosím kredity.", balance: wallet.balance },
      { status: 402 }
    );
  }

  try {
    // 2) kontext + snapshot pro undo
    const context = await buildDesignContext(tenant.id, pricing.maxContextChars);
    await snapshotTenantDesign(tenant.id, requestId);

    // 3) Claude Opus — structured output
    const result = await runDesignRequest({
      prompt,
      mode: mode as AiDesignMode,
      contextText: context.text,
      history,
    });

    // 4) aplikace validovaných operací (tenant-scoped)
    const validIds = new Set(context.sectionIds);
    const applyResult = await applyOperations(tenant.id, result.operations, validIds);
    // id vytvořených commerce záznamů do snapshotu — undo je pak umí smazat
    await recordCreatedCommerce(tenant.id, requestId, applyResult.createdProductIds, applyResult.createdCategoryIds);
    const allSkipped = [...applyResult.skipped, ...result.invalidOps.map((i) => ({ op: i.op, reason: `validace: ${i.reason}` }))];

    // 5) settle — rezervace se stává útratou
    await settleHold(tenant.id, pricing.credits, requestId);
    await query(
      `UPDATE ai_design_requests
          SET status = 'done', credits_charged = $2, input_tokens = $3, output_tokens = $4,
              summary = $5, operations = $6, completed_at = now()
        WHERE id = $1`,
      [
        requestId,
        pricing.credits,
        result.inputTokens,
        result.outputTokens,
        result.summary,
        JSON.stringify(result.operations),
      ]
    );

    await auditLog("ai_designer_applied", {
      tenantId: tenant.id,
      targetType: "tenant",
      targetId: String(tenant.id),
      extra: { requestId, mode, applied: applyResult.applied, skipped: applyResult.skipped.length },
    });

    revalidatePath(`/demo/${tenantSlug}`);

    const wallet = await getWallet(tenant.id);
    return Response.json({
      requestId,
      summary: result.summary,
      operations: result.operations,
      applied: applyResult.applied,
      skipped: allSkipped,
      creditsCharged: pricing.credits,
      balance: wallet.balance,
    });
  } catch (err) {
    // JAKÁKOLI chyba = plná vratka rezervace, uživatel nepřichází o kredity
    const message = err instanceof Error ? err.message : "Neznámá chyba";
    await releaseHold(tenant.id, pricing.credits, requestId, message);
    await query(
      `UPDATE ai_design_requests SET status = 'failed', error = $2, completed_at = now() WHERE id = $1`,
      [requestId, message.slice(0, 500)]
    );
    const wallet = await getWallet(tenant.id);
    console.error("[ai/designer]", err);
    return Response.json({ error: "ai_failed", message, balance: wallet.balance }, { status: 502 });
  }
}

/** GET — historie požadavků pro obnovení chatu. */
export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!assertSameOrigin(req)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const { tenantSlug } = await params;
  const { ok, tenant } = await requireTenantAdmin(tenantSlug);
  if (!tenant) return Response.json({ error: "Tenant not found" }, { status: 404 });
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await query(
    `SELECT r.id, r.mode, r.prompt, r.status, r.credits_charged, r.summary, r.error, r.created_at,
            (s.id IS NOT NULL AND s.restored_at IS NULL) AS can_undo
       FROM ai_design_requests r
       LEFT JOIN ai_design_snapshots s ON s.request_id = r.id AND s.tenant_id = r.tenant_id
      WHERE r.tenant_id = $1
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT 25`,
    [tenant.id]
  );
  return Response.json({ requests });
}
