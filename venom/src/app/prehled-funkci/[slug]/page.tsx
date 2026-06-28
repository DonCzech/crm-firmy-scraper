import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, Check, ArrowLeft } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import { MODULES } from "../_modules";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = MODULES.find((x) => x.slug === slug);
  if (!m) return { title: "Modul nenalezen — Webero" };
  return {
    title: `${m.title} — Modul Webera`,
    description: m.perex,
    alternates: { canonical: `/prehled-funkci/${m.slug}` },
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { slug } = await params;
  const m = MODULES.find((x) => x.slug === slug);
  if (!m) notFound();

  const related = m.related
    .map((s) => MODULES.find((x) => x.slug === s))
    .filter(Boolean) as typeof MODULES;

  return (
    <main className="min-h-screen bg-white text-[#0a0a0a]">
      <PlatformHeader forceSolid />

      {/* Breadcrumb + Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fafafa] to-white pt-[110px] lg:pt-[130px]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(99,102,241,0.08), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12.5px] text-[#6b7280]">
            <Link href="/prehled-funkci" className="inline-flex items-center gap-1 transition hover:text-[#0a0a0a]">
              <ArrowLeft size={12} /> Moduly
            </Link>
            <span>/</span>
            <span className="text-[#0a0a0a]">{m.category}</span>
          </nav>

          <div className="mt-8 grid gap-10 pb-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14 lg:pb-24">
            <div>
              <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
                {m.category}
              </p>
              <h1
                className="font-sans font-semibold tracking-[-0.025em]"
                style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: "1.04" }}
              >
                {m.title}
              </h1>
              <p className="mt-5 text-[18px] font-medium leading-[1.4] text-[#0a0a0a]">{m.tagline}</p>
              <p className="mt-5 max-w-[520px] text-[15.5px] leading-[1.65] text-[#4b5563]">{m.perex}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/vybrat-design"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#111]"
                >
                  Vyzkoušet zdarma <ArrowRight size={15} />
                </Link>
                <Link
                  href="/cenik"
                  className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] transition hover:border-[#0a0a0a]"
                >
                  Kolik to stojí
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.20)]">
                <div className="aspect-[4/3] w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt={m.imageAlt} className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
              </div>
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl"
                style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.12), transparent)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bullets */}
      <section className="border-t border-[#ececec] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-10 lg:py-20">
          <h2 className="mb-10 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            Co modul umí
          </h2>
          <ul className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-[14.5px] text-[#0a0a0a]">
                <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#22c55e]/10 text-[#15803d]">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Long-form sections */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="space-y-16 lg:space-y-24">
            {m.sections.map((s, i) => (
              <article key={s.title} className="grid gap-8 lg:grid-cols-[160px_1fr] lg:gap-16">
                <div>
                  <span className="text-[36px] font-bold tracking-[-0.04em] text-[#e5e7eb]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="max-w-[720px]">
                  <h3
                    className="font-sans font-semibold tracking-[-0.02em]"
                    style={{ fontSize: "clamp(22px, 2.4vw, 32px)", lineHeight: "1.15" }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-5 text-[16px] leading-[1.7] text-[#374151]">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-28">
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            Použití v praxi
          </p>
          <h2
            className="mb-12 max-w-[720px] font-sans font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)", lineHeight: "1.08" }}
          >
            Kde modul {m.title.toLowerCase()} přináší největší užitek.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6">
            {m.useCases.map((u, i) => (
              <div key={u} className="flex gap-5 rounded-2xl border border-[#ececec] bg-[#fafafa] p-6 lg:p-7">
                <span className="text-[24px] font-bold tracking-[-0.03em] text-[#9ca3af]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15.5px] leading-[1.55] text-[#0a0a0a]">{u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#fafafa]">
        <div className="mx-auto max-w-[820px] px-6 py-20 lg:px-10 lg:py-28">
          <p className="mb-5 text-center text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
            Časté dotazy
          </p>
          <h2
            className="mb-12 text-center font-sans font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(26px, 3vw, 40px)", lineHeight: "1.1" }}
          >
            Na co se klienti nejvíc ptají.
          </h2>
          <div className="divide-y divide-[#ececec] border-y border-[#ececec] bg-white rounded-2xl px-6 sm:px-8">
            {m.faq.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{f.q}</h3>
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#6b7280] transition group-open:rotate-45 group-open:border-[#0a0a0a] group-open:text-[#0a0a0a]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-[14.5px] leading-[1.65] text-[#4b5563]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related modules */}
      {related.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-10 lg:py-28">
            <p className="mb-5 text-[12px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.18em" }}>
              Související moduly
            </p>
            <h2
              className="mb-10 font-sans font-semibold tracking-[-0.025em]"
              style={{ fontSize: "clamp(26px, 3vw, 40px)", lineHeight: "1.1" }}
            >
              Pokračujte v prohlížení.
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/prehled-funkci/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white transition-all hover:-translate-y-1 hover:border-[#0a0a0a]/20 hover:shadow-[0_30px_60px_-25px_rgba(0,0,0,0.15)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#fafafa]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.image} alt={r.imageAlt} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10.5px] font-semibold uppercase text-[#6366f1]" style={{ letterSpacing: "0.14em" }}>
                      {r.category}
                    </div>
                    <h3 className="mt-1.5 text-[16px] font-semibold tracking-[-0.01em] text-[#0a0a0a]">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-10 lg:py-32">
          <h2
            className="mx-auto max-w-[720px] font-sans font-semibold tracking-[-0.025em]"
            style={{ fontSize: "clamp(28px, 3.5vw, 46px)", lineHeight: "1.06" }}
          >
            Vyzkoušejte {m.title.toLowerCase()}<br /><span className="text-white/55">a {MODULES.length - 1} dalších modulů zdarma.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[520px] text-[15.5px] leading-[1.65] text-white/65">
            14 dní bez platební karty. Plný přístup ke všem modulům.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/vybrat-design" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14.5px] font-semibold text-[#0a0a0a] transition hover:bg-white/90">
              Vybrat design <ArrowRight size={16} />
            </Link>
            <Link href="/prehled-funkci" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:border-white/40 hover:bg-white/5">
              Všechny moduly
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}
