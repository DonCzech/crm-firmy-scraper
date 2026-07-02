import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <p className="mb-4 text-7xl font-extrabold text-blue-200">404</p>
      <h1 className="mb-3 text-2xl font-extrabold text-slate-900">Stránka nenalezena</h1>
      <p className="mb-8 max-w-sm text-slate-500">
        Omlouváme se, požadovaná stránka neexistuje nebo byla přesunuta.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
        >
          <Home className="h-4 w-4" />
          Zpět na hlavní stránku
        </Link>
        <Link
          to="/oceneni"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Odhad zdarma
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
