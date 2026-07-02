import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { Seo } from '@/components/Seo';
import { useLocale, type Locale } from '@/lib/locale';

type NotaryStep = 1 | 2 | 3 | 4;
type ExtraKey = 'inventory' | 'propertyTransfer' | 'foreignAssets' | 'extendedConsultation';

const STEP_LABELS: Record<Locale, Record<NotaryStep, string>> = {
  cs: {
    1: 'Hodnota dědictví',
    2: 'Parametry řízení',
    3: 'Doplňkové úkony',
    4: 'Výsledek výpočtu',
  },
  en: {
    1: 'Estate value',
    2: 'Proceeding parameters',
    3: 'Additional actions',
    4: 'Calculation result',
  },
};

const STEP_PROGRESS: Record<NotaryStep, number> = {
  1: 25,
  2: 50,
  3: 75,
  4: 100,
};

const NAV_LINKS = [
  { to: '/online-kalkulacka', cs: 'Online kalkulačka', en: 'Online calculator' },
  { to: '/odhad-od-specialisty', cs: 'Odhad od specialisty', en: 'Specialist valuation' },
  { to: '/hypotecni-kalkulacka-zadani', cs: 'Hypoteční kalkulačka', en: 'Mortgage calculator' },
  { to: '/odmena-notaru', cs: 'Odměna notáře', en: 'Notary fee' },
  { to: '/jak-to-funguje', cs: 'Jak to funguje', en: 'How it works' },
  { to: '/api', cs: 'API', en: 'API' },
  { to: '/kontakt', cs: 'Kontakt', en: 'Contact' },
];

const EXTRA_COSTS = {
  inventory: { cs: 'Rozšířený soupis majetku', en: 'Extended property inventory', amount: 1800 },
  propertyTransfer: { cs: 'Návrh vkladu do katastru a přepisy', en: 'Cadastre filing and transfers', amount: 2100 },
  foreignAssets: { cs: 'Majetek v zahraničí', en: 'Foreign assets', amount: 2500 },
  extendedConsultation: { cs: 'Nadstandardní konzultace', en: 'Extended consultation', amount: 900 },
} as const satisfies Record<ExtraKey, { cs: string; en: string; amount: number }>;

function parseMoney(input: string): number {
  const normalized = input.replace(/\s+/g, '').replace(',', '.');
  const asNumber = Number(normalized);
  return Number.isFinite(asNumber) ? Math.max(0, asNumber) : 0;
}

function computeTariff(base: number): number {
  const bands = [
    { limit: 500_000, rate: 0.02 },
    { limit: 500_000, rate: 0.009 },
    { limit: 2_000_000, rate: 0.005 },
    { limit: 17_000_000, rate: 0.001 },
    { limit: 20_000_000, rate: 0.0005 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.0001 },
  ];

  let rest = base;
  let fee = 0;

  for (const band of bands) {
    if (rest <= 0) break;
    const part = Math.min(rest, band.limit);
    fee += part * band.rate;
    rest -= part;
  }

  return Math.max(fee, 2000);
}

export function NotaryFeePage() {
  const { locale, setLocale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const CURRENCY = useMemo(
    () => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }),
    [locale],
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const [maxUnlockedStep, setMaxUnlockedStep] = useState<NotaryStep>(1);
  const requested = Number(searchParams.get('step') || 1);
  const safeRequested = Math.max(1, Math.min(4, Number.isFinite(requested) ? requested : 1)) as NotaryStep;
  const step = (safeRequested > maxUnlockedStep ? maxUnlockedStep : safeRequested) as NotaryStep;

  const [estateValueInput, setEstateValueInput] = useState('');
  const [debtsInput, setDebtsInput] = useState('');
  const [sjmInput, setSjmInput] = useState('');

  const [heirsCount, setHeirsCount] = useState('1');
  const [hasDispute, setHasDispute] = useState(false);
  const [hasWill, setHasWill] = useState(false);
  const [isMinorHeir, setIsMinorHeir] = useState(false);

  const [copiesCount, setCopiesCount] = useState('1');
  const [includeVat, setIncludeVat] = useState(true);
  const [extras, setExtras] = useState<Record<ExtraKey, boolean>>({
    inventory: false,
    propertyTransfer: false,
    foreignAssets: false,
    extendedConsultation: false,
  });

  const [stepError, setStepError] = useState('');

  const estateValue = parseMoney(estateValueInput);
  const debts = parseMoney(debtsInput);
  const sjmPart = parseMoney(sjmInput);
  const baseForTariff = Math.max(0, estateValue - debts - sjmPart);

  const result = useMemo(() => {
    const tariff = computeTariff(baseForTariff);
    const heirs = Math.max(1, Number(heirsCount) || 1);
    const copies = Math.max(0, Number(copiesCount) || 0);

    const heirsSurcharge = Math.max(0, heirs - 1) * 350;
    const disputeSurcharge = hasDispute ? Math.round(tariff * 0.2) : 0;
    const willSurcharge = hasWill ? 1200 : 0;
    const minorSurcharge = isMinorHeir ? 850 : 0;
    const copiesFee = copies * 100;
    const expenseLump = 300;

    const extrasFee = (Object.keys(extras) as ExtraKey[])
      .filter((key) => extras[key])
      .reduce((sum, key) => sum + EXTRA_COSTS[key].amount, 0);

    const subtotal = tariff + heirsSurcharge + disputeSurcharge + willSurcharge + minorSurcharge + copiesFee + expenseLump + extrasFee;
    const vat = includeVat ? Math.round(subtotal * 0.21) : 0;
    const total = subtotal + vat;

    return {
      tariff,
      heirsSurcharge,
      disputeSurcharge,
      willSurcharge,
      minorSurcharge,
      copiesFee,
      expenseLump,
      extrasFee,
      subtotal,
      vat,
      total,
    };
  }, [baseForTariff, copiesCount, extras, hasDispute, hasWill, heirsCount, includeVat, isMinorHeir]);

  const setStep = (next: NotaryStep) => {
    setSearchParams({ step: String(next) });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!estateValueInput.trim() || estateValue <= 0) {
        setStepError(tr('Vyplňte prosím hodnotu majetku.', 'Please enter the estate value.'));
        return false;
      }
    }

    if (step === 2) {
      const heirs = Number(heirsCount);
      if (!Number.isFinite(heirs) || heirs < 1) {
        setStepError(tr('Počet dědiců musí být alespoň 1.', 'Number of heirs must be at least 1.'));
        return false;
      }
    }

    if (step === 3) {
      const copies = Number(copiesCount);
      if (!Number.isFinite(copies) || copies < 0) {
        setStepError(tr('Počet ověřených kopií nemůže být záporný.', 'Number of verified copies cannot be negative.'));
        return false;
      }
    }

    setStepError('');
    return true;
  };

  const onNext = () => {
    if (!validateStep() || step === 4) return;
    const target = (step + 1) as NotaryStep;
    setMaxUnlockedStep((prev) => (target > prev ? target : prev));
    setStep(target);
  };

  const onPrev = () => {
    if (step === 1) return;
    setStepError('');
    setStep((step - 1) as NotaryStep);
  };

  return (
    <div className="ntf-page">
      <Seo
        title={tr('Kalkulačka odměny notáře při dědickém řízení | Online-Odhad.cz', 'Notary fee calculator for inheritance proceedings | Online-Odhad.cz')}
        description={tr('Orientační výpočet odměny notáře v dědickém řízení. Zadejte hodnotu dědictví, dluhy, počet dědiců a zjistěte přibližné náklady notáře včetně DPH.', 'Estimated notary fee in inheritance proceedings. Enter estate value, debts and heirs to get approximate total costs including VAT.')}
        canonical="/odmena-notaru"
      />
      <header className="calc-header">
        <BrandLogo className="calc-logo" alt="online-odhad.cz" />
        <button className="calc-menu-btn" type="button" onClick={() => setMenuOpen(true)}>{tr('MENU', 'MENU')}</button>
      </header>

      <section className="ntf-hero">
        <div className="ntf-container">
          <p className="ntf-kicker">{tr('Odměna notáře při dědictví', 'Notary fee in inheritance')}</p>
          <h1>{tr('Orientační kalkulačka odměny notáře', 'Estimated notary fee calculator')}</h1>
          <p className="ntf-lead">
            {tr('Výpočet vychází z běžně používaných tarifních pásem a poskytuje orientační částku. Přesná odměna se může lišit dle konkrétního postupu notáře v řízení.', 'The calculation is based on commonly used tariff ranges and provides an estimated amount. The exact fee may vary depending on case specifics.')}
          </p>
        </div>
      </section>

      <section className="ntf-container ntf-calculator">
        <div className="ntf-progress">
          <div className="ntf-progress-track">
            <div className="ntf-progress-fill" style={{ width: `${STEP_PROGRESS[step]}%` }} />
          </div>
          <div className="ntf-step-pill">
            {step}. {tr('krok', 'step')}: {STEP_LABELS[locale][step]}
          </div>
        </div>

        <div className="ntf-panel">
          {step === 1 && (
            <div className="ntf-grid">
              <label>
                {tr('Celková hodnota majetku v dědictví (Kč) *', 'Total estate value (CZK) *')}
                <input
                  className="ntf-input"
                  value={estateValueInput}
                  onChange={(e) => {
                    setEstateValueInput(e.target.value);
                    setStepError('');
                  }}
                  placeholder={tr('Např. 5500000', 'e.g. 5500000')}
                />
              </label>

              <label>
                {tr('Dluhy a závazky (Kč)', 'Debts and liabilities (CZK)')}
                <input
                  className="ntf-input"
                  value={debtsInput}
                  onChange={(e) => {
                    setDebtsInput(e.target.value);
                    setStepError('');
                  }}
                  placeholder={tr('Např. 250000', 'e.g. 250000')}
                />
              </label>

              <label>
                {tr('Část společného jmění (SJM), která se neprojednává (Kč)', 'Part of marital property (SJM) excluded from proceedings (CZK)')}
                <input
                  className="ntf-input"
                  value={sjmInput}
                  onChange={(e) => {
                    setSjmInput(e.target.value);
                    setStepError('');
                  }}
                  placeholder={tr('Např. 1200000', 'e.g. 1200000')}
                />
              </label>

              <div className="ntf-note">
                <strong>{tr('Základ pro výpočet:', 'Calculation base:')}</strong> {CURRENCY.format(baseForTariff)}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="ntf-grid">
              <label>
                {tr('Počet dědiců *', 'Number of heirs *')}
                <input
                  type="number"
                  min={1}
                  className="ntf-input"
                  value={heirsCount}
                  onChange={(e) => {
                    setHeirsCount(e.target.value);
                    setStepError('');
                  }}
                />
              </label>

              <label className="ntf-check">
                <input type="checkbox" checked={hasWill} onChange={(e) => setHasWill(e.target.checked)} />
                <span>{tr('Existuje závěť / dědická smlouva', 'Will / inheritance agreement exists')}</span>
              </label>

              <label className="ntf-check">
                <input type="checkbox" checked={hasDispute} onChange={(e) => setHasDispute(e.target.checked)} />
                <span>{tr('Dědicové jsou ve sporu o vypořádání', 'Heirs are in dispute about settlement')}</span>
              </label>

              <label className="ntf-check">
                <input type="checkbox" checked={isMinorHeir} onChange={(e) => setIsMinorHeir(e.target.checked)} />
                <span>{tr('V řízení je nezletilý dědic', 'There is a minor heir in proceedings')}</span>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="ntf-grid">
              <label>
                {tr('Počet ověřených kopií listin', 'Number of certified document copies')}
                <input
                  type="number"
                  min={0}
                  className="ntf-input"
                  value={copiesCount}
                  onChange={(e) => {
                    setCopiesCount(e.target.value);
                    setStepError('');
                  }}
                />
              </label>

              {(Object.keys(EXTRA_COSTS) as ExtraKey[]).map((key) => (
                <label className="ntf-check" key={key}>
                  <input
                    type="checkbox"
                    checked={extras[key]}
                    onChange={(e) => setExtras((prev) => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <span>
                    {locale === 'en' ? EXTRA_COSTS[key].en : EXTRA_COSTS[key].cs} ({CURRENCY.format(EXTRA_COSTS[key].amount)})
                  </span>
                </label>
              ))}

              <label className="ntf-check">
                <input type="checkbox" checked={includeVat} onChange={(e) => setIncludeVat(e.target.checked)} />
                <span>{tr('Připočítat DPH 21 %', 'Include VAT 21%')}</span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="ntf-result-wrap">
              <div className="ntf-total-card">
                <p>{tr('Orientační celková odměna notáře', 'Estimated total notary fee')}</p>
                <strong>{CURRENCY.format(result.total)}</strong>
              </div>

              <div className="ntf-breakdown">
                <h2>{tr('Rozpis výpočtu', 'Calculation breakdown')}</h2>
                <ul>
                  <li><span>{tr('Tarifní odměna', 'Tariff fee')}</span><strong>{CURRENCY.format(result.tariff)}</strong></li>
                  <li><span>{tr('Příplatek za další dědice', 'Surcharge for additional heirs')}</span><strong>{CURRENCY.format(result.heirsSurcharge)}</strong></li>
                  <li><span>{tr('Příplatek za spor', 'Dispute surcharge')}</span><strong>{CURRENCY.format(result.disputeSurcharge)}</strong></li>
                  <li><span>{tr('Závěť / dědická smlouva', 'Will / inheritance agreement')}</span><strong>{CURRENCY.format(result.willSurcharge)}</strong></li>
                  <li><span>{tr('Nezletilý dědic', 'Minor heir')}</span><strong>{CURRENCY.format(result.minorSurcharge)}</strong></li>
                  <li><span>{tr('Ověřené kopie', 'Certified copies')}</span><strong>{CURRENCY.format(result.copiesFee)}</strong></li>
                  <li><span>{tr('Hotové výdaje (paušál)', 'Lump-sum expenses')}</span><strong>{CURRENCY.format(result.expenseLump)}</strong></li>
                  <li><span>{tr('Doplňkové úkony', 'Additional actions')}</span><strong>{CURRENCY.format(result.extrasFee)}</strong></li>
                  <li><span>{tr('Mezisoučet', 'Subtotal')}</span><strong>{CURRENCY.format(result.subtotal)}</strong></li>
                  <li><span>{tr('DPH', 'VAT')}</span><strong>{CURRENCY.format(result.vat)}</strong></li>
                </ul>
              </div>

              <div className="ntf-law-note">
                {tr('Výsledek je orientační. Skutečná odměna notáře závisí na konkrétním průběhu řízení, včetně náročnosti úkonů a individuálního postupu soudního komisaře.', 'The result is indicative only. The actual notary fee depends on the specific case process, complexity of actions and the individual approach of the court commissioner.')}
              </div>
            </div>
          )}

          {stepError && <p className="ntf-step-error">{stepError}</p>}

          <div className="ntf-actions">
            <button type="button" className="ntf-back" onClick={onPrev} disabled={step === 1}>
              {tr('◂ ZPĚT', '◂ BACK')}
            </button>
            {step < 4 && (
              <button type="button" className="ntf-next" onClick={onNext}>
                {tr('DALŠÍ', 'NEXT')}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="ntf-container ntf-table">
        <h2>{tr('Tarifní pásma použitá v kalkulačce', 'Tariff bands used in calculator')}</h2>
        <table>
          <thead>
            <tr>
              <th>{tr('Hodnota základu', 'Base value')}</th>
              <th>{tr('Sazba', 'Rate')}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>{tr('do 500 000 Kč', 'up to CZK 500,000')}</td><td>2,0 %</td></tr>
            <tr><td>{tr('500 001 Kč až 1 000 000 Kč', 'CZK 500,001 to 1,000,000')}</td><td>0,9 %</td></tr>
            <tr><td>{tr('1 000 001 Kč až 3 000 000 Kč', 'CZK 1,000,001 to 3,000,000')}</td><td>0,5 %</td></tr>
            <tr><td>{tr('3 000 001 Kč až 20 000 000 Kč', 'CZK 3,000,001 to 20,000,000')}</td><td>0,1 %</td></tr>
            <tr><td>{tr('20 000 001 Kč až 40 000 000 Kč', 'CZK 20,000,001 to 40,000,000')}</td><td>0,05 %</td></tr>
            <tr><td>{tr('nad 40 000 000 Kč', 'above CZK 40,000,000')}</td><td>0,01 %</td></tr>
          </tbody>
        </table>
      </section>

      {menuOpen && (
        <div className="calc-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="calc-menu-panel" onClick={(e) => e.stopPropagation()}>
            <button className="calc-menu-close" type="button" onClick={() => setMenuOpen(false)}>×</button>
            <h3>{tr('Menu', 'Menu')}</h3>
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
                {tr(link.cs, link.en)}
              </Link>
            ))}
            <div className="calc-menu-locale">
              <button type="button" className={locale === 'cs' ? 'calc-menu-locale-active' : 'calc-menu-locale-muted'} onClick={() => setLocale('cs')}>CS</button>
              <span className="calc-menu-locale-sep">|</span>
              <button type="button" className={locale === 'en' ? 'calc-menu-locale-active' : 'calc-menu-locale-muted'} onClick={() => setLocale('en')}>EN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
