"use client";

import { useState } from "react";
import Link from "next/link";
import type { Page } from "@/lib/db";

interface PageSeo {
  id: number;
  title: string;
  slug: string;
  is_homepage: boolean;
  seo_title: string;
  seo_description: string;
  og_image: string;
  noindex: boolean;
}

interface Props {
  tenantSlug: string;
  pages: Page[];
}

export function SeoEditor({ tenantSlug, pages }: Props) {
  const [rows, setRows] = useState<PageSeo[]>(
    pages.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      is_homepage: p.is_homepage,
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      og_image: p.og_image ?? "",
      noindex: p.noindex ?? false,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(id: number, field: keyof PageSeo, value: string | boolean) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/seo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: rows.map((r) => ({
            id: r.id,
            seo_title: r.seo_title || null,
            seo_description: r.seo_description || null,
            og_image: r.og_image || null,
            noindex: r.noindex,
          })),
        }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) { setError(json.error ?? "Chyba při ukládání."); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Nepodařilo se uložit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold">🔍 SEO Editor</span>
          <span className="text-gray-400">{tenantSlug}</span>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-yellow-400">Ukládám…</span>}
          {saved && <span className="text-green-400">Uloženo ✓</span>}
          <Link href={`/demo/${tenantSlug}/admin`} className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600">
            ← Editor
          </Link>
          <button
            onClick={save}
            disabled={saving}
            className="px-3 py-1 bg-indigo-600 rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            Uložit vše
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SEO nastavení stránek</h1>
        <p className="text-sm text-gray-500 mb-8">
          Upravte SEO title, meta description a nastavení indexování pro každou stránku.
        </p>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="space-y-6">
          {rows.map((row) => (
            <div key={row.id} className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-semibold text-gray-900">{row.title}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    /{row.is_homepage ? "" : row.slug}
                  </span>
                  {row.is_homepage && (
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      Homepage
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={row.noindex}
                    onChange={(e) => update(row.id, "noindex", e.target.checked)}
                    className="rounded"
                  />
                  noindex
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    SEO Title <span className="text-gray-400">({row.seo_title.length}/60)</span>
                  </label>
                  <input
                    type="text"
                    value={row.seo_title}
                    onChange={(e) => update(row.id, "seo_title", e.target.value)}
                    maxLength={60}
                    placeholder="Název stránky pro vyhledávače"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <div className={`mt-1 h-1 rounded-full ${row.seo_title.length > 60 ? "bg-red-400" : row.seo_title.length > 50 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${Math.min(100, (row.seo_title.length / 60) * 100)}%` }} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Meta Description <span className="text-gray-400">({row.seo_description.length}/160)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={row.seo_description}
                    onChange={(e) => update(row.id, "seo_description", e.target.value)}
                    maxLength={160}
                    placeholder="Popis stránky pro vyhledávače (cca 155 znaků)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                  />
                  <div className={`mt-1 h-1 rounded-full ${row.seo_description.length > 160 ? "bg-red-400" : row.seo_description.length > 150 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: `${Math.min(100, (row.seo_description.length / 160) * 100)}%` }} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">OG Image URL</label>
                  <input
                    type="url"
                    value={row.og_image}
                    onChange={(e) => update(row.id, "og_image", e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Preview snippet */}
                {(row.seo_title || row.seo_description) && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Náhled ve vyhledávači</p>
                    <p className="text-blue-700 text-base font-medium line-clamp-1">
                      {row.seo_title || row.title}
                    </p>
                    <p className="text-green-700 text-xs mb-1">
                      webero.co/demo/{tenantSlug}{row.is_homepage ? "" : `/${row.slug}`}
                    </p>
                    {row.seo_description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{row.seo_description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Ukládám…" : "Uložit změny"}
          </button>
        </div>
      </div>
    </div>
  );
}
