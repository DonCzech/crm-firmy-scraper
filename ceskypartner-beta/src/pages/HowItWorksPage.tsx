import { Link } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { useLocale } from '@/lib/locale';

export function HowItWorksPage() {
  const { locale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);

  return (
    <div className="hiw-page">
      <Seo
        title={tr('Jak funguje odhad nemovitosti online | Online-Odhad.cz', 'How online property valuation works | Online-Odhad.cz')}
        description={tr('Zjistěte, jak probíhá bezplatný odhad nemovitosti. Online kalkulačka nebo odhad od specialisty – výsledek do 48 hodin, bez kontaktních údajů, zdarma.', 'Learn how free property valuation works. Use our online calculator or specialist valuation with results up to 48 hours.')}
        canonical="/jak-to-funguje"
      />
      <section className="hiw-section">
        <div className="hiw-container">
          <div className="hiw-row">
            <article className="hiw-col-12 hiw-content">
            <h1>{tr('Jak to funguje', 'How it works')}</h1>
            <p>
              {tr('Naši službu jsme pro Vás vyvinuli na základě mnohaletých zkušeností na realitním trhu.', 'We developed this service based on many years of experience in the real estate market.')}
            </p>
            <p>
              {tr('Odhad tržní ceny je stanoven na základě údajů z několika různých zdrojů. Dále je výpočet upraven námi vyvinutým algoritmem. Existují samozřejmě i atypické nemovitosti, u kterých nelze automaticky určit odhad tržní ceny. Pro tento případ jsou Vám k dispozici naši realitní specialisté.', 'The estimated market price is based on data from multiple sources and refined by our proprietary algorithm. Some atypical properties cannot be valued automatically, and in those cases our specialists are available.')}
            </p>
            <p>
              {tr('Celá služba ', 'The entire ')}
              <strong>{tr('Online kalkulačka', 'Online calculator')}</strong>
              {tr(' funguje bez lidského faktoru,', ' works without human intervention,')}
              <strong>{tr(' zdarma a bez zadávání kontaktních údajů.', ' free and without entering contact details.')}</strong>
              {tr(' Výjimkou je situace, kdy s námi potřebujete být z jakéhokoliv důvodu v kontaktu. V případě, že uvažujete o prodeji své nemovitosti, doporučujeme využít naši službu ', ' If you need direct contact for any reason, or if you consider selling your property, we recommend using ')}
              <Link to="/odhad-od-specialisty" className="hiw-link">{tr('Odhad od specialisty', 'Specialist valuation')}</Link>.
              {tr(' U této služby provádí detailní výpočet specialista a tento odhad je pro Vás také zdarma.', ' In this service, a specialist performs a detailed valuation and it is also free of charge.')}
            </p>
            </article>
          </div>

          <div className="hiw-row hiw-row-spaced">
            <article className="hiw-col-12 hiw-content">
            <h2>{tr('Proč to děláme', 'Why we do this')}</h2>
            <p>
              {tr('Rychlým a jednoduchým ověřením tržní ceny Vaší nemovitosti s námi zlepšujete české realitní prostředí, na kterém se bohužel stále pohybuje spousta vychytralých agentů a realitních kanceláří, které mohou snadno využít neznalosti svých klientů při stanovení tržní ceny, a to jak při prodeji, tak při pronájmu nemovitosti.', 'By quickly and simply checking your property market price with us, you help improve the Czech real estate environment and reduce the risk of unfair pricing practices by unreliable agents.')}
            </p>
            <p>
              {tr('S námi si můžete ověřit cenu Vaší nemovitosti a předejít možným finančním ztrátám.', 'With us, you can verify your property value and avoid possible financial losses.')}
            </p>
            <p>
              {tr('Tato služba je samozřejmě i pro kupující či nájemce, kteří si chtějí jednoduše a rychle ověřit cenu svého vysněného bydlení.', 'This service is also for buyers or tenants who want to quickly verify the price of their future home.')}
            </p>
            </article>
          </div>
        </div>
      </section>

      <section className="hiw-cta-section">
        <div className="hiw-container">
          <div className="hiw-cta-row">
            <article className="hiw-cta-col hiw-cta-col-border">
              <div className="hiw-cta-image-wrap">
                <img src="/hero/valuation-estimate-illustration.svg" alt={tr('Online kalkulačka', 'Online calculator')} className="hiw-cta-image" />
              </div>
              <Link
                to="/online-kalkulacka"
                className="hiw-cta-btn"
              >
                {tr('Online kalkulačka', 'Online calculator')}
              </Link>
            </article>

            <article className="hiw-cta-col">
              <div className="hiw-cta-image-wrap">
                <img src="/hero/valuation-specialist-illustration.svg" alt={tr('Odhad od specialisty', 'Specialist valuation')} className="hiw-cta-image" />
              </div>
              <Link
                to="/odhad-od-specialisty"
                className="hiw-cta-btn"
              >
                {tr('Odhad od specialisty', 'Specialist valuation')}
              </Link>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
