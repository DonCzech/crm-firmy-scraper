"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, Trash2, FileText, Download, Search } from "lucide-react";
import { useApi, apiDelete } from "@/lib/useApi";

type Doc = {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  category: string;
  note: string | null;
  createdAt: string;
  uploader: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
  listing: { id: string; title: string } | null;
};

const CATEGORY_MAP: Record<string, string> = {
  CONTRACT: "Smlouvy",
  PROTOCOL: "Protokoly",
  POWER_OF_ATTORNEY: "Plne moci",
  LV: "Listy vlastnictvi",
  MARKETING: "Marketing",
  OTHER: "Ostatni",
};

const inputClass = "h-10 w-full rounded-xl border border-[var(--a-border)] bg-transparent px-4 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30";

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DokumentyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("");
  const [uploadCategory, setUploadCategory] = useState("OTHER");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const query = new URLSearchParams();
  if (category) query.set("category", category);
  if (search) query.set("q", search);
  const { data, loading, refetch } = useApi<Doc[]>(`/api/admin/documents?${query.toString()}`);
  const docs = data || [];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", uploadCategory);
      await fetch("/api/admin/documents", { method: "POST", body: fd });
    }
    setUploading(false);
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat dokument?")) return;
    await apiDelete(`/api/admin/documents/${id}`);
    refetch();
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Dokumenty</h2>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Knihovna firemnich souboru — smlouvy, protokoly, listy vlastnictvi</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`glass-card flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-all duration-300 ${
          dragOver ? "border-[var(--a-bronze)] bg-[var(--a-bronze-glow)]" : "border-[var(--a-border)]"
        }`}
      >
        <Upload size={24} className={dragOver ? "text-[var(--a-bronze)]" : "text-[var(--a-text-3)]"} />
        <p className="mt-3 text-[13px] text-[var(--a-text)]">
          Pretahnete soubory nebo{" "}
          <button type="button" onClick={() => fileRef.current?.click()} className="font-semibold text-[var(--a-bronze)] underline-offset-2 hover:underline">
            vyberte z disku
          </button>
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-[var(--a-text-3)]">Kategorie:</span>
          {Object.entries(CATEGORY_MAP).map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setUploadCategory(k)}
              className={`rounded-full border px-3 py-1 text-[10.5px] font-semibold transition-all duration-300 ${
                uploadCategory === k
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {uploading && <p className="mt-3 text-[12px] text-[var(--a-bronze)]">Nahravam...</p>}
        <input ref={fileRef} type="file" multiple className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
          <Search size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--a-text-3)]" />
          <input type="text" className={`${inputClass} pl-10`} placeholder="Hledat dokument..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[["", "Vse"], ...Object.entries(CATEGORY_MAP)].map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => setCategory(k)}
              className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition-all duration-300 ${
                category === k
                  ? "border-[var(--a-bronze)]/30 bg-[var(--a-bronze-glow)] text-[var(--a-bronze)]"
                  : "border-[var(--a-border)] text-[var(--a-text-3)] hover:border-[var(--a-border-hover)] hover:text-[var(--a-text)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : docs.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <FileText size={28} className="text-[var(--a-text-3)]" />
          <p className="mt-3 text-[14px] font-semibold text-[var(--a-text)]">Zadne dokumenty</p>
        </div>
      ) : (
        <div className="glass-card overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[680px] text-left">
            <thead>
              <tr className="border-b border-[var(--a-border)]">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Dokument</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Kategorie</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Velikost</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Nahral</th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--a-text-3)]">Datum</th>
                <th className="w-24 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--a-border)]">
              {docs.map((d) => (
                <tr key={d.id} className="hover-row transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="shrink-0 text-[var(--a-bronze)]" />
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--a-text)]">{d.name}</p>
                        {(d.deal || d.listing) && <p className="text-[10.5px] text-[var(--a-text-3)]">{d.deal?.title || d.listing?.title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--a-text-2)]">{CATEGORY_MAP[d.category] || d.category}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--a-text-3)]">{fmtSize(d.size)}</td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--a-text-2)]">{d.uploader?.name || "-"}</td>
                  <td className="px-5 py-3.5 text-[11.5px] text-[var(--a-text-3)]">{new Date(d.createdAt).toLocaleDateString("cs-CZ")}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1.5">
                      <a href={d.url} target="_blank" rel="noreferrer" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]" title="Stahnout">
                        <Download size={12} />
                      </a>
                      <button onClick={() => handleDelete(d.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-red-500/10 hover:text-red-400" title="Smazat">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
