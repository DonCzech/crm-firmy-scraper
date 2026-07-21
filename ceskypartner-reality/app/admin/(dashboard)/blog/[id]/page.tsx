"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  Plus,
  X,
  Globe,
  Loader2,
} from "lucide-react";
import { useApi, apiPatch } from "@/lib/useApi";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">{label}</label>
      {children}
    </div>
  );
}

type BlogPostDetail = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  tags: string[];
  metaTitle: string | null;
  metaDesc: string | null;
  author: { id: string; name: string } | null;
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data, loading } = useApi<BlogPostDetail>(`/api/admin/blog/${id}`);
  const [initialized, setInitialized] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt || "");
      setCoverImage(data.coverImage || "");
      setTags(data.tags || []);
      setMetaTitle(data.metaTitle || "");
      setMetaDesc(data.metaDesc || "");
      setStatus(data.status as "DRAFT" | "PUBLISHED");
      setInitialized(true);
    }
  }, [data, initialized]);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const { error } = await apiPatch(`/api/admin/blog/${id}`, {
      title, content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      metaTitle: metaTitle || null,
      metaDesc: metaDesc || null,
      tags, status,
    });
    setSaving(false);
    if (error) { alert("Chyba: " + error); return; }
    router.push("/admin/blog");
  }

  if (loading || !initialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[var(--a-bronze)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-3)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--a-text)]">Upravit clanek</h1>
            <p className="text-[12.5px] text-[var(--a-text-3)]">{data?.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12.5px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Ukladam..." : "Ulozit"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)] outline-none placeholder:text-[var(--a-text-3)]" />
          <TiptapEditor content={content} onChange={setContent} placeholder="Obsah clanku..." />
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-[var(--a-text)]">Stav</h3>
            <div className="flex gap-2">
              <button onClick={() => setStatus("DRAFT")} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all duration-300 ${status === "DRAFT" ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Koncept</button>
              <button onClick={() => setStatus("PUBLISHED")} className={`flex-1 rounded-xl border px-3 py-2 text-[12px] font-semibold transition-all duration-300 ${status === "PUBLISHED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-[var(--a-border)] text-[var(--a-text-3)]"}`}>Publikovat</button>
            </div>
          </div>

          {/* Cover image */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-[var(--a-text)]">Titulni obrazek</h3>
            {coverImage ? (
              <div className="relative aspect-video overflow-hidden rounded-xl bg-[var(--a-surface-2)]">
                <img src={coverImage} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setCoverImage("")} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => { const url = window.prompt("URL titulniho obrazku:"); if (url) setCoverImage(url); }} className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--a-border)] py-8 transition-all duration-300 hover:border-[var(--a-bronze)]">
                <Upload size={20} className="text-[var(--a-text-3)]" />
                <span className="mt-2 text-[12px] text-[var(--a-text-3)]">Nahrat nebo vybrat</span>
              </button>
            )}
          </div>

          {/* Excerpt */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-[var(--a-text)]">Kratky popis</h3>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} placeholder="Kratky popis clanku..." className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" />
          </div>

          {/* Tags */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="mb-3 text-[13px] font-semibold text-[var(--a-text)]">Tagy</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-[var(--a-bronze-glow)] px-2.5 py-1 text-[11px] font-semibold text-[var(--a-bronze)]">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-[var(--a-text)]"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Pridat tag..." className={inputClass} />
              <button onClick={addTag} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--a-border)] text-[var(--a-text-3)] transition-all hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"><Plus size={14} /></button>
            </div>
          </div>

          {/* SEO */}
          <div className="glass-card rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={13} className="text-[var(--a-bronze)]" />
              <h3 className="text-[13px] font-semibold text-[var(--a-text)]">SEO</h3>
            </div>
            <div className="space-y-3">
              <Field label="Meta title"><input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} placeholder={title || "Nazev clanku"} /></Field>
              <Field label="Meta description"><textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} className="w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30" placeholder={excerpt || "Popis pro vyhledavace..."} /></Field>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--a-border)] px-6 py-4 backdrop-blur-xl lg:left-[264px]" style={{ background: "color-mix(in srgb, var(--a-bg) 90%, transparent)" }}>
        <div className="mx-auto flex max-w-[960px] items-center justify-between">
          <p className="text-[12px] text-[var(--a-text-3)]">{content ? `${content.replace(/<[^>]*>/g, "").length} znaku` : "Prazdny clanek"}</p>
          <div className="flex gap-2">
            <Link href="/admin/blog" className="rounded-xl border border-[var(--a-border)] px-5 py-2.5 text-[12.5px] font-semibold text-[var(--a-text-2)] transition-all duration-300 hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]">Zrusit</Link>
            <button onClick={handleSave} disabled={saving || !title.trim()} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-5 py-2.5 text-[12.5px] font-semibold text-[#0a0a0b] shadow-lg shadow-[var(--a-bronze-glow)] transition-all duration-300 hover:shadow-xl disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Ukladam..." : "Ulozit clanek"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
