#!/usr/bin/env python3
"""kids-01 / lang-01 — fail-safe pro scroll-reveal.

VADA: sekce startují na `opacity: 0` a čekají, až jim IntersectionObserver přidá třídu
`.vis`. U kids-01 se observer nespouštěl vůbec (`vis=false` i po plném proscrollování),
takže statistiky, benefity a kontakt byly pro návštěvníka TRVALE NEVIDITELNÉ — jen
barevné pásy. Konzole přitom mlčela, takže to projde všemi automatickými kontrolami.

FIX: do každého `useEffect` s observerem přidáme pojistku `setTimeout(… , 1200)`.
Když observer selže (nebo stránka scrolluje v jiném kontejneru než window), obsah se
po 1,2 s stejně odkryje. Progressive enhancement: animace je bonus, ne podmínka čitelnosti.

Idempotentní.
"""
import re, pathlib

SEC = pathlib.Path(__file__).resolve().parent.parent / "src/components/sections"

TARGETS = [
    ("StatsSection.tsx", ["StatsKids01", "StatsLang01"]),
    ("PromoSection.tsx", ["BenefitsKids01", "PromoLang01"]),
    ("ContactSection.tsx", ["ContactKids01"]),
    ("CtaSection.tsx", ["CtaKids01", "CtaLang01"]),
    ("AboutSection.tsx", ["AboutKids01"]),
    ("ServicesSection.tsx", ["ServicesKids01", "ServicesLang01"]),
    ("TeamSection.tsx", ["TeamKids01"]),
    ("TestimonialsSection.tsx", ["TestimonialsKids01"]),
    ("HeroSection.tsx", ["HeroKids01", "HeroLang01"]),
    ("FooterSection.tsx", ["FooterKids01", "FooterLang01"]),
]

MARK = "reveal-failsafe"


def fn_range(path, name):
    p = SEC / path
    lines = p.read_text().split("\n")
    s = next((i for i, l in enumerate(lines) if l.startswith("function " + name + "(")), None)
    if s is None:
        return None, None, None, None
    e = next(i for i in range(s + 1, len(lines)) if lines[i] == "}")
    return p, s, e, lines


def patch(path, name):
    p, s, e, lines = fn_range(path, name)
    if p is None:
        return None
    body = "\n".join(lines[s:e + 1])
    if MARK in body:
        return "= %s (už opraveno)" % name
    if "IntersectionObserver" not in body or "obs.observe(" not in body:
        return None
    # setter se jmenuje různě (setVis / setVisible / setShown…) — vytáhni ho z callbacku
    m = re.search(r'(set[A-Z]\w*)\(true\)', body)
    if not m:
        return "! %s — setter nenalezen" % name
    setter = m.group(1)
    # za `obs.observe(<el>);` přidej pojistku a uklidni ji v cleanupu
    new = re.sub(
        r'(\n(\s*)obs\.observe\(([A-Za-z0-9_.]+)\);)',
        r'\1\n\2// reveal-failsafe: kdyby observer nikdy nespustil, obsah nesmí zůstat neviditelný\n'
        r'\2const failsafe = setTimeout(() => ' + setter + r'(true), 1200);',
        body, count=1)
    if new == body:
        return "! %s — vzor obs.observe nenalezen" % name
    new = re.sub(r'return \(\) => obs\.disconnect\(\);',
                 'return () => { clearTimeout(failsafe); obs.disconnect(); };', new, count=1)
    if "clearTimeout(failsafe)" not in new:
        new = re.sub(r'(\n(\s*)return \(\) => \{)', r'\1 clearTimeout(failsafe);', new, count=1)
    p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
    return "✓ %s" % name


if __name__ == "__main__":
    print("fail-safe pro scroll-reveal (kids-01 / lang-01)")
    for path, names in TARGETS:
        for n in names:
            r = patch(path, n)
            if r:
                print("  " + r)
    print("hotovo.")
