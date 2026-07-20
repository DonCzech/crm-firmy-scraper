import { query } from "@/lib/db";
import { initCommerceDb } from "./schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LoyaltyAccount {
  id: number;
  tenant_id: number;
  customer_id: number;
  points: number;
  total_earned: number;
  total_spent: number;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  account_id: number;
  points: number;
  type: string;
  order_id: number | null;
  description: string | null;
  created_at: string;
}

export type EarnType = "purchase" | "review" | "referral" | "bonus" | "signup";

/* ------------------------------------------------------------------ */
/*  Tier logic                                                         */
/* ------------------------------------------------------------------ */

const TIER_THRESHOLDS: [number, string][] = [
  [5000, "platinum"],
  [2000, "gold"],
  [500, "silver"],
  [0, "bronze"],
];

export function calculateTier(totalEarned: number): string {
  for (const [threshold, tier] of TIER_THRESHOLDS) {
    if (totalEarned >= threshold) return tier;
  }
  return "bronze";
}

/* ------------------------------------------------------------------ */
/*  Points ↔ money                                                     */
/* ------------------------------------------------------------------ */

/** Converts loyalty points to CZK cents (1 point = 1 CZK = 100 cents). */
export function getPointsValue(points: number): number {
  return points * 100;
}

/* ------------------------------------------------------------------ */
/*  Account helpers                                                    */
/* ------------------------------------------------------------------ */

export async function getAccount(
  tenantId: number,
  customerId: number,
): Promise<LoyaltyAccount | null> {
  await initCommerceDb();
  const rows = await query<LoyaltyAccount>(
    `SELECT id, tenant_id, customer_id, points, total_earned, total_spent, tier, created_at, updated_at
     FROM commerce_loyalty_accounts
     WHERE tenant_id = $1 AND customer_id = $2
     LIMIT 1`,
    [tenantId, customerId],
  );
  return rows[0] ?? null;
}

export async function getOrCreateAccount(
  tenantId: number,
  customerId: number,
): Promise<LoyaltyAccount> {
  await initCommerceDb();
  const existing = await getAccount(tenantId, customerId);
  if (existing) return existing;

  const rows = await query<LoyaltyAccount>(
    `INSERT INTO commerce_loyalty_accounts (tenant_id, customer_id, points, total_earned, total_spent, tier)
     VALUES ($1, $2, 0, 0, 0, 'bronze')
     RETURNING id, tenant_id, customer_id, points, total_earned, total_spent, tier, created_at, updated_at`,
    [tenantId, customerId],
  );
  return rows[0];
}

/* ------------------------------------------------------------------ */
/*  Earn / spend                                                       */
/* ------------------------------------------------------------------ */

export async function earnPoints(
  tenantId: number,
  customerId: number,
  points: number,
  type: EarnType,
  orderId?: number | null,
  description?: string | null,
): Promise<LoyaltyAccount> {
  await initCommerceDb();
  const account = await getOrCreateAccount(tenantId, customerId);

  const newTotalEarned = account.total_earned + points;
  const newTier = calculateTier(newTotalEarned);

  // Create transaction
  await query(
    `INSERT INTO commerce_loyalty_transactions (account_id, points, type, order_id, description)
     VALUES ($1, $2, $3, $4, $5)`,
    [account.id, points, type, orderId ?? null, description ?? null],
  );

  // Update account
  const rows = await query<LoyaltyAccount>(
    `UPDATE commerce_loyalty_accounts
     SET points = points + $1, total_earned = total_earned + $1, tier = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING id, tenant_id, customer_id, points, total_earned, total_spent, tier, created_at, updated_at`,
    [points, newTier, account.id],
  );
  return rows[0];
}

export async function spendPoints(
  tenantId: number,
  customerId: number,
  points: number,
  orderId?: number | null,
  description?: string | null,
): Promise<LoyaltyAccount> {
  await initCommerceDb();
  const account = await getOrCreateAccount(tenantId, customerId);

  if (account.points < points) {
    throw new Error(
      `Insufficient loyalty points: has ${account.points}, needs ${points}`,
    );
  }

  // Create transaction (negative points)
  await query(
    `INSERT INTO commerce_loyalty_transactions (account_id, points, type, order_id, description)
     VALUES ($1, $2, 'spend', $3, $4)`,
    [account.id, -points, orderId ?? null, description ?? null],
  );

  // Update account
  const rows = await query<LoyaltyAccount>(
    `UPDATE commerce_loyalty_accounts
     SET points = points - $1, total_spent = total_spent + $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, tenant_id, customer_id, points, total_earned, total_spent, tier, created_at, updated_at`,
    [points, account.id],
  );
  return rows[0];
}

/* ------------------------------------------------------------------ */
/*  Order points shortcut                                              */
/* ------------------------------------------------------------------ */

/** Awards 1 loyalty point per 100 CZK spent (orderTotalCents is in halere). */
export async function awardOrderPoints(
  tenantId: number,
  customerId: number,
  orderTotalCents: number,
  orderId?: number | null,
): Promise<LoyaltyAccount> {
  const pts = Math.floor(orderTotalCents / 10000);
  if (pts <= 0) {
    return getOrCreateAccount(tenantId, customerId);
  }
  return earnPoints(
    tenantId,
    customerId,
    pts,
    "purchase",
    orderId,
    `Order purchase: ${pts} pts`,
  );
}

/* ------------------------------------------------------------------ */
/*  Checkout integration (modul vernostni-slevy)                       */
/* ------------------------------------------------------------------ */

/** Procentní sleva podle věrnostní úrovně zákazníka. */
export const TIER_DISCOUNT_PCT: Record<string, number> = {
  bronze: 0,
  silver: 2,
  gold: 3,
  platinum: 5,
};

export const TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

/**
 * Věrnostní sleva pro checkout — dohledá zákazníka podle e-mailu a vrátí
 * slevový řádek dle jeho úrovně (silver 2 %, gold 3 %, platinum 5 %).
 */
export async function computeLoyaltyDiscount(
  tenantId: number,
  email: string,
  subtotalCents: number,
): Promise<{ source: string; label: string; amount_cents: number } | null> {
  await initCommerceDb();
  const rows = await query<{ tier: string; points: number }>(
    `SELECT la.tier, la.points
     FROM commerce_loyalty_accounts la
     JOIN customers c ON c.id = la.customer_id
     WHERE la.tenant_id = $1 AND lower(c.email) = lower($2)
     LIMIT 1`,
    [tenantId, email.trim()],
  );
  const account = rows[0];
  if (!account) return null;
  const pct = TIER_DISCOUNT_PCT[account.tier] ?? 0;
  if (pct <= 0 || subtotalCents <= 0) return null;
  return {
    source: "vernostni-slevy",
    label: `Věrnostní sleva (${TIER_LABELS[account.tier] ?? account.tier}) −${pct} %`,
    amount_cents: Math.round((subtotalCents * pct) / 100),
  };
}

/** Připíše body za objednávku zákazníkovi dle e-mailu (fire-and-forget z checkoutu). */
export async function awardOrderPointsByEmail(
  tenantId: number,
  email: string,
  orderTotalCents: number,
  orderId?: number | null,
): Promise<LoyaltyAccount | null> {
  await initCommerceDb();
  const rows = await query<{ id: number }>(
    `SELECT id FROM customers WHERE tenant_id = $1 AND lower(email) = lower($2) LIMIT 1`,
    [tenantId, email.trim()],
  );
  const customer = rows[0];
  if (!customer) return null;
  return awardOrderPoints(tenantId, customer.id, orderTotalCents, orderId);
}

/* ------------------------------------------------------------------ */
/*  Transaction history                                                */
/* ------------------------------------------------------------------ */

export async function getTransactions(
  tenantId: number,
  customerId: number,
  opts?: { page?: number; perPage?: number },
): Promise<{ data: LoyaltyTransaction[]; total: number }> {
  await initCommerceDb();
  const account = await getAccount(tenantId, customerId);
  if (!account) return { data: [], total: 0 };

  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 20;
  const offset = (page - 1) * perPage;

  const [rows, countRows] = await Promise.all([
    query<LoyaltyTransaction>(
      `SELECT id, account_id, points, type, order_id, description, created_at
       FROM commerce_loyalty_transactions
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [account.id, perPage, offset],
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM commerce_loyalty_transactions WHERE account_id = $1`,
      [account.id],
    ),
  ]);

  return { data: rows, total: parseInt(countRows[0]?.count ?? "0", 10) };
}

/* ------------------------------------------------------------------ */
/*  Admin stats                                                        */
/* ------------------------------------------------------------------ */

interface TierCount {
  tier: string;
  count: string;
}

export interface LoyaltyStats {
  totalAccounts: number;
  pointsInCirculation: number;
  tierDistribution: Record<string, number>;
}

export async function getLoyaltyStats(tenantId: number): Promise<LoyaltyStats> {
  await initCommerceDb();

  const [totals, tiers] = await Promise.all([
    query<{ total_accounts: string; points_in_circulation: string }>(
      `SELECT COUNT(*)::text AS total_accounts, COALESCE(SUM(points), 0)::text AS points_in_circulation
       FROM commerce_loyalty_accounts WHERE tenant_id = $1`,
      [tenantId],
    ),
    query<TierCount>(
      `SELECT tier, COUNT(*)::text AS count
       FROM commerce_loyalty_accounts WHERE tenant_id = $1
       GROUP BY tier`,
      [tenantId],
    ),
  ]);

  const row = totals[0];
  const tierDistribution: Record<string, number> = {};
  for (const t of tiers) {
    tierDistribution[t.tier] = parseInt(t.count, 10);
  }

  return {
    totalAccounts: parseInt(row?.total_accounts ?? "0", 10),
    pointsInCirculation: parseInt(row?.points_in_circulation ?? "0", 10),
    tierDistribution,
  };
}
