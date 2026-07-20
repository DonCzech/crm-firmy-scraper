"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ErrorBanner, useCommerceTheme } from "./shared";

const LOCALES = [
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
  { code: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
];

const ENTITY_TYPES = [
  { key: "product", label: "Produkty", fields: ["title", "subtitle", "description", "seo_title", "seo_description"] },
  { key: "category", label: "Kategorie", fields: ["name", "description", "seo_title", "seo_description"] },
];

const FIELD_LABELS: Record<string, string> = {
  title: "Název", subtitle: "Podtitulek", description: "Popis", name: "Název",
  seo_title: "SEO titulek", seo_description: "SEO popisek",
};

interface TranslationRow { id: number; entity_type: string; entity_id: number; locale: string; field: string; value: string }
interface EntityOption { id: number; title: string }

export function TranslationsTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [entityType, setEntityType] = useState("product");
  const [locale, setLocale] = useState("sk");
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadEntities = useCallback(async () => {
    try {
      if (entityType === "product") {
        const data = await api<{ items: Array<{ id: number; title: string }> }>(`${base}/products?page=1&perPage=500&status=active`);
        setEntities(data.items.map((p) => ({ id: p.id, title: p.title })));
      } else {
        const data = await api<{ categories: Array<{ id: number; name: string }> }>(`${base}/categories`);
        setEntities(data.categories.map((c) => ({ id: c.id, title: c.name })));
      }
    } catch { /* ignore */ }
  }, [base, entityType]);

  useEffect(() => { loadEntities(); }, [loadEntities]);

  async function loadTranslations() {
    if (!selectedEntity) return;
    setLoading(true);
    try {
      const data = await api<{ translations: TranslationRow[] }>(
        `${base}/translations?entity_type=${entityType}&entity_id=${selectedEntity}&locale=${locale}`
      );
      setTranslations(data.translations);
      const newForm: Record<string, string> = {};
      const fields = ENTITY_TYPES.find((e) => e.key === entityType)?.fields ?? [];
      for (const f of fields) {
        const existing = data.translations.find((t) => t.field === f);
        newForm[f] = existing?.value ?? "";
      }
      setForm(newForm);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (selectedEntity) loadTranslations();
  }, [selectedEntity, locale]);

  async function save() {
    if (!selectedEntity) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api(`${base}/translations`, {
        method: "POST",
        body: JSON.stringify({ entity_type: entityType, entity_id: selectedEntity, locale, fields: form }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  const entityDef = ENTITY_TYPES.find((e) => e.key === entityType)!;

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Překlady</h2>
        <p className="mt-0.5 text-[13px] text-slate-500">Přeložte produkty a kategorie do dalších jazyků pro vícejazyčný obchod.</p>
      </div>

      <ErrorBanner message={error} />

      <div className={t.toolbarCls}>
        <select value={entityType} onChange={(e) => { setEntityType(e.target.value); setSelectedEntity(null); }}
          className={`${t.inputCls} w-auto min-w-[150px]`}>
          {ENTITY_TYPES.map((e) => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>

        <select value={selectedEntity ?? ""} onChange={(e) => setSelectedEntity(e.target.value ? Number(e.target.value) : null)}
          className={`${t.inputCls} w-auto min-w-[240px]`}>
          <option value="">Vyberte {entityType === "product" ? "produkt" : "kategorii"}…</option>
          {entities.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>

        <div className="ml-auto flex gap-1">
          {LOCALES.filter((l) => l.code !== "cs").map((l) => (
            <button key={l.code} onClick={() => setLocale(l.code)}
              className={`rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition ${
                locale === l.code ? t.selectedChipCls : t.choiceChipCls
              }`}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </div>

      {!selectedEntity ? (
        <div className={t.emptyStateCls}>
          <p className="text-[14px] text-slate-500">Vyberte {entityType === "product" ? "produkt" : "kategorii"} pro překlad.</p>
        </div>
      ) : loading ? (
        <p className="py-8 text-center text-[13px] text-slate-400">Načítám překlady…</p>
      ) : (
        <div className={`${t.sectionCls} space-y-4`}>
          <h3 className={t.sectionTitleCls}>
            {LOCALES.find((l) => l.code === locale)?.flag} Překlad do {LOCALES.find((l) => l.code === locale)?.label}
          </h3>
          {entityDef.fields.map((field) => (
            <div key={field}>
              <label className={t.labelCls}>{FIELD_LABELS[field] ?? field}</label>
              {field === "description" ? (
                <textarea value={form[field] ?? ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  rows={5} className={`${t.inputCls} h-auto py-2`} />
              ) : (
                <input value={form[field] ?? ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className={t.inputCls} placeholder={`Překlad: ${FIELD_LABELS[field]}`} />
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={saving} className={t.btnPrimary}>
              {saving ? "Ukládám…" : "Uložit překlad"}
            </button>
            {saved && <span className="text-[13px] font-medium text-emerald-600">Uloženo</span>}
          </div>
        </div>
      )}
    </div>
  );
}
