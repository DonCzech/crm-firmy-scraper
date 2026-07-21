# SIGNAL (signal-01) — B2B Authority

Fable Premium V3, šablona 2/10. Archetyp **B2B Authority** — cíl: kvalifikovaný lead / rezervace konzultace.
Obory: consulting, IT/cybersecurity, finance, právo, HR, logistika, výroba, energetika.

## Vizuální systém — „Swiss authority"

- **Paleta**: charcoal `#101418` (tmavé sekce) · electric blue `#2563EB` (akcent; na tmavé zesvětlený `#6EA8FE`)
  · ledová šedá `#F3F5F7` · bílá; text `#111827`, muted `#5B6472`, hairline `#E3E7EB`; footer tmavší `#0B0F14`.
- **Typografie**: nadpisy Oswald (`--font-oswald`, weight 600), body Overpass, mono akcenty
  `--font-overpass-mono` pro čísla/labely/eyebrows (pozor: theme `--font-mono` neexistuje, komponenty
  používají přímo globální `--font-overpass-mono`).
- **Rytmus**: hero (charcoal) → stats (bílá) → řešení (ledová) → metodika (charcoal) → cases (bílá)
  → reference (bílá) → FAQ (bílá) → konzultace (charcoal) → footer (`#0B0F14`).

## Signature interakce

Hero glass panel „Vyberte svou roli" — segmented control (CEO / CFO / IT ředitel / HR) se sliding thumb;
přepnutí živě mění 3 benefity (hairline řádky), case metriku (velká Oswald typografie v modré) a poznámku.
CTA „Rezervovat konzultaci" → `#konzultace` (contact sekce).

## Sekce (všechny `industries: ["*"]`)

| Varianta | Soubor |
|---|---|
| `signal-01-navbar` (+ sticky mobilní CTA lišta) | NavbarSection |
| `signal-01-hero`, `hero-signal-01-page` | HeroSection |
| `signal-01-stats` (count-up přes `Pf01CountUp`) | StatsSection |
| `signal-01-services`, `signal-01-method` | ServicesSection |
| `signal-01-cases` (odkazy na CMS detail) | GallerySection |
| `signal-01-team` | TeamSection |
| `signal-01-testimonials` | TestimonialsSection |
| `signal-01-faq` | FaqSection |
| `signal-01-contact` (pole Společnost + select Co řešíte) | ContactSection |
| `signal-01-footer` | FooterSection |

## CMS detail case study

`/demo/<tenant>/case-studies/<itemSlug>` — `src/app/demo/[tenantSlug]/case-studies/[itemSlug]/page.tsx`.
Data ze content gallery sekce `signal-01-cases` (items: slug/title/excerpt/body/metric/metricLabel/industry/photo),
stránky case-studies → home fallback. TenantChrome + contact sekce tenanta + BreadcrumbList schema + 404.

## Stránky

home · reseni (řešení + metodika) · case-studies (listing + CMS detail) · o-firme (stats + tým + testimonials) · kontakt.
Skeleton `professional`.

## Mood presety (theme.json)

Corporate (blue, default) · Counsel (deep green `#0E6B4F`) · Industrial (amber `#D97706`).

## Rebuild

Komponenty + registrace jsou deterministicky obnovitelné: `python3 scripts/signal-rebuild.py`
(idempotentní — ořízne bloky od SIGNAL banneru a znovu je appenduje; ochrana proti paralelní session).

## Kontakty (demo data)

Ukázka Consulting s.r.o. · 704 123 456 · poptavka@demo.cz / email@demo.cz · Ukázková 123, 110 00 Praha 1 · IČO 12345678.
