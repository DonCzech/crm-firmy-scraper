"use client";

import { type CSSProperties, useState } from "react";
import type { Section } from "@/lib/db";
import { SectionEditor } from "./SectionEditor";
import { SECTION_TYPE_LABELS } from "@/sections/labels";
import { buildSectionLibrary } from "@/sections/variants";

interface Props {
  sections: Section[];
  tenantSlug: string;
  onChange: (sections: Section[]) => void;
  onClose: () => void;
}

const SECTION_LABELS = SECTION_TYPE_LABELS;

// Section library — generated from variants registry
const SECTION_LIBRARY = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

export function PageBuilder({ sections, tenantSlug, onChange, onClose }: Props) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const sorted = [...sections].sort((a, b) => a.order_index - b.order_index);

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...sorted];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((s, i) => ({ ...s, order_index: i })));
  }

  function moveDown(index: number) {
    if (index === sorted.length - 1) return;
    const next = [...sorted];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next.map((s, i) => ({ ...s, order_index: i })));
  }

  function toggleVisible(sectionId: number) {
    onChange(sections.map((s) => (s.id === sectionId ? { ...s, is_visible: !s.is_visible } : s)));
  }

  function duplicate(section: Section) {
    const newId = Date.now();
    const maxOrder = Math.max(...sections.map((s) => s.order_index));
    if (sections.map((s) => s.id).includes(newId)) return;
    onChange([...sections, { ...section, id: newId, order_index: maxOrder + 1 }]);
  }

  function remove(sectionId: number) {
    const updated = sections
      .filter((s) => s.id !== sectionId)
      .sort((a, b) => a.order_index - b.order_index)
      .map((s, i) => ({ ...s, order_index: i }));
    onChange(updated);
  }

  function addSection(type: string, variant: string) {
    const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order_index)) : -1;
    // Insert before footer if it exists
    const footerIdx = sorted.findIndex((s) => s.section_type === "footer");
    const insertOrder = footerIdx >= 0 ? footerIdx : maxOrder + 1;

    const newSection: Section = {
      id: Date.now(),
      tenant_id: 0,
      page_id: 0,
      section_type: type,
      section_variant: variant,
      order_index: insertOrder,
      is_visible: true,
      settings: { content: {} },
    };

    // Shift footer and sections after insert point
    const updated = sections.map((s) =>
      s.order_index >= insertOrder ? { ...s, order_index: s.order_index + 1 } : s
    );
    onChange([...updated, newSection].sort((a, b) => a.order_index - b.order_index).map((s, i) => ({ ...s, order_index: i })));
    setShowLibrary(false);
  }

  function handleSectionSaved(updated: Section) {
    onChange(sections.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(null);
  }

  // ── Section editor panel ────────────────────────────────────────────────────
  const panelReset: CSSProperties = { fontFamily: "system-ui, -apple-system, sans-serif", textTransform: "none", letterSpacing: "normal", lineHeight: "normal" };
  const elReset: CSSProperties = { textTransform: "none", letterSpacing: "normal" };

  if (editingSection) {
    return (
      <div className="fixed top-10 right-0 bottom-0 w-[360px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-[99998] overflow-y-auto" style={panelReset}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
          <button onClick={() => setEditingSection(null)} className="text-gray-500 hover:text-gray-700 text-sm">
            ← Zpět
          </button>
          <h2 className="font-bold text-gray-900 text-sm" style={elReset}>{SECTION_LABELS[editingSection.section_type] ?? editingSection.section_type}</h2>
        </div>
        <SectionEditor
          section={editingSection}
          tenantSlug={tenantSlug}
          onSaved={handleSectionSaved}
        />
      </div>
    );
  }

  // ── Section library panel ───────────────────────────────────────────────────
  if (showLibrary) {
    return (
      <div className="fixed top-10 right-0 bottom-0 w-[360px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-[99998]" style={panelReset}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
          <button onClick={() => setShowLibrary(false)} className="text-gray-500 hover:text-gray-700 text-sm">
            ← Zpět
          </button>
          <h2 className="font-bold text-gray-900 text-sm" style={elReset}>Přidat sekci</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {SECTION_LIBRARY.map((item) => (
            <button
              key={`${item.type}-${item.variant}`}
              onClick={() => addSection(item.type, item.variant)}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Main page builder panel ─────────────────────────────────────────────────
  return (
    <div className="fixed top-10 right-0 bottom-0 w-[360px] bg-white shadow-2xl border-l border-gray-200 flex flex-col z-[99998]" style={panelReset}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="font-bold text-gray-900" style={elReset}>Page Builder</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl leading-none">×</button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-xs text-gray-500 mb-3">Přesouvejte, editujte a skrývejte sekce.</p>
        <div className="space-y-2">
          {sorted.map((section, i) => {
            const label = SECTION_LABELS[section.section_type] ?? section.section_type;
            const isNavFooter = section.section_type === "navbar" || section.section_type === "footer";
            return (
              <div
                key={section.id}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  section.is_visible ? "border-gray-200 bg-white" : "border-dashed border-gray-300 bg-gray-50 opacity-60"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(i)} disabled={i === 0 || isNavFooter}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs" title="Nahoru">▲</button>
                  <button onClick={() => moveDown(i)} disabled={i === sorted.length - 1 || isNavFooter}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-20 text-xs" title="Dolů">▼</button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{section.section_variant}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingSection(section)}
                    className="p-1 rounded hover:bg-indigo-50 text-sm text-indigo-500" title="Upravit obsah">✏️</button>
                  <button onClick={() => toggleVisible(section.id)}
                    className="p-1 rounded hover:bg-gray-100 text-sm" title={section.is_visible ? "Skrýt" : "Zobrazit"}>
                    {section.is_visible ? "👁" : "🙈"}
                  </button>
                  {!isNavFooter && (
                    <button onClick={() => duplicate(section)}
                      className="p-1 rounded hover:bg-gray-100 text-sm" title="Duplikovat">📋</button>
                  )}
                  {!isNavFooter && (
                    <button onClick={() => remove(section.id)}
                      className="p-1 rounded hover:bg-red-50 text-sm text-red-400 hover:text-red-600" title="Smazat">🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button
          onClick={() => setShowLibrary(true)}
          className="w-full py-2 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold hover:bg-indigo-50 transition-colors"
        >
          + Přidat sekci
        </button>
        <p className="text-xs text-gray-400 text-center">Navbar a patička jsou chráněné.</p>
      </div>
    </div>
  );
}
