import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/db";
import { getShopByTenantId } from "@/lib/commerce/shop";
import { getOrderByPublicToken } from "@/lib/commerce/checkout";
import { qrPaymentDataUrl } from "@/lib/commerce/qr-payment";
import { ShopHeaderServer } from "@/components/storefront/ShopHeaderServer";
import { ShopFooterServer } from "@/components/storefront/ShopFooterServer";

/** Webero Commerce — potvrzení objednávky (Fáze 4). Přístup jen s public tokenem. */
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ tenantSlug: string; orderNumber: string }>;
  searchParams: Promise<{ t?: string; platba?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Potvrzení objednávky", robots: { index: false } };
}

function czk(cents: number, currency = "CZK"): string {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, maximumFractionDigits: 2 })
    .format(cents / 100);
}

const PAYMENT_LABEL: Record<string, string> = {
  gopay: "Platba kartou online",
  bank_transfer: "Bankovní převod",
  cod: "Dobírka",
};

const KEYFRAMES = `
@keyframes ocPop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
@keyframes ocDraw { from { stroke-dashoffset: 32; } to { stroke-dashoffset: 0; } }
@keyframes ocRing { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); } 100% { box-shadow: 0 0 0 22px rgba(16,185,129,0); } }
@keyframes ocUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
.oc-badge { animation: ocPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both, ocRing 1.1s ease-out 0.35s; }
.oc-check { stroke-dasharray: 32; animation: ocDraw 0.45s ease-out 0.3s both; }
.oc-up { animation: ocUp 0.5s ease-out both; }
.oc-up-1 { animation: ocUp 0.5s ease-out 0.08s both; }
.oc-up-2 { animation: ocUp 0.5s ease-out 0.16s both; }
.oc-up-3 { animation: ocUp 0.5s ease-out 0.24s both; }
`;

function InfoIcon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const IC = {
  truck: "M1 5h14v11H1z M15 9h4l3 3v4h-7V9Z M5.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  card: "M2 6h20v13H2z M2 10.5h20",
  pin: "M20 10c0 6-8 11-8 11s-8-5-8-11a8 8 0 0 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
};

const STEPS = ["Přijata", "Vyřizujeme", "Odesláno", "Doručeno"];

export default async function OrderConfirmationPage({ params, searchParams }: Props) {
  const { tenantSlug, orderNumber } = await params;
  const { t, platba } = await searchParams;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  const shop = await getShopByTenantId(tenant.id);
  if (!shop || !t) return notFound();

  const order = await getOrderByPublicToken(tenant.id, orderNumber, t);
  if (!order) return notFound();

  const paid = order.payment_status === "paid";
  const paymentFailed = platba === "neuspesna" && !paid;
  const bankAccount = (shop.company as { bank_account?: string })?.bank_account;
  const vs = order.order_number.replace(/\D/g, "").slice(-9);
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const addr = order.shipping_address;
  const qrDataUrl = order.payment_method === "bank_transfer" && !paid && bankAccount
    ? await qrPaymentDataUrl({
        account: bankAccount,
        amountCents: order.total_cents,
        currency: order.currency,
        vs,
        message: `Objednavka ${order.order_number}`,
      })
    : null;

  return (
    <div className="bg-white">
      <style>{KEYFRAMES}</style>
      <ShopHeaderServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
      <main className="min-h-[60vh] bg-gradient-to-b from-neutral-50 to-white text-[#111]">
        <div className="mx-auto max-w-3xl px-5 py-12">

          {/* ── Hero ─────────────────────────────────────────────── */}
          <div className="oc-up text-center">
            {paymentFailed ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 8v5M12 16.5v.5" /><circle cx="12" cy="12" r="9" /></svg>
                </div>
                <h1 className="mt-5 text-[30px] font-extrabold tracking-tight">Platba se nezdařila</h1>
                <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-neutral-500">
                  Objednávku <strong className="font-semibold text-neutral-900">{order.order_number}</strong> evidujeme,
                  ale platba neproběhla. Ozveme se vám s dalším postupem, nebo nás kontaktujte.
                </p>
              </>
            ) : (
              <>
                <div className="oc-badge mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path className="oc-check" d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h1 className="mt-5 text-[30px] font-extrabold tracking-tight">Děkujeme za objednávku!</h1>
                <p className="mx-auto mt-2 max-w-md text-[14.5px] leading-relaxed text-neutral-500">
                  Objednávku <strong className="font-semibold text-neutral-900">{order.order_number}</strong> jsme přijali
                  a potvrzení poslali na <strong className="font-semibold text-neutral-900">{order.email}</strong>.
                </p>
                {paid && (
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[13px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    Platba přijata
                  </span>
                )}
              </>
            )}
          </div>

          {/* ── Průběh objednávky ────────────────────────────────── */}
          {!paymentFailed && (
            <div className="oc-up-1 mt-9 rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center">
                {STEPS.map((label, i) => (
                  <div key={label} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
                    {i > 0 && <div className={`mx-2 h-[2px] flex-1 rounded-full ${i === 1 ? "bg-gradient-to-r from-emerald-400 to-neutral-200" : "bg-neutral-200"}`} />}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        i === 0 ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30" : "bg-neutral-100 text-neutral-400 ring-1 ring-neutral-200"
                      }`}>
                        {i === 0 ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-[11px] font-semibold ${i === 0 ? "text-emerald-600" : "text-neutral-400"}`}>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Platební údaje pro převod ────────────────────────── */}
          {order.payment_method === "bank_transfer" && !paid && (
            <div className="oc-up-1 mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-blue-100/70 px-5 py-3.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                  <InfoIcon d={IC.card} />
                </span>
                <div>
                  <h2 className="text-[14px] font-bold leading-tight">Platební údaje pro převod</h2>
                  <p className="text-[12px] text-neutral-500">Zboží odešleme ihned po připsání platby.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row">
                <dl className="grid flex-1 gap-px bg-blue-100/50 sm:grid-cols-3 sm:content-start">
                  {bankAccount && (
                    <div className="bg-white/80 px-5 py-3.5">
                      <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-400">Číslo účtu</dt>
                      <dd className="mt-0.5 text-[15px] font-bold tabular-nums tracking-tight">{bankAccount}</dd>
                    </div>
                  )}
                  <div className="bg-white/80 px-5 py-3.5">
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-400">Variabilní symbol</dt>
                    <dd className="mt-0.5 text-[15px] font-bold tabular-nums tracking-tight">{vs}</dd>
                  </div>
                  <div className="bg-white/80 px-5 py-3.5">
                    <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-neutral-400">Částka</dt>
                    <dd className="mt-0.5 text-[15px] font-bold tabular-nums tracking-tight text-blue-700">{czk(order.total_cents, order.currency)}</dd>
                  </div>
                </dl>
                {qrDataUrl && (
                  <div className="flex items-center gap-3.5 border-t border-blue-100/70 bg-white/80 px-5 py-3.5 sm:w-[176px] sm:flex-col sm:justify-center sm:gap-1.5 sm:border-l sm:border-t-0 sm:py-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="QR platba" className="h-[104px] w-[104px] rounded-lg ring-1 ring-neutral-200" />
                    <div className="sm:text-center">
                      <div className="text-[12px] font-bold">QR platba</div>
                      <div className="text-[11px] leading-snug text-neutral-500">Naskenujte v&nbsp;bankovní aplikaci</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Souhrn objednávky ────────────────────────────────── */}
          <div className="oc-up-2 mt-5 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-baseline justify-between border-b border-neutral-100 px-5 py-3.5">
              <h2 className="text-[14px] font-bold">Souhrn objednávky</h2>
              <span className="text-[12.5px] text-neutral-400">{itemCount}&nbsp;ks zboží</span>
            </div>
            <ul className="divide-y divide-neutral-100 px-5">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3.5 py-3.5">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
                    {i.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8" /></svg>
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold leading-snug">{i.title}</div>
                    <div className="mt-0.5 text-[12px] text-neutral-400">
                      {i.variant_title ? `${i.variant_title} · ` : ""}{i.qty} × {czk(i.unit_price_cents, order.currency)}
                    </div>
                  </div>
                  <div className="shrink-0 text-[13.5px] font-bold tabular-nums">{czk(i.total_cents, order.currency)}</div>
                </li>
              ))}
            </ul>
            <div className="space-y-1.5 border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 text-[13.5px]">
              <div className="flex justify-between text-neutral-500"><span>Mezisoučet</span><span className="tabular-nums">{czk(order.subtotal_cents, order.currency)}</span></div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Sleva</span><span className="tabular-nums">−{czk(order.discount_cents, order.currency)}</span></div>
              )}
              <div className="flex justify-between text-neutral-500"><span>Doprava a platba</span><span className="tabular-nums">{order.shipping_cents === 0 ? "Zdarma" : czk(order.shipping_cents, order.currency)}</span></div>
              <div className="flex items-baseline justify-between pt-1.5 text-[17px] font-extrabold tracking-tight">
                <span>Celkem</span><span className="tabular-nums">{czk(order.total_cents, order.currency)}</span>
              </div>
              <div className="text-right text-[11.5px] text-neutral-400">včetně DPH {czk(order.tax_cents, order.currency)}</div>
            </div>
          </div>

          {/* ── Doručení / Platba / Adresa ───────────────────────── */}
          <div className="oc-up-3 mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-neutral-400"><InfoIcon d={IC.truck} /><span className="text-[10.5px] font-bold uppercase tracking-[0.08em]">Doručení</span></div>
              <div className="mt-1.5 text-[13px] font-semibold leading-snug">{order.shipping_method ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-neutral-400"><InfoIcon d={IC.card} /><span className="text-[10.5px] font-bold uppercase tracking-[0.08em]">Platba</span></div>
              <div className="mt-1.5 text-[13px] font-semibold leading-snug">{PAYMENT_LABEL[order.payment_method ?? ""] ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-neutral-400"><InfoIcon d={IC.pin} /><span className="text-[10.5px] font-bold uppercase tracking-[0.08em]">Doručovací adresa</span></div>
              <div className="mt-1.5 text-[13px] font-semibold leading-snug">
                {addr.name}<br />
                <span className="font-normal text-neutral-500">{[addr.street, `${addr.zip ?? ""} ${addr.city ?? ""}`.trim()].filter(Boolean).join(", ")}</span>
              </div>
            </div>
          </div>

          {/* ── CTA ──────────────────────────────────────────────── */}
          <div className="oc-up-3 mt-9 text-center">
            <Link href={`/demo/${tenantSlug}/obchod`}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-7 text-[14px] font-semibold text-white shadow-lg shadow-neutral-900/15 transition hover:bg-neutral-700">
              Zpět do obchodu
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <p className="mt-3 text-[12.5px] text-neutral-400">Máte dotaz k objednávce? Odpovězte na potvrzovací e-mail, rádi pomůžeme.</p>
          </div>
        </div>
      </main>
      <ShopFooterServer tenantId={tenant.id} tenantSlug={tenantSlug} shopName={shop.name || "Obchod"} />
    </div>
  );
}
