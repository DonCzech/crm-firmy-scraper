import { cookies } from "next/headers";
import { query } from "./db";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
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
     WHERE s.token = $1 AND s.expires_at > $2`,
    [token, now]
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
