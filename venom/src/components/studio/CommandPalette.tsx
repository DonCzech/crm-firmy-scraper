"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search, Layers as LayersIcon, Image as ImageIcon, Palette, FileText,
  Settings, Monitor, Tablet, Smartphone, Undo2, Globe, CreditCard,
  AlignJustify, LayoutGrid, Feather, BarChart2, ChevronRight, CheckSquare,
} from "@/components/studio/icons";
import clsx from "clsx";
import { useStudio } from "./StudioContext";
import { MODULES_ENABLED } from "./StudioLeftRail";
import type { StudioState } from "./TenantStudioView";

interface CmdItem {
  id: string;
  label: string;
  category: string;
  keys?: string[];
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  action: string;
  dynamic?: true;
}

const STATIC_ITEMS: CmdItem[] = [
  // Navigation
  { id: "layers",           label: "Vrstva stránek",            category: "Navigace",    keys: ["L"],              icon: LayersIcon,    action: "layers" },
  { id: "add",              label: "Přidat sekci",              category: "Navigace",    keys: ["A"],              icon: AlignJustify,  action: "add" },
  { id: "design",           label: "Design a barvy",            category: "Navigace",    keys: ["D"],              icon: Palette,       action: "design" },
  { id: "brand",            label: "Brand a logo",              category: "Navigace",    keys: ["B"],              icon: Feather,       action: "brand" },
  { id: "modules",          label: "Moduly webu",               category: "Navigace",    keys: ["M"],              icon: LayoutGrid,    action: "modules" },
  { id: "pages",            label: "Správa stránek",            category: "Navigace",    keys: ["P"],              icon: FileText,      action: "pages" },
  { id: "articles",         label: "Správa článků",             category: "Navigace",    keys: [],                 icon: Feather,       action: "articles" },
  { id: "analytics",        label: "Analytika",                 category: "Navigace",    keys: [],                 icon: BarChart2,     action: "analytics" },
  // Assets
  { id: "assets",           label: "Galerie obrázků",           category: "Obrázky",     keys: ["⌘", "⇧", "L"],   icon: ImageIcon,     action: "assets" },
  // Breakpoints
  { id: "desktop",          label: "Zobrazení: Desktop",        category: "Zobrazení",   keys: ["1"],              icon: Monitor,       action: "desktop" },
  { id: "tablet",           label: "Zobrazení: Tablet",         category: "Zobrazení",   keys: ["2"],              icon: Tablet,        action: "tablet" },
  { id: "mobile",           label: "Zobrazení: Mobil",          category: "Zobrazení",   keys: ["3"],              icon: Smartphone,    action: "mobile" },
  { id: "zoom-fit",         label: "Zoom: Přizpůsobit",         category: "Zobrazení",   keys: [],                                      action: "zoom-fit" },
  { id: "zoom-100",         label: "Zoom: 100%",                category: "Zobrazení",   keys: [],                                      action: "zoom-100" },
  // History & publish
  { id: "undo",             label: "Zpět",                      category: "Akce",        keys: ["⌘", "Z"],         icon: Undo2,         action: "undo" },
  { id: "redo",             label: "Znovu",                     category: "Akce",        keys: ["⌘", "⇧", "Z"],    icon: Undo2,         action: "redo" },
  { id: "publish-page",     label: "Publikovat stránku",        category: "Akce",        keys: [],                 icon: Globe,         action: "publish-page" },
  { id: "publish-site",     label: "Publikovat celý web",       category: "Akce",        keys: [],                 icon: Globe,         action: "publish-site" },
  { id: "history",          label: "Historie verzí",            category: "Akce",        keys: [],                 icon: Undo2,         action: "history" },
  // Themes
  { id: "theme-violet",     label: "Téma editoru: Violet",      category: "Vzhled",      keys: [],                 icon: Palette,       action: "theme-violet" },
  { id: "theme-silver",     label: "Téma editoru: Stříbrná",    category: "Vzhled",      keys: [],                 icon: Palette,       action: "theme-silver" },
  { id: "theme-indigo",     label: "Téma editoru: Indigo",      category: "Vzhled",      keys: [],                 icon: Palette,       action: "theme-indigo" },
  // Settings
  { id: "settings-web",     label: "Nastavení webu",            category: "Nastavení",   keys: [],                 icon: Globe,         action: "settings-web" },
  { id: "settings-billing", label: "Fakturace a platby",        category: "Nastavení",   keys: [],                 icon: CreditCard,    action: "settings-billing" },
  // Checklist
  { id: "checklist",        label: "Nastavení webu (checklist)", category: "Nastavení", keys: [],                 icon: CheckSquare,   action: "checklist" },
  // Shortcuts
  { id: "shortcuts",        label: "Klávesové zkratky",         category: "Nápověda",    keys: ["?"],              icon: Settings,      action: "shortcuts" },
];

function fuzzyScore(query: string, target: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return 1 + (q.length / t.length);
  let qi = 0, score = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) { score++; qi++; }
  }
  return qi === q.length ? score / t.length : 0;
}

export function CommandPalette({ state }: { state?: StudioState }) {
  const studio = useStudio();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [pages, setPages] = useState<Array<{ id: number; title: string; slug: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load pages when palette opens
  useEffect(() => {
    if (!studio.commandPaletteOpen || !state) return;
    fetch(`/api/demo/${state.tenant.slug}/pages`)
      .then((r) => r.ok ? r.json() : { pages: [] })
      .then((data: { pages?: Array<{ id: number; title: string; slug: string }> } | Array<{ id: number; title: string; slug: string }>) => {
        setPages(Array.isArray(data) ? data : Array.isArray(data.pages) ? data.pages : []);
      })
      .catch(() => setPages([]));
  }, [studio.commandPaletteOpen, state]);

  useEffect(() => {
    if (studio.commandPaletteOpen) {
      setQuery("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [studio.commandPaletteOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") studio.setCommandPaletteOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [studio]);

  const dynamicPageItems: CmdItem[] = pages.map(p => ({
    id: `page-${p.id}`,
    label: `Stránka: ${p.title || p.slug}`,
    category: "Stránky",
    action: `page-${p.id}`,
    icon: FileText,
    dynamic: true,
  }));

  const allItems = [...STATIC_ITEMS, ...dynamicPageItems]
    .filter(item => MODULES_ENABLED || item.id !== "modules");

  const scored = allItems
    .map(item => ({ item, score: fuzzyScore(query, item.label) + fuzzyScore(query, item.category) * 0.4 }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  // Group by category
  const groups: Array<{ category: string; items: CmdItem[] }> = [];
  for (const item of scored) {
    let g = groups.find(g => g.category === item.category);
    if (!g) { g = { category: item.category, items: [] }; groups.push(g); }
    g.items.push(item);
  }

  const flat = groups.flatMap(g => g.items);

  const safeCursor = Math.min(cursor, Math.max(0, flat.length - 1));

  const run = useCallback((action: string) => {
    studio.setCommandPaletteOpen(false);
    if (action.startsWith("page-")) {
      const id = parseInt(action.slice(5));
      const page = pages.find(p => p.id === id);
      if (page) window.location.href = `?page=${id}`;
      return;
    }
    switch (action) {
      case "layers":            studio.setLeftPanel("layers"); break;
      case "add":               studio.setLeftPanel("add"); break;
      case "design":            studio.setLeftPanel("design"); break;
      case "brand":             studio.setLeftPanel("brand"); break;
      case "modules":           studio.setLeftPanel("modules"); break;
      case "pages":             studio.setLeftPanel("pages"); break;
      case "articles":          studio.setLeftPanel("articles"); break;
      case "analytics":         if (state) window.location.href = `/demo/${state.tenant.slug}/admin/analytics`; break;
      case "assets":            studio.setAssetsOpen(true); break;
      case "desktop":           studio.setBreakpoint("desktop"); break;
      case "tablet":            studio.setBreakpoint("tablet"); break;
      case "mobile":            studio.setBreakpoint("mobile"); break;
      case "zoom-fit":          studio.setZoom("fit"); break;
      case "zoom-100":          studio.setZoom(100); break;
      case "undo":              state?.undo(); break;
      case "redo":              state?.redo(); break;
      case "publish-page":      window.dispatchEvent(new CustomEvent("venom-studio:publish", { detail: { mode: "page" } })); break;
      case "publish-site":      window.dispatchEvent(new CustomEvent("venom-studio:publish", { detail: { mode: "site" } })); break;
      case "history":           studio.setHistoryPanelOpen(true); break;
      case "theme-violet":      studio.setEditorTheme("violet"); break;
      case "theme-silver":      studio.setEditorTheme("silver"); break;
      case "theme-indigo":      studio.setEditorTheme("indigo"); break;
      case "settings-web":      studio.setLeftPanel("settings"); studio.setSettingsView("web"); break;
      case "settings-billing":  studio.setLeftPanel("settings"); studio.setSettingsView("billing"); break;
      case "checklist":         studio.setChecklistOpen(true); break;
      case "shortcuts":         studio.setShortcutsOpen(true); break;
    }
  }, [studio, pages]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor(c => Math.min(c + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor(c => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && flat[safeCursor]) {
      run(flat[safeCursor].action);
    }
  }

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${safeCursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [safeCursor]);

  if (!studio.commandPaletteOpen) return null;

  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/60 p-3 pt-14 backdrop-blur-[3px] vs-enter sm:pt-16"
      onClick={() => studio.setCommandPaletteOpen(false)}
    >
      <div
        className="flex w-full max-w-[560px] max-h-[calc(100vh-72px)] flex-col overflow-hidden rounded-2xl bg-[var(--vs-surface)] shadow-[0_24px_64px_rgba(0,0,0,0.85)] ring-1 ring-[var(--vs-border-strong)]"
        onClick={e => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--vs-surface-2)]">
          <Search className="h-4 w-4 text-[#6b7280] shrink-0" strokeWidth={1.75} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Hledat příkazy, stránky, nastavení…"
            className="flex-1 bg-transparent text-[14px] text-white placeholder-[#6b7280] outline-none"
          />
          <kbd className="shrink-0 rounded-md bg-[var(--vs-surface-2)] px-2 py-1 text-[10px] font-mono text-[var(--vs-text-muted)]">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto vs-scroll py-2">
          {groups.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#6b7280]">Nic nenalezeno</p>
          ) : (
            groups.map(group => (
              <div key={group.category}>
                <div className="px-4 py-1.5 text-[10.5px] font-semibold tracking-wider text-[var(--vs-text-dim)] uppercase">
                  {group.category}
                </div>
                {group.items.map(item => {
                  const myIdx = flatIdx++;
                  const active = myIdx === safeCursor;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-idx={myIdx}
                      type="button"
                      onClick={() => run(item.action)}
                      onMouseEnter={() => setCursor(myIdx)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75",
                        active ? "bg-[var(--vs-surface-2)]" : "hover:bg-[#232325]"
                      )}
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4 text-[var(--vs-text-dim)] shrink-0" strokeWidth={1.6} />
                      ) : (
                        <span className="h-4 w-4 shrink-0" />
                      )}
                      <span className={clsx("flex-1 text-[13px]", active ? "text-white" : "text-[var(--vs-text-soft)]")}>
                        {item.label}
                      </span>
                      {item.keys && item.keys.length > 0 && (
                        <span className="flex items-center gap-0.5 shrink-0">
                          {item.keys.map((k, i) => (
                            <kbd key={i} className="rounded bg-[var(--vs-border-strong)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--vs-text-muted)]">{k}</kbd>
                          ))}
                        </span>
                      )}
                      {active && <ChevronRight className="h-3.5 w-3.5 text-[var(--vs-text-dim)] shrink-0" strokeWidth={2} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="hidden border-t border-[var(--vs-surface-2)] px-4 py-2 text-[11px] text-[var(--vs-text-dim)] sm:flex sm:items-center sm:gap-4">
          <span className="flex items-center gap-1"><kbd className="rounded bg-[var(--vs-surface-2)] px-1 py-0.5 text-[10px] font-mono text-[var(--vs-text-dim)]">↑↓</kbd> navigace</span>
          <span className="flex items-center gap-1"><kbd className="rounded bg-[var(--vs-surface-2)] px-1 py-0.5 text-[10px] font-mono text-[var(--vs-text-dim)]">↵</kbd> vybrat</span>
          <span className="flex items-center gap-1"><kbd className="rounded bg-[var(--vs-surface-2)] px-1 py-0.5 text-[10px] font-mono text-[var(--vs-text-dim)]">ESC</kbd> zavřít</span>
        </div>
      </div>
    </div>
  );
}
