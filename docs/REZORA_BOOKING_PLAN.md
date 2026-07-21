# REZORA — Univerzální rezervační platforma: Master plán

> Stav: **NÁVRH k odsouhlasení** · vytvořeno 2026-07-19
> Cíl: jeden rezervační engine (`rezervace`) + inline widget ve venom šablonách,
> který zvládne **všechny typy rezervací** (služba, pobyt, akce, stůl, konzultace)
> a na každé šabloně vypadá na míru. Žádné přesměrování, funguje i na custom doméně.

---

## 1. Co už je HOTOVÉ a ověřené (nezávisle na dalším rozsahu)

| Oblast | Stav |
|---|---|
| Redesign appky `rezervace` (booking flow, admin, auth, login/registrace) | ✅ build PASS, E2E OK, screenshoty |
| CORS na veřejném rezervace API (`/api/users`, `/api/bookings/*`) | ✅ preflight 204 + `*` |
| Venom CSP `connect-src` rozšířeno o rezervace origin (prod + localhost dev) | ✅ |
| Sdílený hook `useRezoraBooking` (veškerá booking logika na 1 místě) | ✅ `src/components/sections/rezora/core.ts` |
| Dispatcher `RezoraWidget` podle `variant` → per-šablona design | ✅ `rezora/index.tsx` |
| `DefaultDesign` (dědí motiv šablony, plný tok služba→slot) | ✅ ověřeno E2E ve 2 motivech |
| Editor pole sekce `rezora-widget` (title, subtitle, providerSlug, apiBaseUrl) | ✅ |

**Architektura je záměrně mode-agnostic:** booking logika je oddělená od designu.
Přidání nového módu = nový flow v hooku + nové design komponenty; stávající se nezahazuje.

---

## 2. Booking MÓDY (typy rezervace)

| Mód | Klíč | Co rezervuje | Vstupy uživatele | Nový backend? |
|---|---|---|---|---|
| Služba + termín | `service` | opakující se sloty (personál) | služba → [pracovník] → den → slot → kontakt | ne (existuje) |
| Konzultace | `meeting` | jednoduchý slot, často online | [téma] → den → slot → kontakt | ne (preset `service`) |
| Pobyt | `stay` | rozsah nocí + pokoj/jednotka | příjezd–odjezd → hosté → pokoj → kontakt | **ANO** |
| Akce / vstupenka | `event` | konkrétní událost + kapacita | událost → počet míst → kontakt | **ANO** |
| Stůl (restaurace) | `table` | den + čas + velikost skupiny | den → čas → počet osob → [místo] → kontakt | **ANO** |

### Datové modely nových módů (návrh)

**stay** (pobyt)
```
rez_units        (id, user_id, name, capacity, price_per_night, currency, image_url, sort)
rez_unit_blocks  (id, unit_id, date_from, date_to, reason)   -- blokace/obsazenost
rez_bookings.*   + check_in DATE, check_out DATE, guests INT, unit_id
API: GET /api/stay/availability?slug&unitId&month  → obsazené noci
     POST /api/bookings (mode=stay)                → validace překryvu nocí
```

**event** (akce/vstupenka)
```
rez_events       (id, user_id, title, starts_at, capacity, price, currency, venue, image_url)
rez_bookings.*   + event_id, seats INT
API: GET /api/events?slug            → nadcházející události + zbývající kapacita
     POST /api/bookings (mode=event) → dekrement kapacity atomicky
```

**table** (stůl)
```
rez_tables (nepovinné) nebo jen kapacitní model:
rez_bookings.*   + party_size INT, area TEXT
API: reuse /api/bookings/slots s párty logikou, nebo nový /api/table/slots
```

---

## 3. Mapování všech 114 šablon → mód

### service (Služba + termín) — 33
barber-01, barber-02, barber-03, barber-04, peak-cut,
hair-01, hair-02, hair-03, hair-04, beauty-01,
nails-01, nails-02, nails-03, tattoo-01, tattoo-02, tattoo-03,
fitness-01, fitness-02, fyzio-01, fyzio-02,
harmonie-01, massage-01, tawan-01, thaimasaze-02,
dental-01, clinic-02, clinic-03, ortho-01, ortho-02,
grooming-01, vet-01, autoservis-01, autoservis-02, autoservis-03

### meeting (Konzultace — preset service) — 18
lawyer-01, legal-02, ucetni-01, ucetni-02, ucetni-03, ucetni-04,
arch-01, arbo-01, lang-01, edu-01, kids-01,
reality-01…06 (prohlídka nemovitosti), autoskola-01

### stay (Pobyt) — 4
hotel-01, hotel-02, chalet-01, pethotel-01

### event (Akce / vstupenka) — 4
events-01, artist-01, dj-01, video-01 (natáčení/rezervace termínu — ověřit)

### table (Stůl) — 8
restaurant-01, restaurant-02, restaurant-03, restaurant-04,
cafe-01, cafe-02, cafe-03, cafe-04

### service? (řemeslo — poptávka termínu obhlídky) — kandidáti k rozhodnutí — 20
instala-01/02, malir-01/02, klempir-01, klima-01, elektro-01,
solar-01/02/03, stavba-01/02/03, rekonstrukce-01, floors-01,
garden-01/02, clean-01/02, ddd-01
→ tyto řemeslné obory spíš **poptávkový formulář / obhlídka** (meeting mód),
   ne klasický slot. Doporučení: `meeting` mód.

### none (bez rezervace) — 27
eshop-01…20 (e-shop), bakery-01/02, sweet-01, florist-01,
catering-01 (poptávka), photo-01 (session=service?), restaurant vs cafe už výše
→ e-shopy widget nedostanou. photo-01/catering-01 k rozhodnutí (service vs poptávka).

---

## 4. Pořadí realizace (návrh)

1. **Fáze 1 — `service` mód, 33 šablon** (backend hotový)
   Bespoke designy + zapojení sekce. Rychlá viditelná hodnota. *(rozpracováno)*
2. **Fáze 2 — `meeting` mód** (preset service, ~18–38 šablon)
   Zjednodušený tok (bez ceny/personálu, volitelně online). Malá práce navíc.
3. **Fáze 3 — `table` mód** (restaurace/kavárny, 8)
   Nový lehký endpoint + party size. Bespoke gastro designy.
4. **Fáze 4 — `stay` mód** (hotely, 4)
   Nový datový model (jednotky, blokace), kalendář rozsahu, admin pokojů.
5. **Fáze 5 — `event` mód** (akce, 4)
   Nový model událostí + kapacita, admin událostí.

Každá fáze = backend (pokud třeba) → hook flow → bespoke designy → zapojení + validace.

---

## 5. Rozhodnutí (POTVRZENO 2026-07-19)

1. **Řemesla (20)** → `inquiry` (poptávkový formulář), NE slot. ✅
2. **photo-01, catering-01, video-01** → `inquiry` (poptávka). ✅
3. **reality (6)** → `meeting` (prohlídka = slot poskytovatele). ✅
4. **Design** → **per-šablona i u ostatních módů** (ne 1 na mód). Každá booking
   šablona dostane vlastní bespoke design. ✅
5. **Prod**: marketing web `rezora.cz`, **aplikace + API `app.rezora.cz`**.
   → `DEFAULT_API = https://app.rezora.cz`, CSP connect-src rozšířeno. ✅

### Nový mód: `inquiry` (poptávka)
Bez kalendáře/slotů — jméno, kontakt, popis zakázky/požadavku → odešle
poskytovateli e-mailem. Reuse `POST /api/bookings` s příznakem `inquiry`
NEBO nový `POST /api/inquiries`. Datový model:
```
rez_inquiries (id, provider_id, client_name, client_email, client_phone,
               subject, message, created_at, status)
```

### Aktualizované počty módů
- `service` 33 · `meeting` ~12 (reality 6, lawyer 2, ucetni 4… viz mapa) ·
  `inquiry` ~23 (řemesla 20 + photo/catering/video) · `table` 8 ·
  `stay` 4 · `event` 3 (events, artist, dj) · `none` ~27
