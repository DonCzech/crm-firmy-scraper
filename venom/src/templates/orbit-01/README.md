# ORBIT — SaaS / AI Product (orbit-01)

Fable Premium V3, šablona 3/10. Archetyp SaaS/AI produkt — cíl: trial / rezervace dema.

- **Vizuální systém**: „Precision instrument" — ink `#0A0F16`, emerald `#047857` (na tmavé zesvětlený přes color-mix), ledová šedá `#F2F5F3`, Overpass 800 nadpisy, Source Sans body, mono akcenty. Technická mřížka místo hero fotky; CSS produkt vizuály místo ikonek ve čtverečcích.
- **Signature interakce**: hero glass „produktové okno" — taby Přehled / Automatizace / Reporty živě přepínají mockup (metrika, hairline řádky, bar chart) bez videa.
- **Stránky**: home, produkt, cenik, zakaznici (+ CMS detail `zakaznici/[itemSlug]`), kontakt. Skeleton `professional`.
- **Mood presety**: Pulse (emerald, default) / Circuit (cyan) / Flare (oranžová).
- **Demo tenant**: `orbit-01-v2` → `http://localhost:3015/demo/orbit-01-v2`
- **Rebuild**: `python3 scripts/orbit-rebuild.py` (ochrana proti paralelním sessions)
- **QA**: `node scripts/orbit01-qa.mjs`
