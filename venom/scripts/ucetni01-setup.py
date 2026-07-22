#!/usr/bin/env python3
"""ucetni-01 V3 „Navy & Gold" — cs.json (fotky, blog, page hero obsah, foto karty služeb)
+ variants.ts + template.json/theme.json. Idempotentní.
Původní obsah byl demo-čistý (email@demo.cz, Ukázková 123, IČO 12345678) — měnily se
hlavně fotky, struktura služeb a blog (dřív generický 'default' s cizími články).
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / "src/templates/ucetni-01"
VAR = ROOT / "src/sections/variants.ts"
U = "https://images.unsplash.com/photo-"
img = lambda pid, w, h: "%s%s?w=%d&h=%d&fit=crop&auto=format&q=80" % (U, pid, w, h)

# vizuálně ověřeno montage gridem 2026-07-22
P_SIGN = "1450101499163-c8848c66ca85"    # podpis dokumentů
P_TAX = "1554224155-6726b3ff858f"        # daňové formuláře a kalkulačka
P_MEET = "1517245386807-bb43f82c33c4"    # porada u notebooku
P_DASH = "1460925895917-afdab827c52f"    # notebook s analytickým přehledem
P_HIGH5 = "1600880292203-757bb62b4baf"   # spokojení klienti u stolu
P_TEAM = "1521737711867-e3b97375f902"    # tým v kanceláři
P_BOARD = "1542744173-8e7e53415bb0"      # jednací místnost
P_CHART = "1591696205602-2f950c417cb9"   # spojnicový graf
P_SCREEN = "1526628953301-3e589a6a8b74"  # dashboard s metrikami
P_NOTES = "1531403009284-440f080d1e12"   # plánování na tabuli
P_CONSULT = "1454165804606-c3d57bc86b40"  # konzultace nad podklady

d = json.loads((T / "content/cs.json").read_text())

d["navbar"]["links"] = [
    {"label": "Úvod", "href": "/"},
    {"label": "O nás", "href": "/o-nas"},
    {"label": "Služby", "href": "/sluzby"},
    {"label": "Ceník", "href": "/cenik"},
    {"label": "Blog", "href": "/blog"},
    {"label": "Kontakt", "href": "/kontakt"},
]
d["hero"]["imageUrl"] = img(P_HIGH5, 1200, 900)
d["hero"]["ctaHref"] = "/kontakt"

d["services"] = {
    "tagline": "Služby",
    "title": "Co pro vás uděláme",
    "lead": "Nabízíme plnou škálu účetních a daňových služeb — od živnostníka po velkou firmu.",
    "subtitle": "Nabízíme plnou škálu účetních a daňových služeb — od živnostníka po velkou firmu.",
    "items": [
        {"name": "Podvojné účetnictví", "title": "Podvojné účetnictví",
         "description": "Vedeme podvojné i jednoduché účetnictví přesně, spolehlivě a v souladu s aktuální legislativou.",
         "image": img(P_SIGN, 900, 600), "price": "od 2 500 Kč / měsíc", "note": "dle počtu dokladů", "icon": "document"},
        {"name": "Daňová přiznání", "title": "Daňová přiznání",
         "description": "Zpracujeme daňová přiznání za fyzické i právnické osoby a zastoupíme vás před finančním úřadem.",
         "image": img(P_TAX, 900, 600), "price": "od 3 900 Kč", "note": "jednorázově", "icon": "receipt"},
        {"name": "Mzdy a personalistika", "title": "Mzdy a personalistika",
         "description": "Kompletní mzdová agenda, přihlášky k pojištění, pracovní smlouvy a roční zúčtování daně.",
         "image": img(P_MEET, 900, 600), "price": "od 290 Kč / zaměstnanec", "note": "měsíčně", "icon": "users"},
        {"name": "Finanční controlling", "title": "Finanční controlling",
         "description": "Analýza cash-flow, reporty pro vedení firmy a poradenství při strategických rozhodnutích.",
         "image": img(P_DASH, 900, 600), "price": "individuálně", "note": "dle rozsahu", "icon": "chart"},
    ],
}

d["about"]["imageUrl"] = img(P_TEAM, 1100, 850)
d["about"]["image"] = img(P_TEAM, 1100, 850)
d["about"]["ctaHref"] = "/o-nas"

# reference: zkrácená příjmení dle demo standardu
roles = [("Radek H.", "Jednatel stavební firmy"), ("Lucie M.", "Majitelka e-shopu"), ("Tomáš P.", "OSVČ, IT konzultant")]
texts = [
    "Ušetřili nám nejen čas, ale hlavně nervy. Vždycky vědí, co dělají, a výsledky mluví za vše.",
    "Přešla jsem k nim po roce chaosu u předchozí účetní. Poprvé mám v číslech pořádek a vím, na čem jsem.",
    "Daňové přiznání vyřešili za dva dny včetně přehledů. Komunikace e-mailem, žádné běhání po úřadech.",
]
d["testimonials"]["items"] = [
    {"name": n, "role": r, "text": t, "rating": "5"} for (n, r), t in zip(roles, texts)
]

d["contact"]["ctaHref"] = "/kontakt"

d["blog"] = {
    "tagline": "Blog",
    "title": "Z našeho blogu",
    "buttonText": "Všechny články",
    "posts": [
        {"title": "Paušální daň v roce 2026: vyplatí se vám?", "date": "16. 7. 2026", "href": "/blog",
         "excerpt": "Spočítali jsme tři modelové situace OSVČ a ukazujeme, kdy paušál skutečně ušetří a kdy naopak prodělá.",
         "image": img(P_CHART, 900, 600)},
        {"title": "Co si připravit před předáním účetnictví", "date": "9. 7. 2026", "href": "/blog",
         "excerpt": "Checklist dokladů a přístupů, díky kterému zvládneme převzetí agendy do týdne bez výpadku.",
         "image": img(P_NOTES, 900, 600)},
        {"title": "Reporty, které dávají smysl majiteli, ne úřadu", "date": "28. 6. 2026", "href": "/blog",
         "excerpt": "Tři ukazatele, které sledujeme klientům každý měsíc — a proč zisk mezi nimi není na prvním místě.",
         "image": img(P_SCREEN, 900, 600)},
    ],
}

d["pages"] = {
    "o-nas": {"seoTitle": "O nás | Bilance & Co.", "seoDescription": "Tým zkušených účetních a daňových poradců.",
              "hero": {"title": "O nás", "subtitle": "Jsme tým, který bere vaše čísla vážně — a vysvětlí vám je lidsky.", "backgroundImage": img(P_BOARD, 1800, 700)}},
    "sluzby": {"seoTitle": "Služby | Bilance & Co.", "seoDescription": "Účetnictví, daně, mzdy a controlling.",
               "hero": {"title": "Služby", "subtitle": "Od vedení účetnictví po finanční controlling pro vedení firmy.", "backgroundImage": img(P_CONSULT, 1800, 700)}},
    "cenik": {"seoTitle": "Ceník | Bilance & Co.", "seoDescription": "Orientační ceny účetních služeb.",
              "hero": {"title": "Ceník", "subtitle": "Orientační ceny. Konečnou nabídku připravíme podle objemu dokladů.", "backgroundImage": img(P_TAX, 1800, 700)}},
    "blog": {"seoTitle": "Blog | Bilance & Co.", "seoDescription": "Praktické články o daních a účetnictví.",
             "hero": {"title": "Blog", "subtitle": "Praktické články o daních, mzdách a vedení firmy.", "backgroundImage": img(P_CHART, 1800, 700)}},
    "kontakt": {"seoTitle": "Kontakt | Bilance & Co.", "seoDescription": "Kontaktujte nás pro nezávaznou konzultaci.",
                "hero": {"title": "Kontakt", "subtitle": "Ozvěte se — první konzultace je nezávazná a zdarma.", "backgroundImage": img(P_HIGH5, 1800, 700)}},
}
d.setdefault("home", {})["rezervace"] = {"title": "Domluvte si schůzku",
                                         "subtitle": "Nezávazná konzultace účetnictví a daní ve volném termínu.",
                                         "providerSlug": "", "apiBaseUrl": ""}

(T / "content/cs.json").write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
print("✓ cs.json")

# ── registrace ────────────────────────────────────────────────────────────────
ENTRIES = [
    ("hero-ucetni-01-page", "ucetni-01-hero",
     '    { key: "hero-ucetni-01-page", label: "Hero – podstránka (ucetni-01)", description: "V3 Navy & Gold: světlý pás s drobečkovou navigací, Plus Jakarta H1 a širokým foto pásem — podstránkový hero ucetni-01 (dřív se na podstránkách používal homepage hero)", industries: ["ucetni"] },'),
    ("ucetni-01-services", None,
     '    { key: "ucetni-01-services", label: "Služby – foto karty s cenou (ucetni-01)", description: "V3 Navy & Gold: bílé bg, karty s fotkou 16/10 a hover liftem, číslo, popis a hairline řádek s cenou; nahrazuje ikonky v tónovaných čtverečcích — ucetni-01 Bilance & Co.", industries: ["ucetni"] },'),
    ("ucetni-01-blog", "hair-04-blog",
     '    { key: "ucetni-01-blog", label: "Blog – karty s hover liftem (ucetni-01)", description: "V3 Navy & Gold: karty s fotkou 3/2, navy datem a hairline patičkou; nahrazuje generický výpis, který renderoval cizí demo články — ucetni-01 Bilance & Co.", industries: ["ucetni"] },'),
]
lines = VAR.read_text().split("\n")
for key, anchor, line in ENTRIES:
    i = next((n for n, l in enumerate(lines) if ('key: "%s"' % key) in l), None)
    if i is not None:
        lines[i] = line
    else:
        a = next(n for n, l in enumerate(lines) if ('key: "%s"' % anchor) in l)
        lines.insert(a + 1, line)
VAR.write_text("\n".join(lines))
print("✓ variants.ts")

# ── manifest ──────────────────────────────────────────────────────────────────
tpl = json.loads((T / "template.json").read_text())
tpl["version"] = "3.0.0"
tpl["tags"] = ["v3"]
tpl["description"] = ("V3 „Navy & Gold“ — účetní a daňová kancelář v důvěryhodné paletě "
                      "(navy #17395E, chladná paper #F4F6F9, inkoust #0C1B2A), Plus Jakarta Sans + Inter. "
                      "Data-driven jazyk: foto karty služeb s cenou, pás čísel, reference, blog s praktickými "
                      "články a kontakt s otevírací dobou. Podstránky mají vlastní page hero.")
nav = {"type": "navbar", "variant": "ucetni-01-navbar", "contentRef": "navbar"}
foot = {"type": "footer", "variant": "ucetni-01-footer", "contentRef": "footer"}
ph = lambda s: {"type": "hero", "variant": "hero-ucetni-01-page", "contentRef": "pages.%s.hero" % s}
tpl["pages"] = [
    {"slug": "home", "isHomepage": True, "title": "Domů", "sections": [
        nav,
        {"type": "hero", "variant": "ucetni-01-hero", "contentRef": "hero"},
        {"type": "services", "variant": "ucetni-01-services", "contentRef": "services"},
        {"type": "stats", "variant": "ucetni-01-stats", "contentRef": "stats"},
        {"type": "about", "variant": "ucetni-01-about", "contentRef": "about"},
        {"type": "testimonials", "variant": "ucetni-01-testimonials", "contentRef": "testimonials"},
        {"type": "blog-preview", "variant": "ucetni-01-blog", "contentRef": "blog"},
        {"type": "rezora-widget", "variant": "clinical", "contentRef": "home.rezervace"},
        {"type": "contact", "variant": "ucetni-01-contact", "contentRef": "contact"},
        foot]},
    {"slug": "o-nas", "title": "O nás", "sections": [
        nav, ph("o-nas"),
        {"type": "about", "variant": "ucetni-01-about", "contentRef": "about"},
        {"type": "stats", "variant": "ucetni-01-stats", "contentRef": "stats"},
        {"type": "testimonials", "variant": "ucetni-01-testimonials", "contentRef": "testimonials"},
        foot]},
    {"slug": "sluzby", "title": "Služby", "sections": [
        nav, ph("sluzby"),
        {"type": "services", "variant": "ucetni-01-services", "contentRef": "services"},
        foot]},
    {"slug": "cenik", "title": "Ceník", "sections": [
        nav, ph("cenik"),
        {"type": "services", "variant": "ucetni-01-services", "contentRef": "services"},
        foot]},
    {"slug": "blog", "title": "Blog", "sections": [
        nav, ph("blog"),
        {"type": "blog-preview", "variant": "ucetni-01-blog", "contentRef": "blog"},
        foot]},
    {"slug": "kontakt", "title": "Kontakt", "sections": [
        nav, ph("kontakt"),
        {"type": "contact", "variant": "ucetni-01-contact", "contentRef": "contact"},
        foot]},
]
(T / "template.json").write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n")

theme = json.loads((T / "theme.json").read_text())
theme["colors"] = {"primary": "#17395E", "secondary": "#0C1B2A", "background": "#F4F6F9",
                   "surface": "#FFFFFF", "text": "#0C1B2A", "textMuted": "#5A6779",
                   "accent": "#0F2942", "border": "#E2E7EE"}
theme["typography"] = {"fontHeading": "'Plus Jakarta Sans', sans-serif", "fontBody": "'Inter', sans-serif", "scale": "comfortable"}
theme["presets"] = {
    "navy": {"label": "Navy — důvěryhodná modrá (default)", "tokens": {
        "colorPrimary": "#17395E", "colorAccent": "#0F2942", "colorSecondary": "#0C1B2A",
        "colorBackground": "#F4F6F9", "colorSurface": "#FFFFFF", "colorText": "#0C1B2A",
        "colorTextMuted": "#5A6779", "colorBorder": "#E2E7EE"}},
    "emerald": {"label": "Emerald — finanční zelená", "tokens": {
        "colorPrimary": "#0B6B4F", "colorAccent": "#08543D", "colorSecondary": "#0B1F19",
        "colorBackground": "#F3F8F5", "colorSurface": "#FFFFFF", "colorText": "#0B1F19",
        "colorTextMuted": "#5C6E67", "colorBorder": "#DDEAE3"}},
    "graphite": {"label": "Graphite — střízlivá grafitová", "tokens": {
        "colorPrimary": "#3F4A57", "colorAccent": "#2A323C", "colorSecondary": "#171B21",
        "colorBackground": "#F5F6F7", "colorSurface": "#FFFFFF", "colorText": "#171B21",
        "colorTextMuted": "#646D78", "colorBorder": "#E3E5E8"}},
}
(T / "theme.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
print("✓ template.json (%d stránek) + theme.json" % len(tpl["pages"]))
