import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// CRM backend URL (pro cenové odhady)
const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Valuation Request ────────────────────────────────────────────────────────
// We create a Contact + Deal to represent an inbound valuation request

export interface ValuationRequestPayload {
  // Contact info
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  // Property info
  typNemovitosti: string;
  adresa: string;
  mesto: string;
  psc?: string;
  plocha?: number;
  rok?: number;
  popis?: string;
  // How did they find us
  zdrojInformaci?: string;
}

export interface ValuationRequestResponse {
  contactId: string;
  dealId: string;
  message: string;
}

export async function submitValuationRequest(
  data: ValuationRequestPayload,
): Promise<ValuationRequestResponse> {
  // 1. Create contact
  const contactRes = await api.post('/api/contacts', {
    firstName: data.jmeno,
    lastName: data.prijmeni,
    email: data.email,
    phone: data.telefon,
    source: data.zdrojInformaci || 'web',
    tags: ['online-odhad', 'web-dotaz'],
  });

  const contactId = contactRes.data.id;

  // 2. Create deal linked to the contact
  const dealRes = await api.post('/api/deals', {
    title: `Odhad nemovitosti – ${data.typNemovitosti} – ${data.mesto}`,
    stage: 'new',
    description: [
      `Typ: ${data.typNemovitosti}`,
      `Adresa: ${data.adresa}, ${data.psc || ''} ${data.mesto}`,
      data.plocha ? `Plocha: ${data.plocha} m²` : '',
      data.rok ? `Rok výstavby: ${data.rok}` : '',
      data.popis ? `Popis: ${data.popis}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    contactId,
    currency: 'CZK',
    probability: 20,
  });

  return {
    contactId,
    dealId: dealRes.data.id,
    message: 'Vaše žádost byla úspěšně odeslána.',
  };
}

// ─── Price Estimate (CRM backend — srovnávací metoda z reálných dat) ──────────

export interface PriceEstimateInput {
  address: string;
  area: number;
  categoryMain?: string;  // 'Byty' | 'Domy' | ...
  categoryType?: string;  // 'Prodej' | 'Pronájem'
  disposition?: string;
  features?: {
    terrace?: boolean;
    balcony?: boolean;
    garage?: boolean;
    elevator?: boolean;
    cellar?: boolean;
    parkingLot?: boolean;
    loggia?: boolean;
    brick?: boolean;
    panel?: boolean;
    newBuilding?: boolean;
    afterReconstruction?: boolean;
    inReconstruction?: boolean;
    personalOwnership?: boolean;
    cooperativeOwnership?: boolean;
    furnished?: boolean;
    partlyFurnished?: boolean;
  };
}

export interface PriceEstimateOutput {
  low: number;
  mid: number;
  high: number;
  basePricePerM2: number;
  adjustedPricePerM2: number;
  comparablesCount: number;
  radiusKm: number;
  geocoded: { lat: number; lon: number } | null;
  comparables: Array<{
    id: string;
    title: string;
    currentPrice: number;
    pricePerM2: number;
    usableArea: number;
    locality: string;
    distanceKm: number;
    disposition?: string;
  }>;
  featureCoefficients: Record<string, number>;
  error?: string;
}

export async function estimatePriceFromData(input: PriceEstimateInput): Promise<PriceEstimateOutput | null> {
  try {
    const res = await fetch(`${CRM_API_URL}/api/reality/price-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as PriceEstimateOutput;
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

export interface ContactFormPayload {
  jmeno: string;
  email: string;
  telefon?: string;
  zprava: string;
}

export async function submitContactForm(data: ContactFormPayload): Promise<void> {
  await api.post('/api/contacts', {
    firstName: data.jmeno.split(' ')[0],
    lastName: data.jmeno.split(' ').slice(1).join(' ') || '',
    email: data.email,
    phone: data.telefon,
    source: 'kontaktni-formular',
    notes: data.zprava,
  });
}
