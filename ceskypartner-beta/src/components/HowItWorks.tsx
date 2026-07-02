import { Link } from 'react-router-dom';
import { ClipboardList, Phone, MapPin, FileText, ChevronRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Vyplníte formulář',
    description:
      'Vyplňte jednoduchý online formulář s informacemi o vaší nemovitosti. Trvá to méně než 2 minuty.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    number: '02',
    icon: Phone,
    title: 'Kontaktujeme vás',
    description:
      'Náš specialista vás do 24 hodin kontaktuje pro upřesnění detailů a domluvení termínu prohlídky.',
    color: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Prohlídka nemovitosti',
    description:
      'Certifikovaný odhadce přijede na sjednaný termín a provede detailní prohlídku vaší nemovitosti.',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
  },
  {
    number: '04',
    icon: FileText,
    title: 'Obdržíte zprávu',
    description:
      'Do 48 hodin obdržíte profesionální znaleckou zprávu s přesným odhadem tržní hodnoty vaší nemovitosti.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

export function HowItWorks() {
  return (
    <section id="jak-to-funguje" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Jak to funguje
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Odhad ve 4 jednoduchých krocích
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            Celý proces je navržen tak, aby byl pro vás co nejsnazší. Vy pouze vyplníte
            formulář – o zbytek se postará náš tým odborníků.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-1/2 top-24 hidden h-full w-px -translate-x-1/2 border-l-2 border-dashed border-slate-200 lg:block" />

          <div className="grid gap-8 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`relative flex flex-col rounded-2xl border ${step.border} ${step.bg} p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1`}
                >
                  {/* Step number */}
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-5xl font-extrabold text-slate-200">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{step.description}</p>

                  {/* Arrow for non-last items */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-slate-100">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/oceneni"
            className="inline-block rounded-full px-10 py-3.5 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#00c49a' }}
          >
            Začít odhad zdarma
          </Link>
          <p className="mt-3 text-sm text-slate-400">
            Bez závazků • Bez poplatků • Výsledek do 48 hodin
          </p>
        </div>
      </div>
    </section>
  );
}
