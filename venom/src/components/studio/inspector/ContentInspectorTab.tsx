"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight, Trash2, ArrowUp, ArrowDown, RotateCcw, Copy } from "@/components/studio/icons";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";

type SectionWithMeta = Section & {
  _modifiedPaths?: string[];
  _resolvedSource?: "legacy" | "template";
  content_source?: string | null;
};

const SCALAR_LABELS: Record<string, string> = {
  title: "Nadpis",
  subtitle: "Podnadpis",
  tagline: "Tagline",
  description: "Popis",
  body: "Text",
  text: "Text",
  label: "Popisek",
  href: "Odkaz",
  ctaLabel: "Tlačítko – text",
  ctaText: "CTA – text",
  ctaHref: "CTA – odkaz",
  ctaSecondaryText: "CTA 2 – text",
  ctaSecondaryHref: "CTA 2 – odkaz",
  buttonLabel: "Tlačítko – text",
  buttonHref: "Tlačítko – odkaz",
  image: "Obrázek URL",
  imageUrl: "Obrázek URL",
  backgroundImage: "Pozadí URL",
  agentImage: "Foto makléře URL",
  agentName: "Jméno makléře",
  titleAccent: "Nadpis – akcent",
  siteName: "Název webu",
  logoUrl: "Logo URL",
  phone: "Telefon",
  email: "E-mail",
  address: "Adresa",
  ico: "IČO",
  hours: "Otevírací doba",
  facebookUrl: "Facebook URL",
  instagramUrl: "Instagram URL",
  linkedinUrl: "LinkedIn URL",
};

// Group labels for well-known nested container keys (megamenu apod.)
const GROUP_LABELS: Record<string, string> = {
  categories: "Kategorie",
  children: "Podkategorie",
  subchildren: "Pod-podkategorie",
  items: "Položky",
  links: "Odkazy",
  slides: "Slidy",
  bottomBanners: "Spodní bannery",
  promos: "Promo bloky",
  tips: "Tipy",
  deals: "Nabídky",
  quickLinks: "Rychlé odkazy",
  groups: "Skupiny",
  tiles: "Dlaždice",
  aside: "Boční panel",
  mega: "Mega menu",
  mainNav: "Hlavní navigace",
  catalog: "Katalog",
  megaAside: "Mega menu – boční panel",
  columns: "Sloupce",
  socials: "Sociální sítě",
  side: "Boční panel",
  stats: "Statistiky",
  badges: "Odznaky",
  contact: "Kontakt",
  footer: "Patička",
};

// Fields that are internal/structural and should not be shown in the inspector
const HIDDEN_KEYS = new Set(["id", "logoUrl", "siteMode"]);
const MAX_DEPTH = 7;

const LABEL_CANDIDATES = ["name", "title", "question", "label", "text", "author", "heading"] as const;

function itemDisplayLabel(item: unknown, index: number): string {
  if (item && typeof item === "object" && !Array.isArray(item)) {
    const rec = item as Record<string, unknown>;
    for (const k of LABEL_CANDIDATES) {
      if (typeof rec[k] === "string" && (rec[k] as string).trim()) return rec[k] as string;
    }
  }
  if (typeof item === "string" && item.trim()) return item;
  return `Položka ${index + 1}`;
}

function fieldType(key: string, value: unknown): "text" | "textarea" | "url" | "number" {
  if (typeof value === "number") return "number";
  const k = key.toLowerCase();
  if (k.includes("href") || k.includes("url") || k.includes("link")) return "url";
  if (["description", "text", "body", "bio", "answer", "quote"].includes(key)) return "textarea";
  if (typeof value === "string" && value.length > 80) return "textarea";
  return "text";
}

/** Deep clone with all strings emptied — used as a blank template for new items. */
function blankClone(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
  if (Array.isArray(value)) return value.length ? [blankClone(value[0])] : [];
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, blankClone(v)]));
  }
  return value;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Immutable set of a nested value along path (keys + indexes). */
function setAtPath(root: unknown, path: Array<string | number>, value: unknown): unknown {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head] = setAtPath(arr[head], rest, value);
    return arr;
  }
  const obj = root && typeof root === "object" && !Array.isArray(root) ? { ...(root as Record<string, unknown>) } : {};
  obj[head] = setAtPath(obj[head], rest, value);
  return obj;
}

export function ContentInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const sec = section as SectionWithMeta;
  const content = (section.settings?.content ?? {}) as Record<string, unknown>;
  const modifiedPaths = new Set(sec._modifiedPaths ?? []);
  const isV2 = sec.content_source === "v2";
  const hasOverrides = modifiedPaths.size > 0;

  // Gallery images have a dedicated panel elsewhere.
  const skipKeys = new Set(section.section_type === "gallery" ? ["images"] : []);
  const entries = Object.entries(content).filter(
    ([k]) => !k.startsWith("__") && !HIDDEN_KEYS.has(k) && !skipKeys.has(k)
  );
  const scalarEntries = entries.filter(([, v]) => typeof v === "string" || typeof v === "number");
  const boolEntries = entries.filter(([, v]) => typeof v === "boolean");
  const complexEntries = entries.filter(([, v]) => v !== null && typeof v === "object");

  function commitContent(next: Record<string, unknown>) {
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), content: next },
    });
  }
  function updatePath(path: Array<string | number>, value: unknown) {
    commitContent(setAtPath(content, path, value) as Record<string, unknown>);
  }

  async function resetSection() {
    if (!isV2) return;
    if (!confirm("Vrátit celou sekci na výchozí stav šablony? Tato akce zruší vaše úpravy v této sekci.")) return;
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/sections/${section.id}/reset-overrides`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      window.location.reload();
    } catch (err) {
      alert("Reset selhal: " + (err instanceof Error ? err.message : "unknown"));
    }
  }

  return (
    <div className="space-y-4 p-3">
      {isV2 && hasOverrides && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--vs-accent-ring)] bg-[var(--vs-accent-bg)] px-2.5 py-1.5">
          <span className="text-[10.5px] text-[var(--vs-accent-hi)]">
            {modifiedPaths.size} {modifiedPaths.size === 1 ? "úprava" : modifiedPaths.size < 5 ? "úpravy" : "úprav"} vs šablona
          </span>
          <button
            type="button"
            onClick={resetSection}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-[var(--vs-accent-hi)] hover:bg-[var(--vs-accent-bg)]"
            title="Vrátit sekci na výchozí stav šablony"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
            Reset
          </button>
        </div>
      )}

      {scalarEntries.length === 0 && boolEntries.length === 0 && complexEntries.length === 0 && (
        <p className="px-1 text-[11px] text-[var(--vs-text-muted)]">
          Tento typ sekce upravuj klikáním přímo v náhledu.
        </p>
      )}

      {scalarEntries.map(([key, value]) => (
        <Field
          key={key}
          label={SCALAR_LABELS[key] ?? key}
          value={String(value ?? "")}
          multiline={fieldType(key, value) === "textarea"}
          onChange={(v) => updatePath([key], typeof value === "number" ? Number(v) || 0 : v)}
          isModified={modifiedPaths.has(key)}
        />
      ))}

      {boolEntries.map(([key, value]) => (
        <label key={key} className="flex items-center gap-2 px-1 text-xs text-[var(--vs-text)]">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => updatePath([key], e.target.checked)}
            className="h-3.5 w-3.5 rounded accent-[var(--vs-accent)]"
          />
          {SCALAR_LABELS[key] ?? key}
        </label>
      ))}

      {complexEntries.map(([key, value]) => (
        <NestedValue
          key={key}
          label={GROUP_LABELS[key] ?? SCALAR_LABELS[key] ?? key}
          value={value}
          path={[key]}
          depth={0}
          onUpdate={updatePath}
        />
      ))}
    </div>
  );
}

/** Recursive editor for arrays and objects at any depth. */
function NestedValue({
  label, value, path, depth, onUpdate,
}: {
  label: string;
  value: unknown;
  path: Array<string | number>;
  depth: number;
  onUpdate: (path: Array<string | number>, value: unknown) => void;
}) {
  if (depth > MAX_DEPTH) return null;
  if (Array.isArray(value)) {
    return <ArrayEditor label={label} items={value} path={path} depth={depth} onUpdate={onUpdate} />;
  }
  if (value !== null && typeof value === "object") {
    return <ObjectEditor label={label} obj={value as Record<string, unknown>} path={path} depth={depth} onUpdate={onUpdate} />;
  }
  return null;
}

function ObjectEditor({
  label, obj, path, depth, onUpdate,
}: {
  label: string;
  obj: Record<string, unknown>;
  path: Array<string | number>;
  depth: number;
  onUpdate: (path: Array<string | number>, value: unknown) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const entries = Object.entries(obj).filter(([k]) => !k.startsWith("__") && !HIDDEN_KEYS.has(k));
  if (!entries.length) return null;
  return (
    <div className="overflow-hidden rounded-md border border-[var(--vs-border)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 bg-[var(--vs-bg-soft)] px-2 py-1.5 text-left text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface)]"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} /> : <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />}
        <span className="flex-1 truncate">{label}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-[var(--vs-border)] p-2">
          {entries.map(([k, v]) => {
            if (typeof v === "string" || typeof v === "number") {
              return (
                <Field
                  key={k}
                  label={SCALAR_LABELS[k] ?? k}
                  value={String(v ?? "")}
                  multiline={fieldType(k, v) === "textarea"}
                  onChange={(nv) => onUpdate([...path, k], typeof v === "number" ? Number(nv) || 0 : nv)}
                />
              );
            }
            if (typeof v === "boolean") {
              return (
                <label key={k} className="flex items-center gap-2 px-1 text-xs text-[var(--vs-text)]">
                  <input type="checkbox" checked={v} onChange={(e) => onUpdate([...path, k], e.target.checked)}
                    className="h-3.5 w-3.5 rounded accent-[var(--vs-accent)]" />
                  {SCALAR_LABELS[k] ?? k}
                </label>
              );
            }
            return (
              <NestedValue
                key={k}
                label={GROUP_LABELS[k] ?? SCALAR_LABELS[k] ?? k}
                value={v}
                path={[...path, k]}
                depth={depth + 1}
                onUpdate={onUpdate}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ArrayEditor({
  label, items, path, depth, onUpdate,
}: {
  label: string;
  items: unknown[];
  path: Array<string | number>;
  depth: number;
  onUpdate: (path: Array<string | number>, value: unknown) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const commit = (next: unknown[]) => onUpdate(path, next);

  function addItem() {
    const template = items.length
      ? blankClone(items[items.length - 1])
      : { title: "" };
    commit([...items, template]);
    setExpanded(items.length);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between px-0.5">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">{label}</span>
        <span className="text-[10.5px] text-[var(--vs-text-dim)]">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const open = expanded === i;
          const isScalarItem = typeof item === "string" || typeof item === "number";
          return (
            <div key={i} className="overflow-hidden rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)]">
              {isScalarItem ? (
                <div className="flex items-center gap-1 p-1.5">
                  <div className="flex-1">
                    <Field
                      label={`#${i + 1}`}
                      value={String(item ?? "")}
                      onChange={(v) => commit(items.map((it, idx) => (idx === i ? (typeof item === "number" ? Number(v) || 0 : v) : it)))}
                    />
                  </div>
                  <ItemOps
                    index={i}
                    count={items.length}
                    onMove={(dir) => {
                      const next = [...items];
                      [next[i], next[i + dir]] = [next[i + dir], next[i]];
                      commit(next);
                    }}
                    onDuplicate={() => commit([...items.slice(0, i + 1), deepClone(item), ...items.slice(i + 1)])}
                    onDelete={() => commit(items.filter((_, idx) => idx !== i))}
                  />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : i)}
                    className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs text-[var(--vs-text)] hover:bg-[var(--vs-surface)]"
                  >
                    {open ? <ChevronDown className="h-3.5 w-3.5 text-[var(--vs-text-muted)]" strokeWidth={1.75} /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--vs-text-muted)]" strokeWidth={1.75} />}
                    <span className="flex-1 truncate">{itemDisplayLabel(item, i)}</span>
                  </button>
                  {open && (
                    <div className="space-y-2 border-t border-[var(--vs-border)] p-2">
                      {Object.entries(item as Record<string, unknown>)
                        .filter(([k]) => !k.startsWith("__") && !HIDDEN_KEYS.has(k))
                        .map(([k, v]) => {
                          if (typeof v === "string" || typeof v === "number") {
                            return (
                              <Field
                                key={k}
                                label={SCALAR_LABELS[k] ?? k}
                                value={String(v ?? "")}
                                multiline={fieldType(k, v) === "textarea"}
                                onChange={(nv) => onUpdate([...path, i, k], typeof v === "number" ? Number(nv) || 0 : nv)}
                              />
                            );
                          }
                          if (typeof v === "boolean") {
                            return (
                              <label key={k} className="flex items-center gap-2 px-1 text-xs text-[var(--vs-text)]">
                                <input type="checkbox" checked={v} onChange={(e) => onUpdate([...path, i, k], e.target.checked)}
                                  className="h-3.5 w-3.5 rounded accent-[var(--vs-accent)]" />
                                {SCALAR_LABELS[k] ?? k}
                              </label>
                            );
                          }
                          return (
                            <NestedValue
                              key={k}
                              label={GROUP_LABELS[k] ?? SCALAR_LABELS[k] ?? k}
                              value={v}
                              path={[...path, i, k]}
                              depth={depth + 1}
                              onUpdate={onUpdate}
                            />
                          );
                        })}
                      <div className="flex items-center justify-end gap-1 border-t border-[var(--vs-border)] pt-2">
                        <ItemOps
                          index={i}
                          count={items.length}
                          onMove={(dir) => {
                            const next = [...items];
                            [next[i], next[i + dir]] = [next[i + dir], next[i]];
                            commit(next);
                            setExpanded(i + dir);
                          }}
                          onDuplicate={() => {
                            commit([...items.slice(0, i + 1), deepClone(item), ...items.slice(i + 1)]);
                            setExpanded(i + 1);
                          }}
                          onDelete={() => {
                            commit(items.filter((_, idx) => idx !== i));
                            setExpanded(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--vs-border-strong)] py-2 text-xs text-[var(--vs-text-muted)] hover:border-[var(--vs-accent-ring)] hover:text-[var(--vs-text)]"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Přidat položku
      </button>
    </div>
  );
}

function ItemOps({
  index, count, onMove, onDuplicate, onDelete,
}: {
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <ItemBtn label="Nahoru" disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
      </ItemBtn>
      <ItemBtn label="Dolů" disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
      </ItemBtn>
      <ItemBtn label="Duplikovat" onClick={onDuplicate}>
        <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
      </ItemBtn>
      <ItemBtn label="Smazat" danger onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      </ItemBtn>
    </>
  );
}

function Field({
  label, value, onChange, multiline, isModified,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  isModified?: boolean;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-[var(--vs-text-muted)]">
        {label}
        {isModified && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--vs-accent)]"
            title="Změněno oproti výchozí šabloně"
          />
        )}
      </span>
      {multiline ? (
        <textarea
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => local !== value && onChange(local)}
          rows={3}
          className="w-full resize-none rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 py-2 text-xs text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none transition-colors focus:border-[var(--vs-accent)]"
        />
      ) : (
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => local !== value && onChange(local)}
          className="h-8 w-full rounded-md border border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2.5 text-xs text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none transition-colors focus:border-[var(--vs-accent)]"
        />
      )}
    </label>
  );
}

function ItemBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-6 w-6 items-center justify-center rounded text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-3)] ${danger ? "hover:text-[var(--vs-danger)]" : "hover:text-[var(--vs-text)]"} disabled:opacity-30 disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}
