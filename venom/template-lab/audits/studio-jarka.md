# Audit šablony: studio-jarka

## Identifikace

| Pole | Hodnota |
|------|---------|
| Original slug (queue id 5) | `studio-jarka` |
| Original název firmy | Studio Jarka (jarkacechova.cz) |
| Originální doména | `jarkacechova.cz` |
| Kategorie (z queue) | Kadeřnictví |
| **Skeleton** | `service-personal` |
| **Engine slug** | `hair-01` |
| **Engine tenant slug** | `hair-01-v2` |
| **Demo název** | Salon Aria |
| **s.r.o. forma** | Salon Aria s.r.o. |
| Předchozí DONE šablona stejné kategorie | `barber-04` (Černý Fade) |
| URL na clone demo | `http://localhost:3015/demo/studio-jarka-demo` |
| CMS | Tilda (T396 zero-blocks) |
| Mirror fonty | Montserrat 100–900 (WOFF2, lokálně v `fonts/`) |

## Layout — sekce v pořadí (homepage, single-page)

| Pos | Sekce | Typ | Variant (plán) | Poznámka |
|-----|-------|-----|----------------|----------|
| 1 | Navbar | navbar | `hair-01-topbar` (NEW) | Dark thin bar, logo vlevo, 5 nav linků, phone+email+social vpravo |
| 2 | Hero | hero | `hero-hair-fullbleed` (NEW) | Full-bleed tmavá foto, scroll indicator dole |
| 3 | About + Stats | about | `about-hair-split-stats` (NEW) | 2-col: dark left (text+3 stats) / gold right (#8a6f28, portrait foto+CTA) |
| 4 | Services | services | `hair-numbered-cards` (NEW) | 4 numbered cards (01-04), gold číslo, název, popis, CTA button |
| 5 | CTA | cta | `default` (Reuse) | "Zobrazit všechny služby" link button |
| 6 | Values | about | `two-col` (Reuse) | Foto vlevo tmavé, text vpravo, cream bg. "Víme, jak důležité jsou..." |
| 7 | Team | team | `cards-grid` (Reuse) | "TÝM PROFESIONÁLŮ", 7 karet s headshots |
| 8 | Testimonials | testimonials | `static` (Reuse) | "RECENZE NAŠICH KLIENTŮ", hvězdičky |
| 9 | Footer | footer | `hair-01-footer` (NEW) | Dark bg, "Těšíme se na vás!", phone+email+addr+hours, copyright |

SKIP sekce (skeleton service-personal): Pricing (originál nemá samostatný ceník), Booking/CTA booking (jen inline CTA), Locations (jediná pobočka v footer), FAQ (nemá).

## Vizuální identita

### Fonty
| Role | Font | Váhy |
|------|------|------|
| Vše (display + body) | **Montserrat** | 100–900 |

### Barvy (extrahované HEX)
| Token | Hodnota | Použití |
|-------|---------|---------|
| `primary` | `#8a6f28` | gold accent, about-right bg, links, active |
| `primary-light` | `#9c813b` | hover, subtitle |
| `primary-mid` | `#957B38` | alternativní gold |
| `dark-1` | `#1e1e1e` | about-left bg, dark sections |
| `dark-2` | `#322912` | tmavší gold-brown |
| `cream` | `#f5f1f0` | sekce bg (values, services) |
| `cream-2` | `#f0ebe3` | alternativní cream |
| `text-body` | `#494848` | tělo textu |
| `text-muted` | `#605f5f` | muted text |
| `white` | `#ffffff` | karty, header bg |

### Button styl
- Primary: gold bg `#8a6f28`, bílý text, uppercase, Montserrat 600, letter-spacing 0.12em
- Secondary outline: border `#8a6f28`, transparent bg, gold text
- Border-radius: 0 (sharp/square)
- Padding: ~14px 32px

### Spacing personality
**Vzdušné** — sekce `padding: 80–120px 40px` desktop. About gap 0 (full bleed cols). Services grid gap 24px.

### Atmosféra
**Luxusní + moderní + feminine** — zlato-cream paleta, Montserrat clean sans-serif, profesionální headshotové fotky, elegantní kadeřnický salon.

## UX patterny
- **Navbar:** fixní, dark `#1e1e1e`, phone + email + FB/IG ikony vpravo. Hamburger < 768px.
- **Hero:** full-bleed foto, žádný text overlay — text je v SEPARATE sekci (about). Scroll indicator animovaný dole.
- **Services CTA:** každá karta má "OBJEDNAT SE" button → `#rezervace` anchor.
- **Team:** 7 karet v grid, fotka + jméno + role. "Zjistěte více" CTA.
- **Testimonials:** statické hvězdičkové karty, jméno + text recenze.

## Demo data — originál → demo

| Originální hodnota | Demo hodnota |
|--------------------|--------------|
| `+420 608 288 777` | `+420 704 123 456` |
| `info@demo.local` | `info@demo.cz` |
| `Demo ulice 12, Praha 1, 110 00` | `Ukázková 123, 110 00 Praha 1` |
| Název `Studio Jarka` / `Hair Salon Demo Salón` | `Salon Aria` |
| `jarkacechova.cz` | `demo.cz` |
| `BOMTON CUP` (reálná soutěž) | `Hair Awards` (generický) |
| Tým: Lenka Nováková, Petra Kovářová, Marta Svobodová, Markéta Horváth, Jana Procházková, Eliška Veselá, Markéta Bílá | Demo jména: Andrea Kovářová, Simona Blahová, Tereza Marková, Lucie Horáková, Kateřina Dvořáčková, Martina Šimánková, Věra Procházková |
| Recenze (real zákazníci) | Demo: Jan Novák, Petra Svobodová, Tomáš Dvořák, Eva Procházková |
| Stats: `15 let`, `25+ let`, nominací BOMTON | `12 let`, `20+ let`, `8 nominací` |
| `© 2026 Demo Salónu` | `Salon Aria s.r.o.` IČO `12345678` |
| Logo z originálu | Demo SVG wordmark "ARIA" gold na tmavém |
| Fotky headshotů | Demo placeholder `400×500` |
| Fotky hero/about | Demo placeholder s rozměrem |

### Demo about copy (Salon Aria)
**Lead:**
> Salon s důrazem na kvalitu, zkušenosti a individuální přístup ke každému klientovi.

**Body:**
> Salon Aria působí v centru Prahy. Za naší prací stojí zkušený tým specialistů, kteří se věnují péči o vlasy s precizností a citem pro detail. Každá návštěva je pro nás příležitostí vytvořit výsledek, na který budete hrdí.

### Demo recenze
| Jméno | Text | ★ |
|-------|------|---|
| Jan Novák | "Skvělý salon, příjemný personál a výsledek byl přesně to, co jsem si přál. Určitě se vrátím." | 5 |
| Petra Svobodová | "Konečně salon, kde opravdu naslouchají. Balayage vypadá naprosto přirozeně." | 5 |
| Tomáš Dvořák | "Profesionální přístup od prvního kontaktu. Doporučuji všem, kdo hledají kvalitu." | 5 |
| Eva Procházková | "Atmosféra salonu je úžasná, o výsledku ani nemluvě. Nejlepší volba v Praze." | 5 |

## Defekty originálu k opravě
- Marquee "NAŠE SLUŽBY · NAŠE SLUŽBY" — dekorativní prvek, v engine verzi VYPUSTIT (zbytečná komplexita, žádná přidaná hodnota)
- "BOMTON CUP" branding → generický "Hair Awards"
- Tým member names → demo jména
- Real telefon/email → demo
- Fotky (originální headshotové fotky) → demo placeholder

## Plán implementace FÁZE C

```
Sekce 1  Header (navbar:hair-01-topbar)         NEW variant + component
Sekce 2  Hero (hero:hero-hair-fullbleed)         NEW variant + component
Sekce 3  About+Stats (about:about-hair-split-stats)  NEW variant + component
Sekce 4  Services (services:hair-numbered-cards)  NEW variant + component
Sekce 5  CTA (cta:default)                       REUSE
Sekce 6  Values (about:two-col)                  REUSE
Sekce 7  Team (team:cards-grid)                  REUSE
Sekce 8  Testimonials (testimonials:static)       REUSE
Sekce 9  Footer (footer:hair-01-footer)           NEW variant + component
```

SKIP: Pricing (originál nemá), Booking/Locations/FAQ (nemá).

## Status
`READY_FOR_PHASE_C`
