import { getTrialLockState } from "@/lib/trial-gate";
import { PublicTrialLock } from "@/components/tenant/PublicTrialLock";

/** Trial gate pro veřejný blog — po vypršení trialu se obsah nezobrazuje. */
export default async function BlogLayout({
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
