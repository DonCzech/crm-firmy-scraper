#!/usr/bin/env python3
"""kids-01 + lang-01 — dokončení rozsahu „vylepšit + Webero credit".
1) WeberoCredit do patičky obou šablon
2) demo brand: template.json name byl „Lesní Smečka" / „Lingvista" (reálně znějící firmy),
   tenant_data_slots u nich držely i vlastní e-maily a telefony (ahoj@lesni-smecka.cz,
   775 388 210, kurzy@lingvista-akademie.cz, 602 987 543)
3) version 3.0.0 + tags v3 + mood presety v theme.json
Idempotentní.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEC = ROOT / "src/components/sections"

BRANDS = {
    "kids-01": {
        "name": "Demo Kroužky",
        "presets": {
            "forest": {"label": "Forest — lesní zelená (default)", "tokens": {
                "colorPrimary": "#2F7D46", "colorAccent": "#215C33", "colorSecondary": "#16281C",
                "colorBackground": "#F5FAF6", "colorSurface": "#FFFFFF", "colorText": "#16281C",
                "colorTextMuted": "#5E6F63", "colorBorder": "#DCE9DF"}},
            "sky": {"label": "Sky — hravá modrá", "tokens": {
                "colorPrimary": "#1E88D6", "colorAccent": "#1668A8", "colorSecondary": "#10222F",
                "colorBackground": "#F2F8FD", "colorSurface": "#FFFFFF", "colorText": "#10222F",
                "colorTextMuted": "#5C6B77", "colorBorder": "#D9E7F2"}},
            "sunset": {"label": "Sunset — teplá oranžová", "tokens": {
                "colorPrimary": "#E2701E", "colorAccent": "#B85714", "colorSecondary": "#2A1A10",
                "colorBackground": "#FDF7F2", "colorSurface": "#FFFFFF", "colorText": "#2A1A10",
                "colorTextMuted": "#79675B", "colorBorder": "#F0E2D6"}},
        },
    },
    "lang-01": {
        "name": "Demo Jazyková škola",
        "presets": {
            "indigo": {"label": "Indigo — studijní modrá (default)", "tokens": {
                "colorPrimary": "#3B4FB5", "colorAccent": "#2C3B8C", "colorSecondary": "#151A33",
                "colorBackground": "#F5F6FC", "colorSurface": "#FFFFFF", "colorText": "#151A33",
                "colorTextMuted": "#626A8A", "colorBorder": "#E1E4F2"}},
            "coral": {"label": "Coral — přátelská korálová", "tokens": {
                "colorPrimary": "#D9544E", "colorAccent": "#AE3E39", "colorSecondary": "#2B1614",
                "colorBackground": "#FDF6F5", "colorSurface": "#FFFFFF", "colorText": "#2B1614",
                "colorTextMuted": "#7C6663", "colorBorder": "#F1DFDD"}},
            "teal": {"label": "Teal — klidná tyrkysová", "tokens": {
                "colorPrimary": "#12776E", "colorAccent": "#0C5A53", "colorSecondary": "#0E211F",
                "colorBackground": "#F2F9F8", "colorSurface": "#FFFFFF", "colorText": "#0E211F",
                "colorTextMuted": "#5C6E6B", "colorBorder": "#D9EAE7"}},
        },
    },
}


def fn_range(path, name):
    p = SEC / path
    lines = p.read_text().split("\n")
    s = next((i for i, l in enumerate(lines) if l.startswith("function " + name + "(")), None)
    if s is None:
        return None, None, None, None
    e = next(i for i in range(s + 1, len(lines)) if lines[i] == "}")
    return p, s, e, lines


def footer_credit(fn):
    p, s, e, lines = fn_range("FooterSection.tsx", fn)
    if p is None:
        return print("  ! %s nenalezena" % fn)
    body = "\n".join(lines[s:e + 1])
    if "WeberoCredit" in body:
        return print("  = %s už má WeberoCredit" % fn)
    new = body.replace("</footer>",
                       '  <div style={{ display: "flex", justifyContent: "center", padding: "0 0 18px" }}><WeberoCredit /></div>\n    </footer>')
    if new == body:
        return print("  ! %s — </footer> nenalezen" % fn)
    p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
    print("  ✓ WeberoCredit → %s" % fn)


def manifest(key):
    T = ROOT / "src/templates" / key
    tpl = json.loads((T / "template.json").read_text())
    old = tpl.get("name")
    tpl["name"] = BRANDS[key]["name"]
    tpl["version"] = "3.0.0"
    tpl["tags"] = ["v3"]
    (T / "template.json").write_text(json.dumps(tpl, ensure_ascii=False, indent=2) + "\n")
    th = json.loads((T / "theme.json").read_text())
    th["presets"] = BRANDS[key]["presets"]
    (T / "theme.json").write_text(json.dumps(th, ensure_ascii=False, indent=2) + "\n")
    print("  ✓ %s: name %r → %r, v3.0.0 + tags, %d presetů" % (key, old, tpl["name"], len(th["presets"])))


def demo_contacts(key):
    """Reálně znějící kontakty v cs.json → demo standard."""
    p = ROOT / "src/templates" / key / "content/cs.json"
    raw = p.read_text()
    subs = [
        (r'ahoj@lesni-smecka\.cz', 'info@demo.cz'),
        (r'kurzy@lingvista-akademie\.cz', 'info@demo.cz'),
        (r'775\s?388\s?210', '704 123 456'),
        (r'602\s?987\s?543', '704 123 456'),
        (r'Přírodní 7[^"]*?Praha 5[^"]*?(?=")', 'Ukázková 123, 110 00 Praha 1'),
        (r'Přírodní 7', 'Ukázková 123'),
        (r'Náměstí Svobody 14, 602 00 Brno', 'Ukázková 123, 110 00 Praha 1'),
        (r'(facebook|instagram|linkedin|youtube)\.com/lesni-smecka', r'\1.com/demo'),
        (r'(facebook|instagram|linkedin|youtube)\.com/lingvista[a-z-]*', r'\1.com/demo'),
        (r'Lingvista Jazyková akademie', 'Demo Jazyková škola'),
        # čeština skloňuje — pokrýt VŠECHNY pády, ne jen 1. (past: „do Lesní Smečky")
        (r'Lesní [Ss]meč(ka|ky|ce|ku|ko|kou)', 'Demo Kroužky'),
        (r'MiniSmečka', 'Mini Kroužek'),
        (r'Smeč(ka|ky|ce|ku|ko|kou)', 'Parta'),
        (r'Lesní Smečka', 'Demo Kroužky'),
        (r'Lingvista akademie', 'Demo Jazyková škola'),
        (r'Lingvista', 'Demo Jazyková škola'),
    ]
    n = 0
    for pat, rep in subs:
        raw, c = re.subn(pat, rep, raw)
        n += c
    if n:
        p.write_text(raw)
    print("  ✓ %s: %d náhrad kontaktů/brandu v cs.json" % (key, n))


def lang_footer_fix():
    """Patička lang-01 měla DVA sloupce „Kontakt", druhý prázdný; copyright se po
    přejmenování brandu zdvojil („Demo Jazyková škola Jazyková akademie")."""
    import json as _j
    p = ROOT / "src/templates/lang-01/content/cs.json"
    d = _j.loads(p.read_text()); f = d.get("footer", {})
    changed = False
    if "Jazyková akademie" in str(f.get("copyright", "")):
        f["copyright"] = "© 2026 Demo Studio s.r.o. | IČO: 12345678 | DIČ: CZ12345678"; changed = True
    for g in f.get("navGroups", []):
        if g.get("label") == "Kontakt" and not g.get("links"):
            g["label"] = "Škola"
            g["links"] = [{"label": "Jak to funguje", "href": "/jak-to-funguje"},
                          {"label": "Letní tábory", "href": "/tabory"},
                          {"label": "Kontakt", "href": "/kontakt"}]
            changed = True
    if changed:
        p.write_text(_j.dumps(d, ensure_ascii=False, indent=2) + "\n")
    print("  %s lang-01 patička" % ("✓" if changed else "="))


if __name__ == "__main__":
    print("kids-01 + lang-01 — dokončení")
    footer_credit("FooterKids01")
    footer_credit("FooterLang01")
    for k in ("kids-01", "lang-01"):
        manifest(k)
        demo_contacts(k)
    lang_footer_fix()
    print("hotovo.")
