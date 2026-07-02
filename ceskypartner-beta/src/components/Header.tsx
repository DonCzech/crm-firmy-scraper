import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';

const navLinks = [
  { href: '/investovani', label: 'Investování' },
  { href: '/financovani', label: 'Financování' },
  { href: '/akademie', label: 'Akademie' },
  { href: '/blog', label: 'Blog' },
  { href: '/o-nas', label: 'O nás' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <BrandLogo className="site-logo" linkClassName="" alt="Český Partner" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/prihlaseni"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Přihlásit se
            </Link>
            <Link
              to="/registrace"
              className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors"
              style={{ background: 'var(--cp-accent)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cp-accent-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cp-accent)')}
            >
              Vytvořit účet
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Otevřít menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/prihlaseni"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50"
              >
                Přihlásit se
              </Link>
              <Link
                to="/registrace"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-sm font-bold text-white rounded-full"
                style={{ background: 'var(--cp-accent)' }}
              >
                Vytvořit účet
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
