"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, Loader2 } from "lucide-react";
import type { StudioState } from "../TenantStudioView";

/**
 * F2 Sprint 1 — Brand & Contact panel (tenant_data_slots editor).
 *
 * Per-tenant identity data: brand name, logo, primary color, contacts, opening hours,
 * social, company numbers, SEO defaults. Survives template changes.
 *
 * UX: tabs by category, batched debounced save, success indicator.
 */
type Category = "brand" | "contact" | "hours" | "social" | "company" | "seo";

interface SlotDef {
  key: string;
  type: "string" | "number" | "boolean" | "url" | "color" | "json";
  category: Category;
  label: string;
  description?: string;
}

interface SlotRow {
  slot_key: string;
  value: unknown;
}

const CATEGORY_LABELS: Record<Category, string> = {
  brand: "Branding",
  contact: "Kontakt",
  hours: "Otevírací doba",
  social: "Sociální sítě",
  company: "Firma",
  seo: "SEO výchozí",
};

const CATEGORY_ORDER: Category[] = ["brand", "contact", "hours", "social", "company", "seo"];

export function BrandPanel({ state }: { state: StudioState }) {
  const [registry, setRegistry] = useState<SlotDef[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [initial, setInitial] = useState<Record<string, string>>({});
  const [activeCat, setActiveCat] = useState<Category>("brand");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/demo/${state.tenant.slug}/data-slots`, { cache: "no-store" });
        if (!res.ok) throw new Error(`Načtení selhalo (HTTP ${res.status})`);
        const json = (await res.json()) as { slots: SlotRow[]; registry: SlotDef[] };
        if (cancelled) return;
        setRegistry(json.registry ?? []);
        const map: Record<string, string> = {};
        for (const s of json.slots ?? []) {
          map[s.slot_key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value);
        }
        setValues(map);
        setInitial(map);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Neznámá chyba");
      }
    })();
    return () => { cancelled = true; };
  }, [state.tenant.slug]);

  // ── Debounced batch save ──────────────────────────────────────────────────
  const save = useCallback(async (next: Record<string, string>) => {
    const dirty = Object.entries(next).filter(([k, v]) => initial[k] !== v && v !== "");
    if (dirty.length === 0) {
      setSaveState("idle");
      return;
    }
    setSaveState("saving");
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/demo/${state.tenant.slug}/data-slots`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slots: dirty.map(([key, value]) => ({ key, value })) }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error ?? `Save failed (HTTP ${res.status})`);
      }
      setInitial(next);
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "Neznámá chyba");
    }
  }, [initial, state.tenant.slug]);

  useEffect(() => {
    if (saveState === "error") return;
    const t = setTimeout(() => { void save(values); }, 600);
    return () => clearTimeout(t);
  }, [values, save, saveState]);

  // ── Render ────────────────────────────────────────────────────────────────
  const grouped: Record<Category, SlotDef[]> = {
    brand: [], contact: [], hours: [], social: [], company: [], seo: [],
  };
  for (const def of registry) {
    if (def.category in grouped) grouped[def.category as Category].push(def);
  }
  const fields = grouped[activeCat] ?? [];

  return (
    <div className="flex h-full flex-col">
      {/* Category tabs */}
      <div className="flex shrink-0 gap-0.5 border-b border-[#27272a] px-2 py-1.5 overflow-x-auto">
        {CATEGORY_ORDER.filter((c) => grouped[c].length > 0).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActiveCat(c)}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeCat === c
                ? "bg-[#27272a] text-white"
                : "text-[#a1a1aa] hover:bg-[#1f1f22] hover:text-white"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Save indicator */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-[#27272a] px-3 py-1.5 text-[10.5px]">
        {saveState === "saving" && (
          <><Loader2 className="h-3 w-3 animate-spin text-blue-400" /><span className="text-[#a1a1aa]">Ukládám…</span></>
        )}
        {saveState === "saved" && (
          <><Check className="h-3 w-3 text-green-400" /><span className="text-[#71717a]">Uloženo</span></>
        )}
        {saveState === "error" && (
          <span className="truncate text-red-400" title={errorMsg ?? undefined}>{errorMsg ?? "Chyba ukládání"}</span>
        )}
        {saveState === "idle" && (
          <span className="text-[#52525b]">Změny se ukládají automaticky.</span>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-2">
        {fields.length === 0 ? (
          <div className="px-2 py-4 text-[11px] text-[#71717a]">Žádná pole v této kategorii.</div>
        ) : (
          fields.map((def) => (
            <Field
              key={def.key}
              def={def}
              value={values[def.key] ?? ""}
              onChange={(v) => setValues((prev) => ({ ...prev, [def.key]: v }))}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Field({
  def, value, onChange,
}: { def: SlotDef; value: string; onChange: (v: string) => void }) {
  const isColor = def.type === "color";
  return (
    <label className="mb-2 block px-1">
      <span className="mb-1 block text-[10.5px] font-medium text-[#a1a1aa]">{def.label}</span>
      <div className="flex items-center gap-1.5">
        {isColor && (
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 shrink-0 cursor-pointer rounded border border-[#27272a] bg-transparent"
          />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.description ?? def.label}
          className="min-w-0 flex-1 rounded-md border border-[#27272a] bg-[#0f0f10] px-2 py-1.5 text-[12px] text-white placeholder-[#52525b] focus:border-blue-500 focus:outline-none"
        />
      </div>
    </label>
  );
}
