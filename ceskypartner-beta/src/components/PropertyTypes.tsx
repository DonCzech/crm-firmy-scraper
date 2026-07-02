import { Link } from 'react-router-dom';

const propertyTypes = [
  {
    emoji: '🏢',
    type: 'byt',
    title: 'Byty',
    description: '1+kk až 5+kk, garsonky, lofty, mezonety',
    count: '6 200+',
    gradient: 'from-blue-500 to-blue-700',
    hover: 'hover:from-blue-600 hover:to-blue-800',
  },
  {
    emoji: '🏡',
    type: 'dum',
    title: 'Rodinné domy',
    description: 'Samostatné domy, dvojdomy, řadové domy',
    count: '3 100+',
    gradient: 'from-emerald-500 to-emerald-700',
    hover: 'hover:from-emerald-600 hover:to-emerald-800',
  },
  {
    emoji: '🌱',
    type: 'pozemek',
    title: 'Pozemky',
    description: 'Stavební pozemky, zemědělská půda, lesní pozemky',
    count: '1 400+',
    gradient: 'from-amber-500 to-orange-600',
    hover: 'hover:from-amber-600 hover:to-orange-700',
  },
  {
    emoji: '🏪',
    type: 'komercni',
    title: 'Komerční prostory',
    description: 'Kanceláře, obchody, sklady, výrobní haly',
    count: '980+',
    gradient: 'from-violet-500 to-purple-700',
    hover: 'hover:from-violet-600 hover:to-purple-800',
  },
  {
    emoji: '🚗',
    type: 'garaz',
    title: 'Garáže & Parkoviště',
    description: 'Řadové garáže, parkovací místa, odstavné plochy',
    count: '720+',
    gradient: 'from-slate-500 to-slate-700',
    hover: 'hover:from-slate-600 hover:to-slate-800',
  },
  {
    emoji: '🏘️',
    type: 'ostatni',
    title: 'Ostatní nemovitosti',
    description: 'Rekreační objekty, chaty, chalupy, zemědělské objekty',
    count: '400+',
    gradient: 'from-rose-500 to-pink-700',
    hover: 'hover:from-rose-600 hover:to-pink-800',
  },
];

export function PropertyTypes() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            Typy nemovitostí
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Odhadujeme všechny typy nemovitostí
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            Ať vlastníte byt, dům, pozemek nebo komerční prostory – naši odhadci
            mají zkušenosti se všemi typy nemovitostí po celé ČR.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {propertyTypes.map((pt) => (
            <Link
              key={pt.type}
              to={`/oceneni?typ=${pt.type}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${pt.gradient} ${pt.hover} p-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30" />
                <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/20" />
              </div>

              <div className="relative">
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-4xl">{pt.emoji}</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {pt.count} odhadů
                  </span>
                </div>
                <h3 className="mb-1 text-xl font-bold">{pt.title}</h3>
                <p className="text-sm text-white/80">{pt.description}</p>

                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-white/90 group-hover:gap-2 transition-all">
                  Získat odhad →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
