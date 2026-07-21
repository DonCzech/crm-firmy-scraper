#!/usr/bin/env python3
"""hair-02 V3 — registrace variant do src/sections/variants.ts.
POZOR (V3_PLAYBOOK §2.4): v `description` NIKDY `pole[]` následované čárkou — rozbije parser.
Idempotentní: existující klíč jen přepíše.
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
VAR = ROOT / "src/sections/variants.ts"

# (klíč nové varianty, kotevní klíč za který vložit, řádek)
ENTRIES = [
    ("hero-hair-02-slider", None,
     '    { key: "hero-hair-02-slider", label: "Hero – cinematic slider (hair-02)", description: "V3 Blush & Clay: fullbleed crossfade slider 92vh, tmavý scrim, Newsreader H1 s kurzívním clay řádkem, dvojice CTA (clay pill + ghost), proužkové dots — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hero-hair-02-page", "hero-hair-02-slider",
     '    { key: "hero-hair-02-page", label: "Hero – podstránka (hair-02)", description: "V3 Blush & Clay: paper pozadí, drobečková navigace, Newsreader H1, podtitul a široký foto pás radius 20 — podstránkový hero hair-02", industries: ["hair"] },'),
    ("about-hair-02-story", None,
     '    { key: "about-hair-02-story", label: "O nás – split s foto rámem (hair-02)", description: "V3 Blush & Clay: paper bg, vlevo eyebrow + Newsreader H2 + odstavce + statistiky na vertikálních hairlines + clay pill CTA, vpravo foto 4/5 s posunutým wash rámem; dole textové wordmarky značek — hair-02 Salon Blush", industries: ["hair"] },'),
    ("cta-hair-02-promo", None,
     '    { key: "cta-hair-02-promo", label: "CTA – wash pás s fotkou (hair-02)", description: "V3 Blush & Clay: blush wash pás pro rytmus mezi světlými sekcemi; vlevo eyebrow + Newsreader H2 + text + clay pill CTA, vpravo čtvercová fotka radius 20 — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hair-02-services", "hair-numbered-cards",
     '    { key: "hair-02-services", label: "Služby – foto karty s cenou (hair-02)", description: "V3 Blush & Clay: bílé bg; eyebrow + Newsreader H2 + podtitul; karty s fotkou 16/10 a hover zoomem, číslo v rohu, hairline řádek s cenou a délkou úkonu — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hair-02-gallery", "gallery-universal",
     '    { key: "hair-02-gallery", label: "Galerie – mřížka 4 sloupce s akcenty (hair-02)", description: "V3 Blush & Clay: paper bg; eyebrow + Newsreader H2; mřížka fotek 3/4 s hover zoomem, první a šestá přes dva sloupce jako akcent — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hair-02-testimonials", "hair-01-cards",
     '    { key: "hair-02-testimonials", label: "Reference – tmavá sekce s iniciálami (hair-02)", description: "V3 Blush & Clay: tmavé espresso bg pro rytmus; eyebrow + Newsreader H2 vlevo a velké skóre vpravo; tři sloupce dělené hairlines, clay hvězdy a iniciálové avatary — hair-02 Salon Blush", industries: ["hair"] },'),
    ("contact-hair-02-location", None,
     '    { key: "contact-hair-02-location", label: "Kontakt – hairline údaje + formulář (hair-02)", description: "V3 Blush & Clay: vlevo eyebrow + Newsreader H2 + hairline řádky s telefonem, e-mailem, adresou a otevírací dobou + foto salonu; vpravo wash karta s reálným formulářem, honeypotem a stavy odesílání — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hair-02-footer", "hair-01-footer",
     '    { key: "hair-02-footer", label: "Patička – tmavá espresso + WeberoCredit (hair-02)", description: "V3 Blush & Clay: espresso bg; Newsreader heading s clay pill CTA; čtyři sloupce (navigace / kontakt / otevírací doba / sociální sítě); copyright bar s WeberoCredit — hair-02 Salon Blush", industries: ["hair"] },'),
    ("hair-02-navbar", None,
     '    { key: "hair-02-navbar", label: "Navigace – blur sticky s clay CTA (hair-02)", description: "V3 Blush & Clay: průhledný blur bar, Newsreader wordmark s clay tečkou, underline-slide linky, telefon, clay pill CTA; fullscreen overlay menu se staggerem a sticky mobilní CTA lišta — hair-02 Salon Blush", industries: ["hair"] },'),
]

src = VAR.read_text()
lines = src.split("\n")

for key, anchor, line in ENTRIES:
    idx = next((i for i, l in enumerate(lines) if ('key: "%s"' % key) in l), None)
    if idx is not None:
        lines[idx] = line
        print("  ↻ %s" % key)
        continue
    if anchor is None:
        raise SystemExit("chybí kotva pro nový klíč %s" % key)
    aidx = next(i for i, l in enumerate(lines) if ('key: "%s"' % anchor) in l)
    lines.insert(aidx + 1, line)
    print("  + %s (za %s)" % (key, anchor))

VAR.write_text("\n".join(lines))
print("zapsáno:", VAR.relative_to(ROOT))
