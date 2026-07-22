#!/usr/bin/env python3
"""malir-02 V3 remaster — chirurgické opravy (design už byl solidní, měnil se hlavně systém).
1) tokenizace natvrdo zapsaných hexů → var(--color-*, #fallback)  [nutné pro mood presety a Studio]
2) Poppins → Sora + Rubik (vlastní fontová dvojice, žádná jiná šablona je nemá)
3) WeberoCredit do patičky
4) recenze: stock portrét → iniciálový avatar (REMASTER_PLAYBOOK §1)
5) kontakt: /api/contact → /api/demo/<slug>/contact (tenantový endpoint)
Idempotentní.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEC = ROOT / "src/components/sections"

FNS = {
    "NavbarSection.tsx": ["NavbarMalir02"],
    "HeroSection.tsx": ["HeroMalir02", "HeroMalir02Page"],
    "AboutSection.tsx": ["AboutMalir02"],
    "ServicesSection.tsx": ["ServicesMalir02", "PricingMalir02"],
    "PromoSection.tsx": ["PromoMalir02"],
    "GallerySection.tsx": ["GalleryMalir02"],
    "TestimonialsSection.tsx": ["TestimonialsMalir02"],
    "ContactSection.tsx": ["ContactMalir02"],
    "FooterSection.tsx": ["FooterMalir02"],
}

# hex → CSS proměnná (stavové barvy #ff7070/#7ee37e vědomě NEtokenizujeme)
TOKENS = [
    ("#ff914d", "var(--color-primary, #ff914d)"),
    ("#e07a30", "var(--color-accent, #e07a30)"),
    ("#1a1a1a", "var(--color-secondary, #1a1a1a)"),
    ("#232323", "var(--color-text, #232323)"),
    ("#828282", "var(--color-text-muted, #828282)"),
    ("#e4e4e4", "var(--color-border, #e4e4e4)"),
    ("#fafafa", "var(--color-bg, #fafafa)"),
    ("#f7f7f7", "var(--color-bg, #f7f7f7)"),
]


def fn_range(path, name):
    p = SEC / path
    lines = p.read_text().split("\n")
    s = next((i for i, l in enumerate(lines) if l.startswith("function " + name + "(")), None)
    if s is None:
        return None, None, None, lines
    e = next(i for i in range(s + 1, len(lines)) if lines[i] == "}")
    return p, s, e, lines


def tokenize(path, name):
    p, s, e, lines = fn_range(path, name)
    if p is None:
        print("  ! %s nenalezena" % name)
        return
    body = "\n".join(lines[s:e + 1])
    before = body
    for hexv, var in TOKENS:
        # nenahrazuj to, co už je uvnitř var(...) fallbacku
        body = re.sub(r'(?<!, )' + re.escape(hexv) + r'(?![0-9a-fA-F])', var, body)
        body = body.replace("var(--color-primary, var(--color-primary, ", "var(--color-primary, ")
    # oprava dvojitého zabalení
    for _ in range(3):
        body = re.sub(r'var\((--color-[a-z-]+), var\(--color-[a-z-]+, (#[0-9a-fA-F]{6})\)\)', r'var(\1, \2)', body)
    if body != before:
        p.write_text("\n".join(lines[:s] + body.split("\n") + lines[e + 1:]))
        print("  ✓ tokenizace %s" % name)
    else:
        print("  = %s už tokenizováno" % name)


def swap_fonts():
    """Poppins → Sora (nadpisy) + Rubik (text) ve všech malir-02 blocích."""
    changed = 0
    for path in FNS:
        p = SEC / path
        src = p.read_text()
        new = src.replace(
            "family=Poppins:wght@400;500;600;700&display=swap",
            "family=Sora:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700&display=swap")
        if new != src:
            p.write_text(new); changed += 1
    print("  ✓ Google Fonts link přepsán v %d souborech" % changed)


def swap_font_consts():
    """POPPINS const → var(--font-body, 'Rubik'…); nadpisy dostanou Sora scoped pravidlem.
    (Inline styly na nadpisech by CSS třídu přebily — proto !important, viz V3_PLAYBOOK §2.1.)"""
    for path, names in FNS.items():
        for n in names:
            p, s, e, lines = fn_range(path, n)
            if p is None:
                continue
            body = "\n".join(lines[s:e + 1])
            new = body.replace('"\'Poppins\', sans-serif"', '"var(--font-body, \'Rubik\', sans-serif)"')
            if new != body:
                p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
                print("  ✓ font const %s" % n)

    # scoped pravidlo pro nadpisy do navbaru (je na každé stránce)
    p, s, e, lines = fn_range("NavbarSection.tsx", "NavbarMalir02")
    body = "\n".join(lines[s:e + 1])
    marker = "[data-template=\"malir-02\"] h1"
    if marker not in body:
        rule = ("      <style>{`\n"
                "        [data-template=\"malir-02\"] h1, [data-template=\"malir-02\"] h2,\n"
                "        [data-template=\"malir-02\"] h3, [data-template=\"malir-02\"] h4 {\n"
                "          font-family: var(--font-heading, 'Sora', sans-serif) !important;\n"
                "          letter-spacing: -0.02em;\n"
                "        }\n"
                "      `}</style>")
        idx = next(i for i in range(s, e) if "family=Sora" in lines[i])
        lines.insert(idx + 1, rule)
        p.write_text("\n".join(lines))
        print("  ✓ Sora pravidlo pro nadpisy (scoped na data-template)")
    else:
        print("  = Sora pravidlo už existuje")


def footer_credit():
    p, s, e, lines = fn_range("FooterSection.tsx", "FooterMalir02")
    body = "\n".join(lines[s:e + 1])
    if "WeberoCredit" in body:
        print("  = WeberoCredit už v patičce")
        return
    # vlož vedle copyrightu
    m = re.search(r'^(\s*)\{copyright && \(|^(\s*)<span[^>]*>\{copyright\}', body, re.M)
    new = body.replace("</footer>", "  <div style={{ display: \"flex\", justifyContent: \"center\", padding: \"0 0 20px\" }}><WeberoCredit /></div>\n    </footer>")
    if new == body:
        print("  ! nepodařilo se vložit WeberoCredit — zkontroluj ručně")
        return
    p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
    print("  ✓ WeberoCredit do patičky")


def contact_endpoint():
    p, s, e, lines = fn_range("ContactSection.tsx", "ContactMalir02")
    body = "\n".join(lines[s:e + 1])
    changed = False
    if '"/api/contact"' in body:
        body = body.replace('fetch("/api/contact", {', 'fetch(`/api/demo/${tenantSlug}/contact`, {')
        changed = True
    if "tenantSlug" not in body.split("\n")[0]:
        body = body.replace(
            "function ContactMalir02({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean })",
            "function ContactMalir02({ content, sectionId, isAdmin, tenantSlug }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean; tenantSlug?: string })")
        changed = True
    if changed:
        p.write_text("\n".join(lines[:s] + body.split("\n") + lines[e + 1:]))
        # dispatch musí tenantSlug předat
        src = p.read_text().replace(
            '<ContactMalir02  content={content} sectionId={sectionId} isAdmin={isAdmin} />',
            '<ContactMalir02  content={content} sectionId={sectionId} isAdmin={isAdmin} tenantSlug={tenantSlug} />')
        p.write_text(src)
        print("  ✓ kontakt → tenantový endpoint /api/demo/<slug>/contact")
    else:
        print("  = kontakt už používá tenantový endpoint")


def testimonial_initials():
    """Stock portrét → iniciálový avatar (REMASTER_PLAYBOOK §1: NIKDY stock portréty)."""
    p, s, e, lines = fn_range("TestimonialsSection.tsx", "TestimonialsMalir02")
    body = "\n".join(lines[s:e + 1])
    if "m02-initials" in body:
        print("  = recenze už mají iniciály")
        return
    # nahraď <GenericEditableImage …>…</GenericEditableImage> avatarem s iniciálami
    REPL = (
        '<span className="m02-initials" aria-hidden style={{\n'
        '            width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center",\n'
        '            justifyContent: "center", background: "var(--color-primary, #ff914d)", color: "#fff",\n'
        '            fontFamily: "var(--font-heading, \'Sora\', sans-serif)", fontSize: 20, fontWeight: 700,\n'
        '          }}>{String(it.name ?? "").split(/\\s+/).filter(Boolean).slice(0,2).map((w: string) => w[0]).join("").toUpperCase()}</span>'
    )
    new = re.sub(r'<GenericEditableImage[\s\S]*?</GenericEditableImage>', lambda _m: REPL, body, count=1)
    if new == body:
        print("  ! avatar nenalezen — zkontroluj ručně")
        return
    p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
    print("  ✓ recenze: iniciálový avatar místo stock portrétu")




HERO_PAGE = """
// hero-malir-02-page — podstránkový hero (V3 Ultramarine & Chalk). V DB ho používá
// 5 podstránek, ale komponenta NEEXISTOVALA (past z REMASTER_PLAYBOOK §0).
function HeroMalir02Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const image = String(content.backgroundImage ?? content.image ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section className="m02hp-wrap" data-template="malir-02">
      <style>{`
        .m02hp-wrap {
          position: relative; overflow: hidden; background: var(--color-secondary, #15182B);
          font-family: var(--font-body, 'Rubik', sans-serif);
          padding: calc(5rem + clamp(2.5rem, 6vw, 4.5rem)) clamp(1.25rem, 4vw, 2.75rem) clamp(2.5rem, 6vw, 4.5rem);
        }
        .m02hp-photo { position: absolute; inset: 0; opacity: 0.4; }
        .m02hp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .m02hp-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(21,24,43,0.72), rgba(21,24,43,0.9)); }
        .m02hp-inner { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; }
        .m02hp-crumb { font-size: 0.82rem; color: rgba(255,255,255,0.66); margin-bottom: 0.9rem; }
        .m02hp-crumb a { color: rgba(255,255,255,0.66); text-decoration: none; }
        .m02hp-crumb a:hover { color: var(--color-primary, #2C49D6); }
        .m02hp-title {
          font-family: var(--font-heading, 'Sora', sans-serif); font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2.1rem, 5vw, 3.4rem); line-height: 1.06; color: #fff; margin: 0 0 0.8rem; text-wrap: balance;
        }
        .m02hp-sub { font-size: 1.02rem; line-height: 1.65; color: rgba(255,255,255,0.8); max-width: 52ch; margin: 0; }
      `}</style>
      {image && (
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="m02hp-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0.4 }}>
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      )}
      <div className="m02hp-scrim" aria-hidden />
      <div className="m02hp-inner">
        <div className="m02hp-crumb"><a href={resolve("/")}>Úvod</a> <span aria-hidden>/</span> {title}</div>
        <h1 className="m02hp-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="m02hp-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
      </div>
    </section>
  );
}
"""


def add_page_hero():
    p = SEC / "HeroSection.tsx"
    src = p.read_text()
    if "function HeroMalir02Page(" not in src:
        src = src.rstrip("\n") + "\n\n" + HERO_PAGE.strip("\n") + "\n"
        print("  \u2713 komponenta HeroMalir02Page")
    if 'variant === "hero-malir-02-page"' not in src:
        src = src.replace(
            '  if (variant === "hero-malir-01-page")',
            '  if (variant === "hero-malir-02-page") return <HeroMalir02Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
            '  if (variant === "hero-malir-01-page")', 1)
        print("  \u2713 dispatch hero-malir-02-page")
    p.write_text(src)


if __name__ == "__main__":
    print("malir-02 rebuild — tokenizace + fonty + systémové opravy")
    for path, names in FNS.items():
        for n in names:
            tokenize(path, n)
    swap_fonts()
    swap_font_consts()
    footer_credit()
    contact_endpoint()
    testimonial_initials()
    add_page_hero()
    print("hotovo.")
