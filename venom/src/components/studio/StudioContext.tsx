"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type StudioBreakpoint = "desktop" | "tablet" | "mobile";
export type StudioLeftPanel = "layers" | "add" | "pages" | "assets" | "settings" | null;

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

export interface StudioContextValue {
  selectedSectionId: number | null;
  selectedField: string | null;
  setSelection: (sectionId: number | null, field?: string | null) => void;
  breakpoint: StudioBreakpoint;
  setBreakpoint: (b: StudioBreakpoint) => void;
  leftPanel: StudioLeftPanel;
  setLeftPanel: (p: StudioLeftPanel) => void;
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
  const [leftPanel, setLeftPanel] = useState<StudioLeftPanel>("layers");
  const [rightPanel, setRightPanel] = useState<boolean>(true);
  const [hoverSectionId, setHoverSectionId] = useState<number | null>(null);
  const [cloneScrollTarget, setCloneScrollTarget] = useState<string | null>(null);
  const [cloneSelected, setCloneSelected] = useState<CloneSelection | null>(null);
  const [cloneCommand, setCloneCommand] = useState<((cmd: CloneCommand) => void) | null>(null);

  const value = useMemo<StudioContextValue>(() => ({
    selectedSectionId,
    selectedField,
    setSelection: (sectionId, field = null) => {
      setSelectedSectionId(sectionId);
      setSelectedField(field);
    },
    breakpoint,
    setBreakpoint,
    leftPanel,
    setLeftPanel,
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
  }), [selectedSectionId, selectedField, breakpoint, leftPanel, rightPanel, hoverSectionId, cloneScrollTarget, cloneSelected, cloneCommand]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used inside StudioProvider");
  return ctx;
}
