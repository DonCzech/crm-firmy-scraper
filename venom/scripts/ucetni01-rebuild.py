#!/usr/bin/env python3
"""ucetni-01 V3 „Navy & Gold" — tokenizace + fonty + systémové opravy.
1) hexy → var(--color-*)  [mood presety a Studio color picker dosud nefungovaly]
2) fonty → Plus Jakarta Sans + Inter (vlastní dvojice)
3) služby: ikonky v tónovaných čtverečcích → foto karty (V3_PLAYBOOK §1 je zakazuje)
4) hero-ucetni-01-page (podstránky používaly homepage hero / generický hero-centered)
5) ucetni-01-blog místo generického 'default' (renderoval cizí články a stock kanceláře)
6) WeberoCredit do patičky
Idempotentní.
"""
import re, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn, append_fn, add_dispatch, SEC  # noqa

FNS = {
    "NavbarSection.tsx": ["NavbarUcetni01"],
    "HeroSection.tsx": ["HeroUcetni01"],
    "StatsSection.tsx": ["StatsUcetni01"],
    "AboutSection.tsx": ["AboutUcetni01"],
    "TestimonialsSection.tsx": ["TestimonialsUcetni01"],
    "ContactSection.tsx": ["ContactUcetni01"],
    "FooterSection.tsx": ["FooterUcetni01"],
}

TOKENS = [
    ("#FFB500", "var(--color-primary, #FFB500)"),
    ("#e6a300", "var(--color-accent, #e6a300)"),
    ("#202124", "var(--color-text, #202124)"),
    ("#515151", "var(--color-text-muted, #515151)"),
    ("#FFFBF1", "var(--color-bg, #FFFBF1)"),
    ("#FFFEE8", "var(--color-bg, #FFFEE8)"),
    ("#f0f0f0", "var(--color-border, #f0f0f0)"),
]
# dekorativní pastelové kaňky (§1 zakazuje blob dekorace) → neutrální povrch
DECOR = ["#FFF3F3", "#FFA0A3", "#F4E4FD", "#FFEEC6"]


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
        print("  ! %s nenalezena" % name); return
    body = "\n".join(lines[s:e + 1]); before = body
    for hexv, var in TOKENS:
        body = re.sub(r'(?<!, )' + re.escape(hexv) + r'(?![0-9a-fA-F])', var, body, flags=re.I)
    for _ in range(3):
        body = re.sub(r'var\((--color-[a-z-]+), var\(--color-[a-z-]+, (#[0-9a-fA-F]{6})\)\)', r'var(\1, \2)', body)
    for d in DECOR:
        body = re.sub(re.escape(d) + r'(?![0-9a-fA-F])', "var(--color-surface, #ffffff)", body, flags=re.I)
    if body != before:
        p.write_text("\n".join(lines[:s] + body.split("\n") + lines[e + 1:]))
        print("  ✓ tokenizace %s" % name)
    else:
        print("  = %s už tokenizováno" % name)


def swap_fonts():
    p, s, e, lines = fn_range("NavbarSection.tsx", "NavbarUcetni01")
    body = "\n".join(lines[s:e + 1])
    if "Plus+Jakarta+Sans" in body:
        print("  = fonty už přepsané"); return
    body = re.sub(r'family=[A-Za-z+]+:wght@[0-9;]+',
                  'family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700', body, count=1)
    p.write_text("\n".join(lines[:s] + body.split("\n") + lines[e + 1:]))
    print("  ✓ fonty → Plus Jakarta Sans + Inter")

    # nadpisy dostanou display font scoped pravidlem (inline styly by CSS třídu přebily)
    p, s, e, lines = fn_range("NavbarSection.tsx", "NavbarUcetni01")
    body = "\n".join(lines[s:e + 1])
    if '[data-template="ucetni-01"] h1' in body:
        return
    rule = ('      <style>{`\n'
            '        [data-template="ucetni-01"] h1, [data-template="ucetni-01"] h2,\n'
            '        [data-template="ucetni-01"] h3, [data-template="ucetni-01"] h4 {\n'
            "          font-family: var(--font-heading, 'Plus Jakarta Sans', sans-serif) !important;\n"
            '          letter-spacing: -0.02em;\n'
            '        }\n'
            '      `}</style>')
    idx = next((i for i in range(s, e) if "Plus+Jakarta+Sans" in lines[i]), None)
    if idx is not None:
        lines.insert(idx + 1, rule)
        p.write_text("\n".join(lines))
        print("  ✓ scoped pravidlo pro nadpisy")


SERVICES = '''
// ucetni-01-services — V3 Navy & Gold: foto karty služeb s hairline řádkem
// (nahrazuje ikonky v tónovaných čtverečcích, které V3_PLAYBOOK §1 zakazuje).
// Pole: tagline/title/subtitle, items[].{title,description,image,price,note}.
function ServicesUcetni01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type I = { title?: string; name?: string; description?: string; image?: string; price?: string; note?: string };
  const tagline = String(content.tagline ?? "Služby");
  const title = String(content.title ?? "Co pro vás uděláme");
  const subtitle = String(content.subtitle ?? "");
  const items = ((content.items ?? content.services) as I[]) ?? [];
  return (
    <section id="sluzby" data-section-type="services" data-variant="ucetni-01-services" className="u01sv-section" data-template="ucetni-01">
      <style>{`
        .u01sv-section { background: var(--color-surface, #FFFFFF); font-family: var(--font-body, 'Inter', sans-serif);
          padding: clamp(4.5rem, 9vw, 7rem) clamp(1.25rem, 4vw, 2.75rem); }
        .u01sv-inner { max-width: 80rem; margin: 0 auto; }
        .u01sv-head { max-width: 44rem; margin-bottom: clamp(2.4rem, 5vw, 3.4rem); }
        .u01sv-eyebrow { display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1rem;
          font-size: 0.76rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--color-primary, #17395E); }
        .u01sv-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #17395E); }
        .u01sv-title { font-weight: 700; letter-spacing: -0.02em; font-size: clamp(1.9rem, 3.8vw, 2.9rem);
          line-height: 1.08; color: var(--color-text, #0C1B2A); margin: 0 0 0.8rem; text-wrap: balance; }
        .u01sv-sub { font-size: 1.02rem; line-height: 1.65; color: var(--color-text-muted, #5A6779); margin: 0; }
        .u01sv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(1.2rem, 2.2vw, 1.8rem); }
        .u01sv-card { display: flex; flex-direction: column; background: var(--color-bg, #F4F6F9);
          border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border, #E2E7EE);
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s; }
        .u01sv-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(12,27,42,0.12); }
        .u01sv-media { aspect-ratio: 16 / 10; overflow: hidden; display: block; background: #E2E7EE; }
        .u01sv-media img { width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .u01sv-card:hover .u01sv-media img { transform: scale(1.05); }
        .u01sv-body { padding: 1.2rem 1.3rem 1.4rem; display: flex; flex-direction: column; flex: 1; }
        .u01sv-num { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em;
          color: var(--color-primary, #17395E); display: block; margin-bottom: 0.5rem; }
        .u01sv-name { font-weight: 700; font-size: 1.06rem; line-height: 1.3;
          color: var(--color-text, #0C1B2A); margin: 0 0 0.5rem; }
        .u01sv-desc { font-size: 0.92rem; line-height: 1.6; color: var(--color-text-muted, #5A6779); margin: 0 0 1rem; flex: 1; }
        .u01sv-foot { display: flex; align-items: baseline; justify-content: space-between; gap: 0.8rem;
          padding-top: 0.8rem; border-top: 1px solid var(--color-border, #E2E7EE); }
        .u01sv-price { font-weight: 700; font-size: 0.98rem; color: var(--color-text, #0C1B2A); }
        .u01sv-note { font-size: 0.8rem; color: var(--color-text-muted, #5A6779); }
        @media (max-width: 1099px) { .u01sv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 599px) { .u01sv-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .u01sv-card, .u01sv-media img { transition: none; } }
      `}</style>
      <div className="u01sv-inner">
        <div className="u01sv-head">
          <span className="u01sv-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="u01sv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="u01sv-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="u01sv-grid">
          {items.map((it, i) => (
            <article className="u01sv-card" key={i}>
              {it.image && (
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={it.image} alt={it.title ?? it.name ?? ""} className="u01sv-media">
                  <img src={it.image} alt={it.title ?? it.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <div className="u01sv-body">
                <span className="u01sv-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="u01sv-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={it.title ?? it.name ?? ""} tag="span" /></h3>
                <p className="u01sv-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={it.description ?? ""} tag="span" /></p>
                <div className="u01sv-foot">
                  <span className="u01sv-price"><GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={it.price ?? ""} tag="span" /></span>
                  <span className="u01sv-note"><GenericEditableText sectionId={sectionId} field={`items.${i}.note`} value={it.note ?? ""} tag="span" /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

HERO_PAGE = '''
// hero-ucetni-01-page — podstránkový hero (Navy & Gold). Podstránky dřív používaly
// homepage hero nebo generický hero-centered.
function HeroUcetni01Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const image = String(content.backgroundImage ?? content.image ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section className="u01hp-wrap" data-template="ucetni-01">
      <style>{`
        .u01hp-wrap { background: var(--color-bg, #F4F6F9); font-family: var(--font-body, 'Inter', sans-serif);
          padding: calc(4.8rem + clamp(2.5rem, 6vw, 4rem)) clamp(1.25rem, 4vw, 2.75rem) 0; }
        .u01hp-inner { max-width: 80rem; margin: 0 auto; }
        .u01hp-crumb { font-size: 0.82rem; color: var(--color-text-muted, #5A6779); margin-bottom: 0.9rem; }
        .u01hp-crumb a { color: var(--color-text-muted, #5A6779); text-decoration: none; }
        .u01hp-crumb a:hover { color: var(--color-primary, #17395E); }
        .u01hp-title { font-weight: 700; letter-spacing: -0.02em; font-size: clamp(2.1rem, 4.6vw, 3.4rem);
          line-height: 1.06; color: var(--color-text, #0C1B2A); margin: 0 0 0.8rem; text-wrap: balance; }
        .u01hp-sub { font-size: 1.04rem; line-height: 1.65; color: var(--color-text-muted, #5A6779); max-width: 54ch; margin: 0; }
        .u01hp-photo { margin-top: clamp(2rem, 5vw, 3rem); border-radius: 12px; overflow: hidden; aspect-ratio: 21 / 8; display: block; }
        .u01hp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 767px) { .u01hp-photo { aspect-ratio: 16 / 9; } }
      `}</style>
      <div className="u01hp-inner">
        <div className="u01hp-crumb"><a href={resolve("/")}>Úvod</a> <span aria-hidden>/</span> {title}</div>
        <h1 className="u01hp-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="u01hp-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        {image && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="u01hp-photo">
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </GenericEditableImage>
        )}
      </div>
    </section>
  );
}
'''

BLOG = '''
// ucetni-01-blog — V3 Navy & Gold: karty s fotkou a datem. Nahrazuje generický
// 'default', který renderoval cizí demo články a kancelářské stock fotky.
function BlogUcetni01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type P = { title?: string; excerpt?: string; image?: string; href?: string; date?: string };
  const tagline = String(content.tagline ?? "Blog");
  const title = String(content.title ?? "Z našeho blogu");
  const posts = (content.posts as P[]) ?? [];
  const buttonText = String(content.buttonText ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section id="blog" data-section-type="blog-preview" data-variant="ucetni-01-blog" className="u01bl-section" data-template="ucetni-01">
      <style>{`
        .u01bl-section { background: var(--color-bg, #F4F6F9); font-family: var(--font-body, 'Inter', sans-serif);
          padding: clamp(4.5rem, 9vw, 7rem) clamp(1.25rem, 4vw, 2.75rem); }
        .u01bl-inner { max-width: 80rem; margin: 0 auto; }
        .u01bl-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .u01bl-eyebrow { display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1rem;
          font-size: 0.76rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--color-primary, #17395E); }
        .u01bl-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #17395E); }
        .u01bl-title { font-weight: 700; letter-spacing: -0.02em; font-size: clamp(1.9rem, 3.8vw, 2.9rem);
          line-height: 1.08; color: var(--color-text, #0C1B2A); margin: 0; text-wrap: balance; }
        .u01bl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.3rem, 2.4vw, 2rem); }
        .u01bl-card { display: flex; flex-direction: column; text-decoration: none; background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #E2E7EE); border-radius: 12px; overflow: hidden;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s; }
        .u01bl-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(12,27,42,0.12); }
        .u01bl-photo { aspect-ratio: 3 / 2; overflow: hidden; display: block; background: #E2E7EE; }
        .u01bl-photo img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .u01bl-card:hover .u01bl-photo img { transform: scale(1.05); }
        .u01bl-body { padding: 1.2rem 1.4rem 1.4rem; display: flex; flex-direction: column; flex: 1; }
        .u01bl-date { font-size: 0.76rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--color-primary, #17395E); display: block; margin-bottom: 0.5rem; }
        .u01bl-h { font-weight: 700; font-size: 1.08rem; line-height: 1.3; color: var(--color-text, #0C1B2A); margin: 0 0 0.6rem; }
        .u01bl-x { font-size: 0.92rem; line-height: 1.62; color: var(--color-text-muted, #5A6779); margin: 0 0 1rem; flex: 1; }
        .u01bl-more { font-size: 0.86rem; font-weight: 600; color: var(--color-primary, #17395E);
          padding-top: 0.8rem; border-top: 1px solid var(--color-border, #E2E7EE); }
        .u01bl-all { display: inline-flex; align-items: center; margin-top: clamp(2rem, 4vw, 2.6rem);
          padding: 0.9rem 1.9rem; border-radius: 8px; background: var(--color-primary, #17395E); color: #fff;
          font-size: 0.94rem; font-weight: 600; text-decoration: none; transition: background 0.25s, transform 0.25s; }
        .u01bl-all:hover { background: var(--color-accent, #0F2942); transform: translateY(-2px); }
        @media (max-width: 899px) { .u01bl-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .u01bl-card, .u01bl-photo img { transition: none; } }
      `}</style>
      <div className="u01bl-inner">
        <div className="u01bl-head">
          <span className="u01bl-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="u01bl-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
        </div>
        <div className="u01bl-grid">
          {posts.map((p, i) => (
            <a className="u01bl-card" key={i} href={resolve(p.href ?? "/blog")}>
              {p.image && (
                <GenericEditableImage sectionId={sectionId} field={`posts.${i}.image`} src={p.image} alt={p.title ?? ""} className="u01bl-photo">
                  <img src={p.image} alt={p.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <div className="u01bl-body">
                <span className="u01bl-date"><GenericEditableText sectionId={sectionId} field={`posts.${i}.date`} value={p.date ?? ""} tag="span" /></span>
                <h3 className="u01bl-h"><GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={p.title ?? ""} tag="span" /></h3>
                <p className="u01bl-x"><GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={p.excerpt ?? ""} tag="span" /></p>
                <span className="u01bl-more">Číst dál →</span>
              </div>
            </a>
          ))}
        </div>
        {buttonText && <a href={resolve("/blog")} className="u01bl-all">{buttonText}</a>}
      </div>
    </section>
  );
}
'''


def footer_credit():
    p, s, e, lines = fn_range("FooterSection.tsx", "FooterUcetni01")
    body = "\n".join(lines[s:e + 1])
    if "WeberoCredit" in body:
        print("  = WeberoCredit už v patičce"); return
    new = body.replace("</footer>", '  <div style={{ display: "flex", justifyContent: "center", padding: "0 0 18px" }}><WeberoCredit /></div>\n    </footer>')
    if new == body:
        print("  ! WeberoCredit se nepodařilo vložit"); return
    p.write_text("\n".join(lines[:s] + new.split("\n") + lines[e + 1:]))
    print("  ✓ WeberoCredit do patičky")


if __name__ == "__main__":
    print("ucetni-01 rebuild")
    for path, names in FNS.items():
        for n in names:
            tokenize(path, n)
    swap_fonts()
    replace_fn("ServicesSection.tsx", "ServicesUcetni01", SERVICES)
    append_fn("HeroSection.tsx", HERO_PAGE, "function HeroUcetni01Page(")
    # POZOR: add_dispatch vkládá ZA kotvu — u blokové varianty by řádek spadl dovnitř if-u.
    hp = SEC / "HeroSection.tsx"
    src = hp.read_text()
    line = '  if (variant === "hero-ucetni-01-page") return <HeroUcetni01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'
    if line not in src:
        src = src.replace('  if (variant === "ucetni-01-hero") {', line + '\n  if (variant === "ucetni-01-hero") {', 1)
        hp.write_text(src)
        print("  ✓ dispatch hero-ucetni-01-page")
    append_fn("BlogPreviewSection.tsx", BLOG, "function BlogUcetni01(")
    add_dispatch("BlogPreviewSection.tsx", 'if (variant === "hair-04-blog") {',
                 '    return <BlogHair04 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
                 '  }\n  if (variant === "ucetni-01-blog") {\n'
                 '    return <BlogUcetni01 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;')
    footer_credit()
    print("hotovo.")
