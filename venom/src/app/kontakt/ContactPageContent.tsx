"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Mail, Phone, Clock, Sparkles } from "lucide-react";
import { PlatformHeader } from "@/components/PlatformHeader";
import { PlatformFooter } from "@/components/PlatformFooter";
import type { PlatformLocale } from "@/lib/platform-i18n";
import { platformPath } from "@/lib/platform-i18n";

const SERIF = "var(--font-instrument-serif), 'Instrument Serif', Georgia, serif";

const COPY = {
  cs: {
    eyebrow: "Kontakt",
    titleA: "Pojďme to",
    titleEm: "postavit spolu.",
    sub: "Web, e-shop, aplikace na míru, nebo si jen nevíte rady s výběrem? Napište nám cokoliv — ozveme se do 24 hodin s návrhem řešení i cenou.",
    steps: [
      { t: "Napíšete nám", d: "Stačí pár vět o tom, co potřebujete." },
      { t: "Ozveme se do 24 h", d: "S návrhem řešení, termínem a orientační cenou." },
      { t: "Postavíme to", d: "Sami na platformě, nebo kompletně za vás." },
    ],
    contacts: [
      { icon: "mail", label: "E-mail", value: "podpora@webero.co", href: "mailto:podpora@webero.co" },
      { icon: "phone", label: "Telefon", value: "+420 776 123 456", href: "tel:+420776123456" },
      { icon: "clock", label: "Dostupnost", value: "Po–Pá 9:00–17:00", href: null },
    ],
    form: {
      heading: "Poptávka nezávazně",
      note: "Bez závazku. Odpovídáme do 24 hodin.",
      projectLabel: "Co potřebujete?",
      projectOptions: ["Webové stránky", "E-shop", "Web od AI Builderu", "Aplikace / SaaS na míru", "Zatím nevím – poraďte"],
      nameLabel: "Jméno a příjmení",
      namePh: "Jan Novák",
      emailLabel: "E-mail",
      emailPh: "vas@email.cz",
      companyLabel: "Firma",
      companyPh: "Nepovinné",
      phoneLabel: "Telefon",
      phonePh: "Nepovinné",
      budgetLabel: "Orientační rozpočet",
      budgetOptions: ["Do 25 000 Kč", "25 – 75 000 Kč", "75 – 200 000 Kč", "200 000 Kč+", "Nevím / poraďte"],
      goalLabel: "Popište projekt",
      goalPh: "Co děláte, čeho chcete dosáhnout, na kdy to potřebujete…",
      submit: "Odeslat poptávku",
      submitting: "Odesílám…",
      requiredHint: "Vyplňte prosím jméno, e-mail a popis projektu (alespoň pár vět).",
      successTitle: "Máme to! Děkujeme.",
      successText: "Poptávka dorazila. Ozveme se vám do 24 hodin na uvedený e-mail.",
      successCta: "Zpět na produkty",
      errorGeneric: "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.",
    },
  },
  en: {
    eyebrow: "Contact",
    titleA: "Let's build it",
    titleEm: "together.",
    sub: "A website, an e-shop, a custom app — or just not sure what to pick? Tell us anything. We reply within 24 hours with a proposed solution and a price.",
    steps: [
      { t: "You write to us", d: "Just a few sentences about what you need." },
      { t: "We reply within 24h", d: "With a solution, a timeline, and a ballpark price." },
      { t: "We build it", d: "You on the platform, or fully done by us." },
    ],
    contacts: [
      { icon: "mail", label: "Email", value: "podpora@webero.co", href: "mailto:podpora@webero.co" },
      { icon: "phone", label: "Phone", value: "+420 776 123 456", href: "tel:+420776123456" },
      { icon: "clock", label: "Availability", value: "Mon–Fri 9:00–17:00", href: null },
    ],
    form: {
      heading: "Request a quote",
      note: "No commitment. We reply within 24 hours.",
      projectLabel: "What do you need?",
      projectOptions: ["A website", "An e-shop", "A site from the AI Builder", "Custom app / SaaS", "Not sure yet – advise me"],
      nameLabel: "Full name",
      namePh: "John Smith",
      emailLabel: "Email",
      emailPh: "you@example.com",
      companyLabel: "Company",
      companyPh: "Optional",
      phoneLabel: "Phone",
      phonePh: "Optional",
      budgetLabel: "Ballpark budget",
      budgetOptions: ["Up to €1,000", "€1,000 – 3,000", "€3,000 – 8,000", "€8,000+", "Not sure / advise me"],
      goalLabel: "Describe your project",
      goalPh: "What you do, what you want to achieve, when you need it…",
      submit: "Send request",
      submitting: "Sending…",
      requiredHint: "Please fill in your name, email, and a short project description.",
      successTitle: "Got it! Thank you.",
      successText: "Your request has arrived. We'll get back to you within 24 hours by email.",
      successCta: "Back to products",
      errorGeneric: "We couldn't send your request. Please try again.",
    },
  },
} as const;

const ICONS = { mail: Mail, phone: Phone, clock: Clock } as const;

export function ContactPageContent({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const c = COPY[locale];
  const f = c.form;

  const [projectType, setProjectType] = useState<string>(f.projectOptions[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState<string>(f.budgetOptions[0]);
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length >= 2 && /.+@.+\..+/.test(email) && goal.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) { setError(f.requiredHint); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/onboarding/agency-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType, goal, budget, name, email, company: company || undefined, phone: phone || undefined, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? f.errorGeneric);
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError(f.errorGeneric);
      setStatus("idle");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] text-[#0a0a0a] outline-none transition placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/12";
  const labelCls = "mb-1.5 block text-[13px] font-semibold text-[#374151]";

  return (
    <main className="min-h-screen bg-[#151633] text-white">
      <style>{`
        @keyframes webero-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { *[style*="webero-"] { animation: none !important; } }
      `}</style>

      <PlatformHeader forceSolid locale={locale} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.9]"
             style={{ background: "radial-gradient(55% 55% at 16% -6%, rgba(129,140,248,0.55), transparent 60%), radial-gradient(50% 52% at 94% 8%, rgba(167,139,250,0.45), transparent 60%), radial-gradient(46% 55% at 58% 34%, rgba(56,189,248,0.24), transparent 62%)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(199,210,254,0.5), transparent)" }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
             style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(75% 60% at 30% 10%, #000, transparent 82%)", WebkitMaskImage: "radial-gradient(75% 60% at 30% 10%, #000, transparent 82%)" }} />

        <div className="relative mx-auto grid max-w-[1180px] gap-14 px-6 pt-[128px] pb-24 lg:grid-cols-[1fr_minmax(440px,520px)] lg:gap-16 lg:px-10 lg:pt-[160px] lg:pb-32">

          {/* Left — pitch + contact info */}
          <div style={{ animation: "webero-rise .6s ease both" }}>
            <p className="text-[12px] font-semibold uppercase text-[#a5b4fc]" style={{ letterSpacing: "0.22em" }}>{c.eyebrow}</p>
            <h1 className="mt-5 font-sans font-semibold tracking-[-0.035em] text-white" style={{ fontSize: "clamp(40px, 5.2vw, 72px)", lineHeight: "0.98" }}>
              {c.titleA}<br />
              <span className="italic" style={{ fontFamily: SERIF, fontWeight: 400, color: "#c7d2fe" }}>{c.titleEm}</span>
            </h1>
            <p className="mt-7 max-w-[460px] text-[16.5px] leading-[1.6] text-white/70">{c.sub}</p>

            <ol className="mt-10 space-y-4">
              {c.steps.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-white/10 text-[13px] font-bold text-[#c7d2fe]">{i + 1}</span>
                  <div>
                    <div className="text-[15px] font-semibold text-white">{s.t}</div>
                    <div className="text-[14px] leading-[1.5] text-white/60">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {c.contacts.map((ct) => {
                const Icon = ICONS[ct.icon as keyof typeof ICONS];
                const inner = (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-white/20">
                    <Icon size={16} className="text-[#a5b4fc]" />
                    <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/45">{ct.label}</div>
                    <div className="mt-1 text-[14px] font-medium text-white/90">{ct.value}</div>
                  </div>
                );
                return ct.href ? <a key={ct.label} href={ct.href}>{inner}</a> : <div key={ct.label}>{inner}</div>;
              })}
            </div>
          </div>

          {/* Right — form card */}
          <div style={{ animation: "webero-rise .7s ease .12s both" }}>
            <div className="rounded-[26px] border border-[#ececec] bg-white p-7 text-[#0a0a0a] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.6)] lg:p-9">
              {status === "done" ? (
                <div className="flex min-h-[440px] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[#22c55e]/12 text-[#15803d]">
                    <Check size={30} strokeWidth={3} />
                  </span>
                  <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.02em]">{f.successTitle}</h2>
                  <p className="mt-3 max-w-[340px] text-[15px] leading-[1.6] text-[#4b5563]">{f.successText}</p>
                  <Link href={platformPath("/produkty-a-reseni", locale)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14.5px] font-semibold text-white transition hover:bg-[#0a0a0a]/85">
                    {f.successCta} <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles size={15} className="text-[#6366f1]" />
                    <h2 className="text-[19px] font-semibold tracking-[-0.015em]">{f.heading}</h2>
                  </div>
                  <p className="mb-6 text-[13px] text-[#6b7280]">{f.note}</p>

                  <div className="space-y-4">
                    <div>
                      <label className={labelCls} htmlFor="c-project">{f.projectLabel}</label>
                      <select id="c-project" value={projectType} onChange={(e) => setProjectType(e.target.value)} className={inputCls}>
                        {f.projectOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls} htmlFor="c-name">{f.nameLabel} *</label>
                        <input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={f.namePh} className={inputCls} autoComplete="name" />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="c-email">{f.emailLabel} *</label>
                        <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={f.emailPh} className={inputCls} autoComplete="email" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls} htmlFor="c-company">{f.companyLabel}</label>
                        <input id="c-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={f.companyPh} className={inputCls} autoComplete="organization" />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="c-phone">{f.phoneLabel}</label>
                        <input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={f.phonePh} className={inputCls} autoComplete="tel" />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls} htmlFor="c-budget">{f.budgetLabel}</label>
                      <select id="c-budget" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls}>
                        {f.budgetOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls} htmlFor="c-goal">{f.goalLabel} *</label>
                      <textarea id="c-goal" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={f.goalPh} rows={4} className={`${inputCls} resize-none`} />
                    </div>
                  </div>

                  {error && <p className="mt-4 rounded-xl bg-[#fef2f2] px-4 py-3 text-[13.5px] font-medium text-[#b91c1c]">{error}</p>}

                  <button type="submit" disabled={status === "sending"}
                          className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4f46e5] px-6 py-4 text-[15px] font-semibold text-white transition hover:bg-[#4338ca] disabled:opacity-60">
                    {status === "sending" ? f.submitting : f.submit}
                    {status !== "sending" && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
                  </button>
                </form>
              )}
            </div>

            <p className="mt-4 text-center text-[12.5px] text-white/45">
              <a href="mailto:podpora@webero.co" className="inline-flex items-center gap-1 underline-offset-4 transition hover:text-white/75 hover:underline">
                podpora@webero.co <ArrowUpRight size={12} />
              </a>
            </p>
          </div>
        </div>
      </section>

      <PlatformFooter locale={locale} />
    </main>
  );
}
