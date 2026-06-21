# elektro-01 — Demo Elektro

| Pole | Hodnota |
|------|---------|
| Slug | `elektro-01` |
| Demo název | Demo Elektro |
| Industry | `elektro` |
| Skeleton | `b2b-trade` |
| Zdrojový web | elektro-bohacek.cz (Elektro Boháček) |
| Clone clone | `public/clones/elektrobohacek/` |
| Datum | 2026-06-12 |

## Design tokens

| Token | Hodnota |
|-------|---------|
| Primary | `#dd0808` (červená) |
| Primary hover | `#ef0000` |
| Dark | `#1b1b1b` |
| Light | `#f5f5f5` |
| Text | `#5D5D5D` |
| Font heading | Montserrat (600/700/800) |
| Font body | Roboto (400) |
| Button radius | `0px` (square) |
| Hero overlay | `linear-gradient(70deg, rgba(0,0,0,0.90) 55%, rgba(150,0,0,0.80) 100%)` |

## Varianty sekcí

| Sekce | Varianta |
|-------|----------|
| Navbar | `elektro-01-navbar` |
| Hero | `elektro-01-hero` |
| Services (homepage) | `elektro-01-services` |
| Services (detail page) | `elektro-01-services-detail` |
| Gallery | `elektro-01-gallery` |
| Contact | `elektro-01-contact` |
| Map | `elektro-01-map` |
| CTA form | `elektro-01-cta-form` |
| Footer | `elektro-01-footer` |

## Stránky

- `/` — homepage (7 sekcí)
- `/elektroinstalace` — detail: silnoproud + slaboproud
- `/hromosvody` — detail: hromosvody a uzemnění
- `/kontakt` — kontakt + mapa

## Demo data

| Pole | Demo hodnota |
|------|--------------|
| Firma | Demo Elektro |
| Telefon | 704 123 456 |
| Email | info@demo.cz |
| Adresa | Ukázková 123, 110 00 Praha 1 |
| IČO | 12345678 |
| Web | https://demo.cz |
| Facebook | https://facebook.com/demo |
| Instagram | https://instagram.com/demo |

## Defekty originálu opraveny

- Hero H1 spojen do "ELEKTROINSTALACEHROMOSVODY" (CSS columns artifact) → opraveno na 2 řádky
- Galerie WP shortcode nepravidelný grid → sjednocen 3-col aspect 4:3
- Duplicitní heading "galerie realizace" po "MOJE REFERENCE" → sjednoceno
- /sluzby, /reference, /kontakt byly 404 → vytvořeny jako plnohodnotné stránky
- Duplicate H1+H2 "HROMOSVODY" na hromosvody stránce → sjednoceno
