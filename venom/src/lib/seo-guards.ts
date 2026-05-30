export function assertHeadingHierarchy(sections: Array<{ section_type: string }>): void {
  if (process.env.NODE_ENV !== "development") return;
  const heroCount = sections.filter((s) => s.section_type === "hero").length;
  if (heroCount > 1) {
    console.warn(`[SEO] Více než jedna hero sekce (${heroCount}) — bude násobný <h1>.`);
  }
}
