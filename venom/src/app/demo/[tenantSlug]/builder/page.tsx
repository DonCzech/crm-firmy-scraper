import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * AI Builder už není samostatná stránka — je to režim Studia
 * (/demo/<slug>/admin?builder=1), mezi builderem a ručním editorem se
 * přepíná v hlavičce bez ztráty konverzace.
 *
 * Tahle routa zůstává kvůli starým odkazům (onboarding, dashboard, návrat
 * z GoPay ?ai_credits=…) a jen přesměruje se zachováním query parametrů.
 */
export default async function BuilderPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;

  const qs = new URLSearchParams({ builder: "1" });
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) for (const v of value) qs.append(key, v);
  }

  redirect(`/demo/${tenantSlug}/admin?${qs.toString()}`);
}
