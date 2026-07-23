"use client";

/**
 * Venom host for the isolated astera module (`@/astera/*`).
 *
 * Mounts astera's own multi-language ContentProvider + LiveEditor 1:1, but in
 * "hosted" mode: content, admin state and persistence are injected by the Venom
 * tenant section instead of astera's self-hosted /api/* endpoints. The visual
 * composition mirrors astera-web's app/page.tsx and app/layout.tsx exactly.
 */

import type { Lang } from "@/astera/lib/i18n";
import type { SiteContent } from "@/astera/lib/content-types";
import { ContentProvider, type AsteraSaveFn } from "@/astera/context/ContentContext";
import { playfair, poppins } from "@/astera/astera-fonts";
import "@/astera/astera.css";
import CustomStyles from "@/astera/components/CustomStyles";
import LiveEditorLoader from "@/astera/components/admin/LiveEditorLoader";
import Header from "@/astera/components/Header";
import Footer from "@/astera/components/Footer";
import Hero from "@/astera/components/Hero";
import HomeServices from "@/astera/components/HomeServices";
import AboutAstera from "@/astera/components/AboutAstera";
import Newsletter from "@/astera/components/Newsletter";
import ManifestCards from "@/astera/components/ManifestCards";
import PickACard from "@/astera/components/PickACard";
import MonthlyOracle from "@/astera/components/MonthlyOracle";
import EditablePage from "@/astera/components/EditablePage";
import SluzbyPage from "@/astera/components/SluzbyPage";
import PickACardGame from "@/astera/components/PickACardGame";
import { LOCALIZED_ROUTES, detectLang, stripLangPrefix } from "@/astera/lib/i18n";
import type { MouseEvent as ReactMouseEvent } from "react";

/** The tenant stores one astera SiteContent per enabled language. */
export type AsteraSiteContent = Record<Lang, SiteContent>;

interface Props {
  content: AsteraSiteContent;
  tenantSlug: string;
  lang: Lang;
  isAdmin?: boolean;
  adminEmail?: string;
  /** Empty / "/" renders the home composition; otherwise a CMS page by slug. */
  pageSlug?: string;
  /** Persists a single (section, lang) back to the tenant section settings. */
  onSaveSection?: AsteraSaveFn;
}

// Map a (possibly localized) page slug to its astera route id.
// e.g. "sluzby" | "services" | "posluhy" → "services".
function routeIdForSlug(slug: string): string | null {
  for (const route of LOCALIZED_ROUTES) {
    if ((Object.values(route.slugs) as string[]).includes(slug)) return route.id;
  }
  return null;
}

// Sub-page composition — mirrors astera-web's dedicated routes:
// /sluzby → SluzbyPage, /pick-a-card → PickACardGame, everything else → EditablePage (CMS pages).
// Each of these components renders its OWN Header + Footer 1:1, so this wrapper
// must NOT add another set (that caused duplicate header/footer).
function AsteraSubPage({ pageSlug }: { pageSlug: string }) {
  const routeId = routeIdForSlug(pageSlug);
  if (routeId === "services") return <SluzbyPage />;
  if (routeId === "pick-a-card") return <PickACardGame />;
  return <EditablePage slug={pageSlug} />;
}

// Home composition — mirrors astera-web/src/app/page.tsx 1:1.
function AsteraHome() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HomeServices />
        <AboutAstera />
        <Newsletter />
        <ManifestCards />
        <PickACard />
        <MonthlyOracle />
      </main>
      <Footer />
    </>
  );
}

export function AsteraSiteTemplate({
  content,
  tenantSlug,
  lang,
  isAdmin = false,
  adminEmail,
  pageSlug,
  onSaveSection,
}: Props) {
  const isHome = !pageSlug || pageSlug === "/" || pageSlug === "";

  // In the /demo/<slug> preview, astera's root-relative links (`/sluzby`,
  // `/en/sluzby`) would hit the platform and 404. Rewrite them to the tenant
  // preview path (and fold the language prefix into ?lang=). On the custom
  // domain the browser is already at the site root, so this is a no-op.
  const handleNavCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    const base = `/demo/${tenantSlug}`;
    if (!window.location.pathname.startsWith(base)) return;
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const raw = anchor.getAttribute("href");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith(base)) return;
    e.preventDefault();
    const linkLang = detectLang(raw);
    const path = stripLangPrefix(raw);
    // astera's usePathname-based links (LanguageSwitcher) build off the venom
    // pathname, so `path` may already contain the base — don't prefix it twice.
    const withBase = path.startsWith(base) ? path : base + (path === "/" ? "" : path);
    const query = linkLang !== "cs" ? `?lang=${linkLang}` : "";
    window.location.assign((withBase || base) + query);
  };

  return (
    <div className={`astera-surface ${playfair.variable} ${poppins.variable}`} onClickCapture={handleNavCapture}>
      <ContentProvider
        initialContent={content}
        admin={{ isAdmin, email: adminEmail ?? null, setupRequired: false }}
        lang={lang}
        tenantSlug={tenantSlug}
        onSave={onSaveSection}
      >
        <CustomStyles />
        {isHome ? <AsteraHome /> : <AsteraSubPage pageSlug={pageSlug!} />}
        {/* LiveEditorLoader internally renders the astera LiveEditor only for admins. */}
        <LiveEditorLoader />
      </ContentProvider>
    </div>
  );
}
