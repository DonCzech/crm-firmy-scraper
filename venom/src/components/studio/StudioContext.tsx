"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Persist the panel state across full-page navigations (e.g. when the user
 * clicks a different page in the Stránky list, the admin route reloads and
 * the StudioContext re-initialises). Without this, the back-stack would be
 * lost and the back button would jump straight to the rail overview instead
 * of returning to "Stránky".
 */
const PANEL_STATE_KEY = "venom-studio.panel-state.v1";
type PersistedPanelState = { leftPanel: StudioLeftPanel; panelHistory: StudioLeftPanel[] };
function readPersistedState(): PersistedPanelState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PANEL_STATE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as PersistedPanelState;
    if (!obj || typeof obj !== "object") return null;
    return obj;
  } catch { return null; }
}

export type StudioBreakpoint = "desktop" | "tablet" | "mobile";
export type StudioLeftPanel = "layers" | "add" | "pages" | "assets" | "brand" | "settings" | "design" | "modules" | "articles" | null;

/** Element selected inside a full-page-clone iframe — used by the right Inspector */
export interface CloneSelection {
  /** Stable data-edit-id assigned by the iframe runtime */
  editId: string;
  /** Tag name lowercase (h1, p, img, a, …) */
  tag: string;
  /** Text content (for text elements) — empty for img */
  text: string;
  /** Source URL (for img) */
  src: string | null;
  /** Inline + computed style snapshot we can edit */
  style: {
    fontSize: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    color: string;
    textAlign: string;
    backgroundColor: string;
  };
}

export interface StudioImagePanel {
  /** Absolute URL of the clicked image */
  src: string;
  alt: string;
  sectionId: number;
  /** Screen position where the panel should appear */
  panelPos: { x: number; y: number };
  /** Focus point 0-100 percentages */
  focus: { x: number; y: number };
  /** Callback invoked when the user picks a replacement image from the gallery */
  onReplace?: (url: string, alt: string) => void;
  /** Callback invoked on every focus drag — apply live object-position to canvas img */
  onFocusChange?: (focus: { x: number; y: number }) => void;
  /** Callback invoked when "Hotovo" is clicked — save focus to section content */
  onFocusSave?: (focus: { x: number; y: number }) => void;
  /** If present, show a Delete button that removes this image (e.g. from gallery array) */
  onDelete?: () => void;
}

export interface StudioContextValue {
  selectedSectionId: number | null;
  selectedField: string | null;
  setSelection: (sectionId: number | null, field?: string | null) => void;
  breakpoint: StudioBreakpoint;
  setBreakpoint: (b: StudioBreakpoint) => void;
  leftPanel: StudioLeftPanel;
  setLeftPanel: (p: StudioLeftPanel) => void;
  /**
   * Switch to a new panel while remembering the current one so a
   * subsequent `goBack()` returns there. Used when an action inside a
   * panel triggers a contextual follow-up panel — e.g. clicking a page in
   * "Stránky" opens "Vrstvy" but the back button should land back on
   * "Stránky", not the rail overview.
   */
  pushPanel: (p: StudioLeftPanel) => void;
  /** Pop one level off the history; falls back to closing the panel (null). */
  goBack: () => void;
  rightPanel: boolean;
  setRightPanel: (open: boolean) => void;
  hoverSectionId: number | null;
  setHoverSectionId: (id: number | null) => void;
  /** CSS selector for scroll-into-view inside full-page-clone iframe */
  cloneScrollTarget: string | null;
  setCloneScrollTarget: (selector: string | null) => void;
  /** Currently selected element inside the clone iframe (null if none / not clone tenant) */
  cloneSelected: CloneSelection | null;
  setCloneSelected: (s: CloneSelection | null) => void;
  /** Send a style/text patch back to the iframe — wired by ClonedStudioFrame */
  cloneCommand: ((cmd: CloneCommand) => void) | null;
  setCloneCommand: (fn: ((cmd: CloneCommand) => void) | null) => void;
  /** Which settings sub-page is open in the canvas area (null = canvas/template) */
  settingsView: string | null;
  setSettingsView: (view: string | null) => void;
  /** Media gallery full-screen overlay */
  assetsOpen: boolean;
  setAssetsOpen: (open: boolean) => void;
  /** Active sub-view in ModulesPanel canvas */
  modulesView: string;
  setModulesView: (v: string) => void;
  /** Articles panel / canvas mode */
  articleMode: "list" | "editor";
  setArticleMode: (m: "list" | "editor") => void;
  /** Currently open article ID in the editor */
  currentArticleId: number | null;
  setCurrentArticleId: (id: number | null) => void;
  /** Floating image panel shown when an img element is clicked in the canvas */
  imagePanel: StudioImagePanel | null;
  setImagePanel: (s: StudioImagePanel | null) => void;
  /** Signal to OverlayLayerInner to add a new element of a given type.
   *  Consumed (set back to null) by the first matching OverlayLayerInner. */
  pendingAddEl: { sectionId: number; elementType: string } | null;
  setPendingAddEl: (v: { sectionId: number; elementType: string } | null) => void;
  /** Currently selected overlay element (set by OverlayLayerInner, read by inspector). */
  selectedOverlayEl: { sectionId: number; elementId: string } | null;
  setSelectedOverlayEl: (v: { sectionId: number; elementId: string } | null) => void;
  /** Z-order command sent from inspector → consumed by OverlayLayerInner. */
  overlayZOrderCmd: { sectionId: number; cmd: "front" | "back" | "forward" | "backward" } | null;
  setOverlayZOrderCmd: (v: { sectionId: number; cmd: "front" | "back" | "forward" | "backward" } | null) => void;
  /** Live hero background override — applied instantly in canvas, saved on "Hotovo" */
  heroOverride: { sectionId: number; bg: Record<string, unknown> } | null;
  setHeroOverride: (o: { sectionId: number; bg: Record<string, unknown> } | null) => void;
  /** Live transient padding override during section-resize drag. Cleared on
   *  pointerup once the final value has been committed to DB via patchSection.
   *  Read by SectionRenderer (single source of truth) to apply live preview. */
  transientPadding: { sectionId: number; paddingTop?: number; paddingBottom?: number; paddingX?: number } | null;
  setTransientPadding: (o: { sectionId: number; paddingTop?: number; paddingBottom?: number; paddingX?: number } | null) => void;
  /** Active slide index for slider sections in admin — controls which slide the inspector edits & canvas shows */
  heroSlideIdx: { sectionId: number; idx: number } | null;
  setHeroSlideIdx: (o: { sectionId: number; idx: number } | null) => void;
  /** Whether the 220px left panel is expanded (true) or collapsed (false) */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  /** Mobile-only rail minimized state. When true, canvas can use the full viewport width. */
  mobileRailCollapsed: boolean;
  setMobileRailCollapsed: (collapsed: boolean) => void;
  /** Close every transient editor surface; used as a mobile "back all the way" command. */
  closeAllPanels: (options?: { collapseMobileRail?: boolean }) => void;
  /** Canvas zoom level: "fit" = auto-fit to container, number = absolute % (40–200) */
  zoom: number | "fit";
  setZoom: (z: number | "fit") => void;
  /** Global overlay states */
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  helpPanelOpen: boolean;
  setHelpPanelOpen: (v: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
  checklistOpen: boolean;
  setChecklistOpen: (v: boolean) => void;
  /** Fullscreen AI Builder — dominantní režim Studia (chat + živý náhled).
   *  Otevřený stav se zrcadlí do URL (?builder=1), aby přežil reload a šel sdílet. */
  builderOpen: boolean;
  setBuilderOpen: (v: boolean) => void;
  historyPanelOpen: boolean;
  setHistoryPanelOpen: (v: boolean) => void;
  /** Barevné téma editoru (violet = default, viz design-tokens.css data-vs-theme) */
  editorTheme: EditorTheme;
  setEditorTheme: (t: EditorTheme) => void;
  /** Základní barva custom tématu (#rrggbb) — paleta se z ní odvozuje (editor-theme.ts) */
  customThemeColor: string;
  setCustomThemeColor: (hex: string) => void;
}

export type EditorTheme = "light" | "apple" | "violet" | "silver" | "indigo" | "custom";
const EDITOR_THEME_KEY = "venom-studio.editor-theme";
const EDITOR_THEME_COLOR_KEY = "venom-studio.editor-theme-color";
const EDITOR_THEMES: EditorTheme[] = ["light", "apple", "violet", "silver", "indigo", "custom"];
const DEFAULT_CUSTOM_COLOR = "#e91e63";

export type CloneCommand =
  | { type: "setStyle"; editId: string; patch: Partial<CloneSelection["style"]> }
  | { type: "setText"; editId: string; text: string }
  | { type: "setSrc"; editId: string; src: string }
  | { type: "selectBySelector"; selector: string };

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children, initialBuilderOpen = false }: { children: ReactNode; initialBuilderOpen?: boolean }) {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<StudioBreakpoint>("desktop");

  const [leftPanel, setLeftPanel] = useState<StudioLeftPanel>("layers");
  // History stack of previously-active panels. `pushPanel(p)` switches to `p`
  // while remembering the current one. `goBack()` pops one level. Limited to
  // a depth of 4 so we don't grow forever if some flow keeps pushing.
  const [panelHistory, setPanelHistory] = useState<StudioLeftPanel[]>([]);

  // Restore persisted panel state AFTER mount — sessionStorage is client-only,
  // so reading it during render makes SSR and client HTML disagree (hydration
  // mismatch on the rail's active indicator).
  useEffect(() => {
    const persisted = readPersistedState();
    if (!persisted) return;
    if (persisted.leftPanel !== undefined) setLeftPanel(persisted.leftPanel);
    if (persisted.panelHistory) setPanelHistory(persisted.panelHistory);
  }, []);
  const [rightPanel, setRightPanel] = useState<boolean>(true);
  const [hoverSectionId, setHoverSectionId] = useState<number | null>(null);
  const [cloneScrollTarget, setCloneScrollTarget] = useState<string | null>(null);
  const [cloneSelected, setCloneSelected] = useState<CloneSelection | null>(null);
  const [cloneCommand, setCloneCommand] = useState<((cmd: CloneCommand) => void) | null>(null);
  const [settingsView, setSettingsView] = useState<string | null>(null);
  const [assetsOpen, setAssetsOpen] = useState<boolean>(false);
  const [modulesView, setModulesView] = useState<string>("contacts");
  const [articleMode, setArticleMode] = useState<"list" | "editor">("list");
  const [currentArticleId, setCurrentArticleId] = useState<number | null>(null);
  const [imagePanel, setImagePanel] = useState<StudioImagePanel | null>(null);
  const [heroOverride, setHeroOverride] = useState<{ sectionId: number; bg: Record<string, unknown> } | null>(null);
  const [transientPadding, setTransientPadding] = useState<{ sectionId: number; paddingTop?: number; paddingBottom?: number; paddingX?: number } | null>(null);
  const [heroSlideIdx, setHeroSlideIdx] = useState<{ sectionId: number; idx: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileRailCollapsed, setMobileRailCollapsed] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [checklistOpen, setChecklistOpen] = useState<boolean>(false);
  const [builderOpen, setBuilderOpen] = useState<boolean>(initialBuilderOpen);
  const [historyPanelOpen, setHistoryPanelOpen] = useState<boolean>(false);
  // Světlé téma je výchozí — tmavé shell varianty (violet/silver/indigo)
  // zůstávají volitelné přes přepínač; uložená volba v localStorage vyhrává.
  // `null` = volba z localStorage ještě není načtená; do té doby se NESMÍ
  // sahat na atributy <html>, které před prvním paintem nastavil blokující
  // StudioThemeScript (anti-FOUC) — jinak by defaultní "light" bliklo přes
  // uložené tmavé téma (a dřív naopak tmavý CSS default přes světlé).
  const [editorTheme, setEditorThemeState] = useState<EditorTheme | null>(null);
  const [customThemeColor, setCustomThemeColorState] = useState<string>(DEFAULT_CUSTOM_COLOR);
  const [pendingAddEl, setPendingAddEl] = useState<{ sectionId: number; elementType: string } | null>(null);

  // Téma editoru: načíst z localStorage po mountu (SSR-safe) a aplikovat na <html>
  useEffect(() => {
    let resolved: EditorTheme = "light";
    try {
      const stored = window.localStorage.getItem(EDITOR_THEME_KEY) as EditorTheme | null;
      if (stored && EDITOR_THEMES.includes(stored)) resolved = stored;
      const storedColor = window.localStorage.getItem(EDITOR_THEME_COLOR_KEY);
      if (storedColor && /^#[0-9a-f]{6}$/i.test(storedColor)) setCustomThemeColorState(storedColor);
    } catch { /* ignore */ }
    setEditorThemeState(resolved);
  }, []);
  useEffect(() => {
    if (editorTheme === null) return;
    const root = document.documentElement;
    root.removeAttribute("data-vs-style");
    if (editorTheme === "violet") root.removeAttribute("data-vs-theme");
    else if (editorTheme === "apple") {
      // Minimal is an independent, high-contrast light workspace skin.
      // The persisted id stays stable for users who already selected it.
      root.setAttribute("data-vs-theme", "light");
      root.setAttribute("data-vs-style", "apple");
    } else {
      root.setAttribute("data-vs-theme", editorTheme);
      if (editorTheme === "light") root.setAttribute("data-vs-style", "xora");
    }
    // Custom téma = dynamicky generovaný <style> blok (stejné selektory jako
    // silver/indigo v design-tokens.css, jen hodnoty odvozené z vybrané barvy)
    const existing = document.getElementById("vs-custom-theme");
    if (editorTheme === "custom") {
      void import("./editor-theme").then(({ buildCustomThemeCss }) => {
        const css = buildCustomThemeCss(customThemeColor);
        if (!css) return;
        const styleEl = existing ?? document.createElement("style");
        styleEl.id = "vs-custom-theme";
        styleEl.textContent = css;
        if (!existing) document.head.appendChild(styleEl);
      });
    } else if (existing) {
      existing.remove();
    }
    return () => { root.removeAttribute("data-vs-theme"); root.removeAttribute("data-vs-style"); };
  }, [editorTheme, customThemeColor]);
  const setEditorTheme = (t: EditorTheme) => {
    setEditorThemeState(t);
    try { window.localStorage.setItem(EDITOR_THEME_KEY, t); } catch { /* ignore */ }
  };
  const setCustomThemeColor = (hex: string) => {
    setCustomThemeColorState(hex);
    setEditorThemeState("custom");
    try {
      window.localStorage.setItem(EDITOR_THEME_COLOR_KEY, hex);
      window.localStorage.setItem(EDITOR_THEME_KEY, "custom");
    } catch { /* ignore */ }
  };
  const [selectedOverlayEl, setSelectedOverlayEl] = useState<{ sectionId: number; elementId: string } | null>(null);
  const [overlayZOrderCmd, setOverlayZOrderCmd] = useState<{ sectionId: number; cmd: "front" | "back" | "forward" | "backward" } | null>(null);

  // Persist panel state to sessionStorage so back-navigation survives page reloads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ leftPanel, panelHistory }));
    } catch { /* storage quota exceeded — silently ignore */ }
  }, [leftPanel, panelHistory]);

  const value = useMemo<StudioContextValue>(() => ({
    selectedSectionId,
    selectedField,
    setSelection: (sectionId, field = null) => {
      setSelectedSectionId(sectionId);
      setSelectedField(field);
      if (sectionId !== null) setRightPanel(true);
    },
    breakpoint,
    setBreakpoint,
    leftPanel,
    // Direct switch — clears the back history (used by the rail buttons,
    // which represent top-level navigation; you don't want clicking a
    // different rail icon to leave a phantom "back" target behind).
    setLeftPanel: (p: StudioLeftPanel) => {
      setPanelHistory([]);
      if (p !== "settings") setSettingsView(null);
      setSidebarOpen(p !== null);
      setLeftPanel(p);
    },
    pushPanel: (p: StudioLeftPanel) => {
      setPanelHistory((prev) => [...prev.slice(-3), leftPanel]);
      if (p !== "settings") setSettingsView(null);
      setSidebarOpen(p !== null);
      setLeftPanel(p);
    },
    goBack: () => {
      setPanelHistory((prev) => {
        if (prev.length === 0) {
          setLeftPanel(null);
          return prev;
        }
        const next = prev.slice(0, -1);
        setLeftPanel(prev[prev.length - 1]);
        return next;
      });
    },
    rightPanel,
    setRightPanel,
    hoverSectionId,
    setHoverSectionId,
    cloneScrollTarget,
    setCloneScrollTarget,
    cloneSelected,
    setCloneSelected,
    cloneCommand,
    setCloneCommand: (fn) => setCloneCommand(() => fn), // wrap to avoid setState(prev=>fn)
    settingsView,
    setSettingsView: (view) => {
      setSettingsView(view);
      if (view) setRightPanel(false);
    },
    assetsOpen,
    setAssetsOpen,
    modulesView,
    setModulesView,
    articleMode,
    setArticleMode,
    currentArticleId,
    setCurrentArticleId,
    imagePanel,
    setImagePanel,
    heroOverride,
    setHeroOverride,
    transientPadding,
    setTransientPadding,
    heroSlideIdx,
    setHeroSlideIdx,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen(o => !o),
    mobileRailCollapsed,
    setMobileRailCollapsed,
    closeAllPanels: (options) => {
      setPanelHistory([]);
      setLeftPanel(null);
      setSidebarOpen(false);
      setRightPanel(false);
      setSettingsView(null);
      setSelectedSectionId(null);
      setSelectedField(null);
      setHoverSectionId(null);
      setCloneScrollTarget(null);
      setCloneSelected(null);
      setAssetsOpen(false);
      setImagePanel(null);
      setShortcutsOpen(false);
      setNotificationsOpen(false);
      setHelpPanelOpen(false);
      setCommandPaletteOpen(false);
      setChecklistOpen(false);
      setHistoryPanelOpen(false);
      setPendingAddEl(null);
      setSelectedOverlayEl(null);
      setOverlayZOrderCmd(null);
      if (options?.collapseMobileRail) setMobileRailCollapsed(true);
      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ leftPanel: null, panelHistory: [] }));
        } catch { /* ignore */ }
      }
    },
    zoom,
    setZoom,
    shortcutsOpen,
    setShortcutsOpen,
    notificationsOpen,
    setNotificationsOpen,
    helpPanelOpen,
    setHelpPanelOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
    checklistOpen,
    setChecklistOpen,
    builderOpen,
    setBuilderOpen,
    historyPanelOpen,
    setHistoryPanelOpen,
    editorTheme: editorTheme ?? "light",
    setEditorTheme,
    customThemeColor,
    setCustomThemeColor,
    pendingAddEl,
    setPendingAddEl,
    selectedOverlayEl,
    setSelectedOverlayEl,
    overlayZOrderCmd,
    setOverlayZOrderCmd,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [selectedSectionId, selectedField, breakpoint, leftPanel, panelHistory, rightPanel, hoverSectionId, cloneScrollTarget, cloneSelected, cloneCommand, settingsView, assetsOpen, modulesView, articleMode, currentArticleId, imagePanel, heroOverride, transientPadding, heroSlideIdx, sidebarOpen, mobileRailCollapsed, shortcutsOpen, notificationsOpen, helpPanelOpen, commandPaletteOpen, checklistOpen, builderOpen, historyPanelOpen, editorTheme, customThemeColor, pendingAddEl, selectedOverlayEl, overlayZOrderCmd, zoom]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}

/** Returns null when called outside StudioProvider — safe for components rendered on public pages. */
export function useStudioOptional(): StudioContextValue | null {
  return useContext(StudioContext);
}
