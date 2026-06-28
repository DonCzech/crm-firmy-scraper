"use client";

import { createContext, useContext } from "react";

/** Holds the current section's content object so GenericEditableImage can auto-read focus. */
const SectionContentContext = createContext<Record<string, unknown> | null>(null);

export function SectionContentProvider({
  content,
  children,
}: {
  content: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <SectionContentContext.Provider value={content}>
      {children}
    </SectionContentContext.Provider>
  );
}

export function useSectionContent(): Record<string, unknown> | null {
  return useContext(SectionContentContext);
}
