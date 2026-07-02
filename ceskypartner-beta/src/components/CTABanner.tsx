import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

export function CTABanner() {
  return (
    <section
      className="py-20"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,196,154,0.12) 0%, transparent 60%), #f8fafc',
      }}
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Zjistěte hodnotu vaší nemovitosti
          <br />
          <span style={{ color: '#00c49a' }}>ještě dnes – zcela zdarma</span>
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-lg text-slate-500">
          Připojte se k více než 12 400 spokojených klientům, kteří již využili
          naše bezplatné odhady nemovitostí.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/oceneni"
            className="inline-block rounded-full px-10 py-3.5 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#00c49a' }}
          >
            Online kalkulačka
          </Link>
          <Link
            to="/odhad-od-specialisty"
            className="inline-block rounded-full px-10 py-3.5 text-sm font-bold text-white tracking-wide uppercase transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: '#00c49a' }}
          >
            Odhad od specialisty
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
          <span>Bez závazků</span>
          <span>•</span>
          <span>100% zdarma</span>
          <span>•</span>
          <span>Výsledek do 48 hodin</span>
          <span>•</span>
          <a href="tel:+420800123456" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
            <Phone className="h-3.5 w-3.5" />
            +420 800 123 456
          </a>
        </div>
      </div>
    </section>
  );
}
