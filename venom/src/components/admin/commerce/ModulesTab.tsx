"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ErrorBanner, useCommerceTheme } from "./shared";
import { MODULE_DEMOS, ModuleDemoModal } from "./ModuleDemos";

interface PlanInfo {
  slug: string;
  name: string;
  price_monthly: number;
  tagline: string;
  popular?: boolean;
  included_count: number;
}

interface AddonInfo {
  slug: string;
  name: string;
  description: string;
  category: string;
  price_monthly: number;
  included_from: string;
  active: boolean;
  in_plan: boolean;
  activated_at: string | null;
}

interface Overview {
  plan: string;
  plans: PlanInfo[];
  addons: AddonInfo[];
  monthly_addons: number;
  monthly_total: number;
}

const CATEGORY_ICON: Record<string, string> = {
  "Slevy a akce": "🏷️",
  "Marketing": "📣",
  "Recenze": "⭐",
  "SEO a obsah": "🔍",
  "Produkty": "📦",
  "Sklad a data": "🗄️",
  "Objednávky a doprava": "🚚",
  "Platby": "💳",
  "B2B a expanze": "🌍",
  "Komunikace": "💬",
  "Umělá inteligence": "🤖",
};

function kc(n: number): string {
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

export function ModulesTab({ base }: { base: string }) {
  const t = useCommerceTheme();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"addons" | "plans">("addons");
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [demoSlug, setDemoSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>(`${base}/addons`));
    } catch (e) { setError(e instanceof Error ? e.message : "Načtení selhalo"); }
    finally { setLoading(false); }
  }, [base]);

  useEffect(() => { load(); }, [load]);

  async function post(body: Record<string, string>, key: string) {
    setBusy(key);
    setError(null);
    try {
      setData(await api<Overview>(`${base}/addons`, { method: "POST", body: JSON.stringify(body) }));
    } catch (e) { setError(e instanceof Error ? e.message : "Akce selhala"); }
    finally { setBusy(null); }
  }

  async function toggleAddon(addon: AddonInfo) {
    if (addon.active) {
      const note = addon.in_plan ? "" : ` Měsíční pronájem ${kc(addon.price_monthly)} se přestane účtovat.`;
      if (!confirm(`Deaktivovat modul „${addon.name}“?${note}`)) return;
      await post({ action: "deactivate", slug: addon.slug }, addon.slug);
    } else {
      if (!addon.in_plan && !confirm(`Aktivovat modul „${addon.name}“ za ${kc(addon.price_monthly)} / měsíc bez DPH? Pronájem lze kdykoli ukončit.`)) return;
      await post({ action: "activate", slug: addon.slug }, addon.slug);
    }
  }

  async function choosePlan(plan: PlanInfo) {
    if (!data || plan.slug === data.plan) return;
    if (!confirm(`Přejít na tarif ${plan.name} za ${kc(plan.price_monthly)} / měsíc bez DPH?`)) return;
    await post({ action: "set_plan", plan: plan.slug }, `plan-${plan.slug}`);
  }

  const categories = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.addons.map((a) => a.category)));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.addons.filter((a) =>
      (!category || a.category === category) &&
      (!q || a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    );
  }, [data, category, search]);

  const currentPlan = data?.plans.find((p) => p.slug === data.plan);
  const activeCount = data?.addons.filter((a) => a.active).length ?? 0;
  const headingCls = `text-[18px] font-semibold ${t.design === "studio" ? "text-white" : "text-slate-900"}`;

  if (loading) return <p className="py-8 text-center text-[13px] text-slate-400">Načítám…</p>;

  return (
    <div className="space-y-6">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={headingCls}>Doplňky a tarif</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Rozšiřte svůj e-shop o moduly. Moduly v tarifu aktivujete zdarma, ostatní pronajmete měsíčně.
          </p>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-white p-1 text-[13px] font-semibold">
          <button
            onClick={() => setView("addons")}
            className={`rounded-full px-4 py-1.5 transition ${view === "addons" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Doplňky
          </button>
          <button
            onClick={() => setView("plans")}
            className={`rounded-full px-4 py-1.5 transition ${view === "plans" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Tarify a ceník
          </button>
        </div>
      </div>

      {data && currentPlan && (
        <div className={`${t.sectionCls} flex flex-wrap items-center gap-x-8 gap-y-3`}>
          <div>
            <div className={t.labelCls}>Váš tarif</div>
            <div className="mt-0.5 flex items-center gap-2 text-[16px] font-bold">
              {currentPlan.name}
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                {kc(currentPlan.price_monthly)}/měs
              </span>
            </div>
          </div>
          <div>
            <div className={t.labelCls}>Aktivní moduly</div>
            <div className="mt-0.5 text-[16px] font-bold">{activeCount} <span className="text-[12px] font-medium text-slate-400">z {data.addons.length}</span></div>
          </div>
          <div>
            <div className={t.labelCls}>Pronájmy mimo tarif</div>
            <div className="mt-0.5 text-[16px] font-bold">{kc(data.monthly_addons)}<span className="text-[12px] font-medium text-slate-400">/měs</span></div>
          </div>
          <div>
            <div className={t.labelCls}>Celkem měsíčně</div>
            <div className="mt-0.5 text-[16px] font-bold text-emerald-600">{kc(data.monthly_total)}<span className="text-[12px] font-medium text-slate-400"> bez DPH</span></div>
          </div>
          {view === "addons" && (
            <button onClick={() => setView("plans")} className={`${t.btnGhost} ml-auto`}>Změnit tarif</button>
          )}
        </div>
      )}

      {view === "addons" && data && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat modul…"
              className={`${t.inputCls} !w-56`}
            />
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                category === null ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              Vše ({data.addons.length})
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(category === c ? null : c)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  category === c ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {CATEGORY_ICON[c] ?? "🧩"} {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className={t.emptyStateCls}>
              <p className="text-[14px] text-slate-500">Žádný modul neodpovídá hledání.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <div
                  key={a.slug}
                  className={`flex flex-col rounded-2xl border bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition ${
                    a.active ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[19px]">
                      {CATEGORY_ICON[a.category] ?? "🧩"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[14px] font-bold text-slate-900">{a.name}</h3>
                        {a.active && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Aktivní
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-slate-400">{a.category}</div>
                    </div>
                  </div>
                  <p className="mt-2.5 flex-1 text-[12.5px] leading-relaxed text-slate-600">{a.description}</p>
                  <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    {a.in_plan ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-bold text-emerald-700">
                        ✓ Ve vašem tarifu
                      </span>
                    ) : (
                      <span className="text-[13px] font-bold text-slate-900">
                        {kc(a.price_monthly)}
                        <span className="text-[11px] font-medium text-slate-400">/měs bez DPH</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      {a.active && MODULE_DEMOS[a.slug] && (
                        <button
                          onClick={() => setDemoSlug(a.slug)}
                          className="inline-flex h-8 items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 text-[12px] font-bold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          ▶ Vyzkoušet
                        </button>
                      )}
                      <button
                        onClick={() => toggleAddon(a)}
                        disabled={busy === a.slug}
                        className={
                          a.active
                            ? `${t.btnGhost} !h-8 !px-3 !text-[12px] hover:!text-rose-600`
                            : `${t.btnPrimary} !h-8 !px-3 !text-[12px]`
                        }
                      >
                        {busy === a.slug ? "…" : a.active ? "Deaktivovat" : a.in_plan ? "Aktivovat" : "Pronajmout"}
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "plans" && data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.plans.map((p) => {
              const isCurrent = p.slug === data.plan;
              return (
                <div
                  key={p.slug}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${
                    p.popular ? "border-indigo-300 ring-2 ring-indigo-200" : "border-slate-200"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
                      Nejoblíbenější
                    </span>
                  )}
                  <h3 className="text-[16px] font-extrabold text-slate-900">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-[28px] font-extrabold tracking-tight text-slate-900">{p.price_monthly.toLocaleString("cs-CZ")}</span>
                    <span className="text-[13px] font-semibold text-slate-500">Kč/měs</span>
                  </div>
                  <div className="text-[11px] text-slate-400">bez DPH</div>
                  <p className="mt-3 min-h-[54px] text-[12.5px] leading-relaxed text-slate-600">{p.tagline}</p>
                  <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-[12.5px]">
                    <span className="font-bold text-slate-900">{p.included_count}</span>
                    <span className="text-slate-500"> z {data.addons.length} modulů v ceně</span>
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5 text-[12px] text-slate-600">
                    <li>✓ Neomezené produkty a objednávky</li>
                    <li>✓ Vlastní doména a šablony</li>
                    {p.slug !== "start" && <li>✓ Slevy, kupóny a hlídací pes</li>}
                    {(p.slug === "business" || p.slug === "premium") && <li>✓ Opuštěný košík, e-mailing, dopravci</li>}
                    {(p.slug === "business" || p.slug === "premium") && <li>✓ AI copywriter a WhatsApp chat</li>}
                    {p.slug === "premium" && <li>✓ B2B velkoobchod, cizí měny a jazyky</li>}
                    <li className="text-slate-400">Ostatní moduly za měsíční pronájem</li>
                  </ul>
                  <button
                    onClick={() => choosePlan(p)}
                    disabled={isCurrent || busy === `plan-${p.slug}`}
                    className={`mt-4 ${
                      isCurrent
                        ? "h-9 rounded-full border border-emerald-200 bg-emerald-50 text-[12.5px] font-bold text-emerald-700"
                        : p.popular
                          ? `${t.btnPrimary} w-full justify-center`
                          : `${t.btnGhost} w-full justify-center`
                    }`}
                  >
                    {busy === `plan-${p.slug}` ? "Měním…" : isCurrent ? "✓ Váš aktuální tarif" : "Zvolit tarif"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[12px] text-slate-400">
            Všechny ceny jsou uvedeny bez DPH. Moduly nad rámec tarifu lze kdykoli pronajmout za měsíční cenu modulu a pronájem kdykoli ukončit — bez závazků.
          </p>
        </>
      )}

      {demoSlug && <ModuleDemoModal slug={demoSlug} onClose={() => setDemoSlug(null)} />}
    </div>
  );
}
