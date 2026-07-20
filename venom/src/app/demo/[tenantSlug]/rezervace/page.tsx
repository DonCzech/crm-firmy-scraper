import { notFound } from "next/navigation";
import {
  getTenantBySlug,
  getTenantPage,
  getPageSections,
  getTenantOverrides,
} from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { TenantPublicView } from "@/components/tenant/TenantPublicView";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const revalidate = 300;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3015";

/**
 * Samostatná rezervační stránka `/rezervace`.
 *
 * Vezme tenantovu domovskou stránku a vykreslí z ní jen navigaci, rezervační
 * widget a patičku — tedy plnohodnotnou podstránku „Rezervace" ve vzhledu webu,
 * na kterou může vést tlačítko z menu. Widget si nabídku i termíny tahá přímo
 * z Rezory přes uložený `providerSlug` (stejně jako vložený widget na homepage).
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return { robots: { index: false, follow: false } };

  const canonicalUrl = `${BASE_URL}/demo/${tenantSlug}/rezervace`;
  return {
    metadataBase: new URL(SITE_URL),
    title: "Rezervace online",
    description: "Vyberte si službu a termín. Potvrzení dorazí e-mailem.",
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: "Rezervace online",
      url: canonicalUrl,
      siteName: "Webero",
    },
  };
}

export default async function TenantBookingPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const home = await getTenantPage(tenant.id, "home");
  if (!home) return notFound();

  const [rawSections, overrides] = await Promise.all([
    getPageSections(tenant.id, home.id),
    getTenantOverrides(tenant.id),
  ]);
  const sections = await resolveAllSections(tenant, rawSections);

  const widget = sections.find((s) => s.section_type === "rezora-widget");
  if (!widget) return notFound();

  // Ze stránky ponecháme jen navbar (singleton), widget a footer (singleton).
  // Navbar a footer si TenantPublicView vytahuje sám podle typu, widget přidáme
  // jako jedinou obsahovou sekci na začátek (order_index nízké → nad footer).
  const navbar = sections.find((s) => s.section_type === "navbar");
  const footer = sections.find((s) => s.section_type === "footer");
  const bookingSections = [navbar, { ...widget, order_index: 0 }, footer].filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );

  const bookingPage = { ...home, slug: "rezervace" };

  return (
    <>
      <TenantCustomCode tenantId={tenant.id} placement="head" />
      <TenantPublicView
        tenant={tenant}
        page={bookingPage}
        sections={bookingSections}
        overrides={overrides}
        isAdmin={false}
      />
      <TenantCustomCode tenantId={tenant.id} placement="body-end" />
    </>
  );
}
