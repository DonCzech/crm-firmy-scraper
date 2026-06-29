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
  toggleSidebar: () => void;
  /** Global overlay states */
  shortcutsOpen: boolean;
  setShortcutsOpen: (v: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (v: boolean) => void;
  helpPanelOpen: boolean;
  setHelpPanelOpen: (v: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (v: boolean) => void;
}

export type CloneCommand =
  | { type: "setStyle"; editId: string; patch: Partial<CloneSelection["style"]> }
  | { type: "setText"; editId: string; text: string }
  | { type: "setSrc"; editId: string; src: string }
  | { type: "selectBySelector"; selector: string };

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [breakpoint, setBreakpoint] = useState<StudioBreakpoint>("desktop");

  // Initialise from sessionStorage so panel state survives full-page navigations.
  const persisted = readPersistedState();
  const [leftPanel, setLeftPanel] = useState<StudioLeftPanel>(persisted?.leftPanel ?? "layers");
  // History stack of previously-active panels. `pushPanel(p)` switches to `p`
  // while remembering the current one. `goBack()` pops one level. Limited to
  // a depth of 4 so we don't grow forever if some flow keeps pushing.
  const [panelHistory, setPanelHistory] = useState<StudioLeftPanel[]>(persisted?.panelHistory ?? []);
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
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

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
      setLeftPanel(p);
    },
    pushPanel: (p: StudioLeftPanel) => {
      setPanelHistory((prev) => [...prev.slice(-3), leftPanel]);
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
    setSettingsView,
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
    toggleSidebar: () => setSidebarOpen(o => !o),
    shortcutsOpen,
    setShortcutsOpen,
    notificationsOpen,
    setNotificationsOpen,
    helpPanelOpen,
    setHelpPanelOpen,
    commandPaletteOpen,
    setCommandPaletteOpen,
  }), [selectedSectionId, selectedField, breakpoint, leftPanel, panelHistory, rightPanel, hoverSectionId, cloneScrollTarget, cloneSelected, cloneCommand, settingsView, assetsOpen, modulesView, articleMode, currentArticleId, imagePanel, heroOverride, transientPadding, heroSlideIdx, sidebarOpen, shortcutsOpen, notificationsOpen, helpPanelOpen, commandPaletteOpen]);

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
