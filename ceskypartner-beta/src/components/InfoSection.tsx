import { useState } from 'react';

export function InfoSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="info-section">
      <div className="info-wrap info-row">
        <div className="info-left">
          <h2 className="info-title">
            Odhad nemovitosti
            <br />
            zdarma a online
          </h2>
        </div>

        <div className="info-right">
          <p>
            Tržní odhad získáte online během několika minut a bez vyplňování kontaktních údajů.
            Kalkulačka vypočítá nejen orientační cenu nemovitosti, ale i doporučenou hladinu nájemného.{' '}
            <strong>Výsledek vychází z kombinace více datových zdrojů</strong>, například z realizovaných
            převodů v katastru, cenových map, veřejné inzerce a dalších dostupných podkladů. Výpočet
            následně upravuje náš model a průběžně jej zpřesňujeme podle reálného vývoje trhu.
            U nestandardních nemovitostí, kde automatický postup nestačí, navazuje individuální
            posouzení od našeho specialisty.
          </p>

          {!expanded && (
            <button
              className="info-more-btn"
              onClick={() => setExpanded(true)}
            >
              VÍCE
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {expanded && (
            <div className="info-more-content">
              <h3>Odhad optimální výše nájmu</h3>
              <p>
                Odhad neslouží jen pro prodejní cenu. Stejně snadno zjistíte také doporučené nájemné
                pro byt i dům podle zadaných parametrů, lokality a typu nemovitosti. Kalkulačku průběžně
                aktualizujeme, aby výstup odpovídal aktuální situaci na trhu.
              </p>

              <h3>Odhad ceny nemovitosti pro dědické řízení</h3>
              <p>
                V dědickém řízení může notář požadovat přesnější podklad k ocenění. Rychlou orientaci
                získáte v online kalkulačce, a pokud je potřeba detailní podklad v rozsahu notářského
                řízení, zajistíme i zpracování specialistou.
              </p>

              <h3>Online hypoteční kalkulačka</h3>
              <p>
                Bez registrace a bez kontaktu si během chvilky spočítáte očekávanou měsíční splátku
                i orientační úrokovou sazbu. Parametry můžete ihned měnit podle potřeby: cenu
                nemovitosti, vlastní zdroje, délku splácení i dobu fixace.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
