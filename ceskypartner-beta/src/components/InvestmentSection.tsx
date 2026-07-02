import { Link } from 'react-router-dom';

const params = [
  { value: '500 Kč', label: 'Minimální investice' },
  { value: '9,8 %', label: 'Průměrný roční výnos' },
  { value: 'měsíčně', label: 'Výplata výnosů' },
  { value: 'bankovní', label: 'Úroveň zajištění' },
];

const steps = [
  {
    num: '1',
    title: 'Registrace',
    text: 'Vyplňte základní údaje, ověřte identitu přes BankID nebo dokladem. Účet máte za pár minut.',
  },
  {
    num: '2',
    title: 'Začněte investovat',
    text: 'Vložte prostředky a vybírejte projekty podle výnosu, doby trvání a zajištění.',
  },
  {
    num: '3',
    title: 'Inkasujte výnosy',
    text: 'Každý měsíc dostáváte výnosy přímo na účet. Přehled portfolia máte vždy pod kontrolou.',
  },
];

const perks = [
  'Zajištění na úrovni bankovních standardů',
  'Měsíční výplata výnosů',
  'Předem víte, kolik vyděláte',
  'Důkladné prověření každé firmy',
  'Diverzifikace přes stovky projektů',
  'Správa portfolia v mobilní aplikaci',
];

export function InvestmentSection() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: '#dbeafe', color: 'var(--cp-blue)' }}>
            Pro investory
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--cp-text)' }}>
            Investujte do českých firem
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--cp-muted)' }}>
            Průměrný roční výnos 9,8 % s měsíční výplatou. Minimální investice jen 500 Kč.
          </p>
        </div>

        {/* Key params */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {params.map((p) => (
            <div key={p.label} className="text-center p-6 rounded-2xl border"
              style={{ background: 'var(--cp-bg)', borderColor: 'var(--cp-line)' }}>
              <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--cp-navy)' }}>
                {p.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--cp-muted)' }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Steps + Perks */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps */}
          <div>
            <h3 className="text-xl font-bold mb-8" style={{ color: 'var(--cp-text)' }}>
              Jak začít za 3 kroky
            </h3>
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white text-sm"
                    style={{ background: 'var(--cp-navy)' }}>
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: 'var(--cp-text)' }}>{step.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cp-muted)' }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/registrace"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-colors"
              style={{ background: 'var(--cp-accent)' }}
            >
              Začít investovat
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Perks */}
          <div className="rounded-3xl p-8" style={{ background: 'var(--cp-navy)' }}>
            <h3 className="text-xl font-bold text-white mb-6">Proč Český Partner?</h3>
            <ul className="space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm text-slate-300">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-lg">
                  🏦
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Licencováno ČNB</div>
                  <div className="text-slate-400 text-xs">Člen Asociace fintech ČR</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
