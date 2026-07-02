import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { Seo } from '@/components/Seo';
import { useLocale } from '@/lib/locale';

type MortgageStep = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = {
  cs: {
    1: 'Zadání',
    2: 'Příjmy',
    3: 'Nemovitost',
    4: 'Nabídka',
    5: 'Souhrn',
  },
  en: {
    1: 'Input',
    2: 'Income',
    3: 'Property',
    4: 'Offer',
    5: 'Summary',
  },
} as const;

const STEP_PROGRESS: Record<MortgageStep, number> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 100,
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

export function MortgageCalculatorPage() {
  const { locale, setLocale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const [searchParams, setSearchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState<MortgageStep>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<MortgageStep>(1);
  const [invalidPulse, setInvalidPulse] = useState(false);
  const [stepError, setStepError] = useState('');

  const [purpose, setPurpose] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertyPrice, setPropertyPrice] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [fixation, setFixation] = useState('');

  useEffect(() => {
    const raw = Number(searchParams.get('step') || 1);
    const requested = Math.max(1, Math.min(5, Number.isFinite(raw) ? raw : 1)) as MortgageStep;
    const safe = requested > maxUnlockedStep ? maxUnlockedStep : requested;
    setStep(safe);
    if (requested !== safe) setSearchParams({ step: String(safe) }, { replace: true });
  }, [maxUnlockedStep, searchParams, setSearchParams]);

  const validate = () => {
    if (step !== 1) return true;
    if (!purpose || !propertyType || !propertyPrice || !loanAmount || !fixation) {
      setStepError(tr('Vyplňte prosím všechna povinná pole.', 'Please fill in all required fields.'));
      setInvalidPulse(true);
      window.setTimeout(() => setInvalidPulse(false), 520);
      return false;
    }
    setStepError('');
    return true;
  };

  const next = () => {
    if (!validate() || step === 5) return;
    const target = (step + 1) as MortgageStep;
    setMaxUnlockedStep((prev) => (target > prev ? target : prev));
    setSearchParams({ step: String(target) });
  };

  const prev = () => {
    if (step > 1) setSearchParams({ step: String(step - 1) });
  };

  return (
    <div className="calc-page">
      <Seo
        title={tr('Hypoteční kalkulačka – orientační výpočet splátky | Online-Odhad.cz', 'Mortgage calculator – estimated monthly payment | Online-Odhad.cz')}
        description={tr('Spočítejte si orientační výši hypotéky a měsíční splátky zdarma. Zadejte hodnotu nemovitosti, výši úvěru a dobu fixace a získejte okamžitý výsledek.', 'Calculate an estimated mortgage amount and monthly payment for free. Enter property value, loan amount and fixation period for instant results.')}
        canonical="/hypotecni-kalkulacka-zadani"
      />
      <header className="calc-header">
        <BrandLogo className="calc-logo" alt="online-odhad.cz" />
        <button className="calc-menu-btn" type="button" onClick={() => setMenuOpen(true)}>{tr('MENU', 'MENU')}</button>
      </header>

      <div className="calc-progress-track">
        <div className="calc-progress-fill" style={{ width: `${STEP_PROGRESS[step]}%` }} />
        <span className="calc-progress-badge" style={{ left: `${STEP_PROGRESS[step]}%` }}>
          {STEP_PROGRESS[step]} {tr('% hotovo', '% done')}
        </span>
      </div>

      <div className="calc-layout">
        <aside className="calc-left-panel">
          <button type="button" className="calc-step-select">
            <span className="calc-step-select-prefix">{step}. {tr('krok', 'step')}</span>
            <strong>{STEP_LABELS[locale][step]}</strong>
            <span className="calc-step-caret">▾</span>
          </button>

          <h2 className="calc-left-title">
            {step === 1 ? tr('Hypoteční kalkulačka', 'Mortgage calculator') : tr('Pokračujte ve vyplnění', 'Continue filling in')}
          </h2>

          <p style={{ fontSize: 20, lineHeight: 1.4, color: '#2c326f' }}>
            {step === 1
              ? tr('Zadejte základní parametry hypotéky pro přesný výpočet orientační měsíční splátky.', 'Enter basic mortgage parameters for an accurate estimate of your monthly payment.')
              : tr('Další kroky naváží na zadání z kroku 1.', 'The next steps build on the data from step 1.')}
          </p>
        </aside>

        <section className="calc-main-panel">
          {step === 1 ? (
            <div className="calc-form-col calc-form-narrow">
              <label>{tr('Účel hypotéky *', 'Mortgage purpose *')}</label>
              <select className="calc-input" value={purpose} onChange={(e) => { setPurpose(e.target.value); setStepError(''); }}>
                <option value="">{tr('Vyberte', 'Select')}</option>
                <option value="koupě">{tr('Koupě nemovitosti', 'Property purchase')}</option>
                <option value="refinancovani">{tr('Refinancování', 'Refinancing')}</option>
                <option value="vystavba">{tr('Výstavba', 'Construction')}</option>
              </select>

              <label>{tr('Typ nemovitosti *', 'Property type *')}</label>
              <select className="calc-input" value={propertyType} onChange={(e) => { setPropertyType(e.target.value); setStepError(''); }}>
                <option value="">{tr('Vyberte', 'Select')}</option>
                <option value="byt">{tr('Byt', 'Apartment')}</option>
                <option value="dum">{tr('Dům', 'House')}</option>
                <option value="pozemek">{tr('Pozemek', 'Land')}</option>
              </select>

              <label>{tr('Hodnota nemovitosti (Kč) *', 'Property value (CZK) *')}</label>
              <input className="calc-input" value={propertyPrice} onChange={(e) => { setPropertyPrice(e.target.value); setStepError(''); }} />

              <label>{tr('Požadovaná výše úvěru (Kč) *', 'Requested loan amount (CZK) *')}</label>
              <input className="calc-input" value={loanAmount} onChange={(e) => { setLoanAmount(e.target.value); setStepError(''); }} />

              <label>{tr('Doba fixace *', 'Fixation period *')}</label>
              <select className="calc-input" value={fixation} onChange={(e) => { setFixation(e.target.value); setStepError(''); }}>
                <option value="">{tr('Vyberte', 'Select')}</option>
                <option value="1">{tr('1 rok', '1 year')}</option>
                <option value="3">{tr('3 roky', '3 years')}</option>
                <option value="5">{tr('5 let', '5 years')}</option>
                <option value="10">{tr('10 let', '10 years')}</option>
              </select>
            </div>
          ) : (
            <div className="calc-note warning">{tr(`Krok ${step} bude navazovat po finalizaci referenční analýzy.`, `Step ${step} will follow after finalizing the reference analysis.`)}</div>
          )}

          {stepError && <p className="calc-step-error">{stepError}</p>}

          <div className="calc-main-actions">
            {step > 1 ? (
              <button type="button" className="calc-back-btn" onClick={prev}>
                {tr('◂ ZPĚT', '◂ BACK')}
              </button>
            ) : (
              <span />
            )}
            <button type="button" className={`calc-next-btn${invalidPulse ? ' is-invalid' : ''}`} onClick={next}>
              {step === 5 ? tr('VÝSLEDEK', 'RESULT') : tr('DALŠÍ', 'NEXT')}
            </button>
          </div>
        </section>
      </div>

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
