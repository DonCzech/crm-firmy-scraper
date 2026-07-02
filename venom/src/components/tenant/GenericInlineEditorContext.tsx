"use client";

import { createContext, useContext } from "react";

export interface GenericHighlightChange {
  sectionId: number;
  field: string;
  snippets: string[];
}

export interface GenericTextStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right";
  letterSpacing?: string;
  lineHeight?: string;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  /** Visual position offset — stored as "Xpx", converted to transform:translate in render. */
  translateX?: string;
  translateY?: string;
}

interface GenericInlineEditorContextValue {
  isAdmin: boolean;
  isStudio?: boolean;
  highlighted: GenericHighlightChange[];
  updateField: (sectionId: number, field: string, value: unknown, options?: { recordHistory?: boolean }) => void;
  updateStyle: (sectionId: number, field: string, style: GenericTextStyle) => void;
  /** Update style on canvas only — no server save. Used for live preview in toolbar draft mode. */
  updateStyleLocal: (sectionId: number, field: string, style: GenericTextStyle) => void;
  getStyle: (sectionId: number, field: string) => GenericTextStyle;
  reorderField: (sectionId: number, field: string, newArray: unknown[]) => void;
}

const GenericInlineEditorContext = createContext<GenericInlineEditorContextValue>({
  isAdmin: false,
  highlighted: [],
  updateField: () => undefined,
  updateStyle: () => undefined,
  updateStyleLocal: () => undefined,
  getStyle: () => ({}),
  reorderField: () => undefined,
});

export function GenericInlineEditorProvider({
  value,
  children,
}: {
  value: GenericInlineEditorContextValue;
  children: React.ReactNode;
}) {
  return (
    <GenericInlineEditorContext.Provider value={value}>
      {children}
    </GenericInlineEditorContext.Provider>
  );
}

export function useGenericInlineEditor() {
  return useContext(GenericInlineEditorContext);
}
