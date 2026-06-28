"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="cs">
      <body>
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fafafa]">
          {/* Decorative grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(40% 50% at 50% 30%, rgba(239,68,68,0.10), transparent 70%)",
            }}
          />

          <div className="relative mx-auto max-w-[680px] px-6 py-20 text-center">
            <p
              className="mb-4 text-[12px] font-semibold uppercase text-[#ef4444]"
              style={{ letterSpacing: "0.18em" }}
            >
              Chyba 500
            </p>

            <h1
              className="font-sans font-bold tracking-[-0.05em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(96px, 18vw, 220px)", lineHeight: "0.85" }}
            >
              500
            </h1>

            <h2
              className="mt-6 font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: "1.1" }}
            >
              Něco se nepovedlo.
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[15.5px] leading-[1.6] text-[#555]">
              Server narazil na neočekávanou chybu. Zkuste stránku obnovit
              nebo se vraťte na homepage. Mezitím ji opravujeme.
            </p>

            {error.digest && (
              <p className="mx-auto mt-5 inline-block rounded-md bg-white px-3 py-1.5 font-mono text-[11px] text-[#888] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
                Reference: {error.digest}
              </p>
            )}

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button
                onClick={reset}
                className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#0a0a0a] px-8 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition hover:bg-[#1a1a1a]"
              >
                Zkusit znovu
              </button>
              <Link
                href="/"
                className="inline-flex h-[52px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white px-8 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]"
              >
                ← Zpět na homepage
              </Link>
            </div>

            <p className="mt-7 text-[13px] text-[#888]">
              Problém přetrvává? Napište nám na{" "}
              <a href="mailto:podpora@webero.co" className="font-semibold text-[#6366f1] hover:underline">
                podpora@webero.co
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
