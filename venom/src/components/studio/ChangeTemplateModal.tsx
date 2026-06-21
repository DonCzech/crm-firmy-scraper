"use client";

import { useEffect, useState, useMemo } from "react";
import { X, ArrowRight, Loader2, AlertCircle, Check } from "lucide-react";
import type { StudioState } from "./TenantStudioView";

/**
 * F2 Sprint 2 — Change Template wizard.
 *
 * Step 1: pick target template from catalog (grid)
 * Step 2: preview diff (preserved data slots, discarded sections)
 * Step 3: confirm + apply → wipes sections, rebuilds from new template defaults
 */
type Step = "pick" | "preview" | "applying" | "done" | "error";

interface CatalogItem { key: string; name: string; industry: string; primaryColor: string; screenshot: string | null }
interface DiffPreview {
  from: { sectionsCount: number };
  to: { templateKey: string; name: string; industry: string; sectionsCount: number; sectionTypes: string[] };
  preserved: { dataSlots: string[]; blogPosts: boolean; media: boolean; domains: boolean };
  discarded: { sectionsCount: number };
}

export function ChangeTemplateModal({
  state, onClose,
}: { state: StudioState; onClose: () => void }) {
  const [step, setStep] = useState<Step>("pick");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [filter, setFilter] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [preview, setPreview] = useState<DiffPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load catalog (use existing admin preview-2 data shape via /api/admin-hub or /api/template-lab)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Reuse the preview-2 catalog endpoint if present; fall back to a minimal list
        const res = await fetch("/api/template-lab/catalog", { cache: "no-store" });
        if (!res.ok) throw new Error(`Catalog HTTP ${res.status}`);
        const json = (await res.json()) as { templates: CatalogItem[] };
        if (cancelled) return;
        setCatalog(json.templates ?? []);
      } catch {
        // Soft-fail — user sees empty list with a fetch error inline
        if (!cancelled) setCatalog([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const f = filter.trim().toLowerCase();
    if (!f) return catalog;
    return catalog.filter((c) => c.key.includes(f) || c.name.toLowerCase().includes(f) || c.industry.includes(f));
  }, [catalog, filter]);

  async function loadPreview(key: string) {
    setStep("preview");
    setTarget(key);
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/change-template?to=${encodeURIComponent(key)}`, { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const json = (await res.json()) as DiffPreview;
      setPreview(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba načítání náhledu");
      setStep("error");
    }
  }

  async function apply() {
    if (!target) return;
    setStep("applying");
    setError(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/change-template`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetTemplateKey: target, confirm: true }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      setStep("done");
      // Reload after 1.5s so user sees confirmation, then page refresh to show new template
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chyba změny šablony");
      setStep("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[#27272a] bg-[#0f0f10]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#27272a] px-4">
          <h2 className="text-sm font-semibold text-white">
            {step === "pick" && "Vyber novou šablonu"}
            {step === "preview" && "Náhled změny šablony"}
            {step === "applying" && "Měním šablonu…"}
            {step === "done" && "Šablona změněna"}
            {step === "error" && "Chyba"}
          </h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-[#a1a1aa] hover:bg-[#27272a] hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === "pick" && (
            <>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Hledat (název, odvětví, klíč…)"
                className="mb-3 w-full rounded-md border border-[#27272a] bg-[#1a1a1c] px-3 py-2 text-[13px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
              />
              {catalog.length === 0 && (
                <div className="px-2 py-8 text-center text-[12px] text-[#71717a]">
                  Katalog šablon se nepodařilo načíst.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {filtered.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => loadPreview(c.key)}
                    className="group flex flex-col overflow-hidden rounded-md border border-[#27272a] bg-[#1a1a1c] text-left transition-colors hover:border-blue-500"
                  >
                    <div
                      className="aspect-video w-full bg-cover bg-center"
                      style={{
                        background: c.screenshot
                          ? `url(${c.screenshot}) center/cover`
                          : `linear-gradient(135deg, ${c.primaryColor} 0%, #18181b 100%)`,
                      }}
                    />
                    <div className="px-2.5 py-2">
                      <div className="truncate text-[12px] font-medium text-white">{c.name}</div>
                      <div className="truncate text-[10.5px] text-[#71717a]">{c.industry} · {c.key}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "preview" && preview && (
            <div className="space-y-4">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-300">
                  <Check className="h-3.5 w-3.5" /> Zachová se
                </div>
                <ul className="space-y-0.5 pl-5 text-[11px] text-[#d4d4d8]">
                  {preview.preserved.dataSlots.length > 0 ? (
                    preview.preserved.dataSlots.map((k) => <li key={k}>· {k}</li>)
                  ) : (
                    <li className="text-[#71717a]">Žádné slot data zatím nevyplněna</li>
                  )}
                  <li>· Blog příspěvky ({preview.preserved.blogPosts ? "ano" : "ne"})</li>
                  <li>· Nahrané obrázky / média</li>
                  <li>· Vlastní domény</li>
                </ul>
              </div>

              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-amber-300">
                  <AlertCircle className="h-3.5 w-3.5" /> Smaže se
                </div>
                <ul className="space-y-0.5 pl-5 text-[11px] text-[#d4d4d8]">
                  <li>· Stávajících {preview.from.sectionsCount} sekcí (text/obrázky upravené ve studiu)</li>
                  <li className="text-[#71717a]">Pozn.: vyplněné kontakt/brand údaje zůstanou (jsou v data slotech)</li>
                </ul>
              </div>

              <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-blue-300">
                  <ArrowRight className="h-3.5 w-3.5" /> Nová šablona
                </div>
                <div className="text-[11px] text-[#d4d4d8]">
                  <strong className="text-white">{preview.to.name}</strong> ({preview.to.industry})
                </div>
                <div className="mt-1 text-[10.5px] text-[#71717a]">
                  {preview.to.sectionsCount} sekcí: {preview.to.sectionTypes.join(" → ")}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep("pick"); setPreview(null); setTarget(null); }}
                  className="rounded-md border border-[#27272a] px-3 py-1.5 text-[12px] text-[#d4d4d8] hover:bg-[#1f1f22]"
                >
                  Zpět
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-500"
                >
                  Změnit šablonu
                </button>
              </div>
            </div>
          )}

          {step === "applying" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[12px] text-[#d4d4d8]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              Aplikuji novou šablonu…
            </div>
          )}

          {step === "done" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-[12px] text-emerald-300">
              <Check className="h-8 w-8" strokeWidth={2.5} />
              Hotovo. Načítám novou šablonu…
            </div>
          )}

          {step === "error" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div className="text-[12px] text-red-300">{error ?? "Neznámá chyba"}</div>
              <button
                type="button"
                onClick={() => { setStep("pick"); setError(null); }}
                className="rounded-md border border-[#27272a] px-3 py-1.5 text-[11px] text-[#d4d4d8] hover:bg-[#1f1f22]"
              >
                Zkusit znovu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
