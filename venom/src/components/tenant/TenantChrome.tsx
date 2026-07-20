import type { CSSProperties, ReactNode } from "react";
import { getTenantPage, getPageSections, type Tenant } from "@/lib/db";
import { resolveAllSections } from "@/lib/section-resolver";
import { SectionRenderer } from "./SectionRenderer";
import { DesignOverrides } from "@/components/studio/design/DesignOverrides";
import { withBlogNavLink } from "@/lib/blog/nav-link";

/**
 * Renders the tenant's own navbar + footer around arbitrary children.
 *
 * Standalone pages that are not built from page sections (blog index, blog
 * detail) still have to look like part of the site. Both singletons live on
 * the homepage, so we resolve the homepage sections and reuse exactly the same
 * `SectionRenderer` path as `TenantPublicView` — every template therefore gets
 * its own header/footer with zero per-template work.
 *
 * Design tokens are mirrored onto the wrapper the same way the public view
 * does it, so navbar/footer styles that rely on `var(--color-*)` resolve here
 * too. Children stay free to layer their own variables on top (the blog root
 * layers `--blog-*`).
 */
export async function TenantChrome({
  tenant,
  children,
}: {
  tenant: Tenant;
  children: ReactNode;
}) {
  const homepage = await getTenantPage(tenant.id, "home");
  const rawSections = homepage ? await getPageSections(tenant.id, homepage.id) : [];
  const sections = rawSections.length ? await resolveAllSections(tenant, rawSections) : [];

  const designTokens = rawSections[0]?.settings?.designTokens as
    | Record<string, string>
    | undefined;

  const rawNavbar = sections.find((s) => s.section_type === "navbar");
  const rawFooter = sections.find((s) => s.section_type === "footer");

  // On a blog page the blog module is by definition active — inject the Blog
  // nav entry into both singletons.
  const footer = rawFooter ? withBlogNavLink(rawFooter, true) : undefined;

  // Overlay navbars are designed to float over the homepage hero: transparent
  // background, white text, dark scrim. A blog page has no hero, so that same
  // navbar renders as a grey smudge with near-invisible logo on white. Flag it
  // so the navbar starts in its own "scrolled" (solid) state instead.
  const navbar = rawNavbar
    ? withBlogNavLink(
        {
          ...rawNavbar,
          settings: {
            ...rawNavbar.settings,
            content: {
              ...((rawNavbar.settings?.content ?? {}) as Record<string, unknown>),
              __solidHeader: true,
            },
          },
        },
        true
      )
    : undefined;

  // Dotted Studio keys (header.bg.desktop, …) become dashed CSS variables.
  const extendedTokenVars: Record<string, string> = {};
  for (const [k, v] of Object.entries(designTokens ?? {})) {
    if (!k.includes(".") || v === null || v === undefined || v === "") continue;
    extendedTokenVars["--" + k.replace(/\./g, "-")] = typeof v === "number" ? `${v}px` : String(v);
  }

  return (
    <div
      data-design-host
      data-industry={tenant.industry}
      className="min-h-screen"
      style={{
        "--color-primary": designTokens?.colorPrimary ?? "#6366f1",
        "--color-secondary": designTokens?.colorSecondary ?? "#4f46e5",
        "--color-bg": designTokens?.colorBackground ?? "#ffffff",
        "--color-surface": designTokens?.colorSurface ?? "#f9fafb",
        "--color-text": designTokens?.colorText ?? "#111827",
        "--color-text-muted": designTokens?.colorTextMuted ?? "#6b7280",
        "--color-accent": designTokens?.colorAccent ?? "#6366f1",
        "--color-border": designTokens?.colorBorder ?? "#e5e7eb",
        "--font-heading": designTokens?.fontHeading ?? "Inter, sans-serif",
        "--font-body": designTokens?.fontBody ?? "Inter, sans-serif",
        "--radius": designTokens?.borderRadius ?? "8px",
        ...extendedTokenVars,
        backgroundColor: designTokens?.colorBackground ?? "#ffffff",
        color: designTokens?.colorText ?? "#111827",
      } as CSSProperties}
    >
      <DesignOverrides tokens={designTokens} hostSelector="[data-design-host]" />

      {navbar && (
        <div data-design-scope="header">
          <SectionRenderer
            section={navbar}
            tenantId={tenant.id}
            tenantSlug={tenant.slug}
            isAdmin={false}
          />
        </div>
      )}

      {children}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
  var h=document.querySelector('[data-design-scope="header"]');
  if(!h)return;
  var nav=h.firstElementChild;
  if(!nav)return;
  var pos=getComputedStyle(nav).position;
  if(pos==='absolute'||pos==='fixed'){
    h.style.height=nav.offsetHeight+'px';
  }
})();`,
        }}
      />

      {footer && (
        <div data-design-scope="footer">
          <SectionRenderer
            section={footer}
            tenantId={tenant.id}
            tenantSlug={tenant.slug}
            isAdmin={false}
          />
        </div>
      )}
    </div>
  );
}
