#!/usr/bin/env python3
"""malir-02 V3 — cs.json (DEMO data místo reálné firmy, multipage routy, nové fotky)
+ template.json/theme.json (v3, ultramarine paleta, presety). Idempotentní.

POZOR: původní obsah nesl REÁLNOU firmu (Malířství Novák, 603 251 874,
info@malirstvi-novak.cz, Vídeňská 55 Brno) — to je podle REMASTER_PLAYBOOK a
feedback_venom_demo_data_enforcement blokující vada. Vše nahrazeno demo údaji.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / "src/templates/malir-02"
U = "https://images.unsplash.com/photo-"
img = lambda pid, w, h: "%s%s?w=%d&h=%d&fit=crop&auto=format&q=80" % (U, pid, w, h)

# vizuálně ověřeno montage gridem 2026-07-22
P_ROLLER = "1562259949-e8e7689d7828"   # váleček nanáší modrou barvu
P_PAINTER = "1558618666-fcd25c85cd64"  # malíř s válečkem při práci
P_TEAL = "1615873968403-89e068629265"  # tmavě zelená akcentní stěna s obrazy
P_BEDROOM = "1618221118493-9cfa1a1c00da"  # ložnice s modrošedou stěnou
P_LIVING = "1616486338812-3dadae4b4ace"   # světlý obývák s galerií obrazů
P_WARM = "1631679706909-1844bbd07221"     # světlý obývák, teplé tóny
P_MINIMAL = "1585128792020-803d29415281"  # minimalistický interiér
P_HALL = "1581858726788-75bc0f6a952d"     # bílá chodba po výmalbě
P_BATH = "1604709177225-055f99402ea3"     # šedá koupelna
P_SOFA = "1493809842364-78817add7ffb"     # obývák s modrou pohovkou
P_FACADE = "1512917774080-9991f1c4c750"   # bílá fasáda moderního domu
P_ORANGE = "1567016432779-094069958ea5"   # oranžová pohovka u zelené stěny

LINKS = [
    {"label": "Úvod", "href": "/"},
    {"label": "Služby", "href": "/sluzby"},
    {"label": "Galerie", "href": "/galerie"},
    {"label": "Ceník", "href": "/cenik"},
    {"label": "Reference", "href": "/reference"},
    {"label": "Kontakty", "href": "/kontakty"},
]

d = {
    "navbar": {"siteName": "Malířství Demo", "logoUrl": "/templates/malir-02/logo.svg",
               "phone": "704 123 456", "links": LINKS},
    "hero": {"slides": [
        {"image": img(P_ROLLER, 1920, 1100),
         "heading": "Profesionální malba s precizností a respektem k vašemu domovu.",
         "subheading": "Interiéry, fasády i lakýrnické práce po celé Praze a Středočeském kraji. Přijedeme, naceníme a vymalujeme do posledního detailu.",
         "ctaLabel": "Poptat zdarma", "ctaHref": "/kontakty"},
        {"image": img(P_TEAL, 1920, 1100),
         "heading": "Akcentní stěna, která drží barvu i po letech.",
         "subheading": "Poradíme s odstínem, připravíme podklad a natáhneme barvu tak, aby nikde neprosvítal starý nátěr.",
         "ctaLabel": "Chci nabídku", "ctaHref": "/kontakty"},
    ]},
    "about": {"items": [
        {"icon": "target", "label": "Pečlivost"},
        {"icon": "person", "label": "Profesionalita"},
        {"icon": "broom", "label": "Čistota"},
        {"icon": "clock", "label": "Dochvilnost"},
        {"icon": "handshake", "label": "Férová cena"},
    ]},
    "services": {"items": [
        {"image": img(P_BEDROOM, 900, 700), "title": "Malování interiérů",
         "description": "Vymalujeme každý pokoj přesně tak, jak si přejete. Ochrana nábytku a úklid po práci jsou samozřejmost."},
        {"image": img(P_FACADE, 900, 700), "title": "Fasády a vnější plochy",
         "description": "Očistíme, penetrujeme a natřeme fasádu tak, aby vydržela počasí i po deseti letech."},
        {"image": img(P_HALL, 900, 700), "title": "Komerční prostory",
         "description": "Kanceláře, prodejny, zdravotnická zařízení, školní třídy. Pracujeme rychle, abychom neomezili váš provoz."},
        {"image": img(P_BATH, 900, 700), "title": "Lakýrnické práce",
         "description": "Natíráme okna, dveře, radiátory, obklady i zárubně. Vždy s broušením a krycím nátěrem."},
    ]},
    "promo": {"tagline": "Zdarma.", "heading": "Prohlídka a nacenění bez závazků.",
              "subheading": "Zavolejte nebo napište — přijedeme se podívat a připravíme nabídku do 48 hodin.",
              "ctaLabel": "Kontaktovat nyní", "ctaHref": "/kontakty"},
    "gallery": {
        "heading": "Ukázky naší práce",
        "filters": ["Vybrané", "Byty a domy", "Nebytové prostory", "Lakýrnické práce"],
        "images": [
            {"url": img(P_TEAL, 1000, 750), "title": "Akcentní stěna v obývacím pokoji", "category": "Byty a domy", "featured": True},
            {"url": img(P_BEDROOM, 1000, 750), "title": "Ložnice v tlumené modré", "category": "Byty a domy", "featured": True},
            {"url": img(P_LIVING, 1000, 750), "title": "Kompletní výmalba bytu 3+kk", "category": "Byty a domy", "featured": True},
            {"url": img(P_WARM, 1000, 750), "title": "Světlý obývací pokoj po renovaci", "category": "Byty a domy", "featured": False},
            {"url": img(P_MINIMAL, 1000, 750), "title": "Minimalistický interiér", "category": "Byty a domy", "featured": False},
            {"url": img(P_HALL, 1000, 750), "title": "Chodby a společné prostory", "category": "Nebytové prostory", "featured": True},
            {"url": img(P_BATH, 1000, 750), "title": "Koupelna — nátěr obkladů a zárubní", "category": "Lakýrnické práce", "featured": False},
            {"url": img(P_FACADE, 1000, 750), "title": "Fasáda rodinného domu", "category": "Nebytové prostory", "featured": False},
            {"url": img(P_ORANGE, 1000, 750), "title": "Barevný akcent v kanceláři", "category": "Nebytové prostory", "featured": False},
        ],
    },
    "pricing": {
        "heading": "Kolik výmalba stojí?",
        "subheading": "Cena závisí na stavu povrchů, použitých materiálech a rozsahu prací. Orientační přehled najdete níže — přesnou nabídku zpracujeme zdarma po prohlídce.",
        "ctaLabel": "Chci nabídku zdarma", "ctaHref": "/kontakty",
        "pricingImg1": img(P_ROLLER, 800, 600), "pricingImg2": img(P_PAINTER, 800, 600),
        "barTitle": "Nezávazná cenová nabídka",
        "barSub": "Přijedeme se podívat a vypracujeme nabídku zdarma, bez jakýchkoliv závazků.",
        "barLabel": "Kontaktovat nás",
        "items": [
            {"name": "Byt 1+1 nebo 2+kk", "price": "5 500 – 8 000 Kč"},
            {"name": "Byt 2+1 nebo 3+kk", "price": "7 500 – 13 000 Kč"},
            {"name": "Byt 3+1 a větší", "price": "od 12 000 Kč"},
            {"name": "Lakování oken, dveří a zárubní", "price": "od 250 Kč / m²"},
            {"name": "Nátěr okapů, parapetů a zábradlí", "price": "130 Kč / bm"},
        ],
    },
    "testimonials": {
        "heading": "Spokojení zákazníci mluví za nás", "kicker": "Reference",
        "items": [
            {"name": "Petra H.", "role": "Majitelka bytu, Praha 4",
             "review": "Přišli v dohodnutý čas, vše pečlivě zakryli a po výmalbě uklidili dočista. Barvy přesně podle mého výběru, žádné přesahy. Jednoznačně doporučuji a určitě se ozvu znovu."},
            {"name": "Martin K.", "role": "Správce budovy, Praha 9",
             "review": "Vymalovali nám chodby v celém domě o víkendu, aby nájemníky nic neomezovalo. Domluva bez problémů a cena seděla na korunu s nabídkou."},
            {"name": "Jana S.", "role": "Majitelka kanceláří, Praha 1",
             "review": "Oceňuji, že nám poradili s odstínem podle světla v místnosti. Výsledek vypadá líp, než jsem si představovala, a termín dodrželi."},
        ],
    },
    "contact": {
        "heading": "Napište nebo zavolejte",
        "subheading": "Ozveme se do 24 hodin a domluvíme nezávaznou prohlídku přímo u vás.",
        "email": "email@demo.cz", "phone": "704 123 456",
        "address": "Ukázková 123, 110 00 Praha 1",
        "hours": "Po–Pá 7:30–17:00, So dle dohody",
    },
    "footer": {
        "siteName": "Malířství Demo", "logoUrl": "/templates/malir-02/logo.svg",
        "copyright": "© 2026 Demo Studio s.r.o. | IČO: 12345678 | DIČ: CZ12345678",
        "tagline": "Profesionální malířské a lakýrnické práce v Praze a okolí. Kvalita, čistota a férová cena.",
        "ctaTitle": "Poptejte nás ještě dnes",
        "ctaSub": "Přijedeme se podívat a nabídneme vám cenu zdarma, bez závazků.",
        "ctaLabel": "Napište nám", "ctaHref": "/kontakty",
        "email": "email@demo.cz", "phone": "704 123 456",
        "address": "Ukázková 123, 110 00 Praha 1",
        "links": LINKS[1:],
    },
    "pages": {
        "sluzby": {"hero": {"title": "Služby", "subtitle": "Interiéry, fasády, komerční prostory a lakýrnické práce.", "backgroundImage": img(P_BEDROOM, 1800, 700)}},
        "galerie": {"hero": {"title": "Galerie", "subtitle": "Ukázky dokončených zakázek z posledních měsíců.", "backgroundImage": img(P_TEAL, 1800, 700)}},
        "cenik": {"hero": {"title": "Ceník", "subtitle": "Orientační ceny. Přesnou nabídku zpracujeme zdarma po prohlídce.", "backgroundImage": img(P_ROLLER, 1800, 700)}},
        "reference": {"hero": {"title": "Reference", "subtitle": "Co o naší práci říkají zákazníci.", "backgroundImage": img(P_WARM, 1800, 700)}},
        "kontakty": {"hero": {"title": "Kontakty", "subtitle": "Ozvěte se — přijedeme se podívat a naceníme zdarma.", "backgroundImage": img(P_HALL, 1800, 700)}},
    },
    "home": {"rezervace": {"title": "Poptejte malíře", "subtitle": "Popište prostory — ozveme se s cenovou nabídkou.", "providerSlug": "", "apiBaseUrl": ""}},
}
(T / "content/cs.json").write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("✓ cs.json — demo data, multipage routy, nové fotky")

# ── manifest ──────────────────────────────────────────────────────────────────
tpl = json.loads((T / "template.json").read_text())
tpl["version"] = "3.0.0"
tpl["tags"] = ["v3"]
tpl["name"] = "Malířství Demo"
tpl["description"] = ("V3 „Ultramarine & Chalk“ — malířské a lakýrnické práce v ultramarínové paletě "
                      "(#2C49D6, chalk #F5F6FA, inkoust #15182B), Sora + Rubik. Cinematic hero se slidery, "
                      "foto karty služeb, filtrovaná galerie realizací, orientační ceník, reference "
                      "s iniciálovými avatary a kontakt s reálným formulářem. Vědomě jiná barva než "
                      "měděná klempir-01.")
nav = {"type": "navbar", "variant": "malir-02-navbar", "contentRef": "navbar"}
foot = {"type": "footer", "variant": "malir-02-footer", "contentRef": "footer"}
ph = lambda s: {"type": "hero", "variant": "hero-malir-02-page", "contentRef": "pages.%s.hero" % s}
tpl["extraSections"] = [
    {"type": "promo", "variant": "malir-02-promo", "reason": "pás „nacenění zdarma“ je hlavní konverzní prvek řemeslné šablony mezi službami a galerií"},
    {"type": "contact", "variant": "malir-02-contact", "reason": "kostra b2b-trade nemá kontaktní sekci s formulářem; malíř ji potřebuje pro poptávky"},
    {"type": "rezora-widget", "reason": "inline poptávkový widget Rezora — nezávazná poptávka přímo na stránce"},
]
tpl["pages"] = [
    {"slug": "home", "isHomepage": True, "title": "Domů", "sections": [
        nav,
        {"type": "hero", "variant": "malir-02-hero", "contentRef": "hero"},
        {"type": "about", "variant": "malir-02-about", "contentRef": "about"},
        {"type": "services", "variant": "malir-02-services", "contentRef": "services"},
        {"type": "promo", "variant": "malir-02-promo", "contentRef": "promo"},
        {"type": "gallery", "variant": "malir-02-gallery", "contentRef": "gallery"},
        {"type": "pricing", "variant": "malir-02-pricing", "contentRef": "pricing"},
        {"type": "testimonials", "variant": "malir-02-testimonials", "contentRef": "testimonials"},
        {"type": "contact", "variant": "malir-02-contact", "contentRef": "contact"},
        {"type": "rezora-widget", "variant": "sharp", "contentRef": "home.rezervace"},
        foot]},
    {"slug": "sluzby", "title": "Služby", "sections": [
        nav, ph("sluzby"), {"type": "services", "variant": "malir-02-services", "contentRef": "services"},
        {"type": "promo", "variant": "malir-02-promo", "contentRef": "promo"}, foot]},
    {"slug": "galerie", "title": "Galerie", "sections": [
        nav, ph("galerie"), {"type": "gallery", "variant": "malir-02-gallery", "contentRef": "gallery"}, foot]},
    {"slug": "cenik", "title": "Ceník", "sections": [
        nav, ph("cenik"), {"type": "pricing", "variant": "malir-02-pricing", "contentRef": "pricing"}, foot]},
    {"slug": "reference", "title": "Reference", "sections": [
        nav, ph("reference"), {"type": "testimonials", "variant": "malir-02-testimonials", "contentRef": "testimonials"}, foot]},
    {"slug": "kontakty", "title": "Kontakty", "sections": [
        nav, ph("kontakty"), {"type": "contact", "variant": "malir-02-contact", "contentRef": "contact"}, foot]},
]
(T / "template.json").write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n")

theme = json.loads((T / "theme.json").read_text())
theme["colors"] = {"primary": "#2C49D6", "secondary": "#15182B", "background": "#F5F6FA",
                   "surface": "#FFFFFF", "text": "#15182B", "textMuted": "#6B7086",
                   "accent": "#1F35A8", "border": "#E1E4EF"}
theme["typography"] = {"fontHeading": "'Sora', sans-serif", "fontBody": "'Rubik', sans-serif", "scale": "comfortable"}
theme["presets"] = {
    "ultramarine": {"label": "Ultramarine — sytá modrá (default)", "tokens": {
        "colorPrimary": "#2C49D6", "colorAccent": "#1F35A8", "colorSecondary": "#15182B",
        "colorBackground": "#F5F6FA", "colorSurface": "#FFFFFF", "colorText": "#15182B",
        "colorTextMuted": "#6B7086", "colorBorder": "#E1E4EF"}},
    "ochre": {"label": "Ochre — zemitá okrová", "tokens": {
        "colorPrimary": "#C08A2E", "colorAccent": "#9A6C1F", "colorSecondary": "#221D14",
        "colorBackground": "#FAF7F1", "colorSurface": "#FFFFFF", "colorText": "#221D14",
        "colorTextMuted": "#736B5C", "colorBorder": "#EBE4D7"}},
    "forest": {"label": "Forest — tlumená zelená", "tokens": {
        "colorPrimary": "#2F6B4F", "colorAccent": "#22513B", "colorSecondary": "#131C17",
        "colorBackground": "#F3F7F4", "colorSurface": "#FFFFFF", "colorText": "#131C17",
        "colorTextMuted": "#65746B", "colorBorder": "#DEE8E1"}},
}
(T / "theme.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
print("✓ template.json (v3, %d stránek) + theme.json (ultramarine + 3 presety)" % len(tpl["pages"]))
