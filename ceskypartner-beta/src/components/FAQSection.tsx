const faqs = [
  {
    q: 'Z jakých zdrojů výsledky vycházejí a jak moc jsou přesné?',
    a: 'Náš systém pro výpočet odhadu tržní ceny nemovitostí pracuje s obsáhlým algoritmem. On-line zpracovává vstupní data, která získává z veřejně dostupných zdrojů a z informací jednotlivých institucí veřejné správy. Dále na našem projektu spolupracují odborníci na realitní trh po celé ČR, kteří nám pomáhají neustále zpřesňovat výsledky a jednotlivé části výpočtu. Snažíme se, aby celý projekt byl intuitivní a uživatelsky přívětivý. Z toho důvodu jsme při vytváření naší on-line kalkulačky omezili množství uživatelem zadávaných údajů na nezbytnou míru tak, aby mohla kalkulačku využívat i laická veřejnost. Proto je výpočet do určité míry orientační. V případě potřeby jsou Vám k dispozici naši specialisté, kteří Vám na základě podrobnějších informací, které jim poskytnete, mohou výsledek upřesnit.',
  },
  {
    q: 'Proč může být služba zcela zdarma?',
    a: 'Projekt je financován prostřednictvím spolupráce s našimi realitními partnery. Uživatelé, kteří potřebují využít dalších služeb a odhad tržní ceny jejich nemovitosti byl pouze prvotním krokem, nás mohou požádat o doporučení prověřeného, spolehlivého partnera pro prodej či pronájem své nemovitosti.',
  },
  {
    q: 'Dokážete mi pomoci s prodejem či pronájmem mé nemovitosti?',
    a: 'online-odhad.cz spolupracuje s prověřenými odborníky z realitního trhu po celé ČR. V případě zájmu našich uživatelů můžeme doporučit odborníky poskytující tyto služby. Za práci našich partnerů se můžeme zaručit – vybíráme si je opravdu pečlivě.',
  },
  {
    q: 'Mám špatné zkušenosti s podobnými službami. Je služba online-odhad.cz opravdu anonymní?',
    a: 'Ano. Zobrazení výsledku v on-line kalkulačce není podmíněno vyplněním jakéhokoliv kontaktního údaje.',
  },
  {
    q: 'Je možné výsledek z online kalkulačky konzultovat s odborníkem?',
    a: 'online-odhad.cz spolupracuje s prověřenými odborníky z realitního trhu po celé ČR, kteří mimo jiné pomáhají našemu projektu neustále zpřesňovat data. V případě zájmu našich uživatelů jsou tito odborníci k dispozici i pro konzultace. Tyto služby jsou pro naše uživatele samozřejmě také zdarma.',
  },
];

function ChevronDown() {
  return (
    <svg className="faq-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9L12 15L18 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FAQSection() {
  return (
    <section className="faq-section">
      <div className="faq-wrap">
        <h2 className="faq-title">Časté dotazy</h2>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <details className="faq-item" key={i}>
              <summary>
                {faq.q}
                <ChevronDown />
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
