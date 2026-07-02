const testimonials = [
  {
    name: 'Ema K.',
    role: 'Investorka, 2 roky',
    avatar: 'EK',
    color: '#1a4a9e',
    text: 'Skvělá platforma pro každého, kdo chce zhodnotit peníze efektivně a s jistotou. Přehledné prostředí, dobré výnosy a jednoduchý proces.',
    tag: 'Investor',
  },
  {
    name: 'Jakub R.',
    role: 'Investor, 18 měsíců',
    avatar: 'JR',
    color: '#16a34a',
    text: 'Přátelský web i mobilní aplikace, rychlé a jednoduché investování. Výnosy jsou znatelné. Doporučuji pro diverzifikaci portfolia.',
    tag: 'Investor',
  },
  {
    name: 'František P.',
    role: 'Investor, 3 roky, 100+ investic',
    avatar: 'FP',
    color: '#7c3aed',
    text: 'Tři roky, přes 100 investic a žádná celková ztráta. Oceňuji Priority Pass pro aktivní klienty a transparentní reporting.',
    tag: 'VIP klient',
  },
  {
    name: 'Alex Meyer',
    role: 'Domia Company s.r.o.',
    avatar: 'AM',
    color: '#d61f3c',
    text: 'Díky Českému Partnerovi zpracujeme 4× více projektů. Rychlost a flexibilita jsou bezkonkurenční. Ideální pro development.',
    tag: 'Podnikatel',
  },
  {
    name: 'Tomáš Grec',
    role: 'Real Luxembourg',
    avatar: 'TG',
    color: '#0891b2',
    text: 'Vybrali jsme Český Partner pro důvěryhodnost, transparentnost vůči investorům a flexibilitu smluvních podmínek.',
    tag: 'Podnikatel',
  },
  {
    name: 'Petra N.',
    role: 'Investorka, 1 rok',
    avatar: 'PN',
    color: '#d97706',
    text: 'Registrace do 5 minut, první investice hned. Každý měsíc výnos na účtu. Přesně to, co jsem hledala.',
    tag: 'Investor',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: '#fef9c3', color: '#854d0e' }}>
            ⭐ Reference
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: 'var(--cp-text)' }}>
            Co říkají naši klienti
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--cp-muted)' }}>
            Přečtěte si zkušenosti investorů a podnikatelů, kteří spolupracují s Českým Partnerem.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--cp-muted)' }}>
            <span className="text-yellow-400 text-xl">★★★★★</span>
            <span className="font-extrabold text-xl" style={{ color: 'var(--cp-text)' }}>4.8</span>
            <span className="text-slate-300">|</span>
            <span>1 840 recenzí</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative flex flex-col rounded-2xl border p-6 hover:shadow-md transition-shadow"
              style={{ borderColor: 'var(--cp-line)' }}
            >
              {/* Tag */}
              <div className="absolute top-5 right-5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--cp-bg)', color: 'var(--cp-muted)' }}>
                  {t.tag}
                </span>
              </div>

              {/* Stars */}
              <div className="text-yellow-400 text-sm mb-3">★★★★★</div>

              {/* Text */}
              <p className="flex-1 text-sm leading-relaxed mb-5" style={{ color: 'var(--cp-muted)' }}>
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--cp-line)' }}>
                <div
                  className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--cp-text)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--cp-muted)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {[
            { icon: '🌐', name: 'Google recenze', score: '4.8 (1 240)' },
            { icon: '📘', name: 'Facebook', score: '4.9 (600)' },
          ].map((b) => (
            <div key={b.name} className="flex items-center gap-3 rounded-2xl border px-5 py-3"
              style={{ borderColor: 'var(--cp-line)', background: 'var(--cp-bg)' }}>
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--cp-text)' }}>{b.name}</p>
                <p className="text-xs" style={{ color: 'var(--cp-muted)' }}>★★★★★ {b.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
