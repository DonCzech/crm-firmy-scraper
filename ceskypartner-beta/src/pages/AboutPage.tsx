import { Link } from 'react-router-dom';
import { ChevronRight, Award, Users, MapPin, TrendingUp } from 'lucide-react';
import { Seo } from '@/components/Seo';

const team = [
  {
    name: 'Ing. Pavel Novotný',
    role: 'Ředitel & Hlavní odhadce',
    avatar: 'PN',
    color: 'bg-blue-700',
    bio: 'Certifikovaný znalec s 15 lety praxe. Specializuje se na bytové a komerční nemovitosti v Praze.',
    certs: ['Znalec MsP ČR', 'RICS', 'Člen ČKAIT'],
  },
  {
    name: 'Ing. Markéta Horáčková',
    role: 'Senior odhadkyně',
    avatar: 'MH',
    color: 'bg-emerald-600',
    bio: 'Expertka na rodinné domy a pozemky. 12 let zkušeností napříč celou ČR.',
    certs: ['Znalec MsP ČR', 'Člen ARTN'],
  },
  {
    name: 'Bc. Tomáš Šimánek',
    role: 'Odhadce – Morava',
    avatar: 'TS',
    color: 'bg-violet-600',
    bio: 'Specialist na nemovitosti v moravských regionech. Brno, Olomouc, Zlín.',
    certs: ['Znalec MsP ČR', 'Člen ČSRN'],
  },
  {
    name: 'Ing. Lucie Blažková',
    role: 'Odhadkyně – Čechy',
    avatar: 'LB',
    color: 'bg-orange-600',
    bio: 'Zaměřuje se na realitní trh v Čechách mimo Prahu. Plzeň, České Budějovice, Liberec.',
    certs: ['Znalec MsP ČR', 'Člen ARTN'],
  },
];

const milestones = [
  { year: '2014', event: 'Vznik společnosti OdhadyZdarma s.r.o.' },
  { year: '2016', event: 'Rozšíření sítě odhadců do všech krajů ČR' },
  { year: '2018', event: 'Překročení hranice 3 000 zpracovaných odhadů' },
  { year: '2020', event: 'Spuštění online formuláře – rychlejší přístup pro klienty' },
  { year: '2022', event: 'Certifikace systému řízení kvality dle ISO 9001' },
  { year: '2024', event: 'Více než 12 000 dokončených odhadů, 85 odhadců' },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="O nás – certifikovaní odhadci nemovitostí od roku 2014 | Online-Odhad.cz"
        description="Online-Odhad.cz je přední česká společnost pro bezplatné odhady nemovitostí. 85+ certifikovaných odhadců, 12 400+ dokončených odhadů, celá ČR od roku 2014."
        canonical="/o-nas"
      />
      {/* Hero */}
      <div className="pt-28 pb-16" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(196,181,253,0.15) 0%, transparent 60%), #ffffff' }}>
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
            O společnosti
          </div>
          <h1 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-5xl">
            Jsme tu od roku 2014
          </h1>
          <p className="text-xl text-slate-500">
            OdhadyZdarma s.r.o. je přední česká společnost poskytující bezplatné
            profesionální odhady nemovitostí.
          </p>
        </div>
      </div>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                Naše mise
              </div>
              <h2 className="mb-6 text-3xl font-extrabold text-slate-900">
                Transparentní trh nemovitostí pro každého
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                Věříme, že znalost reálné tržní hodnoty nemovitosti je základním právem
                každého vlastníka. Proto jsme od samého začátku postavili náš model tak,
                abychom mohli poskytovat profesionální odhady <strong>zcela zdarma</strong>.
              </p>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                Za 10 let jsme pomohli více než 12 000 klientům při prodeji, koupi,
                dědictví, rozvodu nebo refinancování hypotéky. Náš tým 85+ certifikovaných
                odhadců pokrývá celou Českou republiku.
              </p>
              <Link
                to="/oceneni"
                className="inline-block rounded-full px-8 py-3 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90"
            style={{ background: '#00c49a' }}
              >
                Vyzkoušet zdarma
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Award, value: '12 400+', label: 'Dokončených odhadů', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: Users, value: '85+', label: 'Certifikovaných odhadců', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { icon: MapPin, value: '14', label: 'Krajů ČR', color: 'text-violet-600', bg: 'bg-violet-50' },
                { icon: TrendingUp, value: '10+', label: 'Let na trhu', color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className={`rounded-2xl ${bg} p-6`}>
                  <Icon className={`mb-3 h-8 w-8 ${color}`} />
                  <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Náš tým
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Zkušení odborníci na vaší straně
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${member.color} text-xl font-bold text-white`}>
                  {member.avatar}
                </div>
                <h3 className="mb-0.5 font-bold text-slate-900">{member.name}</h3>
                <p className="mb-3 text-sm text-slate-500">{member.role}</p>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">{member.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.certs.map((cert) => (
                    <span
                      key={cert}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Naše historie
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">10 let na trhu</h2>
          </div>

          <div className="relative">
            <div className="absolute left-16 top-0 h-full w-0.5 bg-slate-200" />
            <div className="space-y-8">
              {milestones.map(({ year, event }) => (
                <div key={year} className="flex items-start gap-6 relative">
                  <div className="w-24 flex-shrink-0 text-right">
                    <span className="text-sm font-bold text-blue-700">{year}</span>
                  </div>
                  <div className="relative flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-blue-600 ring-4 ring-white" />
                  </div>
                  <p className="pt-0.5 text-slate-700">{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,196,154,0.10) 0%, transparent 60%), #f8fafc' }}>
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Připojte se k tisícům spokojených klientů
          </h2>
          <p className="mb-8 text-slate-500">
            Zjistěte aktuální hodnotu vaší nemovitosti – zcela zdarma a bez závazků.
          </p>
          <Link
            to="/oceneni"
            className="inline-block rounded-full px-10 py-3.5 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#00c49a' }}
          >
            Chci odhad zdarma
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
