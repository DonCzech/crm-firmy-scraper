import { cookies } from "next/headers";
import { query } from "./db";
import { createHash } from "crypto";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fak_session")?.value;
  if (!token) return null;

  const now = Math.floor(Date.now() / 1000);
  const { rows } = await query(
    `SELECT s.token, u.id, u.email, u.name
     FROM fak_sessions s
     JOIN fak_users u ON u.id = s.user_id
     WHERE (s.token = $1 OR s.token = $2) AND s.expires_at > $3`,
    [hashSessionToken(token), token, now]
  );
  return rows[0] ?? null;
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function getUserCompany(userId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_companies WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1",
    [userId]
  );
  return rows[0] ?? null;
}

export async function getSubscription(userId: string) {
  const { rows } = await query(
    "SELECT * FROM fak_subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  return rows[0] ?? { plan: "free", status: "active" };
}

export const PLAN_LIMITS = {
  free: { invoicesPerMonth: 5, clients: 10, multiCompany: false, api: false },
  start: { invoicesPerMonth: Infinity, clients: Infinity, multiCompany: false, api: false },
  pro: { invoicesPerMonth: Infinity, clients: Infinity, multiCompany: false, api: false },
  business: { invoicesPerMonth: Infinity, clients: Infinity, multiCompany: true, api: true },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;

export async function getEffectivePlan(userId: string): Promise<Plan> {
  const subscription = await getSubscription(userId);
  if (subscription.status !== "active") return "free";
  return subscription.plan in PLAN_LIMITS ? subscription.plan as Plan : "free";
}

export async function canCreateResource(userId: string, companyId: string, resource: "invoice" | "client") {
  const plan = await getEffectivePlan(userId);
  const limits = PLAN_LIMITS[plan];
  if (resource === "client") {
    if (!Number.isFinite(limits.clients)) return { allowed: true, plan };
    const result = await query(
      "SELECT COUNT(*)::int AS count FROM fak_clients WHERE company_id = $1 AND archived = false",
      [companyId]
    );
    return { allowed: Number(result.rows[0]?.count ?? 0) < limits.clients, plan };
  }
  if (!Number.isFinite(limits.invoicesPerMonth)) return { allowed: true, plan };
  const start = Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1) / 1000);
  const result = await query(
    "SELECT COUNT(*)::int AS count FROM fak_invoices WHERE company_id = $1 AND created_at >= $2",
    [companyId, start]
  );
  return { allowed: Number(result.rows[0]?.count ?? 0) < limits.invoicesPerMonth, plan };
}

export async function hasFeature(userId: string, feature: "recurring" | "multiCompany" | "api") {
  const plan = await getEffectivePlan(userId);
  if (feature === "recurring") return plan === "pro" || plan === "business";
  return PLAN_LIMITS[plan][feature];
}
