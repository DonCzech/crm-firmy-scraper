# Co získat pro spuštění exportů na portály

Aktualizováno: 16. 7. 2026

Tento dokument je pracovní checklist pro zprovoznění konektorů, které jsou
už implementované v CRM Český Partner Reality.

Přístupová hesla a tajné klíče se nesmí zapisovat do tohoto dokumentu ani
posílat do běžného chatu. Po získání se uloží jako šifrované proměnné
produkčního prostředí ve Vercelu.

## Co připravit před kontaktováním portálů

Portály obvykle budou požadovat:

- úplný název realitní kanceláře;
- IČO a případně DIČ;
- adresu sídla;
- web realitní kanceláře;
- jméno, telefon a e-mail kontaktní osoby;
- přibližný počet aktivních nabídek;
- počet makléřů;
- název používaného programu: `Český Partner Reality – vlastní CRM`;
- produkční URL CRM: `https://ceskypartner-reality.vercel.app`;
- požadavek na testovací i produkční účet;
- informaci, zda portál omezuje přístup podle IP adres.

### Důležité upozornění k IP adresám

Vercel ve standardním serverless provozu negarantuje jednu stálou odchozí IP
adresu. Pokud portál vyžaduje IP allowlist, je nutné si od něj nejprve nechat
potvrdit přesné požadavky. Následně se případně doplní statická odchozí brána.

## Doporučené pořadí

1. B3 Technology / VideoBydlení
2. Realingo
3. SuperHome
4. JenReality
5. Black Reality
6. ČeskéReality
7. RealityMIX
8. Reality.cz
9. Sreality
10. Reality iDNES
11. PražskéReality
12. PragueRealEstate
13. Eurobydlení
14. Byty.cz
15. Lovec-Realit

První čtyři portály mají veřejné rozhraní a jejich aktivace by měla být
nejrychlejší.

---

## B3 Technology / VideoBydlení

Stav: konektor je hotový. Veřejný XML-RPC server
`https://www.videobydleni.cz/import/` odpovídá a hlásí verzi 2.1.29.

Jedno připojení distribuuje nabídky současně na:

- VideoBydlení.cz;
- BydlisNami.cz;
- RealityPro.eu;
- RealityMat.cz;
- Vitio.cz;
- Origo-Reality.cz.

Koho kontaktovat:

- vedoucí obchodní manažerka: Alexandra Ferencová;
- e-mail: `alexandra.ferencova@b3technology.cz`;
- telefon: `+420 736 175 061`;
- registrace RK: https://admin.b3technology.cz/
- informace: https://www.b3technology.cz/

Co vyžádat:

- aktivaci účtu realitní kanceláře;
- číselné client ID pro XML-RPC import;
- importní heslo;
- softwarový klíč pro `Český Partner Reality`;
- testovací účet;
- potvrzení podmínek inzerce na celé šestici portálů.

Proměnné:

```text
B3_TECHNOLOGY_CLIENT_ID
B3_TECHNOLOGY_IMPORT_PASSWORD
B3_TECHNOLOGY_SOFTWARE_KEY
```

---

## 1. Realingo

Stav: konektor je hotový, importní XML-RPC server je dostupný.

Koho kontaktovat:

- e-mail: `info@realingo.cz`
- importní informace: https://www.realingo.cz/import

Co udělat:

1. Založit firemní účet Realingo.
2. Požádat o bezplatnou aktivaci importního můstku pro vlastní CRM.
3. Po aktivaci vyzvednout přístupové údaje v úvodní stránce firemního účtu.

Co vyžádat:

- číselné `client ID`;
- importní heslo;
- softwarový klíč pro Český Partner Reality;
- potvrzení produkčního endpointu;
- případně testovací účet.

Proměnné:

```text
REALINGO_CLIENT_ID
REALINGO_IMPORT_PASSWORD
REALINGO_SOFTWARE_KEY
```

Výchozí endpoint je již nastaven na `https://import.realingo.cz/`.

---

## 2. SuperHome

Stav: konektor pro Import API 2.6 je hotový, API je dostupné.

Koho kontaktovat:

- e-mail: `info@superhome.cz`
- kontaktní formulář: https://superhome.cz/contacts/
- integrace: https://superhome.cz/napojeni-realitniho-softwaru/
- dokumentace: https://superhome.cz/import-documentation/

Co vyžádat:

- `ClientId` pro vlastní exportní software;
- `ClientSecret`;
- `AgencyMappingId` realitní kanceláře;
- aktivaci profilu RK;
- potvrzení, že je povolen přímý Import API 2.6 export z vlastního CRM;
- testovací účet, pokud ho poskytují.

Proměnné:

```text
SUPERHOME_CLIENT_ID
SUPERHOME_CLIENT_SECRET
SUPERHOME_AGENCY_MAPPING_ID
```

---

## 3. JenReality

Stav: konektor XML-RPC 1.0 je hotový a server odpovídá.

Koho kontaktovat:

- e-mail: `jenreality@milenium.cz`
- registrace RK: https://www.jenreality.cz/registrace-realitni-kancelare/
- dokumentace: https://www.jenreality.cz/import/v1/

Co udělat:

1. Zaregistrovat realitní kancelář.
2. V poli realitní software zvolit `jiný realitní software`.
3. Autorizovat registrační e-mail včas.
4. Napsat, že se používá vlastní CRM Český Partner Reality.

Co vyžádat:

- číselné ID klienta;
- heslo pro XML-RPC import;
- softwarový klíč;
- aktivaci exportu pro účet RK;
- případně testovací účet.

Proměnné:

```text
JENREALITY_CLIENT_ID
JENREALITY_IMPORT_PASSWORD
JENREALITY_SOFTWARE_KEY
```

---

## 4. Black Reality

Stav: konektor XML-RPC 1.0 je hotový a server odpovídá.

Koho kontaktovat:

- kontaktní formulář: https://www.black-reality.cz/napiste-nam/
- veřejný importní endpoint: https://www.black-reality.cz/import/v1/

Do formuláře uvést, že nejde o Poski, Urbium ani Realman, ale o vlastní CRM.

Co vyžádat:

- aktivaci importu pro realitní kancelář;
- číselné ID klienta;
- importní heslo;
- softwarový klíč pro vlastní CRM;
- potvrzení, že lze použít veřejný endpoint XML-RPC 1.0;
- testovací účet nebo bezpečný postup prvního testu.

Proměnné:

```text
BLACK_REALITY_CLIENT_ID
BLACK_REALITY_IMPORT_PASSWORD
BLACK_REALITY_SOFTWARE_KEY
```

---

## 5. ČeskéReality

Stav: konektor pro importní rozhraní 3.0 je hotový.

Koho kontaktovat:

- technická podpora: `podpora@ceskereality.cz`
- specifikace: https://import.ceskereality.cz/
- nabídka pro RK: https://proc.ceskereality.cz/inzerce_pro_rk.php

Co vyžádat jako provozovatel vlastního exportního programu:

- `CLIENT_ID`;
- `CLIENT_SECRET`;
- testovací účet;
- doporučené nastavení povolených IP adres;
- registraci názvu exportního programu Český Partner Reality.

Co musí získat nebo aktivovat realitní kancelář:

- aktivní placenou nebo sjednanou inzerci;
- `id_firmy`, případně možnost jeho načtení přes API;
- `pin_exportu`;
- povolení exportu přes nový program v servisní sekci RK.

Proměnné:

```text
CESKEREALITY_CLIENT_ID
CESKEREALITY_CLIENT_SECRET
CESKEREALITY_COMPANY_ID
CESKEREALITY_EXPORT_PIN
```

Stačí `COMPANY_ID` nebo `EXPORT_PIN`, ale je vhodné bezpečně uložit oba údaje,
pokud je portál vydá.

---

## 6. RealityMIX

Stav: konektor pro veřejné XML-RPC rozhraní je hotový.

Koho kontaktovat:

- klientský servis: `info@realitymix.cz`
- telefon: `+420 226 886 247`
- dokumentace: https://realitymix.cz/import/documentation/xml-rpc/
- kontakty: https://realitymix.cz/o-nas.php

Co vyžádat:

- testovací klientské ID;
- testovací heslo;
- testovací softwarový klíč;
- po dokončení testů produkční softwarový klíč pro Český Partner Reality;
- produkční ID a heslo realitní kanceláře;
- aktivaci smlouvy o inzerci;
- informaci, zda je pro dotazy zájemců nutná registrace IP adres a dohoda o
  zpracování osobních údajů.

Proměnné:

```text
REALITYMIX_CLIENT_ID
REALITYMIX_PASSWORD
REALITYMIX_SOFTWARE_KEY
```

---

## 7. Reality.cz

Stav: SOAP konektor pro rozhraní 1.5 je hotový.

Koho kontaktovat:

- e-mail: `info@reality.cz`
- kontakt a podpora: https://www.reality.cz/info/kontakty/
- registrace profesionální inzerce: https://www.reality.cz/info/inzerce/zajem/
- specifikace SOAP: https://www.reality.cz/soubory/exportni-komunikacni-rozhrani.pdf

Co vyžádat:

- uživatelské jméno pro SOAP export;
- heslo;
- TOTP secret pro generování jednorázových kódů;
- přidělený název/program exportního softwaru;
- povolenou verzi programu;
- tříznakový licenční kód;
- testovací přístupy;
- aktivaci profesionální inzerce RK.

Proměnné:

```text
REALITY_CZ_USERNAME
REALITY_CZ_PASSWORD
REALITY_CZ_TOTP_SECRET
REALITY_CZ_PROGRAM
REALITY_CZ_PROGRAM_VERSION
REALITY_CZ_LICENSE
```

---

## 8. Sreality

Stav: konektor XML-RPC 4 je hotový a server odpovídá.

Koho kontaktovat:

- e-mail: `info@sreality.cz`
- kontakty: https://www.seznam.cz/reklama/cz/obsahovy-web/kontakty/sreality
- informace k importu:
  https://o-seznam.cz/napoveda/sreality/pro-realitni-kancelare/importni-rozhrani/

Co vyžádat:

- aktivaci profesionálního účtu RK a inzerce;
- číselné ID klienta pro import;
- importní heslo;
- unikátní softwarový klíč pro Český Partner Reality;
- přístup k aktuální PDF dokumentaci v Administraci Sreality;
- testovací účet nebo schválený způsob testování;
- ověření e-mailových účtů všech exportovaných makléřů;
- informace o kreditu a podmínkách zveřejnění.

Proměnné:

```text
SREALITY_CLIENT_ID
SREALITY_IMPORT_PASSWORD
SREALITY_SOFTWARE_KEY
```

---

## 9. Reality iDNES

Stav: konektor pro Import API v2 a FTP fotografie je hotový.

Koho kontaktovat:

- obchodní oddělení: `reality-obchod@idnes.cz`
- zákaznický servis: `reality@reality.idnes.cz`
- telefon zákaznického servisu: `+420 910 925 204`
- kontakty: https://reality.idnes.cz/kontakty

Co vyžádat:

- smlouvu a aktivaci inzerce RK;
- login a heslo pro HTTP import API v2;
- adresu produkčního a testovacího API;
- FTP host;
- FTP uživatele;
- FTP heslo;
- FTP port a režim zabezpečení;
- seznam povolených zdrojových IP adres;
- testovací účet;
- potvrzení, zda je před produkčním spuštěním vyžadována stálá odchozí IP.

Proměnné:

```text
REALITY_IDNES_LOGIN
REALITY_IDNES_PASSWORD
REALITY_IDNES_FTP_HOST
REALITY_IDNES_FTP_USER
REALITY_IDNES_FTP_PASSWORD
REALITY_IDNES_FTP_PORT
REALITY_IDNES_FTP_SECURE
REALITY_IDNES_BASE_URL
REALITY_IDNES_TEST_MODE
REALITY_IDNES_STATIC_EGRESS_CONFIRMED
```

Hodnota `REALITY_IDNES_STATIC_EGRESS_CONFIRMED=true` se smí nastavit až po
skutečném technickém vyřešení a potvrzení produkční odchozí IP.

---

## 10. Eurobydlení

Stav: adaptér je hotový, ale portál musí dodat bezpečný aktuální endpoint.

Koho kontaktovat:

- e-mail: `info@eurobydleni.cz`
- telefon: `+420 603 747 634`
- informace pro RK: https://www.eurobydleni.cz/inzerce/
- ceník: https://www.eurobydleni.cz/cenik/

Co vyžádat:

- registraci a aktivaci inzerce RK;
- přesnou aktuální HTTPS adresu importního XML-RPC rozhraní;
- potvrzení verze kompatibility se Sreality;
- číselné ID klienta;
- importní heslo;
- softwarový klíč pro vlastní CRM;
- testovací účet;
- potvrzení platného TLS certifikátu na importním endpointu.

Proměnné:

```text
EUROBYDLENI_RPC_URL
EUROBYDLENI_CLIENT_ID
EUROBYDLENI_IMPORT_PASSWORD
EUROBYDLENI_SOFTWARE_KEY
```

Nepoužívat endpoint s neplatným nebo self-signed certifikátem.

---

## 11. Byty.cz

Stav: adaptér je hotový, ale chybí partnerský endpoint a přístupy.

Koho kontaktovat:

- podpora pro realitky: Mgr. Gabriela Poltoráková
- e-mail: `obchod@byty.cz`
- telefon: `+420 777 227 454`
- informace a registrace: https://www.byty.cz/pro-realitky.aspx

Co vyžádat:

- registraci partnera Byty.cz;
- přesný aktuální HTTPS importní endpoint;
- podporovanou verzi rozhraní Sreality;
- číselné ID klienta;
- importní heslo;
- softwarový klíč;
- testovací účet;
- potvrzení, že certifikát endpointu platí také pro importní doménu.

Proměnné:

```text
BYTY_CZ_RPC_URL
BYTY_CZ_CLIENT_ID
BYTY_CZ_IMPORT_PASSWORD
BYTY_CZ_SOFTWARE_KEY
```

---

## 12. Lovec-Realit

Stav: adaptér je hotový. Portál oficiálně uvádí XML-RPC kompatibilní se
Sreality, ale DNS importního serveru je nyní nedostupné.

Koho kontaktovat:

- e-mail: `info@lovec-realit.cz`
- informace k exportu: https://lovec-realit.cz/export-nabidek
- kontakt: https://lovec-realit.cz/kontakt

Co vyžádat:

- aktivaci exportu pro vlastní CRM;
- číselné client ID;
- importní heslo;
- softwarový klíč;
- testovací účet;
- potvrzení nebo opravu DNS pro `import.lovec-realit.cz`;
- potvrzení aktuálního endpointu `/RPC2`.

Proměnné:

```text
LOVEC_REALIT_CLIENT_ID
LOVEC_REALIT_IMPORT_PASSWORD
LOVEC_REALIT_SOFTWARE_KEY
```

---

## PražskéReality

Stav: konektor pro veřejné XML-RPC rozhraní je hotový. Produkční HTTPS
endpoint odpovídá a hlásí verzi 2.1.28.

Koho kontaktovat:

- e-mail: `info@prazskereality.cz`;
- portál: https://www.prazskereality.cz/
- dokumentace:
  https://www.praguerealestate.cz/cms/real-property-import/documents/dokumentace_importy.pdf

Co vyžádat:

- měsíční testovací účet pro vývoj exportního programu;
- produkční client ID;
- importní heslo;
- softwarový klíč;
- aktivaci inzerce realitní kanceláře.

Proměnné:

```text
PRAZSKEREALITY_CLIENT_ID
PRAZSKEREALITY_IMPORT_PASSWORD
PRAZSKEREALITY_SOFTWARE_KEY
```

Výchozí endpoint je `https://www.prazskereality.cz/RPC2`.

---

## PragueRealEstate

Stav: konektor pro anglickou mutaci je hotový. Server používá stejné
zdokumentované XML-RPC schéma jako PražskéReality.

Co vyžádat:

- potvrzení, zda lze použít stejné přístupy jako pro PražskéReality;
- případně samostatné client ID, importní heslo a softwarový klíč;
- podmínky zveřejnění nabídek bez samostatného anglického popisu.

Proměnné:

```text
PRAGUE_REAL_ESTATE_CLIENT_ID
PRAGUE_REAL_ESTATE_IMPORT_PASSWORD
PRAGUE_REAL_ESTATE_SOFTWARE_KEY
```

Výchozí endpoint je `https://www.praguerealestate.cz/RPC2`.

---

## Portály pro druhou vlnu

U těchto portálů zatím není implementace možná bez neveřejné dokumentace.
Je potřeba nejdříve požádat jejich obchodní nebo technické oddělení o přímé
napojení vlastního CRM.

| Portál | Koho oslovit | Co žádat |
| --- | --- | --- |
| Bezrealitky | https://www.bezrealitky.cz/centrum-sluzeb/pro-developery | Partnerské API, technickou specifikaci, testovací a produkční klíče |
| UlovDomov | https://www.ulovdomov.cz/pro-realitni-kancelare/cenik | Dokumentaci importního můstku pro vlastní CRM a přístupy |
| Igluu | https://www.igluu.cz/software | Partnerskou integraci externího CRM, dokumentaci a testovací prostředí |
| RealHit | kontaktní/obchodní oddělení portálu RealHit | Přímý importní protokol místo napojení přes existující exportní software |
| DomyBytyPozemky | `info@dbp.cz`, `+420 733 530 920` | Specifikaci chráněného importu, endpoint, formát, testovací účet a přístupy; jeden export pokrývá 42 regionálních domén |
| ViaReality | registrace RK na https://www.viareality.cz/ | Technickou dokumentaci exportu a produkční přístupy |
| RealCity | obchodní oddělení https://www.realcity.cz/ | Dokumentaci přímého importu pro vlastní software |
| Realitní ESO | kontaktní oddělení https://www.realitnieso.cz/ | Specifikaci importu z databáze třetí osoby a testovací účet |

Dokud portál nevydá ověřitelnou specifikaci, nebude se konektor vytvářet
scrapingem ani odhadem.

## Portály, u kterých nemá smysl nyní žádat běžné API

- Bezrealitky – běžnou inzerci realitních makléřů smluvně omezuje; zejména
  export pronájmů není vhodný cíl pro CRM realitní kanceláře.
- Bazoš Reality – nemá veřejné hromadné publikační API pro RK.
- Facebook Marketplace – vyžaduje schválený partnerský přístup Meta.
- Valuo – datový a oceňovací nástroj, nikoli klasický otevřený inzertní portál.
- MECH – současný web je realitní kancelář, nikoli otevřený inzertní portál.
- ARK ČR – asociace, nikoli běžný inzertní portál.
- Realitní komora – oborový subjekt, nikoli ověřené importní API.

## Univerzální text žádosti

Předmět:

```text
Žádost o aktivaci exportu z vlastního CRM – Český Partner Reality
```

Text:

```text
Dobrý den,

jsme realitní kancelář [NÁZEV RK], IČO [IČO], a používáme vlastní CRM
Český Partner Reality.

Máme připravený přímý konektor pro vaše importní rozhraní a žádáme o:

- aktivaci exportu pro naši realitní kancelář,
- testovací a následně produkční přístupové údaje,
- aktuální technickou dokumentaci a přesný HTTPS endpoint,
- přidělení softwarového klíče / Client ID pro vlastní CRM,
- informaci, zda omezujete přístup podle zdrojové IP adresy,
- informaci o požadované smlouvě, ceně, kreditu a schvalovacím procesu.

Předpokládaný počet aktivních nabídek: [POČET].
Počet makléřů: [POČET].
Web RK: [WEB].
Produkční aplikace: https://ceskypartner-reality.vercel.app

Prosíme také o testovací účet nebo doporučený bezpečný postup prvního
end-to-end testu bez veřejného zveřejnění.

Děkuji
[JMÉNO]
[TELEFON]
[E-MAIL]
```

## Co udělat po obdržení údajů

1. Nevkládat tajné hodnoty do Git repozitáře.
2. Přidat je do Vercel Project Settings → Environment Variables → Production.
3. Nasadit novou produkční verzi.
4. V administraci otevřít Exporty a spustit kontrolu spojení.
5. Použít jednu kompletní testovací nemovitost.
6. Odeslat nabídku na jeden portál.
7. Ověřit externí ID, veřejnou URL a vzdálený stav.
8. Teprve poté povolit hromadnou nebo automatickou synchronizaci.

## Minimální testovací nemovitost

Pro hladký test má nabídka obsahovat:

- stav Aktivní;
- přiřazeného makléře s unikátním e-mailem a telefonem;
- úplný popis;
- cenu;
- obec, kraj, okres, PSČ a pokud možno přesnou adresu;
- GPS a RÚIAN kód, pokud jsou dostupné;
- užitnou plochu;
- plochu pozemku u domu a pozemku;
- dispozici a patro u bytu;
- konstrukci, stav, vlastnictví a vybavení;
- PENB;
- nejméně 3 kvalitní fotografie bez reklamních rámečků;
- platné veřejné HTTPS URL fotografií.
