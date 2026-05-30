"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ContentBlock {
  type: string;
  text?: string;
  url?: string;
  alt?: string;
  items?: string[];
  ctaText?: string;
  ctaHref?: string;
}

interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  content: ContentBlock[];
  featured_image: string;
  author: string;
  category: string;
  tags: string;
  status: "draft" | "published";
  seo_title: string;
  seo_description: string;
  noindex: boolean;
  scheduled_at: string;
}

interface Props {
  tenantSlug: string;
  initial?: Partial<Omit<PostData, "content" | "tags">> & {
    id?: number;
    content?: ContentBlock[];
    tags?: string;
  };
  postSlug?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

const BLOCK_LABELS: Record<string, string> = {
  text: "Odstavec",
  heading: "Nadpis H2",
  image: "Obrázek",
  quote: "Citát",
  list: "Seznam",
  cta: "CTA tlačítko",
};

export function BlogPostEditor({ tenantSlug, initial, postSlug }: Props) {
  const router = useRouter();
  const isNew = !postSlug;

  const [data, setData] = useState<PostData>({
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    excerpt: initial?.excerpt ?? "",
    content: initial?.content ?? [{ type: "text", text: "" }],
    featured_image: initial?.featured_image ?? "",
    author: initial?.author ?? "",
    category: initial?.category ?? "",
    tags: initial?.tags ?? "",
    status: initial?.status ?? "draft",
    seo_title: initial?.seo_title ?? "",
    seo_description: initial?.seo_description ?? "",
    noindex: initial?.noindex ?? false,
    scheduled_at: initial?.scheduled_at ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(!isNew);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  function set<K extends keyof PostData>(key: K, value: PostData[K]) {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugManual) {
        next.slug = slugify(String(value));
        if (!next.seo_title) next.seo_title = String(value);
      }
      return next;
    });
  }

  function updateBlock(i: number, key: string, value: unknown) {
    setData((prev) => {
      const content = [...prev.content];
      content[i] = { ...content[i], [key]: value };
      return { ...prev, content };
    });
  }

  function addBlock(type: string) {
    const defaults: ContentBlock = { type };
    if (type === "list") defaults.items = [""];
    if (type === "cta") { defaults.ctaText = "Kontaktujte nás"; defaults.ctaHref = ""; }
    setData((prev) => ({ ...prev, content: [...prev.content, defaults] }));
  }

  function removeBlock(i: number) {
    setData((prev) => ({ ...prev, content: prev.content.filter((_, idx) => idx !== i) }));
  }

  function updateListItem(blockIdx: number, itemIdx: number, value: string) {
    setData((prev) => {
      const content = [...prev.content];
      const block = { ...content[blockIdx] };
      const items = [...(block.items ?? [])];
      items[itemIdx] = value;
      block.items = items;
      content[blockIdx] = block;
      return { ...prev, content };
    });
  }

  function addListItem(blockIdx: number) {
    setData((prev) => {
      const content = [...prev.content];
      const block = { ...content[blockIdx] };
      block.items = [...(block.items ?? []), ""];
      content[blockIdx] = block;
      return { ...prev, content };
    });
  }

  function removeListItem(blockIdx: number, itemIdx: number) {
    setData((prev) => {
      const content = [...prev.content];
      const block = { ...content[blockIdx] };
      block.items = (block.items ?? []).filter((_, i) => i !== itemIdx);
      content[blockIdx] = block;
      return { ...prev, content };
    });
  }

  const buildPayload = useCallback((status: "draft" | "published") => ({
    ...dataRef.current,
    status,
    tags: dataRef.current.tags.split(",").map((t) => t.trim()).filter(Boolean),
    scheduled_at: dataRef.current.scheduled_at || null,
  }), []);

  async function doSave(status: "draft" | "published", silent = false): Promise<boolean> {
    if (!silent) setSaving(true);
    setError("");
    const payload = buildPayload(status);
    const url = isNew ? `/api/demo/${tenantSlug}/blog` : `/api/demo/${tenantSlug}/blog/${postSlug}`;
    const method = isNew ? "POST" : "PATCH";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        if (!silent) setError(d.error ?? "Chyba při ukládání");
        return false;
      }
      return true;
    } catch {
      if (!silent) setError("Nepodařilo se uložit");
      return false;
    } finally {
      if (!silent) setSaving(false);
    }
  }

  async function handleSave(status: "draft" | "published") {
    const ok = await doSave(status, false);
    if (ok) {
      router.push(`/demo/${tenantSlug}/admin/blog`);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!postSlug || !confirm("Opravdu smazat tento článek?")) return;
    await fetch(`/api/demo/${tenantSlug}/blog/${postSlug}`, { method: "DELETE" });
    router.push(`/demo/${tenantSlug}/admin/blog`);
    router.refresh();
  }

  // Autosave for existing posts (not new — no slug yet)
  useEffect(() => {
    if (isNew) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const ok = await doSave(dataRef.current.status, true);
      if (ok) {
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 5000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">← Zpět</button>
          <span className="font-semibold">{isNew ? "Nový článek" : "Upravit článek"}</span>
          {autoSaved && <span className="text-green-400 text-xs">Automaticky uloženo ✓</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-xs px-2 py-1">
              Smazat
            </button>
          )}
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-xs font-semibold hover:bg-gray-600 disabled:opacity-60"
          >
            Uložit koncept
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Ukládám…" : "Publikovat"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

        {/* Title */}
        <div>
          <label className={labelCls}>Nadpis článku *</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
            className={`${inputCls} text-lg font-semibold`}
            placeholder="Název vašeho článku"
          />
        </div>

        {/* Slug */}
        <div>
          <label className={labelCls}>
            URL slug{" "}
            <button type="button" onClick={() => setSlugManual(!slugManual)} className="ml-1 text-indigo-500 font-normal">
              {slugManual ? "(auto)" : "(upravit)"}
            </button>
          </label>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
            className={`${inputCls} font-mono`}
            placeholder="url-clanku"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className={labelCls}>Perex (krátký popis)</label>
          <textarea
            value={data.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
            placeholder="Krátký popis článku (zobrazí se v přehledu)"
          />
        </div>

        {/* Featured image */}
        <div>
          <label className={labelCls}>Hlavní obrázek (URL)</label>
          <input type="url" value={data.featured_image} onChange={(e) => set("featured_image", e.target.value)} className={inputCls} placeholder="https://" />
        </div>

        {/* Content blocks */}
        <div>
          <label className={labelCls}>Obsah článku</label>
          <div className="space-y-3">
            {data.content.map((block, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">{BLOCK_LABELS[block.type] ?? block.type}</span>
                  <button onClick={() => removeBlock(i)} className="text-red-400 hover:text-red-600 text-xs">Smazat</button>
                </div>

                {(block.type === "text" || block.type === "heading" || block.type === "quote") && (
                  <textarea
                    value={block.text ?? ""}
                    onChange={(e) => updateBlock(i, "text", e.target.value)}
                    rows={block.type === "heading" ? 1 : 4}
                    className={`${inputCls} resize-none`}
                    placeholder={block.type === "heading" ? "Nadpis sekce" : block.type === "quote" ? "Citát" : "Text odstavce"}
                  />
                )}

                {block.type === "image" && (
                  <div className="space-y-2">
                    <input type="url" value={block.url ?? ""} onChange={(e) => updateBlock(i, "url", e.target.value)} className={inputCls} placeholder="URL obrázku" />
                    <input type="text" value={block.alt ?? ""} onChange={(e) => updateBlock(i, "alt", e.target.value)} className={inputCls} placeholder="Popis obrázku (alt text)" />
                  </div>
                )}

                {block.type === "list" && (
                  <div className="space-y-2">
                    {(block.items ?? []).map((item, j) => (
                      <div key={j} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateListItem(i, j, e.target.value)}
                          className={`${inputCls} flex-1`}
                          placeholder={`Položka ${j + 1}`}
                        />
                        <button onClick={() => removeListItem(i, j)} className="text-red-400 hover:text-red-600 text-xs px-2">✕</button>
                      </div>
                    ))}
                    <button onClick={() => addListItem(i)} className="text-xs text-indigo-600 hover:underline">+ Přidat položku</button>
                  </div>
                )}

                {block.type === "cta" && (
                  <div className="space-y-2">
                    <input type="text" value={block.ctaText ?? ""} onChange={(e) => updateBlock(i, "ctaText", e.target.value)} className={inputCls} placeholder="Text tlačítka (např. Kontaktujte nás)" />
                    <input type="url" value={block.ctaHref ?? ""} onChange={(e) => updateBlock(i, "ctaHref", e.target.value)} className={inputCls} placeholder="Odkaz (URL)" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {Object.keys(BLOCK_LABELS).map((type) => (
              <button key={type} onClick={() => addBlock(type)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                + {BLOCK_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Autor</label>
            <input type="text" value={data.author} onChange={(e) => set("author", e.target.value)} className={inputCls} placeholder="Jméno autora" />
          </div>
          <div>
            <label className={labelCls}>Kategorie</label>
            <input type="text" value={data.category} onChange={(e) => set("category", e.target.value)} className={inputCls} placeholder="Tipy, Aktuality..." />
          </div>
        </div>

        <div>
          <label className={labelCls}>Štítky (oddělené čárkou)</label>
          <input type="text" value={data.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="seo, tipy, novinky" />
        </div>

        {/* Scheduled publish */}
        <div>
          <label className={labelCls}>Naplánované publikování (volitelné)</label>
          <input
            type="datetime-local"
            value={data.scheduled_at}
            onChange={(e) => set("scheduled_at", e.target.value)}
            className={inputCls}
          />
          <p className="text-xs text-gray-400 mt-1">Nechte prázdné pro okamžité publikování nebo uložení konceptu.</p>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <p className="text-sm font-bold text-gray-800">SEO nastavení</p>
          <div>
            <label className={labelCls}>SEO title ({data.seo_title.length}/60)</label>
            <input
              type="text"
              value={data.seo_title}
              onChange={(e) => set("seo_title", e.target.value)}
              className={`${inputCls} ${data.seo_title.length > 60 ? "border-orange-400" : ""}`}
              placeholder={data.title || "SEO title"}
            />
          </div>
          <div>
            <label className={labelCls}>SEO description ({data.seo_description.length}/160)</label>
            <textarea
              value={data.seo_description}
              onChange={(e) => set("seo_description", e.target.value)}
              rows={2}
              className={`${inputCls} resize-none ${data.seo_description.length > 160 ? "border-orange-400" : ""}`}
              placeholder={data.excerpt || "Popis článku pro vyhledávače"}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.noindex}
              onChange={(e) => set("noindex", e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Nezařazovat do vyhledávačů (noindex)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
