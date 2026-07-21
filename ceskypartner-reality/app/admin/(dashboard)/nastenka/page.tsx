"use client";

import { useState } from "react";
import { Pin, PinOff, Trash2, Send, MessageSquare } from "lucide-react";
import { useApi, apiPost, apiPatch, apiDelete } from "@/lib/useApi";

type Message = {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
};

export default function NastenkaPage() {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const { data, loading, refetch } = useApi<Message[]>("/api/admin/board");
  const messages = data || [];

  async function handleSend() {
    if (!content.trim()) return;
    setSending(true);
    const { error } = await apiPost("/api/admin/board", { content });
    setSending(false);
    if (error) { alert("Chyba: " + error); return; }
    setContent("");
    refetch();
  }

  async function togglePin(m: Message) {
    await apiPatch(`/api/admin/board/${m.id}`, { pinned: !m.pinned });
    refetch();
  }

  async function handleDelete(id: string) {
    if (!confirm("Opravdu smazat zpravu?")) return;
    const { error } = await apiDelete(`/api/admin/board/${id}`);
    if (error) alert(error);
    refetch();
  }

  return (
    <div className="mx-auto max-w-[760px] space-y-6">
      <div>
        <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--a-text)]">Nastenka</h2>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">Interni vzkazy pro cely tym</p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-3">
          <textarea
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[var(--a-border)] bg-transparent px-4 py-3 text-[13px] text-[var(--a-text)] outline-none transition-all duration-300 placeholder:text-[var(--a-text-3)] focus:border-[var(--a-bronze)]/30"
            placeholder="Napiste vzkaz tymu..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend(); }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            className="flex h-fit items-center gap-2 self-end rounded-xl bg-gradient-to-r from-[var(--a-bronze)] to-[#8a6d43] px-4 py-2.5 text-[12px] font-semibold text-[#0a0a0b] transition-all hover:shadow-lg disabled:opacity-50"
          >
            <Send size={13} /> Odeslat
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--a-bronze)] border-t-transparent" />
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <MessageSquare size={28} className="text-[var(--a-text-3)]" />
          <p className="mt-3 text-[14px] font-semibold text-[var(--a-text)]">Zadne vzkazy</p>
          <p className="mt-1 text-[12px] text-[var(--a-text-3)]">Napiste prvni vzkaz na nastenku</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`glass-card rounded-2xl p-4 ${m.pinned ? "ring-1 ring-[var(--a-bronze)]/30" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--a-bronze-glow)] text-[11px] font-semibold text-[var(--a-bronze)]">
                    {m.author.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-[var(--a-text)]">{m.author.name}</p>
                    <p className="text-[10.5px] text-[var(--a-text-3)]">{new Date(m.createdAt).toLocaleString("cs-CZ")}</p>
                  </div>
                  {m.pinned && <Pin size={12} className="text-[var(--a-bronze)]" />}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePin(m)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)]" title={m.pinned ? "Odepnout" : "Pripnout"}>
                    {m.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--a-text-3)] transition-all hover:bg-red-500/10 hover:text-red-400" title="Smazat">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--a-text-2)]">{m.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
