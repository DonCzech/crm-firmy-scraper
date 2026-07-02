import { ValuationForm } from '@/components/ValuationForm';
import { BadgeCheck, Clock, Shield, Phone } from 'lucide-react';
import { Seo } from '@/components/Seo';

const benefits = [
  { icon: BadgeCheck, text: '100% zdarma a bez závazků' },
  { icon: Clock, text: 'Výsledek do 48 hodin' },
  { icon: Shield, text: 'Certifikovaní znalci' },
  { icon: Phone, text: 'Podpora 5 dní v týdnu' },
];

export function ValuationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Požádat o odhad nemovitosti zdarma | Online-Odhad.cz"
        description="Vyplňte krátký formulář a získejte bezplatný odhad tržní ceny vaší nemovitosti od certifikovaného odhadce. Výsledek do 48 hodin, celá ČR, bez závazků."
        canonical="/oceneni"
      />
      {/* Page hero */}
      <div
        className="pt-28 pb-16"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,181,253,0.15) 0%, transparent 60%), #ffffff',
        }}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-3 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
            Požádat o odhad nemovitosti
          </h1>
          <p className="text-lg text-slate-500">
            Bez kontaktních údajů a zdarma do 3 minut
          </p>

          {/* Benefits pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {benefits.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5" style={{ color: '#00c49a' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-100">
              <ValuationForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Why free? */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(0,196,154,0.07)', border: '1px solid rgba(0,196,154,0.2)' }}>
              <h3 className="mb-3 font-bold text-slate-900">Proč nabízíme odhady zdarma?</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                Věříme, že každý vlastník by měl znát skutečnou hodnotu svého majetku.
                Náš byznys model je postaven na dobrovolném doporučení realitních
                makléřů – ne na poplatcích od klientů.
              </p>
            </div>

            {/* FAQ */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Časté otázky</h3>
              <div className="space-y-4">
                {[
                  {
                    q: 'Je odhad opravdu zdarma?',
                    a: 'Ano, 100% zdarma. Bez skrytých poplatků nebo závazků.',
                  },
                  {
                    q: 'Jak dlouho odhad trvá?',
                    a: 'Prohlídka trvá 30–60 minut, posudek obdržíte do 48 hodin.',
                  },
                  {
                    q: 'Je odhad závazný?',
                    a: 'Odhad je orientační. Znalecký posudek pro soud nebo banku má specifické požadavky.',
                  },
                  {
                    q: 'Slouží odhad pro hypotéku?',
                    a: 'Ano, naše znalecké posudky jsou akceptovány většinou bank v ČR.',
                  },
                ].map(({ q, a }) => (
                  <div key={q}>
                    <p className="text-sm font-semibold text-slate-800">{q}</p>
                    <p className="mt-1 text-sm text-slate-500">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact box */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="mb-2 font-bold text-slate-900">Potřebujete pomoc?</h3>
              <p className="mb-4 text-sm text-slate-500">
                Zavolejte nám nebo napište – rádi odpovíme na vaše dotazy.
              </p>
              <a
                href="tel:+420800123456"
                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: '#00c49a' }}
              >
                <Phone className="h-4 w-4" />
                +420 800 123 456
              </a>
              <p className="mt-2 text-center text-xs text-slate-400">
                Po–Pá 8:00–18:00 • So 9:00–13:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
