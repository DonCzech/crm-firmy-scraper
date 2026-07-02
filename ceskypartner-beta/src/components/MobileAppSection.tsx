const features = [
  'Okamžitý přístup k investicím',
  'Přehled výnosů v reálném čase',
  'Správa portfolia jedním klikem',
  'Push notifikace o nových projektech',
];

export function MobileAppSection() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-10"
          style={{ background: 'var(--cp-bg)' }}>
          {/* Text */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'var(--cp-accent-soft)', color: 'var(--cp-accent-dark)' }}>
              Mobilní aplikace
            </div>
            <h2 className="text-3xl font-extrabold mb-4" style={{ color: 'var(--cp-text)' }}>
              Investujte odkudkoliv
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--cp-muted)' }}>
              Stáhněte si aplikaci Český Partner a mějte své portfolio vždy po ruce.
            </p>
            <ul className="space-y-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'var(--cp-text)' }}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {/* Store buttons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#app-store"
                className="flex items-center gap-3 px-5 py-3 rounded-xl text-white transition-opacity hover:opacity-80"
                style={{ background: 'var(--cp-navy)' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-75">Stáhnout na</div>
                  <div className="text-sm font-bold">App Store</div>
                </div>
              </a>
              <a
                href="#google-play"
                className="flex items-center gap-3 px-5 py-3 rounded-xl text-white transition-opacity hover:opacity-80"
                style={{ background: 'var(--cp-navy)' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-75">Dostupné na</div>
                  <div className="text-sm font-bold">Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-52 h-96 rounded-3xl border-4 flex flex-col overflow-hidden shadow-2xl"
              style={{ borderColor: 'var(--cp-navy)', background: 'var(--cp-navy)' }}>
              {/* Status bar */}
              <div className="h-6 flex items-center justify-between px-4">
                <span className="text-white text-xs font-bold">9:41</span>
                <div className="flex gap-1">
                  <div className="w-3 h-1.5 bg-white rounded-sm opacity-80" />
                  <div className="w-1 h-1.5 bg-white rounded-sm opacity-40" />
                </div>
              </div>
              {/* App content mockup */}
              <div className="flex-1 bg-white m-1 rounded-2xl p-3 flex flex-col gap-3">
                <div className="h-4 w-24 rounded-full" style={{ background: 'var(--cp-line)' }} />
                <div className="h-16 rounded-xl" style={{ background: 'var(--cp-bg)' }} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-12 rounded-xl" style={{ background: 'var(--cp-bg)' }} />
                  <div className="h-12 rounded-xl" style={{ background: 'var(--cp-accent-soft)' }} />
                </div>
                <div className="h-3 w-3/4 rounded-full" style={{ background: 'var(--cp-line)' }} />
                <div className="h-3 w-1/2 rounded-full" style={{ background: 'var(--cp-line)' }} />
                <div className="mt-auto h-8 rounded-full" style={{ background: 'var(--cp-accent)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
