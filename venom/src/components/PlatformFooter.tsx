import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

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

const COLUMNS = [
  {
    title: "Produkt",
    links: [
      ["Šablony", "#sablony"],
      ["Funkce", "#jak-to-funguje"],
      ["Ceník", "#ceny"],
      ["Reference", "#reference"],
    ],
  },
  {
    title: "Společnost",
    links: [
      ["O Weberu", "#"],
      ["Kariéra", "#"],
      ["Kontakt", "#"],
      ["Blog", "#"],
    ],
  },
  {
    title: "Kontakt",
    links: [
      ["podpora@webero.co", "mailto:podpora@webero.co"],
      ["+420 776 123 456",  "tel:+420776123456"],
      ["Po–Pá 9:00–17:00",  "#"],
      ["Stav systému",      "#"],
    ],
  },
];

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

export function PlatformFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0a0a0a] text-white">
      {/* Top hairline glow */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />

      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-10 lg:py-20">

        {/* Newsletter — full-width hero band */}
        <div className="mb-14 grid items-center gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 backdrop-blur-sm md:grid-cols-[1.1fr_1fr] md:p-10 lg:mb-16">
          <div>
            <p
              className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#a5b4fc]"
              style={{ letterSpacing: "0.18em" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              Newsletter
            </p>
            <h3
              className="font-sans font-semibold tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(22px, 2.6vw, 30px)", lineHeight: "1.15" }}
            >
              Dostaňte 5 šablon zdarma.
            </h3>
            <p className="mt-2 max-w-[420px] text-[14px] leading-[1.55] text-white/65">
              Nové šablony, design tipy a UX postřehy.
              1× měsíčně, žádný spam, odhlášení 1 klikem.
            </p>
          </div>
          <NewsletterForm />
        </div>

        {/* Top — brand + columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5 md:gap-12">

          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-[18px] font-bold tracking-[-0.025em] text-white"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <WeberoMark size={32} />
              Webero
            </Link>
            <p className="mt-5 max-w-[300px] text-[13.5px] leading-[1.65] text-white/55">
              Profesionální weby bez programátora. Šablony, editor, hosting — vše v jednom.
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  <span className="h-4 w-4">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3
                className="mb-5 text-[11px] font-semibold uppercase text-white"
                style={{ letterSpacing: "0.16em" }}
              >
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-[14px] text-white/80 transition hover:text-white"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom — single line */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-7 text-[12.5px] text-white sm:flex-row sm:items-center">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
            <span>Všechny systémy běží</span>
            <span className="mx-2 text-white/50">·</span>
            <span>Hosting v EU</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-white/70">Obchodní podmínky</a>
            <a href="#" className="hover:text-white/70">Ochrana údajů</a>
            <span>© {year} Webero s.r.o.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
