# Venom PageSpeed audit

Automatizace měří všechny veřejné šablony přes Google PageSpeed Insights API v
malých, obnovitelných dávkách. Stav fronty a normalizované výsledky jsou v
PostgreSQL; plné odpovědi Google se ukládají jako komprimované GitHub Actions
artefakty na 90 dní.

## Provoz

- Workflow: `.github/workflows/venom-pagespeed-audit.yml` v kořeni monorepa.
- Plán: čtyřikrát denně, vždy nejvýše 8 PSI měření.
- Pořadí: nejdřív mobil pro všechny šablony, následně desktop.
- Nový úplný cyklus: nejdříve 30 dní po dokončení předchozího.
- Chyby `429` a dočasné chyby Google se opakují s exponenciální prodlevou.
- Po čtyřech neúspěšných bězích se cíl označí jako neúspěšný, aby nezablokoval
  dokončení celé série.
- Při dokončení workflow vytvoří nebo aktualizuje GitHub issue se souhrnem,
  společnými vzorci a doporučeným postupem opravy.

Jedna dávka o velikosti 8 znamená osm kombinací URL + strategie, nikoliv osm
šablon v obou režimech. Plný cyklus 120 šablon proto obsahuje přibližně 240
měření a při čtyřech dávkách denně se dokončí přibližně za osm dní.

## Požadované GitHub Actions secrets

- `GOOGLE_PSI_KEY`
- `VENOM_DATABASE_URL` (preferováno) nebo `DATABASE_URL`

Workflow nikdy nevypisuje hodnoty těchto secrets. `GITHUB_TOKEN` poskytuje
GitHub automaticky a používá se pouze k vytvoření výsledného issue.

## Příkazy

```bash
# Bez DB: spočítá veřejné manifesty v repozitáři
node scripts/pagespeed-audit.mjs manifest

# S DATABASE_URL: ukáže přesné mapování template key → produkční demo URL
node scripts/pagespeed-audit.mjs manifest

# Zpracuje dalších osm cílů
node scripts/pagespeed-audit.mjs batch --limit=8

# Stav posledního cyklu jako JSON
node scripts/pagespeed-audit.mjs status

# Vygeneruje Markdown a JSON report do artifacts/pagespeed/
node scripts/pagespeed-audit.mjs report
```

Při lokálním spuštění skript bezpečně načte existující `.env.local` (bez jeho
vypisování). Alternativně je možné předat `DATABASE_URL` a pro skutečné měření
také `GOOGLE_PSI_KEY` přes prostředí. Volitelně lze nastavit:

- `PAGESPEED_BASE_URL` (výchozí `https://webero.co`)
- `PAGESPEED_BATCH_LIMIT` (výchozí `8`, maximum `25`)
- `PAGESPEED_MIN_CYCLE_DAYS` (výchozí `30`)
- `PAGESPEED_MAX_TARGET_ATTEMPTS` (výchozí `4`)
- `PAGESPEED_REQUEST_DELAY_MS` (výchozí `2500`)

## Jak se hledají společné chyby

Každý neúspěšný Lighthouse audit se ukládá pod stabilním audit ID. Report je
seskupí podle režimu a ID, spočítá počet zasažených šablon, typickou časovou
úsporu a stejné zdroje opakované ve více šablonách. Díky tomu je například
vidět, zda problém pochází ze společného Next.js bundlu, hero rendereru,
fontů nebo z opakovaného způsobu přípravy obrázků.

Opravy se záměrně nenasazují automaticky. Bezpečný následný postup je oprava
jedné reprezentativní šablony v samostatném worktree, vizuální kontrola a
opakovaný PSI test; až potom hromadná aplikace na celou skupinu.
