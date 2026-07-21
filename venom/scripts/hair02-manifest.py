#!/usr/bin/env python3
"""hair-02 V3 — template.json (stránky dle DB, version 3.0.0, tags v3) + theme.json
(tokens „Blush & Clay" + 3 mood presety). Idempotentní přepis obou souborů.
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
T = ROOT / "src/templates/hair-02"


def navbar():
    return {"type": "navbar", "variant": "hair-02-navbar", "contentRef": "navbar"}


def footer():
    return {"type": "footer", "variant": "hair-02-footer", "contentRef": "footer"}


def page_hero(slug):
    return {"type": "hero", "variant": "hero-hair-02-page", "contentRef": "pages.%s.hero" % slug}


template = {
    "$schema": "../../schemas/template.schema.json",
    "key": "hair-02",
    "name": "Salon Blush",
    "industry": "hair",
    "skeleton": "service-personal",
    "version": "3.0.0",
    "tags": ["v3"],
    "baseTemplate": None,
    "description": "V3 „Blush & Clay“ — kadeřnický salon v hřejivé pastelové paletě (clay rose #C0685C, paper #FBF6F3, espresso #3B2B27), Newsreader + Schibsted Grotesk, radius 20 a pill CTA. Cinematic slider hero, foto karty služeb s cenou, galerie práce, tmavá sekce recenzí s iniciálovými avatary, kontakt s reálným formulářem a inline rezervace Rezora.",
    "sectionOrderNote": "Rytmus světlá/tmavá dle V3_PLAYBOOK §1: hero (tmavý) → about (paper) → služby (bílá) → promo (wash) → galerie (paper) → recenze (tmavé) → rezervace → kontakt (bílá) → footer (tmavý). Žádné dvě tmavé sekce za sebou.",
    "skippedSections": [
        {"pos": 5, "name": "Pricing", "reason": "ceny jsou přímo na foto kartách služeb — samostatný ceník by je duplikoval"},
        {"pos": 7, "name": "Team", "reason": "salon prezentuje tým v příběhu na /o-nas, ne samostatnou sekcí na homepage"},
        {"pos": 11, "name": "FAQ", "reason": "dotazy řeší rezervační widget a kontaktní formulář"},
    ],
    "extraSections": [
        {"type": "cta", "variant": "cta-hair-02-promo",
         "reason": "blush wash pás drží rytmus mezi dvěma světlými sekcemi a nese promo péče o barvu"},
        {"type": "rezora-widget",
         "reason": "inline rezervační widget Rezora — objednání přímo na stránce bez přesměrování"},
        {"type": "contact", "variant": "contact-hair-02-location",
         "reason": "kostra service-personal nemá kontaktní sekci s formulářem; salon ji potřebuje pro poptávky mimo rezervační okno"},
    ],
    "i18n": {"default": "cs", "supported": ["cs"]},
    "pages": [
        {
            "slug": "home", "isHomepage": True, "title": "Domů",
            "sections": [
                navbar(),
                {"type": "hero", "variant": "hero-hair-02-slider", "contentRef": "hero"},
                {"type": "about", "variant": "about-hair-02-story", "contentRef": "about"},
                {"type": "services", "variant": "hair-02-services", "contentRef": "services"},
                {"type": "cta", "variant": "cta-hair-02-promo", "contentRef": "promo"},
                {"type": "gallery", "variant": "hair-02-gallery", "contentRef": "gallery"},
                {"type": "testimonials", "variant": "hair-02-testimonials", "contentRef": "testimonials"},
                {"type": "rezora-widget", "variant": "editorial", "contentRef": "home.rezervace"},
                {"type": "contact", "variant": "contact-hair-02-location", "contentRef": "contact-location"},
                footer(),
            ],
        },
        {
            "slug": "o-nas", "title": "O salonu",
            "sections": [navbar(), page_hero("o-nas"),
                         {"type": "about", "variant": "about-hair-02-story", "contentRef": "about"},
                         {"type": "testimonials", "variant": "hair-02-testimonials", "contentRef": "testimonials"},
                         footer()],
        },
        {
            "slug": "galerie", "title": "Galerie",
            "sections": [navbar(), page_hero("galerie"),
                         {"type": "gallery", "variant": "hair-02-gallery", "contentRef": "gallery"},
                         footer()],
        },
        {
            "slug": "recenze", "title": "Recenze",
            "sections": [navbar(), page_hero("recenze"),
                         {"type": "testimonials", "variant": "hair-02-testimonials", "contentRef": "testimonials"},
                         footer()],
        },
        {
            "slug": "kontakt", "title": "Kontakt",
            "sections": [navbar(), page_hero("kontakt"),
                         {"type": "contact", "variant": "contact-hair-02-location", "contentRef": "contact-location"},
                         footer()],
        },
    ],
    "content": {"default": "./content/cs.json"},
}

theme = {
    "colors": {
        "primary": "#C0685C",
        "secondary": "#3B2B27",
        "background": "#FBF6F3",
        "surface": "#FFFFFF",
        "text": "#2A211E",
        "textMuted": "#7C6B64",
        "accent": "#9E5147",
        "border": "#EADDD6",
    },
    "typography": {
        "fontHeading": "'Newsreader', Georgia, serif",
        "fontBody": "'Schibsted Grotesk', sans-serif",
        "scale": "comfortable",
    },
    "radius": {"sm": "12px", "md": "16px", "lg": "20px", "pill": "999px"},
    "spacing": {"personality": "spacious", "section": "comfortable"},
    "shadows": {
        "sm": "0 1px 3px rgba(42,33,30,0.07)",
        "md": "0 8px 24px rgba(42,33,30,0.10)",
        "lg": "0 18px 48px rgba(42,33,30,0.14)",
    },
    "animation": {"ease": "cubic-bezier(0.22,1,0.36,1)", "duration": "280ms", "intensity": "subtle"},
    "presets": {
        "blush": {
            "label": "Blush — hřejivá clay rose (default)",
            "tokens": {
                "colorPrimary": "#C0685C", "colorAccent": "#9E5147", "colorSecondary": "#3B2B27",
                "colorBackground": "#FBF6F3", "colorSurface": "#FFFFFF", "colorText": "#2A211E",
                "colorTextMuted": "#7C6B64", "colorBorder": "#EADDD6",
            },
        },
        "sage": {
            "label": "Sage — klidná zelená",
            "tokens": {
                "colorPrimary": "#6F8A6A", "colorAccent": "#55704F", "colorSecondary": "#232C21",
                "colorBackground": "#F7F8F4", "colorSurface": "#FFFFFF", "colorText": "#1E2620",
                "colorTextMuted": "#6C7568", "colorBorder": "#E1E6DC",
            },
        },
        "plum": {
            "label": "Plum — sytá švestková",
            "tokens": {
                "colorPrimary": "#8A5A72", "colorAccent": "#6C4257", "colorSecondary": "#2B1D25",
                "colorBackground": "#FAF5F7", "colorSurface": "#FFFFFF", "colorText": "#251A1F",
                "colorTextMuted": "#77676E", "colorBorder": "#EBDEE4",
            },
        },
    },
}

(T / "template.json").write_text(json.dumps(template, ensure_ascii=False, indent=2) + "\n")
(T / "theme.json").write_text(json.dumps(theme, ensure_ascii=False, indent=2) + "\n")
print("zapsáno template.json + theme.json (stránky: %d)" % len(template["pages"]))
