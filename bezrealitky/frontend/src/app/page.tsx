import { SearchBar } from '@/components/search/SearchBar';
import { LatestListings } from '@/components/listing/LatestListings';
import Link from 'next/link';

const FEATURES = [
  { icon: '🏠', title: 'Bez provize', desc: 'Kontaktujte majitele přímo, bez realitní provize.' },
  { icon: '🔔', title: 'Hlídací pes', desc: 'Nové inzeráty dle vašich kritérií ihned na e-mail.' },
  { icon: '✅', title: 'Ověřené inzeráty', desc: 'Každý inzerát prochází kontrolou moderátora.' },
  { icon: '🗺️', title: 'Mapa', desc: 'Prohlédněte si inzeráty přímo na mapě.' },
];

const POPULAR_CITIES = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'Olomouc'];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Reality bez provize
          </h1>
          <p className="mb-8 text-lg text-primary-100">
            Pronájem a prodej nemovitostí přímo od majitelů.
          </p>
          <div className="rounded-2xl bg-white p-4 shadow-xl">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Popular cities */}
      <section className="border-b py-8">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-4 text-sm font-medium text-gray-500 uppercase tracking-wide">Populární lokality</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CITIES.map((city) => (
              <Link
                key={city}
                href={`/vyhledat?city=${encodeURIComponent(city)}`}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-primary-500 hover:text-primary-700"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest listings */}
      <LatestListings />

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">Proč Bezrealitky?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 text-center">
                <div className="mb-3 text-4xl">{f.icon}</div>
                <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Máte nemovitost k pronájmu?</h2>
          <p className="mb-8 text-gray-600">Vložte inzerát zdarma a oslovte tisíce zájemců.</p>
          <Link href="/pridat-inzerat" className="btn-primary px-8 py-3 text-base">
            Vložit inzerát zdarma
          </Link>
        </div>
      </section>
    </div>
  );
}
