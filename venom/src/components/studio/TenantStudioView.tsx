"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Tenant, Page, Section, TenantOverride } from "@/lib/db";
import type { SiteContent } from "@/lib/content-types";
import { setNestedValue } from "@/lib/studio-focus";
import {
  GenericInlineEditorProvider,
  type GenericHighlightChange,
  type GenericTextStyle,
} from "@/components/tenant/GenericInlineEditorContext";
import { StudioProvider, useStudio } from "./StudioContext";
import { StudioShell } from "./StudioShell";

interface Props {
  tenant: Tenant;
  page: Page;
  sections: Section[];
  overrides?: TenantOverride[];
  /** Otevřít Studio rovnou v režimu AI Builderu (?builder=1). */
  initialBuilderOpen?: boolean;
}

const MAX_HISTORY = 30;
const AUTOSAVE_DELAY = 1500;
const HIGHLIGHT_DELAY = 2400;
/** Periodický snapshot do page_revisions — max. jednou za 10 min editace */
const AUTO_SNAPSHOT_INTERVAL = 10 * 60 * 1000;

type HistoryEntry = { sections: Section[]; changed: GenericHighlightChange[] };
type MutablePathContainer = Record<string, unknown> | unknown[];

function cloneSections(s: Section[]) {
  return JSON.parse(JSON.stringify(s)) as Section[];
}
function getPathValue(obj: unknown, path: string): string {
  let current = obj;
  for (const key of path.split(".")) {
    if (current == null) return "";
    if (Array.isArray(current)) { current = current[Number(key)]; continue; }
    if (typeof current !== "object") return "";
    current = (current as Record<string, unknown>)[key];
  }
  return String(current ?? "");
}
function clonePathContainer(value: unknown): MutablePathContainer {
  return Array.isArray(value) ? [...value] : { ...((value ?? {}) as Record<string, unknown>) };
}
function getContainerValue(c: MutablePathContainer, k: string) {
  return Array.isArray(c) ? c[Number(k)] : c[k];
}
function setContainerValue(c: MutablePathContainer, k: string, v: unknown) {
  if (Array.isArray(c)) { c[Number(k)] = v; return; }
  c[k] = v;
}
function setPathValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const parts = path.split(".");
  const root = clonePathContainer(obj);
  let current = root;
  parts.forEach((part, idx) => {
    if (idx === parts.length - 1) { setContainerValue(current, part, value); return; }
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
  const oldSet = new Set(oldWords);
  return Array.from(new Set([
    ...oldWords.filter(w => !newWords.has(w)),
    ...afterWords.filter(w => !oldSet.has(w)),
  ]))
    .map(w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(w => w.length > 1)
    .slice(0, 8);
}
function getSectionStyle(sections: Section[], sectionId: number, field: string): GenericTextStyle {
  const section = sections.find(s => s.id === sectionId);
  const content = (section?.settings?.content ?? {}) as { __styles?: Record<string, GenericTextStyle> };
  return content.__styles?.[field] ?? {};
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface StudioState {
  tenant: Tenant;
  page: Page;
  sections: Section[];
  overrides: TenantOverride[];
  saveStatus: SaveStatus;
  saveError: string | null;
  dismissSaveError: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  /** Push aktuální stav sekcí do globální undo historie (např. před overlay editem). */
  recordSectionHistory: (sectionId: number, field?: string) => void;
  flushSave: () => Promise<void>;
  saveSectionsBatch: (next: Section[]) => Promise<void>;
  saveAsteraContent: (section: Section, content: SiteContent) => Promise<void>;
  patchSection: (id: number, patch: Partial<Pick<Section, "settings" | "is_visible">>) => Promise<void>;
  /** Patch a single content field (supports dotted nested paths). Reads current section from ref — no stale-closure risk. */
  patchSectionContent: (id: number, fieldPath: string, value: unknown) => Promise<void>;
  reorderSections: (ids: number[]) => Promise<void>;
  duplicateSection: (id: number) => Promise<void>;
  deleteSection: (id: number) => Promise<void>;
  addSection: (type: string, variant: string, insertAtIndex?: number, settings?: Record<string, unknown>) => Promise<void>;
  updateSectionLocal: (id: number, patch: Partial<Section>) => void;
}

export function TenantStudioView({ tenant, page, sections: initialSections, overrides = [], initialBuilderOpen = false }: Props) {
  return (
    <StudioProvider initialBuilderOpen={initialBuilderOpen}>
      <InnerStudio tenant={tenant} page={page} initialSections={initialSections} overrides={overrides} />
    </StudioProvider>
  );
}

function InnerStudio({
  tenant,
  page,
  initialSections,
  overrides,
}: {
  tenant: Tenant;
  page: Page;
  initialSections: Section[];
  overrides: TenantOverride[];
}) {
  const studio = useStudio();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflictSectionId, setConflictSectionId] = useState<number | null>(null);
  // Revize sekcí (updated_at epoch ms) pro optimistic concurrency — If-Match na PATCH
  const revisionsRef = useRef<Map<number, string>>(new Map(
    initialSections
      .filter(s => (s as Section & { updated_at?: string }).updated_at)
      .map(s => [s.id, String(new Date((s as Section & { updated_at?: string }).updated_at!).getTime())])
  ));
  const [highlighted, setHighlighted] = useState<GenericHighlightChange[]>([]);
  const historyRef = useRef<HistoryEntry[]>([]);
  const redoRef = useRef<HistoryEntry[]>([]);
  const sectionsRef = useRef<Section[]>(initialSections);
  const pendingIdsRef = useRef<Set<number>>(new Set());
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [historyTick, setHistoryTick] = useState(0);
  sectionsRef.current = sections;

  const markStatus = useCallback((s: SaveStatus, error?: string) => {
    setSaveStatus(s);
    if (s === "error") {
      setSaveError(error ?? "Ukládání selhalo. Změny nebyly zapsány do databáze.");
    } else if (s === "saving" || s === "saved") {
      setSaveError(null);
    }
    if (s === "saved") {
      setTimeout(() => setSaveStatus(prev => (prev === "saved" ? "idle" : prev)), 1800);
    }
  }, []);
  const dismissSaveError = useCallback(() => setSaveError(null), []);

  async function extractError(res: Response): Promise<string> {
    try {
      const body = (await res.clone().json()) as { error?: string };
      if (body.error) return `${res.status}: ${body.error}`;
    } catch { /* not JSON */ }
    return `HTTP ${res.status} ${res.statusText}`.trim();
  }

  /** PATCH sekce s If-Match revizí. 412 ⇒ konfliktní modal (vrací false, nevyhazuje). */
  const patchSectionRequest = useCallback(async (
    id: number,
    body: Record<string, unknown>,
    opts?: { force?: boolean }
  ): Promise<boolean> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const rev = revisionsRef.current.get(id);
    if (rev && !opts?.force) headers["If-Match"] = rev;
    const res = await fetch(`/api/demo/${tenant.slug}/sections/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (res.status === 412) {
      setConflictSectionId(id);
      // Sekci vrátíme do fronty, aby ji „Přepsat" mohlo uložit
      pendingIdsRef.current.add(id);
      return false;
    }
    if (!res.ok) throw new Error(await extractError(res));
    const data = (await res.json().catch(() => ({}))) as { revision?: string | null };
    if (data.revision) revisionsRef.current.set(id, data.revision);
    return true;
  }, [tenant.slug]);

  // Auto-snapshot: textové PATCHe (na rozdíl od batch PUT) revize nevytváří,
  // tak po úspěšném flushi max. 1× za 10 min uložíme verzi do page_revisions.
  const lastSnapshotRef = useRef<number>(Date.now());
  const maybeAutoSnapshot = useCallback(() => {
    if (Date.now() - lastSnapshotRef.current < AUTO_SNAPSHOT_INTERVAL) return;
    lastSnapshotRef.current = Date.now();
    void fetch(`/api/demo/${tenant.slug}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId: page.id, label: "auto" }),
    }).catch(() => { /* snapshot je best-effort */ });
  }, [tenant.slug, page.id]);

  const flushGenericSave = useCallback(async (opts?: { force?: boolean }) => {
    const ids = Array.from(pendingIdsRef.current);
    if (!ids.length) return;
    pendingIdsRef.current.clear();
    markStatus("saving");
    try {
      const results = await Promise.all(ids.map(async (id) => {
        const section = sectionsRef.current.find(s => s.id === id);
        if (!section) return true;
        return patchSectionRequest(id, { settings: section.settings ?? {} }, opts);
      }));
      markStatus(results.every(Boolean) ? "saved" : "idle");
      if (results.every(Boolean)) maybeAutoSnapshot();
    } catch (e) {
      markStatus("error", e instanceof Error ? e.message : "Síťová chyba");
    }
  }, [markStatus, patchSectionRequest, maybeAutoSnapshot]);

  const queueGenericSave = useCallback((sectionId: number) => {
    pendingIdsRef.current.add(sectionId);
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(flushGenericSave, AUTOSAVE_DELAY);
  }, [flushGenericSave]);

  const showHighlight = useCallback((changed: GenericHighlightChange[]) => {
    setHighlighted(changed);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setHighlighted([]), HIGHLIGHT_DELAY);
  }, []);

  const updateField = useCallback((sectionId: number, field: string, value: unknown, options?: { recordHistory?: boolean }) => {
    setSections(prev => {
      const before = cloneSections(prev);
      let changed: GenericHighlightChange[] = [];
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const nextContent = setPathValue(content, field, value);
        changed = [{
          sectionId,
          field,
          snippets: textSnippets(getPathValue(content, field), getPathValue(nextContent, field)),
        }];
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });
      if (options?.recordHistory !== false) {
        historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), { sections: before, changed }];
        redoRef.current = [];
        setHistoryTick(t => t + 1);
      } else {
        const last = historyRef.current[historyRef.current.length - 1];
        if (last?.changed.some(c => c.sectionId === sectionId && c.field === field)) {
          historyRef.current = [...historyRef.current.slice(0, -1), { ...last, changed }];
        }
      }
      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  const updateStyle = useCallback((sectionId: number, field: string, style: GenericTextStyle) => {
    setSections(prev => {
      const before = cloneSections(prev);
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const styles = { ...((content.__styles as Record<string, GenericTextStyle> | undefined) ?? {}) };
        styles[field] = Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined)) as GenericTextStyle;
        const nextContent = { ...content, __styles: styles };
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });
      historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), {
        sections: before,
        changed: [{ sectionId, field, snippets: [] }],
      }];
      redoRef.current = [];
      setHistoryTick(t => t + 1);
      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  /** Like updateStyle but skips the save queue — for live preview in toolbar draft mode. */
  const updateStyleLocal = useCallback((sectionId: number, field: string, style: GenericTextStyle) => {
    setSections(prev => {
      const next = prev.map(section => {
        if (section.id !== sectionId) return section;
        const content = (section.settings?.content ?? {}) as Record<string, unknown>;
        const styles = { ...((content.__styles as Record<string, GenericTextStyle> | undefined) ?? {}) };
        styles[field] = Object.fromEntries(Object.entries(style).filter(([, v]) => v !== undefined)) as GenericTextStyle;
        const nextContent = { ...content, __styles: styles };
        return { ...section, settings: { ...(section.settings ?? {}), content: nextContent } };
      });
      sectionsRef.current = next;
      return next;
    });
  }, []);

  const recordSectionHistory = useCallback((sectionId: number, field = "overlay") => {
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), {
      sections: cloneSections(sectionsRef.current),
      changed: [{ sectionId, field, snippets: [] }],
    }];
    redoRef.current = [];
    setHistoryTick(t => t + 1);
  }, []);

  const undo = useCallback(() => {
    const entry = historyRef.current[historyRef.current.length - 1];
    if (!entry) return;
    historyRef.current = historyRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current.slice(-(MAX_HISTORY - 1)), { sections: cloneSections(sectionsRef.current), changed: entry.changed }];
    const next = cloneSections(entry.sections);
    sectionsRef.current = next;
    setSections(next);
    setHistoryTick(t => t + 1);
    showHighlight(entry.changed);
    entry.changed.forEach(c => queueGenericSave(c.sectionId));
  }, [queueGenericSave, showHighlight]);

  const redo = useCallback(() => {
    const entry = redoRef.current[redoRef.current.length - 1];
    if (!entry) return;
    redoRef.current = redoRef.current.slice(0, -1);
    historyRef.current = [...historyRef.current.slice(-(MAX_HISTORY - 1)), { sections: cloneSections(sectionsRef.current), changed: entry.changed }];
    const next = cloneSections(entry.sections);
    sectionsRef.current = next;
    setSections(next);
    setHistoryTick(t => t + 1);
    showHighlight(entry.changed);
    entry.changed.forEach(c => queueGenericSave(c.sectionId));
  }, [queueGenericSave, showHighlight]);

  const saveSectionsBatch = useCallback(async (next: Section[]) => {
    markStatus("saving");
    try {
      const res = await fetch(`/api/demo/${tenant.slug}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: next }),
      });
      if (!res.ok) throw new Error(await extractError(res));
      // Batch zápis mění updated_at všech sekcí — lokální revize jsou po něm stale
      revisionsRef.current.clear();
      const body = (await res.json().catch(() => ({}))) as { idMap?: Record<string, number> };
      if (body.idMap && Object.keys(body.idMap).length > 0) {
        const map = body.idMap;
        setSections(prev => {
          const remapped = prev.map(s => map[String(s.id)] ? { ...s, id: map[String(s.id)] } : s);
          sectionsRef.current = remapped;
          return remapped;
        });
      }
      markStatus("saved");
    } catch (e) {
      markStatus("error", e instanceof Error ? e.message : "Síťová chyba");
    }
  }, [tenant.slug, markStatus]);

  const saveAsteraContent = useCallback(async (section: Section, content: SiteContent) => {
    markStatus("saving");
    try {
      const settings = { ...(section.settings ?? {}), content };
      const ok = await patchSectionRequest(section.id, { settings });
      if (ok) {
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, settings } : s));
        markStatus("saved");
      } else {
        markStatus("idle");
      }
    } catch (e) {
      markStatus("error", e instanceof Error ? e.message : "Síťová chyba");
    }
  }, [markStatus, patchSectionRequest]);

  const patchSection = useCallback(async (id: number, patch: Partial<Pick<Section, "settings" | "is_visible">>) => {
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...patch } : s);
      sectionsRef.current = next;
      return next;
    });
    markStatus("saving");
    try {
      const ok = await patchSectionRequest(id, patch as Record<string, unknown>);
      markStatus(ok ? "saved" : "idle");
    } catch (e) {
      markStatus("error", e instanceof Error ? e.message : "Síťová chyba");
    }
  }, [markStatus, patchSectionRequest]);

  const patchSectionContent = useCallback(async (id: number, fieldPath: string, value: unknown) => {
    const section = sectionsRef.current.find(s => s.id === id);
    if (!section) return;
    const currentContent = (section.settings?.content ?? {}) as Record<string, unknown>;
    const newContent = setNestedValue(currentContent, fieldPath, value);
    await patchSection(id, {
      settings: { ...(section.settings ?? {}), content: newContent },
    });
  }, [patchSection]);

  const reorderSections = useCallback(async (ids: number[]) => {
    const map = new Map(sectionsRef.current.map(s => [s.id, s]));
    const next = ids
      .map((id, idx) => {
        const s = map.get(id);
        if (!s) return null;
        return { ...s, order_index: idx };
      })
      .filter((s): s is Section => s !== null);
    setSections(next);
    sectionsRef.current = next;
    await saveSectionsBatch(next);
  }, [saveSectionsBatch]);

  const duplicateSection = useCallback(async (id: number) => {
    const source = sectionsRef.current.find(s => s.id === id);
    if (!source) return;
    const tempId = -(Date.now() & 0x7fffffff);
    const dup: Section = { ...source, id: tempId, order_index: source.order_index + 1 };
    const next = [...sectionsRef.current];
    const insertAt = next.findIndex(s => s.id === id) + 1;
    next.splice(insertAt, 0, dup);
    const reindexed = next.map((s, idx) => ({ ...s, order_index: idx }));
    setSections(reindexed);
    sectionsRef.current = reindexed;
    await saveSectionsBatch(reindexed);
  }, [saveSectionsBatch]);

  const deleteSection = useCallback(async (id: number) => {
    const next = sectionsRef.current.filter(s => s.id !== id).map((s, idx) => ({ ...s, order_index: idx }));
    setSections(next);
    sectionsRef.current = next;
    if (studio.selectedSectionId === id) studio.setSelection(null);
    markStatus("saving");
    try {
      // For never-saved temp sections (id <= 0) there is no DB row to delete.
      if (id > 0) {
        const res = await fetch(`/api/demo/${tenant.slug}/sections/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(await extractError(res));
      }
      // Re-save remaining sections so the new order_index values land in DB.
      await saveSectionsBatch(next);
    } catch (e) {
      markStatus("error", e instanceof Error ? e.message : "Síťová chyba");
    }
  }, [tenant.slug, saveSectionsBatch, studio, markStatus]);

  const addSection = useCallback(async (type: string, variant: string, insertAtIndex?: number, settings?: Record<string, unknown>) => {
    // Negative temp id signals "new section" to the API (which assigns a real
    // serial id and returns it in idMap). Must fit in 32-bit signed INTEGER.
    const tempId = -(Date.now() & 0x7fffffff);
    const newSection: Section = {
      id: tempId,
      tenant_id: tenant.id,
      page_id: page.id,
      section_type: type,
      section_variant: variant,
      order_index: 0,
      is_visible: true,
      // settings = snapshot z „Moje sekce" nebo section clipboardu (⌘V)
      settings: settings ?? { content: {} },
    };
    const current = [...sectionsRef.current].sort((a, b) => a.order_index - b.order_index);
    let insertAt: number;
    if (typeof insertAtIndex === "number") {
      insertAt = Math.max(0, Math.min(insertAtIndex, current.length));
    } else {
      const footerIdx = current.findIndex(s => s.section_type === "footer");
      insertAt = footerIdx >= 0 ? footerIdx : current.length;
    }
    current.splice(insertAt, 0, newSection);
    const reindexed = current.map((s, idx) => ({ ...s, order_index: idx }));
    setSections(reindexed);
    sectionsRef.current = reindexed;
    await saveSectionsBatch(reindexed);
  }, [tenant.id, page.id, saveSectionsBatch]);

  const updateSectionLocal = useCallback((id: number, patch: Partial<Section>) => {
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...patch } : s);
      sectionsRef.current = next;
      return next;
    });
  }, []);

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
      setHistoryTick(t => t + 1);
      sectionsRef.current = next;
      return next;
    });
    queueGenericSave(sectionId);
  }, [queueGenericSave]);

  const visibleSections = sections.filter(s => s.is_visible);
  const hasAsteraHome = visibleSections.some(s => s.section_type === "astera-home");
  const hasClonePage = visibleSections.some(s => s.section_type === "full-page-clone");
  const genericEditorEnabled = !hasAsteraHome && !hasClonePage;

  const genericEditorValue = useMemo(() => ({
    isAdmin: genericEditorEnabled,
    isStudio: true,
    highlighted,
    updateField,
    updateStyle,
    updateStyleLocal,
    reorderField: reorderArrayField,
    getStyle: (sectionId: number, field: string) => getSectionStyle(sections, sectionId, field),
  }), [genericEditorEnabled, highlighted, sections, updateField, updateStyle, updateStyleLocal, reorderArrayField]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inEditable = target && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault(); undo(); return;
      }
      if (mod && (e.key.toLowerCase() === "z" && e.shiftKey || e.key.toLowerCase() === "y")) {
        e.preventDefault(); redo(); return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault(); void flushGenericSave(); return;
      }
      // 3d — copy/paste celé sekce (⌘C/⌘V). Neblokuje kopírování textu:
      // přeskočí se, když je fokus v editovatelném poli nebo existuje výběr textu.
      if (mod && e.key.toLowerCase() === "c" && !e.shiftKey && !inEditable) {
        if (window.getSelection()?.toString()) return; // uživatel kopíruje text
        const sel = studio.selectedSectionId;
        const section = sel !== null ? sectionsRef.current.find(s => s.id === sel) : undefined;
        if (!section || section.section_type === "navbar" || section.section_type === "footer") return;
        e.preventDefault();
        try {
          window.localStorage.setItem("venom-studio.section-clipboard", JSON.stringify({
            type: section.section_type,
            variant: section.section_variant,
            settings: section.settings ?? {},
            ts: Date.now(),
          }));
          window.dispatchEvent(new CustomEvent("venom-studio:toast", { detail: { text: "Sekce zkopírována — vlož ji ⌘V (i na jiné stránce)" } }));
        } catch { /* storage full */ }
        return;
      }
      if (mod && e.key.toLowerCase() === "v" && !e.shiftKey && !inEditable) {
        let raw: string | null = null;
        try { raw = window.localStorage.getItem("venom-studio.section-clipboard"); } catch { /* ignore */ }
        if (!raw) return;
        e.preventDefault();
        try {
          const clip = JSON.parse(raw) as { type: string; variant: string; settings: Record<string, unknown> };
          // Vlož pod aktuálně vybranou sekci, jinak na konec (před footer)
          const sel = studio.selectedSectionId;
          const sorted = [...sectionsRef.current].sort((a, b) => a.order_index - b.order_index);
          const selIdx = sel !== null ? sorted.findIndex(s => s.id === sel) : -1;
          const insertAt = selIdx >= 0 ? selIdx + 1 : undefined;
          void addSection(clip.type, clip.variant, insertAt, clip.settings);
          window.dispatchEvent(new CustomEvent("venom-studio:toast", { detail: { text: "Sekce vložena" } }));
        } catch { /* corrupt clipboard */ }
        return;
      }
      if (!inEditable && !mod) {
        if (e.key === "1") { studio.setBreakpoint("desktop"); return; }
        if (e.key === "2") { studio.setBreakpoint("tablet"); return; }
        if (e.key === "3") { studio.setBreakpoint("mobile"); return; }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, flushGenericSave, studio, addSection]);

  // Suppress unused historyTick warning while still triggering rerenders
  void historyTick;

  const studioState: StudioState = {
    tenant,
    page,
    sections,
    overrides,
    saveStatus,
    saveError,
    dismissSaveError,
    canUndo: historyRef.current.length > 0,
    canRedo: redoRef.current.length > 0,
    undo,
    redo,
    recordSectionHistory,
    flushSave: flushGenericSave,
    saveSectionsBatch,
    saveAsteraContent,
    patchSection,
    patchSectionContent,
    reorderSections,
    duplicateSection,
    deleteSection,
    addSection,
    updateSectionLocal,
  };

  return (
    <GenericInlineEditorProvider value={genericEditorValue}>
      <StudioShell state={studioState} />
      {conflictSectionId !== null && (
        <ConflictModal
          onReload={() => window.location.reload()}
          onOverwrite={async () => {
            setConflictSectionId(null);
            revisionsRef.current.delete(conflictSectionId);
            await flushGenericSave({ force: true });
          }}
        />
      )}
    </GenericInlineEditorProvider>
  );
}

/** 412 konflikt — sekci mezitím uložil někdo jiný (druhé okno / kolega). */
function ConflictModal({ onReload, onOverwrite }: { onReload: () => void; onOverwrite: () => void }) {
  return (
    <div data-studio className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
      <div className="w-full max-w-[420px] mx-4 rounded-2xl bg-[var(--vs-surface)] p-6 shadow-[var(--vs-shadow-xl)] ring-1 ring-[var(--vs-border-strong)]">
        <h2 className="text-[16px] font-bold text-[var(--vs-text)] mb-2">Někdo jiný uložil změny</h2>
        <p className="text-[13px] leading-relaxed text-[var(--vs-text-muted)] mb-5">
          Tato sekce byla mezitím změněna v jiném okně nebo jiným uživatelem.
          Můžeš načíst aktuální verzi (tvé neuložené úpravy této sekce se zahodí),
          nebo ji přepsat svou verzí.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onOverwrite}
            className="rounded-lg border border-[var(--vs-border-strong)] px-4 py-2 text-[13px] font-medium text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)] transition-colors"
          >
            Přepsat mou verzí
          </button>
          <button
            type="button"
            onClick={onReload}
            className="vs-grad-accent rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[var(--vs-glow-brand)]"
          >
            Načíst znovu
          </button>
        </div>
      </div>
    </div>
  );
}
