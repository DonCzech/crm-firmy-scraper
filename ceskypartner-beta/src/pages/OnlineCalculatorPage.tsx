import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useLocale, type Locale } from '@/lib/locale';
import { Seo } from '@/components/Seo';
import { estimatePriceFromData, type PriceEstimateOutput } from '@/lib/api';

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type EstimateType = 'sale' | 'rent' | 'legal';
type ReasonType = 'sell' | 'buy' | 'interest';
type OwnershipType = 'osobni' | 'druzstevni' | '';
type LandType = 'stavebni-bydleni' | 'stavebni-rekreace' | 'orna-puda' | 'ostatni' | '';
type FurnishingType = 'zarizeny' | 'nezarizeny' | '';

const STEP_PROGRESS = [10, 20, 27, 36, 45, 55, 64, 73, 82] as const;

const STEP_LABELS: Record<Locale, readonly string[]> = {
  cs: ['Druh odhadu', 'Typ nemovitosti', 'Lokalita', 'Dispozice', 'Plocha', 'Specifikace', 'Stav interiéru', 'Souhrn', 'Výsledek'],
  en: ['Valuation type', 'Property type', 'Location', 'Layout', 'Area', 'Specification', 'Interior condition', 'Summary', 'Result'],
};

const STEP_IMAGES: Record<Step, string> = {
  1: '/hero/valuation-estimate-illustration.svg',
  2: '/hero/valuation-estimate-illustration.svg',
  3: '/hero/valuation-specialist-illustration.svg',
  4: '/hero/valuation-specialist-illustration.svg',
  5: '/hero/valuation-specialist-illustration.svg',
  6: '/hero/valuation-specialist-illustration.svg',
  7: '/hero/valuation-specialist-illustration.svg',
  8: '/hero/valuation-estimate-illustration.svg',
  9: '/hero/valuation-estimate-illustration.svg',
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

function CalculatorHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="calc-header">
      <BrandLogo className="calc-logo" alt="online-odhad.cz" />
      <button className="calc-menu-btn" type="button" onClick={onMenuClick}>MENU</button>
    </header>
  );
}

function OptionCard({
  label,
  active,
  onClick,
  extra,
  groupError,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  extra?: string;
  groupError?: boolean;
}) {
  return (
    <button
      type="button"
      className={`calc-option-card${active ? ' is-active' : ''}${groupError && !active ? ' is-error' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      {extra && <small>{extra}</small>}
      {active && <em className="calc-option-check">✓</em>}
    </button>
  );
}

function stepHeadline(
  step: Step,
  propertyType: 'byt' | 'dum' | 'pozemek' | '',
  estimateType: EstimateType | null,
  locale: Locale,
) {
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const isLegalByt = estimateType === 'legal' && propertyType === 'byt';
  if (step === 1) return tr('Jaký druh odhadu potřebujete?', 'What type of valuation do you need?');
  if (step === 2) return tr('Zvolte typ nemovitosti', 'Choose property type');
  if (step === 3) return tr('Lokalita Vaší nemovitosti', 'Property location');
  if (propertyType === 'pozemek' && step === 4) return tr('Specifikace Vaší nemovitosti', 'Property specification');
  if (propertyType === 'pozemek' && step === 5) return tr('Dostupné inženýrské sítě', 'Available utility networks');
  if (step === 4) return tr('Dispozice Vaší nemovitosti', 'Property layout');
  if (isLegalByt && step === 5) return tr('Specifikace Vaší nemovitosti', 'Property specification');
  if (isLegalByt && step === 6) return tr('Stav interiéru Vaší nemovitosti', 'Interior condition');
  if (isLegalByt && step === 7) return tr('Příslušenství Vaší nemovitosti', 'Property accessories');
  if (step === 5) return propertyType === 'byt' || estimateType === 'rent' ? tr('Příslušenství Vaší nemovitosti', 'Property accessories') : tr('Plocha Vaší nemovitosti', 'Property area');
  if (step === 6) return tr('Specifikace Vaší nemovitosti', 'Property specification');
  if (step === 7) return tr('Stav interiéru Vaší nemovitosti', 'Interior condition');
  if (step === 8) return tr('Souhrn', 'Summary');
  return tr('Odhad tržní ceny Vaší nemovitosti', 'Estimated market value of your property');
}

// ─── Pricing Algorithm ────────────────────────────────────────────────────────
type CityTier = 'praha' | 'brno' | 'big' | 'medium' | 'small';
type PriceResult = { low: number; mid: number; high: number; isRent: boolean };

function normAddr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectCityTier(locationText: string): CityTier {
  const s = normAddr(locationText);
  if (/\bpraha\b/.test(s)) return 'praha';
  if (/\bbrno\b/.test(s)) return 'brno';
  if (/ostrava|plzen|olomouc|liberec/.test(s)) return 'big';
  if (/hradec|pardubice|budejovic|zlin\b|jihlava|opava|frydek|chomutov|usti|most\b|kladno|teplice|karvina|decin|havirov|znojmo|prostejov|prerov|boleslav/.test(s)) return 'medium';
  return 'small';
}

const APT_BASE: Record<CityTier, number>      = { praha: 130000, brno: 92000, big: 60000, medium: 48000, small: 34000 };
const HOUSE_BASE: Record<CityTier, number>    = { praha:  55000, brno: 40000, big: 28000, medium: 22000, small: 16000 };
const RENT_BASE: Record<CityTier, number>     = { praha:    330, brno:   240, big:   185, medium:   155, small:   120 };
const PARKING_BONUS: Record<CityTier, number> = { praha: 130000, brno: 85000, big: 60000, medium: 40000, small: 25000 };
const LAND_BASE: Record<CityTier, number>     = { praha:   8000, brno:  4500, big:  2500, medium:  1500, small:   800 };

function aptDispFactor(d: string): number {
  return ({ '1+kk': 1.10, '2+kk': 1.05, '2+1': 1.03, '3+kk': 1.00, '3+1': 0.97, '4+kk a více': 0.93 } as Record<string, number>)[d] ?? 1.00;
}
function houseDispFactor(d: string): number {
  return ({ '2+kk a méně': 0.95, '3+kk': 1.00, '4+kk a více': 1.05 } as Record<string, number>)[d] ?? 1.00;
}
function floorFactor(p: string): number {
  return ({ prizemi: 0.96, '1': 1.00, '2': 1.02, '3plus': 1.03 } as Record<string, number>)[p] ?? 1.00;
}
function ageFactor(s: string): number  { return s === 'new' ? 1.15 : s === 'old' ? 0.95 : 1.00; }
function intrFactor(i: string): number { return i === 'novy' ? 1.08 : 1.00; }
function ownFactor(v: string): number  { return v === 'druzstevni' ? 0.93 : 1.00; }

function infraMult(plyn: string, voda: string, el: string, kan: string): number {
  const sc = (val: string, full: number, part: number) =>
    val === 'Přípojka na pozemku' ? full : val.startsWith('Do 10') ? part : 0;
  return 1 + sc(plyn, 0.05, 0.03) + sc(voda, 0.08, 0.04) + sc(el, 0.05, 0.03) + sc(kan, 0.07, 0.04);
}

function rnd(n: number, step: number): number { return Math.round(n / step) * step; }

function computePrice(p: {
  estimateType: EstimateType | null; propertyType: string;
  address: string; obec: string; dispozice: string;
  plochaHlavni: string; plochaVedlejsi: string; plochaPozemku: string;
  patro: string; amenityBalkon: boolean; balkonPlocha: string;
  amenityTerasa: boolean; amenityZahrada: boolean; amenitySklep: boolean; amenityParkovani: boolean;
  stari: string; vlastnictvi: string; interier: string; vybaveni: string;
  typDomu: string; vyuziti: string; stavba: string;
  druhPozemku: string; plyn: string; voda: string; elektrina: string; kanalizace: string;
}): PriceResult | null {
  const loc      = p.propertyType === 'pozemek' ? p.obec : p.address;
  const tier     = detectCityTier(loc);
  const area     = parseFloat(p.plochaHlavni) || 0;
  const landArea = parseFloat(p.plochaPozemku) || 0;

  // ── PRONÁJEM ──────────────────────────────────────────────────────────────
  if (p.estimateType === 'rent') {
    if (!area) return null;
    const base = RENT_BASE[tier] * area
      * aptDispFactor(p.dispozice) * floorFactor(p.patro)
      * ageFactor(p.stari) * ownFactor(p.vlastnictvi) * intrFactor(p.interier)
      * (p.vybaveni === 'zarizeny' ? 1.15 : 1.00);
    const bonus = (p.amenityBalkon ? 500 : 0) + (p.amenityTerasa ? 800 : 0)
      + (p.amenityZahrada ? 1200 : 0) + (p.amenitySklep ? 300 : 0) + (p.amenityParkovani ? 2500 : 0);
    const mid = rnd(base + bonus, 100);
    return { low: rnd(mid * 0.90, 100), mid, high: rnd(mid * 1.10, 100), isRent: true };
  }

  // ── POZEMEK ────────────────────────────────────────────────────────────────
  if (p.propertyType === 'pozemek') {
    if (!landArea) return null;
    const ltm = ({ 'stavebni-bydleni': 1.00, 'stavebni-rekreace': 0.55, 'orna-puda': 0.10, ostatni: 0.18 } as Record<string, number>)[p.druhPozemku] ?? 1.00;
    const mid = rnd(LAND_BASE[tier] * ltm * landArea * infraMult(p.plyn, p.voda, p.elektrina, p.kanalizace), 5000);
    return { low: rnd(mid * 0.85, 5000), mid, high: rnd(mid * 1.15, 5000), isRent: false };
  }

  // ── BYT ───────────────────────────────────────────────────────────────────
  if (p.propertyType === 'byt') {
    if (!area) return null;
    const base = APT_BASE[tier] * area
      * aptDispFactor(p.dispozice) * floorFactor(p.patro)
      * ageFactor(p.stari) * ownFactor(p.vlastnictvi) * intrFactor(p.interier);
    const balkonBonus = p.amenityBalkon && p.balkonPlocha
      ? APT_BASE[tier] * 0.5 * (parseFloat(p.balkonPlocha) || 0) : 0;
    const bonus = balkonBonus + (p.amenityTerasa ? 80000 : 0)
      + (p.amenityZahrada ? 120000 : 0) + (p.amenitySklep ? 40000 : 0)
      + (p.amenityParkovani ? PARKING_BONUS[tier] : 0);
    const mid = rnd(base + bonus, 10000);
    return { low: rnd(mid * 0.90, 10000), mid, high: rnd(mid * 1.10, 10000), isRent: false };
  }

  // ── DŮM ────────────────────────────────────────────────────────────────────
  if (p.propertyType === 'dum') {
    if (!area) return null;
    const secArea = parseFloat(p.plochaVedlejsi) || 0;
    const htm = ({ Samostatný: 1.05, Dvojdům: 0.98, Řadový: 0.92 } as Record<string, number>)[p.typDomu] ?? 1.00;
    const base = (HOUSE_BASE[tier] * area + HOUSE_BASE[tier] * 0.30 * secArea + LAND_BASE[tier] * 0.25 * landArea)
      * houseDispFactor(p.dispozice) * htm
      * (p.vyuziti === 'Rekreace / chata' ? 0.70 : 1.00)
      * (p.stavba === 'drevo' ? 0.93 : 1.00)
      * ageFactor(p.stari) * intrFactor(p.interier);
    const mid = rnd(base, 50000);
    return { low: rnd(mid * 0.88, 50000), mid, high: rnd(mid * 1.12, 50000), isRent: false };
  }

  return null;
}

function fmtCZK(n: number): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

export function OnlineCalculatorPage() {
  const { locale, setLocale } = useLocale();
  const tr = (cs: string, en: string) => (locale === 'en' ? en : cs);
  const [searchParams, setSearchParams] = useSearchParams();

  const [step, setStep] = useState<Step>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<Step>(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [estimateType, setEstimateType] = useState<EstimateType | null>(null);
  const [reason, setReason] = useState<ReasonType | null>(null);
  const [propertyType, setPropertyType] = useState<'byt' | 'dum' | 'pozemek' | ''>('');

  const [address, setAddress] = useState('');
  const [obec, setObec] = useState('');
  const [castObce, setCastObce] = useState('');
  const [parcelniCislo, setParcelniCislo] = useState('');
  const [dispozice, setDispozice] = useState('');
  const [vyuziti, setVyuziti] = useState('');
  const [typDomu, setTypDomu] = useState('');
  const [patro, setPatro] = useState('');

  const [plochaHlavni, setPlochaHlavni] = useState('');
  const [plochaVedlejsi, setPlochaVedlejsi] = useState('');
  const [plochaPozemku, setPlochaPozemku] = useState('');
  const [balkonPlocha, setBalkonPlocha] = useState('');
  const [amenityBalkon, setAmenityBalkon] = useState(false);
  const [amenityTerasa, setAmenityTerasa] = useState(false);
  const [amenityZahrada, setAmenityZahrada] = useState(false);
  const [amenitySklep, setAmenitySklep] = useState(false);
  const [amenityParkovani, setAmenityParkovani] = useState(false);
  const [druhPozemku, setDruhPozemku] = useState<LandType>('');
  const [plyn, setPlyn] = useState('');
  const [voda, setVoda] = useState('');
  const [elektrina, setElektrina] = useState('');
  const [kanalizace, setKanalizace] = useState('');

  const [stari, setStari] = useState<'new' | 'old' | ''>('');
  const [stavba, setStavba] = useState<'drevo' | 'zdena' | ''>('');
  const [vlastnictvi, setVlastnictvi] = useState<OwnershipType>('');
  const [vybaveni, setVybaveni] = useState<FurnishingType>('');
  const [interier, setInterier] = useState<'novy' | 'uzivany' | ''>('');

  const [stepError, setStepError] = useState('');
  const [invalidPulse, setInvalidPulse] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());
  const stepOneFollowupRef = useRef<HTMLHeadingElement | null>(null);

  // ── API-based price estimate ─────────────────────────────────────────────────
  const [apiEstimate, setApiEstimate] = useState<PriceEstimateOutput | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiSource, setApiSource] = useState<'api' | 'local' | null>(null);

  const fetchApiEstimate = useCallback(async () => {
    if (propertyType === 'pozemek') return; // pozemky nemáme srovnatelná data
    const areaNum = parseFloat(plochaHlavni);
    if (!areaNum || !address.trim()) return;

    const catMain = propertyType === 'byt' ? 'Byty' : propertyType === 'dum' ? 'Domy' : 'Byty';
    const catType = estimateType === 'rent' ? 'Pronájem' : 'Prodej';

    setApiLoading(true);
    setApiEstimate(null);
    setApiSource(null);

    const result = await estimatePriceFromData({
      address,
      area: areaNum,
      categoryMain: catMain,
      categoryType: catType,
      disposition: dispozice || undefined,
      features: {
        terrace:            amenityTerasa,
        balcony:            amenityBalkon,
        garage:             amenityParkovani, // parking ~ garáž v kontextu kalkulačky
        cellar:             amenitySklep,
        brick:              stavba === 'zdena',
        panel:              false,
        newBuilding:        stari === 'new',
        afterReconstruction:interier === 'novy' && stari !== 'new',
        inReconstruction:   false,
        personalOwnership:  vlastnictvi === 'osobni',
        cooperativeOwnership: vlastnictvi === 'druzstevni',
        furnished:          vybaveni === 'zarizeny',
        partlyFurnished:    false,
      },
    });

    setApiLoading(false);
    if (result && !result.error) {
      setApiEstimate(result);
      setApiSource('api');
    } else {
      setApiSource('local');
    }
  }, [
    address, amenityBalkon, amenityParkovani, amenitySklep, amenityTerasa,
    dispozice, estimateType, interier, plochaHlavni, propertyType,
    stari, stavba, vlastnictvi, vybaveni,
  ]);

  // Trigger API estimate when user reaches step 9
  useEffect(() => {
    if (step === 9) {
      fetchApiEstimate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const progress = STEP_PROGRESS[step - 1];
  const hasAddressResult = address.trim().length > 8;
  const isLegalByt = estimateType === 'legal' && propertyType === 'byt';
  const visibleSteps: Step[] = propertyType === 'pozemek'
    ? [1, 2, 3, 4, 5, 8, 9]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    const raw = Number(searchParams.get('step') || 1);
    const requested = Math.min(9, Math.max(1, Number.isFinite(raw) ? raw : 1)) as Step;
    let safe = requested > maxUnlockedStep ? maxUnlockedStep : requested;
    if (propertyType === 'pozemek' && (safe === 6 || safe === 7)) {
      safe = 5;
    }

    setStep(safe);

    if (safe !== requested) {
      setSearchParams({ step: String(safe) }, { replace: true });
    }
  }, [maxUnlockedStep, propertyType, searchParams, setSearchParams]);

  useEffect(() => {
    if (step === 1 && estimateType === null) {
      setReason(null);
    }
  }, [estimateType, step]);

  // Clear validation state when step changes
  useEffect(() => {
    setFieldErrors(new Set());
    setStepError('');
  }, [step]);

  const summary = useMemo(
    () => {
      if (propertyType === 'byt') {
        return [
          `Byt, ${dispozice || '-'}, ${plochaHlavni || '-'}m²`,
          address || 'Klausova 2559/11, 155 00 Praha 5 – Stodůlky',
          `Patro: ${patro || '-'}`,
          `Balkon/lodžie: ${amenityBalkon ? `ano (${balkonPlocha || '-'} m²)` : 'ne'}`,
          `Terasa: ${amenityTerasa ? 'ano' : 'ne'}`,
          `Zahrada: ${amenityZahrada ? 'ano' : 'ne'}`,
          `Sklep: ${amenitySklep ? 'ano' : 'ne'}`,
          `Parkování: ${amenityParkovani ? 'ano' : 'ne'}`,
          `Stáří: ${stari === 'new' ? 'novostavba' : stari === 'old' ? '12 let a starší' : '-'}`,
          `Vlastnictví: ${vlastnictvi === 'osobni' ? 'osobní' : vlastnictvi === 'druzstevni' ? 'družstevní' : '-'}`,
          `Stav interiéru: ${interier === 'novy' ? 'nový' : interier === 'uzivany' ? 'užívaný' : '-'}`,
        ];
      }

      if (propertyType === 'pozemek') {
        return [
          `Pozemek, ${druhPozemku || '-'}`,
          `Obec: ${obec || '-'}`,
          `Část obce: ${castObce || '-'}`,
          `Parcelní číslo: ${parcelniCislo || '-'}`,
          `Plocha pozemku: ${plochaPozemku || '-'}m²`,
          `Plyn: ${plyn || '-'}`,
          `Voda: ${voda || '-'}`,
          `Elektřina: ${elektrina || '-'}`,
          `Kanalizace: ${kanalizace || '-'}`,
        ];
      }

      if (estimateType === 'rent') {
        return [
          `${propertyType === 'dum' ? 'Dům' : 'Byt'}, ${dispozice || '-'}, ${plochaHlavni || '-'}m²`,
          address || 'Klausova 2559/11, 155 00 Praha 5 – Stodůlky',
          `Patro: ${patro || '-'}`,
          `Balkon/lodžie: ${amenityBalkon ? `ano (${balkonPlocha || '-'} m²)` : 'ne'}`,
          `Terasa: ${amenityTerasa ? 'ano' : 'ne'}`,
          `Zahrada: ${amenityZahrada ? 'ano' : 'ne'}`,
          `Sklep: ${amenitySklep ? 'ano' : 'ne'}`,
          `Parkování: ${amenityParkovani ? 'ano' : 'ne'}`,
          `Stáří: ${stari === 'new' ? 'novostavba' : stari === 'old' ? '12 let a starší' : '-'}`,
          `Vlastnictví: ${vlastnictvi === 'osobni' ? 'osobní' : vlastnictvi === 'druzstevni' ? 'družstevní' : '-'}`,
          `Vybavení: ${vybaveni === 'zarizeny' ? 'zařízený' : vybaveni === 'nezarizeny' ? 'nezařízený' : '-'}`,
          `Stav interiéru: ${interier === 'novy' ? 'nový' : interier === 'uzivany' ? 'užívaný' : '-'}`,
        ];
      }

      return [
        `${propertyType || 'Dům'}, ${dispozice || '2+kk a méně'}, ${plochaHlavni || '120'}m²`,
        address || 'Klausova 2559/11, 155 00 Praha 5 – Stodůlky',
        `Typ domu: ${typDomu || 'řadový'}`,
        `Využití: ${vyuziti || 'rekreace / chata'}`,
        `Plocha pozemku: ${plochaPozemku || '500'}m²`,
        `Plocha vedlejších staveb: ${plochaVedlejsi || '10'}m²`,
        `Stáří: ${stari === 'new' ? 'nový' : stari === 'old' ? '12 let a starší' : '-'}`,
        `Stavba: ${stavba === 'drevo' ? 'dřevostavba' : stavba === 'zdena' ? 'zděná' : '-'}`,
        `Stav interiéru: ${interier === 'novy' ? 'nový' : interier === 'uzivany' ? 'užívaný' : '-'}`,
      ];
    },
    [
      address,
      castObce,
      amenityBalkon,
      amenityParkovani,
      amenitySklep,
      amenityTerasa,
      amenityZahrada,
      balkonPlocha,
      druhPozemku,
      elektrina,
      kanalizace,
      dispozice,
      interier,
      obec,
      parcelniCislo,
      patro,
      plyn,
      plochaHlavni,
      plochaPozemku,
      plochaVedlejsi,
      propertyType,
      stari,
      stavba,
      typDomu,
      vlastnictvi,
      vybaveni,
      voda,
      vyuziti,
    ],
  );

  const priceResult = useMemo<PriceResult | null>(
    () => computePrice({
      estimateType, propertyType, address, obec, dispozice,
      plochaHlavni, plochaVedlejsi, plochaPozemku, patro,
      amenityBalkon, balkonPlocha, amenityTerasa, amenityZahrada,
      amenitySklep, amenityParkovani, stari, vlastnictvi, interier,
      vybaveni, typDomu, vyuziti, stavba, druhPozemku,
      plyn, voda, elektrina, kanalizace,
    }),
    [
      estimateType, propertyType, address, obec, dispozice,
      plochaHlavni, plochaVedlejsi, plochaPozemku, patro,
      amenityBalkon, balkonPlocha, amenityTerasa, amenityZahrada,
      amenitySklep, amenityParkovani, stari, vlastnictvi, interier,
      vybaveni, typDomu, vyuziti, stavba, druhPozemku,
      plyn, voda, elektrina, kanalizace,
    ],
  );

  /**
   * Clear a specific field error. When all field errors are cleared, also clears
   * the step error message so the NEXT button returns to green.
   */
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = new Set(prev);
      next.delete(field);
      if (next.size === 0) {
        setStepError('');
      }
      return next;
    });
  };

  const triggerInvalid = (message: string) => {
    setStepError(message);
    // Pulse triggers the shake animation; the red color persists via stepError
    setInvalidPulse(true);
    window.setTimeout(() => setInvalidPulse(false), 520);
  };

  const validateCurrentStep = (): boolean => {
    const errors = new Set<string>();
    let errorMessage = '';

    if (step === 1) {
      if (!estimateType) {
        errors.add('estimateType');
        errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
      } else if (estimateType !== 'legal' && !reason) {
        errors.add('reason');
        errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
      }
    }

    if (step === 2 && !propertyType) {
      errors.add('propertyType');
      errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
    }

    if (step === 3) {
      if (propertyType === 'pozemek') {
        if (!obec.trim()) errors.add('obec');
        if (!castObce.trim()) errors.add('castObce');
        if (errors.size > 0) errorMessage = 'Vyplňte prosím obec a část obce.';
      } else if (address.trim().length < 8) {
        errors.add('address');
        errorMessage = 'Zadejte prosím úplnou adresu.';
      }
    }

    if (step === 4) {
      if (propertyType === 'pozemek') {
        if (!plochaPozemku) errors.add('plochaPozemku');
        if (!druhPozemku) errors.add('druhPozemku');
      } else if (estimateType === 'rent') {
        if (!dispozice) errors.add('dispozice');
        if (!plochaHlavni) errors.add('plochaHlavni');
        if (!patro) errors.add('patro');
      } else if (!dispozice) {
        errors.add('dispozice');
      }
      if (propertyType === 'byt') {
        if (!plochaHlavni) errors.add('plochaHlavni');
        if (!patro) errors.add('patro');
      } else if (propertyType !== 'pozemek' && estimateType !== 'rent') {
        if (!vyuziti) errors.add('vyuziti');
        if (!typDomu) errors.add('typDomu');
      }
      if (errors.size > 0) errorMessage = 'Vyplňte prosím všechna povinná pole.';
    }

    if (step === 5) {
      if (propertyType === 'pozemek') {
        if (!plyn) errors.add('plyn');
        if (!voda) errors.add('voda');
        if (!elektrina) errors.add('elektrina');
        if (!kanalizace) errors.add('kanalizace');
        if (errors.size > 0) errorMessage = 'Vyplňte prosím dostupné inženýrské sítě.';
      } else if (isLegalByt) {
        if (!stari) errors.add('stari');
        if (!vlastnictvi) errors.add('vlastnictvi');
        if (errors.size > 0) errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
      } else if (propertyType === 'byt') {
        if (amenityBalkon && !balkonPlocha) errors.add('balkonPlocha');
        if (errors.size > 0) errorMessage = 'Doplňte prosím velikost balkonu/lodžie.';
      } else {
        if (!plochaHlavni) errors.add('plochaHlavni');
        if (!plochaPozemku) errors.add('plochaPozemku');
        if (errors.size > 0) errorMessage = 'Vyplňte prosím všechna povinná pole.';
      }
    }

    if (step === 6) {
      if (isLegalByt) {
        if (!interier) errors.add('interier');
        if (errors.size > 0) errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
      } else {
      if (!stari) errors.add('stari');
      if (propertyType === 'byt' || estimateType === 'rent') {
        if (!vlastnictvi) errors.add('vlastnictvi');
      } else if (!stavba) {
        errors.add('stavba');
      }
      if (estimateType === 'rent' && !vybaveni) {
        errors.add('vybaveni');
      }
      if (errors.size > 0) errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
      }
    }

    if (step === 7 && !interier && propertyType !== 'pozemek' && !isLegalByt) {
      errors.add('interier');
      errorMessage = tr('Vyberte prosím jednu z možností.', 'Please select one of the options.');
    }

    if (errors.size > 0) {
      setFieldErrors(errors);
      triggerInvalid(errorMessage);
      return false;
    }

    setFieldErrors(new Set());
    setStepError('');
    return true;
  };

  const goToStep = (target: Step) => {
    const safe = target > maxUnlockedStep ? maxUnlockedStep : target;
    setFieldErrors(new Set());
    setStepError('');
    setSearchParams({ step: String(safe) });
    setDropdownOpen(false);
  };

  const next = () => {
    if (step === 9) return;

    if (!validateCurrentStep()) {
      return;
    }

    let candidate = (step + 1) as Step;
    if (propertyType === 'pozemek' && step === 5) {
      candidate = 8;
    }
    setMaxUnlockedStep((prev) => (candidate > prev ? candidate : prev));
    setSearchParams({ step: String(candidate) });
  };

  const prev = () => {
    if (step > 1) {
      setFieldErrors(new Set());
      setStepError('');
      const previous = propertyType === 'pozemek' && step === 8 ? 5 : step - 1;
      setSearchParams({ step: String(previous) });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (step !== 1 || !estimateType || window.innerWidth > 767) return;

    const id = window.setTimeout(() => {
      stepOneFollowupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    return () => window.clearTimeout(id);
  }, [estimateType, step]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step]);

  return (
    <div className="calc-page" data-step={step}>
      <Seo
        title="Online kalkulačka ceny nemovitosti zdarma | Online-Odhad.cz"
        description="Zjistěte orientační tržní cenu bytu, domu nebo pozemku během 3 minut. Bezplatná online kalkulačka nemovitostí bez zadání kontaktních údajů – celá ČR."
        canonical="/online-kalkulacka"
      />
      {/* Menu overlay — rendered outside calc-scale-wrap so it covers full viewport
          (transform on parent would break fixed positioning otherwise) */}
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

      <div className="calc-scale-wrap">
        <div className="calc-scale-content">
          <CalculatorHeader onMenuClick={() => setMenuOpen(true)} />

          <div className="calc-progress-track">
            <div className="calc-progress-fill" style={{ width: `${progress}%` }} />
            <span
              className="calc-progress-badge"
              style={{
                left: step === 1
                  ? `clamp(62px, calc(${progress}% - 10px), calc(100% - 72px))`
                  : `clamp(72px, ${progress}%, calc(100% - 72px))`,
              }}
            >
              {progress} % hotovo
            </span>
          </div>

          <div className="calc-layout">
            <aside className="calc-left-panel">
              <div className="calc-step-select-wrap">
                <button type="button" className="calc-step-select" onClick={() => setDropdownOpen((v) => !v)}>
                  <span className="calc-step-select-prefix">{step}. krok</span>
                  <strong>{STEP_LABELS[locale][step - 1]}</strong>
                  <span className="calc-step-caret">▾</span>
                </button>

                {dropdownOpen && (
                  <div className="calc-step-dropdown">
                    {visibleSteps.filter((s) => s <= step).map((s) => {
                      const label = STEP_LABELS[locale][s - 1];
                      return (
                        <button
                          key={label}
                          type="button"
                          className={`calc-step-option${s === step ? ' is-active' : ''}`}
                          onClick={() => {
                            goToStep(s);
                          }}
                        >
                          <span>{locale === 'en' ? `${s}. step` : `${s}. krok`}</span>
                          <strong>{label}</strong>
                          {s === step && <span className="calc-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <h2 className="calc-left-title">{stepHeadline(step, propertyType, estimateType, locale)}</h2>

              <div className={`calc-left-visual calc-left-visual-step-${step}`}>
                <img src={STEP_IMAGES[step]} alt="Ilustrace kroku" />
                <span className="calc-shape calc-shape-a" />
                <span className="calc-shape calc-shape-b" />
              </div>

              {step === 9 && (
                <div className="calc-result-actions-left">
                  <button type="button" className="calc-outline-btn">{tr('ZASLAT DO E-MAILU', 'SEND TO EMAIL')}</button>
                  <button type="button" className="calc-outline-btn">{tr('AUTOMATICKÉ SLEDOVÁNÍ TRŽNÍ CENY', 'AUTOMATIC PRICE TRACKING')}</button>
                </div>
              )}
            </aside>

            <section className="calc-main-panel">
              {step === 1 && (
                <>
                  <div className="calc-grid-3">
                    <OptionCard
                      label={tr('Prodej / koupě', 'Sale / purchase')}
                      active={estimateType === 'sale'}
                      groupError={fieldErrors.has('estimateType')}
                      onClick={() => {
                        setEstimateType('sale');
                        clearFieldError('estimateType');
                      }}
                    />
                    <OptionCard
                      label={tr('Pronájem', 'Rent')}
                      active={estimateType === 'rent'}
                      groupError={fieldErrors.has('estimateType')}
                      onClick={() => {
                        setEstimateType('rent');
                        clearFieldError('estimateType');
                      }}
                    />
                    <OptionCard
                      label={tr('Dědické řízení', 'Inheritance proceedings')}
                      extra={tr('Vyrovnání spolumajitelů', 'Co-owner settlement')}
                      active={estimateType === 'legal'}
                      groupError={fieldErrors.has('estimateType')}
                      onClick={() => {
                        setEstimateType('legal');
                        clearFieldError('estimateType');
                      }}
                    />
                  </div>

                  {estimateType && estimateType !== 'legal' && (
                    <>
                      <h3 ref={stepOneFollowupRef} className="calc-subtitle">{tr('Co Vás k nám přivedlo?', 'What brought you here?')}</h3>
                      <div className="calc-grid-3">
                        <OptionCard
                          label={estimateType === 'rent' ? tr('Chystám se pronajmout', 'I plan to rent out') : tr('Budu prodávat', 'I will sell')}
                          active={reason === 'sell'}
                          groupError={fieldErrors.has('reason')}
                          onClick={() => { setReason('sell'); clearFieldError('reason'); }}
                        />
                        <OptionCard
                          label={estimateType === 'rent' ? tr('Hledám pronájem', 'I am looking for rent') : tr('Budu kupovat', 'I will buy')}
                          active={reason === 'buy'}
                          groupError={fieldErrors.has('reason')}
                          onClick={() => { setReason('buy'); clearFieldError('reason'); }}
                        />
                        <OptionCard
                          label={tr('Pouze zajímavost', 'Just curiosity')}
                          active={reason === 'interest'}
                          groupError={fieldErrors.has('reason')}
                          onClick={() => { setReason('interest'); clearFieldError('reason'); }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <div className={`calc-grid-3${estimateType === 'rent' ? ' calc-grid-2' : ''}`}>
                  <OptionCard
                    label={tr('Byt', 'Apartment')}
                    active={propertyType === 'byt'}
                    groupError={fieldErrors.has('propertyType')}
                    onClick={() => { setPropertyType('byt'); clearFieldError('propertyType'); }}
                  />
                  <OptionCard
                    label={tr('Dům', 'House')}
                    active={propertyType === 'dum'}
                    groupError={fieldErrors.has('propertyType')}
                    onClick={() => { setPropertyType('dum'); clearFieldError('propertyType'); }}
                  />
                  {estimateType !== 'rent' && (
                    <OptionCard
                      label={tr('Pozemek', 'Land')}
                      active={propertyType === 'pozemek'}
                      groupError={fieldErrors.has('propertyType')}
                      onClick={() => { setPropertyType('pozemek'); clearFieldError('propertyType'); }}
                    />
                  )}
                </div>
              )}

              {step === 3 && (
                propertyType === 'pozemek' ? (
                  <div className="calc-form-col calc-form-narrow">
                    <label>Obec *</label>
                    <input
                      value={obec}
                      onChange={(e) => { setObec(e.target.value); clearFieldError('obec'); }}
                      className={`calc-input${fieldErrors.has('obec') ? ' is-error' : ''}`}
                    />

                    <label>Část obce *</label>
                    <select
                      value={castObce}
                      onChange={(e) => { setCastObce(e.target.value); clearFieldError('castObce'); }}
                      className={`calc-input${fieldErrors.has('castObce') ? ' is-error' : ''}`}
                    >
                      <option value="">Vyberte</option>
                      <option>Březiněves</option>
                      <option>Centrum</option>
                      <option>Okraj obce</option>
                    </select>

                    <label>Parcelní číslo</label>
                    <input
                      value={parcelniCislo}
                      onChange={(e) => setParcelniCislo(e.target.value)}
                      className="calc-input"
                    />
                  </div>
                ) : (
                  <div className="calc-form-col">
                    <label>Ulice a číslo popisné *</label>
                    <input
                      value={address}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAddress(val);
                        if (fieldErrors.has('address') && val.trim().length >= 8) {
                          clearFieldError('address');
                        }
                      }}
                      placeholder="Klausova 2559/11, 155 00 Praha 5 – Stodůlky"
                      className={`calc-input${fieldErrors.has('address') ? ' is-error' : ''}`}
                    />

                    {!hasAddressResult ? (
                      <div className="calc-note warning">
                        <strong>Zadejte prosím úplnou adresu</strong> pomocí našeho našeptávače včetně čísla popisného.
                        Systém při výpočtu zohledňuje přesné umístění nemovitosti.
                      </div>
                    ) : (
                      <>
                        <div className="calc-note success">Adresa úspěšně nalezena.</div>
                        <div className="calc-map-placeholder" />
                      </>
                    )}
                  </div>
                )
              )}

              {step === 4 && (
                propertyType === 'byt' || estimateType === 'rent' ? (
                  <div className="calc-form-col calc-form-narrow">
                    <label>Dispozice *</label>
                    <select
                      value={dispozice}
                      onChange={(e) => { setDispozice(e.target.value); clearFieldError('dispozice'); }}
                      className={`calc-input${fieldErrors.has('dispozice') ? ' is-error' : ''}`}
                    >
                      <option value="">Vyberte</option>
                      <option>1+kk</option>
                      <option>2+kk</option>
                      <option>2+1</option>
                      <option>3+kk</option>
                      <option>3+1</option>
                      <option>4+kk a více</option>
                    </select>

                    <label>Užitná plocha *</label>
                    <div className="calc-input-unit-wrap">
                      <input
                        value={plochaHlavni}
                        onChange={(e) => { setPlochaHlavni(e.target.value); clearFieldError('plochaHlavni'); }}
                        className={`calc-input${fieldErrors.has('plochaHlavni') ? ' is-error' : ''}`}
                      />
                      <span>m²</span>
                    </div>

                    <div className="calc-note warning">
                      <span className="calc-note-icon">i</span>
                      <p>
                        Do užitné plochy se zahrnuje vše co je za vstupními dveřmi, ale nezahrnuje se balkón,
                        lodžie, terasa, sklep, zahrádka atd.
                      </p>
                    </div>

                    <label>Patro *</label>
                    <select
                      value={patro}
                      onChange={(e) => { setPatro(e.target.value); clearFieldError('patro'); }}
                      className={`calc-input${fieldErrors.has('patro') ? ' is-error' : ''}`}
                    >
                      <option value="">Vyberte</option>
                      <option value="prizemi">Přízemí</option>
                      <option value="1">1. patro</option>
                      <option value="2">2. patro</option>
                      <option value="3plus">3. patro a výše</option>
                    </select>
                  </div>
                ) : (
                  <div className="calc-form-col calc-form-narrow">
                    {propertyType === 'pozemek' ? (
                      <>
                        <label>Plocha pozemku *</label>
                        <div className="calc-input-unit-wrap">
                          <input
                            value={plochaPozemku}
                            onChange={(e) => { setPlochaPozemku(e.target.value); clearFieldError('plochaPozemku'); }}
                            className={`calc-input${fieldErrors.has('plochaPozemku') ? ' is-error' : ''}`}
                          />
                          <span>m²</span>
                        </div>

                        <div className={fieldErrors.has('druhPozemku') ? 'is-error-group' : ''}>
                          <h3>Druh pozemku *</h3>
                          <label className="calc-radio-line">
                            <input type="radio" checked={druhPozemku === 'stavebni-bydleni'} onChange={() => { setDruhPozemku('stavebni-bydleni'); clearFieldError('druhPozemku'); }} />
                            <span>Stavební – bydlení</span>
                          </label>
                          <label className="calc-radio-line">
                            <input type="radio" checked={druhPozemku === 'stavebni-rekreace'} onChange={() => { setDruhPozemku('stavebni-rekreace'); clearFieldError('druhPozemku'); }} />
                            <span>Stavební – rekreace</span>
                          </label>
                          <label className="calc-radio-line">
                            <input type="radio" checked={druhPozemku === 'orna-puda'} onChange={() => { setDruhPozemku('orna-puda'); clearFieldError('druhPozemku'); }} />
                            <span>Orná půda / louka</span>
                          </label>
                          <label className="calc-radio-line">
                            <input type="radio" checked={druhPozemku === 'ostatni'} onChange={() => { setDruhPozemku('ostatni'); clearFieldError('druhPozemku'); }} />
                            <span>Ostatní</span>
                          </label>
                        </div>
                      </>
                    ) : (
                      <>
                        <label>Dispozice *</label>
                        <select
                          value={dispozice}
                          onChange={(e) => { setDispozice(e.target.value); clearFieldError('dispozice'); }}
                          className={`calc-input${fieldErrors.has('dispozice') ? ' is-error' : ''}`}
                        >
                          <option value="">Vyberte</option>
                          <option>2+kk a méně</option>
                          <option>3+kk</option>
                          <option>4+kk a více</option>
                        </select>

                        <label>Využití *</label>
                        <select
                          value={vyuziti}
                          onChange={(e) => { setVyuziti(e.target.value); clearFieldError('vyuziti'); }}
                          className={`calc-input${fieldErrors.has('vyuziti') ? ' is-error' : ''}`}
                        >
                          <option value="">Vyberte</option>
                          <option>Bydlení</option>
                          <option>Rekreace / chata</option>
                        </select>

                        <label>Typ domu *</label>
                        <select
                          value={typDomu}
                          onChange={(e) => { setTypDomu(e.target.value); clearFieldError('typDomu'); }}
                          className={`calc-input${fieldErrors.has('typDomu') ? ' is-error' : ''}`}
                        >
                          <option value="">Vyberte</option>
                          <option>Řadový</option>
                          <option>Samostatný</option>
                          <option>Dvojdům</option>
                        </select>
                      </>
                    )}
                  </div>
                )
              )}

              {step === 5 && (
                isLegalByt ? (
                  <div className="calc-radio-groups">
                    <div className={fieldErrors.has('stari') ? 'is-error-group' : ''}>
                      <h3>Stáří *</h3>
                      <label className="calc-radio-line">
                        <input type="radio" checked={stari === 'new'} onChange={() => { setStari('new'); clearFieldError('stari'); }} />
                        <span>Novostavba</span>
                      </label>
                      <label className="calc-radio-line">
                        <input type="radio" checked={stari === 'old'} onChange={() => { setStari('old'); clearFieldError('stari'); }} />
                        <span>12 let a starší</span>
                      </label>
                    </div>

                    <div className={fieldErrors.has('vlastnictvi') ? 'is-error-group' : ''}>
                      <h3>Vlastnictví *</h3>
                      <label className="calc-radio-line">
                        <input type="radio" checked={vlastnictvi === 'osobni'} onChange={() => { setVlastnictvi('osobni'); clearFieldError('vlastnictvi'); }} />
                        <span>Osobní</span>
                      </label>
                      <label className="calc-radio-line">
                        <input type="radio" checked={vlastnictvi === 'druzstevni'} onChange={() => { setVlastnictvi('druzstevni'); clearFieldError('vlastnictvi'); }} />
                        <span>Družstevní</span>
                      </label>
                    </div>
                  </div>
                ) : propertyType === 'byt' || estimateType === 'rent' ? (
                  <div className="calc-form-col calc-form-narrow">
                    <div className="calc-amenity-row">
                      <h3>Lodžie a balkon</h3>
                      <label className="calc-switch">
                        <input
                          type="checkbox"
                          checked={amenityBalkon}
                          onChange={(e) => {
                            setAmenityBalkon(e.target.checked);
                            if (!e.target.checked) {
                              setBalkonPlocha('');
                              clearFieldError('balkonPlocha');
                            }
                          }}
                        />
                        <span />
                      </label>
                    </div>

                    {amenityBalkon && (
                      <div className="calc-amenity-subrow">
                        <label>Velikost balkonu *</label>
                        <div className="calc-input-unit-wrap">
                          <input
                            value={balkonPlocha}
                            onChange={(e) => { setBalkonPlocha(e.target.value); clearFieldError('balkonPlocha'); }}
                            className={`calc-input${fieldErrors.has('balkonPlocha') ? ' is-error' : ''}`}
                          />
                          <span>m²</span>
                        </div>
                      </div>
                    )}

                    <div className="calc-amenity-row">
                      <h3>Terasa</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityTerasa} onChange={(e) => setAmenityTerasa(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Zahrada</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityZahrada} onChange={(e) => setAmenityZahrada(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Sklep</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenitySklep} onChange={(e) => setAmenitySklep(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Parkování</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityParkovani} onChange={(e) => setAmenityParkovani(e.target.checked)} />
                        <span />
                      </label>
                    </div>
                  </div>
                ) : (
                  propertyType === 'pozemek' ? (
                    <div className="calc-form-col calc-form-narrow">
                      <label>Plyn *</label>
                      <select
                        value={plyn}
                        onChange={(e) => { setPlyn(e.target.value); clearFieldError('plyn'); }}
                        className={`calc-input${fieldErrors.has('plyn') ? ' is-error' : ''}`}
                      >
                        <option value="">Vyberte</option>
                        <option>Přípojka na pozemku</option>
                        <option>Do 10 m s možností přípojky</option>
                        <option>Nedostupné</option>
                      </select>

                      <label>Voda *</label>
                      <select
                        value={voda}
                        onChange={(e) => { setVoda(e.target.value); clearFieldError('voda'); }}
                        className={`calc-input${fieldErrors.has('voda') ? ' is-error' : ''}`}
                      >
                        <option value="">Vyberte</option>
                        <option>Přípojka na pozemku</option>
                        <option>Do 10 m s možností přípojky</option>
                        <option>Nedostupné</option>
                      </select>

                      <label>Elektřina *</label>
                      <select
                        value={elektrina}
                        onChange={(e) => { setElektrina(e.target.value); clearFieldError('elektrina'); }}
                        className={`calc-input${fieldErrors.has('elektrina') ? ' is-error' : ''}`}
                      >
                        <option value="">Vyberte</option>
                        <option>Přípojka na pozemku</option>
                        <option>Do 10 m s možností přípojky</option>
                        <option>Nedostupné</option>
                      </select>

                      <label>Kanalizace *</label>
                      <select
                        value={kanalizace}
                        onChange={(e) => { setKanalizace(e.target.value); clearFieldError('kanalizace'); }}
                        className={`calc-input${fieldErrors.has('kanalizace') ? ' is-error' : ''}`}
                      >
                        <option value="">Vyberte</option>
                        <option>Přípojka na pozemku</option>
                        <option>Do 10 m s možností přípojky</option>
                        <option>Nedostupné</option>
                      </select>
                    </div>
                  ) : (
                    <div className="calc-form-with-aside">
                      <div className="calc-form-col calc-form-narrow">
                        <label>Plocha obytných prostor *</label>
                        <div className="calc-input-unit-wrap">
                          <input
                            value={plochaHlavni}
                            onChange={(e) => { setPlochaHlavni(e.target.value); clearFieldError('plochaHlavni'); }}
                            className={`calc-input${fieldErrors.has('plochaHlavni') ? ' is-error' : ''}`}
                          />
                          <span>m²</span>
                        </div>
                        <p className="calc-inline-tip">Zadejte užitnou plochu včetně sklepů, prostoru schodišť a ostatních ploch v hlavní budově.</p>

                        <label>Plocha vedlejších staveb</label>
                        <div className="calc-input-unit-wrap">
                          <input value={plochaVedlejsi} onChange={(e) => setPlochaVedlejsi(e.target.value)} className="calc-input" />
                          <span>m²</span>
                        </div>
                        <p className="calc-inline-tip">Zadejte plochu vedlejších staveb (např.: stodoly, dílny, samostatné garáže, hospodářské budovy).</p>

                        <label>Plocha pozemku *</label>
                        <div className="calc-input-unit-wrap">
                          <input
                            value={plochaPozemku}
                            onChange={(e) => { setPlochaPozemku(e.target.value); clearFieldError('plochaPozemku'); }}
                            className={`calc-input${fieldErrors.has('plochaPozemku') ? ' is-error' : ''}`}
                          />
                          <span>m²</span>
                        </div>
                      </div>

                      <div className="calc-right-illustration-col">
                        <div className="calc-ill-card" />
                        <div className="calc-ill-card" />
                        <div className="calc-ill-card" />
                      </div>
                    </div>
                  )
                )
              )}

              {step === 6 && (
                isLegalByt ? (
                  <div className="calc-radio-groups">
                    <div className={fieldErrors.has('interier') ? 'is-error-group' : ''}>
                      <h3>Stav interiéru *</h3>
                      <label className="calc-radio-line with-sub">
                        <input type="radio" checked={interier === 'novy'} onChange={() => { setInterier('novy'); clearFieldError('interier'); }} />
                        <span>
                          Nový
                          <small>Do 3 let stáří</small>
                        </span>
                      </label>
                      <label className="calc-radio-line with-sub">
                        <input type="radio" checked={interier === 'uzivany'} onChange={() => { setInterier('uzivany'); clearFieldError('interier'); }} />
                        <span>
                          Užívaný
                          <small>Od 3 do 12 let stáří</small>
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="calc-radio-groups">
                    <div className={fieldErrors.has('stari') ? 'is-error-group' : ''}>
                      <h3>Stáří *</h3>
                      <label className="calc-radio-line">
                        <input type="radio" checked={stari === 'new'} onChange={() => { setStari('new'); clearFieldError('stari'); }} />
                        <span>Novostavba</span>
                      </label>
                      <label className="calc-radio-line">
                        <input type="radio" checked={stari === 'old'} onChange={() => { setStari('old'); clearFieldError('stari'); }} />
                        <span>12 let a starší</span>
                      </label>
                    </div>

                    {estimateType === 'rent' ? (
                      <>
                        <div className={fieldErrors.has('vlastnictvi') ? 'is-error-group' : ''}>
                          <h3>Vlastnictví *</h3>
                          <label className="calc-radio-line">
                            <input type="radio" checked={vlastnictvi === 'osobni'} onChange={() => { setVlastnictvi('osobni'); clearFieldError('vlastnictvi'); }} />
                            <span>Osobní</span>
                          </label>
                          <label className="calc-radio-line">
                            <input type="radio" checked={vlastnictvi === 'druzstevni'} onChange={() => { setVlastnictvi('druzstevni'); clearFieldError('vlastnictvi'); }} />
                            <span>Družstevní</span>
                          </label>
                        </div>

                        <div className={fieldErrors.has('vybaveni') ? 'is-error-group' : ''}>
                          <h3>Vybavení *</h3>
                          <label className="calc-radio-line">
                            <input type="radio" checked={vybaveni === 'zarizeny'} onChange={() => { setVybaveni('zarizeny'); clearFieldError('vybaveni'); }} />
                            <span>Zařízený</span>
                          </label>
                          <label className="calc-radio-line">
                            <input type="radio" checked={vybaveni === 'nezarizeny'} onChange={() => { setVybaveni('nezarizeny'); clearFieldError('vybaveni'); }} />
                            <span>Nezařízený</span>
                          </label>
                        </div>
                      </>
                    ) : propertyType === 'byt' ? (
                      <div className={fieldErrors.has('vlastnictvi') ? 'is-error-group' : ''}>
                        <h3>Vlastnictví *</h3>
                        <label className="calc-radio-line">
                          <input type="radio" checked={vlastnictvi === 'osobni'} onChange={() => { setVlastnictvi('osobni'); clearFieldError('vlastnictvi'); }} />
                          <span>Osobní</span>
                        </label>
                        <label className="calc-radio-line">
                          <input type="radio" checked={vlastnictvi === 'druzstevni'} onChange={() => { setVlastnictvi('druzstevni'); clearFieldError('vlastnictvi'); }} />
                          <span>Družstevní</span>
                        </label>
                      </div>
                    ) : (
                      <div className={fieldErrors.has('stavba') ? 'is-error-group' : ''}>
                        <h3>Stavba *</h3>
                        <label className="calc-radio-line">
                          <input type="radio" checked={stavba === 'drevo'} onChange={() => { setStavba('drevo'); clearFieldError('stavba'); }} />
                          <span>Dřevostavba</span>
                        </label>
                        <label className="calc-radio-line">
                          <input type="radio" checked={stavba === 'zdena'} onChange={() => { setStavba('zdena'); clearFieldError('stavba'); }} />
                          <span>Zděná</span>
                        </label>
                      </div>
                    )}
                  </div>
                )
              )}

              {step === 7 && (
                isLegalByt ? (
                  <div className="calc-form-col calc-form-narrow">
                    <div className="calc-amenity-row">
                      <h3>Lodžie a balkon</h3>
                      <label className="calc-switch">
                        <input
                          type="checkbox"
                          checked={amenityBalkon}
                          onChange={(e) => {
                            setAmenityBalkon(e.target.checked);
                            if (!e.target.checked) {
                              setBalkonPlocha('');
                              clearFieldError('balkonPlocha');
                            }
                          }}
                        />
                        <span />
                      </label>
                    </div>

                    {amenityBalkon && (
                      <div className="calc-amenity-subrow">
                        <label>Velikost balkonu *</label>
                        <div className="calc-input-unit-wrap">
                          <input
                            value={balkonPlocha}
                            onChange={(e) => { setBalkonPlocha(e.target.value); clearFieldError('balkonPlocha'); }}
                            className={`calc-input${fieldErrors.has('balkonPlocha') ? ' is-error' : ''}`}
                          />
                          <span>m²</span>
                        </div>
                      </div>
                    )}

                    <div className="calc-amenity-row">
                      <h3>Terasa</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityTerasa} onChange={(e) => setAmenityTerasa(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Zahrada</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityZahrada} onChange={(e) => setAmenityZahrada(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Sklep</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenitySklep} onChange={(e) => setAmenitySklep(e.target.checked)} />
                        <span />
                      </label>
                    </div>

                    <div className="calc-amenity-row">
                      <h3>Parkování</h3>
                      <label className="calc-switch">
                        <input type="checkbox" checked={amenityParkovani} onChange={(e) => setAmenityParkovani(e.target.checked)} />
                        <span />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="calc-radio-groups">
                    <div className={fieldErrors.has('interier') ? 'is-error-group' : ''}>
                      <h3>Stav interiéru *</h3>
                      <label className="calc-radio-line with-sub">
                        <input type="radio" checked={interier === 'novy'} onChange={() => { setInterier('novy'); clearFieldError('interier'); }} />
                        <span>
                          Nový
                          <small>Do 3 let stáří</small>
                        </span>
                      </label>
                      <label className="calc-radio-line with-sub">
                        <input type="radio" checked={interier === 'uzivany'} onChange={() => { setInterier('uzivany'); clearFieldError('interier'); }} />
                        <span>
                          Užívaný
                          <small>Od 3 do 12 let stáří</small>
                        </span>
                      </label>
                    </div>
                  </div>
                )
              )}

              {step === 8 && (
                <div className="calc-summary-block">
                  <h2>{tr('Souhrn', 'Summary')}</h2>
                  <ul>
                    {summary.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 9 && (
                <div className="calc-final-block">
                  <h3>
                    {priceResult?.isRent
                      ? tr('Váš odhad tržní nájemní ceny je:', 'Your estimated market rent is:')
                      : tr('Váš odhad tržní ceny je:', 'Your estimated market value is:')}
                  </h3>

                  {/* Loading spinner while API is fetching */}
                  {apiLoading && (
                    <p style={{ color: '#888', fontSize: '0.9em', marginBottom: '0.5rem' }}>
                      {tr('Načítám data z trhu…', 'Loading market data…')}
                    </p>
                  )}

                  {/* Prefer API estimate; fall back to local computation */}
                  {apiEstimate && !apiLoading ? (
                    <>
                      <strong>
                        {fmtCZK(apiEstimate.mid)}
                        {priceResult?.isRent ? tr(' / měsíc', ' / month') : ''}
                      </strong>
                      <p className="calc-price-range">
                        {tr('Orientační rozsah:', 'Estimated range:')}{' '}
                        {fmtCZK(apiEstimate.low)} – {fmtCZK(apiEstimate.high)}
                        {priceResult?.isRent ? tr(' / měsíc', ' / month') : ''}
                      </p>
                      <p style={{ fontSize: '0.78em', color: '#22c55e', marginTop: '0.25rem' }}>
                        {tr(
                          `✓ Na základě ${apiEstimate.comparablesCount} srovnatelných nemovitostí do ${apiEstimate.radiusKm} km`,
                          `✓ Based on ${apiEstimate.comparablesCount} comparable properties within ${apiEstimate.radiusKm} km`,
                        )}
                      </p>
                    </>
                  ) : !apiLoading && priceResult ? (
                    <>
                      <strong>
                        {fmtCZK(priceResult.mid)}
                        {priceResult.isRent ? tr(' / měsíc', ' / month') : ''}
                      </strong>
                      <p className="calc-price-range">
                        {tr('Orientační rozsah:', 'Estimated range:')}{' '}
                        {fmtCZK(priceResult.low)} – {fmtCZK(priceResult.high)}
                        {priceResult.isRent ? tr(' / měsíc', ' / month') : ''}
                      </p>
                      {apiSource === 'local' && (
                        <p style={{ fontSize: '0.78em', color: '#f59e0b', marginTop: '0.25rem' }}>
                          {tr('⚠ Orientační odhad (málo dat pro tuto lokalitu)', '⚠ Approximate estimate (limited data for this location)')}
                        </p>
                      )}
                    </>
                  ) : !apiLoading ? (
                    <strong>—</strong>
                  ) : null}
                  <hr />
                  <h4>ZANECHTE KONTAKT PRO NEZÁVAZNOU KONZULTACI</h4>

                  <div className="calc-final-form-grid">
                    <div className="calc-form-col">
                      <label>Jméno a příjmení *</label>
                      <input className="calc-input" />
                    </div>
                    <div className="calc-form-row-2">
                      <div>
                        <label>E-mail *</label>
                        <input className="calc-input" />
                      </div>
                      <div>
                        <label>Telefon *</label>
                        <input className="calc-input" />
                      </div>
                    </div>
                    <div className="calc-form-col calc-form-narrow">
                      <label>Vaše představa o ceně *</label>
                      <select className="calc-input">
                        <option>Vyberte</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {stepError && <p className="calc-step-error">{stepError}</p>}

              <div className={`calc-main-actions${step === 1 ? ' is-first-step' : ''}`}>
                {step > 1 && step < 9 && (
                  <button type="button" className="calc-back-btn" onClick={prev}>
                    {tr('◂ ZPĚT', '◂ BACK')}
                  </button>
                )}

                {step < 9 && (
                  <button
                    type="button"
                    className={`calc-next-btn${stepError ? ' is-error' : ''}${invalidPulse ? ' is-invalid' : ''}`}
                    onClick={next}
                  >
                    {step === 8 ? tr('ZOBRAZIT CENU', 'SHOW PRICE') : tr('DALŠÍ', 'NEXT')}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
