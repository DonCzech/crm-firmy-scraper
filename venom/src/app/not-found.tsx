import Link from "next/link";
import type { Metadata } from "next";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";

export const metadata: Metadata = {
  title: "Stránka nenalezena — Webero",
  description: "Tato stránka neexistuje nebo byla přesunutá.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <PlatformHeader forceSolid />
      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-[#fafafa] pt-[64px] lg:pt-[72px]">
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
        {/* Indigo glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 50% 30%, rgba(99,102,241,0.12), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[680px] px-6 py-20 text-center sm:py-28 lg:py-32">
          <p
            className="mb-4 text-[12px] font-semibold uppercase text-[#6366f1]"
            style={{ letterSpacing: "0.18em" }}
          >
            Chyba 404
          </p>

          <h1
            className="font-sans font-bold tracking-[-0.05em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(96px, 18vw, 220px)", lineHeight: "0.85" }}
          >
            404
          </h1>

          <h2
            className="mt-6 font-sans font-semibold tracking-[-0.025em] text-[#0a0a0a]"
            style={{ fontSize: "clamp(24px, 3vw, 36px)", lineHeight: "1.1" }}
          >
            Stránka nenalezena.
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[15.5px] leading-[1.6] text-[#555]">
            Adresa neexistuje, byla přesunutá, nebo prošla typo v URL.
            Zkuste se vrátit na hlavní stránku nebo si vyberte šablonu.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/"
              className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#0a0a0a] px-8 text-[15px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition hover:bg-[#1a1a1a]"
            >
              ← Zpět na homepage
            </Link>
            <Link
              href="/vybrat-design"
              className="inline-flex h-[52px] items-center justify-center rounded-full border border-[#e5e5e5] bg-white px-8 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]"
            >
              Prohlédnout šablony →
            </Link>
          </div>

          <p className="mt-7 text-[13px] text-[#888]">
            Hledali jste něco konkrétního? Napište nám na{" "}
            <a href="mailto:podpora@webero.co" className="font-semibold text-[#6366f1] hover:underline">
              podpora@webero.co
            </a>
          </p>
        </div>
      </main>
      <PlatformFooter />
    </>
  );
}
