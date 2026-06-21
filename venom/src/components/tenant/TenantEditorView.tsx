"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { SectionRenderer } from "./SectionRenderer";
import { PageBuilder } from "./PageBuilder";
import { TrialBanner } from "./TrialBanner";
import { EditorDock, EditorCollapsedTab, type DrawerKey } from "./editor/EditorDock";
import { EditorDrawer } from "./editor/EditorDrawer";
import { SectionFrame, ElementMicroRail } from "./editor/EditorElementOverlay";
import type { Tenant, Page, Section, TenantOverride } from "@/lib/db";
import type { SiteContent } from "@/lib/content-types";
import { applyOverrides } from "@/lib/overrides";
import { GenericInlineEditorProvider, type GenericHighlightChange, type GenericTextStyle } from "./GenericInlineEditorContext";

const SECTION_LABELS: Record<string, string> = {
  navbar: "Navigace",
  hero: "Hero",
  services: "Služby",
  pricing: "Ceník",
  testimonials: "Recenze",
  gallery: "Galerie",
  contact: "Kontakt",
  "opening-hours": "Otevírací doba",
  faq: "Časté dotazy",
  cta: "CTA",
  team: "Tým",
  about: "O nás",
  "blog-preview": "Blog",
  map: "Mapa",
  promo: "Promo",
  stats: "Statistiky",
  products: "Produkty",
  footer: "Patička",
};

interface Props {
  tenant: Tenant;
  page: Page;
  sections: Section[];
  overrides?: TenantOverride[];
}

const MAX_HISTORY = 30;
const AUTOSAVE_DELAY = 1500;
const HIGHLIGHT_DELAY = 2400;

type HistoryEntry = {
  sections: Section[];
  changed: GenericHighlightChange[];
};

type MutablePathContainer = Record<string, unknown> | unknown[];

function cloneSections(sections: Section[]) {
  return JSON.parse(JSON.stringify(sections)) as Section[];
}

function getPathValue(obj: unknown, path: string): string {
  let current = obj;
  for (const key of path.split(".")) {
    if (current == null) return "";
    if (Array.isArray(current)) {
      current = current[Number(key)];
      continue;
    }
    if (typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  return String(current ?? "");
}

function clonePathContainer(value: unknown): MutablePathContainer {
  return Array.isArray(value) ? [...value] : { ...((value ?? {}) as Record<string, unknown>) };
}

function getContainerValue(container: MutablePathContainer, key: string) {
  return Array.isArray(container) ? container[Number(key)] : container[key];
}

function setContainerValue(container: MutablePathContainer, key: string, value: unknown) {
  if (Array.isArray(container)) {
    container[Number(key)] = value;
    return;
  }
  container[key] = value;
}

function setPathValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  const root = clonePathContainer(obj);
  let current = root;

  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      setContainerValue(current, part, value);
      return;
    }
    const next = clonePathContainer(getContainerValue(current, part));
    setContainerValue(current, part, next);
    current = next;
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

export function TenantEditorView({ tenant, sections: initialSections, overrides = [] }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [adminBarCollapsed, setAdminBarCollapsed] = useState(false);

  // Editor surface state — drawer + section selection
  const [drawerOpen, setDrawerOpen] = useState<DrawerKey | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [hoverSectionId, setHoverSectionId] = useState<number | null>(null);
  const sectionElsRef = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const collapseBar = useCallback((collapsed: boolean) => {
    setAdminBarCollapsed(collapsed);
  }, []);

  // Section action handlers — move up/down, duplicate, hide, delete
  const moveSection = useCallback((id: number, dir: -1 | 1) => {
    setSections((prev) => {
      const sorted = [...prev].sort((a, b) => a.order_index - b.order_index);
      const idx = sorted.findIndex((s) => s.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= sorted.length) return prev;
      // Don't move around navbar / footer singletons
      if (sorted[next].section_type === "navbar" || sorted[next].section_type === "footer") return prev;
      [sorted[idx].order_index, sorted[next].order_index] = [sorted[next].order_index, sorted[idx].order_index];
      const updated = prev.map((s) => sorted.find((x) => x.id === s.id) ?? s);
      void fetch(`/api/demo/${tenant.slug}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updated }),
      });
      return updated;
    });
  }, [tenant.slug]);

  const toggleSectionVisible = useCallback((id: number) => {
    setSections((prev) => {
      const updated = prev.map((s) => s.id === id ? { ...s, is_visible: !s.is_visible } : s);
      void fetch(`/api/demo/${tenant.slug}/sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: updated.find((s) => s.id === id)?.is_visible ?? true }),
      });
      return updated;
    });
  }, [tenant.slug]);

  const duplicateSection = useCallback(async (id: number) => {
    const src = sections.find((s) => s.id === id);
    if (!src) return;
    const newOrder = Math.max(...sections.map((s) => s.order_index)) + 1;
    const res = await fetch(`/api/demo/${tenant.slug}/sections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections: [
          ...sections,
          { ...src, id: -Date.now(), order_index: newOrder },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      // Server returns idMap for temp ids; just reload sections
      if (data.idMap) {
        const map = data.idMap as Record<string, number>;
        const tempId = String(-Date.now());
        const realId = map[tempId] ?? Math.max(...sections.map((s) => s.id)) + 1;
        setSections((prev) => [
          ...prev,
          { ...src, id: realId, order_index: newOrder },
        ]);
      }
    }
  }, [sections, tenant.slug]);

  const deleteSection = useCallback(async (id: number) => {
    if (!window.confirm("Smazat tuto sekci? Tato akce nelze vrátit zpět z UI.")) return;
    await fetch(`/api/demo/${tenant.slug}/sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (selectedSectionId === id) setSelectedSectionId(null);
  }, [tenant.slug, selectedSectionId]);

  const setSectionRef = useCallback((id: number) => (el: HTMLDivElement | null) => {
    sectionElsRef.current.set(id, el);
  }, []);

  const selectedSection = useMemo(() => sections.find((s) => s.id === selectedSectionId) ?? null, [sections, selectedSectionId]);
  const selectedEl = selectedSectionId != null ? sectionElsRef.current.get(selectedSectionId) ?? null : null;
  const selectedMeta = useMemo(() => {
    if (!selectedSection) return null;
    const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((s) => s.id === selectedSection.id);
    const prev = sorted[idx - 1];
    const next = sorted[idx + 1];
    return {
      id: selectedSection.id,
      type: selectedSection.section_type,
      label: SECTION_LABELS[selectedSection.section_type] ?? selectedSection.section_type,
      visible: selectedSection.is_visible,
      canMoveUp:   !!prev && prev.section_type !== "navbar",
      canMoveDown: !!next && next.section_type !== "footer",
    };
  }, [selectedSection, sections]);

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

  const designTokens = sections[0]?.settings?.designTokens as Record<string, string> | undefined;

  const visibleSections = sections.filter((s) => s.is_visible);
  const hasAsteraHome = visibleSections.some((s) => s.section_type === "astera-home");
  const hasClonePage = visibleSections.some((s) => s.section_type === "full-page-clone");
  // Clone pages use their own contentEditable inline editor injected by ClonedSiteRenderer
  const genericEditorEnabled = !hasAsteraHome && !hasClonePage;
  const editorBarEnabled = true; // always show bottom bar (clone uses its own save UI)
  const navbarSections = visibleSections.filter((s) => s.section_type === "navbar");
  const footerSections = visibleSections.filter((s) => s.section_type === "footer");
  const mainSections = visibleSections.filter(
    (s) => s.section_type !== "navbar" && s.section_type !== "footer"
  );

  const saveSections = useCallback(async (newSections: Section[]) => {
    setSaving(true);
    try {
      await fetch(`/api/demo/${tenant.slug}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: newSections }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [tenant.slug]);

  const saveAsteraContent = useCallback(async (section: Section, content: SiteContent) => {
    setSaving(true);
    try {
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
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
        paddingRight: builderOpen ? "360px" : "0",
        transition: "padding-right 0.3s ease",
      } as React.CSSProperties}
    >
      {/* Editor dock — replaces the legacy pill bar with a compact floating
          top dock and side-drawer system. Uses our cinematic design tokens. */}
      {adminBarCollapsed ? (
        <EditorCollapsedTab onExpand={() => collapseBar(false)} />
      ) : (
        <EditorDock
          tenantSlug={tenant.slug}
          saveStatus={saving ? "saving" : saved ? "saved" : "idle"}
          canUndo={historyRef.current.length > 0}
          canRedo={redoRef.current.length > 0}
          onUndo={() => { /* wired by inline editor */ }}
          onRedo={() => { /* wired by inline editor */ }}
          onFlushSave={() => void saveSections(sections)}
          viewport={viewport}
          onViewportChange={setViewport}
          builderOpen={builderOpen}
          onToggleBuilder={() => setBuilderOpen((o) => !o)}
          onOpenDrawer={(k) => setDrawerOpen(k)}
          onCollapse={() => collapseBar(true)}
        />
      )}

      <EditorDrawer
        open={drawerOpen}
        tenantSlug={tenant.slug}
        onClose={() => setDrawerOpen(null)}
      />

      {/* Floating element micro-rail (selection + action buttons) */}
      {selectedMeta && (
        <ElementMicroRail
          target={selectedEl}
          section={selectedMeta}
          onMoveUp={() => moveSection(selectedMeta.id, -1)}
          onMoveDown={() => moveSection(selectedMeta.id, 1)}
          onDuplicate={() => void duplicateSection(selectedMeta.id)}
          onToggleVisible={() => toggleSectionVisible(selectedMeta.id)}
          onDelete={() => void deleteSection(selectedMeta.id)}
        />
      )}

      <TrialBanner tenantSlug={tenant.slug} />

      <div>
        {/* Navbar — singleton */}
        {navbarSections.length > 0 && (
          <SectionRenderer section={navbarSections[0]} tenantId={tenant.id} tenantSlug={tenant.slug} isAdmin={true} onSaveAsteraContent={saveAsteraContent} />
        )}

        {/* Main sections — wrapped in SectionFrame so the editor overlay can
            attach selection ring + micro-rail. Hover/click activates the
            element actions on the floating dock. */}
        <main onClickCapture={(e) => {
          // Click outside any frame deselects
          const t = e.target as HTMLElement;
          if (!t.closest("[data-editor-section]")) setSelectedSectionId(null);
        }}>
          {mainSections.map((section) => {
            const baseContent = (section.settings?.content ?? {}) as Record<string, unknown>;
            const overriddenContent = applyOverrides(baseContent, overrides, section.id);
            const patchedSection = overriddenContent !== baseContent
              ? { ...section, settings: { ...section.settings, content: overriddenContent } }
              : section;
            const label = SECTION_LABELS[section.section_type] ?? section.section_type;
            return (
              <SectionFrame
                key={section.id}
                sectionId={section.id}
                selected={selectedSectionId === section.id}
                hover={hoverSectionId === section.id}
                onSelect={() => setSelectedSectionId(section.id)}
                onHover={(h) => setHoverSectionId(h ? section.id : null)}
                onMount={setSectionRef(section.id)}
                label={label}
              >
                <SectionRenderer section={patchedSection} tenantId={tenant.id} tenantSlug={tenant.slug} isAdmin={true} onSaveAsteraContent={saveAsteraContent} />
              </SectionFrame>
            );
          })}
        </main>

        {/* Footer — singleton */}
        {footerSections.length > 0 && (
          <SectionRenderer section={footerSections[0]} tenantId={tenant.id} tenantSlug={tenant.slug} isAdmin={true} onSaveAsteraContent={saveAsteraContent} />
        )}
      </div>

      {/* Page Builder panel */}
      {builderOpen && (
        <PageBuilder
          sections={sections}
          tenantSlug={tenant.slug}
          onChange={(updated) => {
            setSections(updated);
            sectionsRef.current = updated;
            saveSections(updated);
          }}
          onClose={() => setBuilderOpen(false)}
        />
      )}
      {editorBarEnabled && !hasClonePage && (
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
