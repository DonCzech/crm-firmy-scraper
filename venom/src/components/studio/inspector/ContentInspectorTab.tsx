"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronRight, Trash2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import type { Section } from "@/lib/db";
import type { StudioState } from "../TenantStudioView";

type SectionWithMeta = Section & {
  _modifiedPaths?: string[];
  _resolvedSource?: "legacy" | "template";
  content_source?: string | null;
};

const ARRAY_KEYS: Record<string, { key: string; itemLabel: string }> = {
  services: { key: "services", itemLabel: "name" },
  pricing: { key: "services", itemLabel: "name" },
  testimonials: { key: "testimonials", itemLabel: "name" },
  gallery: { key: "images", itemLabel: "alt" },
  faq: { key: "faq", itemLabel: "question" },
  team: { key: "members", itemLabel: "name" },
};

// Variant-specific overrides — checked before section_type lookup
const ARRAY_KEYS_BY_VARIANT: Record<string, { key: string; itemLabel: string }> = {
  "reality-03-navbar":         { key: "links",       itemLabel: "label" },
  "hero-reality-03-video":     { key: "stats",        itemLabel: "number" },
  "reality-03-services-4grid": { key: "items",        itemLabel: "name" },
  "reality-03-listings":       { key: "items",        itemLabel: "title" },
  "reality-03-testimonials":   { key: "items",        itemLabel: "author" },
  "reality-03-blog":           { key: "items",        itemLabel: "title" },
  "reality-03-footer":         { key: "agents",       itemLabel: "name" },
};

const ITEM_FIELDS: Record<string, Array<{ key: string; label: string; type: "text" | "textarea" | "url" | "number" }>> = {
  services: [
    { key: "name", label: "Název", type: "text" },
    { key: "description", label: "Popis", type: "textarea" },
    { key: "price", label: "Cena", type: "text" },
    { key: "duration", label: "Doba", type: "text" },
  ],
  pricing: [
    { key: "name", label: "Název", type: "text" },
    { key: "description", label: "Popis", type: "textarea" },
    { key: "price", label: "Cena", type: "text" },
    { key: "duration", label: "Doba", type: "text" },
  ],
  testimonials: [
    { key: "name", label: "Jméno", type: "text" },
    { key: "text", label: "Text", type: "textarea" },
    { key: "rating", label: "Hodnocení", type: "number" },
  ],
  gallery: [
    { key: "url", label: "URL", type: "url" },
    { key: "alt", label: "Popis", type: "text" },
  ],
  faq: [
    { key: "question", label: "Otázka", type: "text" },
    { key: "answer", label: "Odpověď", type: "textarea" },
  ],
  team: [
    { key: "name", label: "Jméno", type: "text" },
    { key: "role", label: "Pozice", type: "text" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "image", label: "Foto URL", type: "url" },
  ],
  // reality-03 variant fields
  "reality-03-navbar": [
    { key: "label", label: "Název odkazu", type: "text" },
    { key: "href",  label: "Odkaz",        type: "url" },
  ],
  "hero-reality-03-video": [
    { key: "number", label: "Číslo",  type: "text" },
    { key: "label",  label: "Popis",  type: "text" },
  ],
  "reality-03-services-4grid": [
    { key: "name",    label: "Záložka",     type: "text" },
    { key: "title",   label: "Nadpis",      type: "text" },
    { key: "body",    label: "Text",        type: "textarea" },
    { key: "ctaText", label: "CTA – text",  type: "text" },
    { key: "ctaHref", label: "CTA – odkaz", type: "url" },
  ],
  "reality-03-listings": [
    { key: "title",    label: "Název",        type: "text" },
    { key: "location", label: "Lokalita",     type: "text" },
    { key: "price",    label: "Cena",         type: "text" },
    { key: "type",     label: "Typ (prodej/pronajem)", type: "text" },
    { key: "image",    label: "Foto URL",     type: "url" },
  ],
  "reality-03-testimonials": [
    { key: "text",   label: "Text recenze", type: "textarea" },
    { key: "author", label: "Autor",        type: "text" },
    { key: "rating", label: "Hodnocení",    type: "number" },
  ],
  "reality-03-blog": [
    { key: "title", label: "Nadpis článku", type: "text" },
    { key: "href",  label: "Odkaz",         type: "url" },
    { key: "image", label: "Foto URL",      type: "url" },
  ],
  "reality-03-footer": [
    { key: "name",  label: "Jméno",     type: "text" },
    { key: "role",  label: "Pozice",    type: "text" },
    { key: "phone", label: "Telefon",   type: "text" },
    { key: "email", label: "E-mail",    type: "text" },
    { key: "image", label: "Foto URL",  type: "url" },
  ],
};

const SCALAR_LABELS: Record<string, string> = {
  title: "Nadpis",
  subtitle: "Podnadpis",
  tagline: "Tagline",
  description: "Popis",
  body: "Text",
  text: "Text",
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

// Fields that are internal/structural and should not be shown in the inspector
const HIDDEN_SCALAR_KEYS = new Set(["id", "logoUrl"]);

export function ContentInspectorTab({ section, state }: { section: Section; state: StudioState }) {
  const sec = section as SectionWithMeta;
  const content = (section.settings?.content ?? {}) as Record<string, unknown>;
  const arrayDef = ARRAY_KEYS_BY_VARIANT[section.section_variant] ?? ARRAY_KEYS[section.section_type];
  const scalarEntries = Object.entries(content).filter(([k, v]) => (
    !k.startsWith("__") &&
    !HIDDEN_SCALAR_KEYS.has(k) &&
    (typeof v === "string" || typeof v === "number") &&
    (!arrayDef || k !== arrayDef.key)
  )) as Array<[string, string | number]>;
  const modifiedPaths = new Set(sec._modifiedPaths ?? []);
  const isV2 = sec.content_source === "v2";
  const hasOverrides = modifiedPaths.size > 0;

  function update(key: string, value: unknown) {
    const nextContent = { ...content, [key]: value };
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), content: nextContent },
    });
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
        <div className="flex items-center justify-between gap-2 rounded-md border border-blue-500/30 bg-blue-500/5 px-2.5 py-1.5">
          <span className="text-[10.5px] text-blue-300">
            {modifiedPaths.size} {modifiedPaths.size === 1 ? "úprava" : modifiedPaths.size < 5 ? "úpravy" : "úprav"} vs šablona
          </span>
          <button
            type="button"
            onClick={resetSection}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] text-blue-300 hover:bg-blue-500/15"
            title="Vrátit sekci na výchozí stav šablony"
          >
            <RotateCcw className="h-3 w-3" strokeWidth={2} />
            Reset
          </button>
        </div>
      )}

      {scalarEntries.length === 0 && !arrayDef && (
        <p className="px-1 text-[11px] text-[#71717a]">
          Tento typ sekce upravuj klikáním přímo v náhledu.
        </p>
      )}

      {scalarEntries.map(([key, value]) => (
        <Field
          key={key}
          label={SCALAR_LABELS[key] ?? key}
          value={String(value ?? "")}
          multiline={typeof value === "string" && value.length > 60}
          onChange={(v) => update(key, v)}
          isModified={modifiedPaths.has(key)}
        />
      ))}

      {arrayDef && (
        <ArraySection
          section={section}
          state={state}
          arrayKey={arrayDef.key}
          itemLabelKey={arrayDef.itemLabel}
        />
      )}
    </div>
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
      <span className="mb-1 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wide text-[#a1a1aa]">
        {label}
        {isModified && (
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400"
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
          className="w-full resize-none rounded-md border border-[#27272a] bg-[#0f0f10] px-2.5 py-2 text-xs text-white placeholder-[#52525b] outline-none transition-colors focus:border-blue-500"
        />
      ) : (
        <input
          type="text"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => local !== value && onChange(local)}
          className="h-8 w-full rounded-md border border-[#27272a] bg-[#0f0f10] px-2.5 text-xs text-white placeholder-[#52525b] outline-none transition-colors focus:border-blue-500"
        />
      )}
    </label>
  );
}

function ArraySection({
  section, state, arrayKey, itemLabelKey,
}: {
  section: Section;
  state: StudioState;
  arrayKey: string;
  itemLabelKey: string;
}) {
  const content = (section.settings?.content ?? {}) as Record<string, unknown>;
  const items = (content[arrayKey] ?? []) as Record<string, unknown>[];
  const fields = ITEM_FIELDS[section.section_variant] ?? ITEM_FIELDS[section.section_type] ?? [];
  const [expanded, setExpanded] = useState<number | null>(null);

  function commit(next: Record<string, unknown>[]) {
    const nextContent = { ...content, [arrayKey]: next };
    void state.patchSection(section.id, {
      settings: { ...(section.settings ?? {}), content: nextContent },
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-[#a1a1aa]">Položky</span>
        <span className="text-[10.5px] text-[#52525b]">{items.length}</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const open = expanded === i;
          const label = String(item[itemLabelKey] ?? `Položka ${i + 1}`);
          return (
            <div key={i} className="overflow-hidden rounded-md border border-[#27272a] bg-[#0f0f10]">
              <button
                type="button"
                onClick={() => setExpanded(open ? null : i)}
                className="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs text-white hover:bg-[#1a1a1c]"
              >
                {open ? <ChevronDown className="h-3.5 w-3.5 text-[#71717a]" strokeWidth={1.75} /> : <ChevronRight className="h-3.5 w-3.5 text-[#71717a]" strokeWidth={1.75} />}
                <span className="flex-1 truncate">{label}</span>
              </button>
              {open && (
                <div className="space-y-2 border-t border-[#27272a] p-2">
                  {fields.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      value={String(item[f.key] ?? "")}
                      multiline={f.type === "textarea"}
                      onChange={(v) => {
                        const next = items.map((it, idx) => idx === i ? { ...it, [f.key]: f.type === "number" ? Number(v) : v } : it);
                        commit(next);
                      }}
                    />
                  ))}
                  <div className="flex items-center justify-end gap-1 border-t border-[#27272a] pt-2">
                    <ItemBtn
                      label="Nahoru"
                      disabled={i === 0}
                      onClick={() => {
                        const next = [...items];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        commit(next);
                        setExpanded(i - 1);
                      }}
                    >
                      <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </ItemBtn>
                    <ItemBtn
                      label="Dolů"
                      disabled={i === items.length - 1}
                      onClick={() => {
                        const next = [...items];
                        [next[i], next[i + 1]] = [next[i + 1], next[i]];
                        commit(next);
                        setExpanded(i + 1);
                      }}
                    >
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </ItemBtn>
                    <ItemBtn
                      label="Smazat"
                      danger
                      onClick={() => {
                        commit(items.filter((_, idx) => idx !== i));
                        setExpanded(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </ItemBtn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          const blank = Object.fromEntries(fields.map(f => [f.key, f.type === "number" ? 5 : ""]));
          commit([...items, blank]);
          setExpanded(items.length);
        }}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#3f3f46] py-2 text-xs text-[#a1a1aa] hover:border-blue-500/50 hover:text-white"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Přidat položku
      </button>
    </div>
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
      className={`inline-flex h-6 w-6 items-center justify-center rounded text-[#a1a1aa] hover:bg-[#27272a] ${danger ? "hover:text-red-400" : "hover:text-white"} disabled:opacity-30 disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}
