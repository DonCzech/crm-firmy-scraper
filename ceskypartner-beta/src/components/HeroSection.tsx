import { Link } from 'react-router-dom';

const cards = [
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#dbeafe" />
        <path d="M10 28l6-8 5 5 5-7 4 10" stroke="#1a4a9e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="30" cy="13" r="3" fill="#22c55e" />
      </svg>
    ),
    title: 'Investování',
    subtitle: 'Nechte své peníze pracovat za vás',
    href: '/investovani',
    badge: 'od 500 Kč',
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#dcfce7" />
        <rect x="8" y="14" width="24" height="16" rx="3" stroke="#16a34a" strokeWidth="2.5" />
        <path d="M8 20h24" stroke="#16a34a" strokeWidth="2.5" />
        <circle cx="14" cy="25" r="1.5" fill="#16a34a" />
      </svg>
    ),
    title: 'Financování',
    subtitle: 'Rychlé a snadné řešení pro vaše podnikání',
    href: '/financovani',
    badge: 'do 4 dnů',
  },
  {
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#ede9fe" />
        <path d="M20 10v4M20 26v4M10 20h4M26 20h4" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="6" stroke="#7c3aed" strokeWidth="2.5" />
        <circle cx="20" cy="20" r="2" fill="#7c3aed" />
      </svg>
    ),
    title: 'Vzdělávání',
    subtitle: 'Český Partner Akademie – od základů k zisku',
    href: '/akademie',
    badge: 'zdarma',
  },
];

export function HeroSection() {
  return (
    <section style={{ background: 'var(--cp-navy)' }} className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'var(--cp-accent)' }} />
        <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full opacity-5" style={{ background: 'var(--cp-blue)' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Headline */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80' }}>
            🇨🇿 Česká crowdfundingová platforma
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Spojujeme investory<br />
            a české podnikatele
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Firmy získají financování, investoři pravidelné výnosy.
            Transparentně, bezpečně, česky.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {cards.map((card) => (
            <Link
              key={card.href}
              to={card.href}
              className="group bg-white rounded-2xl p-7 flex flex-col gap-4 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                {card.icon}
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--cp-accent-soft)', color: 'var(--cp-accent-dark)' }}>
                  {card.badge}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--cp-text)' }}>
                  {card.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cp-muted)' }}>
                  {card.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold mt-auto"
                style={{ color: 'var(--cp-blue)' }}>
                Zjistit více
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Licencováno ČNB
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            15 000+ investorů
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            1,2 mld. Kč vyplaceno investorům
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Člen Asociace fintech ČR
          </span>
        </div>
      </div>
    </section>
  );
}
