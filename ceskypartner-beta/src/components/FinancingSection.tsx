import { Link } from 'react-router-dom';

const products = [
  {
    title: 'Překlenovací úvěr',
    desc: 'Krátkodobé financování pro překlenutí cash flow',
    tag: '1–6 měsíců',
  },
  {
    title: 'Rychlý úvěr',
    desc: 'Financování investičních nemovitostních projektů',
    tag: 'do 48 h',
  },
  {
    title: 'Projektový úvěr',
    desc: 'Dlouhodobé financování výstavby nebo rekonstrukce',
    tag: '6–36 měsíců',
  },
  {
    title: 'Provozní úvěr',
    desc: 'Financování provozního kapitálu a růstu firmy',
    tag: 'flexibilní',
  },
];

const params = [
  { value: '50 mil. Kč', label: 'Maximální výše úvěru' },
  { value: '48 h', label: 'Posouzení žádosti' },
  { value: '4 dny', label: 'Čerpání prostředků' },
  { value: '0', label: 'Zbytečná byrokracie' },
];

export function FinancingSection() {
  return (
    <section className="py-24" style={{ background: 'var(--cp-bg)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'var(--cp-accent-soft)', color: 'var(--cp-accent-dark)' }}>
            Pro podnikatele
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--cp-text)' }}>
            Financování pro vaše podnikání
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--cp-muted)' }}>
            Snadné a rychlé řešení bez zbytečného papírování.
            Peníze na účtu do 4 pracovních dnů.
          </p>
        </div>

        {/* Params */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {params.map((p) => (
            <div key={p.label} className="text-center p-6 rounded-2xl bg-white border" style={{ borderColor: 'var(--cp-line)' }}>
              <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--cp-accent-dark)' }}>
                {p.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--cp-muted)' }}>{p.label}</div>
            </div>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {products.map((product) => (
            <div key={product.title} className="bg-white rounded-2xl p-6 border hover:shadow-md transition-shadow"
              style={{ borderColor: 'var(--cp-line)' }}>
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: 'var(--cp-accent-soft)', color: 'var(--cp-accent-dark)' }}>
                {product.tag}
              </div>
              <h3 className="font-bold mb-2 text-base" style={{ color: 'var(--cp-text)' }}>
                {product.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--cp-muted)' }}>{product.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/financovani"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-colors mr-4"
            style={{ background: 'var(--cp-navy)' }}
          >
            Spočítat financování
          </Link>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border transition-colors"
            style={{ borderColor: 'var(--cp-navy)', color: 'var(--cp-navy)' }}
          >
            Kontaktovat poradce
          </Link>
        </div>
      </div>
    </section>
  );
}
