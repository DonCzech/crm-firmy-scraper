"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X, ArrowLeft, Plus, Search, Eye, EyeOff, Copy, Trash2,
  ArrowUp, ArrowDown, Pencil, Layers, Sparkles, Lock,
} from "lucide-react";
import type { Section } from "@/lib/db";
import { SectionEditor } from "./SectionEditor";
import { SECTION_TYPE_LABELS } from "@/sections/labels";
import { buildSectionLibrary } from "@/sections/variants";
import "../studio/design-tokens.css";

interface Props {
  sections: Section[];
  tenantSlug: string;
  onChange: (sections: Section[]) => void;
  onClose: () => void;
}

const SECTION_LABELS = SECTION_TYPE_LABELS;
const SECTION_LIBRARY = buildSectionLibrary().filter(
  (e) => e.type !== "navbar" && e.type !== "footer" && e.type !== "full-page-clone" && e.type !== "astera-home"
);

const TYPE_LABEL: Record<string, string> = {
  hero: "Hero", services: "Služby", pricing: "Ceník", testimonials: "Recenze",
  gallery: "Galerie", contact: "Kontakt", "opening-hours": "Otevírací doba",
  faq: "FAQ", cta: "CTA", team: "Tým", about: "O nás", "blog-preview": "Blog",
  map: "Mapa", promo: "Promo", stats: "Statistiky", products: "Produkty",
};

const TYPE_ORDER = [
  "hero", "about", "services", "pricing", "gallery", "testimonials",
  "team", "stats", "cta", "promo", "faq", "blog-preview",
  "contact", "opening-hours", "map", "products",
];

export function PageBuilder({ sections, tenantSlug, onChange, onClose }: Props) {
  const [editing, setEditing] = useState<Section | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState("");
  const [libraryType, setLibraryType] = useState<string | null>(null);

  const sorted = useMemo(() => [...sections].sort((a, b) => a.order_index - b.order_index), [sections]);
  const navbar = sorted.filter(s => s.section_type === "navbar");
  const footer = sorted.filter(s => s.section_type === "footer");
  const main = sorted.filter(s => s.section_type !== "navbar" && s.section_type !== "footer");

  function moveUp(id: number) {
    const idx = sorted.findIndex(s => s.id === id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    if (prev.section_type === "navbar") return;
    const next = [...sorted];
    [next[idx - 1].order_index, next[idx].order_index] = [next[idx].order_index, next[idx - 1].order_index];
    onChange(next);
  }
  function moveDown(id: number) {
    const idx = sorted.findIndex(s => s.id === id);
    if (idx >= sorted.length - 1) return;
    const nxt = sorted[idx + 1];
    if (nxt.section_type === "footer") return;
    const next = [...sorted];
    [next[idx].order_index, next[idx + 1].order_index] = [next[idx + 1].order_index, next[idx].order_index];
    onChange(next);
  }
  function toggleVisible(id: number) {
    onChange(sections.map(s => s.id === id ? { ...s, is_visible: !s.is_visible } : s));
  }
  function duplicate(s: Section) {
    const maxOrder = Math.max(...sections.map(x => x.order_index));
    const newId = -Date.now();
    onChange([...sections, { ...s, id: newId, order_index: maxOrder + 1 }]);
  }
  function remove(id: number) {
    if (!window.confirm("Smazat tuto sekci? Tuto akci nelze vrátit zpět z UI.")) return;
    const updated = sections.filter(s => s.id !== id).sort((a, b) => a.order_index - b.order_index).map((s, i) => ({ ...s, order_index: i }));
    onChange(updated);
  }
  function addSection(type: string, variant: string) {
    const footerIdx = sorted.findIndex(s => s.section_type === "footer");
    const insertOrder = footerIdx >= 0 ? sorted[footerIdx].order_index : sorted.length;
    const newSection: Section = {
      id: -Date.now(),
      tenant_id: 0,
      page_id: 0,
      section_type: type,
      section_variant: variant,
      order_index: insertOrder,
      is_visible: true,
      settings: { content: {} },
    };
    const shifted = sections.map(s => s.order_index >= insertOrder ? { ...s, order_index: s.order_index + 1 } : s);
    onChange([...shifted, newSection].sort((a, b) => a.order_index - b.order_index).map((s, i) => ({ ...s, order_index: i })));
    setShowLibrary(false);
  }
  function handleSaved(updated: Section) {
    onChange(sections.map(s => s.id === updated.id ? updated : s));
    setEditing(null);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") {
      if (editing) setEditing(null);
      else if (showLibrary) setShowLibrary(false);
      else onClose();
    }}
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, showLibrary, onClose]);

  return (
    <div data-studio className="pointer-events-none fixed inset-0 z-[99998] flex" style={{ fontFamily: "var(--vs-font-sans)" }}>
      {/* Docked side panel — no scrim so the canvas stays visible while you
          reorder sections. Click outside the panel does not auto-close
          (intentional: prevents accidental dismiss while interacting with
          the live page). Use the X button or Esc to close. */}
      <aside
        role="dialog"
        aria-label="Page Builder"
        className="pointer-events-auto ml-auto flex h-full flex-col"
        style={{
          width: "min(420px, 92vw)",
          background: "var(--vs-bg)",
          boxShadow: "var(--vs-shadow-xl), -1px 0 0 0 var(--vs-border-strong)",
          animation: "vs-pb-in 320ms var(--vs-ease-out)",
        }}
      >
        <style>{`@keyframes vs-pb-in {
          from { transform: translateX(24px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }`}</style>

        {/* Header */}
        <header
          className="flex h-12 shrink-0 items-center justify-between border-b px-3"
          style={{ background: "var(--vs-bg-soft)", borderColor: "var(--vs-border)" }}
        >
          <div className="flex items-center gap-2">
            {(editing || showLibrary) && (
              <button
                type="button"
                onClick={() => editing ? setEditing(null) : setShowLibrary(false)}
                aria-label="Zpět"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
            <div className="vs-grad-accent flex h-7 w-7 items-center justify-center rounded-md shadow-[0_4px_10px_rgba(99,102,241,0.30)]">
              <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <div className="text-[12.5px] font-semibold tracking-tight text-[var(--vs-text)]">
                {editing ? (SECTION_LABELS[editing.section_type] ?? editing.section_type) : showLibrary ? "Přidat sekci" : "Page Builder"}
              </div>
              <div className="text-[9.5px] uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
                {editing ? editing.section_variant : showLibrary ? `${SECTION_LIBRARY.length} variant` : "Sekce této stránky"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít (Esc)"
            title="Zavřít (Esc)"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </header>

        {editing ? (
          <div className="flex-1 overflow-y-auto vs-scroll bg-[var(--vs-bg)]">
            <SectionEditor section={editing} tenantSlug={tenantSlug} onSaved={handleSaved} />
          </div>
        ) : showLibrary ? (
          <LibraryView
            filter={libraryFilter}
            onFilter={setLibraryFilter}
            activeType={libraryType}
            onActiveType={setLibraryType}
            onAdd={addSection}
          />
        ) : (
          <PageView
            navbar={navbar}
            main={main}
            footer={footer}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onToggleVisible={toggleVisible}
            onDuplicate={duplicate}
            onEdit={setEditing}
            onRemove={remove}
            onOpenLibrary={() => setShowLibrary(true)}
            sorted={sorted}
          />
        )}

        {/* Footer */}
        <footer
          className="flex h-8 shrink-0 items-center justify-between border-t px-3 text-[10px] text-[var(--vs-text-dim)]"
          style={{ background: "var(--vs-bg-soft)", borderColor: "var(--vs-border)" }}
        >
          <span>Esc pro zavření</span>
          <span>Webero Page Builder</span>
        </footer>
      </aside>
    </div>
  );
}

function PageView({
  navbar, main, footer, sorted, onMoveUp, onMoveDown, onToggleVisible, onDuplicate, onEdit, onRemove, onOpenLibrary,
}: {
  navbar: Section[]; main: Section[]; footer: Section[]; sorted: Section[];
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  onToggleVisible: (id: number) => void;
  onDuplicate: (s: Section) => void;
  onEdit: (s: Section) => void;
  onRemove: (id: number) => void;
  onOpenLibrary: () => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto vs-scroll p-3 space-y-3">
        {/* Navbar singleton */}
        {navbar.length > 0 && (
          <Group title="Hlavička" icon={<Lock className="h-3 w-3" />} subtitle="Chráněná sekce">
            {navbar.map(s => (
              <RowLocked key={s.id} section={s} onToggleVisible={() => onToggleVisible(s.id)} onEdit={() => onEdit(s)} />
            ))}
          </Group>
        )}

        {/* Main reorderable */}
        <Group
          title="Obsah"
          subtitle={`${main.length} ${main.length === 1 ? "sekce" : main.length < 5 ? "sekce" : "sekcí"}`}
        >
          {main.map((s) => {
            const idx = sorted.findIndex(x => x.id === s.id);
            const prev = sorted[idx - 1];
            const next = sorted[idx + 1];
            const canUp = !!prev && prev.section_type !== "navbar";
            const canDown = !!next && next.section_type !== "footer";
            return (
              <Row
                key={s.id}
                section={s}
                canMoveUp={canUp}
                canMoveDown={canDown}
                onMoveUp={() => onMoveUp(s.id)}
                onMoveDown={() => onMoveDown(s.id)}
                onToggleVisible={() => onToggleVisible(s.id)}
                onDuplicate={() => onDuplicate(s)}
                onEdit={() => onEdit(s)}
                onRemove={() => onRemove(s.id)}
              />
            );
          })}
          {main.length === 0 && (
            <div className="rounded-md border border-dashed border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-4 py-6 text-center">
              <p className="text-[11.5px] text-[var(--vs-text-muted)]">Tato stránka zatím nemá žádný obsah.</p>
              <button
                type="button"
                onClick={onOpenLibrary}
                className="vs-grad-accent mt-3 inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                Přidat první sekci
              </button>
            </div>
          )}
        </Group>

        {/* Footer singleton */}
        {footer.length > 0 && (
          <Group title="Patička" icon={<Lock className="h-3 w-3" />} subtitle="Chráněná sekce">
            {footer.map(s => (
              <RowLocked key={s.id} section={s} onToggleVisible={() => onToggleVisible(s.id)} onEdit={() => onEdit(s)} />
            ))}
          </Group>
        )}
      </div>

      {/* Add CTA */}
      <div className="shrink-0 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] p-3">
        <button
          type="button"
          onClick={onOpenLibrary}
          className="vs-grad-accent flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[12px] font-semibold tracking-tight text-white shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_4px_14px_rgba(99,102,241,0.40)] transition-transform hover:scale-[1.02] active:translate-y-[0.5px]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Přidat sekci
        </button>
      </div>
    </>
  );
}

function Group({ title, subtitle, icon, children }: { title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-1">
        <h3 className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[var(--vs-tracking-wider)] text-[var(--vs-text-muted)]">
          {icon}
          {title}
        </h3>
        {subtitle && <span className="text-[10px] text-[var(--vs-text-dim)]">{subtitle}</span>}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({
  section, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onToggleVisible, onDuplicate, onEdit, onRemove,
}: {
  section: Section;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const label = SECTION_LABELS[section.section_type] ?? section.section_type;
  const typeLabel = TYPE_LABEL[section.section_type] ?? section.section_type;
  return (
    <div
      className={`vs-lift group flex items-center gap-2 rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] px-2 py-2 transition-colors hover:border-[var(--vs-accent-ring)] ${
        !section.is_visible ? "opacity-55" : ""
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <IconBtn label="Posunout nahoru" disabled={!canMoveUp} onClick={onMoveUp}>
          <ArrowUp className="h-3 w-3" strokeWidth={2} />
        </IconBtn>
        <IconBtn label="Posunout dolů" disabled={!canMoveDown} onClick={onMoveDown}>
          <ArrowDown className="h-3 w-3" strokeWidth={2} />
        </IconBtn>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-muted)] group-hover:bg-[var(--vs-accent-bg)] group-hover:text-[var(--vs-accent-hi)]">
        <Layers className="h-4 w-4" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12px] font-medium text-[var(--vs-text)]">{label}</span>
          <span className="shrink-0 rounded-full bg-[var(--vs-surface-2)] px-1.5 py-px text-[9px] font-medium uppercase tracking-[var(--vs-tracking-wide)] text-[var(--vs-text-muted)]">
            {typeLabel}
          </span>
          {!section.is_visible && (
            <span className="shrink-0 rounded-full bg-[var(--vs-warning-bg)] px-1.5 py-px text-[9px] font-medium uppercase tracking-[var(--vs-tracking-wide)] text-[var(--vs-warning)]">
              skrytá
            </span>
          )}
        </div>
        <div className="truncate text-[10px] text-[var(--vs-text-dim)]">{section.section_variant}</div>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <IconBtn label="Upravit obsah" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 text-[var(--vs-accent-hi)]" strokeWidth={1.75} />
        </IconBtn>
        <IconBtn label={section.is_visible ? "Skrýt" : "Zobrazit"} onClick={onToggleVisible}>
          {section.is_visible
            ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            : <EyeOff className="h-3.5 w-3.5 text-[var(--vs-warning)]" strokeWidth={1.75} />}
        </IconBtn>
        <IconBtn label="Duplikovat" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconBtn>
        <IconBtn label="Smazat" danger onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
        </IconBtn>
      </div>
    </div>
  );
}

function RowLocked({
  section, onToggleVisible, onEdit,
}: { section: Section; onToggleVisible: () => void; onEdit: () => void }) {
  const label = SECTION_LABELS[section.section_type] ?? section.section_type;
  return (
    <div className={`vs-lift group flex items-center gap-2 rounded-lg border border-[var(--vs-border)] bg-[var(--vs-surface)] px-2 py-2 ${!section.is_visible ? "opacity-55" : ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--vs-surface-2)] text-[var(--vs-text-dim)]">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate text-[12px] font-medium text-[var(--vs-text)]">{label}</div>
        <div className="truncate text-[10px] text-[var(--vs-text-dim)]">Chráněná sekce (nelze přesunout / smazat)</div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <IconBtn label="Upravit obsah" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 text-[var(--vs-accent-hi)]" strokeWidth={1.75} />
        </IconBtn>
        <IconBtn label={section.is_visible ? "Skrýt" : "Zobrazit"} onClick={onToggleVisible}>
          {section.is_visible
            ? <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
            : <EyeOff className="h-3.5 w-3.5 text-[var(--vs-warning)]" strokeWidth={1.75} />}
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children, label, disabled, danger, onClick,
}: { children: React.ReactNode; label: string; disabled?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`inline-flex h-6 w-6 items-center justify-center rounded transition-[background,color] duration-100 disabled:opacity-25 disabled:hover:bg-transparent ${
        danger
          ? "text-[var(--vs-text-muted)] hover:bg-[var(--vs-danger-bg)] hover:text-[var(--vs-danger)]"
          : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-3)] hover:text-[var(--vs-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function LibraryView({
  filter, onFilter, activeType, onActiveType, onAdd,
}: {
  filter: string;
  onFilter: (v: string) => void;
  activeType: string | null;
  onActiveType: (t: string | null) => void;
  onAdd: (type: string, variant: string) => void;
}) {
  const groupedTypes = useMemo(() => {
    const set = new Set(SECTION_LIBRARY.map(e => e.type));
    return TYPE_ORDER.filter(t => set.has(t)).concat([...set].filter(t => !TYPE_ORDER.includes(t)));
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return SECTION_LIBRARY.filter(e => {
      if (activeType && e.type !== activeType) return false;
      if (!f) return true;
      return e.label.toLowerCase().includes(f) || e.description.toLowerCase().includes(f) || e.variant.toLowerCase().includes(f);
    });
  }, [filter, activeType]);

  return (
    <>
      {/* Search */}
      <div className="shrink-0 border-b border-[var(--vs-border)] p-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--vs-text-muted)]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
            placeholder="Hledat sekci…"
            autoFocus
            className="w-full rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] py-1.5 pl-7 pr-2 text-[12px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none focus:border-[var(--vs-accent)] focus:shadow-[0_0_0_3px_var(--vs-accent-bg)]"
          />
        </div>
      </div>

      {/* Type chips */}
      <div className="shrink-0 overflow-x-auto border-b border-[var(--vs-border)] vs-scroll">
        <div className="flex gap-1 p-2">
          <Chip active={activeType === null} onClick={() => onActiveType(null)}>Vše</Chip>
          {groupedTypes.map(t => (
            <Chip key={t} active={activeType === t} onClick={() => onActiveType(t)}>
              {TYPE_LABEL[t] ?? t}
            </Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto vs-scroll p-2">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[12px] text-[var(--vs-text-muted)]">Nic nenalezeno.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(item => (
              <button
                key={`${item.type}-${item.variant}`}
                type="button"
                onClick={() => onAdd(item.type, item.variant)}
                className="vs-lift group relative flex flex-col items-start gap-1.5 overflow-hidden rounded-lg border border-[var(--vs-border-strong)] bg-[var(--vs-surface)] p-2.5 text-left transition-[border-color] duration-150 hover:border-[var(--vs-accent-ring)] hover:shadow-[var(--vs-shadow-md)]"
                title={item.description}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--vs-border-strong)] to-transparent opacity-60" />
                <div className="flex w-full items-center gap-1.5">
                  <span className="rounded-full bg-[var(--vs-surface-2)] px-1.5 py-px text-[9px] font-medium uppercase tracking-[var(--vs-tracking-wide)] text-[var(--vs-text-muted)]">
                    {TYPE_LABEL[item.type] ?? item.type}
                  </span>
                  <Plus className="ml-auto h-3 w-3 text-[var(--vs-text-dim)] opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="line-clamp-2 text-[11.5px] font-medium leading-tight text-[var(--vs-text)]">{item.label}</div>
                <div className="line-clamp-2 text-[10.5px] leading-snug text-[var(--vs-text-muted)]">{item.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-1.5 text-[10.5px] text-[var(--vs-text-dim)]">
        {filtered.length} variant{filtered.length === 1 ? "a" : filtered.length < 5 ? "y" : ""}
      </div>
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-2 py-1 text-[10.5px] font-medium tracking-tight transition-[background,color,box-shadow] duration-100 ${
        active
          ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
          : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text)]"
      }`}
    >
      {children}
    </button>
  );
}
