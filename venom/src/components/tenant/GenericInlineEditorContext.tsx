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
}

interface GenericInlineEditorContextValue {
  isAdmin: boolean;
  isStudio?: boolean;
  highlighted: GenericHighlightChange[];
  updateField: (sectionId: number, field: string, value: string | number | boolean, options?: { recordHistory?: boolean }) => void;
  updateStyle: (sectionId: number, field: string, style: GenericTextStyle) => void;
  getStyle: (sectionId: number, field: string) => GenericTextStyle;
  reorderField: (sectionId: number, field: string, newArray: unknown[]) => void;
}

const GenericInlineEditorContext = createContext<GenericInlineEditorContextValue>({
  isAdmin: false,
  highlighted: [],
  updateField: () => undefined,
  updateStyle: () => undefined,
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
