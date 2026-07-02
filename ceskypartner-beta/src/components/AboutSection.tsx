export function AboutSection() {
  return (
    <section className="py-20" style={{ background: 'var(--cp-bg)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: 'var(--cp-accent-soft)', color: 'var(--cp-accent-dark)' }}>
            Kdo jsme
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6" style={{ color: 'var(--cp-text)' }}>
            Česká platforma pro moderní financování
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--cp-muted)' }}>
            Český Partner je česká crowdfundingová platforma, která propojuje investory s podnikateli.
            Firmy získají úvěr a splácí ho v měsíčních splátkách, zatímco investoři si užívají
            pravidelné výnosy a zhodnocení svých peněz.
          </p>

          {/* 3 pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-left">
            {[
              {
                icon: '🔒',
                title: 'Bezpečnost na prvním místě',
                text: 'Každý projekt prochází důkladnou analýzou. Zajištění na úrovni bankovních standardů.',
              },
              {
                icon: '📊',
                title: 'Transparentní výnosy',
                text: 'Předem víte, kolik vyděláte. Žádná skrytá rizika ani poplatky navíc.',
              },
              {
                icon: '⚡',
                title: 'Rychlé a jednoduché',
                text: 'Registrace do 5 minut, první investice okamžitě. Vše řídíte z mobilu.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 border" style={{ borderColor: 'var(--cp-line)' }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--cp-text)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cp-muted)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
