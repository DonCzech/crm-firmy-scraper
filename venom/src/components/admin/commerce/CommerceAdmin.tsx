"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { DashboardTab } from "./DashboardTab";
import { ProductsTab } from "./ProductsTab";
import { OrdersTab } from "./OrdersTab";
import { CategoriesTab } from "./CategoriesTab";
import { CustomersTab } from "./CustomersTab";
import { SettingsTab } from "./SettingsTab";
import { MarketingTab } from "./MarketingTab";
import { ShippingPaymentsTab } from "./ShippingPaymentsTab";
import { StatsTab } from "./StatsTab";
import { ImportTab } from "./ImportTab";
import { FeedsTab } from "./FeedsTab";
import { DocumentsTab } from "./DocumentsTab";
import { ParamsTab } from "./ParamsTab";
import { GiftCardsTab } from "./GiftCardsTab";
import { LoyaltyTab } from "./LoyaltyTab";
import { SubscriptionsTab } from "./SubscriptionsTab";
import { WebhooksTab } from "./WebhooksTab";
import { ABTestsTab } from "./ABTestsTab";
import { StockMovementsTab } from "./StockMovementsTab";
import { BulkOperationsTab } from "./BulkOperationsTab";
import { TranslationsTab } from "./TranslationsTab";
import { AbandonedCartsTab } from "./AbandonedCartsTab";
import { SearchTab } from "./SearchTab";
import { ModulesTab } from "./ModulesTab";
import { EmailCampaignsTab } from "./EmailCampaignsTab";
import { SmsTab } from "./SmsTab";
import { AffiliatesTab } from "./AffiliatesTab";
import { SeoTab } from "./SeoTab";
import { StockSyncTab } from "./StockSyncTab";
import { AutoImportTab } from "./AutoImportTab";
import { BundlesTab } from "./BundlesTab";
import { WholesaleTab } from "./WholesaleTab";
import { ModuleGate } from "./ModuleGate";
import {
  COMMERCE_DEFAULT_DESIGN,
  CommerceThemeProvider,
  PageChromeContext,
  type CommerceAdminDesign,
} from "./shared";

type TabKey = "dashboard" | "orders" | "products" | "categories" | "customers" | "marketing" | "email-campaigns" | "sms" | "affiliates" | "seo" | "stock-sync" | "auto-import" | "bundles" | "wholesale" | "shipping" | "documents" | "stats" | "import" | "feeds" | "settings" | "params" | "gift-cards" | "loyalty" | "subscriptions" | "webhooks" | "ab-tests" | "stock-movements" | "bulk" | "translations" | "abandoned-carts" | "search" | "modules";

/** Admin taby vázané na placený modul — bez aktivace se místo obsahu ukáže ModuleGate. */
const TAB_MODULE: Partial<Record<TabKey, { slug: string; name: string; price: number }>> = {
  marketing: { slug: "slevove-kupony", name: "Slevové kupóny", price: 200 },
  "email-campaigns": { slug: "hromadne-emaily", name: "Hromadné rozesílání e-mailů", price: 100 },
  sms: { slug: "sms-upozorneni", name: "SMS upozornění", price: 100 },
  affiliates: { slug: "provizni-system", name: "Provizní (affiliate) systém", price: 200 },
  seo: { slug: "pokrocile-seo", name: "Pokročilé SEO", price: 100 },
  "stock-sync": { slug: "synchronizace-skladu", name: "Synchronizace skladu", price: 200 },
  "auto-import": { slug: "automaticky-import", name: "Automatický import", price: 200 },
  bundles: { slug: "sady-produktu", name: "Sady produktů", price: 100 },
  wholesale: { slug: "velkoobchod", name: "Velkoobchod (B2B)", price: 400 },
  loyalty: { slug: "vernostni-slevy", name: "Věrnostní slevy", price: 100 },
  "abandoned-carts": { slug: "opusteny-kosik", name: "Opuštěný košík", price: 200 },
  search: { slug: "chytre-vyhledavani", name: "Chytré vyhledávání", price: 300 },
  "stock-movements": { slug: "skladove-hospodarstvi", name: "Skladové hospodářství", price: 200 },
  import: { slug: "hromadne-importy", name: "Hromadné importy a exporty", price: 100 },
  bulk: { slug: "hromadne-importy", name: "Hromadné importy a exporty", price: 100 },
  translations: { slug: "cizi-jazyky", name: "Cizí jazyky", price: 400 },
};

const NAV_GROUPS: Array<{ label: string | null; keys: TabKey[] }> = [
  { label: null, keys: ["dashboard", "stats"] },
  { label: "Prodej", keys: ["orders", "abandoned-carts", "customers", "wholesale", "documents"] },
  { label: "Katalog", keys: ["products", "categories", "params", "bundles", "stock-movements", "stock-sync"] },
  { label: "Marketing", keys: ["marketing", "search", "email-campaigns", "sms", "affiliates", "gift-cards", "loyalty", "subscriptions", "ab-tests"] },
  { label: "Nástroje", keys: ["import", "auto-import", "bulk", "feeds", "seo", "translations", "webhooks"] },
  { label: "Nastavení", keys: ["shipping", "modules", "settings"] },
];

const NAV: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  {
    key: "dashboard", label: "Přehled",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>,
  },
  {
    key: "orders", label: "Objednávky",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1.2 12.1a1.8 1.8 0 0 1-1.8 1.6H9a1.8 1.8 0 0 1-1.8-1.6L6 7Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></svg>,
  },
  {
    key: "products", label: "Produkty",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8Z" /><path d="M3.3 8.3 12 13l8.7-4.7" /><path d="M12 13v8" /></svg>,
  },
  {
    key: "categories", label: "Kategorie",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  },
  {
    key: "customers", label: "Zákazníci",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><circle cx="17" cy="9" r="2.4" /><path d="M15.6 14.6c2.2.3 3.8 1.8 4.4 4.4" /></svg>,
  },
  {
    key: "marketing", label: "Marketing",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6 4.6L18.4 22 12 17.4 5.6 22l2.4-7.8-6-4.6h7.6z" /></svg>,
  },
  {
    key: "email-campaigns", label: "E-mail kampaně",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>,
  },
  {
    key: "sms", label: "SMS",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" /></svg>,
  },
  {
    key: "wholesale", label: "Velkoobchod",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-5h6v5" /><path d="M9 10h.01M15 10h.01M12 13h.01" /></svg>,
  },
  {
    key: "bundles", label: "Sady produktů",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>,
  },
  {
    key: "auto-import", label: "Auto import",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" /></svg>,
  },
  {
    key: "stock-sync", label: "Sync skladu",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" /><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" /><path d="M3 21v-5h5" /><path d="M21 3v5h-5" /></svg>,
  },
  {
    key: "seo", label: "SEO audit",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8.5 11.5 10.5 13.5 14 9.5" /></svg>,
  },
  {
    key: "affiliates", label: "Provize",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3.2" /><path d="M6.5 21c.5-3 2.5-5 5.5-5s5 2 5.5 5" /><path d="M17 3.5l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z" /></svg>,
  },
  {
    key: "shipping", label: "Doprava",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z" /><path d="M14 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.6" /><circle cx="17.5" cy="19" r="1.6" /></svg>,
  },
  {
    key: "documents", label: "Doklady",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8M10 9H8" /></svg>,
  },
  {
    key: "stats", label: "Statistiky",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
  },
  {
    key: "feeds", label: "Feedy",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>,
  },
  {
    key: "params", label: "Parametry",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M8 8l8 8M16 8l-8 8" /></svg>,
  },
  {
    key: "gift-cards", label: "Dárkové karty",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8V3M8 3l4 5 4-5" /></svg>,
  },
  {
    key: "loyalty", label: "Věrnostní prog.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>,
  },
  {
    key: "subscriptions", label: "Předplatné",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>,
  },
  {
    key: "abandoned-carts", label: "Opuštěné košíky",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L23 6H6" /><path d="m15 3 5 5M20 3l-5 5" /></svg>,
  },
  {
    key: "search", label: "Vyhledávání",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /><path d="M11 8v6M8 11h6" /></svg>,
  },
  {
    key: "ab-tests", label: "A/B testy",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h4M17 12h4M7 7l2 2M15 7l-2 2M7 17l2-2M15 17l-2-2" /></svg>,
  },
  {
    key: "stock-movements", label: "Sklad. pohyby",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m7 16 4-8 4 4 4-8" /></svg>,
  },
  {
    key: "bulk", label: "Hromadné op.",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
  {
    key: "translations", label: "Překlady",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1" /><path d="m22 22-5-10-5 10M14 18h6" /></svg>,
  },
  {
    key: "webhooks", label: "Webhooky",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.98h1a2 2 0 0 0 1-3.73l-.02-.02" /><circle cx="12" cy="12" r="4" /><path d="M9 17l-2.5 4M15 17l2.5 4" /></svg>,
  },
  {
    key: "import", label: "Import",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  },
  {
    key: "settings", label: "Nastavení",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
  },
  {
    key: "modules", label: "Doplňky a tarif",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3.5a1.5 1.5 0 0 1 3 0V5h3a1 1 0 0 1 1 1v3h1.5a1.5 1.5 0 0 1 0 3H17v3a1 1 0 0 1-1 1h-3v1.5a1.5 1.5 0 0 1-3 0V16H7a1 1 0 0 1-1-1v-3H4.5a1.5 1.5 0 0 1 0-3H6V6a1 1 0 0 1 1-1h3z" /></svg>,
  },
];

const NAV_MAP = Object.fromEntries(NAV.map((item) => [item.key, item])) as Record<TabKey, (typeof NAV)[number]>;

const TAB_SUBTITLES: Record<TabKey, string> = {
  dashboard: "Tržby, objednávky a stav obchodu na jednom místě",
  orders: "Správa objednávek a jejich stavů",
  products: "Katalog produktů, varianty a skladové zásoby",
  categories: "Struktura kategorií e-shopu",
  customers: "Zákaznické účty a historie nákupů",
  marketing: "Slevové kupóny a marketingové akce",
  "email-campaigns": "Hromadné e-mailové kampaně nad segmenty zákazníků",
  sms: "SMS notifikace zákazníkům při změně stavu objednávky",
  affiliates: "Partnerské ref. odkazy, konverze a provize",
  seo: "Audit katalogu — titulky, popisy, meta data a obrázky",
  "stock-sync": "Synchronizace skladových stavů z externího feedu",
  "auto-import": "Automatický import produktů z dodavatelského feedu",
  bundles: "Zvýhodněné sady produktů se společnou slevou",
  wholesale: "B2B partneři, schvalování registrací a velkoobchodní slevy",
  shipping: "Metody dopravy a způsoby platby",
  documents: "Faktury a prodejní doklady",
  stats: "Podrobné statistiky prodeje",
  import: "Hromadný import produktů ze souboru",
  feeds: "XML feedy pro srovnávače zboží",
  settings: "Konfigurace obchodu a vzhled administrace",
  params: "Parametry produktů pro filtrování",
  "gift-cards": "Prodej a správa dárkových karet",
  loyalty: "Věrnostní body a odměny za nákupy",
  subscriptions: "Opakované platby a předplatná",
  webhooks: "Notifikace do externích systémů",
  "ab-tests": "Testování variant obsahu",
  "stock-movements": "Historie naskladnění a výdejů",
  bulk: "Hromadné úpravy produktů",
  translations: "Jazykové verze obsahu",
  "abandoned-carts": "Rozpracované košíky a jejich záchrana",
  search: "Našeptávač, synonyma, boosting a statistiky hledání",
  modules: "Moduly k pronájmu a tarify obchodu",
};

const TAB_TITLES: Record<TabKey, string> = {
  dashboard: "Přehled",
  orders: "Objednávky",
  products: "Produkty",
  categories: "Kategorie",
  customers: "Zákazníci",
  marketing: "Marketing a slevy",
  "email-campaigns": "E-mailové kampaně",
  sms: "SMS upozornění",
  affiliates: "Provizní systém",
  seo: "Pokročilé SEO",
  "stock-sync": "Synchronizace skladu",
  "auto-import": "Automatický import",
  bundles: "Sady produktů",
  wholesale: "Velkoobchod (B2B)",
  shipping: "Doprava a platby",
  documents: "Doklady",
  stats: "Statistiky",
  import: "Import dat",
  feeds: "Feedy a propojení",
  settings: "Nastavení obchodu",
  params: "Produktové parametry",
  "gift-cards": "Dárkové karty",
  loyalty: "Věrnostní program",
  subscriptions: "Předplatné",
  webhooks: "Webhooky",
  "ab-tests": "A/B testování",
  "stock-movements": "Skladové pohyby",
  bulk: "Hromadné operace",
  translations: "Překlady",
  "abandoned-carts": "Opuštěné košíky",
  search: "Chytré vyhledávání",
  modules: "Doplňky a tarif",
};

const DESIGN_CHANGE_EVENT = "webero-commerce-admin-design-change";

function isCommerceAdminDesign(value: string | null | undefined): value is CommerceAdminDesign {
  return value === "ink" || value === "studio" || value === "webero" || value === "glass";
}

// ── Shell design tokens (per admin design) ──────────────────────────────────

interface ShellTokens {
  root: string;
  grain: boolean;
  topbar: string;
  brandTile: string;
  brandName: string;
  brandSub: string;
  search: string;
  kbd: string;
  iconBtn: string;
  tenantChip: string;
  editorLink: string;
  shopCta: string;
  sidebar: string;
  groupLabel: string;
  divider: string;
  navActive: string;
  navIdle: string;
  iconActive: string;
  iconIdle: string;
  mainPad: string;
  contentCard: string; // "" = obsah přímo na plátně
  headerRow: string;
  kicker: string; // "" = bez kickeru
  h1: string;
  subtitle: string;
  currency: string;
}

const SHELL: Record<CommerceAdminDesign, ShellTokens> = {
  ink: {
    root: "bg-[#f2f2ec] text-[#141613]",
    grain: true,
    topbar: "border-b border-[#e7e7de] bg-[#f2f2ec]/85",
    brandTile: "bg-gradient-to-br from-[#2cc75c] via-[#1d9a44] to-[#137a35] text-white shadow-[0_4px_14px_rgba(29,154,68,0.35)]",
    brandName: "text-[#141613]",
    brandSub: "text-[#1d9a44]",
    search: "border-[#e4e4db] bg-white text-[#141613] placeholder:text-[#a3a69c] focus:border-[#1d9a44] focus:shadow-[0_0_0_3px_rgba(29,154,68,0.1)]",
    kbd: "border border-[#e4e4db] bg-[#fafaf5] text-[#a3a69c]",
    iconBtn: "text-[#8a8d82] hover:bg-white hover:text-[#141613]",
    tenantChip: "border border-[#e9e9e0] bg-white/70 text-[#a3a69c]",
    editorLink: "text-[#5a5d53] hover:bg-white hover:text-[#141613]",
    shopCta: "bg-gradient-to-b from-[#26b854] to-[#1d9a44] text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)] hover:from-[#2cc75c] hover:to-[#21a94b]",
    sidebar: "border-r border-[#e7e7de] bg-transparent",
    groupLabel: "text-[#a3a69c]",
    divider: "bg-[#e7e7de]",
    navActive: "bg-[#141613] font-semibold text-white shadow-[0_6px_18px_rgba(20,22,19,0.22)]",
    navIdle: "text-[#5a5d53] hover:bg-white hover:text-[#141613]",
    iconActive: "text-[#7ee2a0]",
    iconIdle: "text-[#a3a69c]",
    mainPad: "px-6 py-8 lg:px-10",
    contentCard: "",
    headerRow: "border-b border-[#e7e7de] pb-6",
    kicker: "text-[#1d9a44]",
    h1: "text-[32px] font-extrabold leading-tight tracking-[-0.03em] text-[#141613]",
    subtitle: "text-[#8a8d82]",
    currency: "text-[#a3a69c]",
  },
  glass: {
    root: "bg-[#f2f3ef] text-slate-800",
    grain: false,
    topbar: "border-b border-slate-200/60 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    brandTile: "bg-[#2d3a25] text-[#d7f99c]",
    brandName: "text-slate-900",
    brandSub: "text-[#7fa52c]",
    search: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    kbd: "border border-slate-200 bg-white text-slate-400",
    iconBtn: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
    tenantChip: "bg-slate-50 text-slate-400",
    editorLink: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    shopCta: "bg-[#2d3a25] text-[#d7f99c] shadow-sm hover:bg-[#1f2a19]",
    sidebar: "border-r border-slate-200/60 bg-white/60 backdrop-blur-xl",
    groupLabel: "text-slate-400",
    divider: "bg-slate-200/70",
    navActive: "bg-[#2d3a25]/8 font-semibold text-[#2d3a25]",
    navIdle: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    iconActive: "text-[#5e7828]",
    iconIdle: "text-slate-400",
    mainPad: "p-6",
    contentCard: "border border-slate-200/60 bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)] backdrop-blur-xl",
    headerRow: "border-b border-slate-100 pb-5",
    kicker: "",
    h1: "text-[22px] font-semibold tracking-[-0.02em] text-slate-900",
    subtitle: "text-slate-500",
    currency: "text-slate-500",
  },
  webero: {
    root: "bg-[#f6f8fb] text-slate-900",
    grain: false,
    topbar: "border-b border-slate-200 bg-white/95 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    brandTile: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]",
    brandName: "text-slate-900",
    brandSub: "text-indigo-500",
    search: "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    kbd: "border border-slate-200 bg-white text-slate-400",
    iconBtn: "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
    tenantChip: "bg-slate-50 text-slate-400",
    editorLink: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    shopCta: "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.2)] hover:bg-indigo-700",
    sidebar: "border-r border-slate-200 bg-white",
    groupLabel: "text-slate-400",
    divider: "bg-slate-200/70",
    navActive: "bg-indigo-50 font-semibold text-indigo-700",
    navIdle: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
    iconActive: "text-indigo-600",
    iconIdle: "text-slate-400",
    mainPad: "p-6",
    contentCard: "border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]",
    headerRow: "border-b border-slate-100 pb-5",
    kicker: "",
    h1: "text-[22px] font-semibold tracking-[-0.02em] text-slate-900",
    subtitle: "text-slate-500",
    currency: "text-slate-500",
  },
  studio: {
    root: "bg-[#0e0c13] text-slate-100",
    grain: false,
    topbar: "border-b border-white/8 bg-[#12101a]/90 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_4px_16px_rgba(0,0,0,0.2)]",
    brandTile: "bg-gradient-to-br from-violet-600 to-violet-800 text-white shadow-[0_4px_12px_rgba(139,92,246,0.3)]",
    brandName: "text-white",
    brandSub: "text-violet-400",
    search: "border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:bg-white/[0.08]",
    kbd: "border border-white/10 bg-white/[0.06] text-slate-500",
    iconBtn: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
    tenantChip: "bg-white/[0.05] text-slate-500",
    editorLink: "text-slate-400 hover:bg-white/[0.06] hover:text-white",
    shopCta: "bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.25)] hover:bg-violet-700",
    sidebar: "border-r border-white/6 bg-[#12101a]/80 backdrop-blur-xl",
    groupLabel: "text-slate-600",
    divider: "bg-white/8",
    navActive: "bg-violet-500/12 font-semibold text-violet-200",
    navIdle: "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
    iconActive: "text-violet-400",
    iconIdle: "text-slate-500",
    mainPad: "p-6",
    contentCard: "border border-white/8 bg-white/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.1),0_12px_32px_rgba(0,0,0,0.15)] backdrop-blur-xl",
    headerRow: "border-b border-white/8 pb-5",
    kicker: "",
    h1: "text-[22px] font-semibold tracking-[-0.02em] text-white",
    subtitle: "text-slate-500",
    currency: "text-slate-400",
  },
};

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E")`;

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const row = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  return row ? decodeURIComponent(row.slice(prefix.length)) : null;
}

function readStoredDesign(storageKey: string, fallback: CommerceAdminDesign): CommerceAdminDesign {
  if (typeof window === "undefined") return fallback;
  const cookieDesign = readCookie(storageKey);
  if (isCommerceAdminDesign(cookieDesign)) return cookieDesign;
  return fallback;
}

function subscribeDesignStore(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DESIGN_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DESIGN_CHANGE_EVENT, onStoreChange);
  };
}

function writeStoredDesign(storageKey: string, nextDesign: CommerceAdminDesign) {
  window.localStorage.setItem(storageKey, nextDesign);
  document.cookie = `${encodeURIComponent(storageKey)}=${encodeURIComponent(nextDesign)}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new Event(DESIGN_CHANGE_EVENT));
}

export function CommerceAdmin({ tenantSlug, shopName, currency, initialDesign }: {
  tenantSlug: string; shopName: string; currency: string; initialDesign?: CommerceAdminDesign;
}) {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [activeAddons, setActiveAddons] = useState<Set<string> | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [productsSeed, setProductsSeed] = useState<{ q: string; n: number }>({ q: "", n: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const storageKey = useMemo(() => `webero_commerce_admin_design_${tenantSlug}`, [tenantSlug]);
  const base = useMemo(() => `/api/demo/${tenantSlug}/commerce`, [tenantSlug]);
  const serverDesign = initialDesign ?? COMMERCE_DEFAULT_DESIGN;
  const design = useSyncExternalStore(
    subscribeDesignStore,
    () => readStoredDesign(storageKey, serverDesign),
    () => serverDesign,
  );
  const S = SHELL[design];
  const searchRef = useRef<HTMLInputElement>(null);
  // Tab si může schovat velkou hlavičku stránky (celostránkové pohledy, např. detail objednávky)
  const [pageHeaderHidden, setPageHeaderHidden] = useState(false);
  const pageChrome = useMemo(() => ({ setPageHeaderHidden }), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Aktivní moduly pro gating admin tabů — refetch při přepnutí tabu,
  // aby se změny z tabu Moduly projevily okamžitě.
  useEffect(() => {
    let cancelled = false;
    fetch(`${base}/addons`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { addons?: Array<{ slug: string; active: boolean }> } | null) => {
        if (!cancelled && Array.isArray(d?.addons)) {
          setActiveAddons(new Set(d.addons.filter((a) => a.active).map((a) => a.slug)));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [base, tab]);

  const tabGate = TAB_MODULE[tab];
  const tabLocked = !!tabGate && activeAddons !== null && !activeAddons.has(tabGate.slug);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setProductsSeed({ q: globalSearch, n: Date.now() });
    setTab("products");
  }

  return (
    <CommerceThemeProvider design={design}>
    <PageChromeContext.Provider value={pageChrome}>
    <div className={`min-h-screen ${S.root}`}>
      <style>{`
        @keyframes wcTabIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .wc-tab-enter { animation: wcTabIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
      {S.grain && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-multiply"
          style={{ backgroundImage: GRAIN_BG }}
        />
      )}

      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 ${S.topbar} backdrop-blur-xl`}>
        <div className="flex h-[60px] items-center gap-4 px-4">

          {/* Brand */}
          <div className={`flex shrink-0 items-center gap-2.5 transition-[width] duration-300 ${sidebarCollapsed ? "w-[44px]" : "w-[210px]"}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${S.brandTile}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16l-1.5 12.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5L4 7Z" /><path d="M8.5 10V6a3.5 3.5 0 0 1 7 0v4" /></svg>
            </span>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className={`truncate text-[14px] font-bold leading-tight tracking-[-0.01em] ${S.brandName}`}>
                  {shopName || "Obchod"}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-[0.14em] ${S.brandSub}`}>Commerce</div>
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={submitSearch} className="max-w-[480px] flex-1">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
              <input
                ref={searchRef}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Hledat produkty, objednávky…"
                className={`h-[40px] w-full rounded-full border pl-10 pr-14 text-[13px] outline-none transition-all duration-200 ${S.search}`}
              />
              <kbd className={`pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:block ${S.kbd}`}>
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              className={`inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg transition-all duration-200 ${S.iconBtn}`}
              title={sidebarCollapsed ? "Rozbalit menu" : "Sbalit menu"}
            >
              {sidebarCollapsed ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="m13 9 3 3-3 3" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="m16 9-3 3 3 3" /></svg>
              )}
            </button>

            <span className={`hidden items-center rounded-lg px-2.5 py-1.5 text-[11px] font-medium lg:inline-flex ${S.tenantChip}`}>
              {tenantSlug}
            </span>

            <a href={`/demo/${tenantSlug}/admin?studio=1`}
              title="Upravit vzhled webu ve studio editoru"
              className={`hidden h-[34px] items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-medium transition-all duration-200 sm:inline-flex ${S.editorLink}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              Studio editor
            </a>

            <a href={`/demo/${tenantSlug}/obchod`} target="_blank" rel="noreferrer"
              className={`inline-flex h-[36px] items-center gap-1.5 rounded-full px-4 text-[12.5px] font-bold transition-all duration-200 ${S.shopCta}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
              Obchod
            </a>
          </div>
        </div>
      </header>

      <div className="relative z-[2] flex">
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className={`sticky top-[60px] h-[calc(100vh-60px)] shrink-0 overflow-y-auto overflow-x-hidden transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarCollapsed ? "w-[60px]" : "w-[224px]"
        } ${S.sidebar}`}>
          <nav className={`py-3 transition-[padding] duration-300 ${sidebarCollapsed ? "px-1.5" : "px-3"}`}>
            {NAV_GROUPS.map((group, gi) => (
              <div key={group.label ?? gi}>
                {gi > 0 && sidebarCollapsed && (
                  <div className={`mx-2 my-2 h-px ${S.divider}`} aria-hidden />
                )}
                {group.label && !sidebarCollapsed && (
                  <div className={`px-3 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] ${S.groupLabel}`}>
                    {group.label}
                  </div>
                )}
                {group.keys.map((key) => {
                  const item = NAV_MAP[key];
                  const active = tab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setTab(item.key)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`mb-0.5 flex w-full items-center rounded-xl transition-all duration-200 ${
                        sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium"
                      } ${active ? S.navActive : S.navIdle}`}
                    >
                      <span className={`flex-shrink-0 ${active ? S.iconActive : S.iconIdle}`}>{item.icon}</span>
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Vzhled webu — odchod do studio editoru (občasné úpravy designu) */}
            <div className={`mx-2 my-2 h-px ${S.divider}`} aria-hidden />
            {!sidebarCollapsed && (
              <div className={`px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] ${S.groupLabel}`}>
                Vzhled webu
              </div>
            )}
            <a
              href={`/demo/${tenantSlug}/admin?studio=1`}
              title={sidebarCollapsed ? "Studio editor" : undefined}
              className={`mb-0.5 flex w-full items-center rounded-xl transition-all duration-200 ${
                sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5 text-left text-[13px] font-medium"
              } ${S.navIdle}`}
            >
              <span className={`flex-shrink-0 ${S.iconIdle}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </span>
              {!sidebarCollapsed && <span className="truncate">Studio editor</span>}
            </a>
          </nav>
        </aside>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className={`min-w-0 flex-1 ${S.mainPad}`}>
          <div className={`mx-auto max-w-[1320px] ${S.contentCard ? `rounded-2xl p-6 ${S.contentCard}` : ""}`}>
            {/* Page header — taby s celostránkovým pohledem si ji schovají */}
            {!pageHeaderHidden && (
              <div className={`mb-7 flex items-end justify-between ${S.headerRow}`}>
                <div>
                  {S.kicker && (
                    <div className={`mb-1 text-[10.5px] font-bold uppercase tracking-[0.18em] ${S.kicker}`}>
                      Webero Commerce
                    </div>
                  )}
                  <h1 className={S.h1}>{TAB_TITLES[tab]}</h1>
                  <p className={`mt-1 text-[13px] ${S.subtitle}`}>
                    {TAB_SUBTITLES[tab]}
                  </p>
                </div>
                <div className="hidden text-right text-[12px] sm:block">
                  <div className={`font-semibold ${S.currency}`}>{currency}</div>
                </div>
              </div>
            )}

            <div key={tab} className="wc-tab-enter">
            {tabLocked && tabGate && (
              <ModuleGate
                moduleName={tabGate.name}
                priceMonthly={tabGate.price}
                onGoToModules={() => setTab("modules")}
              />
            )}
            {tab === "dashboard" && <DashboardTab base={base} onGoto={(t) => setTab(t as TabKey)} />}
            {tab === "orders" && <OrdersTab base={base} currency={currency} />}
            {tab === "products" && (
              <ProductsTab
                key={productsSeed.n}
                base={base}
                tenantSlug={tenantSlug}
                currency={currency}
                initialSearch={productsSeed.q}
              />
            )}
            {tab === "categories" && <CategoriesTab base={base} />}
            {tab === "customers" && <CustomersTab base={base} currency={currency} />}
            {tab === "marketing" && !tabLocked && <MarketingTab base={base} />}
            {tab === "email-campaigns" && !tabLocked && <EmailCampaignsTab base={base} />}
            {tab === "sms" && !tabLocked && <SmsTab base={base} />}
            {tab === "affiliates" && !tabLocked && <AffiliatesTab base={base} />}
            {tab === "seo" && !tabLocked && <SeoTab base={base} />}
            {tab === "stock-sync" && !tabLocked && <StockSyncTab base={base} />}
            {tab === "auto-import" && !tabLocked && <AutoImportTab base={base} />}
            {tab === "bundles" && !tabLocked && <BundlesTab base={base} />}
            {tab === "wholesale" && !tabLocked && <WholesaleTab base={base} />}
            {tab === "shipping" && <ShippingPaymentsTab base={base} />}
            {tab === "documents" && <DocumentsTab base={base} currency={currency} />}
            {tab === "stats" && <StatsTab base={base} currency={currency} />}
            {tab === "import" && !tabLocked && <ImportTab base={base} />}
            {tab === "feeds" && <FeedsTab base={base} tenantSlug={tenantSlug} />}
            {tab === "params" && <ParamsTab base={base} />}
            {tab === "gift-cards" && <GiftCardsTab base={base} currency={currency} />}
            {tab === "loyalty" && !tabLocked && <LoyaltyTab base={base} currency={currency} />}
            {tab === "subscriptions" && <SubscriptionsTab base={base} currency={currency} />}
            {tab === "webhooks" && <WebhooksTab base={base} />}
            {tab === "ab-tests" && <ABTestsTab base={base} />}
            {tab === "stock-movements" && !tabLocked && <StockMovementsTab base={base} />}
            {tab === "bulk" && !tabLocked && <BulkOperationsTab base={base} />}
            {tab === "translations" && !tabLocked && <TranslationsTab base={base} />}
            {tab === "abandoned-carts" && !tabLocked && <AbandonedCartsTab base={base} currency={currency} />}
            {tab === "search" && !tabLocked && <SearchTab base={base} />}
            {tab === "modules" && <ModulesTab base={base} />}
            {tab === "settings" && (
              <SettingsTab
                base={base}
                currentDesign={design}
                onDesignChange={(nextDesign) => writeStoredDesign(storageKey, nextDesign)}
              />
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
    </PageChromeContext.Provider>
    </CommerceThemeProvider>
  );
}
