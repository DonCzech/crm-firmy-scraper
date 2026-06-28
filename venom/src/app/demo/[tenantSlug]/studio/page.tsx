import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * The legacy /studio route is folded into the unified editor at
 * /demo/<slug>/admin (homepage) or /demo/<slug>/admin/<slug> (subpage).
 * Both surface the dock, builder side-panel and full AdminConsole — so this
 * stub only forwards the request and preserves the ?page= query.
 */
export default async function StudioRedirect({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { page } = await searchParams;
  const target =
    page && page !== "home"
      ? `/demo/${tenantSlug}/admin/${page}`
      : `/demo/${tenantSlug}/admin`;
  redirect(target);
}
