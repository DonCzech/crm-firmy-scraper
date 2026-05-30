"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionRenderer } from "./SectionRenderer";
import type { Tenant, Page, Section, TenantOverride } from "@/lib/db";
import type { SiteContent } from "@/lib/content-types";
import { applyOverrides } from "@/lib/overrides";
import { GenericInlineEditorProvider, type GenericHighlightChange, type GenericTextStyle } from "./GenericInlineEditorContext";
import { buildLocalBusiness, buildFAQPage } from "@/lib/schema-org";
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
    url: `https://venom-saas.vercel.app/demo/${tenant.slug}`,
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

  const updateGenericField = useCallback((sectionId: number, field: string, value: string, options?: { recordHistory?: boolean }) => {
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
    reorderField: reorderArrayField,
    getStyle: (sectionId: number, field: string) => getSectionStyle(sections, sectionId, field),
  }), [genericEditorEnabled, highlighted, sections, updateGenericField, updateGenericStyle, reorderArrayField]);

  return (
    <GenericInlineEditorProvider value={genericEditorValue}>
    <div
      className="min-h-screen"
      data-industry={tenant.industry}
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

      {/* Navbar — singleton, never rendered through section loop */}
      {navbarSections.length > 0 && (
        <SectionRenderer
          section={navbarSections[0]}
          tenantId={tenant.id}
          tenantSlug={tenant.slug}
          isAdmin={genericEditorEnabled}
        />
      )}

      {/* Main content sections */}
      <main>
        {mainSections.map((section) => {
          const baseContent = (section.settings?.content ?? {}) as Record<string, unknown>;
          const overriddenContent = applyOverrides(baseContent, overrides, section.id);
          const patchedSection = overriddenContent !== baseContent
            ? { ...section, settings: { ...section.settings, content: overriddenContent } }
            : section;
          return (
            <SectionRenderer
              key={section.id}
              section={patchedSection}
              tenantId={tenant.id}
              tenantSlug={tenant.slug}
              isAdmin={section.section_type === "astera-home" ? isAdmin : genericEditorEnabled}
              onSaveAsteraContent={saveAsteraContent}
            />
          );
        })}
      </main>

      {/* Footer — singleton, never rendered through section loop */}
      {footerSections.length > 0 && (
        <SectionRenderer
          section={footerSections[0]}
          tenantId={tenant.id}
          tenantSlug={tenant.slug}
          isAdmin={genericEditorEnabled}
        />
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
