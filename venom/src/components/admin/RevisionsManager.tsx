"use client";

import { useState } from "react";

interface Page {
  id: number;
  title: string;
  slug: string;
}

interface Revision {
  id: number;
  page_id: number;
  page_title: string;
  created_at: string;
  section_count: number;
}

interface Props {
  tenantSlug: string;
  pages: Page[];
  revisions: Revision[];
}

export function RevisionsManager({ tenantSlug, pages, revisions: initialRevisions }: Props) {
  const [revisions] = useState(initialRevisions);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [restored, setRestored] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [filterPageId, setFilterPageId] = useState<number | null>(null);

  const filtered = filterPageId
    ? revisions.filter((r) => r.page_id === filterPageId)
    : revisions;

  async function restore(revisionId: number) {
    if (!confirm("Obnovit tuto verzi? Aktuální obsah stránky bude přepsán.")) return;
    setRestoring(revisionId);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/revisions/${revisionId}/restore`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Chyba při obnovení");
        return;
      }
      setRestored(revisionId);
      setTimeout(() => setRestored(null), 4000);
    } catch {
      setError("Chyba sítě");
    } finally {
      setRestoring(null);
    }
  }

  return (
    <div>
      {/* Page filter */}
      {pages.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterPageId(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${!filterPageId ? "bg-indigo-600 text-white border-transparent" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            Všechny stránky
          </button>
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => setFilterPageId(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterPageId === p.id ? "bg-indigo-600 text-white border-transparent" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Zatím žádné uložené verze.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-4 ${restored === rev.id ? "border-green-400" : "border-gray-200"}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">{rev.page_title}</p>
              <p className="text-xs text-gray-500">
                {new Date(rev.created_at).toLocaleString("cs-CZ")} · {rev.section_count} sekcí
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {restored === rev.id && (
                <span className="text-xs text-green-600 font-medium">Obnoveno ✓</span>
              )}
              <button
                onClick={() => restore(rev.id)}
                disabled={restoring === rev.id}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
              >
                {restoring === rev.id ? "Obnovuji…" : "Obnovit"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
