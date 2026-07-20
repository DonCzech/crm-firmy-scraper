"use client";

import Link from "next/link";

interface FooterCategory {
  slug: string;
  name: string;
}

interface ShopFooterProps {
  tenantSlug: string;
  shopName: string;
  categories: FooterCategory[];
  /** Odkazy na stránky aktivních modulů (mapa prodejen, stav objednávky, slovník…) */
  moduleLinks?: { href: string; label: string }[];
  /** Modul whatsapp-chat: plovoucí widget */
  whatsapp?: boolean;
}

const CUSTOMER_LINKS = [
  "Doprava a platba",
  "Vrácení zboží a reklamace",
  "Obchodní podmínky",
  "Ochrana osobních údajů",
  "Časté dotazy",
  "Věrnostní program",
];

const COMPANY_LINKS = ["O nás", "Kamenné prodejny", "Kariéra", "Velkoobchod", "Kontakt"];

const PAYMENT_LOGO_BASE = "/assets/eshop-01/logos/payments";

function paymentLogo(file: string) {
  return `${PAYMENT_LOGO_BASE}/${file}.webp`;
}

const PAYMENT_LOGOS = [
  { label: "Visa", src: paymentLogo("visa"), width: 36, height: 11 },
  { label: "Mastercard", src: paymentLogo("mastercard"), width: 35, height: 17 },
  { label: "Apple Pay", src: paymentLogo("apple-pay"), width: 44, height: 15 },
  { label: "Google Pay", src: paymentLogo("google-pay"), width: 50, height: 14 },
  { label: "GoPay", src: paymentLogo("gopay"), width: 53, height: 13 },
  { label: "Převodem", src: paymentLogo("prevodem"), width: 71, height: 14 },
  { label: "Dobírka", src: paymentLogo("dobirka"), width: 63, height: 14 },
] as const;

function PaymentBadge({ payment }: { payment: (typeof PAYMENT_LOGOS)[number] }) {
  return (
    <span
      aria-label={payment.label}
      title={payment.label}
      className="flex h-7 min-w-[48px] items-center justify-center overflow-hidden rounded-lg bg-white px-[9px] text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_12px_28px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/12"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={payment.src}
        alt={payment.label}
        loading="lazy"
        style={{ width: payment.width, height: payment.height }}
        className="block object-contain"
      />
    </span>
  );
}

export function ShopFooter({ tenantSlug, shopName, categories, moduleLinks = [], whatsapp = false }: ShopFooterProps) {
  const base = `/demo/${tenantSlug}/obchod`;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      {/* Main columns */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand + contact */}
        <div>
          <Link href={base} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2cc75c] via-[#1d9a44] to-[#137a35] text-white shadow-[0_2px_10px_rgba(29,154,68,0.35)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1.5" fill="currentColor" /><circle cx="19" cy="21" r="1.5" fill="currentColor" /><path d="M2 3h3l2.7 13.4a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L23 7H6" /></svg>
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">{shopName}</span>
          </Link>
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed">
            Váš spolehlivý online obchod. Přes 10 000 produktů skladem, expedice do 24 hodin a doprava zdarma od 1 500 Kč.
          </p>
          <div className="mt-6 space-y-3 text-[14px]">
            <a href="tel:+420777123456" className="flex items-center gap-3 transition-colors hover:text-white">
              <svg className="h-[18px] w-[18px] text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              +420 777 123 456
              <span className="text-[12px] text-neutral-600">Po–Pá 8–17 h</span>
            </a>
            <a href={`mailto:info@${tenantSlug}.cz`} className="flex items-center gap-3 transition-colors hover:text-white">
              <svg className="h-[18px] w-[18px] text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              info@{tenantSlug}.cz
            </a>
            <div className="flex items-center gap-3">
              <svg className="h-[18px] w-[18px] text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Vodičkova 12, 110 00 Praha 1
            </div>
          </div>
          {/* Social */}
          <div className="mt-6 flex gap-2.5">
            {[
              { label: "Facebook", d: "M13.5 21v-7h2.5l.5-3h-3V9.1c0-.9.3-1.6 1.7-1.6H16.6V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2V11H7.5v3H10v7h3.5Z" },
              { label: "Instagram", d: "M12 8.7a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6ZM12 4c2.2 0 2.4 0 3.3.05a6 6 0 0 1 2 .37 4.1 4.1 0 0 1 2.34 2.34 6 6 0 0 1 .36 2C20 9.6 20 9.8 20 12s0 2.4-.05 3.3a6 6 0 0 1-.37 2 4.1 4.1 0 0 1-2.33 2.33 6 6 0 0 1-2 .37C14.4 20 14.2 20 12 20s-2.4 0-3.3-.05a6 6 0 0 1-2-.37 4.1 4.1 0 0 1-2.33-2.33 6 6 0 0 1-.37-2C4 14.4 4 14.2 4 12s0-2.4.05-3.3a6 6 0 0 1 .37-2A4.1 4.1 0 0 1 6.75 4.4a6 6 0 0 1 2-.36C9.6 4 9.8 4 12 4Zm4.5 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" },
              { label: "YouTube", d: "M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.07] text-neutral-400 transition-all hover:bg-white hover:text-neutral-950"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white">Nakupujte</h4>
          <ul className="mt-5 space-y-3 text-[14px]">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link href={`${base}?kategorie=${c.slug}`} className="transition-colors hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href={`${base}?vse=1`} className="font-semibold text-white underline-offset-4 hover:underline">
                Všechny produkty →
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer service */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white">Zákaznický servis</h4>
          <ul className="mt-5 space-y-3 text-[14px]">
            {moduleLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-semibold text-white/90 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            {CUSTOMER_LINKS.map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-white">
                  {l}
                </a>
              </li>
            ))}
            <li>
              <Link href={`${base.replace(/\/obchod$/, "")}/ucet`} className="transition-colors hover:text-white">
                Můj účet
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-[0.15em] text-white">Společnost</h4>
          <ul className="mt-5 space-y-3 text-[14px]">
            {COMPANY_LINKS.map((l) => (
              <li key={l}>
                <a href="#" className="transition-colors hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-xl bg-white/[0.05] p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <span className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.5 14.9 8.6l6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5Z" />
                  </svg>
                ))}
              </span>
              <span className="text-sm font-bold text-white">4,9/5</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-neutral-500">
              Na základě 2 400+ ověřených recenzí zákazníků
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-5 py-6 md:flex-row">
          <p className="text-[13px] text-neutral-500">
            © {year} {shopName}. Všechna práva vyhrazena.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_LOGOS.map((payment) => (
              <PaymentBadge key={payment.label} payment={payment} />
            ))}
          </div>
        </div>
      </div>

      {/* Plovoucí WhatsApp chat (modul whatsapp-chat) */}
      {whatsapp && (
        <a
          href="https://wa.me/420777123456?text=Dobr%C3%BD%20den%2C%20m%C3%A1m%20dotaz%20k%20objedn%C3%A1vce."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Napište nám na WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.45)] transition-transform hover:scale-110"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.9 2.9 4.6 4 .6.3 1.1.4 1.5.6.6.2 1.2.2 1.7.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z" />
          </svg>
        </a>
      )}
    </footer>
  );
}
