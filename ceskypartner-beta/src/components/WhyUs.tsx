import { BadgeCheck, Zap, Lock, Smile, Award, Users } from 'lucide-react';

const reasons = [
  {
    icon: BadgeCheck,
    title: '100% zdarma a bez závazků',
    description:
      'Za náš odhad nikdy nic neplatíte. Žádné skryté poplatky, žádné závazky. Odhad dostanete zcela zdarma.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Award,
    title: 'Certifikovaní znalci',
    description:
      'Všichni naši odhadci jsou certifikovaní znalci s licencí Ministerstva spravedlnosti ČR a mnohaletou praxí.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Zap,
    title: 'Rychlé zpracování',
    description:
      'Výsledek odhadu obdržíte do 48 hodin od prohlídky. V urgentních případech i dříve.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Lock,
    title: 'Diskrétnost a GDPR',
    description:
      'Vaše osobní údaje a informace o nemovitosti zpracováváme bezpečně v souladu s GDPR.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Users,
    title: 'Pokrytí celé ČR',
    description:
      'Působíme po celé České republice. Máme síť odhadců ve všech krajích a větších městech.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Smile,
    title: 'Profesionální přístup',
    description:
      'Naši specialisté vám vysvětlí každý krok a zodpoví všechny vaše dotazy ohledně hodnoty nemovitosti.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

export function WhyUs() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: text */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Proč právě my
            </div>
            <h2 className="mb-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Proč nás volí tisíce
              <br />
              <span className="text-blue-700">spokojených klientů?</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-500">
              Jsme jedinou službou v České republice, která poskytuje profesionální
              znalecké odhady nemovitostí zcela zdarma. Věříme, že každý vlastník
              má právo znát skutečnou hodnotu svého majetku.
            </p>

            {/* Key highlights */}
            <div className="space-y-4">
              {[
                'Přes 12 400 úspěšně dokončených odhadů',
                'Tým 85+ certifikovaných odhadců',
                'Pokrytí všech krajů České republiky',
                'Průměrné hodnocení 4.9/5 od klientů',
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <BadgeCheck className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-700">{point}</span>
                </div>
              ))}
            </div>

            {/* Partner logos */}
            <div className="mt-10">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Spolupracujeme s
              </p>
              <div className="flex flex-wrap items-center gap-6 opacity-50">
                {['ČKAIT', 'ČSN', 'Komora odhadců', 'ARTN', 'ČSRN'].map((partner) => (
                  <span key={partner} className="text-sm font-bold text-slate-500">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: feature cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${reason.bg}`}>
                    <Icon className={`h-5 w-5 ${reason.color}`} />
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-slate-900">{reason.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-500">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
