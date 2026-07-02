import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { Seo } from '@/components/Seo';
import { useLocale, type Locale } from '@/lib/locale';

type SpecialistStep = 1 | 2 | 3 | 4 | 5;
type EstimateType = 'sale' | 'rent' | 'legal' | '';
type ReasonType = 'sell' | 'buy' | 'interest' | '';
type PropertyType = 'byt' | 'dum' | 'pozemek' | 'komercni' | '';

const STEP_LABELS: Record<Locale, Record<SpecialistStep, string>> = {
  cs: {
    1: 'Druh odhadu',
    2: 'Typ nemovitosti',
    3: 'Lokalita',
    4: 'Formulář',
    5: 'Ověření SMS',
  },
  en: {
    1: 'Valuation type',
    2: 'Property type',
    3: 'Location',
    4: 'Form',
    5: 'SMS verification',
  },
};

const STEP_PROGRESS: Record<SpecialistStep, number> = {
  1: 17,
  2: 33,
  3: 50,
  4: 67,
  5: 83,
};

const STEP_IMAGE: Record<SpecialistStep, string> = {
  1: '/hero/valuation-specialist-illustration.svg',
  2: '/hero/valuation-estimate-illustration.svg',
  3: '/hero/valuation-specialist-illustration.svg',
  4: '/hero/valuation-specialist-illustration.svg',
  5: '/hero/valuation-estimate-illustration.svg',
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

function OptionCard({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`spc-option-card${active ? ' is-active' : ''}`} onClick={onClick}>
      <span className="spc-option-title">{title}</span>
      {subtitle && <small>{subtitle}</small>}
      {active && <em className="spc-option-check">✓</em>}
    </button>
  );
}

function StepDropdown({
  step,
  maxUnlockedStep,
  open,
  onToggle,
  onStepSelect,
  locale,
}: {
  step: SpecialistStep;
  maxUnlockedStep: SpecialistStep;
  open: boolean;
  onToggle: () => void;
  onStepSelect: (target: SpecialistStep) => void;
  locale: Locale;
}) {
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  return (
    <div className="spc-step-select-wrap">
      <button type="button" className="spc-step-select" onClick={onToggle}>
        <span className="spc-step-prefix">{step}. {tr('krok', 'step')}</span>
        <strong>{STEP_LABELS[locale][step]}</strong>
        <span className="spc-step-caret">▾</span>
      </button>

      {open && (
        <div className="spc-step-dropdown">
          {(Object.keys(STEP_LABELS.cs) as unknown as SpecialistStep[]).map((s) => {
            const locked = s > maxUnlockedStep;
            return (
              <button
                key={s}
                type="button"
                className={`spc-step-option${locked ? ' is-locked' : ''}${s === step ? ' is-active' : ''}`}
                onClick={() => {
                  if (!locked) onStepSelect(s);
                }}
              >
                <span>{s}. {tr('krok', 'step')}</span>
                <strong>{STEP_LABELS[locale][s]}</strong>
                {s === step && <i>✓</i>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SpecialistCalculatorPage() {
  const { locale, setLocale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const [searchParams, setSearchParams] = useSearchParams();

  const [step, setStep] = useState<SpecialistStep>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<SpecialistStep>(1);
  const [stepDropdownOpen, setStepDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [estimateType, setEstimateType] = useState<EstimateType>('');
  const [reasonType, setReasonType] = useState<ReasonType>('');
  const [propertyType, setPropertyType] = useState<PropertyType>('');
  const [address, setAddress] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [sms1, setSms1] = useState('');
  const [sms2, setSms2] = useState('');
  const [sms3, setSms3] = useState('');

  const [stepError, setStepError] = useState('');
  const [invalidPulse, setInvalidPulse] = useState(false);

  const progress = STEP_PROGRESS[step];
  const hasAddress = address.trim().length > 8;

  useEffect(() => {
    const raw = Number(searchParams.get('step') || 1);
    const requested = Math.max(1, Math.min(5, Number.isFinite(raw) ? raw : 1)) as SpecialistStep;
    const safe = requested > maxUnlockedStep ? maxUnlockedStep : requested;

    setStep(safe);

    if (safe !== requested) {
      setSearchParams({ step: String(safe) }, { replace: true });
    }
  }, [maxUnlockedStep, searchParams, setSearchParams]);

  const goToStep = (target: SpecialistStep) => {
    const safe = target > maxUnlockedStep ? maxUnlockedStep : target;
    setSearchParams({ step: String(safe) });
    setStepDropdownOpen(false);
    setStepError('');
  };

  const invalidate = (msg: string) => {
    setStepError(msg);
    setInvalidPulse(true);
    window.setTimeout(() => setInvalidPulse(false), 520);
  };

  const validate = () => {
    if (step === 1 && (!estimateType || !reasonType)) {
      invalidate(tr('Vyberte prosím jednu z možností.', 'Please select one of the options.'));
      return false;
    }

    if (step === 2 && !propertyType) {
      invalidate(tr('Vyberte prosím typ nemovitosti.', 'Please select a property type.'));
      return false;
    }

    if (step === 3 && !hasAddress) {
      invalidate(tr('Zadejte prosím úplnou adresu.', 'Please enter the full address.'));
      return false;
    }

    if (step === 4 && (!fullName.trim() || !email.includes('@') || phone.trim().length < 9)) {
      invalidate(tr('Vyplňte prosím správně kontaktní údaje.', 'Please fill in valid contact details.'));
      return false;
    }

    if (step === 5 && (!sms1 || !sms2 || !sms3)) {
      invalidate(tr('Vyplňte prosím kód z SMS.', 'Please enter the SMS code.'));
      return false;
    }

    setStepError('');
    return true;
  };

  const next = () => {
    if (!validate()) return;
    if (step === 5) return;

    const target = (step + 1) as SpecialistStep;
    setMaxUnlockedStep((prev) => (target > prev ? target : prev));
    setSearchParams({ step: String(target) });
  };

  const prev = () => {
    if (step > 1) {
      setStepError('');
      setSearchParams({ step: String(step - 1) });
    }
  };

  const summary = useMemo(
    () => [
      tr('Druh odhadu', 'Valuation type') + `: ${estimateType === 'sale' ? tr('Prodej / koupě', 'Sale / purchase') : estimateType === 'rent' ? tr('Pronájem', 'Rent') : tr('Dědické řízení', 'Inheritance proceedings')}`,
      tr('Co Vás přivedlo', 'What brought you here') + `: ${reasonType === 'sell' ? tr('Budu prodávat', 'I will sell') : reasonType === 'buy' ? tr('Budu kupovat', 'I will buy') : tr('Pouze zajímavost', 'Just curiosity')}`,
      tr('Typ nemovitosti', 'Property type') + `: ${propertyType === 'byt' ? tr('Byt', 'Apartment') : propertyType === 'dum' ? tr('Dům', 'House') : propertyType === 'pozemek' ? tr('Pozemek', 'Land') : tr('Komerční objekt / Činžovní dům', 'Commercial object / Apartment house')}`,
      `${tr('Adresa', 'Address')}: ${address}`,
      `${tr('Jméno', 'Name')}: ${fullName}`,
      `${tr('E-mail', 'Email')}: ${email}`,
      `${tr('Telefon', 'Phone')}: ${phone}`,
    ],
    [address, email, estimateType, fullName, phone, propertyType, reasonType, locale],
  );

  return (
    <div className="spc-page">
      <Seo
        title={tr('Odhad nemovitosti od specialisty zdarma | Online-Odhad.cz', 'Specialist property valuation for free | Online-Odhad.cz')}
        description={tr('Profesionální odhad tržní ceny nemovitosti od certifikovaného odhadce zdarma. Byt, dům, pozemek, komerční prostory – výsledek do 48 hodin, celá ČR.', 'Professional market valuation by a certified specialist for free. Apartment, house, land or commercial property – result up to 48 hours.')}
        canonical="/odhad-od-specialisty"
      />
      <header className="calc-header">
        <BrandLogo className="calc-logo" alt="online-odhad.cz" />
        <button type="button" className="calc-menu-btn" onClick={() => setMenuOpen(true)}>
          {tr('MENU', 'MENU')}
        </button>
      </header>

      <div className="spc-progress-track">
        <div className="spc-progress-fill" style={{ width: `${progress}%` }} />
        <span className="spc-progress-badge" style={{ left: `${progress}%` }}>
          {progress} {tr('% hotovo', '% done')}
        </span>
      </div>

      <main className="spc-layout">
        <aside className="spc-left-panel">
          <StepDropdown
            step={step}
            maxUnlockedStep={maxUnlockedStep}
            open={stepDropdownOpen}
            onToggle={() => setStepDropdownOpen((v) => !v)}
            onStepSelect={goToStep}
            locale={locale}
          />

          <h2 className="spc-left-title">
            {step === 1 && tr('Jaký druh odhadu potřebujete?', 'What type of valuation do you need?')}
            {step === 2 && tr('Zvolte typ nemovitosti', 'Choose property type')}
            {step === 3 && tr('Lokalita Vaší nemovitosti', 'Property location')}
            {step === 4 && tr('Kontaktujte našeho specialistu', 'Contact our specialist')}
            {step === 5 && tr('Odhad tržní ceny Vaší nemovitosti', 'Estimated market value of your property')}
          </h2>

          <div className={`spc-left-visual spc-left-visual-step-${step}`}>
            <img src={STEP_IMAGE[step]} alt={tr('Ilustrace kroku', 'Step illustration')} />
            <span className="spc-shape spc-shape-a" />
            <span className="spc-shape spc-shape-b" />
          </div>
        </aside>

        <section className="spc-main-panel">
          {step === 1 && (
            <>
              <div className="spc-grid spc-grid-3">
                <OptionCard title={tr('Prodej / koupě', 'Sale / purchase')} active={estimateType === 'sale'} onClick={() => { setEstimateType('sale'); setStepError(''); }} />
                <OptionCard title={tr('Pronájem', 'Rent')} active={estimateType === 'rent'} onClick={() => { setEstimateType('rent'); setStepError(''); }} />
                <OptionCard
                  title={tr('Dědické řízení', 'Inheritance proceedings')}
                  subtitle={tr('Vyrovnání spolumajitelů', 'Co-owner settlement')}
                  active={estimateType === 'legal'}
                  onClick={() => {
                    setEstimateType('legal');
                    setReasonType('interest');
                    setStepError('');
                  }}
                />
              </div>

              {estimateType !== 'legal' && estimateType && (
                <>
                  <h3 className="spc-subtitle">{tr('Co Vás k nám přivedlo?', 'What brought you here?')}</h3>
                  <div className="spc-grid spc-grid-3">
                    <OptionCard title={tr('Budu prodávat', 'I will sell')} active={reasonType === 'sell'} onClick={() => { setReasonType('sell'); setStepError(''); }} />
                    <OptionCard title={tr('Budu kupovat', 'I will buy')} active={reasonType === 'buy'} onClick={() => { setReasonType('buy'); setStepError(''); }} />
                    <OptionCard title={tr('Pouze zajímavost', 'Just curiosity')} active={reasonType === 'interest'} onClick={() => { setReasonType('interest'); setStepError(''); }} />
                  </div>
                </>
              )}

              {estimateType === 'legal' && (
                <div className="spc-legal-note">{tr('U dědického řízení pokračujte rovnou na další krok.', 'For inheritance proceedings, continue directly to the next step.')}</div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="spc-grid spc-grid-4">
              <OptionCard title={tr('Byt', 'Apartment')} active={propertyType === 'byt'} onClick={() => { setPropertyType('byt'); setStepError(''); }} />
              <OptionCard title={tr('Dům', 'House')} active={propertyType === 'dum'} onClick={() => { setPropertyType('dum'); setStepError(''); }} />
              <OptionCard title={tr('Pozemek', 'Land')} active={propertyType === 'pozemek'} onClick={() => { setPropertyType('pozemek'); setStepError(''); }} />
              <OptionCard title={tr('Komerční objekt', 'Commercial object')} subtitle={tr('Činžovní dům', 'Apartment house')} active={propertyType === 'komercni'} onClick={() => { setPropertyType('komercni'); setStepError(''); }} />
            </div>
          )}

          {step === 3 && (
            <div className="spc-form-col">
              <label>{tr('Ulice a číslo popisné *', 'Street and house number *')}</label>
              <input
                className="spc-input"
                value={address}
                placeholder=""
                onChange={(e) => {
                  setAddress(e.target.value);
                  setStepError('');
                }}
              />

              {!hasAddress ? (
                <div className="spc-note warning">
                  <span className="spc-note-icon">i</span>
                  <p>{tr('Zadejte prosím úplnou adresu pomocí našeho našeptávače včetně čísla popisného.', 'Please enter the full address including house number.')}</p>
                </div>
              ) : (
                <>
                  <div className="spc-note success">
                    <span className="spc-note-icon">✓</span>
                    <p>{tr('Adresa úspěšně nalezena.', 'Address found successfully.')}</p>
                  </div>
                  <iframe
                    title={tr('Mapa lokality', 'Location map')}
                    className="spc-map"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=14.339,50.044,14.379,50.067&layer=mapnik&marker=50.0555,14.3578"
                  />
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="spc-final-step">
              <h2>{tr('Poslední krok a máte hotovo!', 'Last step and you are done!')}</h2>

              <div className="spc-benefits">
                <article>
                  <img src="/hero/valuation-specialist-illustration.svg" alt={tr('Specialista', 'Specialist')} />
                  <h4>{tr('Zdarma získáte odborné posouzení ceny', 'Get expert valuation for free')}</h4>
                  <p>{tr('Za telefonický či e-mailový odhad nám nic neplatíte.', 'You pay nothing for phone or email valuation.')}</p>
                </article>
                <article>
                  <img src="/hero/valuation-estimate-illustration.svg" alt={tr('Dokument', 'Document')} />
                  <h4>{tr('K ničemu se nezavazujete', 'No obligations')}</h4>
                  <p>{tr('Je jen na Vás, jak s naším posudkem tržní ceny naložíte.', 'You decide how to use the valuation result.')}</p>
                </article>
              </div>

              <div className="spc-form-intro">
                <h3>{tr('Proč pro tuto službu potřebujeme Vaše kontaktní údaje?', 'Why do we need your contact details for this service?')}</h3>
                <p>{tr('Narozdíl od naší online kalkulačky tento odhad zpracovává', 'Unlike the online calculator, this valuation is prepared by')}</p>
                <strong>{tr('KONKRÉTNÍ SPECIALISTA.', 'A SPECIFIC SPECIALIST.')}</strong>
              </div>

              <div className="spc-form-col">
                <label>{tr('Jméno a příjmení *', 'Full name *')}</label>
                <input className="spc-input" value={fullName} onChange={(e) => { setFullName(e.target.value); setStepError(''); }} />

                <div className="spc-form-row-2">
                  <div>
                    <label>{tr('E-mail *', 'Email *')}</label>
                    <input className="spc-input" value={email} onChange={(e) => { setEmail(e.target.value); setStepError(''); }} />
                  </div>
                  <div>
                    <label>{tr('Telefon *', 'Phone *')}</label>
                    <input className="spc-input" value={phone} onChange={(e) => { setPhone(e.target.value); setStepError(''); }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="spc-sms-step">
              <h3>{tr('Prosím vyplňte kód z SMS *', 'Please enter the SMS code *')}</h3>

              <div className="spc-sms-inputs">
                <input maxLength={1} value={sms1} onChange={(e) => { setSms1(e.target.value.replace(/\D/g, '')); setStepError(''); }} />
                <input maxLength={1} value={sms2} onChange={(e) => { setSms2(e.target.value.replace(/\D/g, '')); setStepError(''); }} />
                <input maxLength={1} value={sms3} onChange={(e) => { setSms3(e.target.value.replace(/\D/g, '')); setStepError(''); }} />
              </div>

              <div className="spc-note warning">
                <span className="spc-note-icon">i</span>
                <p>
                  {tr('Kód obdržený formou SMS brání Vaše telefonní číslo před anonymním použitím. Pokud jste vyplnili špatné tel. číslo použijte prosím tlačítko ◂ ', 'The SMS code protects your phone number from anonymous misuse. If you entered a wrong phone number, use button ◂ ')}
                  <strong>{tr('ZPĚT', 'BACK')}</strong>.
                </p>
              </div>

              <details className="spc-debug-summary">
                <summary>{tr('Souhrn poptávky', 'Request summary')}</summary>
                <ul>
                  {summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {stepError && <p className="spc-step-error">{stepError}</p>}

          <div className="spc-main-actions">
            {step > 1 ? (
              <button type="button" className="spc-back-btn" onClick={prev}>
                {tr('◂ ZPĚT', '◂ BACK')}
              </button>
            ) : (
              <span />
            )}

            <button type="button" className={`spc-next-btn${invalidPulse ? ' is-invalid' : ''}`} onClick={next}>
              {step === 5 ? tr('ZÍSKAT NABÍDKU', 'GET OFFER') : tr('DALŠÍ', 'NEXT')}
            </button>
          </div>
        </section>
      </main>

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
