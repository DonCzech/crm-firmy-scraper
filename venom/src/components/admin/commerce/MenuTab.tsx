"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ErrorBanner, useCommerceTheme } from "./shared";

/**
 * Správa megamenu storefrontu — viditelnost kategorií v menu, odznaky,
 * promo bannery v panelech a vlastní odkazy v liště. Strom kategorií
 * (pořadí, fotky, hierarchie) se spravuje v záložce Kategorie a menu
 * se z něj skládá automaticky.
 */

type Tone = "accent" | "danger" | "success" | "neutral";

interface MenuBadge { category_id: number; text: string; tone: Tone }
interface MenuPromo { id?: string; category_slug: string | null; image_url: string; title: string; subtitle: string; href: string }
interface MenuLink { label: string; href: string; tone: Tone }

interface MenuSettings {
  hidden_category_ids: number[];
  badges: MenuBadge[];
  promos: MenuPromo[];
  custom_links: MenuLink[];
  show_counts: boolean;
  show_images: boolean;
  max_depth: number;
}

interface CategoryNode {
  id: number;
  slug: string;
  name: string;
  image_url: string | null;
  product_count: number;
  children: CategoryNode[];
}

const DEFAULTS: MenuSettings = {
  hidden_category_ids: [], badges: [], promos: [], custom_links: [],
  show_counts: true, show_images: true, max_depth: 3,
};

const TONE_LABELS: Record<Tone, string> = {
  accent: "Akcent", danger: "Červená", success: "Zelená", neutral: "Neutrální",
};

const TONE_DOT: Record<Tone, string> = {
  accent: "bg-blue-500", danger: "bg-rose-500", success: "bg-emerald-500", neutral: "bg-slate-400",
};

export function MenuTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [settings, setSettings] = useState<MenuSettings>(DEFAULTS);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Drafty formulářů
  const [badgeCat, setBadgeCat] = useState<number>(0);
  const [badgeText, setBadgeText] = useState("");
  const [badgeTone, setBadgeTone] = useState<Tone>("accent");
  const [promoDraft, setPromoDraft] = useState<MenuPromo>({ category_slug: null, image_url: "", title: "", subtitle: "", href: "" });
  const [linkDraft, setLinkDraft] = useState<MenuLink>({ label: "", href: "", tone: "accent" });

  const load = useCallback(async () => {
    try {
      const data = await api<{ settings: MenuSettings; tree: CategoryNode[] }>(`${base}/menu`);
      setSettings(data.settings);
      setTree(data.tree);
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function save(next: MenuSettings) {
    setSaving(true); setError(null); setSaved(false);
    try {
      const data = await api<{ settings: MenuSettings }>(`${base}/menu`, {
        method: "POST",
        body: JSON.stringify({ settings: next }),
      });
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  function toggleHidden(id: number) {
    const hidden = settings.hidden_category_ids.includes(id)
      ? settings.hidden_category_ids.filter((x) => x !== id)
      : [...settings.hidden_category_ids, id];
    save({ ...settings, hidden_category_ids: hidden });
  }

  function addBadge() {
    if (!badgeCat || !badgeText.trim()) { setError("Vyberte kategorii a text odznaku."); return; }
    setError(null);
    const badges = [
      ...settings.badges.filter((b) => b.category_id !== badgeCat),
      { category_id: badgeCat, text: badgeText.trim(), tone: badgeTone },
    ];
    setBadgeText("");
    save({ ...settings, badges });
  }

  function removeBadge(categoryId: number) {
    save({ ...settings, badges: settings.badges.filter((b) => b.category_id !== categoryId) });
  }

  function addPromo() {
    if (!promoDraft.image_url.trim() && !promoDraft.title.trim()) { setError("Promo potřebuje obrázek nebo titulek."); return; }
    setError(null);
    const promo: MenuPromo = {
      ...promoDraft,
      id: Math.random().toString(36).slice(2, 10),
      category_slug: promoDraft.category_slug || null,
    };
    setPromoDraft({ category_slug: null, image_url: "", title: "", subtitle: "", href: "" });
    save({ ...settings, promos: [...settings.promos, promo] });
  }

  function removePromo(id?: string) {
    save({ ...settings, promos: settings.promos.filter((p) => p.id !== id) });
  }

  function addLink() {
    if (!linkDraft.label.trim() || !linkDraft.href.trim()) { setError("Odkaz potřebuje popisek i URL."); return; }
    setError(null);
    setLinkDraft({ label: "", href: "", tone: "accent" });
    save({ ...settings, custom_links: [...settings.custom_links, { ...linkDraft, label: linkDraft.label.trim(), href: linkDraft.href.trim() }] });
  }

  function removeLink(idx: number) {
    save({ ...settings, custom_links: settings.custom_links.filter((_, i) => i !== idx) });
  }

  const inputCls = `h-9 rounded-lg border px-3 text-[13px] outline-none transition ${t.inputCls ?? "border-slate-200 bg-white text-slate-900"}`;
  const btnCls = "inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-[12.5px] font-bold text-white transition hover:bg-slate-700 disabled:opacity-50";
  const headingCls = t.design === "studio" ? "text-white" : "text-slate-900";
  const catName = (id: number) => tree.find((c) => c.id === id)?.name ?? `#${id}`;

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-[18px] font-semibold ${headingCls}`}>Menu e-shopu</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Megamenu se skládá automaticky ze stromu kategorií (záložka Kategorie — pořadí, fotky, hierarchie).
            Tady řídíte, co v menu je navíc: viditelnost, odznaky, promo bannery a vlastní odkazy.
          </p>
        </div>
        {saved && <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-600">Uloženo ✓</span>}
      </div>

      <ErrorBanner message={error} />

      {/* ── Zobrazení ── */}
      <div className={`${t.sectionCls}`}>
        <h3 className={`mb-3 text-[14px] font-bold ${headingCls}`}>Zobrazení panelu</h3>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium">
            <input type="checkbox" checked={settings.show_images} onChange={(e) => save({ ...settings, show_images: e.target.checked })} className="h-4 w-4 accent-slate-900" />
            Fotky kategorií
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium">
            <input type="checkbox" checked={settings.show_counts} onChange={(e) => save({ ...settings, show_counts: e.target.checked })} className="h-4 w-4 accent-slate-900" />
            Počty produktů
          </label>
          <label className="flex items-center gap-2 text-[13px] font-medium">
            Hloubka menu
            <select value={settings.max_depth} onChange={(e) => save({ ...settings, max_depth: Number(e.target.value) })} className={inputCls}>
              <option value={2}>2 úrovně</option>
              <option value={3}>3 úrovně</option>
            </select>
          </label>
        </div>
      </div>

      {/* ── Kategorie v menu ── */}
      <div className={`${t.sectionCls}`}>
        <h3 className={`mb-1 text-[14px] font-bold ${headingCls}`}>Kategorie v menu</h3>
        <p className="mb-3 text-[12.5px] text-slate-500">Skrytí platí jen pro menu — v katalogu kategorie zůstává. Odznak se zobrazí vedle názvu kategorie.</p>
        <div className="divide-y divide-slate-100">
          {tree.map((cat) => {
            const hidden = settings.hidden_category_ids.includes(cat.id);
            const badge = settings.badges.find((b) => b.category_id === cat.id);
            return (
              <div key={cat.id} className="flex items-center gap-3 py-2">
                {cat.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.image_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-bold text-slate-500">{cat.name.charAt(0)}</span>
                )}
                <div className="min-w-0 flex-1">
                  <span className={`text-[13.5px] font-semibold ${hidden ? "text-slate-400 line-through" : headingCls}`}>{cat.name}</span>
                  <span className="ml-2 text-[11.5px] text-slate-400">{cat.product_count} produktů{cat.children.length ? ` · ${cat.children.length} podkategorií` : ""}</span>
                  {badge && (
                    <button onClick={() => removeBadge(cat.id)} title="Odebrat odznak"
                      className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold uppercase text-slate-600 hover:bg-rose-50 hover:text-rose-600">
                      <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[badge.tone]}`} />
                      {badge.text} ✕
                    </button>
                  )}
                </div>
                <button onClick={() => toggleHidden(cat.id)} disabled={saving}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-bold transition ${hidden ? "bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600" : "bg-emerald-50 text-emerald-600 hover:bg-slate-100 hover:text-slate-500"}`}>
                  {hidden ? "Skryto" : "V menu"}
                </button>
              </div>
            );
          })}
          {!tree.length && <p className="py-4 text-[13px] text-slate-400">Zatím žádné kategorie — vytvořte je v záložce Kategorie.</p>}
        </div>

        {/* Přidání odznaku */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <select value={badgeCat} onChange={(e) => setBadgeCat(Number(e.target.value))} className={inputCls}>
            <option value={0}>Odznak pro kategorii…</option>
            {tree.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={badgeText} onChange={(e) => setBadgeText(e.target.value)} placeholder="Text (např. Akce, Nové)" maxLength={24} className={`${inputCls} w-44`} />
          <select value={badgeTone} onChange={(e) => setBadgeTone(e.target.value as Tone)} className={inputCls}>
            {(Object.keys(TONE_LABELS) as Tone[]).map((tn) => <option key={tn} value={tn}>{TONE_LABELS[tn]}</option>)}
          </select>
          <button onClick={addBadge} disabled={saving} className={btnCls}>Přidat odznak</button>
        </div>
      </div>

      {/* ── Promo bannery ── */}
      <div className={`${t.sectionCls}`}>
        <h3 className={`mb-1 text-[14px] font-bold ${headingCls}`}>Promo bannery v megamenu</h3>
        <p className="mb-3 text-[12.5px] text-slate-500">Banner se zobrazí v panelu dané kategorie; banner „pro všechny kategorie" je záložní pro panely bez vlastního.</p>
        {settings.promos.length > 0 && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {settings.promos.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="relative h-24 bg-slate-100">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  )}
                  <button onClick={() => removePromo(p.id)} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[12px] font-bold text-rose-600 shadow hover:bg-white">✕</button>
                </div>
                <div className="p-3">
                  <div className={`truncate text-[13px] font-bold ${headingCls}`}>{p.title || "(bez titulku)"}</div>
                  <div className="mt-0.5 text-[11.5px] text-slate-500">
                    {p.category_slug ? `Kategorie: ${tree.find((c) => c.slug === p.category_slug)?.name ?? p.category_slug}` : "Pro všechny kategorie"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <select value={promoDraft.category_slug ?? ""} onChange={(e) => setPromoDraft({ ...promoDraft, category_slug: e.target.value || null })} className={inputCls}>
            <option value="">Pro všechny kategorie</option>
            {tree.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <input value={promoDraft.image_url} onChange={(e) => setPromoDraft({ ...promoDraft, image_url: e.target.value })} placeholder="URL obrázku" className={inputCls} />
          <input value={promoDraft.href} onChange={(e) => setPromoDraft({ ...promoDraft, href: e.target.value })} placeholder="Odkaz (např. /obchod?kategorie=akce)" className={inputCls} />
          <input value={promoDraft.title} onChange={(e) => setPromoDraft({ ...promoDraft, title: e.target.value })} placeholder="Titulek" maxLength={80} className={inputCls} />
          <input value={promoDraft.subtitle} onChange={(e) => setPromoDraft({ ...promoDraft, subtitle: e.target.value })} placeholder="Podtitulek" maxLength={140} className={inputCls} />
          <button onClick={addPromo} disabled={saving} className={btnCls}>Přidat promo</button>
        </div>
      </div>

      {/* ── Vlastní odkazy ── */}
      <div className={`${t.sectionCls}`}>
        <h3 className={`mb-1 text-[14px] font-bold ${headingCls}`}>Vlastní odkazy v liště</h3>
        <p className="mb-3 text-[12.5px] text-slate-500">Zvýrazněné odkazy vedle kategorií — typicky Akce, Novinky, Výprodej, Blog…</p>
        {settings.custom_links.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {settings.custom_links.map((l, i) => (
              <span key={`${l.label}${i}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-3 pr-1 text-[12.5px] font-semibold">
                <span className={`h-2 w-2 rounded-full ${TONE_DOT[l.tone]}`} />
                {l.label}
                <span className="max-w-40 truncate text-[11px] font-normal text-slate-400">{l.href}</span>
                <button onClick={() => removeLink(i)} className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600">✕</button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <input value={linkDraft.label} onChange={(e) => setLinkDraft({ ...linkDraft, label: e.target.value })} placeholder="Popisek (např. Výprodej)" maxLength={40} className={`${inputCls} w-44`} />
          <input value={linkDraft.href} onChange={(e) => setLinkDraft({ ...linkDraft, href: e.target.value })} placeholder="URL" className={`${inputCls} w-64`} />
          <select value={linkDraft.tone} onChange={(e) => setLinkDraft({ ...linkDraft, tone: e.target.value as Tone })} className={inputCls}>
            {(Object.keys(TONE_LABELS) as Tone[]).map((tn) => <option key={tn} value={tn}>{TONE_LABELS[tn]}</option>)}
          </select>
          <button onClick={addLink} disabled={saving} className={btnCls}>Přidat odkaz</button>
        </div>
      </div>
    </div>
  );
}
