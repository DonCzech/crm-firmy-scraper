import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";
import { type PlatformLocale, localizedPath, platformCopy, platformPath } from "@/lib/platform-i18n";

function WeberoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="30" height="30" rx="8" fill="url(#footer-wm-grad)" />
      <path
        d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="footer-wm-grad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function columnsFor(locale: PlatformLocale) {
  const copy = platformCopy[locale].footer;
  return [
    {
      title: copy.product,
      links: [
        [copy.templates, "#sablony"],
        [copy.features, "#jak-to-funguje"],
        [copy.pricing, "#ceny"],
        [copy.references, "#reference"],
      ],
    },
    {
      title: copy.company,
      links: [
        [copy.about, "#"],
        [copy.careers, "#"],
        [copy.contact, "#"],
        [copy.blog, "#"],
      ],
    },
    {
      title: copy.contactTitle,
      links: [
        ["podpora@webero.co", "mailto:podpora@webero.co"],
        ["+420 776 123 456", "tel:+420776123456"],
        [copy.hours, null],
      ],
    },
  ] as { title: string; links: [string, string | null][] }[];
}

const SOCIALS = [
  {
    name: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v1.5c.7-1 1.8-1.8 3.5-1.8 2.8 0 3.5 1.8 3.5 4.3V20h-4v-4.8c0-1.1-.4-1.8-1.4-1.8-.9 0-1.6.6-1.6 1.8V20h-4V10z" />
      </svg>
    ),
  },
  {
    name: "X",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 3h3.4L13.4 11.6 22.2 21h-6.8l-5.3-6.4L4 21H0.6l8.1-9.2L0.3 3h7l4.8 5.8L17.5 3zm-1.2 16h1.9L7.7 5H5.7l10.6 14z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.5 7s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.8C16 4 12 4 12 4s-4 0-6.8.2c-.4 0-1.2 0-1.9.8-.6.6-.8 2-.8 2S2.3 8.7 2.3 10.4v1.2c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.5.1 6.6.2 6.6.2s4 0 6.8-.2c.4 0 1.2 0 1.9-.8.6-.6.8-2 .8-2s.2-1.7.2-3.4v-1.2C21.7 8.7 21.5 7 21.5 7zM10 14.5v-5l4.5 2.5L10 14.5z" />
      </svg>
    ),
  },
];

export function PlatformFooter({ locale = "cs" }: { locale?: PlatformLocale } = {}) {
  const year = new Date().getFullYear();
  const copy = platformCopy[locale].footer;
  const columns = columnsFor(locale);

  return (
    <footer className="relative bg-[#fafafa] text-[#0a0a0a]">
      {/* Top hairline glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />

      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">

        {/* Newsletter — full-width hero band */}
        <div className="relative mb-14 overflow-hidden rounded-3xl bg-[#151633] p-8 text-white shadow-[0_30px_70px_-30px_rgba(21,22,51,0.6)] md:p-10 lg:mb-16">
          {/* Brand glow — same language as the dark sections above */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.9]"
            style={{ background: "radial-gradient(58% 60% at 88% -10%, rgba(129,140,248,0.5), transparent 62%), radial-gradient(50% 55% at 10% 110%, rgba(167,139,250,0.35), transparent 62%), radial-gradient(40% 50% at 50% 50%, rgba(56,189,248,0.14), transparent 65%)" }}
          />
          {/* Grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
            <div>
              <p
                className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#a5b4fc]"
                style={{ letterSpacing: "0.16em" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                Newsletter
              </p>
              <h3
                className="font-sans font-semibold tracking-[-0.025em] text-white"
                style={{ fontSize: "clamp(22px, 2.6vw, 30px)", lineHeight: "1.15" }}
              >
                {copy.newsletterTitle}
              </h3>
              <p className="mt-2.5 max-w-[420px] text-[14px] leading-[1.6] text-white/70">
                {copy.newsletterText}
              </p>
            </div>
            <NewsletterForm
              copy={{
                placeholder: copy.newsletterPlaceholder,
                submit: copy.newsletterSubmit,
                loading: copy.newsletterLoading,
                successTitle: copy.newsletterSuccessTitle,
                successText: copy.newsletterSuccessText,
                error: copy.newsletterError,
              }}
            />
          </div>
        </div>

        {/* Top — brand + columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-12">

          {/* Brand */}
          <div className="col-span-2">
            <Link
              href={localizedPath("/", locale)}
              className="inline-flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.025em] text-[#0a0a0a]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <WeberoMark size={32} />
              Webero
            </Link>
            <p className="mt-5 max-w-[300px] text-[13.5px] leading-[1.65] text-[#6b7280]">
              {copy.brandText}
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e7eb] bg-white text-[#6b7280] transition duration-300 hover:-translate-y-0.5 hover:border-[#0a0a0a]/30 hover:text-[#0a0a0a]"
                >
                  <span className="h-4 w-4">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3
                className="mb-5 text-[11px] font-semibold uppercase text-[#9ca3af]"
                style={{ letterSpacing: "0.16em" }}
              >
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="group relative inline-block text-[14px] text-[#4b5563] transition-colors duration-200 hover:text-[#0a0a0a]"
                      >
                        {label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#0a0a0a]/50 transition-all duration-300 group-hover:w-full" />
                      </a>
                    ) : (
                      <span className="text-[14px] text-[#9ca3af]">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — single line */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[#e5e7eb] pt-7 text-[12.5px] text-[#6b7280] lg:flex-row lg:items-center">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22c55e] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            </span>
            <span className="text-[#374151]">{copy.systemsOk}</span>
            <span className="mx-1 text-[#d1d5db]">·</span>
            <span>{copy.euHosting}</span>
          </div>
          <div className="inline-flex overflow-hidden rounded-full border border-[#e5e7eb] bg-white p-1">
            <Link
              href={platformPath("/", "cs")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition ${
                locale === "cs"
                  ? "bg-[#0a0a0a] text-white"
                  : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#0a0a0a]"
              }`}
            >
              <span aria-hidden>🇨🇿</span>
              CS
            </Link>
            <Link
              href={platformPath("/", "en")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition ${
                locale === "en"
                  ? "bg-[#0a0a0a] text-white"
                  : "text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#0a0a0a]"
              }`}
            >
              <span aria-hidden>🇬🇧</span>
              EN
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="transition-colors hover:text-[#0a0a0a]">{copy.terms}</a>
            <a href="#" className="transition-colors hover:text-[#0a0a0a]">{copy.privacy}</a>
            <span className="text-[#9ca3af]">© {year} Webero s.r.o.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
