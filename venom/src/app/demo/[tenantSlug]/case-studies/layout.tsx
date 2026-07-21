import { getTrialLockState } from "@/lib/trial-gate";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";

/** Trial gate — po vypršení trialu se veřejný obsah nezobrazuje. */
export default async function TrialGatedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const lock = await getTrialLockState(tenantSlug);
  if (lock.locked) return <PublicTrialLock tenantSlug={tenantSlug} businessName={lock.businessName} />;
  return children;
}
