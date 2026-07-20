import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";

export interface ABTest {
  id: number;
  tenant_id: number;
  name: string;
  entity_type: string;
  entity_id: number;
  variant_a: Record<string, unknown>;
  variant_b: Record<string, unknown>;
  traffic_split: number;
  views_a: number;
  views_b: number;
  conversions_a: number;
  conversions_b: number;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  winner: string | null;
  created_at: string;
}

export async function createABTest(tenantId: number, data: {
  name: string;
  entity_type: string;
  entity_id: number;
  variant_a: Record<string, unknown>;
  variant_b: Record<string, unknown>;
  traffic_split?: number;
}): Promise<ABTest> {
  await initCommerceDb();
  const row = await queryOne<ABTest>(
    `INSERT INTO commerce_ab_tests (tenant_id, name, entity_type, entity_id, variant_a, variant_b, traffic_split)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [tenantId, data.name, data.entity_type, data.entity_id,
     JSON.stringify(data.variant_a), JSON.stringify(data.variant_b), data.traffic_split ?? 50]
  );
  return row!;
}

export async function listABTests(tenantId: number, status?: string) {
  await initCommerceDb();
  if (status) {
    return query<ABTest>(
      `SELECT * FROM commerce_ab_tests WHERE tenant_id = $1 AND status = $2 ORDER BY created_at DESC`,
      [tenantId, status]
    ) ?? [];
  }
  return query<ABTest>(
    `SELECT * FROM commerce_ab_tests WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  ) ?? [];
}

export async function getABTest(tenantId: number, testId: number) {
  await initCommerceDb();
  return queryOne<ABTest>(
    `SELECT * FROM commerce_ab_tests WHERE id = $1 AND tenant_id = $2`,
    [testId, tenantId]
  );
}

export async function startABTest(tenantId: number, testId: number) {
  await initCommerceDb();
  await query(
    `UPDATE commerce_ab_tests SET status = 'running', started_at = now() WHERE id = $1 AND tenant_id = $2 AND status = 'draft'`,
    [testId, tenantId]
  );
}

export async function stopABTest(tenantId: number, testId: number, winner?: "a" | "b") {
  await initCommerceDb();
  await query(
    `UPDATE commerce_ab_tests SET status = 'completed', ended_at = now(), winner = $3
     WHERE id = $1 AND tenant_id = $2 AND status = 'running'`,
    [testId, tenantId, winner ?? null]
  );
}

export async function recordView(tenantId: number, testId: number, variant: "a" | "b") {
  await initCommerceDb();
  const col = variant === "a" ? "views_a" : "views_b";
  await query(
    `UPDATE commerce_ab_tests SET ${col} = ${col} + 1 WHERE id = $1 AND tenant_id = $2 AND status = 'running'`,
    [testId, tenantId]
  );
}

export async function recordConversion(tenantId: number, testId: number, variant: "a" | "b") {
  await initCommerceDb();
  const col = variant === "a" ? "conversions_a" : "conversions_b";
  await query(
    `UPDATE commerce_ab_tests SET ${col} = ${col} + 1 WHERE id = $1 AND tenant_id = $2 AND status = 'running'`,
    [testId, tenantId]
  );
}

export function assignVariant(test: ABTest, sessionId: string): "a" | "b" {
  let hash = 0;
  const key = `${test.id}:${sessionId}`;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100 < test.traffic_split ? "a" : "b";
}

export function calculateSignificance(test: ABTest): {
  rate_a: number;
  rate_b: number;
  lift: number;
  confidence: number;
  significant: boolean;
} {
  const rA = test.views_a > 0 ? test.conversions_a / test.views_a : 0;
  const rB = test.views_b > 0 ? test.conversions_b / test.views_b : 0;
  const lift = rA > 0 ? ((rB - rA) / rA) * 100 : 0;

  const nA = test.views_a;
  const nB = test.views_b;
  if (nA < 30 || nB < 30) return { rate_a: rA, rate_b: rB, lift, confidence: 0, significant: false };

  const seA = Math.sqrt((rA * (1 - rA)) / nA);
  const seB = Math.sqrt((rB * (1 - rB)) / nB);
  const seDiff = Math.sqrt(seA * seA + seB * seB);
  const z = seDiff > 0 ? Math.abs(rB - rA) / seDiff : 0;

  const confidence = z > 2.576 ? 99 : z > 1.96 ? 95 : z > 1.645 ? 90 : z > 1.28 ? 80 : Math.round(z * 40);
  return { rate_a: rA, rate_b: rB, lift, confidence, significant: confidence >= 95 };
}
