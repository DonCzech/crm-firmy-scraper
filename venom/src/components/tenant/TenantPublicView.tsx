"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionRenderer } from "./SectionRenderer";
import type { Tenant, Page, Section, TenantOverride } from "@/lib/db";
import type { SiteContent } from "@/lib/content-types";
import { applyOverrides } from "@/lib/overrides";
import { DesignOverrides } from "@/components/studio/design/DesignOverrides";
import { GenericInlineEditorProvider, type GenericHighlightChange, type GenericTextStyle } from "./GenericInlineEditorContext";
import { buildLocalBusiness, buildFAQPage } from "@/lib/schema-org";
import { withBlogNavLink } from "@/lib/blog/nav-link";
import { assertHeadingHierarchy } from "@/lib/seo-guards";

interface Props {
  tenant: Tenant;
  page: Page;
  sections: Section[];
  overrides?: TenantOverride[];
  isAdmin?: boolean;
}

interface FaqItem { question: string; answer: string; }

const MAX_HISTORY = 30;
const AUTOSAVE_DELAY = 1500;
const HIGHLIGHT_DELAY = 2400;

type HistoryEntry = {
  sections: Section[];
  changed: GenericHighlightChange[];
};

function cloneSections(sections: Section[]) {
  return JSON.parse(JSON.stringify(sections)) as Section[];
}

function getPathValue(obj: unknown, path: string): string {
  return String(path.split(".").reduce((current: any, key) => current?.[key], obj as any) ?? "");
}

function setPathValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  const root: any = Array.isArray(obj) ? [...obj] : { ...obj };
  let current = root;

  parts.forEach((part, index) => {
    const key = Array.isArray(current) ? Number(part) : part;
    if (index === parts.length - 1) {
      current[key] = value;
      return;
    }
    const next = current[key];
    current[key] = Array.isArray(next) ? [...next] : { ...(next ?? {}) };
    current = current[key];
  });

  return root as Record<string, unknown>;
}

function textSnippets(before: string, after: string) {
  const oldWords = before.match(/\S+/g) ?? [];
  const afterWords = after.match(/\S+/g) ?? [];
  const newWords = new Set(afterWords);
  const oldWordSet = new Set(oldWords);
  return Array.from(new Set([
    ...oldWords.filter(word => !newWords.has(word)),
    ...afterWords.filter(word => !oldWordSet.has(word)),
  ]))
    .map(word => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(word => word.length > 1)
    .slice(0, 8);
}

function changedField(sectionId: number, field: string, beforeContent: Record<string, unknown>, afterContent: Record<string, unknown>): GenericHighlightChange {
  return {
    sectionId,
    field,
    snippets: textSnippets(getPathValue(beforeContent, field), getPathValue(afterContent, field)),
  };
}

function getSectionStyle(sections: Section[], sectionId: number, field: string): GenericTextStyle {
  const section = sections.find(item => item.id === sectionId);
  const content = (section?.settings?.content ?? {}) as { __styles?: Record<string, GenericTextStyle> };
  return content.__styles?.[field] ?? {};
}

const INDUSTRY_SCHEMA_TYPE: Record<string, string> = {
  barber: "HairSalon",
  wellness: "HealthAndBeautyBusiness",
  lawyer: "LegalService",
  cafe: "CafeOrCoffeeShop",
  restaurant: "Restaurant",
};

function buildLocalBusinessSchema(tenant: Tenant, sections: Section[]) {
  const contactSection = sections.find((s) => s.section_type === "contact");
  const heroSection    = sections.find((s) => s.section_type === "hero");
  const navbarSection  = sections.find((s) => s.section_type === "navbar");
  const hoursSection   = sections.find((s) => s.section_type === "opening-hours");

  const contact = (contactSection?.settings?.content ?? {}) as Record<string, string>;
  const hero    = (heroSection?.settings?.content ?? {}) as Record<string, string>;
  const navbar  = (navbarSection?.settings?.content ?? {}) as Record<string, string>;

  type RawHour = { day?: string; hours?: string };
  const rawHours = ((hoursSection?.settings?.content as Record<string, unknown>)?.openingHours ?? []) as RawHour[];
  const openingHoursText = rawHours
    .filter((h) => h.hours && !h.hours.toLowerCase().includes("zavřeno"))
    .map((h) => h.hours ?? "");

  const schemaType = INDUSTRY_SCHEMA_TYPE[tenant.industry] ?? "LocalBusiness";

  return buildLocalBusiness({
    schemaType,
    name: navbar.siteName ?? hero.siteName ?? tenant.slug,
    description: hero.subtitle,
    phone: contact.phone,
    email: contact.email,
    address: contact.address ? { street: contact.address } : undefined,
    openingHours: openingHoursText.length ? openingHoursText : undefined,
    url: `https://webero.co/demo/${tenant.slug}`,
  });
}

function buildFaqSchema(sections: Section[]) {
  const faqSection = sections.find((s) => s.section_type === "faq");
  if (!faqSection) return null;
  const faq = ((faqSection.settings?.content as Record<string, unknown>)?.faq ?? []) as FaqItem[];
  if (!faq.length) return null;
  return buildFAQPage(faq);
}

export function TenantPublicView({ tenant, page: _page, sections: initialSections, overrides = [], isAdmin = false }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [highlighted, setHighlighted] = useState<GenericHighlightChange[]>([]);
  const historyRef = useRef<HistoryEntry[]>([]);
  const redoRef = useRef<HistoryEntry[]>([]);
  const sectionsRef = useRef<Section[]>(initialSections);
  const pendingSectionIdsRef = useRef<Set<number>>(new Set());
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  sectionsRef.current = sections;
  // Get design tokens from first section (all sections share same tokens from template)
  const designTokens = sections[0]?.settings?.designTokens as Record<string, string> | undefined;
  const schemaOrg = buildLocalBusinessSchema(tenant, sections);
  const faqSchema = buildFaqSchema(sections);

  useEffect(() => assertHeadingHierarchy(sections), [sections]);

  const visibleSections = sections.filter((s) => s.is_visible);
  const hasAsteraHome = visibleSections.some((s) => s.section_type === "astera-home");
  const genericEditorEnabled = isAdmin && !hasAsteraHome;

  // Validate — navbar/footer must never appear inside section stream
  const navbarSections = visibleSections.filter((s) => s.section_type === "navbar");
  const footerSections = visibleSections.filter((s) => s.section_type === "footer");

  // Inject the Blog nav entry into navbar + footer when the blog module is on.
  // Public render only — in the editor the link is virtual (no backing data at
  // that index) and would corrupt inline-edit field paths.
  const hasBlogModule = (tenant.active_modules ?? []).includes("blog");
  const injectBlog = hasBlogModule && !genericEditorEnabled;
  const navbarToRender = injectBlog && navbarSections[0]
    ? withBlogNavLink(navbarSections[0], true)
    : navbarSections[0];
  const footerToRender = injectBlog && footerSections[0]
    ? withBlogNavLink(footerSections[0], true)
    : footerSections[0];
  const mainSections = visibleSections.filter(
    (s) => s.section_type !== "navbar" && s.section_type !== "footer"
  );

  const saveAsteraContent = useCallback(async (section: Section, content: SiteContent) => {
    const settings = { ...(section.settings ?? {}), content };
    const res = await fetch(`/api/demo/${tenant.slug}/sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) throw new Error("Failed to save section");

    setSections(prev => prev.map(s => (
      s.id === section.id ? { ...s, settings } : s
    )));
  }, [tenant.slug]);

  const flushGenericSave = useCallback(async () => {
    const ids = Array.from(pendingSectionIdsRef.current);
    if (!ids.length) return;
    pendingSectionIdsRef.current.clear();
    setSaving(true);

    try {
      await Promise.all(ids.map(async (id) => {
        const section = sectionsRef.current.find(item => item.id === id);
        if (!section) return;
        const res = await fetch(`/api/demo/${tenant.slug}/sections/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: section.settings ?? {} }),
        });
        if (!res.ok) throw new Error("Failed to save section");
      }));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }, [tenant.slug]);

  const queueGenericSave = useCallback((sectionId: number) => {
    pendingSectionIdsRef.current.add(sectionId);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(flushGenericSave, AUTOSAVE_DELAY);
  }, [flushGenericSave]);

  const showHighlight = useCallback((changed: GenericHighlightChange[]) => {
    setHighlighted(changed);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlighted([]), HIGHLIGHT_DELAY);
  }, []);

  const updateGenericField = useCallback((sectionId: number, field: string, value: unknown, options?: { recordHistory?: boolean }) => {
    setSections(prev => {
      const before = cloneSections(prev);
      let changed: GenericHighlightChange[] = [];
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const nextContent = setPathValue(content, field, value);
        changed = [changedField(sectionId, field, content, nextContent)];
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });

      if (options?.recordHistory !== false) {
        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), { sections: before, changed }];
        redoRef.current = [];
      } else {
        const last = historyRef.current[historyRef.current.length - 1];
        if (last?.changed.some(item => item.sectionId === sectionId && item.field === field)) {
          historyRef.current = [...historyRef.current.slice(0, -1), { ...last, changed }];
        }
      }

      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  const updateGenericStyle = useCallback((sectionId: number, field: string, style: GenericTextStyle) => {
    setSections(prev => {
      const before = cloneSections(prev);
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const styles = { ...((content.__styles as Record<string, GenericTextStyle> | undefined) ?? {}) };
        styles[field] = Object.fromEntries(Object.entries(style).filter(([, value]) => value !== undefined)) as GenericTextStyle;
        const nextContent = { ...content, __styles: styles };
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });
      historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), {
        sections: before,
        changed: [{ sectionId, field, snippets: [] }],
      }];
      redoRef.current = [];
      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  const undoGeneric = useCallback(() => {
    const entry = historyRef.current[historyRef.current.length - 1];
    if (!entry) return;
    historyRef.current = historyRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current.slice(-(MAX_HISTORY - 1)), { sections: cloneSections(sectionsRef.current), changed: entry.changed }];
    const next = cloneSections(entry.sections);
    sectionsRef.current = next;
    setSections(next);
    showHighlight(entry.changed);
    entry.changed.forEach(item => queueGenericSave(item.sectionId));
  }, [queueGenericSave, showHighlight]);

  const redoGeneric = useCallback(() => {
    const entry = redoRef.current[redoRef.current.length - 1];
    if (!entry) return;
    redoRef.current = redoRef.current.slice(0, -1);
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), { sections: cloneSections(sectionsRef.current), changed: entry.changed }];
    const next = cloneSections(entry.sections);
    sectionsRef.current = next;
    setSections(next);
    showHighlight(entry.changed);
    entry.changed.forEach(item => queueGenericSave(item.sectionId));
  }, [queueGenericSave, showHighlight]);

  const reorderArrayField = useCallback((sectionId: number, field: string, newArray: unknown[]) => {
    setSections(prev => {
      const before = cloneSections(prev);
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const nextContent = setPathValue(content, field, newArray);
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });
      historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), {
        sections: before,
        changed: [{ sectionId, field, snippets: [] }],
      }];
      redoRef.current = [];
      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  const genericEditorValue = useMemo(() => ({
    isAdmin: genericEditorEnabled,
    highlighted,
    updateField: updateGenericField,
    updateStyle: updateGenericStyle,
    updateStyleLocal: updateGenericStyle,
    reorderField: reorderArrayField,
    getStyle: (sectionId: number, field: string) => getSectionStyle(sections, sectionId, field),
  }), [genericEditorEnabled, highlighted, sections, updateGenericField, updateGenericStyle, reorderArrayField]);

  // Extended design tokens from the Studio Design panel are saved with dotted
  // keys (header.bg.desktop, h1.size.desktop, …). Mirror them as CSS variables
  // with dashes so templates can opt-in via `var(--header-bg-desktop)`.
  // Only dotted keys are spread — flat keys (spacing, colorPrimary, fontBody)
  // are either handled explicitly below or reserved by Tailwind v4 (--spacing).
  const extendedTokenVars: Record<string, string> = {};
  if (designTokens) {
    for (const [k, v] of Object.entries(designTokens)) {
      if (!k.includes(".")) continue;
      if (v === null || v === undefined || v === "") continue;
      const cssKey = "--" + k.replace(/\./g, "-");
      extendedTokenVars[cssKey] = typeof v === "number" ? `${v}px` : String(v);
    }
  }

  return (
    <GenericInlineEditorProvider value={genericEditorValue}>
    <div
      className="min-h-screen"
      data-industry={tenant.industry}
      data-design-host
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
        fontFamily: designTokens?.fontBody ?? "Inter, sans-serif",
      } as React.CSSProperties}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <DesignOverrides tokens={designTokens} hostSelector="[data-design-host]" />

      {/*
        SEO + Studio compatibility safety net: visually-hidden `<h1>` rendered
        only when the page would otherwise have none. Many templates (e.g.
        cafe-04, vet-01) use purely visual heroes without a text title — this
        keeps the page accessible and lets Studio's "Typografie → Nadpis 1"
        panel target *something* on every template. JS at first paint removes
        the fallback if a real `<h1>` exists elsewhere on the page.
      */}
      <h1
        data-design-h1-fallback
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {_page?.title ?? tenant.slug ?? "Úvod"}
      </h1>
      <script
        // Runs after hydration; if another <h1> exists in the document, remove
        // the fallback to keep a single semantic main heading per page.
        dangerouslySetInnerHTML={{
          __html: `(function(){var f=document.querySelector('h1[data-design-h1-fallback]');var n=document.querySelectorAll('h1');if(f&&n.length>1)f.remove();})();`,
        }}
      />

      {/* Navbar — singleton, never rendered through section loop */}
      {navbarToRender && (
        <div data-design-scope="header">
          <SectionRenderer
            section={navbarToRender}
            tenantId={tenant.id}
            tenantSlug={tenant.slug}
            isAdmin={genericEditorEnabled}
          />
        </div>
      )}

      {/* Main content sections */}
      <main>
        {mainSections.length === 0 ? (
          <EmptyPageSkeleton
            tenantSlug={tenant.slug}
            pageTitle={_page?.title}
            pageSlug={_page?.slug}
            isHomepage={_page?.is_homepage}
          />
        ) : (
          mainSections.map((section) => {
            const baseContent = (section.settings?.content ?? {}) as Record<string, unknown>;
            const overriddenContent = applyOverrides(baseContent, overrides, section.id);
            const patchedSection = overriddenContent !== baseContent
              ? { ...section, settings: { ...section.settings, content: overriddenContent } }
              : section;
            const hiddenOn = ((section.settings?.hiddenOn as string[] | undefined) ?? []);
            const animation = (section.settings?.animation as string | undefined) ?? "none";
            const classes = [
              hiddenOn.includes("mobile") ? "vs-hide-mobile" : "",
              hiddenOn.includes("tablet") ? "vs-hide-tablet" : "",
              animation !== "none" ? `vs-anim-${animation}` : "",
            ].filter(Boolean).join(" ");
            return (
              <AnimatedWrapper key={section.id} className={classes}>
                <SectionRenderer
                  section={patchedSection}
                  tenantId={tenant.id}
                  tenantSlug={tenant.slug}
                  isAdmin={section.section_type === "astera-home" ? isAdmin : genericEditorEnabled}
                  onSaveAsteraContent={saveAsteraContent}
                />
              </AnimatedWrapper>
            );
          })
        )}
      </main>

      {/* Footer — singleton, never rendered through section loop */}
      {footerToRender && (
        <div data-design-scope="footer">
          <SectionRenderer
            section={footerToRender}
            tenantId={tenant.id}
            tenantSlug={tenant.slug}
            isAdmin={genericEditorEnabled}
          />
        </div>
      )}
      {genericEditorEnabled && (
        <div className="fixed bottom-6 left-1/2 z-[9997] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-3 py-2 text-xs text-white shadow-2xl">
          <button onClick={undoGeneric} disabled={!historyRef.current.length} className="rounded-full bg-white/10 px-3 py-2 font-semibold disabled:opacity-40">
            ↺ Zpět
          </button>
          <button onClick={redoGeneric} disabled={!redoRef.current.length} className="rounded-full bg-white/10 px-3 py-2 font-semibold disabled:opacity-40">
            ↻ Vpřed
          </button>
          <span className="px-2 text-white/70">{saving ? "Ukládám..." : saved ? "Uloženo" : "Klikni na text pro úpravu"}</span>
        </div>
      )}
    </div>
    </GenericInlineEditorProvider>
  );
}

function EmptyPageSkeleton({
  tenantSlug, pageTitle, pageSlug, isHomepage,
}: { tenantSlug: string; pageTitle?: string; pageSlug?: string; isHomepage?: boolean }) {
  const editorBase = isHomepage || !pageSlug
    ? `/demo/${tenantSlug}/admin`
    : `/demo/${tenantSlug}/admin/${pageSlug}`;
  const editorHref = `${editorBase}?addSection=1`;
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24">
      {/* Decorative grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/4 -z-10 h-[420px] w-[680px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-accent, #818cf8) 0%, transparent 70%)" }}
      />

      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.10)] ring-1 ring-slate-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-slate-500">
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <rect x="3" y="11" width="11" height="9" rx="1" />
            <rect x="16" y="11" width="5" height="9" rx="1" />
          </svg>
        </div>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Prázdná stránka
        </p>
        <h1
          className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[34px]"
          style={{ fontFamily: "var(--font-heading, inherit)" }}
        >
          {pageTitle ?? "Tato stránka se připravuje"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-slate-600">
          Stránka byla vytvořena, ale zatím nemá žádný obsah. Otevři editor a přidej
          první sekci — hero, text, galerii, ceník nebo cokoliv dalšího.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <a
            href={editorHref}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg px-4 text-[13px] font-semibold text-white shadow-[0_8px_22px_rgba(99,102,241,0.32)] transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Přidat sekci
          </a>
          <a
            href={`/demo/${tenantSlug}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M9 18l-6-6 6-6M3 12h18" />
            </svg>
            Zpět na úvodní stránku
          </a>
        </div>

        {/* Skeleton preview blocks */}
        <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-3 opacity-50">
          {["w-3/4", "w-full", "w-2/3"].map((w, i) => (
            <div key={i} className="space-y-2">
              <div className="h-20 rounded-lg bg-slate-200" />
              <div className={`h-2 rounded-full bg-slate-200 ${w}`} />
              <div className="h-2 w-1/2 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


/**
 * AnimatedWrapper — IntersectionObserver-driven entrance animation. Adds
 * `vs-anim-active` to the wrapping div the first time it enters the viewport
 * with rootMargin so the animation runs slightly before the section is fully
 * visible. Respects prefers-reduced-motion via CSS.
 */
function AnimatedWrapper({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only animate when className contains an anim preset.
    if (!className || !/vs-anim-/.test(className)) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("vs-anim-active");
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("vs-anim-active");
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [className]);

  return <div ref={ref} className={className}>{children}</div>;
}
