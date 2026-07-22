"use client";

import { useState } from "react";

type NewsletterFormCopy = {
  placeholder: string;
  submit: string;
  loading: string;
  successTitle: string;
  successText: string;
  error: string;
};

export function NewsletterForm({
  copy = {
    placeholder: "vas@email.cz",
    submit: "Odeslat",
    loading: "Posílám...",
    successTitle: "Hotovo!",
    successText: "Šablony posíláme na váš e-mail.",
    error: "Něco se nepovedlo. Zkuste to znovu.",
  },
}: {
  copy?: NewsletterFormCopy;
} = {}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 px-5 py-4 text-white">
        <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#22c55e] text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
        <div>
          <div className="text-[14px] font-semibold">{copy.successTitle}</div>
          <div className="text-[12.5px] text-white/65">{copy.successText}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/35"
            aria-hidden
          >
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M22 7l-10 6L2 7" />
          </svg>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-full border border-white/15 bg-white/[0.06] py-3.5 pl-12 pr-5 text-[14.5px] text-white placeholder-white/40 outline-none transition focus:border-white/45 focus:bg-white/[0.09] focus:ring-2 focus:ring-white/10"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] transition hover:bg-white/92 active:scale-[0.98] disabled:opacity-60"
        >
          {status === "loading" ? copy.loading : copy.submit}
          {status !== "loading" && (
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      {status === "err" && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-[#fca5a5]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {copy.error}
        </p>
      )}
    </div>
  );
}
