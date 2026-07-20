/**
 * Webero Commerce — doplňkové moduly a tarify (Shoptet-style).
 *
 * Katalog modulů i tarify jsou definované v kódu (verzované, bez migrace dat);
 * v DB se drží jen stav per tenant: zvolený tarif + aktivace jednotlivých
 * modulů. Modul zahrnutý v tarifu se aktivuje zdarma, ostatní se "pronajímají"
 * měsíčně za cenu modulu (ceny v Kč bez DPH — demo, bez reálné fakturace).
 */

import { cache } from "react";
import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";

// ── Tarify ─────────────────────────────────────────────────────────────────

export type PlanSlug = "start" | "zaklad" | "business" | "premium";

export interface CommercePlan {
  slug: PlanSlug;
  name: string;
  price_monthly: number; // Kč bez DPH
  tagline: string;
  popular?: boolean;
}

export const COMMERCE_PLANS: CommercePlan[] = [
  { slug: "start", name: "Start", price_monthly: 0, tagline: "Plnohodnotný e-shop zdarma. Moduly si pronajmete jednotlivě." },
  { slug: "zaklad", name: "Základ", price_monthly: 390, tagline: "Základní sada modulů pro rozjezd prodeje." },
  { slug: "business", name: "Business", price_monthly: 990, tagline: "Vše pro rostoucí e-shop — marketing, sklad i dopravci.", popular: true },
  { slug: "premium", name: "Premium", price_monthly: 1990, tagline: "Všech 50 modulů v ceně. B2B, expanze i automatizace." },
];

const PLAN_RANK: Record<PlanSlug, number> = { start: 0, zaklad: 1, business: 2, premium: 3 };

// ── Katalog modulů ─────────────────────────────────────────────────────────

export type AddonCategory =
  | "Slevy a akce"
  | "Marketing"
  | "Recenze"
  | "SEO a obsah"
  | "Produkty"
  | "Sklad a data"
  | "Objednávky a doprava"
  | "Platby"
  | "B2B a expanze"
  | "Komunikace"
  | "Umělá inteligence";

export interface CommerceAddon {
  slug: string;
  name: string;
  description: string;
  category: AddonCategory;
  price_monthly: number; // Kč bez DPH (pronájem mimo tarif)
  /** Od kterého tarifu je modul v ceně. */
  included_from: Exclude<PlanSlug, "start">;
}

export const ADDON_CATALOG: CommerceAddon[] = [
  // ── Slevy a akce ──
  { slug: "slevove-kupony", name: "Slevové kupóny", category: "Slevy a akce", price_monthly: 200, included_from: "zaklad",
    description: "Generujte jednorázové i hromadné slevové kódy s omezením platnosti, hodnoty objednávky nebo kategorie." },
  { slug: "promo-kod-detail", name: "Promo kód v detailu", category: "Slevy a akce", price_monthly: 100, included_from: "zaklad",
    description: "Zvýrazněný box se slevovým kódem přímo v detailu produktu. Jedním klikem přidá produkt do košíku a kód se v pokladně uplatní automaticky." },
  { slug: "mnozstevni-slevy", name: "Množstevní slevy", category: "Slevy a akce", price_monthly: 100, included_from: "zaklad",
    description: "Slevy podle počtu kusů v košíku — čím více zákazník nakoupí, tím nižší cena za kus." },
  { slug: "darky-k-objednavce", name: "Dárky k objednávce", category: "Slevy a akce", price_monthly: 100, included_from: "zaklad",
    description: "Dárek zdarma při dosažení nastavené hodnoty objednávky. Zákazník si dárek vybere v košíku." },
  { slug: "objemove-slevy", name: "Objemové slevy", category: "Slevy a akce", price_monthly: 100, included_from: "business",
    description: "Procentní sleva podle celkové hodnoty objednávky — motivujte k větším nákupům." },
  { slug: "vernostni-slevy", name: "Věrnostní slevy", category: "Slevy a akce", price_monthly: 100, included_from: "business",
    description: "Trvalá sleva pro registrované zákazníky podle jejich celkové útraty v obchodě." },
  { slug: "odpocet-akce", name: "Odpočet času u akční ceny", category: "Slevy a akce", price_monthly: 100, included_from: "business",
    description: "Odpočítávání konce akce přímo na detailu produktu — vytváří pocit naléhavosti a zvyšuje konverze." },
  { slug: "doprava-zdarma-lista", name: "Pro dopravu zdarma zbývá…", category: "Slevy a akce", price_monthly: 50, included_from: "business",
    description: "Lišta v košíku ukazuje, kolik zbývá do dopravy zdarma nebo dárku. Prokazatelně zvedá průměrnou objednávku." },
  { slug: "slevy-xny", name: "Slevy X+Y (3 za cenu 2)", category: "Slevy a akce", price_monthly: 300, included_from: "premium",
    description: "Akce typu „kup 3, zaplať 2“ nebo „k nákupu druhý kus za polovinu“ s libovolnou kombinací produktů." },

  // ── Marketing ──
  { slug: "opusteny-kosik", name: "Opuštěný košík", category: "Marketing", price_monthly: 200, included_from: "business",
    description: "Automatické e-maily zákazníkům, kteří nedokončili objednávku. Vrací až 15 % ztracených nákupů." },
  { slug: "hromadne-emaily", name: "Hromadné rozesílání e-mailů", category: "Marketing", price_monthly: 100, included_from: "business",
    description: "Newslettery a kampaně na zákaznickou databázi se šablonami, segmentací a statistikou otevření." },
  { slug: "hlidaci-pes", name: "Hlídací pes", category: "Marketing", price_monthly: 100, included_from: "zaklad",
    description: "Zákazník si nechá pohlídat naskladnění nebo zlevnění produktu a dostane automatický e-mail." },
  { slug: "chytre-vyhledavani", name: "Chytré vyhledávání", category: "Marketing", price_monthly: 300, included_from: "business",
    description: "Našeptávač s typo-tolerancí a hledáním bez diakritiky, synonyma, boosting produktů a statistiky hledání — nejhledanější fráze i dotazy bez výsledků." },
  { slug: "provizni-system", name: "Provizní (affiliate) systém", category: "Marketing", price_monthly: 200, included_from: "premium",
    description: "Vlastní affiliate program — partneři doporučují váš obchod a získávají provizi z objednávek." },
  { slug: "sms-upozorneni", name: "SMS upozornění", category: "Marketing", price_monthly: 100, included_from: "business",
    description: "Automatické SMS o stavu objednávky nebo marketingové SMS kampaně na telefonní čísla zákazníků." },
  { slug: "socialni-site", name: "Sociální sítě", category: "Marketing", price_monthly: 50, included_from: "zaklad",
    description: "Tlačítka pro sdílení produktů, propojení s Facebookem a Instagramem, feed pro katalogy sítí." },
  { slug: "upsell-kosik", name: "Doplňkový prodej v košíku", category: "Marketing", price_monthly: 200, included_from: "business",
    description: "Chytrá nabídka souvisejícího zboží přímo v košíku — „k tomuto produktu se hodí…“." },
  { slug: "tento-tyden-zakoupilo", name: "Tento týden zakoupilo", category: "Marketing", price_monthly: 50, included_from: "business",
    description: "Sociální důkaz na detailu produktu: kolik zákazníků produkt v posledních dnech koupilo." },

  // ── Recenze ──
  { slug: "hodnoceni-produktu", name: "Hodnocení produktů a obchodu", category: "Recenze", price_monthly: 100, included_from: "zaklad",
    description: "Hvězdičky a slovní recenze u produktů, automatické vyžádání recenze po doručení objednávky." },
  { slug: "fotorecenze", name: "Fotorecenze", category: "Recenze", price_monthly: 200, included_from: "business",
    description: "Zákazníci přikládají k recenzím vlastní fotografie produktu — nejsilnější forma sociálního důkazu." },
  { slug: "google-reviews", name: "Google recenze", category: "Recenze", price_monthly: 100, included_from: "business",
    description: "Zobrazení hodnocení z Google přímo na webu a automatický sběr nových recenzí po nákupu." },

  // ── SEO a obsah ──
  { slug: "pokrocile-seo", name: "Pokročilé SEO", category: "SEO a obsah", price_monthly: 300, included_from: "premium",
    description: "Šablony meta tagů, hromadná úprava titulků, přesměrování 301, strukturovaná data a SEO audit." },
  { slug: "slovnik-pojmu", name: "Slovník pojmů", category: "SEO a obsah", price_monthly: 300, included_from: "premium",
    description: "Obsahový slovník pojmů s automatickým prolinkováním z popisků — buduje SEO autoritu obchodu." },

  // ── Produkty ──
  { slug: "podobne-produkty", name: "Podobné produkty", category: "Produkty", price_monthly: 100, included_from: "zaklad",
    description: "Automatická sekce podobného zboží na detailu produktu podle kategorie a parametrů." },
  { slug: "souvisejici-produkty", name: "Související produkty", category: "Produkty", price_monthly: 100, included_from: "zaklad",
    description: "Ručně definované příslušenství a doplňky u produktu — vyšší hodnota objednávky." },
  { slug: "top-10", name: "TOP 10 nejprodávanějších", category: "Produkty", price_monthly: 50, included_from: "zaklad",
    description: "Automatický žebříček nejprodávanějších produktů na homepage i v kategoriích." },
  { slug: "min-max", name: "Min & max množství", category: "Produkty", price_monthly: 50, included_from: "zaklad",
    description: "Minimální a maximální objednatelné množství produktu, prodej po násobcích balení." },
  { slug: "filtry-vyrobcu", name: "Filtry výrobců a značek", category: "Produkty", price_monthly: 50, included_from: "zaklad",
    description: "Stránky značek s logy a filtrování výpisu podle výrobce." },
  { slug: "sady-produktu", name: "Sady produktů", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Prodávejte zvýhodněné sety složené z více produktů se společnou cenou a skladovou vazbou." },
  { slug: "porovnavac", name: "Porovnávač zboží", category: "Produkty", price_monthly: 200, included_from: "business",
    description: "Zákazník porovná až 4 produkty vedle sebe podle parametrů — méně váhání, více nákupů." },
  { slug: "oblibene-produkty", name: "Oblíbené produkty", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Srdíčko u produktů a seznam oblíbených položek pro přihlášené i nepřihlášené zákazníky." },
  { slug: "naposledy-navstivene", name: "Naposledy navštívené", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Lišta naposledy prohlížených produktů — zákazník se snadno vrátí k tomu, co ho zaujalo." },
  { slug: "parametricke-filtry", name: "Parametrické filtry a příplatky", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Pokročilé filtrování podle parametrů a volitelné příplatky u variant produktů." },
  { slug: "diskuze", name: "Diskuze u produktů", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Otázky a odpovědi na detailu produktu s moderací a e-mailovým upozorněním na dotazy." },
  { slug: "stitky-v-obrazku", name: "Štítky v obrázku", category: "Produkty", price_monthly: 100, included_from: "business",
    description: "Grafické štítky Novinka / Akce / Doprodej přímo v obrázcích produktů ve výpisu." },

  // ── Sklad a data ──
  { slug: "skladove-hospodarstvi", name: "Skladové hospodářství", category: "Sklad a data", price_monthly: 200, included_from: "business",
    description: "Příjemky, výdejky, inventury a skladové pohyby s historií a exporty." },
  { slug: "hromadne-importy", name: "Hromadné importy a exporty", category: "Sklad a data", price_monthly: 100, included_from: "business",
    description: "Import a export produktů, cen a zásob přes CSV/XLSX včetně plánovaných aktualizací." },
  { slug: "synchronizace-skladu", name: "Synchronizace skladů", category: "Sklad a data", price_monthly: 300, included_from: "premium",
    description: "Napojení na externí sklady a dodavatele — automatická synchronizace dostupnosti a cen." },
  { slug: "automaticky-import", name: "Automatický import produktů", category: "Sklad a data", price_monthly: 400, included_from: "premium",
    description: "Pravidelný import celého sortimentu z dodavatelských XML/CSV feedů včetně obrázků a kategorií." },

  // ── Objednávky a doprava ──
  { slug: "balikovna", name: "Balíkovna a výdejní místa", category: "Objednávky a doprava", price_monthly: 100, included_from: "business",
    description: "Výběr výdejního místa v pokladně s interaktivní mapou a automatickým předáním dopravci." },
  { slug: "tisk-stitku", name: "Tisk přepravních štítků", category: "Objednávky a doprava", price_monthly: 200, included_from: "business",
    description: "Hromadný tisk štítků pro dopravce přímo z administrace objednávek — bez přepisování adres." },
  { slug: "stav-objednavky", name: "Stav objednávky pro zákazníky", category: "Objednávky a doprava", price_monthly: 100, included_from: "business",
    description: "Veřejná stránka se sledováním stavu objednávky a zásilky bez nutnosti přihlášení." },
  { slug: "rozsirena-objednavka", name: "Rozšířená objednávka", category: "Objednávky a doprava", price_monthly: 50, included_from: "zaklad",
    description: "Vlastní pole v pokladně — poznámka, firemní údaje, termín doručení a další volby." },
  { slug: "ares-ico", name: "Doplnění údajů dle IČO", category: "Objednávky a doprava", price_monthly: 25, included_from: "zaklad",
    description: "Fakturační údaje firmy se v pokladně automaticky doplní z registru ARES po zadání IČO." },
  { slug: "mapa-prodejen", name: "Mapa prodejen", category: "Objednávky a doprava", price_monthly: 200, included_from: "premium",
    description: "Stránka s mapou vašich kamenných prodejen, otevírací dobou a možností osobního odběru." },

  // ── Platby ──
  { slug: "paypal", name: "PayPal", category: "Platby", price_monthly: 200, included_from: "business",
    description: "Platby přes PayPal účet — nutnost pro prodej do zahraničí." },
  { slug: "splatky", name: "Nákup na splátky", category: "Platby", price_monthly: 200, included_from: "premium",
    description: "Splátkový prodej a odložená platba přímo v pokladně — vyšší konverze u dražšího zboží." },

  // ── B2B a expanze ──
  { slug: "velkoobchod", name: "Velkoobchod (B2B)", category: "B2B a expanze", price_monthly: 400, included_from: "premium",
    description: "Ceníky pro velkoobchodní partnery, individuální slevy, objednávky bez DPH a schvalování registrací." },
  { slug: "cizi-meny", name: "Cizí měny", category: "B2B a expanze", price_monthly: 300, included_from: "premium",
    description: "Prodej ve více měnách s automatickým kurzem ČNB a měnou dle země zákazníka." },
  { slug: "cizi-jazyky", name: "Cizí jazyky", category: "B2B a expanze", price_monthly: 400, included_from: "premium",
    description: "Plnohodnotné jazykové mutace obchodu — překlady produktů, kategorií i e-mailů." },

  // ── Komunikace ──
  { slug: "whatsapp-chat", name: "WhatsApp & chat widget", category: "Komunikace", price_monthly: 200, included_from: "business",
    description: "Plovoucí chatovací tlačítko — zákazník vám napíše přes WhatsApp nebo Messenger jedním klikem." },

  // ── Umělá inteligence ──
  { slug: "ai-copywriter", name: "AI copywriter popisků", category: "Umělá inteligence", price_monthly: 200, included_from: "business",
    description: "Umělá inteligence napíše prodejní popisky produktů, krátké anotace i SEO titulky jedním klikem." },
];

const ADDON_MAP = new Map(ADDON_CATALOG.map((a) => [a.slug, a]));

export const ADDON_CATEGORIES: AddonCategory[] = Array.from(
  new Set(ADDON_CATALOG.map((a) => a.category))
);

export function isValidPlan(plan: string): plan is PlanSlug {
  return plan in PLAN_RANK;
}

/** Je modul zahrnutý v ceně daného tarifu? */
export function addonIncludedInPlan(addon: CommerceAddon, plan: PlanSlug): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[addon.included_from];
}

/** Počet modulů v ceně tarifu (pro ceníkovou tabulku). */
export function planIncludedCount(plan: PlanSlug): number {
  return ADDON_CATALOG.filter((a) => addonIncludedInPlan(a, plan)).length;
}

// ── DB stav per tenant ─────────────────────────────────────────────────────

let addonsInitialized = false;

export async function initAddonsDb(): Promise<void> {
  if (addonsInitialized) return;
  await initCommerceDb();
  await query(`
    CREATE TABLE IF NOT EXISTS commerce_tenant_plan (
      tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'start',
      changed_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS commerce_addon_activations (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      addon_slug TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT true,
      activated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tenant_id, addon_slug)
    );
    CREATE INDEX IF NOT EXISTS idx_addon_activations_tenant ON commerce_addon_activations(tenant_id);

    -- Modul „Diskuze u produktů“
    CREATE TABLE IF NOT EXISTS commerce_product_questions (
      id SERIAL PRIMARY KEY,
      tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      answered_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_product_questions ON commerce_product_questions(tenant_id, product_id);

    -- Modul „Fotorecenze“
    ALTER TABLE commerce_reviews ADD COLUMN IF NOT EXISTS photo_url TEXT;
  `);
  addonsInitialized = true;
}

/**
 * Množina slugů aktivních modulů tenanta — hlavní vstup pro gating funkcí.
 * `cache()` deduplikuje v rámci jednoho requestu (RSC strom volá opakovaně).
 */
export const getActiveAddonSlugs = cache(async (tenantId: number): Promise<Set<string>> => {
  await initAddonsDb();
  const rows = await query<{ addon_slug: string }>(
    "SELECT addon_slug FROM commerce_addon_activations WHERE tenant_id = $1 AND enabled = true",
    [tenantId]
  );
  return new Set(rows.map((r) => r.addon_slug));
});

export async function getTenantPlan(tenantId: number): Promise<PlanSlug> {
  await initAddonsDb();
  const row = await queryOne<{ plan: string }>(
    "SELECT plan FROM commerce_tenant_plan WHERE tenant_id = $1",
    [tenantId]
  );
  return row && isValidPlan(row.plan) ? row.plan : "start";
}

export async function setTenantPlan(tenantId: number, plan: PlanSlug): Promise<void> {
  await initAddonsDb();
  await query(
    `INSERT INTO commerce_tenant_plan (tenant_id, plan)
     VALUES ($1, $2)
     ON CONFLICT (tenant_id) DO UPDATE SET plan = EXCLUDED.plan, changed_at = now()`,
    [tenantId, plan]
  );
}

export async function setAddonEnabled(tenantId: number, slug: string, enabled: boolean): Promise<void> {
  if (!ADDON_MAP.has(slug)) throw new Error(`Neznámý modul: ${slug}`);
  await initAddonsDb();
  await query(
    `INSERT INTO commerce_addon_activations (tenant_id, addon_slug, enabled, activated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (tenant_id, addon_slug)
     DO UPDATE SET enabled = EXCLUDED.enabled, activated_at = now()`,
    [tenantId, slug, enabled]
  );
}

/** Rychlá kontrola pro gating funkcí: je modul pro tenanta aktivní? */
export async function isAddonActive(tenantId: number, slug: string): Promise<boolean> {
  await initAddonsDb();
  const row = await queryOne<{ enabled: boolean }>(
    "SELECT enabled FROM commerce_addon_activations WHERE tenant_id = $1 AND addon_slug = $2",
    [tenantId, slug]
  );
  return row?.enabled === true;
}

export interface AddonState extends CommerceAddon {
  active: boolean;
  in_plan: boolean;
  activated_at: string | null;
}

export interface AddonsOverview {
  plan: PlanSlug;
  plans: Array<CommercePlan & { included_count: number }>;
  addons: AddonState[];
  /** Součet měsíčních pronájmů aktivních modulů mimo tarif (Kč bez DPH). */
  monthly_addons: number;
  /** Tarif + pronájmy (Kč bez DPH). */
  monthly_total: number;
}

export async function getAddonsOverview(tenantId: number): Promise<AddonsOverview> {
  await initAddonsDb();
  const plan = await getTenantPlan(tenantId);
  const rows = await query<{ addon_slug: string; enabled: boolean; activated_at: string }>(
    "SELECT addon_slug, enabled, activated_at FROM commerce_addon_activations WHERE tenant_id = $1",
    [tenantId]
  );
  const stateMap = new Map(rows.map((r) => [r.addon_slug, r]));

  const addons: AddonState[] = ADDON_CATALOG.map((addon) => {
    const row = stateMap.get(addon.slug);
    return {
      ...addon,
      active: row?.enabled === true,
      in_plan: addonIncludedInPlan(addon, plan),
      activated_at: row?.activated_at ?? null,
    };
  });

  const monthlyAddons = addons
    .filter((a) => a.active && !a.in_plan)
    .reduce((sum, a) => sum + a.price_monthly, 0);
  const planPrice = COMMERCE_PLANS.find((p) => p.slug === plan)?.price_monthly ?? 0;

  return {
    plan,
    plans: COMMERCE_PLANS.map((p) => ({ ...p, included_count: planIncludedCount(p.slug) })),
    addons,
    monthly_addons: monthlyAddons,
    monthly_total: planPrice + monthlyAddons,
  };
}
