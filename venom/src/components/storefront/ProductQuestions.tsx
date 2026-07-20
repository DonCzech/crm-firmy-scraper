"use client";

/** Modul „Diskuze u produktů“ — otázky a odpovědi pod produktem. */

import { useCallback, useEffect, useState } from "react";

interface Question {
  id: number;
  author_name: string;
  question: string;
  answer: string | null;
  created_at: string;
}

export function ProductQuestions({ tenantSlug, productId }: { tenantSlug: string; productId: number }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const base = `/api/demo/${tenantSlug}/shop/questions`;

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${base}?product_id=${productId}`);
      if (!res.ok) return;
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch { /* offline — sekce zůstane prázdná */ }
  }, [base, productId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, author_name: name, question: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Otázku se nepodařilo odeslat");
      setName("");
      setText("");
      setOpen(false);
      setSent(true);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Otázku se nepodařilo odeslat");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[22px] font-extrabold tracking-tight text-neutral-950">
          Diskuze {questions.length > 0 && <span className="font-semibold text-neutral-400">({questions.length})</span>}
        </h2>
        {!open && (
          <button onClick={() => { setOpen(true); setSent(false); }}
            className="rounded-lg border border-neutral-900 px-4 py-2 text-[13px] font-bold text-neutral-900 transition hover:bg-neutral-900 hover:text-white">
            Zeptat se na produkt
          </button>
        )}
      </div>

      {sent && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          Děkujeme, vaše otázka byla odeslána. Odpovíme co nejdříve.
        </p>
      )}

      {open && (
        <form onSubmit={submit} className="mt-4 max-w-[560px] space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-neutral-600">Vaše jméno *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] outline-none focus:border-neutral-900" />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-neutral-600">Otázka *</label>
            <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[14px] outline-none focus:border-neutral-900" />
          </div>
          {error && <p className="text-[12.5px] text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy}
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-[13px] font-bold text-white transition hover:bg-neutral-700 disabled:opacity-50">
              {busy ? "Odesílám…" : "Odeslat otázku"}
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2.5 text-[13px] font-semibold text-neutral-500 hover:text-neutral-950">
              Zrušit
            </button>
          </div>
        </form>
      )}

      {questions.length > 0 ? (
        <ul className="mt-5 max-w-[860px] space-y-4">
          {questions.map((q) => (
            <li key={q.id} className="rounded-2xl border border-neutral-100 p-5">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-[11px] font-extrabold text-white">
                  {q.author_name.slice(0, 1).toUpperCase()}
                </span>
                <span className="font-bold text-neutral-900">{q.author_name}</span>
                <span className="text-neutral-400">{new Date(q.created_at).toLocaleDateString("cs-CZ")}</span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-800">{q.question}</p>
              {q.answer && (
                <div className="mt-3 rounded-xl bg-neutral-50 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-400">Odpověď obchodu</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-neutral-700">{q.answer}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        !open && <p className="mt-4 text-[14px] text-neutral-400">Zatím žádné otázky. Zeptejte se jako první.</p>
      )}
    </section>
  );
}
