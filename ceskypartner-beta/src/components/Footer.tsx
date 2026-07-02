import { Link } from 'react-router-dom';

const cols = [
  {
    heading: 'O společnosti',
    links: [
      { label: 'O nás', href: '/o-nas' },
      { label: 'Pro média', href: '/media' },
      { label: 'Dokumenty ke stažení', href: '/dokumenty' },
      { label: 'Whistleblowing', href: '/whistleblowing' },
    ],
  },
  {
    heading: 'Investování',
    links: [
      { label: 'Nabídka investic', href: '/investovani' },
      { label: 'Jak začít', href: '/jak-to-funguje' },
      { label: 'Časté dotazy', href: '/faq' },
      { label: 'Blog', href: '/blog' },
      { label: 'Akademie', href: '/akademie' },
    ],
  },
  {
    heading: 'Financování',
    links: [
      { label: 'Jak to funguje?', href: '/financovani' },
      { label: 'Kalkulace úvěru', href: '/kalkulacka' },
      { label: 'Produkty', href: '/produkty' },
    ],
  },
  {
    heading: 'Kontakt',
    links: [
      { label: 'info@ceskypartner.cz', href: 'mailto:info@ceskypartner.cz' },
      { label: '+420 211 221 940', href: 'tel:+420211221940' },
      { label: 'Thámova 137/16, Praha 8', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer style={{ background: 'var(--cp-navy)', color: 'white' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Company info */}
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span className="font-bold text-white">Český Partner s.r.o.</span>
              {' · '}IČO: 12345678
              {' · '}
              <span>Licencováno ČNB · Člen Asociace fintech ČR</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4">
              {[
                { label: 'LinkedIn', href: '#', icon: 'in' },
                { label: 'Facebook', href: '#', icon: 'f' },
                { label: 'Instagram', href: '#', icon: '◎' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            Copyright 2026 © Český Partner s.r.o. — všechna práva vyhrazena.
            {' · '}
            <Link to="/ochrana-osobnich-udaju" className="hover:text-slate-300 transition-colors">
              Ochrana osobních údajů
            </Link>
            {' · '}
            <Link to="/podminky" className="hover:text-slate-300 transition-colors">
              Podmínky používání
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
