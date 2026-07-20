"use client";

import { useCallback, useEffect, useState } from "react";
import { useCommerceTheme, api, ErrorBanner } from "./shared";

interface Feed {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  url: string;
  format: string;
  lastGenerated?: string;
  productCount?: number;
}

const DEFAULT_FEEDS: Feed[] = [
  { key: "google_shopping", label: "Google Shopping", description: "XML feed pro Google Merchant Center", icon: "G", enabled: false, url: "", format: "xml" },
  { key: "heureka", label: "Heureka.cz", description: "XML feed pro Heureka.cz srovnávač", icon: "H", enabled: false, url: "", format: "xml" },
  { key: "zbozi", label: "Zboží.cz", description: "XML feed pro Zboží.cz (Seznam)", icon: "Z", enabled: false, url: "", format: "xml" },
  { key: "facebook", label: "Facebook Catalog", description: "CSV/XML feed pro Facebook & Instagram Shopping", icon: "F", enabled: false, url: "", format: "csv" },
  { key: "glami", label: "Glami.cz", description: "XML feed pro Glami (móda)", icon: "GL", enabled: false, url: "", format: "xml" },
];

const INTEGRATIONS = [
  { key: "google_analytics", label: "Google Analytics 4", desc: "Měření konverzí a chování zákazníků", icon: "GA", connected: false },
  { key: "google_tag_manager", label: "Google Tag Manager", desc: "Správa tagů a pixelů", icon: "GTM", connected: false },
  { key: "facebook_pixel", label: "Facebook Pixel", desc: "Sledování konverzí pro reklamy", icon: "FB", connected: false },
  { key: "mailchimp", label: "Mailchimp", desc: "E-mail marketing a automatizace", icon: "MC", connected: false },
];

export function FeedsTab({ base, tenantSlug }: { base: string; tenantSlug: string }) {
  const t = useCommerceTheme();
  const [feeds, setFeeds] = useState<Feed[]>(DEFAULT_FEEDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const load = useCallback(async () => {
    try {
      const data = await api<{ shop: { settings: { feeds?: Feed[] } } }>(`${base}/settings`);
      const savedFeeds = data.shop?.settings?.feeds;
      if (Array.isArray(savedFeeds) && savedFeeds.length) {
        setFeeds(DEFAULT_FEEDS.map((df) => {
          const saved = savedFeeds.find((f) => f.key === df.key);
          return saved ? { ...df, ...saved } : df;
        }));
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    try {
      await api(`${base}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ settings: { feeds } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Uložení selhalo"); }
    finally { setSaving(false); }
  }

  function updateFeed(key: string, patch: Partial<Feed>) {
    setFeeds((prev) => prev.map((f) => f.key === key ? { ...f, ...patch } : f));
  }

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám nastavení…</p>;

  return (
    <div className="space-y-8">
      <ErrorBanner message={error} />

      {/* Product feeds */}
      <section>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Produktové feedy</h2>
        <p className="mt-0.5 mb-5 text-[13px] text-slate-500">
          Generujte XML/CSV feedy pro srovnávače cen a reklamní platformy.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {feeds.map((f) => (
            <div key={f.key} className={`${t.sectionCls} transition ${!f.enabled ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-[14px] font-black ${
                  t.design === "studio" ? "bg-violet-500/20 text-violet-300" : t.design === "glass" ? "bg-lime-100 text-lime-700" : "bg-indigo-50 text-indigo-600"
                }`}>
                  {f.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[14px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{f.label}</h3>
                  <p className="text-[12px] text-slate-500">{f.description}</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={f.enabled} onChange={(e) => updateFeed(f.key, { enabled: e.target.checked })}
                    className={`h-4 w-4 rounded ${t.checkboxAccentCls}`} />
                </label>
              </div>
              {f.enabled && (
                <div className="mt-3 space-y-2">
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-mono ${
                    t.design === "studio" ? "bg-white/[0.06] text-slate-300" : "bg-slate-50 text-slate-600"
                  }`}>
                    <span className="truncate">/api/demo/{tenantSlug}/shop/feed/{f.key}.{f.format}</span>
                    <button onClick={() => navigator.clipboard?.writeText(`/api/demo/${tenantSlug}/shop/feed/${f.key}.${f.format}`)}
                      className="shrink-0 text-[11px] font-semibold text-slate-400 hover:text-slate-700">Kopírovat</button>
                  </div>
                  <p className={t.noticeCls}>Feed se generuje automaticky z aktivních produktů.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h2 className={`text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>Propojení a integrace</h2>
        <p className="mt-0.5 mb-5 text-[13px] text-slate-500">
          Propojte e-shop s analytickými a marketingovými nástroji.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.map((intg) => (
            <div key={intg.key} className={t.sectionCls}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-[12px] font-black ${
                  t.design === "studio" ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-500"
                }`}>
                  {intg.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-[14px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`}>{intg.label}</h3>
                  <p className="text-[12px] text-slate-500">{intg.desc}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                  intg.connected
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-500"
                }`}>
                  {intg.connected ? "Připojeno" : "Brzy"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={save} disabled={saving} className={t.btnPrimary}>
          {saving ? "Ukládám…" : saved ? "✓ Uloženo" : "Uložit nastavení"}
        </button>
        {saved && <span className="text-[13px] font-medium text-emerald-600">Změny uloženy.</span>}
      </div>
    </div>
  );
}
