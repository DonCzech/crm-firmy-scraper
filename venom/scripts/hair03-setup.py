#!/usr/bin/env python3
"""hair-03 V3 — obsah (cs.json), registrace variant (variants.ts), manifest (template.json
+ theme.json). Idempotentní. Fotky vizuálně ověřené přes montage grid 2026-07-21.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / "src/templates/hair-03"
VAR = ROOT / "src/sections/variants.ts"
U = "https://images.unsplash.com/photo-"


def img(pid, w, h):
    return "%s%s?w=%d&h=%d&fit=crop&auto=format&q=80" % (U, pid, w, h)


P_SHAVE = "1503951914875-452162b0f3f1"      # holení břitvou, tmavé světlo
P_BW_SALON = "1560066984-138dadb4c035"      # černobílý interiér salonu
P_DARK_SALON = "1600948836101-f9ffda59d250"  # salon s černými stěnami
P_CHAIR = "1512690459411-b9245aed614b"      # vintage barbers křeslo
P_BARBER_MASK = "1605497788044-5a32c7078486"  # pánský střih
P_CUT_CURLY = "1567894340315-735d7c361db0"  # střih kudrnatých vlasů
P_SCISSORS = "1622286342621-4bd786c2447c"   # střih nůžkami
P_TOOLS = "1621607512214-68297480165e"      # nářadí: nůžky, fén
P_GREEN = "1521146764736-56c929d59c83"      # portrét, tmavě zelené vlasy
P_SHORT = "1531123897727-8f129e1688ce"      # portrét, krátký sestřih
P_BEARD = "1614289371518-722f2615943d"      # portrét, šedý plnovous

LINKS = [
    {"label": "O nás", "href": "/o-nas"},
    {"label": "Služby", "href": "/#sluzby"},
    {"label": "Tým", "href": "/tym"},
    {"label": "Kolekce", "href": "/kolekce"},
    {"label": "Blog", "href": "/blog"},
    {"label": "Kontakt", "href": "/kontakt"},
]
HOURS = [
    {"days": "Pondělí – Pátek", "time": "9:00 – 20:00"},
    {"days": "Sobota", "time": "9:00 – 16:00"},
    {"days": "Neděle", "time": "Zavřeno"},
]

content = {
    "navbar": {"siteName": "Ateliér Noir", "logoUrl": "", "phone": "+420 704 123 456",
               "ctaText": "Rezervace", "ctaHref": "/kontakt", "links": LINKS,
               "socials": [{"label": "Instagram", "href": "https://instagram.com/demo"},
                           {"label": "Facebook", "href": "https://facebook.com/demo"}]},
    "hero": {
        "eyebrow": "Kadeřnický ateliér · Praha 1",
        "title": "Střih jako podpis",
        "subtitle": "Pracujeme s tvarem, ne s trendem. Každý střih stavíme na struktuře vašich vlasů, aby držel i po měsíci bez úprav.",
        "image": img(P_SHAVE, 1920, 1200),
        "ctaText": "Chci se objednat", "ctaHref": "/kontakt",
        "ctaSecondaryText": "Prohlédnout kolekci", "ctaSecondaryHref": "/kolekce",
        "meta": [{"value": "12 let", "label": "na jedné adrese"},
                 {"value": "3", "label": "kadeřníci v ateliéru"},
                 {"value": "4,9", "label": "hodnocení na Google"}],
    },
    "about": {
        "tagline": "O ateliéru",
        "title": "Malý ateliér, žádná linka na střihy",
        "body": "Otevřela jsem Ateliér Noir v roce 2014, protože jsem chtěla dělat vlasy jinak než na běžce — jeden klient, jeden kadeřník, dost času.",
        "paragraphs": [
            "Každou návštěvu začínáme rozborem: jak vlasy rostou, kde se lámou a co s nimi zvládnete doma. Teprve pak sáhneme po nůžkách. Díky tomu odcházíte se střihem, který se nerozpadne, jakmile ho poprvé umyjete sami.",
            "Barvíme technikami s měkkým přechodem a pracujeme i s odbarvenými vlasy — ale jen tehdy, když je vlas unese. Když ne, řekneme to na rovinu a navrhneme postup na několik návštěv.",
            "Ateliér je unisex. Stejnou péči věnujeme dámskému střihu i úpravě vousů.",
        ],
        "image": img(P_SHORT, 1000, 1250),
        "signature": "Petra Demová", "signatureRole": "zakladatelka ateliéru",
    },
    "services": {
        "tagline": "Ceník",
        "title": "Co u nás zvládneme",
        "subtitle": "Ceny jsou orientační — konečnou částku potvrdíme při konzultaci podle délky a stavu vlasů.",
        "services": [
            {"name": "Dámský střih", "description": "Rozbor vlasů, mytí, střih a styling včetně návodu na domácí úpravu.",
             "price": "od 990 Kč", "duration": "60 min", "image": img(P_SCISSORS, 500, 500)},
            {"name": "Pánský střih", "description": "Střih nůžkami i strojkem, zastřižení vousů a finální styling.",
             "price": "od 550 Kč", "duration": "45 min", "image": img(P_BARBER_MASK, 500, 500)},
            {"name": "Holení břitvou", "description": "Klasické mokré holení s horkým ručníkem a péčí po holení.",
             "price": "od 690 Kč", "duration": "45 min", "image": img(P_SHAVE, 500, 500)},
            {"name": "Barvení & přechody", "description": "Balayage, airtouch nebo jednotný odstín bez ostré linie odrostu.",
             "price": "od 2 490 Kč", "duration": "180 min", "image": img(P_GREEN, 500, 500)},
            {"name": "Střih kudrnatých vlasů", "description": "Střih nasucho po jednotlivých pramenech podle tvaru kudrny.",
             "price": "od 1 290 Kč", "duration": "90 min", "image": img(P_CUT_CURLY, 500, 500)},
            {"name": "Péče & regenerace", "description": "Diagnostika vlasového vlákna a ošetření namíchané na míru.",
             "price": "od 890 Kč", "duration": "45 min", "image": img(P_TOOLS, 500, 500)},
        ],
    },
    "team": {
        "tagline": "Tým", "title": "Kdo se o vás postará",
        "ctaText": "Zobrazit celý tým", "ctaHref": "/tym",
        "members": [
            {"name": "Petra Demová", "role": "Zakladatelka", "image": img(P_SHORT, 800, 1067),
             "specialty": "Dámské střihy a práce s krátkými tvary."},
            {"name": "Klára Ukázková", "role": "Koloristka", "image": img(P_GREEN, 800, 1067),
             "specialty": "Balayage, airtouch a náročné odbarvování."},
            {"name": "Martin Demo", "role": "Barber", "image": img(P_BEARD, 800, 1067),
             "specialty": "Pánské střihy, vousy a holení břitvou."},
        ],
    },
    "gallery": {
        "tagline": "Kolekce", "title": "Jak to u nás vypadá",
        "subtitle": "Ateliér, nástroje a práce z posledních měsíců.",
        "images": [
            {"url": img(P_BW_SALON, 800, 1000), "alt": "Interiér ateliéru"},
            {"url": img(P_DARK_SALON, 800, 1000), "alt": "Pracoviště s černými stěnami"},
            {"url": img(P_CHAIR, 800, 1000), "alt": "Historické holičské křeslo"},
            {"url": img(P_TOOLS, 800, 1000), "alt": "Nůžky a fén na pracovním pultu"},
            {"url": img(P_CUT_CURLY, 800, 1000), "alt": "Střih kudrnatých vlasů"},
            {"url": img(P_SCISSORS, 800, 1000), "alt": "Detail střihu nůžkami"},
        ],
    },
    "blog": {
        "tagline": "Magazín",
        "title": "Přečtěte si víc o vlasech",
        "buttonText": "Všechny články",
        "posts": [
            {"title": "Jak poznat, že střih sedne i za měsíc", "excerpt": "Tři věci, které si ohlídejte při konzultaci, aby vám účes vydržel do další návštěvy.",
             "image": img(P_SCISSORS, 900, 600), "href": "/blog", "date": "23. 1. 2026"},
            {"title": "Odbarvování bez zničených konečků", "excerpt": "Kdy vlas odbarvení unese, kdy je lepší rozložit ho do dvou návštěv a co dělat mezitím.",
             "image": img(P_GREEN, 900, 600), "href": "/blog", "date": "17. 10. 2025"},
            {"title": "Letní péče: slunce, moře a suché vlasy", "excerpt": "Co vlasům v létě opravdu pomůže — a na které zázračné sliby se nedá spolehnout.",
             "image": img(P_TOOLS, 900, 600), "href": "/blog", "date": "24. 6. 2025"},
        ],
    },
    "testimonials": {
        "tagline": "Recenze", "title": "Co říkají klienti",
        "rating": "4,9", "ratingLabel": "průměr ze 214 hodnocení na Google",
        "testimonials": [
            {"author": "Tereza N.", "role": "klientka od 2018", "rating": "5",
             "text": "Poprvé mi někdo vysvětlil, proč mi předchozí střih nikdy nedržel. Odešla jsem s tvarem, který si doma zvládnu rozfoukat za pět minut."},
            {"author": "Adam K.", "role": "klient od 2022", "rating": "5",
             "text": "Chodím na střih a vousy. Nikdy mě netlačili do drahé péče — když nic nepotřebuju, prostě to řeknou."},
            {"author": "Lucie B.", "role": "klientka od 2020", "rating": "5",
             "text": "Odbarvení rozložili do dvou návštěv, přesně jak slíbili. Vlasy to zvládly a barva vypadá pořád dobře."},
        ],
    },
    "contact": {
        "tagline": "Kontakt", "title": "Ozvěte se nám",
        "body": "Objednávky bereme telefonicky, e-mailem i přes on-line rezervaci. Ateliér najdete ve dvoře, dvě minuty od metra.",
        "phone": "+420 704 123 456", "email": "email@demo.cz",
        "address": "Ukázková 123, 110 00 Praha 1",
        "image": img(P_DARK_SALON, 1200, 750), "hours": HOURS,
    },
    "footer": {
        "siteName": "Ateliér Noir", "heading": "Těšíme se na vás",
        "tagline": "Kadeřnický ateliér v centru Prahy. Střih, barva a vousy bez spěchu.",
        "ctaText": "Rezervace", "ctaHref": "/kontakt",
        "phone": "+420 704 123 456", "email": "email@demo.cz",
        "address": "Ukázková 123, 110 00 Praha 1",
        "hours": HOURS, "links": LINKS,
        "socials": [{"label": "Instagram", "href": "https://instagram.com/demo"},
                    {"label": "Facebook", "href": "https://facebook.com/demo"}],
        "copyright": "© 2026 Demo Studio s.r.o. | IČO: 12345678 | DIČ: CZ12345678",
    },
    "pages": {
        "o-nas": {"hero": {"title": "O ateliéru", "subtitle": "Tři kadeřníci, dvanáct let na jedné adrese.", "backgroundImage": img(P_BW_SALON, 1800, 800)}},
        "tym": {"hero": {"title": "Náš tým", "subtitle": "Lidé, kteří se o vaše vlasy postarají.", "backgroundImage": img(P_SHORT, 1800, 800)}},
        "kolekce": {"hero": {"title": "Kolekce", "subtitle": "Ukázky naší práce a atmosféra ateliéru.", "backgroundImage": img(P_GREEN, 1800, 800)}},
        "kontakt": {"hero": {"title": "Kontakt", "subtitle": "Kde nás najdete a kdy máme otevřeno.", "backgroundImage": img(P_DARK_SALON, 1800, 800)}},
    },
    "home": {"rezervace": {"title": "Objednejte se on-line", "subtitle": "Vyberte službu, kadeřníka a čas. Potvrzení dorazí e-mailem.", "providerSlug": "", "apiBaseUrl": ""}},
}

(T / "content/cs.json").write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n")
print("✓ cs.json")

# ── registrace variant ────────────────────────────────────────────────────────
ENTRIES = [
    ("hero-hair-03-split", None,
     '    { key: "hero-hair-03-split", label: "Hero – noir cinematic (hair-03)", description: "V3 Noir & Oxblood: fullbleed tmavá fotka 94vh se silným scrimem, Archivo uppercase H1, dvojice CTA a spodní meta pás na hairline — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hero-hair-03-page", "hero-hair-03-split",
     '    { key: "hero-hair-03-page", label: "Hero – podstránka (hair-03)", description: "V3 Noir & Oxblood: tmavý pás s tlumenou fotkou, drobečkovou navigací a Archivo uppercase H1 — podstránkový hero hair-03", industries: ["hair"] },'),
    ("about-hair-03-founder", None,
     '    { key: "about-hair-03-founder", label: "O nás – portrét zakladatelky (hair-03)", description: "V3 Noir & Oxblood: bone bg, vlevo černobílý portrét v oxblood rámu, vpravo eyebrow + Archivo H2 + odstavce a podpis na hairline — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-circles", None,
     '    { key: "hair-03-circles", label: "Tým – editoriální portréty (hair-03)", description: "V3 Noir & Oxblood: hranaté portréty 3/4 v grayscale, na hover se rozbarví a přiblíží; jméno, role a specializace na hairline — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-services", "hair-02-services",
     '    { key: "hair-03-services", label: "Služby – editoriální ceník (hair-03)", description: "V3 Noir & Oxblood: číslované hairline řádky se čtvercovým náhledem, popisem a cenou vpravo; vědomě jiný jazyk než foto karty — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-gallery-slider", None,
     '    { key: "hair-03-gallery-slider", label: "Galerie – tmavá mřížka (hair-03)", description: "V3 Noir & Oxblood: tmavá sekce pro rytmus, mřížka 3 sloupce 4/5 v grayscale s rozbarvením a zoomem na hover — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-blog-cards", None,
     '    { key: "hair-03-blog-cards", label: "Blog – editoriální karty (hair-03)", description: "V3 Noir & Oxblood: bone bg, karty s fotkou 3/2, oxblood datem nad titulkem a hairline patičkou Číst dál — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-testimonials", "hair-02-testimonials",
     '    { key: "hair-03-testimonials", label: "Reference – hairline sloupce (hair-03)", description: "V3 Noir & Oxblood: bílá sekce, velké skóre vpravo, tři sloupce dělené hairlines s oxblood hvězdami a hranatými iniciálovými avatary — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-contact", "contact-hair-02-location",
     '    { key: "hair-03-contact", label: "Kontakt – údaje + formulář (hair-03)", description: "V3 Noir & Oxblood: vlevo hairline řádky s telefonem, e-mailem, adresou a otevírací dobou plus foto ateliéru; vpravo orámovaná karta s reálným formulářem a stavy odesílání — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-footer", None,
     '    { key: "hair-03-footer", label: "Patička – noir + WeberoCredit (hair-03)", description: "V3 Noir & Oxblood: tmavá patička s Archivo headingem a oxblood CTA, čtyři sloupce (navigace / kontakt / otevírací doba / sítě) a copyright bar s WeberoCredit — hair-03 Ateliér Noir", industries: ["hair"] },'),
    ("hair-03-navbar", None,
     '    { key: "hair-03-navbar", label: "Navigace – blur bar s oxblood CTA (hair-03)", description: "V3 Noir & Oxblood: blur sticky bar, Archivo wordmark s oxblood pravítkem, underline-slide linky, hranaté CTA; fullscreen overlay menu se staggerem a sticky mobilní CTA lišta — hair-03 Ateliér Noir", industries: ["hair"] },'),
]

lines = VAR.read_text().split("\n")
for key, anchor, line in ENTRIES:
    idx = next((i for i, l in enumerate(lines) if ('key: "%s"' % key) in l), None)
    if idx is not None:
        lines[idx] = line
        continue
    aidx = next(i for i, l in enumerate(lines) if ('key: "%s"' % anchor) in l)
    lines.insert(aidx + 1, line)
VAR.write_text("\n".join(lines))
print("✓ variants.ts (%d záznamů)" % len(ENTRIES))

# ── manifest ──────────────────────────────────────────────────────────────────
nav = {"type": "navbar", "variant": "hair-03-navbar", "contentRef": "navbar"}
foot = {"type": "footer", "variant": "hair-03-footer", "contentRef": "footer"}
ph = lambda s: {"type": "hero", "variant": "hero-hair-03-page", "contentRef": "pages.%s.hero" % s}

template = {
    "$schema": "../../schemas/template.schema.json",
    "key": "hair-03", "name": "Ateliér Noir", "industry": "hair",
    "skeleton": "service-personal", "version": "3.0.0", "tags": ["v3"], "baseTemplate": None,
    "description": "V3 „Noir & Oxblood“ — kadeřnický ateliér v tmavé editoriální paletě (oxblood #8E2B36, bone #F1EEEA, noir #141110), Archivo + Gantari, ostré hrany bez zaoblení. Noir cinematic hero, editoriální ceník na hairline řádcích, tmavá galerie s grayscale zoomem, tým v portrétech, blog modul a kontakt s reálným formulářem.",
    "sectionOrderNote": "Rytmus dle V3_PLAYBOOK §1: hero (tmavý) → o ateliéru (bone) → ceník (bílá) → tým (bone) → galerie (TMAVÁ) → blog (bone) → recenze (bílá) → rezervace → kontakt (bone) → patička (tmavá). Žádné dvě tmavé sekce vedle sebe.",
    "skippedSections": [
        {"pos": 5, "name": "Pricing", "reason": "ceny jsou přímo v editoriálním ceníku služeb"},
        {"pos": 9, "name": "Booking/CTA", "reason": "konverzi nese rezervační widget Rezora přímo na homepage plus sticky mobilní CTA lišta v navigaci"},
        {"pos": 11, "name": "FAQ", "reason": "dotazy řeší rezervační widget a kontaktní formulář"},
    ],
    "extraSections": [
        {"type": "blog-preview", "variant": "hair-03-blog-cards", "reason": "ateliér provozuje magazín o péči o vlasy — modul blogu je součástí šablony"},
        {"type": "rezora-widget", "reason": "inline rezervační widget Rezora — objednání přímo na stránce"},
        {"type": "contact", "variant": "hair-03-contact", "reason": "kostra service-personal nemá kontaktní sekci s formulářem; ateliér ji potřebuje pro poptávky mimo rezervační okno"},
        {"type": "testimonials", "variant": "hair-03-testimonials", "reason": "recenze chyběly úplně — bez sociálního důkazu šablona neprodává"},
    ],
    "i18n": {"default": "cs", "supported": ["cs"]},
    "pages": [
        {"slug": "home", "isHomepage": True, "title": "Domů", "sections": [
            nav,
            {"type": "hero", "variant": "hero-hair-03-split", "contentRef": "hero"},
            {"type": "about", "variant": "about-hair-03-founder", "contentRef": "about"},
            {"type": "services", "variant": "hair-03-services", "contentRef": "services"},
            {"type": "team", "variant": "hair-03-circles", "contentRef": "team"},
            {"type": "gallery", "variant": "hair-03-gallery-slider", "contentRef": "gallery"},
            {"type": "blog-preview", "variant": "hair-03-blog-cards", "contentRef": "blog"},
            {"type": "testimonials", "variant": "hair-03-testimonials", "contentRef": "testimonials"},
            {"type": "rezora-widget", "variant": "editorial", "contentRef": "home.rezervace"},
            {"type": "contact", "variant": "hair-03-contact", "contentRef": "contact"},
            foot]},
        {"slug": "o-nas", "title": "O ateliéru", "sections": [
            nav, ph("o-nas"),
            {"type": "about", "variant": "about-hair-03-founder", "contentRef": "about"},
            {"type": "testimonials", "variant": "hair-03-testimonials", "contentRef": "testimonials"},
            foot]},
        {"slug": "tym", "title": "Tým", "sections": [
            nav, ph("tym"),
            {"type": "team", "variant": "hair-03-circles", "contentRef": "team"},
            foot]},
        {"slug": "kolekce", "title": "Kolekce", "sections": [
            nav, ph("kolekce"),
            {"type": "gallery", "variant": "hair-03-gallery-slider", "contentRef": "gallery"},
            foot]},
        {"slug": "kontakt", "title": "Kontakt", "sections": [
            nav, ph("kontakt"),
            {"type": "contact", "variant": "hair-03-contact", "contentRef": "contact"},
            foot]},
    ],
    "content": {"default": "./content/cs.json"},
}

theme = {
    "colors": {"primary": "#8E2B36", "secondary": "#141110", "background": "#F1EEEA",
               "surface": "#FFFFFF", "text": "#141110", "textMuted": "#6E645D",
               "accent": "#6E1F28", "border": "#E0D9D2"},
    "typography": {"fontHeading": "'Archivo', sans-serif", "fontBody": "'Gantari', sans-serif", "scale": "comfortable"},
    "radius": {"sm": "0px", "md": "0px", "lg": "0px", "pill": "0px"},
    "spacing": {"personality": "spacious", "section": "comfortable"},
    "shadows": {"sm": "0 1px 3px rgba(20,17,16,0.08)", "md": "0 8px 24px rgba(20,17,16,0.12)", "lg": "0 18px 48px rgba(20,17,16,0.16)"},
    "animation": {"ease": "cubic-bezier(0.22,1,0.36,1)", "duration": "280ms", "intensity": "subtle"},
    "presets": {
        "oxblood": {"label": "Oxblood — tmavý editorial (default)", "tokens": {
            "colorPrimary": "#8E2B36", "colorAccent": "#6E1F28", "colorSecondary": "#141110",
            "colorBackground": "#F1EEEA", "colorSurface": "#FFFFFF", "colorText": "#141110",
            "colorTextMuted": "#6E645D", "colorBorder": "#E0D9D2"}},
        "brass": {"label": "Brass — teplý mosazný noir", "tokens": {
            "colorPrimary": "#A8762A", "colorAccent": "#845A1D", "colorSecondary": "#17130E",
            "colorBackground": "#F3F0EA", "colorSurface": "#FFFFFF", "colorText": "#17130E",
            "colorTextMuted": "#6F6558", "colorBorder": "#E2DBCF"}},
        "steel": {"label": "Steel — chladná ocelová", "tokens": {
            "colorPrimary": "#3C6E86", "colorAccent": "#2B5568", "colorSecondary": "#111619",
            "colorBackground": "#EFF1F2", "colorSurface": "#FFFFFF", "colorText": "#111619",
            "colorTextMuted": "#636B70", "colorBorder": "#DCE0E2"}},
    },
}

(T / "template.json").write_text(json.dumps(template, ensure_ascii=False, indent=2) + "\n")
(T / "theme.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
print("✓ template.json + theme.json (stránky: %d)" % len(template["pages"]))
