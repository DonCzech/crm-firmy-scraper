"use client";

import { useState } from "react";
import type { Section } from "@/lib/db";

interface Props {
  section: Section;
  tenantSlug: string;
  onSaved: (updated: Section) => void;
}

export function SectionEditor({ section, tenantSlug, onSaved }: Props) {
  const [settings, setSettings] = useState<Record<string, unknown>>(
    section.settings as Record<string, unknown>
  );
  const [tab, setTab] = useState<"content" | "design">("content");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const content = (settings.content ?? {}) as Record<string, unknown>;
  const designTokens = (settings.designTokens ?? {}) as Record<string, string>;

  function updateContent(path: string, value: unknown) {
    setSettings((prev) => ({
      ...prev,
      content: { ...(prev.content as Record<string, unknown>), [path]: value },
    }));
  }

  function updateToken(key: string, value: string) {
    setSettings((prev) => ({
      ...prev,
      designTokens: { ...(prev.designTokens as Record<string, string>), [key]: value },
    }));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/sections/${section.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      onSaved({ ...section, settings });
    } catch {
      setError("Nepodařilo se uložit");
    } finally {
      setSaving(false);
    }
  }

  const contentFields = getFieldsForSection(section.section_type, content);
  const designFields = getDesignFields();
  const arrayKey = ARRAY_SECTION_KEYS[section.section_type];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("content")}
          className={`flex-1 py-2.5 text-xs font-semibold ${tab === "content" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"}`}
        >
          Obsah
        </button>
        <button
          onClick={() => setTab("design")}
          className={`flex-1 py-2.5 text-xs font-semibold ${tab === "design" ? "border-b-2 border-indigo-500 text-indigo-600" : "text-gray-500"}`}
        >
          Design
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {tab === "content" && (
          <>
            {contentFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <FieldInput
                  field={field}
                  value={String(content[field.key] ?? "")}
                  onChange={(v) => updateContent(field.key, v)}
                />
              </div>
            ))}

            {arrayKey && (
              <ArrayEditor
                sectionType={section.section_type}
                arrayKey={arrayKey}
                items={(content[arrayKey] ?? []) as Record<string, unknown>[]}
                onChange={(items) => updateContent(arrayKey, items)}
              />
            )}

            {contentFields.length === 0 && !arrayKey && (
              <p className="text-sm text-gray-400 text-center py-8">
                Pro tuto sekci není k dispozici editor obsahu.
              </p>
            )}
          </>
        )}

        {tab === "design" && (
          <>
            {designFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <FieldInput
                  field={field}
                  value={String(designTokens[field.key] ?? field.defaultValue ?? "")}
                  onChange={(v) => updateToken(field.key, v)}
                />
              </div>
            ))}
          </>
        )}
      </div>

      {error && <p className="text-red-500 text-xs bg-red-50 rounded px-3 py-2 mx-4">{error}</p>}

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
        >
          {saving ? "Ukládám…" : "Uložit změny"}
        </button>
      </div>
    </div>
  );
}

// ── Array section keys ─────────────────────────────────────────────────────────

const ARRAY_SECTION_KEYS: Record<string, string> = {
  services: "services",
  testimonials: "testimonials",
  gallery: "images",
  faq: "faq",
  team: "members",
};

// ── Array item field schemas ───────────────────────────────────────────────────

interface ArrayFieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "number";
  placeholder?: string;
}

function getArrayItemFields(sectionType: string): { addLabel: string; fields: ArrayFieldDef[]; defaultItem: Record<string, unknown> } {
  switch (sectionType) {
    case "services":
      return {
        addLabel: "+ Přidat službu",
        defaultItem: { name: "Nová služba", description: "", price: "", duration: "" },
        fields: [
          { key: "name", label: "Název", type: "text", placeholder: "např. Střih" },
          { key: "description", label: "Popis", type: "textarea", placeholder: "Krátký popis" },
          { key: "price", label: "Cena", type: "text", placeholder: "např. 350 Kč" },
          { key: "duration", label: "Doba trvání", type: "text", placeholder: "např. 45 min" },
        ],
      };
    case "testimonials":
      return {
        addLabel: "+ Přidat recenzi",
        defaultItem: { name: "Zákazník", text: "", rating: 5 },
        fields: [
          { key: "name", label: "Jméno", type: "text", placeholder: "Jan Novák" },
          { key: "text", label: "Text recenze", type: "textarea", placeholder: "Skvělá zkušenost..." },
          { key: "rating", label: "Hodnocení (1–5)", type: "number", placeholder: "5" },
        ],
      };
    case "gallery":
      return {
        addLabel: "+ Přidat fotku",
        defaultItem: { url: "", alt: "" },
        fields: [
          { key: "url", label: "URL fotky", type: "url", placeholder: "https://..." },
          { key: "alt", label: "Popis (alt text)", type: "text", placeholder: "Popis obrázku" },
        ],
      };
    case "faq":
      return {
        addLabel: "+ Přidat otázku",
        defaultItem: { question: "Nová otázka", answer: "" },
        fields: [
          { key: "question", label: "Otázka", type: "text", placeholder: "Jak to funguje?" },
          { key: "answer", label: "Odpověď", type: "textarea", placeholder: "Odpověď..." },
        ],
      };
    case "team":
      return {
        addLabel: "+ Přidat člena týmu",
        defaultItem: { name: "Jméno", role: "Role", bio: "", image: "" },
        fields: [
          { key: "name", label: "Jméno", type: "text", placeholder: "Jan Novák" },
          { key: "role", label: "Role / pozice", type: "text", placeholder: "Barber" },
          { key: "bio", label: "Bio", type: "textarea", placeholder: "Krátký popis..." },
          { key: "image", label: "Fotka (URL)", type: "url" },
        ],
      };
    default:
      return { addLabel: "+ Přidat", defaultItem: {}, fields: [] };
  }
}

// ── ArrayEditor component ─────────────────────────────────────────────────────

interface ArrayEditorProps {
  sectionType: string;
  arrayKey: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
}

function ArrayEditor({ sectionType, items, onChange }: ArrayEditorProps) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const { addLabel, fields, defaultItem } = getArrayItemFields(sectionType);

  if (!fields.length) return null;

  function addItem() {
    onChange([...items, { ...defaultItem }]);
    setExpanded(items.length);
  }

  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
    setExpanded(null);
  }

  function updateItem(i: number, key: string, value: unknown) {
    onChange(items.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...items];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
    setExpanded(i - 1);
  }

  function moveDown(i: number) {
    if (i === items.length - 1) return;
    const next = [...items];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onChange(next);
    setExpanded(i + 1);
  }

  const primaryLabel = fields[0]?.key ?? "item";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Položky</span>
        <span className="text-xs text-gray-400">{items.length} položek</span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Item header */}
            <div
              className="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                {String(item[primaryLabel] ?? `Položka ${i + 1}`)}
              </span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => moveUp(i)} disabled={i === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 text-xs">▲</button>
                <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30 text-xs">▼</button>
                <button onClick={() => removeItem(i)} className="p-0.5 rounded hover:bg-red-100 text-red-500 text-xs ml-1">✕</button>
              </div>
            </div>

            {/* Item fields */}
            {expanded === i && (
              <div className="p-3 space-y-3 bg-white border-t border-gray-100">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs text-gray-500 mb-1">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={String(item[field.key] ?? "")}
                        onChange={(e) => updateItem(i, field.key, e.target.value)}
                        rows={2}
                        placeholder={field.placeholder}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
                      />
                    ) : field.type === "url" ? (
                      <input
                        type="url"
                        value={String(item[field.key] ?? "")}
                        onChange={(e) => updateItem(i, field.key, e.target.value)}
                        placeholder={field.placeholder ?? "https://"}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    ) : field.type === "number" ? (
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={Number(item[field.key] ?? 5)}
                        onChange={(e) => updateItem(i, field.key, parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(item[field.key] ?? "")}
                        onChange={(e) => updateItem(i, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-2 py-1.5 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-3 w-full py-2 text-xs font-medium rounded-lg border-2 border-dashed border-indigo-300 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
      >
        {addLabel}
      </button>
    </div>
  );
}

// ── Field renderer ─────────────────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "color" | "select";
  placeholder?: string;
  defaultValue?: string;
  options?: Array<{ value: string; label: string }>;
}

function FieldInput({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  if (field.type === "textarea") {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "color") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#6366f1"}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 rounded border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
        />
      </div>
    );
  }
  if (field.type === "select" && field.options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }
  if (field.type === "url") {
    return (
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder={field.placeholder ?? "https://"}
      />
    );
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      placeholder={field.placeholder}
    />
  );
}

// ── Design token fields (shared across all sections) ──────────────────────────

function getDesignFields(): FieldDef[] {
  return [
    { key: "colorPrimary", label: "Primární barva", type: "color", defaultValue: "#6366f1" },
    { key: "colorAccent", label: "Akcentová barva", type: "color", defaultValue: "#6366f1" },
    { key: "colorBackground", label: "Barva pozadí", type: "color", defaultValue: "#ffffff" },
    { key: "colorSurface", label: "Barva povrchu", type: "color", defaultValue: "#f9fafb" },
    { key: "colorText", label: "Barva textu", type: "color", defaultValue: "#111827" },
    { key: "colorTextMuted", label: "Barva vedlejšího textu", type: "color", defaultValue: "#6b7280" },
    {
      key: "fontHeading",
      label: "Font nadpisů",
      type: "select",
      options: [
        { value: "Inter, sans-serif", label: "Inter" },
        { value: "Playfair Display, serif", label: "Playfair Display" },
        { value: "Cormorant Garamond, serif", label: "Cormorant Garamond" },
        { value: "Merriweather, serif", label: "Merriweather" },
        { value: "Montserrat, sans-serif", label: "Montserrat" },
        { value: "Lato, sans-serif", label: "Lato" },
        { value: "Georgia, serif", label: "Georgia" },
      ],
    },
    {
      key: "fontBody",
      label: "Font textu",
      type: "select",
      options: [
        { value: "Inter, sans-serif", label: "Inter" },
        { value: "Lato, sans-serif", label: "Lato" },
        { value: "Montserrat, sans-serif", label: "Montserrat" },
        { value: "Georgia, serif", label: "Georgia" },
        { value: "Merriweather, serif", label: "Merriweather" },
      ],
    },
    {
      key: "borderRadius",
      label: "Zaoblení rohů",
      type: "select",
      options: [
        { value: "4px", label: "Malé (4px)" },
        { value: "8px", label: "Střední (8px)" },
        { value: "12px", label: "Velké (12px)" },
        { value: "16px", label: "Extra (16px)" },
        { value: "0px", label: "Hranaté (0px)" },
      ],
    },
  ];
}

// ── Content fields per section type ──────────────────────────────────────────

function getFieldsForSection(type: string, _content: Record<string, unknown>): FieldDef[] {
  switch (type) {
    case "hero":
      return [
        { key: "title", label: "Nadpis", type: "textarea", placeholder: "Váš styl, náš um." },
        { key: "subtitle", label: "Podnadpis", type: "textarea" },
        { key: "ctaText", label: "Text tlačítka", type: "text" },
        { key: "ctaHref", label: "Odkaz tlačítka", type: "url" },
        { key: "backgroundImage", label: "Obrázek pozadí (URL)", type: "url" },
      ];
    case "cta":
    case "rezora-cta":
      return [
        { key: "title", label: "Nadpis", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "text" },
        { key: "ctaText", label: "Text tlačítka", type: "text" },
        { key: "ctaHref", label: "Odkaz", type: "url" },
        { key: "bookingUrl", label: "URL rezervačního systému", type: "url" },
      ];
    case "contact":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "address", label: "Adresa", type: "text" },
        { key: "phone", label: "Telefon", type: "text" },
        { key: "email", label: "E-mail", type: "text" },
        { key: "mapEmbedUrl", label: "Google Maps embed URL", type: "url" },
      ];
    case "opening-hours":
      return [
        { key: "title", label: "Nadpis", type: "text" },
        { key: "note", label: "Poznámka", type: "text" },
      ];
    case "rezora-widget":
      return [
        { key: "bookingUrl", label: "Rezora URL", type: "url" },
        { key: "ctaText", label: "Text tlačítka", type: "text" },
      ];
    case "services":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "textarea" },
      ];
    case "gallery":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "text" },
      ];
    case "testimonials":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "text" },
      ];
    case "faq":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "text" },
      ];
    case "team":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "textarea" },
      ];
    case "about":
      return [
        { key: "title", label: "Nadpis", type: "text" },
        { key: "body", label: "Text", type: "textarea" },
        { key: "highlight", label: "Citát / zvýraznění", type: "text" },
        { key: "image", label: "Obrázek (URL)", type: "url" },
      ];
    case "navbar":
      return [
        { key: "siteName", label: "Název webu", type: "text" },
        { key: "ctaText", label: "Text tlačítka v navigaci", type: "text" },
        { key: "ctaHref", label: "Odkaz tlačítka", type: "url" },
      ];
    case "footer":
      return [
        { key: "siteName", label: "Název webu", type: "text" },
        { key: "tagline", label: "Slogan", type: "text" },
        { key: "phone", label: "Telefon", type: "text" },
        { key: "email", label: "E-mail", type: "text" },
        { key: "address", label: "Adresa", type: "text" },
      ];
    case "blog-preview":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "subtitle", label: "Podnadpis", type: "text" },
        { key: "count", label: "Počet článků (1–6)", type: "text", placeholder: "3" },
      ];
    case "map":
      return [
        { key: "title", label: "Nadpis sekce", type: "text" },
        { key: "address", label: "Adresa (zobrazí se pod mapou)", type: "text" },
        { key: "mapEmbed", label: "Google Maps embed URL", type: "url" },
      ];
    default:
      return [];
  }
}
