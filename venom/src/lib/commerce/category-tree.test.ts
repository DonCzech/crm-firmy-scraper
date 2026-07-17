import { describe, it, expect } from "vitest";
import { applyTreeUpdates, hasCycle, validateTreeUpdates } from "./category-tree";

const tree4levels = [
  { id: 1, parent_id: null },
  { id: 2, parent_id: 1 },
  { id: 3, parent_id: 2 },
  { id: 4, parent_id: 3 },
  { id: 5, parent_id: null },
];

describe("hasCycle", () => {
  it("akceptuje validní strom o 4 úrovních", () => {
    expect(hasCycle(applyTreeUpdates(tree4levels, []))).toBe(false);
  });

  it("odhalí self-loop", () => {
    expect(hasCycle(applyTreeUpdates(tree4levels, [{ id: 5, parent_id: 5 }]))).toBe(true);
  });

  it("odhalí dvoučlenný cyklus", () => {
    expect(hasCycle(applyTreeUpdates(tree4levels, [{ id: 1, parent_id: 2 }]))).toBe(true);
  });

  it("odhalí cyklus přes descendanta o více úrovní (root pod pravnuka)", () => {
    expect(hasCycle(applyTreeUpdates(tree4levels, [{ id: 1, parent_id: 4 }]))).toBe(true);
  });

  it("dovolí přesun podstromu pod jiný kořen", () => {
    expect(hasCycle(applyTreeUpdates(tree4levels, [{ id: 2, parent_id: 5 }]))).toBe(false);
  });
});

describe("validateTreeUpdates", () => {
  const ids = new Set(tree4levels.map((n) => n.id));

  it("projde pro validní update", () => {
    expect(validateTreeUpdates(ids, [{ id: 2, parent_id: 5 }])).toBeNull();
  });

  it("odmítne cizí (cross-tenant) id", () => {
    expect(validateTreeUpdates(ids, [{ id: 999, parent_id: null }])).toMatch(/nepatří/);
  });

  it("odmítne cizí parent_id", () => {
    expect(validateTreeUpdates(ids, [{ id: 2, parent_id: 999 }])).toMatch(/nepatří/);
  });

  it("odmítne self-parent", () => {
    expect(validateTreeUpdates(ids, [{ id: 2, parent_id: 2 }])).toMatch(/vlastním rodičem/);
  });

  it("odmítne nečíselné id", () => {
    expect(validateTreeUpdates(ids, [{ id: 1.5, parent_id: null }])).toMatch(/Neplatné/);
    expect(validateTreeUpdates(ids, [{ id: 2, parent_id: -1 }])).toMatch(/Neplatné/);
  });
});
