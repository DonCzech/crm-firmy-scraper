# Exporty na realitní portály

Administrace neposuzuje úspěch podle lokálního uložení. Konektor po odeslání
načte nabídku zpět z portálu a ukládá externí ID, URL, vzdálený stav a čas
ověření.

Praktický seznam kontaktů, údajů k vyžádání a názvů produkčních proměnných je
v dokumentu [Co získat pro spuštění exportů](./co-ziskat-pro-exporty.md).

## Implementované konektory

| Portál | Protokol | Veřejný server |
| --- | --- | --- |
| B3 Technology / VideoBydlení | XML-RPC 2.1.29 | funkční; distribuce na 6 portálů |
| Sreality | XML-RPC 4 | funkční |
| ČeskéReality | tokenové HTTP API | funkční |
| Reality iDNES | HTTP XML + FTP | funkční testovací API |
| Reality.cz | SOAP | funkční |
| RealityMIX | HTTP API | funkční |
| Realingo | Sreality XML-RPC 4 | funkční |
| SuperHome | Import API 2.6 | funkční |
| JenReality | XML-RPC 1 | funkční |
| Black Reality | XML-RPC 1 | funkční |
| Eurobydlení | Sreality kompatibilní | portál musí dodat bezpečný endpoint |
| Byty.cz | Sreality kompatibilní | portál musí dodat partnerský endpoint |
| Lovec-Realit | Sreality kompatibilní | oficiální importní DNS je nedostupné |
| PražskéReality | XML-RPC 2.1.28 | funkční |
| PragueRealEstate | XML-RPC 2.1.x | funkční |

Konektor je provozně aktivní až po vložení přístupových údajů do prostředí
nasazení. Seznam nových proměnných je v `.env.example`.

## Zásady

- Neobchází se neplatné TLS certifikáty.
- Portály bez veřejné specifikace se neimplementují odhadem ani scrapingem.
- Stav `SYNCED` vznikne až po následném načtení nabídky z cílového portálu.
- Chyba portálu, chybějící kredit nebo čekání na schválení se ukládají jako
  vzdálený stav, nikoli jako falešné zveřejnění.

## Co se nepočítá jako samostatný konektor

- B3 Technology je jeden konektor, který zveřejňuje na šesti portálech.
- ČeskéReality a RealityMIX dále distribuují nabídky uvnitř vlastních sítí.
- DomyBytyPozemky uvádí 42 regionálních domén, ale poskytuje technické údaje
  až smluvním partnerům.
- Valuo, MECH Reality, ARK ČR a Realitní komora nejsou běžné otevřené
  inzertní portály.
- Facebook export znamená publikaci na firemní stránku, nikoli veřejné API
  Facebook Marketplace.
