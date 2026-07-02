// @refresh reset
import { useState } from 'react';

/* ─── HEADER ─── */
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          {/* Logo */}
          <a href="/" className="header-logo">
            český partner
            <span className="header-logo-dot" />
            <span className="header-logo-reg">®</span>
          </a>

          {/* Desktop nav */}
          <nav className="header-nav">
            <div className="dropdown-wrap">
              <a href="#produkty" className="header-nav-link">
                Produkty <span className="caret">▾</span>
              </a>
              <div className="dropdown-menu">
                <div className="dropdown-label">Investování</div>
                <a className="dropdown-item" href="/chci-investovat/nabidka-investic">Nabídka investic</a>
                <a className="dropdown-item" href="/chci-investovat/caste-dotazy">Časté dotazy</a>
                <a className="dropdown-item" href="/chci-investovat/o-marketu">O Marketu</a>
                <a className="dropdown-item" href="/chci-investovat/akademie">Akademie</a>
                <a className="dropdown-item" href="/blog">Blog</a>
                <div className="dropdown-sep" />
                <div className="dropdown-label">Financování</div>
                <a className="dropdown-item" href="/chci-pujcit#jak-zacit">Jak to funguje?</a>
                <a className="dropdown-item" href="/chci-pujcit#spocitat-financovani">Spočítat financování</a>
                <a className="dropdown-item" href="/chci-pujcit/produkty">Produkty</a>
              </div>
            </div>
            <a href="/chci-investovat/o-nas" className="header-nav-link">O nás</a>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <a href="/prihlasit-se" className="btn-login">
              {/* Person icon */}
              <svg className="btn-login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Přihlásit se
            </a>
            <a href="/registrace" className="btn-signup">Vytvořit nový účet</a>
          </div>

          {/* Hamburger */}
          <button
            className="header-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`mobile-overlay${mobileOpen ? ' open' : ''}`}>
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="mobile-panel">
          <div className="mobile-head">
            <a href="/" className="header-logo" style={{ fontStyle: 'italic' }}>
              český partner
              <span className="header-logo-dot" />
              <span className="header-logo-reg">®</span>
            </a>
            <button className="mobile-close" onClick={() => setMobileOpen(false)}>✕</button>
          </div>
          <button
            className="mobile-link"
            style={{ textAlign: 'left', width: '100%', fontFamily: 'inherit', fontSize: 16 }}
            onClick={() => setProductsOpen(!productsOpen)}
          >
            Produkty {productsOpen ? '▴' : '▾'}
          </button>
          {productsOpen && (
            <div style={{ paddingLeft: 16 }}>
              <a className="mobile-link" href="/chci-investovat/nabidka-investic" style={{ fontSize: 14 }}>Nabídka investic</a>
              <a className="mobile-link" href="/chci-investovat/akademie" style={{ fontSize: 14 }}>Akademie</a>
              <a className="mobile-link" href="/chci-pujcit" style={{ fontSize: 14 }}>Financování</a>
            </div>
          )}
          <a className="mobile-link" href="/chci-investovat/o-nas">O nás</a>
          <div className="mobile-divider" />
          <div className="mobile-actions">
            <a href="/prihlasit-se" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: '13px 0' }}>Přihlásit se</a>
            <a href="/registrace" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 14, padding: '13px 0' }}>Vytvořit nový účet</a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── HERO ─── */
function Hero() {
  const cards = [
    {
      title: 'Investování',
      text: 'Nechte své peníze růst naplno',
      href: '/chci-investovat',
      imgSrc: 'https://storage.googleapis.com/fg-web-assets/web_homepage/main/hp_card_investing.webp',
    },
    {
      title: 'Financování',
      text: 'Snadné a rychlé řešení pro vaše podnikání',
      href: '/chci-pujcit',
      imgSrc: 'https://storage.googleapis.com/fg-web-assets/web_homepage/main/hp_card_financing_compressed.webp',
    },
    {
      title: 'Vzdělávání',
      text: 'Český Partner Akademie – investování od A do Z',
      href: '/chci-investovat/akademie',
      imgSrc: 'https://storage.googleapis.com/fg-web-assets/web_homepage/main/hp_card_academy_compressed.webp',
    },
  ];

  const emojiFallback = ['📈', '🏦', '🎓'];

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container hero-content">
        <h1 className="hero-h1">Spojujeme investování<br />a české firmy</h1>
        <div className="hero-cards">
          {cards.map((card, i) => (
            <a key={card.href} href={card.href} className="hero-card">
              <div className="hero-card-visual">
                <img
                  src={card.imgSrc}
                  alt={card.title}
                  onError={(e) => {
                    const parent = e.currentTarget.parentElement!;
                    parent.classList.add('hero-card-visual-placeholder');
                    parent.innerHTML = emojiFallback[i];
                  }}
                />
              </div>
              <div className="hero-card-title">{card.title}</div>
              <div className="hero-card-text">{card.text}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── MEDIA BAR ─── */
function MediaBar() {
  const logos = ['Deník E15', 'Hospodářské noviny', 'Forbes', 'CzechCrunch', 'Penize.cz', 'iDNES.cz', 'Kurzy.cz', 'Měšec.cz'];
  return (
    <section className="media-bar">
      <div className="container">
        <p className="media-bar-label">Psali o nás</p>
        <div className="media-logos">
          {logos.map((name) => (
            <span key={name} className="media-logo">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ABOUT ─── */
function About() {
  return (
    <section className="about-section">
      <div className="container about-inner">
        <div>
          <span className="section-badge">Co je to Český Partner?</span>
          <h2 className="section-h2">Česká crowdfundingová platforma</h2>
          <p className="about-text">
            Český Partner je česká crowdfundingová platforma, která propojuje investory s podnikateli.
            Firmy získají úvěr a splácí ho v měsíčních splátkách, zatímco investoři si užívají
            pravidelné výnosy a zhodnocení svých peněz.
          </p>
        </div>
        <div className="about-visual">🤝</div>
      </div>
    </section>
  );
}

/* ─── PRODUCTS ─── */
function Products() {
  return (
    <section className="products-section" id="produkty">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Naše produkty</span>
          <h2 className="section-h2">Investujte nebo financujte</h2>
          <p className="section-sub">Vyberte si, jak chcete Český Partner využít — jako investor nebo jako firma hledající financování.</p>
        </div>

        <div className="products-grid">
          {/* Invest card */}
          <div className="product-card">
            <div className="product-card-img-ph">📈</div>
            <div className="product-card-body">
              <h3 className="product-card-title">Chci investovat</h3>
              <p className="product-card-desc">
                Nabízíme investice do ověřených českých společností s atraktivním výnosem
                a zajištění na úrovni bankovních standardů.
              </p>
              <ul className="product-list">
                {[
                  'Začít můžete již od 1 000 Kč',
                  'Průměrný výnos 11,3 %',
                  'Výplata výnosů každý měsíc',
                  'Důkladné prověření společností',
                ].map((item) => (
                  <li key={item} className="product-list-item">
                    <span className="product-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/chci-investovat/registrace" className="btn btn-primary">
                Začít investovat
              </a>
            </div>
          </div>

          {/* Finance card */}
          <div className="product-card">
            <div className="product-card-img-ph">🏗️</div>
            <div className="product-card-body">
              <h3 className="product-card-title">Hledám financování</h3>
              <p className="product-card-desc">
                Podnikatelům a firmám nabízíme flexibilní a rychlé financování na míru.
                Žádost vyhodnotíme do 24 hodin.
              </p>
              <ul className="product-list">
                {[
                  'Úvěr až 100 000 000 Kč',
                  'Flexibilní podmínky pro vaše podnikání',
                  'Jednoduché řešení bez zbytečné byrokracie',
                  'Načerpání peněz do 4 dní',
                ].map((item) => (
                  <li key={item} className="product-list-item">
                    <span className="product-check">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="/chci-pujcit" className="btn btn-dark">
                Získat nabídku financování
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── STATS ─── */
function Stats() {
  const stats = [
    { value: '10', suffix: '–12,9 %', label: 'Roční výnos' },
    { value: '25 000', suffix: '+', label: 'Investorů' },
    { value: '2,5+', suffix: ' mld. Kč', label: 'Vyplaceno investorům' },
    { value: '800', suffix: '+', label: 'Úspěšných projektů' },
  ];
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="stat-value">
                {s.value}<em>{s.suffix}</em>
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const [tab, setTab] = useState<'invest' | 'finance'>('invest');

  const investSteps = [
    {
      num: '01',
      icon: '👤',
      title: 'Zaregistrujte se',
      text: 'Vyplnění osobních údajů je snadné – zvládnete to odkudkoliv během pár minut. Využít můžete <strong>BankiD</strong>, nejbezpečnější a nejrychlejší cestu k ověření identity. My vše rychle zpracujeme a založíme vám účet.',
      cta: { label: 'Začněte investovat', href: '/chci-investovat/registrace' },
    },
    {
      num: '02',
      icon: '💼',
      title: 'Začněte investovat',
      text: 'Pošlete první vklad do své investorské peněženky. Vyberte si projekt, který vás zaujme svým podnikatelským záměrem, zhodnocením nebo zajištěním. A nechte své peníze pracovat za vás.',
      cta: null,
    },
    {
      num: '03',
      icon: '💰',
      title: 'Radujte se z výdělku',
      text: 'Každý měsíc vám do investorské peněženky přijdou výnosy z vašich investic. Díky přehlednému dashboardu okamžitě vidíte, kolik vám vaše peníze vydělaly, a své investice máte vždy pod kontrolou.',
      cta: null,
    },
  ];

  const financeSteps = [
    {
      num: '01',
      icon: '🧮',
      title: 'Vytvořte si kalkulaci a vyplňte formulář',
      text: 'Na naší kalkulačce jednoduše zadejte výši úvěru spolu s dobou splácení a vyplňte kontaktní údaje.',
      cta: { label: 'Spočítat financování', href: '/chci-pujcit#spocitat-financovani' },
    },
    {
      num: '02',
      icon: '📋',
      title: 'Získejte nezávaznou nabídku',
      text: 'Vaši poptávku vyhodnotíme do 1 pracovního dne a následně se vám ozve naše obchodní oddělení, aby s vámi doladilo detaily.',
      cta: null,
    },
    {
      num: '03',
      icon: '🚀',
      title: 'Realizujete svůj projekt',
      text: 'Spusťte svůj projekt hned a bez zbytečných průtahů.',
      cta: null,
    },
  ];

  const steps = tab === 'invest' ? investSteps : financeSteps;

  return (
    <section className="how-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Jak to funguje?</span>
          <h2 className="section-h2">Jak to funguje?</h2>
          <p className="section-sub">Investoři pomáhají prověřeným firmám vyrůst a zároveň zhodnocují své peníze.</p>
        </div>

        <div className="how-tabs-row">
          <div className="how-tabs">
            <button
              className={`how-tab${tab === 'invest' ? ' active' : ''}`}
              onClick={() => setTab('invest')}
            >
              Investování
            </button>
            <button
              className={`how-tab${tab === 'finance' ? ' active' : ''}`}
              onClick={() => setTab('finance')}
            >
              Financování pro podniky
            </button>
          </div>
        </div>

        <div className="how-steps">
          {steps.map((step) => (
            <div key={step.num} className="how-step">
              <div className="how-step-num">Krok {step.num}</div>
              <div className="how-step-icon">{step.icon}</div>
              <h3 className="how-step-title">{step.title}</h3>
              <p
                className="how-step-text"
                dangerouslySetInnerHTML={{ __html: step.text }}
              />
              {step.cta && (
                <a href={step.cta.href} className="btn btn-primary" style={{ marginTop: 20 }}>
                  {step.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
function Testimonials() {
  const reviews = [
    {
      text: 'Český Partner mě mile překvapil svou přehledností a fajn výnosem. Investování je jednoduché, vše je dobře vysvětlené a výnosy odpovídají očekávání. Navíc oceňuji, že podporuji české firmy a mám kontrolu nad svými investicemi. Skvělá platforma pro každého, kdo chce zhodnotit své peníze efektivně a s jistotou.',
      name: 'Ema K.',
      role: 'Investor',
      avatar: 'EK',
      color: '#29715F',
    },
    {
      text: 'Uživatelsky přehledný web i aplikace do mobilu, snadné a rychlé investování s nemalým zhodnocením. Zatím všechny investice v pořádku a vše šlape jako hodinky! Pokud nechcete, aby v dnešní době ztrácely Vaše finance na hodnotě, mohu pro doplnění portfolia Český Partner jedině doporučit!',
      name: 'Jakub R.',
      role: 'Investor',
      avatar: 'JR',
      color: '#43BC9E',
    },
    {
      text: 'S Českým Partnerem investuji pár měsíců a jsem spokojen. Mají českou podporu, takže když něco potřebuji, zavolám, a věc se vyřeší. Co se investic týče, tak své portfolio diverzifikuji a zatím jsem s ničím neměl problém.',
      name: 'Tomáš H.',
      role: 'Investor',
      avatar: 'TH',
      color: '#0EA56E',
    },
    {
      text: 'Na Českém Partnerovi investuji již třetí rok, mám přes 100 investic a v pohodě. Jistě, všude se najde nějaká černá ovce, ale žádná investice mně ještě neskončila v nenávratnu. A služba Priority Pass pro aktivní klienty je perfektní.',
      name: 'František P.',
      role: 'Investor',
      avatar: 'FP',
      color: '#007B4C',
    },
    {
      text: 'V oboru nájemního developmentu funguji již něco přes 10 let. U Českého Partnera jsem se setkal s velmi osobním přístupem. Díky flexibilitě jsme dnes schopni zpracovávat zhruba 4× více projektů, než při dřívějším modelu financování.',
      name: 'Alex Meyer',
      role: 'Domia Company s.r.o.',
      avatar: 'AM',
      color: '#2B3139',
    },
    {
      text: 'Český Partner jsme si zvolili kvůli důvěryhodnosti — má licenci ČNB. Zároveň je přehledný a dostupný také pro koncového investora. Díky Českému Partnerovi můžeme financovat větší počet bytů a pokryjeme tak i menší projekty.',
      name: 'Tomáš Grec',
      role: 'Real Luxembourg',
      avatar: 'TG',
      color: '#12322A',
    },
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Reference</span>
          <h2 className="section-h2">Říkají o nás</h2>
          <p className="section-sub">Podívejte se na recenze těch, kteří u nás pravidelně investují nebo s námi financují své projekty.</p>
        </div>
        <div className="testimonials-grid">
          {reviews.map((r) => (
            <div key={r.name} className="testimonial-card">
              <div className="t-stars">
                {[...Array(5)].map((_, i) => <span key={i} className="t-star">★</span>)}
              </div>
              <p className="t-text">„{r.text}"</p>
              <div className="t-author">
                <div className="t-avatar" style={{ background: r.color }}>{r.avatar}</div>
                <div>
                  <div className="t-name">{r.name}</div>
                  <div className="t-role">{r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── MOBILE APP ─── */
function MobileApp() {
  return (
    <section className="app-section">
      <div className="container">
        <div className="app-inner">
          <div>
            <div className="app-badge">Mobilní aplikace</div>
            <h2 className="app-h2">Stáhněte si aplikaci,<br />investujte odkudkoli.</h2>
            <div className="app-features">
              {['Okamžitý přístup k investicím', 'Jednoduchá správa investic', 'Přehled o výnosech v reálném čase'].map((f) => (
                <div key={f} className="app-feature">
                  <div className="app-dot" />
                  {f}
                </div>
              ))}
            </div>
            <div className="app-stores">
              <a href="#" className="app-store-btn">
                <span className="app-store-icon">🍎</span>
                <span>
                  <span className="app-store-label">Stáhnout na</span>
                  <span className="app-store-name">App Store</span>
                </span>
              </a>
              <a href="#" className="app-store-btn">
                <span className="app-store-icon">▶</span>
                <span>
                  <span className="app-store-label">Dostupné na</span>
                  <span className="app-store-name">Google Play</span>
                </span>
              </a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="phone">
            <div className="phone-screen">
              <div className="ph-bar ph-bar-w60" />
              <div className="ph-card" />
              <div className="ph-row">
                <div className="ph-mini ph-mini-green" />
                <div className="ph-mini ph-mini-gray" />
              </div>
              <div className="ph-bar ph-bar-w40" />
              <div className="ph-bar" style={{ width: '55%' }} />
              <div className="ph-cta" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  const cols = [
    {
      title: 'O společnosti',
      links: [
        { label: 'O nás', href: '/chci-investovat/o-nas' },
        { label: 'Pro média', href: '/blog/vyjadreni-spolecnosti' },
        { label: 'Dokumenty ke stažení', href: '/chci-investovat/dokumenty' },
        { label: 'Whistleblowing', href: '/whistleblowing' },
      ],
    },
    {
      title: 'Investování',
      links: [
        { label: 'Nabídka investic', href: '/chci-investovat/nabidka-investic' },
        { label: 'Jak na Český Partner', href: '/chci-investovat#jak-na-cp' },
        { label: 'Časté dotazy', href: '/chci-investovat/caste-dotazy' },
        { label: 'Blog', href: '/blog' },
        { label: 'Zdraví portfolia', href: '/chci-investovat/zdravi-portfolia' },
        { label: 'Akademie', href: '/chci-investovat/akademie' },
        { label: 'Priority Pass', href: '/chci-investovat/priority-pass' },
        { label: 'Rating', href: '/chci-investovat/rating' },
      ],
    },
    {
      title: 'Financování',
      links: [
        { label: 'Jak to funguje?', href: '/chci-pujcit#jak-to-funguje' },
        { label: 'Kalkulace úvěru', href: '/chci-pujcit#spocitat-financovani' },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* Brand */}
          <div>
            <div className="footer-logo-wrap">
              <a href="/" className="header-logo" style={{ color: '#fff', fontStyle: 'italic' }}>
                český partner
                <span className="header-logo-dot" />
                <span className="header-logo-reg" style={{ color: 'rgba(255,255,255,0.5)' }}>®</span>
              </a>
            </div>
            <p className="footer-desc">
              Investování v kapse, kdykoliv a kdekoliv.<br />
              Jednoduše investujte přímo ze své kapsy.
            </p>
            <div className="footer-cert">
              <div className="footer-cert-badge">🏦 Licencováno ČNB</div>
              <div className="footer-cert-badge">🇨🇿 Asociace fintech ČR</div>
            </div>
          </div>

          {/* Nav cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} className="footer-link">{link.label}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            Copyright 2026 © Český Partner s.r.o. — všechna práva vyhrazena.
          </p>
          <button
            className="footer-back-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            ↑ Zpět nahoru
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ─── APP ─── */
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <MediaBar />
        <About />
        <Products />
        <Stats />
        <HowItWorks />
        <Testimonials />
        <MobileApp />
      </main>
      <Footer />
    </>
  );
}
