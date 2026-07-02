const mediaLogos = [
  'E15', 'Hospodářské noviny', 'Forbes', 'CzechCrunch', 'Penize.cz',
  'iDNES.cz', 'Kurzy.cz', 'Měšec.cz',
];

export function MediaBar() {
  return (
    <section className="border-y py-8" style={{ borderColor: 'var(--cp-line)', background: '#fafbfc' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--cp-muted)' }}>
          Psali o nás
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {mediaLogos.map((name) => (
            <span
              key={name}
              className="text-sm font-bold tracking-tight opacity-40 hover:opacity-70 transition-opacity cursor-default select-none"
              style={{ color: 'var(--cp-navy)', letterSpacing: '-0.01em' }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
