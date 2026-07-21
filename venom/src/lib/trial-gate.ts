import { getTenantBySlug, getSubscriptionByTenantId, queryOne } from "@/lib/db";

/**
 * Trial gate — jediné místo s pravidlem, kdy je web veřejně zamčený.
 * Stejná sémantika jako na tenant homepage: zamyká se, jen pokud subscription
 * řádek existuje, není "active" a trial_ends_at je v minulosti. Tenanti bez
 * subscription řádku (legacy/demo) zůstávají přístupní.
 */
export async function getTrialLockState(
  tenantSlug: string
): Promise<{ locked: boolean; businessName: string | null }> {
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { locked: false, businessName: null };
  const sub = await getSubscriptionByTenantId(tenant.id);
  const locked = !!(
    sub &&
    sub.status !== "active" &&
    sub.trial_ends_at &&
    new Date(sub.trial_ends_at) < new Date()
  );
  if (!locked) return { locked: false, businessName: null };
  const extra = await queryOne<{ business_name: string | null }>(
    "SELECT business_name FROM tenants WHERE id = $1",
    [tenant.id]
  );
  return { locked: true, businessName: extra?.business_name ?? null };
}

/** Varianta pro API routy, kde už máme tenant id. */
export async function isSubscriptionLocked(tenantId: number): Promise<boolean> {
  const sub = await getSubscriptionByTenantId(tenantId);
  return !!(
    sub &&
    sub.status !== "active" &&
    sub.trial_ends_at &&
    new Date(sub.trial_ends_at) < new Date()
  );
}
