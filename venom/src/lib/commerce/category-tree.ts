/**
 * Webero Commerce — čistá logika stromu kategorií (bez DB).
 * Sdílí ji reorder API a testy; validace probíhá PŘED zápisem do DB.
 */

export interface CategoryTreeNode {
  id: number;
  parent_id: number | null;
}

/**
 * Sestaví finální parent mapu: existující strom + aplikované změny.
 */
export function applyTreeUpdates(
  existing: CategoryTreeNode[],
  updates: CategoryTreeNode[]
): Map<number, number | null> {
  const finalParent = new Map<number, number | null>(existing.map((c) => [c.id, c.parent_id]));
  for (const node of updates) finalParent.set(node.id, node.parent_id);
  return finalParent;
}

/**
 * True, pokud parent mapa obsahuje cyklus (self-loop nebo delší).
 */
export function hasCycle(finalParent: Map<number, number | null>): boolean {
  for (const start of finalParent.keys()) {
    const seen = new Set<number>();
    let cur: number | null | undefined = start;
    while (cur != null) {
      if (seen.has(cur)) return true;
      seen.add(cur);
      cur = finalParent.get(cur);
    }
  }
  return false;
}

/**
 * Ověří, že všechna id i parent_id v updates patří do množiny existujících id.
 * Vrací chybovou hlášku, nebo null když je vše v pořádku.
 */
export function validateTreeUpdates(
  existingIds: Set<number>,
  updates: CategoryTreeNode[]
): string | null {
  for (const node of updates) {
    if (!Number.isInteger(node.id) || node.id <= 0) return "Neplatné ID kategorie";
    if (node.parent_id != null && (!Number.isInteger(node.parent_id) || node.parent_id <= 0)) {
      return "Neplatné ID nadřazené kategorie";
    }
    if (node.parent_id === node.id) return "Kategorie nemůže být svým vlastním rodičem";
    if (!existingIds.has(node.id)) return "Kategorie nepatří tomuto e-shopu";
    if (node.parent_id != null && !existingIds.has(node.parent_id)) {
      return "Nadřazená kategorie nepatří tomuto e-shopu";
    }
  }
  return null;
}
