# Bombuj Internal Catalog (Legal Variant)

Interni projekt pro vlastni/licencovane URL.

Co umi:
- vyhledani filmu
- detail filmu
- prehravac + prepinani server odkazu u filmu
- API zabezpecene pristupovym klicem
- RSS a JSON API nad DB
- pravidelny update dat pres GitHub Actions cron (free)

## Datovy model
- `Movie`: nazev + slug + page URL filmu
- `MovieServerLink`: vice server odkazu k jednomu filmu

## Bezpecnost (skryty projekt)
Projekt je nastaveny jako neveřejny prakticky takto:
- API vyzaduje `APP_ACCESS_KEY`
- frontend se bez klice nepripoji k API
- noindex/nofollow pres meta + `X-Robots-Tag`

Pozn: URL je technicky dostupna na internetu, ale bez klice API nefunguje.

## Lokalni setup
1. Vytvor `.env` podle `.env.example`
2. Pridej:
   - `DATABASE_URL=...`
   - `APP_ACCESS_KEY=nejaky_dlouhy_tajny_klic`
3. Instalace:
   - `npm install`
4. Prisma:
   - `npm run db:push`
5. Prvni sync:
   - `npm run sync:full`

## API endpointy
- `GET /api/search?q=matrix&limit=40`
- `GET /api/movie?slug=...`
- `GET /api/movies?limit=50&page=1`
- `GET /api/rss.xml`
- `GET /rss.xml`

Kazdy request musi mit header:
- `x-access-key: <APP_ACCESS_KEY>`

## Frontend
- `GET /`
- vyhledavani + klik na film -> hned prehravac + prepinac serveru

## Vercel deploy
1. Import repo do Vercel.
2. Root Directory nastav na:
   - `filmy/bombuj-rss-project`
3. Environment Variables:
   - `DATABASE_URL`
   - `APP_ACCESS_KEY`
4. Deploy.

## GitHub cron (free)
Workflow:
- `.github/workflows/bombuj-rss-sync.yml`

GitHub Secrets:
- `BOMBUJ_DATABASE_URL`

Cron bezi kazdych 6 hodin.
