"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, Loader2, Building2, Phone, Clock, Share2, Receipt, Search } from "lucide-react";
import { Input, EmptyState } from "../ui";
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

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  brand: Building2,
  contact: Phone,
  hours: Clock,
  social: Share2,
  company: Receipt,
  seo: Search,
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
    <div className="flex h-full flex-col vs-enter">
      {/* Category tabs */}
      <nav className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-2 py-2 vs-scroll">
        {CATEGORY_ORDER.filter((c) => grouped[c].length > 0).map((c) => {
          const Icon = CATEGORY_ICONS[c];
          const isActive = activeCat === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              className={`group inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium tracking-tight transition-[background,color,box-shadow] duration-150 ${
                isActive
                  ? "bg-[var(--vs-surface-3)] text-[var(--vs-text)] shadow-[inset_0_0_0_1px_var(--vs-border-strong)]"
                  : "text-[var(--vs-text-muted)] hover:bg-[var(--vs-surface-2)] hover:text-[var(--vs-text-soft)]"
              }`}
            >
              <Icon className={`h-3 w-3 ${isActive ? "text-[var(--vs-accent-hi)]" : ""}`} />
              {CATEGORY_LABELS[c]}
            </button>
          );
        })}
      </nav>

      {/* Save indicator */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-[var(--vs-border)] bg-[var(--vs-bg-soft)] px-3 py-1.5 text-[10.5px]">
        {saveState === "saving" && (
          <><Loader2 className="h-3 w-3 animate-spin text-[var(--vs-info)]" /><span className="text-[var(--vs-text-muted)]">Ukládám…</span></>
        )}
        {saveState === "saved" && (
          <><Check className="h-3 w-3 text-[var(--vs-success)]" /><span className="text-[var(--vs-text-muted)]">Uloženo</span></>
        )}
        {saveState === "error" && (
          <span className="truncate text-[var(--vs-danger)]" title={errorMsg ?? undefined}>{errorMsg ?? "Chyba ukládání"}</span>
        )}
        {saveState === "idle" && (
          <span className="text-[var(--vs-text-dim)]">Změny se ukládají automaticky.</span>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto vs-scroll p-3">
        {fields.length === 0 ? (
          <EmptyState
            title="Žádná pole"
            description="V této kategorii nejsou definovaná pole. Vyber jinou kategorii nahoře."
          />
        ) : (
          <div className="space-y-3">
            {fields.map((def) => (
              <Field
                key={def.key}
                def={def}
                value={values[def.key] ?? ""}
                onChange={(v) => setValues((prev) => ({ ...prev, [def.key]: v }))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  def, value, onChange,
}: { def: SlotDef; value: string; onChange: (v: string) => void }) {
  const isColor = def.type === "color";
  if (isColor) {
    return (
      <div>
        <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--vs-text-muted)]">
          {def.label}
        </label>
        <div className="flex items-center gap-2 rounded-md border border-[var(--vs-border-strong)] bg-[var(--vs-bg-soft)] px-2 py-1.5 focus-within:border-[var(--vs-accent)] focus-within:shadow-[0_0_0_3px_var(--vs-accent-bg)]">
          <span
            className="inline-block h-6 w-6 shrink-0 rounded ring-1 ring-[var(--vs-border-strong)]"
            style={{ background: value || "#000" }}
          />
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-6 w-7 shrink-0 cursor-pointer rounded bg-transparent"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="min-w-0 flex-1 bg-transparent font-mono text-[11.5px] text-[var(--vs-text)] placeholder-[var(--vs-text-dim)] outline-none"
          />
        </div>
      </div>
    );
  }
  return (
    <Input
      label={def.label}
      value={value}
      placeholder={def.description ?? def.label}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
