"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Chybu nahlásíme na server, ať se objeví v provozních lozích
  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: window.location.href,
      }),
    }).catch(() => {});
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center bg-paper text-ink">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-24 text-center">
        <TriangleAlert size={40} strokeWidth={1.1} className="text-bronze" />
        <p className="eyebrow mt-8 text-muted">Neočekávaná chyba</p>
        <h1 className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
          Něco se pokazilo
        </h1>
        <p className="mt-5 text-[15px] leading-[1.75] text-muted">
          Omlouváme se — na opravě pracujeme. Zkuste stránku načíst znovu,
          nebo se vraťte na úvodní stránku.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 bg-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-300 hover:bg-bronze-deep"
          >
            <RotateCcw size={14} strokeWidth={1.8} />
            Zkusit znovu
          </button>
          <a
            href="/"
            className="border border-ink px-8 py-3.5 text-[12.5px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-ink hover:text-paper"
          >
            Zpět na úvod
          </a>
        </div>
      </div>
    </main>
  );
}
