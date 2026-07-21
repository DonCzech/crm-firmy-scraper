#!/usr/bin/env python3
"""hair-02 „Blush & Clay" V3 remaster — deterministický rebuild (REMASTER_PLAYBOOK §3).

Idempotentní: každou komponentu nahradí celou (brace-match od `function X` po `}` v 1. sloupci).
Když paralelní session přepíše soubor, stačí spustit znovu:  python3 scripts/hair02-rebuild.py
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEC = ROOT / "src/components/sections"


def replace_fn(path, name, body):
    """Nahradí top-level `function <name>` (+ bezprostředně předcházející // komentáře)."""
    p = SEC / path
    lines = p.read_text().split("\n")
    start = next((i for i, l in enumerate(lines) if l.startswith("function " + name + "(")), None)
    if start is None:
        raise SystemExit("NENALEZENO: function %s v %s" % (name, path))
    # pohltit předcházející komentářové řádky
    while start > 0 and lines[start - 1].lstrip().startswith("//"):
        start -= 1
    end = next(i for i in range(start + 1, len(lines)) if lines[i] == "}")
    p.write_text("\n".join(lines[:start] + body.strip("\n").split("\n") + lines[end + 1:]))
    print("  ✓ %-22s %s" % (name, path))


def insert_before(path, anchor, body, marker):
    """Vloží nový blok před řádek `anchor` (jen když `marker` v souboru není)."""
    p = SEC / path
    src = p.read_text()
    if marker in src:
        print("  = %-22s už existuje" % marker)
        return
    lines = src.split("\n")
    idx = next(i for i, l in enumerate(lines) if l.startswith(anchor))
    p.write_text("\n".join(lines[:idx] + body.strip("\n").split("\n") + [""] + lines[idx:]))
    print("  ✓ vložen blok %s → %s" % (marker, path))


def add_dispatch(path, after_line, new_line):
    """Přidá dispatch řádek za existující (idempotentně)."""
    p = SEC / path
    src = p.read_text()
    if new_line.strip() in src:
        print("  = dispatch už existuje: %s" % new_line.strip()[:52])
        return
    lines = src.split("\n")
    idx = next(i for i, l in enumerate(lines) if after_line in l)
    lines.insert(idx + 1, new_line)
    p.write_text("\n".join(lines))
    print("  ✓ dispatch %s" % new_line.strip()[:52])


# ──────────────────────────────────────────────────────────────────────────────
# Sdílené konstanty palety (drž v souladu s theme.json + designTokens v DB)
# ──────────────────────────────────────────────────────────────────────────────
FONTS = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />\n'
         '      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500'
         '&family=Schibsted+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />')

NAVBAR = '''
// hair-02-navbar — Salon Blush · V3 „Blush & Clay": blur sticky bar, Newsreader
// wordmark, underline-slide linky, clay pill CTA, overlay menu + sticky mobilní CTA.
function NavbarHair02({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", handler); };
  }, [open]);

  const siteName = String(content.siteName ?? "Salon Blush");
  const phone = String(content.phone ?? "+420 704 123 456");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      LINKS_PLACEHOLDER
      <style>{`
        .h02n-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          font-family: 'Schibsted Grotesk', sans-serif;
          background: rgba(251,246,243,${scrolled ? "0.95" : "0.86"});
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border, #EADDD6);
          transition: background 0.3s;
        }
        .h02n-inner {
          max-width: 80rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.75rem);
          height: 5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
        }
        .h02n-logo { display: flex; align-items: center; gap: 0.55rem; text-decoration: none; flex-shrink: 0; }
        .h02n-wordmark {
          font-family: 'Newsreader', Georgia, serif; font-size: 1.62rem; font-weight: 400;
          letter-spacing: -0.01em; color: var(--color-text, #2A211E); line-height: 1;
        }
        .h02n-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-primary, #C0685C); }
        .h02n-links { display: flex; align-items: center; gap: 1.7rem; list-style: none; margin: 0; padding: 0; }
        .h02n-links a {
          position: relative; font-size: 0.93rem; font-weight: 500; letter-spacing: 0.01em;
          color: #6B5A53; text-decoration: none; padding: 0.35rem 0; transition: color 0.2s;
        }
        .h02n-links a::after {
          content: ""; position: absolute; left: 0; right: 100%; bottom: 0; height: 1.5px;
          background: var(--color-primary, #C0685C); transition: right 0.28s cubic-bezier(0.22,1,0.36,1);
        }
        .h02n-links a:hover { color: var(--color-text, #2A211E); }
        .h02n-links a:hover::after { right: 0; }
        .h02n-right { display: flex; align-items: center; gap: 1.15rem; }
        .h02n-phone { font-size: 0.92rem; font-weight: 600; color: var(--color-text, #2A211E); text-decoration: none; white-space: nowrap; }
        .h02n-cta {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.72rem 1.6rem; border-radius: 999px;
          background: var(--color-primary, #C0685C); color: #fff; font-size: 0.9rem; font-weight: 600;
          letter-spacing: 0.01em; text-decoration: none; white-space: nowrap;
          box-shadow: 0 6px 18px rgba(192,104,92,0.28); transition: background 0.25s, transform 0.25s;
        }
        .h02n-cta:hover { background: var(--color-accent, #9E5147); transform: translateY(-1px); }
        .h02n-burger { display: none; background: none; border: none; cursor: pointer; padding: 6px; color: var(--color-text, #2A211E); }
        .h02n-overlay {
          position: fixed; inset: 0; background: var(--color-secondary, #3B2B27); z-index: 200;
          display: flex; flex-direction: column; padding: 1.15rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
          opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
          font-family: 'Schibsted Grotesk', sans-serif;
        }
        .h02n-overlay[data-open="true"] { opacity: 1; pointer-events: auto; }
        .h02n-ov-top { display: flex; align-items: center; justify-content: space-between; height: 3.7rem; }
        .h02n-ov-word { font-family: 'Newsreader', Georgia, serif; font-size: 1.5rem; color: #FBF6F3; }
        .h02n-ov-close { background: none; border: none; color: #FBF6F3; font-size: 2rem; line-height: 1; cursor: pointer; padding: 4px 10px; }
        .h02n-ov-links { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.3rem; }
        .h02n-ov-links a {
          font-family: 'Newsreader', Georgia, serif; font-size: clamp(1.9rem, 7vw, 2.7rem); font-weight: 400;
          color: #FBF6F3; text-decoration: none; padding: 0.45rem 0;
          border-bottom: 1px solid rgba(251,246,243,0.13);
          opacity: 0; transform: translateY(14px); transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .h02n-overlay[data-open="true"] .h02n-ov-links a { opacity: 1; transform: none; }
        .h02n-ov-links a:nth-child(1) { transition-delay: 0.05s; } .h02n-ov-links a:nth-child(2) { transition-delay: 0.1s; }
        .h02n-ov-links a:nth-child(3) { transition-delay: 0.15s; } .h02n-ov-links a:nth-child(4) { transition-delay: 0.2s; }
        .h02n-ov-links a:nth-child(5) { transition-delay: 0.25s; } .h02n-ov-links a:nth-child(6) { transition-delay: 0.3s; }
        .h02n-ov-cta {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 1.05rem;
          border-radius: 999px; background: var(--color-primary, #C0685C); color: #fff; font-weight: 600; text-decoration: none;
        }
        .h02n-mobilebar {
          display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
          padding: 0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom));
          background: rgba(251,246,243,0.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-border, #EADDD6); font-family: 'Schibsted Grotesk', sans-serif;
        }
        .h02n-mb-cta {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.9rem;
          border-radius: 999px; background: var(--color-primary, #C0685C); color: #fff;
          font-size: 0.95rem; font-weight: 600; text-decoration: none;
        }
        @media (max-width: 1023px) {
          .h02n-links, .h02n-phone, .h02n-cta { display: none; }
          .h02n-burger { display: block; }
          .h02n-mobilebar { display: block; }
          .h02n-inner { height: 4.4rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .h02n-overlay, .h02n-ov-links a, .h02n-cta { transition: none; }
        }
      `}</style>

      <header className="h02n-bar" data-template="hair-02">
        <div className="h02n-inner">
          <a href={resolve("/")} className="h02n-logo" aria-label={siteName}>
            <span className="h02n-wordmark"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
            <span className="h02n-dot" aria-hidden />
          </a>
          <ul className="h02n-links">
            {links.map((l, i) => (
              <li key={i}><a href={resolve(l.href)}>{l.label}</a></li>
            ))}
          </ul>
          <div className="h02n-right">
            <a href={`tel:${phone.replace(/\\s/g, "")}`} className="h02n-phone">{phone}</a>
            <a href={resolve(ctaHref)} data-btn="primary" className="h02n-cta">{ctaText}</a>
            <button className="h02n-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="h02n-overlay" data-open={open} aria-hidden={!open}>
        <div className="h02n-ov-top">
          <span className="h02n-ov-word">{siteName}</span>
          <button className="h02n-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        </div>
        <nav className="h02n-ov-links">
          {links.map((l, i) => (
            <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </nav>
        <a href={resolve(ctaHref)} data-btn="primary" className="h02n-ov-cta" onClick={() => setOpen(false)}>{ctaText}</a>
      </div>

      <div className="h02n-mobilebar" aria-hidden={open}>
        <a href={resolve(ctaHref)} className="h02n-mb-cta">{ctaText}</a>
      </div>
    </>
  );
}
'''.replace("LINKS_PLACEHOLDER", FONTS)

HERO = '''
// hero-hair-02-slider — V3 cinematic: fullbleed crossfade slider, tmavý gradient,
// Newsreader H1 s clay akcentovým řádkem, CTA pár, dots + progres. Pole: slides[],
// eyebrow, title, titleAccent, subtitle, ctaText/Href, ctaSecondaryText/Href.
function HeroHair02Slider({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Slide = { image: string; alt?: string };
  const slides = ((content.slides as Slide[]) ?? []).filter((s) => s && s.image);
  const eyebrow = String(content.eyebrow ?? "Kadeřnické studio · Praha");
  const title = String(content.title ?? "Vlasy, které");
  const titleAccent = String(content.titleAccent ?? "vám sluší");
  const subtitle = String(content.subtitle ?? "");
  const ctaText = String(content.ctaText ?? "On-line rezervace");
  const ctaHref = String(content.ctaHref ?? "#rezervace");
  const cta2Text = String(content.ctaSecondaryText ?? "Naše služby");
  const cta2Href = String(content.ctaSecondaryHref ?? "#sluzby");
  const [idx, setIdx] = useState(0);
  const count = slides.length;
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  return (
    <section id="uvod" className="h02h-hero" data-template="hair-02">
      <style>{`
        .h02h-hero {
          position: relative; min-height: 92vh; display: flex; align-items: flex-end;
          overflow: hidden; background: var(--color-secondary, #3B2B27);
          font-family: 'Schibsted Grotesk', sans-serif;
        }
        .h02h-slide {
          position: absolute; inset: 0; opacity: 0; transition: opacity 1.1s ease;
        }
        .h02h-slide[data-active="true"] { opacity: 1; }
        .h02h-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h02h-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(42,33,30,0.44) 0%, rgba(42,33,30,0.18) 38%, rgba(42,33,30,0.82) 100%);
        }
        .h02h-inner {
          position: relative; z-index: 2; width: 100%; max-width: 80rem; margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.75rem) clamp(3.5rem, 8vw, 6rem);
        }
        .h02h-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.4rem;
          font-size: 0.79rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #F2C9C0;
        }
        .h02h-eyebrow::before { content: ""; width: 34px; height: 1.5px; background: var(--color-primary, #C0685C); }
        .h02h-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.9rem, 7vw, 5rem); line-height: 1.02; letter-spacing: -0.02em;
          color: #FFFFFF; margin: 0 0 1.35rem; text-wrap: balance; max-width: 16ch;
        }
        .h02h-title em { display: block; font-style: italic; color: #F2C9C0; }
        .h02h-sub {
          font-size: clamp(1rem, 1.5vw, 1.12rem); line-height: 1.65; color: rgba(255,255,255,0.86);
          max-width: 46ch; margin: 0 0 2.2rem;
        }
        .h02h-ctas { display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; }
        .h02h-btn {
          display: inline-flex; align-items: center; gap: 0.55rem; padding: 1rem 2.1rem; border-radius: 999px;
          font-size: 0.97rem; font-weight: 600; text-decoration: none; transition: transform 0.25s, background 0.25s;
        }
        .h02h-btn-primary { background: var(--color-primary, #C0685C); color: #fff; box-shadow: 0 10px 30px rgba(192,104,92,0.36); }
        .h02h-btn-primary:hover { background: var(--color-accent, #9E5147); transform: translateY(-2px); }
        .h02h-btn-ghost { color: #fff; border: 1px solid rgba(255,255,255,0.42); }
        .h02h-btn-ghost:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .h02h-dots { display: flex; gap: 0.5rem; margin-top: 2.6rem; }
        .h02h-dot {
          width: 34px; height: 3px; border-radius: 2px; border: none; padding: 0; cursor: pointer;
          background: rgba(255,255,255,0.32); transition: background 0.25s;
        }
        .h02h-dot[data-on="true"] { background: var(--color-primary, #C0685C); }
        @media (max-width: 767px) {
          .h02h-hero { min-height: 88vh; }
          .h02h-btn { flex: 1 1 auto; justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .h02h-slide, .h02h-btn { transition: none; }
        }
      `}</style>

      {slides.map((s, i) => (
        <GenericEditableImage
          key={i}
          sectionId={sectionId}
          field={`slides.${i}.image`}
          src={s.image}
          alt={s.alt ?? ""}
          className="h02h-slide"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: i === idx ? 1 : 0, transition: "opacity 1.1s ease" }}
          priority={i === 0}
        >
          <img src={s.image} alt={s.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      ))}
      <div className="h02h-scrim" aria-hidden />

      <div className="h02h-inner">
        <span className="h02h-eyebrow">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h1 className="h02h-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          <em><GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" /></em>
        </h1>
        {subtitle && (
          <p className="h02h-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <div className="h02h-ctas">
          <a href={resolve(ctaHref)} data-btn="primary" className="h02h-btn h02h-btn-primary">{ctaText}</a>
          <a href={resolve(cta2Href)} className="h02h-btn h02h-btn-ghost">{cta2Text}</a>
        </div>
        {count > 1 && (
          <div className="h02h-dots" role="tablist" aria-label="Fotografie salonu">
            {slides.map((_, i) => (
              <button
                key={i}
                className="h02h-dot"
                data-on={i === idx}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Fotografie ${i + 1}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
'''

HERO_PAGE = '''
// hero-hair-02-page — podstránkový hero (Blush & Clay): paper bg, breadcrumb,
// Newsreader H1, volitelná fotka jako úzký pás. Pole: title, subtitle, backgroundImage.
function HeroHair02Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const image = String(content.backgroundImage ?? content.image ?? "");
  const crumb = String(content.crumbLabel ?? title);
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section className="h02hp-wrap" data-template="hair-02">
      <style>{`
        .h02hp-wrap {
          background: var(--color-bg, #FBF6F3); font-family: 'Schibsted Grotesk', sans-serif;
          padding: calc(5rem + clamp(2.5rem, 6vw, 4.5rem)) clamp(1.25rem, 4vw, 2.75rem) 0;
        }
        .h02hp-inner { max-width: 80rem; margin: 0 auto; }
        .h02hp-crumb { font-size: 0.82rem; letter-spacing: 0.04em; color: var(--color-text-muted, #7C6B64); margin-bottom: 1.1rem; }
        .h02hp-crumb a { color: var(--color-text-muted, #7C6B64); text-decoration: none; }
        .h02hp-crumb a:hover { color: var(--color-primary, #C0685C); }
        .h02hp-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.4rem, 5.4vw, 4rem); line-height: 1.05; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 1rem; text-wrap: balance;
        }
        .h02hp-sub { font-size: 1.05rem; line-height: 1.65; color: var(--color-text-muted, #7C6B64); max-width: 52ch; margin: 0; }
        .h02hp-photo {
          margin-top: clamp(2.2rem, 5vw, 3.4rem); border-radius: 20px; overflow: hidden;
          aspect-ratio: 21 / 7; background: var(--color-surface, #fff);
        }
        .h02hp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 767px) { .h02hp-photo { aspect-ratio: 16 / 9; } }
      `}</style>
      <div className="h02hp-inner">
        <div className="h02hp-crumb">
          <a href={resolve("/")}>Domů</a> <span aria-hidden>/</span> {crumb}
        </div>
        <h1 className="h02hp-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h1>
        {subtitle && (
          <p className="h02hp-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        {image && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="h02hp-photo">
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </GenericEditableImage>
        )}
      </div>
    </section>
  );
}
'''

def replace_inline_block(path, variant, replacement):
    """Nahradí inline `if (variant === "<variant>") { ... }` blok (brace counting)."""
    p = SEC / path
    lines = p.read_text().split("\n")
    needle = 'if (variant === "%s")' % variant
    start = next((i for i, l in enumerate(lines) if needle in l), None)
    if start is None:
        print("  = inline blok %s už nahrazen" % variant)
        return
    depth, end = 0, None
    for i in range(start, len(lines)):
        depth += lines[i].count("{") - lines[i].count("}")
        if depth == 0 and i > start:
            end = i
            break
        if depth == 0 and i == start and "{" in lines[i]:
            continue
    if end is None:
        raise SystemExit("nenalezen konec bloku %s" % variant)
    p.write_text("\n".join(lines[:start] + replacement.strip("\n").split("\n") + lines[end + 1:]))
    print("  ✓ inline blok %s → delegace" % variant)


def append_fn(path, body, marker):
    """Přidá komponentu na konec souboru (jen když tam ještě není)."""
    p = SEC / path
    src = p.read_text()
    if marker in src:
        # už existuje → nahraď celou
        name = marker.replace("function ", "").replace("(", "")
        replace_fn(path, name, body)
        return
    p.write_text(src.rstrip("\n") + "\n\n" + body.strip("\n") + "\n")
    print("  ✓ přidána komponenta %s → %s" % (marker, path))


ABOUT = '''
// about-hair-02-story — V3 „Blush & Clay": split — vlevo eyebrow + Newsreader H2 +
// odstavce + statistiky na hairline, vpravo foto karta s posunutým wash rámem;
// dole textové wordmarky demo značek. Pole: tagline/title/body/paragraphs/stats/
// image/brands/ctaText/ctaHref.
function AboutHair02Story({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "O salonu");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const paragraphs = (content.paragraphs as string[]) ?? [];
  const image = String(content.image ?? "");
  const ctaText = String(content.ctaText ?? "Objednat se");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const brands = (content.brands as Array<{ name: string }>) ?? [];
  const stats = (content.stats as Array<{ value: string; label: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="o-nas" data-section-type="about" data-variant="about-hair-02-story" className="h02ab-section" data-template="hair-02">
      <style>{`
        .h02ab-section {
          background: var(--color-bg, #FBF6F3); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02ab-inner { max-width: 80rem; margin: 0 auto; }
        .h02ab-grid {
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(2.5rem, 6vw, 5rem);
          align-items: center;
        }
        .h02ab-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.3rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--color-primary, #C0685C);
        }
        .h02ab-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-primary, #C0685C); }
        .h02ab-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.1rem, 4.4vw, 3.3rem); line-height: 1.08; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 1.3rem; text-wrap: balance;
        }
        .h02ab-lead {
          font-size: clamp(1.05rem, 1.5vw, 1.18rem); line-height: 1.6; color: var(--color-text, #2A211E);
          margin: 0 0 1.5rem; max-width: 48ch;
        }
        .h02ab-p { font-size: 1rem; line-height: 1.75; color: var(--color-text-muted, #7C6B64); margin: 0 0 1.1rem; max-width: 54ch; }
        .h02ab-stats {
          display: flex; gap: clamp(1.5rem, 3vw, 2.6rem); margin: 2.2rem 0 2.4rem; flex-wrap: wrap;
        }
        .h02ab-stat { padding-left: 1.4rem; border-left: 1px solid var(--color-border, #EADDD6); }
        .h02ab-stat:first-child { padding-left: 0; border-left: none; }
        .h02ab-stat-v {
          font-family: 'Newsreader', Georgia, serif; font-size: clamp(1.9rem, 3vw, 2.5rem); font-weight: 400;
          color: var(--color-primary, #C0685C); line-height: 1; display: block; margin-bottom: 0.35rem;
        }
        .h02ab-stat-l { font-size: 0.85rem; color: var(--color-text-muted, #7C6B64); letter-spacing: 0.01em; }
        .h02ab-cta {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.95rem 2rem; border-radius: 999px;
          background: var(--color-primary, #C0685C); color: #fff; font-size: 0.96rem; font-weight: 600;
          text-decoration: none; box-shadow: 0 8px 24px rgba(192,104,92,0.26);
          transition: background 0.25s, transform 0.25s;
        }
        .h02ab-cta:hover { background: var(--color-accent, #9E5147); transform: translateY(-2px); }
        .h02ab-media { position: relative; }
        .h02ab-media::before {
          content: ""; position: absolute; inset: 1.6rem -1.6rem -1.6rem 1.6rem; border-radius: 20px;
          background: #F3E3DC; z-index: 0;
        }
        .h02ab-photo {
          position: relative; z-index: 1; border-radius: 20px; overflow: hidden; aspect-ratio: 4 / 5;
          display: block; background: var(--color-surface, #fff);
        }
        .h02ab-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h02ab-brands {
          margin-top: clamp(3rem, 6vw, 4.5rem); padding-top: 2rem;
          border-top: 1px solid var(--color-border, #EADDD6);
          display: flex; flex-wrap: wrap; align-items: center; gap: clamp(1.6rem, 5vw, 4rem);
        }
        .h02ab-brand {
          font-size: 0.88rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--color-text-muted, #7C6B64); opacity: 0.75;
        }
        @media (max-width: 899px) {
          .h02ab-grid { grid-template-columns: 1fr; gap: 3rem; }
          .h02ab-media::before { inset: 1rem -1rem -1rem 1rem; }
        }
        @media (max-width: 639px) {
          .h02ab-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
          .h02ab-stat { padding-left: 0.9rem; }
          .h02ab-stat-l { font-size: 0.78rem; }
        }
      `}</style>
      <div className="h02ab-inner">
        <div className="h02ab-grid">
          <div>
            <span className="h02ab-eyebrow">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <h2 className="h02ab-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
            {body && (
              <p className="h02ab-lead">
                <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
              </p>
            )}
            {paragraphs.map((p, i) => (
              <p className="h02ab-p" key={i}>
                <GenericEditableText sectionId={sectionId} field={`paragraphs.${i}`} value={p} tag="span" />
              </p>
            ))}
            {stats.length > 0 && (
              <div className="h02ab-stats">
                {stats.map((s, i) => (
                  <div className="h02ab-stat" key={i}>
                    <span className="h02ab-stat-v">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                    </span>
                    <span className="h02ab-stat-l">
                      <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                    </span>
                  </div>
                ))}
              </div>
            )}
            <a href={resolve(ctaHref)} data-btn="primary" className="h02ab-cta">{ctaText}</a>
          </div>
          {image && (
            <div className="h02ab-media">
              <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h02ab-photo">
                <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </GenericEditableImage>
            </div>
          )}
        </div>
        {brands.length > 0 && (
          <div className="h02ab-brands">
            {brands.map((b, i) => (
              <span className="h02ab-brand" key={i}>
                <GenericEditableText sectionId={sectionId} field={`brands.${i}.name`} value={b.name} tag="span" />
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
'''

PROMO = '''
// cta-hair-02-promo — V3: wash pás (#F3E3DC) pro rytmus mezi světlými sekcemi,
// vlevo eyebrow + Newsreader H2 + text + clay pill CTA, vpravo foto radius 20.
function CtaHair02Promo({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const tag = String(content.tag ?? "");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const ctaText = String(content.ctaText ?? "Zjistit více");
  const ctaHref = resolveDemoHref(String(content.ctaHref ?? "/kontakt"), tenantSlug, isAdmin);
  const image = String(content.image ?? "");

  return (
    <section id="promo" className="h02ct-section" data-template="hair-02">
      <style>{`
        .h02ct-section {
          background: #F3E3DC; font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02ct-inner {
          max-width: 80rem; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center;
        }
        .h02ct-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--color-accent, #9E5147);
        }
        .h02ct-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-accent, #9E5147); }
        .h02ct-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2rem, 4.2vw, 3.1rem); line-height: 1.1; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 1.2rem; text-wrap: balance; max-width: 18ch;
        }
        .h02ct-body { font-size: 1.05rem; line-height: 1.7; color: #6B564F; margin: 0 0 2rem; max-width: 48ch; }
        .h02ct-cta {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.95rem 2rem; border-radius: 999px;
          background: var(--color-primary, #C0685C); color: #fff; font-size: 0.96rem; font-weight: 600;
          text-decoration: none; box-shadow: 0 8px 24px rgba(192,104,92,0.3);
          transition: background 0.25s, transform 0.25s;
        }
        .h02ct-cta:hover { background: var(--color-accent, #9E5147); transform: translateY(-2px); }
        .h02ct-photo { border-radius: 20px; overflow: hidden; aspect-ratio: 1 / 1; display: block; }
        .h02ct-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 899px) { .h02ct-inner { grid-template-columns: 1fr; gap: 2.5rem; } }
      `}</style>
      <div className="h02ct-inner">
        <div>
          {tag && (
            <span className="h02ct-eyebrow">
              <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
            </span>
          )}
          <h2 className="h02ct-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p className="h02ct-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <a href={ctaHref} data-btn="primary" className="h02ct-cta">{ctaText}</a>
        </div>
        {image && (
          <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h02ct-photo">
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </GenericEditableImage>
        )}
      </div>
    </section>
  );
}
'''

SERVICES = '''
// hair-02-services — V3 „Blush & Clay": foto karty služeb (aspect 16/10, hover zoom,
// číslo v rohu), hairline řádek s cenou a délkou. Pole: tagline/title/subtitle,
// services[].{name,description,price,duration,image}.
function ServicesHair02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { name?: string; description?: string; price?: string; duration?: string; image?: string; ctaHref?: string };
  const tagline = String(content.tagline ?? "Ceník");
  const title = String(content.title ?? "Naše služby");
  const subtitle = String(content.subtitle ?? "");
  const items = ((content.services ?? content.items) as Item[]) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="sluzby" data-section-type="services" data-variant="hair-02-services" className="h02sv-section" data-template="hair-02">
      <style>{`
        .h02sv-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02sv-inner { max-width: 80rem; margin: 0 auto; }
        .h02sv-head { max-width: 46rem; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }
        .h02sv-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--color-primary, #C0685C);
        }
        .h02sv-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-primary, #C0685C); }
        .h02sv-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.1rem, 4.4vw, 3.3rem); line-height: 1.08; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 0.9rem; text-wrap: balance;
        }
        .h02sv-sub { font-size: 1.02rem; line-height: 1.65; color: var(--color-text-muted, #7C6B64); margin: 0; }
        .h02sv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.5rem, 2.6vw, 2.2rem); }
        .h02sv-card { display: flex; flex-direction: column; }
        .h02sv-media {
          position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 16 / 10;
          display: block; background: #F3E3DC; margin-bottom: 1.25rem;
        }
        .h02sv-media img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .h02sv-card:hover .h02sv-media img { transform: scale(1.05); }
        .h02sv-num {
          position: absolute; top: 0.9rem; left: 0.9rem; z-index: 2;
          width: 2.1rem; height: 2.1rem; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(251,246,243,0.92); color: var(--color-text, #2A211E);
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.02em;
        }
        .h02sv-name {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400; font-size: 1.42rem;
          line-height: 1.2; color: var(--color-text, #2A211E); margin: 0 0 0.55rem;
        }
        .h02sv-desc { font-size: 0.95rem; line-height: 1.62; color: var(--color-text-muted, #7C6B64); margin: 0 0 1.1rem; flex: 1; }
        .h02sv-meta {
          display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding-top: 0.9rem; border-top: 1px solid var(--color-border, #EADDD6);
        }
        .h02sv-price { font-size: 1.02rem; font-weight: 700; color: var(--color-primary, #C0685C); }
        .h02sv-dur { font-size: 0.86rem; color: var(--color-text-muted, #7C6B64); }
        @media (max-width: 1023px) { .h02sv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 639px) { .h02sv-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .h02sv-media img { transition: none; } }
      `}</style>
      <div className="h02sv-inner">
        <div className="h02sv-head">
          <span className="h02sv-eyebrow">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 className="h02sv-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="h02sv-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
        <div className="h02sv-grid">
          {items.map((it, i) => (
            <article className="h02sv-card" key={i}>
              {it.image && (
                <GenericEditableImage sectionId={sectionId} field={`services.${i}.image`} src={it.image} alt={it.name ?? ""} className="h02sv-media">
                  <img src={it.image} alt={it.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <h3 className="h02sv-name">
                <GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={it.name ?? ""} tag="span" />
              </h3>
              <p className="h02sv-desc">
                <GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={it.description ?? ""} tag="span" />
              </p>
              <div className="h02sv-meta">
                <span className="h02sv-price">
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={it.price ?? ""} tag="span" />
                </span>
                <span className="h02sv-dur">
                  <GenericEditableText sectionId={sectionId} field={`services.${i}.duration`} value={it.duration ?? ""} tag="span" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

GALLERY = '''
// hair-02-gallery — V3: mřížka fotek 4/3 s hover zoomem, první dvě přes 2 sloupce.
// Pole: tagline/title/subtitle, images[].{url,alt}.
function GalleryHair02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Img = { url?: string; alt?: string };
  const tagline = String(content.tagline ?? "Galerie");
  const title = String(content.title ?? "Naše práce");
  const subtitle = String(content.subtitle ?? "");
  const images = ((content.images as Img[]) ?? []).filter((i) => i && i.url);

  return (
    <section id="galerie" data-section-type="gallery" data-variant="hair-02-gallery" className="h02g-section" data-template="hair-02">
      <style>{`
        .h02g-section {
          background: var(--color-bg, #FBF6F3); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02g-inner { max-width: 80rem; margin: 0 auto; }
        .h02g-head { max-width: 44rem; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }
        .h02g-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--color-primary, #C0685C);
        }
        .h02g-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-primary, #C0685C); }
        .h02g-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.1rem, 4.4vw, 3.3rem); line-height: 1.08; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 0.9rem; text-wrap: balance;
        }
        .h02g-sub { font-size: 1.02rem; line-height: 1.65; color: var(--color-text-muted, #7C6B64); margin: 0; }
        .h02g-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(0.8rem, 1.6vw, 1.3rem); }
        .h02g-item {
          border-radius: 20px; overflow: hidden; aspect-ratio: 3 / 4; display: block; background: #F3E3DC;
        }
        .h02g-item img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .h02g-item:hover img { transform: scale(1.05); }
        @media (max-width: 899px) { .h02g-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (prefers-reduced-motion: reduce) { .h02g-item img { transition: none; } }
      `}</style>
      <div className="h02g-inner">
        <div className="h02g-head">
          <span className="h02g-eyebrow">
            <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
          </span>
          <h2 className="h02g-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="h02g-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
        <div className="h02g-grid">
          {images.map((im, i) => (
            <GenericEditableImage key={i} sectionId={sectionId} field={`images.${i}.url`} src={im.url ?? ""} alt={im.alt ?? ""} className="h02g-item">
              <img src={im.url ?? ""} alt={im.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

TESTIMONIALS = '''
// hair-02-testimonials — V3: tmavá sekce (rytmus), iniciálové avatary (NIKDY stock
// portréty), hvězdy v clay, hairline sloupce. Pole: tagline/title/rating/ratingLabel,
// testimonials[].{author,role,rating,text}.
function TestimonialsHair02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klientky");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const initials = (name: string) =>
    name.split(/\\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-02-testimonials" className="h02tm-section" data-template="hair-02">
      <style>{`
        .h02tm-section {
          background: var(--color-secondary, #3B2B27); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02tm-inner { max-width: 80rem; margin: 0 auto; }
        .h02tm-head {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
          flex-wrap: wrap; margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
        }
        .h02tm-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #E8A99D;
        }
        .h02tm-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: #E8A99D; }
        .h02tm-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2.1rem, 4.4vw, 3.3rem); line-height: 1.08; letter-spacing: -0.02em;
          color: #FBF6F3; margin: 0; text-wrap: balance;
        }
        .h02tm-score { text-align: right; }
        .h02tm-score-v {
          font-family: 'Newsreader', Georgia, serif; font-size: clamp(2.4rem, 5vw, 3.2rem);
          color: #E8A99D; line-height: 1; display: block;
        }
        .h02tm-score-l { font-size: 0.86rem; color: rgba(251,246,243,0.72); }
        .h02tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .h02tm-item {
          padding: 0 clamp(1.2rem, 2.4vw, 2.2rem);
          border-left: 1px solid rgba(251,246,243,0.14);
        }
        .h02tm-item:first-child { padding-left: 0; border-left: none; }
        .h02tm-item:last-child { padding-right: 0; }
        .h02tm-stars { color: #E8A99D; font-size: 0.95rem; letter-spacing: 0.14em; margin-bottom: 1.1rem; }
        .h02tm-text {
          font-size: 1.02rem; line-height: 1.72; color: rgba(251,246,243,0.88); margin: 0 0 1.6rem;
        }
        .h02tm-who { display: flex; align-items: center; gap: 0.85rem; }
        .h02tm-av {
          width: 2.8rem; height: 2.8rem; border-radius: 999px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-primary, #C0685C); color: #fff;
          font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em;
        }
        .h02tm-name { font-size: 0.98rem; font-weight: 600; color: #FBF6F3; display: block; }
        .h02tm-role { font-size: 0.84rem; color: rgba(251,246,243,0.62); }
        @media (max-width: 899px) {
          .h02tm-grid { grid-template-columns: 1fr; gap: 2.2rem; }
          .h02tm-item { padding: 2.2rem 0 0; border-left: none; border-top: 1px solid rgba(251,246,243,0.14); }
          .h02tm-item:first-child { padding-top: 0; border-top: none; }
          .h02tm-score { text-align: left; }
        }
      `}</style>
      <div className="h02tm-inner">
        <div className="h02tm-head">
          <div>
            <span className="h02tm-eyebrow">
              <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
            </span>
            <h2 className="h02tm-title">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
            </h2>
          </div>
          {rating && (
            <div className="h02tm-score">
              <span className="h02tm-score-v">
                <GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" />
              </span>
              <span className="h02tm-score-l">
                <GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" />
              </span>
            </div>
          )}
        </div>
        <div className="h02tm-grid">
          {items.map((t, i) => (
            <figure className="h02tm-item" key={i}>
              <div className="h02tm-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>
                {"★".repeat(Number(t.rating ?? 5) || 5)}
              </div>
              <blockquote className="h02tm-text">
                <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" />
              </blockquote>
              <figcaption className="h02tm-who">
                <span className="h02tm-av" aria-hidden>{initials(t.author ?? "")}</span>
                <span>
                  <span className="h02tm-name">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" />
                  </span>
                  <span className="h02tm-role">
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" />
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

CONTACT = '''
// contact-hair-02-location — V3: vlevo kontaktní hairline řádky + otevírací doba +
// foto salonu, vpravo REÁLNÝ formulář (POST /api/demo/<slug>/contact) se stavy
// sending/success/error, honeypotem a GDPR poznámkou.
function ContactHair02Location({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tag = String(content.tag ?? "Kontakt");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const image = String(content.image ?? "");
  const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [tel, setTel] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || honeypot || !tenantSlug) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: mail, phone: tel, message, website: honeypot }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu.");
        setStatus("error");
      } else {
        setStatus("success");
        setName(""); setMail(""); setTel(""); setMessage("");
      }
    } catch {
      setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu.");
      setStatus("error");
    }
  }

  return (
    <section id="kontakt" data-section-type="contact" data-variant="contact-hair-02-location" className="h02co-section" data-template="hair-02">
      <style>{`
        .h02co-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h02co-inner {
          max-width: 80rem; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem, 5vw, 4.5rem); align-items: start;
        }
        .h02co-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--color-primary, #C0685C);
        }
        .h02co-eyebrow::before { content: ""; width: 30px; height: 1.5px; background: var(--color-primary, #C0685C); }
        .h02co-title {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2rem, 4.2vw, 3.1rem); line-height: 1.08; letter-spacing: -0.02em;
          color: var(--color-text, #2A211E); margin: 0 0 1rem; text-wrap: balance;
        }
        .h02co-body { font-size: 1.02rem; line-height: 1.68; color: var(--color-text-muted, #7C6B64); margin: 0 0 2rem; max-width: 46ch; }
        .h02co-rows { margin-bottom: 2rem; }
        .h02co-row {
          display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding: 0.85rem 0; border-bottom: 1px solid var(--color-border, #EADDD6);
        }
        .h02co-row:first-child { border-top: 1px solid var(--color-border, #EADDD6); }
        .h02co-k { font-size: 0.86rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-text-muted, #7C6B64); }
        .h02co-v { font-size: 1rem; font-weight: 600; color: var(--color-text, #2A211E); text-align: right; text-decoration: none; }
        a.h02co-v:hover { color: var(--color-primary, #C0685C); }
        .h02co-photo { border-radius: 20px; overflow: hidden; aspect-ratio: 4 / 3; display: block; background: #F3E3DC; }
        .h02co-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h02co-form {
          background: #F3E3DC; border-radius: 20px; padding: clamp(1.6rem, 3vw, 2.4rem);
        }
        .h02co-form h3 {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400; font-size: 1.6rem;
          color: var(--color-text, #2A211E); margin: 0 0 1.4rem;
        }
        .h02co-field { margin-bottom: 1rem; }
        .h02co-field label {
          display: block; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.03em;
          color: #6B564F; margin-bottom: 0.4rem;
        }
        .h02co-field input, .h02co-field textarea {
          width: 100%; padding: 0.8rem 1rem; border-radius: 12px; box-sizing: border-box;
          border: 1px solid #E2CCC3; background: #fff; color: var(--color-text, #2A211E);
          font-family: inherit; font-size: 0.96rem;
        }
        .h02co-field input:focus, .h02co-field textarea:focus {
          outline: 2px solid var(--color-primary, #C0685C); outline-offset: 1px; border-color: transparent;
        }
        .h02co-field textarea { min-height: 7rem; resize: vertical; }
        .h02co-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .h02co-submit {
          width: 100%; padding: 0.95rem 1.5rem; border: none; border-radius: 999px; cursor: pointer;
          background: var(--color-primary, #C0685C); color: #fff; font-family: inherit;
          font-size: 0.98rem; font-weight: 600; transition: background 0.25s, transform 0.25s;
        }
        .h02co-submit:hover:not(:disabled) { background: var(--color-accent, #9E5147); transform: translateY(-1px); }
        .h02co-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .h02co-note { font-size: 0.8rem; line-height: 1.5; color: #7A655D; margin: 0.9rem 0 0; }
        .h02co-msg { font-size: 0.92rem; margin: 0.9rem 0 0; padding: 0.75rem 1rem; border-radius: 12px; }
        .h02co-msg[data-kind="success"] { background: #E4F0E8; color: #1F5133; }
        .h02co-msg[data-kind="error"] { background: #F7DFDC; color: #8A2B22; }
        @media (max-width: 899px) { .h02co-inner { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h02co-inner">
        <div>
          <span className="h02co-eyebrow">
            <GenericEditableText sectionId={sectionId} field="tag" value={tag} tag="span" />
          </span>
          <h2 className="h02co-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p className="h02co-body">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          <div className="h02co-rows">
            {phone && (
              <div className="h02co-row">
                <span className="h02co-k">Telefon</span>
                <a className="h02co-v" href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a>
              </div>
            )}
            {email && (
              <div className="h02co-row">
                <span className="h02co-k">E-mail</span>
                <a className="h02co-v" href={`mailto:${email}`}>{email}</a>
              </div>
            )}
            {address && (
              <div className="h02co-row">
                <span className="h02co-k">Adresa</span>
                <span className="h02co-v">
                  <GenericEditableText sectionId={sectionId} field="address" value={address.replace(/\\n/g, ", ")} tag="span" />
                </span>
              </div>
            )}
            {hours.map((h, i) => (
              <div className="h02co-row" key={i}>
                <span className="h02co-k">
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                </span>
                <span className="h02co-v">
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                </span>
              </div>
            ))}
          </div>
          {image && (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h02co-photo">
              <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          )}
        </div>

        <form className="h02co-form" onSubmit={handleSubmit} style={{ position: "relative" }}>
          <h3>Napište nám</h3>
          <div className="h02co-field">
            <label htmlFor={`h02-name-${sectionId}`}>Jméno *</label>
            <input id={`h02-name-${sectionId}`} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="h02co-field">
            <label htmlFor={`h02-mail-${sectionId}`}>E-mail *</label>
            <input id={`h02-mail-${sectionId}`} type="email" required value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" />
          </div>
          <div className="h02co-field">
            <label htmlFor={`h02-tel-${sectionId}`}>Telefon</label>
            <input id={`h02-tel-${sectionId}`} value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" />
          </div>
          <div className="h02co-field">
            <label htmlFor={`h02-msg-${sectionId}`}>Zpráva *</label>
            <textarea id={`h02-msg-${sectionId}`} required value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="h02co-hp" aria-hidden>
            <label htmlFor={`h02-web-${sectionId}`}>Nevyplňujte</label>
            <input id={`h02-web-${sectionId}`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
          <button type="submit" className="h02co-submit" disabled={status === "sending"}>
            {status === "sending" ? "Odesílám…" : "Odeslat zprávu"}
          </button>
          {status === "success" && <p className="h02co-msg" data-kind="success" role="status">Děkujeme, ozveme se vám do 24 hodin.</p>}
          {status === "error" && <p className="h02co-msg" data-kind="error" role="alert">{errorMsg}</p>}
          <p className="h02co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
        </form>
      </div>
    </section>
  );
}
'''

FOOTER = '''
// hair-02-footer — V3 tmavý footer (#3B2B27) + WeberoCredit v copyright baru.
// Pole: siteName/tagline/heading/ctaText/ctaHref/phone/email/address/hours/links/socials/legal.
function FooterHair02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName = String(content.siteName ?? "Salon Blush");
  const heading = String(content.heading ?? "Těšíme se na vás");
  const tagline = String(content.tagline ?? "");
  const ctaText = String(content.ctaText ?? "On-line rezervace");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const hoursLabel = String(content.hoursLabel ?? "Otevírací doba");
  const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const socials = (content.socials as Array<{ label: string; href: string }>) ?? [];
  const legal = String(content.legal ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-section-type="footer" data-variant="hair-02-footer" className="h02ft-footer" data-template="hair-02">
      <style>{`
        .h02ft-footer {
          background: var(--color-secondary, #3B2B27); color: #FBF6F3;
          font-family: 'Schibsted Grotesk', sans-serif;
          padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.75rem) 0;
        }
        .h02ft-inner { max-width: 80rem; margin: 0 auto; }
        .h02ft-top {
          display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
          flex-wrap: wrap; padding-bottom: clamp(2.2rem, 4vw, 3rem);
        }
        .h02ft-heading {
          font-family: 'Newsreader', Georgia, serif; font-weight: 400;
          font-size: clamp(2rem, 4.4vw, 3.1rem); line-height: 1.08; letter-spacing: -0.02em;
          color: #FBF6F3; margin: 0 0 0.7rem; text-wrap: balance;
        }
        .h02ft-tagline { font-size: 1rem; line-height: 1.6; color: rgba(251,246,243,0.72); margin: 0; max-width: 42ch; }
        .h02ft-cta {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.95rem 2rem; border-radius: 999px;
          background: var(--color-primary, #C0685C); color: #fff; font-size: 0.96rem; font-weight: 600;
          text-decoration: none; white-space: nowrap; transition: background 0.25s, transform 0.25s;
        }
        .h02ft-cta:hover { background: var(--color-accent, #9E5147); transform: translateY(-2px); }
        .h02ft-cols {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(1.6rem, 3vw, 2.6rem);
          padding: clamp(2.2rem, 4vw, 3rem) 0;
          border-top: 1px solid rgba(251,246,243,0.14);
        }
        .h02ft-h {
          font-size: 0.76rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: #E8A99D; margin: 0 0 1.1rem;
        }
        .h02ft-list { list-style: none; margin: 0; padding: 0; }
        .h02ft-list li { margin-bottom: 0.6rem; font-size: 0.95rem; color: rgba(251,246,243,0.8); line-height: 1.5; }
        .h02ft-list a { color: rgba(251,246,243,0.8); text-decoration: none; transition: color 0.2s; }
        .h02ft-list a:hover { color: #E8A99D; }
        .h02ft-hrow { display: flex; justify-content: space-between; gap: 1rem; }
        .h02ft-bottom {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          padding: 1.4rem 0 calc(1.4rem + env(safe-area-inset-bottom));
          border-top: 1px solid rgba(251,246,243,0.14);
          font-size: 0.85rem; color: rgba(251,246,243,0.6);
        }
        @media (max-width: 899px) { .h02ft-cols { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 519px) { .h02ft-cols { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h02ft-inner">
        <div className="h02ft-top">
          <div>
            <h2 className="h02ft-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            {tagline && (
              <p className="h02ft-tagline">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="h02ft-cta">{ctaText}</a>
        </div>

        <div className="h02ft-cols">
          <div>
            <h3 className="h02ft-h">Navigace</h3>
            <ul className="h02ft-list">
              {links.map((l, i) => (
                <li key={i}><a href={resolve(l.href)}>{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h02ft-h">Kontakt</h3>
            <ul className="h02ft-list">
              {phone && <li><a href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a></li>}
              {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
              {address && <li><GenericEditableText sectionId={sectionId} field="address" value={address.replace(/\\n/g, ", ")} tag="span" /></li>}
            </ul>
          </div>
          <div>
            <h3 className="h02ft-h">{hoursLabel}</h3>
            <ul className="h02ft-list">
              {hours.map((h, i) => (
                <li className="h02ft-hrow" key={i}>
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h02ft-h">Sledujte nás</h3>
            <ul className="h02ft-list">
              {socials.map((s, i) => (
                <li key={i}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h02ft-bottom">
          <span>
            <GenericEditableText sectionId={sectionId} field="legal" value={legal || siteName} tag="span" />
          </span>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}
'''

if __name__ == "__main__":
    print("hair-02 rebuild — etapa A (navbar + hero + page hero)")
    replace_fn("NavbarSection.tsx", "NavbarHair02", NAVBAR)
    replace_fn("HeroSection.tsx", "HeroHair02Slider", HERO)
    # slider potřebuje tenantSlug/isAdmin kvůli resolveDemoHref u CTA
    hp = SEC / "HeroSection.tsx"
    hp.write_text(hp.read_text().replace(
        "<HeroHair02Slider content={content} sectionId={sectionId} />",
        "<HeroHair02Slider content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />"))
    insert_before("HeroSection.tsx", "function HeroHair02Slider(", HERO_PAGE, "function HeroHair02Page(")
    add_dispatch(
        "HeroSection.tsx",
        'return <HeroHair02Slider content={content}',
        '  }\n  if (variant === "hero-hair-02-page") {\n    return <HeroHair02Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
    )

    print("etapa B (about + promo + služby)")
    replace_inline_block(
        "AboutSection.tsx", "about-hair-02-story",
        '  if (variant === "about-hair-02-story") {\n'
        '    return <AboutHair02Story content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
        '  }',
    )
    append_fn("AboutSection.tsx", ABOUT, "function AboutHair02Story(")
    replace_fn("CtaSection.tsx", "CtaHair02Promo", PROMO)
    append_fn("ServicesSection.tsx", SERVICES, "function ServicesHair02(")
    add_dispatch(
        "ServicesSection.tsx",
        'return <ServicesHair01 content={content}',
        '  }\n  if (variant === "hair-02-services") {\n    return <ServicesHair02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
    )

    print("etapa C (galerie + recenze + kontakt + footer)")
    append_fn("GallerySection.tsx", GALLERY, "function GalleryHair02(")
    add_dispatch(
        "GallerySection.tsx",
        'if (variant === "proof-01-beforeafter")',
        '  if (variant === "hair-02-gallery") return <GalleryHair02 content={content} sectionId={sectionId} />;',
    )
    append_fn("TestimonialsSection.tsx", TESTIMONIALS, "function TestimonialsHair02(")
    add_dispatch(
        "TestimonialsSection.tsx",
        'return <TestimonialsHair01 content={content}',
        '  }\n    if (variant === "hair-02-testimonials") {\n    return <TestimonialsHair02 content={content} sectionId={sectionId} />;',
    )
    replace_fn("ContactSection.tsx", "ContactHair02Location", CONTACT)
    ct = SEC / "ContactSection.tsx"
    ct.write_text(ct.read_text().replace(
        "<ContactHair02Location content={content} sectionId={sectionId} />",
        "<ContactHair02Location content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />"))
    append_fn("FooterSection.tsx", FOOTER, "function FooterHair02(")
    add_dispatch(
        "FooterSection.tsx",
        'return <FooterHair01 content={content}',
        '  }\n    if (variant === "hair-02-footer") {\n    return <FooterHair02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
    )
    print("hotovo.")
