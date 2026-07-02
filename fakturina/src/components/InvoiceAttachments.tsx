"use client";
import { useState, useRef } from "react";
import { Paperclip, Upload, Trash2, FileText, Loader2 } from "lucide-react";

interface Attachment {
  id: string; filename: string; file_url: string; file_size: number;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function InvoiceAttachments({ invoiceId, initialAttachments }: {
  invoiceId: string;
  initialAttachments: Attachment[];
}) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/invoices/${invoiceId}/attachments`, { method: "POST", body: fd });
      if (res.ok) {
        const att = await res.json();
        setAttachments((p) => [att, ...p]);
      } else {
        const d = await res.json();
        setError(d.error ?? "Chyba při nahrávání");
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: string) {
    await fetch(`/api/invoices/${invoiceId}/attachments?attachId=${id}`, { method: "DELETE" });
    setAttachments((p) => p.filter((a) => a.id !== id));
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Přílohy</h3>
          {attachments.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{attachments.length}</span>
          )}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Nahrát
          <input ref={inputRef} type="file" multiple className="hidden"
            onChange={(e) => handleUpload(e.target.files)} />
        </label>
      </div>

      {error && <div className="text-xs text-red-500">{error}</div>}

      {attachments.length === 0 ? (
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        >
          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">Přetáhněte soubory nebo klikněte pro výběr</p>
          <p className="text-xs text-slate-300 mt-1">Max. 10 MB na soubor</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl group">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <a href={att.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:underline truncate block">
                  {att.filename}
                </a>
                <div className="text-xs text-slate-400">{fmtSize(att.file_size)}</div>
              </div>
              <button onClick={() => handleDelete(att.id)}
                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div
            className="text-xs text-slate-400 text-center cursor-pointer hover:text-indigo-600 py-1"
            onClick={() => inputRef.current?.click()}
          >
            + Přidat další přílohu
          </div>
        </div>
      )}
    </div>
  );
}
