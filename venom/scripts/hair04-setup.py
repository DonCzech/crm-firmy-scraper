#!/usr/bin/env python3
"""hair-04 V3 „Studio Pop" — cs.json + variants.ts + template.json/theme.json. Idempotentní."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / "src/templates/hair-04"
VAR = ROOT / "src/sections/variants.ts"
U = "https://images.unsplash.com/photo-"
img = lambda pid, w, h: "%s%s?w=%d&h=%d&fit=crop&auto=format&q=80" % (U, pid, w, h)

# vizuálně ověřeno montage gridem 2026-07-22
P_SHOP = "1585747860715-2ba37e788b70"    # klasický barbershop, cihly a křesla
P_FADE = "1493256338651-d82f7acb2b38"    # fade strojkem zezadu
P_LINEUP = "1599351431202-1e0f0137899a"  # kontura břitvou, detail
P_GRAF = "1622287162716-f311baa1a2b8"    # barber při práci, graffiti stěna
P_TOOLS = "1621605815971-fbc98d665033"   # strojky a nůžky na pultu
P_BEARD = "1517832606299-7ae9b720a186"   # úprava vousů nůžkami
P_SHAVE = "1596728325488-58c87691e9af"   # holení břitvou
P_FACE = "1616394584738-fc6e612e71b9"    # pleťová maska
P_LAUGH = "1584316712724-f5d4b188fee2"   # smějící se muž, oranžová stěna

LINKS = [
    {"label": "Úvod", "href": "/"},
    {"label": "Služby", "href": "/sluzby"},
    {"label": "Galerie", "href": "/galerie"},
    {"label": "Blog", "href": "/blog"},
    {"label": "Kontakt", "href": "/kontakt"},
]
HOURS = [{"days": "Pondělí – Pátek", "time": "9:00 – 18:00"},
         {"days": "Sobota", "time": "9:00 – 14:00"},
         {"days": "Neděle", "time": "Zavřeno"}]
SOC = [{"label": "Instagram", "href": "https://instagram.com/demo"},
       {"label": "Facebook", "href": "https://facebook.com/demo"}]

content = {
    "navbar": {"siteName": "Studio Pop", "logoUrl": "", "phone": "+420 704 123 456",
               "ctaText": "Rezervovat", "ctaHref": "/kontakt", "links": LINKS, "socials": SOC},
    "hero": {
        "eyebrow": "Barbershop · Praha 3",
        "title": "Je čas se ostříhat? Posaďte se k nám.",
        "subtitle": "Pánské střihy, vousy a holení břitvou. Bez objednávky do deseti minut, s objednávkou přesně na čas.",
        "backgroundImage": img(P_SHOP, 1920, 1200),
        "ctaPrimaryText": "Ceník a rezervace", "ctaPrimaryHref": "/sluzby",
        "ctaSecondaryText": "Zavolat", "ctaSecondaryHref": "/kontakt",
        "meta": [{"value": "13 let", "label": "na Žižkově"},
                 {"value": "5", "label": "barberů v týmu"},
                 {"value": "4,9", "label": "hodnocení na Google"}],
    },
    "services": {
        "tagline": "Ceník", "title": "Naše služby",
        "subtitle": "Ceny platí pro všechny barbery v týmu. Studenti mají 15 % dolů každé úterý.",
        "items": [
            {"name": "Pánský střih", "title": "Pánský střih", "description": "Konzultace, mytí, střih nůžkami i strojkem a styling.",
             "body": "Konzultace, mytí, střih nůžkami i strojkem a styling.", "price": "od 590 Kč", "duration": "45 min", "image": img(P_FADE, 900, 600)},
            {"name": "Střih a vousy", "title": "Střih a vousy", "description": "Kompletní úprava: střih vlasů plus tvarování a zastřižení vousů.",
             "body": "Kompletní úprava: střih vlasů plus tvarování a zastřižení vousů.", "price": "od 890 Kč", "duration": "70 min", "image": img(P_BEARD, 900, 600)},
            {"name": "Holení břitvou", "title": "Holení břitvou", "description": "Mokré holení s horkým ručníkem, olejem a balzámem po holení.",
             "body": "Mokré holení s horkým ručníkem, olejem a balzámem po holení.", "price": "od 690 Kč", "duration": "45 min", "image": img(P_SHAVE, 900, 600)},
            {"name": "Kontura a detaily", "title": "Kontura a detaily", "description": "Doladění linií mezi střihy — krk, kotlety a přechody.",
             "body": "Doladění linií mezi střihy — krk, kotlety a přechody.", "price": "od 290 Kč", "duration": "20 min", "image": img(P_LINEUP, 900, 600)},
            {"name": "Péče o pleť", "title": "Péče o pleť", "description": "Čisticí maska a masáž obličeje po holení nebo samostatně.",
             "body": "Čisticí maska a masáž obličeje po holení nebo samostatně.", "price": "od 490 Kč", "duration": "30 min", "image": img(P_FACE, 900, 600)},
            {"name": "Dětský střih", "title": "Dětský střih", "description": "Pro kluky do 12 let. Bez spěchu a bez slz — máme trpělivost.",
             "body": "Pro kluky do 12 let. Bez spěchu a bez slz — máme trpělivost.", "price": "od 390 Kč", "duration": "30 min", "image": img(P_GRAF, 900, 600)},
        ],
    },
    "cta": {"title": "Nechcete čekat? Zkuste nám zavolat",
            "subtitle": "Když se uvolní křeslo, vezmeme vás i bez objednávky.",
            "phone": "704 123 456", "phoneHref": "tel:+420704123456",
            "ctaText": "Rezervovat on-line", "ctaHref": "/kontakt"},
    "about": {
        "tagline": "O nás", "title": "Impresivní střihy. Už 13 let.",
        "body": "Od roku 2013 pomáháme mužům vypadat upraveně bez toho, aby nad tím museli přemýšlet. Specializujeme se na pánské střihy, úpravu vousů, styling a holení břitvou.",
        "body2": "Každý účes stavíme na tom, jak vlasy rostou a kolik času jim ráno chcete věnovat. Zakládáme si na férových cenách a na tom, že vám nikdy neprodáme něco, co nepotřebujete.",
        "image": img(P_GRAF, 1000, 1250),
        "stats": [{"value": "13", "label": "let na Žižkově"},
                  {"value": "5", "label": "barberů v týmu"},
                  {"value": "4,9", "label": "hodnocení na Google"}],
    },
    "gallery": {
        "tagline": "Galerie", "title": "Jak to u nás vypadá",
        "subtitle": "Interiér, nástroje a práce z posledních týdnů.",
        "images": [
            {"url": img(P_SHOP, 800, 1000), "alt": "Interiér barbershopu"},
            {"url": img(P_GRAF, 800, 1000), "alt": "Barber při práci"},
            {"url": img(P_FADE, 800, 1000), "alt": "Fade strojkem"},
            {"url": img(P_LINEUP, 800, 1000), "alt": "Kontura břitvou"},
            {"url": img(P_TOOLS, 800, 1000), "alt": "Strojky a nůžky"},
            {"url": img(P_SHAVE, 800, 1000), "alt": "Holení břitvou"},
        ],
    },
    "testimonials": {
        "tagline": "Recenze", "title": "Co říkají klienti",
        "rating": "4,9", "ratingLabel": "průměr ze 186 hodnocení na Google",
        "testimonials": [
            {"author": "Jakub S.", "role": "klient od 2019", "rating": "5",
             "text": "Chodím sem šest let a ještě jsem neodešel nespokojený. Poradí i s tím, co ráno reálně zvládnu udělat sám."},
            {"author": "Ondřej M.", "role": "klient od 2023", "rating": "5",
             "text": "Přišel jsem bez objednávky v pátek odpoledne a vzali mě do dvaceti minut. Střih i vousy přesně podle domluvy."},
            {"author": "Filip R.", "role": "klient od 2021", "rating": "5",
             "text": "Holení břitvou je tady zážitek. Horký ručník, klid a výsledek vydrží dýl než z domácího strojku."},
        ],
    },
    "blog": {
        "tagline": "Magazín", "title": "Z našeho blogu", "buttonText": "Všechny články",
        "posts": [
            {"title": "Jak často chodit na střih", "excerpt": "Podle typu střihu se interval liší od tří týdnů po dva měsíce. Poradíme, jak to poznat na sobě.",
             "image": img(P_TOOLS, 900, 600), "href": "/blog", "date": "16. 7. 2026"},
            {"title": "Vousy: čím je mýt a čím ne", "excerpt": "Šampon na vlasy vousy vysušuje. Projdeme, co doopravdy funguje a co je jen hezká lahvička.",
             "image": img(P_BEARD, 900, 600), "href": "/blog", "date": "9. 7. 2026"},
            {"title": "Co dělat s pletí po holení", "excerpt": "Podráždění po břitvě není nutnost. Tři kroky, které ho spolehlivě odstraní.",
             "image": img(P_FACE, 900, 600), "href": "/blog", "date": "28. 6. 2026"},
        ],
    },
    "contact": {
        "tagline": "Kontakt", "title": "Kudy k nám",
        "body": "Najdete nás kousek od náměstí, vchod z ulice. Bez objednávky berte ráno nebo mezi 14. a 16. hodinou.",
        "addressTitle": "Adresa a kontakty",
        "address": "Ukázková 123, 130 00 Praha 3",
        "hours": "Po–Pá 9:00–18:00, So 9:00–14:00",
        "phone": "704 123 456", "phoneHref": "tel:+420704123456",
        "email": "email@demo.cz",
        "facebook": "https://facebook.com/demo", "instagram": "https://instagram.com/demo",
        "mapEmbedUrl": "", "image": img(P_SHOP, 1200, 750),
    },
    "footer": {
        "siteName": "Studio Pop", "heading": "Těšíme se na vás",
        "tagline": "Barbershop na Žižkově. Střihy, vousy a holení břitvou.",
        "ctaText": "Rezervovat", "ctaHref": "/kontakt",
        "address": "Ukázková 123, 130 00 Praha 3",
        "phone": "704 123 456", "email": "email@demo.cz",
        "hoursList": HOURS, "links": LINKS, "socials": SOC,
        "copyright": "© 2026 Demo Studio s.r.o. | IČO: 12345678 | DIČ: CZ12345678",
        "gdprHref": "/gdpr", "facebook": "https://facebook.com/demo", "instagram": "https://instagram.com/demo",
    },
    "pages": {
        "sluzby": {"hero": {"title": "Služby a ceník", "subtitle": "Co u nás zvládneme a kolik to stojí.", "backgroundImage": img(P_FADE, 1800, 700)}},
        "galerie": {"hero": {"title": "Galerie", "subtitle": "Interiér, nástroje a práce z posledních týdnů.", "backgroundImage": img(P_GRAF, 1800, 700)}},
        "kontakt": {"hero": {"title": "Kontakt", "subtitle": "Kde nás najdete a kdy máme otevřeno.", "backgroundImage": img(P_SHOP, 1800, 700)}},
    },
    "home": {"rezervace": {"title": "Objednejte se on-line", "subtitle": "Vyberte službu, barbera a čas. Potvrzení dorazí e-mailem.", "providerSlug": "", "apiBaseUrl": ""}},
}
(T / "content/cs.json").write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n")
print("✓ cs.json")

ENTRIES = [
    ("hair-04-navbar", "hair-03-navbar",
     '    { key: "hair-04-navbar", label: "Navigace – blur bar s violet CTA (hair-04)", description: "V3 Studio Pop: blur sticky bar, Space Grotesk wordmark s violet tečkou, underline-slide linky, violet pill CTA; fullscreen overlay menu se staggerem a sticky mobilní CTA lišta — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hero-hair-04-with-navbar", None,
     '    { key: "hero-hair-04-with-navbar", label: "Hero – cinematic (hair-04)", description: "V3 Studio Pop: fullbleed fotka 92vh se scrimem, Space Grotesk H1, dvojice CTA a spodní meta pás; navigace je nově samostatná sekce — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hero-hair-04-page", "hero-hair-04-with-navbar",
     '    { key: "hero-hair-04-page", label: "Hero – podstránka (hair-04)", description: "V3 Studio Pop: světlý pás s drobečkovou navigací, Space Grotesk H1 a širokým foto pásem radius 14 — podstránkový hero hair-04", industries: ["hair"] },'),
    ("hair-04-service-cards", None,
     '    { key: "hair-04-service-cards", label: "Služby – foto karty s cenou (hair-04)", description: "V3 Studio Pop: bílé bg, karty s fotkou 16/10 a hover zoomem, název, popis a hairline řádek s cenou a délkou; nahrazuje kosočtvercové rámy — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-cta-phone", None,
     '    { key: "hair-04-cta-phone", label: "CTA – violet pás s telefonem (hair-04)", description: "V3 Studio Pop: sytý violet pás, vlevo titulek s podtitulem, vpravo bílé pill tlačítko s číslem a odkaz na rezervaci — hair-04 Studio Pop", industries: ["hair"] },'),
    ("about-hair-04-split", None,
     '    { key: "about-hair-04-split", label: "O nás – split se statistikami (hair-04)", description: "V3 Studio Pop: vlevo eyebrow + Space Grotesk H2 + dva odstavce + statistiky na violet hairlines, vpravo foto 4/5 s posunutou violet plochou — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-carousel", None,
     '    { key: "hair-04-carousel", label: "Galerie – tmavá mřížka (hair-04)", description: "V3 Studio Pop: tmavá sekce pro rytmus, mřížka 3 sloupce 4/5 radius 14 s hover zoomem; nahrazuje karusel s useknutými fotkami — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-testimonials", "hair-03-testimonials",
     '    { key: "hair-04-testimonials", label: "Reference – karty s iniciálami (hair-04)", description: "V3 Studio Pop: bílá sekce, velké skóre vpravo, karty na světlém podkladu s violet hvězdami a kruhovými iniciálovými avatary — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-blog", "hair-03-blog-cards",
     '    { key: "hair-04-blog", label: "Blog – karty s hover liftem (hair-04)", description: "V3 Studio Pop: bílé karty radius 14 s fotkou 3/2, violet datem a hairline patičkou Číst dál; nahrazuje generický výpis se stock fotkami — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-contact", None,
     '    { key: "hair-04-contact", label: "Kontakt – údaje + formulář (hair-04)", description: "V3 Studio Pop: vlevo hairline řádky s adresou, telefonem, e-mailem a otevírací dobou plus mapa nebo fotka, vpravo karta s reálným formulářem a stavy odesílání — hair-04 Studio Pop", industries: ["hair"] },'),
    ("hair-04-footer", None,
     '    { key: "hair-04-footer", label: "Patička – tmavá + WeberoCredit (hair-04)", description: "V3 Studio Pop: tmavá patička se Space Grotesk headingem a violet CTA, čtyři sloupce (navigace / kontakt / otevírací doba / sítě) a copyright bar s WeberoCredit — hair-04 Studio Pop", industries: ["hair"] },'),
]
lines = VAR.read_text().split("\n")
for key, anchor, line in ENTRIES:
    idx = next((i for i, l in enumerate(lines) if ('key: "%s"' % key) in l), None)
    if idx is not None:
        lines[idx] = line
    else:
        aidx = next(i for i, l in enumerate(lines) if ('key: "%s"' % anchor) in l)
        lines.insert(aidx + 1, line)
VAR.write_text("\n".join(lines))
print("✓ variants.ts (%d)" % len(ENTRIES))

nav = {"type": "navbar", "variant": "hair-04-navbar", "contentRef": "navbar"}
foot = {"type": "footer", "variant": "hair-04-footer", "contentRef": "footer"}
ph = lambda s: {"type": "hero", "variant": "hero-hair-04-page", "contentRef": "pages.%s.hero" % s}

template = {
    "$schema": "../../schemas/template.schema.json",
    "key": "hair-04", "name": "Studio Pop", "industry": "hair",
    "skeleton": "service-personal", "version": "3.0.0", "tags": ["v3"], "baseTemplate": None,
    "description": "V3 „Studio Pop“ — pánský barbershop ve svěží pop paletě (violet #6D4AFF, cool paper #F5F4FA, indigo #17132A), Space Grotesk + Epilogue, radius 14 a pill CTA. Cinematic hero, foto karty služeb s cenou, violet CTA pás s telefonem, tmavá galerie, recenze, blog modul a kontakt s reálným formulářem.",
    "sectionOrderNote": "Rytmus dle V3_PLAYBOOK §1: hero (tmavý) → služby (bílá) → CTA pás (violet) → o nás (paper) → galerie (TMAVÁ) → recenze (bílá) → rezervace → blog (paper) → kontakt (bílá) → patička (tmavá). Žádné dvě tmavé sekce vedle sebe.",
    "skippedSections": [
        {"pos": 5, "name": "Pricing", "reason": "ceny jsou přímo na foto kartách služeb"},
        {"pos": 7, "name": "Team", "reason": "barbershop staví na značce, ne na jménech; tým je zmíněn v o nás"},
        {"pos": 11, "name": "FAQ", "reason": "dotazy řeší rezervační widget a kontaktní formulář"},
    ],
    "extraSections": [
        {"type": "cta", "variant": "hair-04-cta-phone", "reason": "violet pás s telefonem drží rytmus mezi světlými sekcemi a nese hlavní konverzi (volání bez objednávky)"},
        {"type": "blog-preview", "variant": "hair-04-blog", "reason": "barbershop provozuje magazín — modul blogu je součástí šablony"},
        {"type": "rezora-widget", "reason": "inline rezervační widget Rezora — objednání přímo na stránce"},
        {"type": "testimonials", "variant": "hair-04-testimonials", "reason": "recenze v šabloně úplně chyběly — bez sociálního důkazu neprodává"},
    ],
    "i18n": {"default": "cs", "supported": ["cs"]},
    "pages": [
        {"slug": "home", "isHomepage": True, "title": "Domů", "sections": [
            nav,
            {"type": "hero", "variant": "hero-hair-04-with-navbar", "contentRef": "hero"},
            {"type": "services", "variant": "hair-04-service-cards", "contentRef": "services"},
            {"type": "cta", "variant": "hair-04-cta-phone", "contentRef": "cta"},
            {"type": "about", "variant": "about-hair-04-split", "contentRef": "about"},
            {"type": "gallery", "variant": "hair-04-carousel", "contentRef": "gallery"},
            {"type": "testimonials", "variant": "hair-04-testimonials", "contentRef": "testimonials"},
            {"type": "rezora-widget", "variant": "editorial", "contentRef": "home.rezervace"},
            {"type": "blog-preview", "variant": "hair-04-blog", "contentRef": "blog"},
            {"type": "contact", "variant": "hair-04-contact", "contentRef": "contact"},
            foot]},
        {"slug": "sluzby", "title": "Služby", "sections": [
            nav, ph("sluzby"),
            {"type": "services", "variant": "hair-04-service-cards", "contentRef": "services"},
            {"type": "cta", "variant": "hair-04-cta-phone", "contentRef": "cta"},
            foot]},
        {"slug": "galerie", "title": "Galerie", "sections": [
            nav, ph("galerie"),
            {"type": "gallery", "variant": "hair-04-carousel", "contentRef": "gallery"},
            foot]},
        {"slug": "kontakt", "title": "Kontakt", "sections": [
            nav, ph("kontakt"),
            {"type": "contact", "variant": "hair-04-contact", "contentRef": "contact"},
            foot]},
    ],
    "content": {"default": "./content/cs.json"},
}
theme = {
    "colors": {"primary": "#6D4AFF", "secondary": "#17132A", "background": "#F5F4FA",
               "surface": "#FFFFFF", "text": "#17132A", "textMuted": "#6A6382",
               "accent": "#5233E0", "border": "#E4E1F2"},
    "typography": {"fontHeading": "'Space Grotesk', sans-serif", "fontBody": "'Epilogue', sans-serif", "scale": "comfortable"},
    "radius": {"sm": "10px", "md": "12px", "lg": "14px", "pill": "999px"},
    "spacing": {"personality": "spacious", "section": "comfortable"},
    "shadows": {"sm": "0 1px 3px rgba(23,19,42,0.07)", "md": "0 8px 24px rgba(23,19,42,0.10)", "lg": "0 18px 48px rgba(23,19,42,0.14)"},
    "animation": {"ease": "cubic-bezier(0.22,1,0.36,1)", "duration": "280ms", "intensity": "subtle"},
    "presets": {
        "pop": {"label": "Pop — elektrická violet (default)", "tokens": {
            "colorPrimary": "#6D4AFF", "colorAccent": "#5233E0", "colorSecondary": "#17132A",
            "colorBackground": "#F5F4FA", "colorSurface": "#FFFFFF", "colorText": "#17132A",
            "colorTextMuted": "#6A6382", "colorBorder": "#E4E1F2"}},
        "citrus": {"label": "Citrus — svěží oranžová", "tokens": {
            "colorPrimary": "#F0552B", "colorAccent": "#C93F1B", "colorSecondary": "#221510",
            "colorBackground": "#FAF6F3", "colorSurface": "#FFFFFF", "colorText": "#221510",
            "colorTextMuted": "#75665F", "colorBorder": "#EDE2DA"}},
        "mint": {"label": "Mint — chladná zelená", "tokens": {
            "colorPrimary": "#0F9D76", "colorAccent": "#0B7C5D", "colorSecondary": "#0F1D19",
            "colorBackground": "#F2F8F5", "colorSurface": "#FFFFFF", "colorText": "#0F1D19",
            "colorTextMuted": "#5F7069", "colorBorder": "#DCEAE3"}},
    },
}
(T / "template.json").write_text(json.dumps(template, ensure_ascii=False, indent=2) + "\n")
(T / "theme.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
print("✓ template.json + theme.json (stránky: %d)" % len(template["pages"]))
