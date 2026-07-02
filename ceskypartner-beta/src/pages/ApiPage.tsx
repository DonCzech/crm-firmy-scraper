import { FormEvent, useState } from 'react';
import { Seo } from '@/components/Seo';
import { useLocale } from '@/lib/locale';

export function ApiPage() {
  const [sent, setSent] = useState(false);
  const { locale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="api-page">
      <Seo
        title={tr('API pro odhad nemovitostí – integrace pro firmy | Online-Odhad.cz', 'Property valuation API – integration for companies | Online-Odhad.cz')}
        description={tr('Integrujte naši online kalkulačku odhadu nemovitostí do svého systému přes API. Ideální pro realitní kanceláře, banky a developerské projekty.', 'Integrate our online property valuation calculator into your system via API. Ideal for agencies, banks and developers.')}
        canonical="/api"
      />
      <section className="api-hero">
        <div className="api-wrap">
          <div className="api-hero-grid">
            <article className="api-hero-text">
              <h1>{tr('Spolupráce formou API', 'API partnership')}</h1>
              <p>
                {tr('Naši on-line kalkulačku můžete integrovat do svého prostředí. Ať už potřebujete využít kalkulačku pro interní systém, či jako nástroj pro Vaše klienty pod Vaší značkou na Vašich webových stránkách - jste tu správně.', 'You can integrate our online calculator into your environment. Whether you need it for internal systems or as a white-label tool for your clients, you are in the right place.')}
              </p>
              <p>
                {tr('Požádejte nás o klíč k testovacímu API. Během pár minut můžete vyzkoušet, jak spolupráce s námi funguje po technické stránce.', 'Request a test API key. In just a few minutes you can try how our technical integration works.')}
              </p>
              <a className="api-manual-btn" href="#api-form">
                {tr('MANUÁL', 'MANUAL')}
              </a>
            </article>

            <aside className="api-hero-visual">
              <img src="/hero/valuation-specialist-illustration.svg" alt={tr('Spolupráce přes API', 'API integration')} />
            </aside>
          </div>
        </div>
      </section>

      <section className="api-content">
        <div className="api-wrap api-narrow">
          <article className="api-block">
            <h2>{tr('Jak systém funguje', 'How the system works')}</h2>
            <p>
              {tr('Algoritmus systému online-odhad.cz funguje na týdenní bázi. Každý týden se aktualizují veškerá data a cenové hladiny s přesností na číslo popisné, popřípadě na část obce. Náš systém pro výpočet odhadu tržní ceny nemovitostí pracuje s obsáhlým algoritmem. On-line zpracovává vstupní data, která získává z veřejně dostupných zdrojů a z informací jednotlivých institucí veřejné správy.', 'The online-odhad.cz algorithm runs weekly updates. Data and price levels are refreshed with high granularity. Our valuation system uses an extensive algorithm and processes data from public sources and institutions.')}
            </p>
          </article>

          <article className="api-block">
            <h2>{tr('Individuální potřeby odběratelů přes API', 'Custom API needs')}</h2>
            <p>
              {tr('Náš systém je stavěn modulárně a dokážeme uspokojit potřeby každého našeho odběratele. Pokud máte specifické požadavky, neváhejte nás kontaktovat.', 'Our system is modular and can adapt to each client’s needs. If you have specific requirements, contact us.')}
            </p>
          </article>

          <article className="api-block">
            <h2>{tr('Testovací klíč', 'Test key')}</h2>
            <p>{tr('Pracuje stejně jako plná produkční verze, ale zobrazuje náhodné výsledky výpočtu.', 'Works like the full production version but returns randomized valuation results.')}</p>
          </article>

          <article className="api-block">
            <h2>{tr('Plná produkční verze', 'Full production version')}</h2>
            <p>
              {tr('Pro plnou spolupráci a cenovou nabídku nás prosím kontaktujte na e-mail:', 'For full cooperation and pricing, contact us at:')}
              {' '}
              <a href="mailto:info@online-odhad.cz">info@online-odhad.cz</a>
            </p>
          </article>
        </div>
      </section>

      <section id="api-form" className="api-form-section">
        <div className="api-wrap api-form-wrap">
          <h3>{tr('Zažádat o zkušební API klíč', 'Request a trial API key')}</h3>
          <form className="api-form" onSubmit={onSubmit}>
            <label>
              {tr('Jméno a příjmení *', 'Full name *')}
              <input required />
            </label>

            <label>
              {tr('Společnost', 'Company')}
              <input />
            </label>

            <div className="api-form-row">
              <label>
                {tr('E-mail *', 'Email *')}
                <input type="email" required />
              </label>
              <label>
                {tr('Telefon *', 'Phone *')}
                <input type="tel" required />
              </label>
            </div>

            <label>
              {tr('K čemu chcete použít API?', 'What do you want to use the API for?')}
              <textarea rows={5} />
            </label>

            <label className="api-consent">
              <input type="checkbox" required />
              <span>
                {tr('Souhlasím se zpracováním ', 'I agree to the processing of ')}
                <a href="/zpracovani-osobnich-udaju">{tr('osobních údajů', 'personal data')}</a> *
              </span>
            </label>

            <button type="submit">{tr('ODESLAT DOTAZ', 'SEND REQUEST')}</button>
            {sent && <p className="api-success">{tr('Děkujeme, žádost byla odeslána.', 'Thank you, your request has been sent.')}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}
