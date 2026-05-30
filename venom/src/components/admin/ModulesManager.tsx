"use client";

import { useState } from "react";

const TIER_LABELS: Record<string, string> = {
  free: "Zdarma",
  starter: "Starter",
  pro: "Pro",
  addon: "Doplněk",
};

const TIER_COLORS: Record<string, string> = {
  free: "bg-green-100 text-green-700",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-purple-100 text-purple-700",
  addon: "bg-orange-100 text-orange-700",
};

interface Module {
  key: string;
  name: string;
  pricing_tier: string;
  enabled_by_default: boolean;
  enabled: boolean | null;
}

interface Props {
  tenantSlug: string;
  modules: Module[];
  activeModules: string[];
}

export function ModulesManager({ tenantSlug, modules, activeModules: initialActive }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set(initialActive));
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggle(key: string, enabled: boolean) {
    setSaving(key);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module_key: key, enabled }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při ukládání");
        return;
      }
      setActive((prev) => {
        const next = new Set(prev);
        if (enabled) next.add(key);
        else next.delete(key);
        return next;
      });
    } catch {
      setError("Chyba sítě");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      {modules.map((mod) => {
        const isActive = active.has(mod.key);
        const isSaving = saving === mod.key;
        return (
          <div
            key={mod.key}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{mod.name}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIER_COLORS[mod.pricing_tier] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {TIER_LABELS[mod.pricing_tier] ?? mod.pricing_tier}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Klíč: <code className="bg-gray-100 px-1 rounded">{mod.key}</code>
              </p>
            </div>
            <button
              onClick={() => toggle(mod.key, !isActive)}
              disabled={isSaving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isActive ? "bg-indigo-600" : "bg-gray-200"
              } ${isSaving ? "opacity-50" : ""}`}
              role="switch"
              aria-checked={isActive}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
