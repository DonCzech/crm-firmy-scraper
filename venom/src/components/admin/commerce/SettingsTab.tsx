"use client";

import { useEffect, useState } from "react";
import {
  api, ErrorBanner, useCommerceTheme, COMMERCE_DESIGN_OPTIONS,
  type CommerceAdminDesign,
} from "./shared";

interface ShopData {
  name: string;
  currency: string;
  vat_mode: string;
  default_tax_rate: number;
  order_number_prefix: string;
  company: Record<string, string>;
  legal: Record<string, string>;
  settings: Record<string, unknown>;
}

interface ShippingMethodRow {
  key: string;
  label: string;
  description?: string;
  price_cents: number;
  free_above_cents: number | null;
  enabled: boolean;
}

interface PaymentMethodRow {
  key: string;
  label: string;
  description?: string;
  fee_cents: number;
  enabled: boolean;
}

// Kopie defaultů z lib/commerce/checkout.ts (server-only modul nelze importovat do klienta)
const DEFAULT_SHIPPING: ShippingMethodRow[] = [
  { key: "zasilkovna", label: "Zásilkovna — výdejní místo", description: "Doručení na výdejní místo do 1–2 dnů", price_cents: 7900, free_above_cents: 150000, enabled: true },
  { key: "kuryr", label: "Kurýr na adresu (PPL)", description: "Doručení na adresu do 1–2 pracovních dnů", price_cents: 11900, free_above_cents: 150000, enabled: true },
  { key: "osobni", label: "Osobní odběr", description: "Zdarma na prodejně", price_cents: 0, free_above_cents: null, enabled: true },
];

const DEFAULT_PAYMENTS: PaymentMethodRow[] = [
  { key: "gopay", label: "Platba kartou online", description: "GoPay — karta, Apple Pay, Google Pay", fee_cents: 0, enabled: true },
  { key: "bank_transfer", label: "Bankovní převod", description: "Zboží odešleme po připsání platby", fee_cents: 0, enabled: true },
  { key: "cod", label: "Dobírka", description: "Zaplatíte při převzetí", fee_cents: 3900, enabled: true },
];

/** Kč input ↔ interní ceny v halířích. */
function czkToCents(v: string): number {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}
function centsToCzk(cents: number): string {
  return String(Math.round(cents) / 100).replace(".", ",");
}

export function SettingsTab({ base, currentDesign, onDesignChange }: {
  base: string;
  currentDesign: CommerceAdminDesign;
  onDesignChange: (design: CommerceAdminDesign) => void;
}) {
  const theme = useCommerceTheme();
  const [shop, setShop] = useState<ShopData | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ shop: ShopData }>(`${base}/settings`)
      .then((d) => setShop({ ...d.shop, company: d.shop.company ?? {}, legal: d.shop.legal ?? {}, settings: d.shop.settings ?? {} }))
      .catch((e) => setError(e instanceof Error ? e.message : "Načtení selhalo"));
  }, [base]);

  async function save() {
    if (!shop) return;
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const data = await api<{ shop: ShopData }>(`${base}/settings`, {
        method: "PATCH",
        body: JSON.stringify({
          name: shop.name,
          currency: shop.currency,
          vat_mode: shop.vat_mode,
          default_tax_rate: shop.default_tax_rate,
          order_number_prefix: shop.order_number_prefix,
          company: shop.company,
          legal: shop.legal,
          settings: shop.settings,
        }),
      });
      setShop({ ...data.shop, company: data.shop.company ?? {}, legal: data.shop.legal ?? {}, settings: data.shop.settings ?? {} });
      setMsg("Uloženo");
      setTimeout(() => setMsg(null), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Uložení selhalo");
    } finally {
      setSaving(false);
    }
  }

  if (error && !shop) return <ErrorBanner message={error} />;
  if (!shop) return <div className="py-8 text-center text-[13px] text-gray-400">Načítám…</div>;

  const setCompany = (key: string, value: string) => setShop({ ...shop, company: { ...shop.company, [key]: value } });
  const sectionCls = theme.sectionCls;
  const h3Cls = theme.sectionTitleCls;

  const shippingMethods: ShippingMethodRow[] = Array.isArray(shop.settings.shipping_methods) && (shop.settings.shipping_methods as ShippingMethodRow[]).length
    ? (shop.settings.shipping_methods as ShippingMethodRow[])
    : DEFAULT_SHIPPING;
  const paymentMethods: PaymentMethodRow[] = Array.isArray(shop.settings.payment_methods) && (shop.settings.payment_methods as PaymentMethodRow[]).length
    ? (shop.settings.payment_methods as PaymentMethodRow[])
    : DEFAULT_PAYMENTS;

  const patchShipping = (i: number, patch: Partial<ShippingMethodRow>) =>
    setShop({ ...shop, settings: { ...shop.settings, shipping_methods: shippingMethods.map((m, j) => (j === i ? { ...m, ...patch } : m)) } });
  const patchPayment = (i: number, patch: Partial<PaymentMethodRow>) =>
    setShop({ ...shop, settings: { ...shop.settings, payment_methods: paymentMethods.map((m, j) => (j === i ? { ...m, ...patch } : m)) } });

  const Toggle = ({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) => (
    <button type="button" onClick={onClick} aria-label={label}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );

  return (
    <div className="max-w-3xl space-y-4">
      <div className={sectionCls}>
        <h3 className={h3Cls}>Obchod</h3>
        <div>
          <label className={theme.labelCls}>Název obchodu</label>
          <input className={theme.inputCls} value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>Měna</label>
            <select className={theme.inputCls} value={shop.currency} onChange={(e) => setShop({ ...shop, currency: e.target.value })}>
              <option value="CZK">CZK</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className={theme.labelCls}>Výchozí DPH (%)</label>
            <input type="number" min={0} max={100} className={theme.inputCls} value={shop.default_tax_rate}
              onChange={(e) => setShop({ ...shop, default_tax_rate: parseInt(e.target.value, 10) || 0 })} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>Ceny</label>
            <select className={theme.inputCls} value={shop.vat_mode} onChange={(e) => setShop({ ...shop, vat_mode: e.target.value })}>
              <option value="inclusive">Včetně DPH</option>
              <option value="exclusive">Bez DPH</option>
            </select>
          </div>
          <div>
            <label className={theme.labelCls}>Prefix objednávek</label>
            <input className={theme.inputCls} value={shop.order_number_prefix}
              onChange={(e) => setShop({ ...shop, order_number_prefix: e.target.value.toUpperCase() })} />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Fakturační údaje</h3>
        <div>
          <label className={theme.labelCls}>Název firmy / jméno podnikatele</label>
          <input className={theme.inputCls} value={shop.company.name ?? ""} onChange={(e) => setCompany("name", e.target.value)} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>IČO</label>
            <input className={theme.inputCls} value={shop.company.ico ?? ""} onChange={(e) => setCompany("ico", e.target.value)} />
          </div>
          <div>
            <label className={theme.labelCls}>DIČ</label>
            <input className={theme.inputCls} value={shop.company.dic ?? ""} onChange={(e) => setCompany("dic", e.target.value)} placeholder="CZ…" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>Ulice a č. p.</label>
            <input className={theme.inputCls} value={shop.company.address ?? ""} onChange={(e) => setCompany("address", e.target.value)} placeholder="Revoluční 724/7" />
          </div>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label className={theme.labelCls}>Město</label>
              <input className={theme.inputCls} value={shop.company.city ?? ""} onChange={(e) => setCompany("city", e.target.value)} />
            </div>
            <div>
              <label className={theme.labelCls}>PSČ</label>
              <input className={theme.inputCls} value={shop.company.zip ?? ""} onChange={(e) => setCompany("zip", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>Bankovní účet</label>
            <input className={theme.inputCls} value={shop.company.bank_account ?? ""} onChange={(e) => setCompany("bank_account", e.target.value)} placeholder="123456789/0100" />
          </div>
          <div>
            <label className={theme.labelCls}>E-mail pro objednávky</label>
            <input className={theme.inputCls} value={shop.company.order_email ?? ""} onChange={(e) => setCompany("order_email", e.target.value)} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className={theme.labelCls}>Telefon</label>
            <input className={theme.inputCls} value={shop.company.phone ?? ""} onChange={(e) => setCompany("phone", e.target.value)} placeholder="+420 …" />
          </div>
          <div>
            <label className={theme.labelCls}>Zápis v rejstříku</label>
            <input className={theme.inputCls} value={shop.company.registration ?? ""} onChange={(e) => setCompany("registration", e.target.value)} placeholder="OR u MS v Praze, oddíl C, vložka …" />
          </div>
        </div>
        <p className={theme.noticeCls}>
          Údaje se použijí na potvrzení objednávek, fakturách a v QR platbě.
        </p>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Doprava</h3>
        <p className="mb-3 text-[12.5px] text-gray-500">Ceny dopravy a hranice pro dopravu zdarma. Vypnuté metody se v pokladně nenabízí.</p>
        <div className="space-y-2">
          {shippingMethods.map((m, i) => (
            <div key={m.key} className={`rounded-md border px-3 py-2.5 ${m.enabled ? theme.selectedChipCls : theme.choiceChipCls}`}>
              <div className="flex items-center justify-between gap-3">
                <input className={`${theme.inputCls} !h-8 flex-1 text-[13px] font-semibold`} value={m.label}
                  onChange={(e) => patchShipping(i, { label: e.target.value })} />
                <Toggle on={m.enabled} onClick={() => patchShipping(i, { enabled: !m.enabled })} label={`Zapnout ${m.label}`} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className={theme.labelCls}>Cena (Kč)</label>
                  <input inputMode="decimal" className={`${theme.inputCls} !h-8`} value={centsToCzk(m.price_cents)}
                    onChange={(e) => patchShipping(i, { price_cents: czkToCents(e.target.value) })} />
                </div>
                <div>
                  <label className={theme.labelCls}>Zdarma od (Kč) — prázdné = nikdy</label>
                  <input inputMode="decimal" className={`${theme.inputCls} !h-8`}
                    value={m.free_above_cents == null ? "" : centsToCzk(m.free_above_cents)}
                    onChange={(e) => patchShipping(i, { free_above_cents: e.target.value.trim() === "" ? null : czkToCents(e.target.value) })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Platby</h3>
        <p className="mb-3 text-[12.5px] text-gray-500">Poplatky za platební metody. Platba kartou (GoPay) se zobrazí jen s aktivní platební bránou.</p>
        <div className="space-y-2">
          {paymentMethods.map((m, i) => (
            <div key={m.key} className={`rounded-md border px-3 py-2.5 ${m.enabled ? theme.selectedChipCls : theme.choiceChipCls}`}>
              <div className="flex items-center justify-between gap-3">
                <input className={`${theme.inputCls} !h-8 flex-1 text-[13px] font-semibold`} value={m.label}
                  onChange={(e) => patchPayment(i, { label: e.target.value })} />
                <Toggle on={m.enabled} onClick={() => patchPayment(i, { enabled: !m.enabled })} label={`Zapnout ${m.label}`} />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className={theme.labelCls}>Poplatek (Kč)</label>
                  <input inputMode="decimal" className={`${theme.inputCls} !h-8`} value={centsToCzk(m.fee_cents)}
                    onChange={(e) => patchPayment(i, { fee_cents: czkToCents(e.target.value) })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Google recenze</h3>
        <p className="mb-3 text-[12.5px] text-gray-500">
          Hodnoty pro badge modulu Google recenze na detailu produktu. Vyplňte hodnocení a počet recenzí z vašeho Google profilu.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={theme.labelCls}>Hodnocení (1–5)</label>
            <input inputMode="decimal" className={theme.inputCls}
              value={String((shop.settings.google_reviews as { rating?: number })?.rating ?? "4,9").replace(".", ",")}
              onChange={(e) => {
                const n = parseFloat(e.target.value.replace(",", "."));
                setShop({ ...shop, settings: { ...shop.settings, google_reviews: { ...(shop.settings.google_reviews as object ?? {}), rating: Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 4.9 } } });
              }} />
          </div>
          <div>
            <label className={theme.labelCls}>Počet recenzí</label>
            <input inputMode="numeric" className={theme.inputCls}
              value={String((shop.settings.google_reviews as { count?: number })?.count ?? 127)}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setShop({ ...shop, settings: { ...shop.settings, google_reviews: { ...(shop.settings.google_reviews as object ?? {}), count: Number.isFinite(n) ? Math.max(0, n) : 0 } } });
              }} />
          </div>
          <div>
            <label className={theme.labelCls}>Odkaz na Google profil</label>
            <input className={theme.inputCls} placeholder="https://g.page/…"
              value={(shop.settings.google_reviews as { url?: string })?.url ?? ""}
              onChange={(e) => setShop({ ...shop, settings: { ...shop.settings, google_reviews: { ...(shop.settings.google_reviews as object ?? {}), url: e.target.value } } })} />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Detail produktu — galerie</h3>
        <p className="mb-3 text-[12.5px] text-gray-500">
          Výchozí chování je jako na Alze: klik na obrázek otevře galerii přes celou obrazovku, bez zoomu a šipek.
          Obě funkce si můžete zapnout navíc.
        </p>
        <div className="space-y-2">
          {([
            { key: "gallery_zoom", label: "Zoom lupou na najetí myší", desc: "Přiblížení obrázku při pohybu kurzorem po fotce" },
            { key: "gallery_arrows", label: "Šipky pro listování na obrázku", desc: "Předchozí / další fotka přímo na hlavním obrázku" },
          ] as const).map((opt) => {
            const on = !!shop.settings[opt.key];
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setShop({ ...shop, settings: { ...shop.settings, [opt.key]: !on } })}
                className={`flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition ${
                  on ? theme.selectedChipCls : theme.choiceChipCls
                }`}
              >
                <span>
                  <span className="block text-[13px] font-semibold">{opt.label}</span>
                  <span className="block text-[11.5px] opacity-70">{opt.desc}</span>
                </span>
                <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className={h3Cls}>Administrace</h3>
        <label className={theme.labelCls}>Design administrace</label>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COMMERCE_DESIGN_OPTIONS.map((option) => {
            const active = currentDesign === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onDesignChange(option.key)}
                className={`flex h-11 items-center gap-2 rounded-md border px-3 text-left text-[12.5px] font-semibold transition ${
                  active ? theme.selectedChipCls : theme.choiceChipCls
                }`}
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.dot}`} aria-hidden />
                <span className="truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className={theme.btnPrimary}>
          {saving ? "Ukládám…" : "Uložit nastavení"}
        </button>
        {msg && <span className="text-[13px] text-emerald-600">{msg}</span>}
        {error && <span className="text-[13px] text-red-600">{error}</span>}
      </div>
    </div>
  );
}
