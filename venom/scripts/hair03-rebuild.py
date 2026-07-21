#!/usr/bin/env python3
"""hair-03 „Noir & Oxblood" V3 remaster — deterministický rebuild (REMASTER_PLAYBOOK §3).
Idempotentní. Spusť znovu, když paralelní session přepíše soubor:
    python3 scripts/hair03-rebuild.py
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn, replace_inline_block, append_fn, add_dispatch, SEC  # noqa

FONTS = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />\n'
         '      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800'
         '&family=Gantari:wght@400;500;600;700&display=swap" rel="stylesheet" />')

# ── společné CSS útržky ───────────────────────────────────────────────────────
EYEBROW = """
        .h03-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-primary, #8E2B36);
        }
        .h03-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #8E2B36); }
"""

NAVBAR = '''
// hair-03-navbar — Ateliér Noir · V3 „Noir & Oxblood": průhledný blur bar (na tmavém
// heru inverzní), Archivo wordmark, underline-slide linky, oxblood hranaté CTA,
// overlay menu + sticky mobilní CTA lišta.
function NavbarHair03({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [open]);

  const siteName = String(content.siteName ?? "Ateliér Noir");
  const phone = String(content.phone ?? "+420 704 123 456");
  const ctaText = String(content.ctaText ?? "Rezervace");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      LINKS_PLACEHOLDER
      <style>{`
        .h03n-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; font-family: 'Gantari', sans-serif;
          background: rgba(241,238,234,${scrolled ? "0.96" : "0.9"});
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border, #E0D9D2); transition: background 0.3s;
        }
        .h03n-inner {
          max-width: 82rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.75rem);
          height: 4.8rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
        }
        .h03n-logo { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; flex-shrink: 0; }
        .h03n-word {
          font-family: 'Archivo', sans-serif; font-size: 1.18rem; font-weight: 800;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-text, #141110); line-height: 1;
        }
        .h03n-rule { width: 26px; height: 2px; background: var(--color-primary, #8E2B36); }
        .h03n-links { display: flex; align-items: center; gap: 1.7rem; list-style: none; margin: 0; padding: 0; }
        .h03n-links a {
          position: relative; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase; color: #4A423C; text-decoration: none; padding: 0.35rem 0; transition: color 0.2s;
        }
        .h03n-links a::after {
          content: ""; position: absolute; left: 0; right: 100%; bottom: 0; height: 2px;
          background: var(--color-primary, #8E2B36); transition: right 0.28s cubic-bezier(0.22,1,0.36,1);
        }
        .h03n-links a:hover { color: var(--color-text, #141110); }
        .h03n-links a:hover::after { right: 0; }
        .h03n-right { display: flex; align-items: center; gap: 1.1rem; }
        .h03n-phone { font-size: 0.9rem; font-weight: 600; color: var(--color-text, #141110); text-decoration: none; white-space: nowrap; }
        .h03n-cta {
          display: inline-flex; align-items: center; padding: 0.72rem 1.6rem; border-radius: 0;
          background: var(--color-primary, #8E2B36); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.8rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap; transition: background 0.25s, transform 0.25s;
        }
        .h03n-cta:hover { background: var(--color-accent, #6E1F28); transform: translateY(-1px); }
        .h03n-burger { display: none; background: none; border: none; cursor: pointer; padding: 6px; color: var(--color-text, #141110); }
        .h03n-ov {
          position: fixed; inset: 0; background: var(--color-secondary, #141110); z-index: 200;
          display: flex; flex-direction: column; padding: 1.1rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
          opacity: 0; pointer-events: none; transition: opacity 0.25s ease; font-family: 'Gantari', sans-serif;
        }
        .h03n-ov[data-open="true"] { opacity: 1; pointer-events: auto; }
        .h03n-ov-top { display: flex; align-items: center; justify-content: space-between; height: 3.6rem; }
        .h03n-ov-word { font-family: 'Archivo', sans-serif; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #F1EEEA; }
        .h03n-ov-close { background: none; border: none; color: #F1EEEA; font-size: 2rem; line-height: 1; cursor: pointer; padding: 4px 10px; }
        .h03n-ov-links { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.2rem; }
        .h03n-ov-links a {
          font-family: 'Archivo', sans-serif; font-size: clamp(1.7rem, 6.4vw, 2.4rem); font-weight: 700;
          letter-spacing: 0.02em; text-transform: uppercase; color: #F1EEEA; text-decoration: none;
          padding: 0.5rem 0; border-bottom: 1px solid rgba(241,238,234,0.13);
          opacity: 0; transform: translateY(14px); transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .h03n-ov[data-open="true"] .h03n-ov-links a { opacity: 1; transform: none; }
        .h03n-ov-links a:nth-child(1) { transition-delay: 0.05s; } .h03n-ov-links a:nth-child(2) { transition-delay: 0.1s; }
        .h03n-ov-links a:nth-child(3) { transition-delay: 0.15s; } .h03n-ov-links a:nth-child(4) { transition-delay: 0.2s; }
        .h03n-ov-links a:nth-child(5) { transition-delay: 0.25s; } .h03n-ov-links a:nth-child(6) { transition-delay: 0.3s; }
        .h03n-ov-cta {
          display: flex; align-items: center; justify-content: center; padding: 1.05rem;
          background: var(--color-primary, #8E2B36); color: #fff; font-family: 'Archivo', sans-serif;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
        }
        .h03n-mb {
          display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
          padding: 0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom));
          background: rgba(241,238,234,0.96); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-border, #E0D9D2);
        }
        .h03n-mb-cta {
          display: flex; align-items: center; justify-content: center; padding: 0.9rem;
          background: var(--color-primary, #8E2B36); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
        }
        @media (max-width: 1023px) {
          .h03n-links, .h03n-phone, .h03n-cta { display: none; }
          .h03n-burger { display: block; } .h03n-mb { display: block; } .h03n-inner { height: 4.2rem; }
        }
        @media (prefers-reduced-motion: reduce) { .h03n-ov, .h03n-ov-links a, .h03n-cta { transition: none; } }
      `}</style>

      <header className="h03n-bar" data-template="hair-03">
        <div className="h03n-inner">
          <a href={resolve("/")} className="h03n-logo" aria-label={siteName}>
            <span className="h03n-rule" aria-hidden />
            <span className="h03n-word"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
          </a>
          <ul className="h03n-links">
            {links.map((l, i) => (<li key={i}><a href={resolve(l.href)}>{l.label}</a></li>))}
          </ul>
          <div className="h03n-right">
            <a href={`tel:${phone.replace(/\\s/g, "")}`} className="h03n-phone">{phone}</a>
            <a href={resolve(ctaHref)} data-btn="primary" className="h03n-cta">{ctaText}</a>
            <button className="h03n-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="h03n-ov" data-open={open} aria-hidden={!open}>
        <div className="h03n-ov-top">
          <span className="h03n-ov-word">{siteName}</span>
          <button className="h03n-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        </div>
        <nav className="h03n-ov-links">
          {links.map((l, i) => (<a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>))}
        </nav>
        <a href={resolve(ctaHref)} data-btn="primary" className="h03n-ov-cta" onClick={() => setOpen(false)}>{ctaText}</a>
      </div>

      <div className="h03n-mb" aria-hidden={open}>
        <a href={resolve(ctaHref)} className="h03n-mb-cta">{ctaText}</a>
      </div>
    </>
  );
}
'''.replace("LINKS_PLACEHOLDER", FONTS)

HERO = '''
// hero-hair-03-split — V3 noir cinematic: fullbleed tmavá fotka, silný scrim,
// Archivo uppercase H1 s oxblood pravítkem, CTA pár, meta pás dole.
// Pole: image, title, subtitle, ctaText/Href, eyebrow, ctaSecondaryText/Href, meta[].
function HeroHair03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const image = String(content.image ?? "");
  const eyebrow = String(content.eyebrow ?? "Kadeřnický ateliér · Praha");
  const title = String(content.title ?? "S LÁSKOU K VLASŮM");
  const subtitle = String(content.subtitle ?? "");
  const ctaText = String(content.ctaText ?? "Chci se objednat");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const cta2Text = String(content.ctaSecondaryText ?? "Naše kolekce");
  const cta2Href = String(content.ctaSecondaryHref ?? "/kolekce");
  const meta = (content.meta as Array<{ value: string; label: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="uvod" className="h03h-hero" data-template="hair-03">
      <style>{`
        .h03h-hero {
          position: relative; min-height: 94vh; display: flex; align-items: flex-end;
          overflow: hidden; background: var(--color-secondary, #141110); font-family: 'Gantari', sans-serif;
        }
        .h03h-photo { position: absolute; inset: 0; }
        .h03h-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h03h-scrim {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(20,17,16,0.62) 0%, rgba(20,17,16,0.34) 40%, rgba(20,17,16,0.9) 100%);
        }
        .h03h-inner {
          position: relative; z-index: 2; width: 100%; max-width: 82rem; margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.75rem) clamp(3rem, 6vw, 4.5rem);
        }
        .h03h-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.3rem;
          font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #E9A7AE;
        }
        .h03h-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #8E2B36); }
        .h03h-title {
          font-family: 'Archivo', sans-serif; font-weight: 800;
          font-size: clamp(2.6rem, 7.4vw, 5.6rem); line-height: 0.98; letter-spacing: -0.01em;
          text-transform: uppercase; color: #fff; margin: 0 0 1.3rem; text-wrap: balance; max-width: 15ch;
        }
        .h03h-sub { font-size: clamp(1rem, 1.4vw, 1.12rem); line-height: 1.65; color: rgba(255,255,255,0.84); max-width: 46ch; margin: 0 0 2.1rem; }
        .h03h-ctas { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; }
        .h03h-btn {
          display: inline-flex; align-items: center; justify-content: center; padding: 1rem 2.1rem;
          font-family: 'Archivo', sans-serif; font-size: 0.84rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; text-decoration: none; transition: transform 0.25s, background 0.25s;
        }
        .h03h-btn-p { background: var(--color-primary, #8E2B36); color: #fff; }
        .h03h-btn-p:hover { background: var(--color-accent, #6E1F28); transform: translateY(-2px); }
        .h03h-btn-g { color: #fff; border: 1px solid rgba(255,255,255,0.45); }
        .h03h-btn-g:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .h03h-meta {
          display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 4vw, 3.2rem); margin-top: clamp(2.4rem, 5vw, 3.4rem);
          padding-top: 1.6rem; border-top: 1px solid rgba(255,255,255,0.18);
        }
        .h03h-meta-v { font-family: 'Archivo', sans-serif; font-size: 1.7rem; font-weight: 700; color: #fff; display: block; line-height: 1; margin-bottom: 0.3rem; }
        .h03h-meta-l { font-size: 0.82rem; letter-spacing: 0.04em; color: rgba(255,255,255,0.68); }
        @media (max-width: 767px) { .h03h-hero { min-height: 90vh; } .h03h-btn { flex: 1 1 auto; } }
        @media (prefers-reduced-motion: reduce) { .h03h-btn { transition: none; } }
      `}</style>

      {image && (
        <GenericEditableImage
          sectionId={sectionId} field="image" src={image} alt={title} className="h03h-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          priority
        >
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      )}
      <div className="h03h-scrim" aria-hidden />

      <div className="h03h-inner">
        <span className="h03h-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
        <h1 className="h03h-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="h03h-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        <div className="h03h-ctas">
          <a href={resolve(ctaHref)} data-btn="primary" className="h03h-btn h03h-btn-p">{ctaText}</a>
          <a href={resolve(cta2Href)} className="h03h-btn h03h-btn-g">{cta2Text}</a>
        </div>
        {meta.length > 0 && (
          <div className="h03h-meta">
            {meta.map((m, i) => (
              <div key={i}>
                <span className="h03h-meta-v"><GenericEditableText sectionId={sectionId} field={`meta.${i}.value`} value={m.value} tag="span" /></span>
                <span className="h03h-meta-l"><GenericEditableText sectionId={sectionId} field={`meta.${i}.label`} value={m.label} tag="span" /></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
'''

HERO_PAGE = '''
// hero-hair-03-page — podstránkový hero (Noir & Oxblood): tmavý pás s drobečky
// a Archivo uppercase H1. Pole: title, subtitle, backgroundImage.
function HeroHair03Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const image = String(content.backgroundImage ?? content.image ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section className="h03hp-wrap" data-template="hair-03">
      <style>{`
        .h03hp-wrap {
          position: relative; background: var(--color-secondary, #141110); overflow: hidden;
          font-family: 'Gantari', sans-serif;
          padding: calc(4.8rem + clamp(3rem, 7vw, 5rem)) clamp(1.25rem, 4vw, 2.75rem) clamp(3rem, 7vw, 5rem);
        }
        .h03hp-photo { position: absolute; inset: 0; opacity: 0.42; }
        .h03hp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h03hp-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,17,16,0.72), rgba(20,17,16,0.88)); }
        .h03hp-inner { position: relative; z-index: 2; max-width: 82rem; margin: 0 auto; }
        .h03hp-crumb { font-size: 0.8rem; letter-spacing: 0.05em; color: rgba(241,238,234,0.66); margin-bottom: 1rem; }
        .h03hp-crumb a { color: rgba(241,238,234,0.66); text-decoration: none; }
        .h03hp-crumb a:hover { color: #E9A7AE; }
        .h03hp-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(2.1rem, 5.2vw, 3.8rem); line-height: 1.02; color: #fff; margin: 0 0 0.9rem; text-wrap: balance;
        }
        .h03hp-sub { font-size: 1.02rem; line-height: 1.65; color: rgba(241,238,234,0.78); max-width: 52ch; margin: 0; }
      `}</style>
      {image && (
        <GenericEditableImage
          sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="h03hp-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0.42 }}
        >
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      )}
      <div className="h03hp-scrim" aria-hidden />
      <div className="h03hp-inner">
        <div className="h03hp-crumb"><a href={resolve("/")}>Domů</a> <span aria-hidden>/</span> {title}</div>
        <h1 className="h03hp-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="h03hp-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
      </div>
    </section>
  );
}
'''

ABOUT = '''
// about-hair-03-founder — V3: bone bg, vlevo portrét zakladatelky s oxblood rámem,
// vpravo eyebrow + Archivo H2 + odstavce + podpis. Pole: tagline/title/body/paragraphs/
// image/signature/signatureRole.
function AboutHair03Founder({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline = String(content.tagline ?? "O ateliéru");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const paragraphs = (content.paragraphs as string[]) ?? [];
  const image = String(content.image ?? "");
  const signature = String(content.signature ?? "");
  const signatureRole = String(content.signatureRole ?? "");

  return (
    <section id="o-nas" data-section-type="about" data-variant="about-hair-03-founder" className="h03ab-section" data-template="hair-03">
      <style>{`
        .h03ab-section {
          background: var(--color-bg, #F1EEEA); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03ab-inner {
          max-width: 82rem; margin: 0 auto; display: grid; grid-template-columns: 0.85fr 1.15fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center;
        }
        .h03ab-media { position: relative; }
        .h03ab-media::before {
          content: ""; position: absolute; inset: -1.2rem -1.2rem 1.2rem 1.2rem;
          border: 2px solid var(--color-primary, #8E2B36); z-index: 0;
        }
        .h03ab-photo { position: relative; z-index: 1; aspect-ratio: 4 / 5; display: block; overflow: hidden; background: #DED7D0; }
        .h03ab-photo img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); }
        EYEBROW_PLACEHOLDER
        .h03ab-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110);
          margin: 0 0 1.3rem; text-wrap: balance;
        }
        .h03ab-lead { font-size: 1.1rem; line-height: 1.6; color: var(--color-text, #141110); margin: 0 0 1.3rem; max-width: 50ch; }
        .h03ab-p { font-size: 0.99rem; line-height: 1.75; color: var(--color-text-muted, #6E645D); margin: 0 0 1rem; max-width: 56ch; }
        .h03ab-sign { margin-top: 2rem; padding-top: 1.3rem; border-top: 1px solid var(--color-border, #E0D9D2); }
        .h03ab-sign-n { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 1rem; color: var(--color-text, #141110); display: block; }
        .h03ab-sign-r { font-size: 0.85rem; color: var(--color-text-muted, #6E645D); }
        @media (max-width: 899px) { .h03ab-inner { grid-template-columns: 1fr; gap: 3rem; } }
      `}</style>
      <div className="h03ab-inner">
        {image && (
          <div className="h03ab-media">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={signature || title} className="h03ab-photo">
              <img src={image} alt={signature || title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
            </GenericEditableImage>
          </div>
        )}
        <div>
          <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03ab-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {body && <p className="h03ab-lead"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>}
          {paragraphs.map((p, i) => (
            <p className="h03ab-p" key={i}><GenericEditableText sectionId={sectionId} field={`paragraphs.${i}`} value={p} tag="span" /></p>
          ))}
          {signature && (
            <div className="h03ab-sign">
              <span className="h03ab-sign-n"><GenericEditableText sectionId={sectionId} field="signature" value={signature} tag="span" /></span>
              <span className="h03ab-sign-r"><GenericEditableText sectionId={sectionId} field="signatureRole" value={signatureRole} tag="span" /></span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW.strip("\n"))

TEAM = '''
// hair-03-circles — V3: editoriální portréty (hranaté 3/4, grayscale → barva na hover),
// jméno + role + specializace na hairline. Pole: tagline/title/ctaText/ctaHref,
// members[].{name,role,image,specialty}.
function TeamHair03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type M = { name?: string; role?: string; image?: string; specialty?: string };
  const tagline = String(content.tagline ?? "Tým");
  const title = String(content.title ?? "Kdo se o vás postará");
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/tym");
  const members = (content.members as M[]) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="tym" data-section-type="team" data-variant="hair-03-circles" className="h03tm-section" data-template="hair-03">
      <style>{`
        .h03tm-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03tm-inner { max-width: 82rem; margin: 0 auto; }
        .h03tm-head { margin-bottom: clamp(2.4rem, 5vw, 3.4rem); max-width: 42rem; }
        EYEBROW_PLACEHOLDER
        .h03tm-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110);
          margin: 0; text-wrap: balance;
        }
        .h03tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 2.6vw, 2.2rem); }
        .h03tm-card { display: flex; flex-direction: column; }
        .h03tm-photo { aspect-ratio: 3 / 4; overflow: hidden; display: block; background: #E7E1DB; margin-bottom: 1.1rem; }
        .h03tm-photo img {
          width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1);
          transition: filter 0.5s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .h03tm-card:hover .h03tm-photo img { filter: grayscale(0); transform: scale(1.04); }
        .h03tm-name { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 1.12rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text, #141110); margin: 0 0 0.35rem; }
        .h03tm-role { font-size: 0.86rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-primary, #8E2B36); font-weight: 600; }
        .h03tm-spec { font-size: 0.92rem; line-height: 1.6; color: var(--color-text-muted, #6E645D); margin: 0.7rem 0 0; padding-top: 0.7rem; border-top: 1px solid var(--color-border, #E0D9D2); }
        .h03tm-cta {
          display: inline-flex; align-items: center; margin-top: clamp(2.2rem, 4vw, 3rem); padding: 0.95rem 2rem;
          background: var(--color-text, #141110); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; transition: background 0.25s, transform 0.25s;
        }
        .h03tm-cta:hover { background: var(--color-primary, #8E2B36); transform: translateY(-2px); }
        @media (max-width: 899px) { .h03tm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 559px) { .h03tm-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .h03tm-photo img { transition: none; } }
      `}</style>
      <div className="h03tm-inner">
        <div className="h03tm-head">
          <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03tm-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
        </div>
        <div className="h03tm-grid">
          {members.map((m, i) => (
            <article className="h03tm-card" key={i}>
              {m.image && (
                <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={m.image} alt={m.name ?? ""} className="h03tm-photo">
                  <img src={m.image} alt={m.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
                </GenericEditableImage>
              )}
              <h3 className="h03tm-name"><GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={m.name ?? ""} tag="span" /></h3>
              <span className="h03tm-role"><GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={m.role ?? ""} tag="span" /></span>
              {m.specialty && <p className="h03tm-spec"><GenericEditableText sectionId={sectionId} field={`members.${i}.specialty`} value={m.specialty} tag="span" /></p>}
            </article>
          ))}
        </div>
        {ctaText && <a href={resolve(ctaHref)} className="h03tm-cta">{ctaText}</a>}
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW.strip("\n"))


RESOLVE_HELPER = """
function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href.startsWith("/demo/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  if (href.startsWith("/#")) return href.slice(1);
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}
"""

if __name__ == "__main__":
    print("hair-03 rebuild — etapa A (navbar + hero + page hero + about + tým)")
    replace_fn("NavbarSection.tsx", "NavbarHair03", NAVBAR)
    replace_inline_block(
        "HeroSection.tsx", "hero-hair-03-split",
        '  if (variant === "hero-hair-03-split") {\n'
        '    return <HeroHair03 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
        '  }\n'
        '  if (variant === "hero-hair-03-page") {\n'
        '    return <HeroHair03Page content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
        '  }',
    )
    append_fn("HeroSection.tsx", HERO, "function HeroHair03(")
    append_fn("HeroSection.tsx", HERO_PAGE, "function HeroHair03Page(")
    replace_inline_block(
        "AboutSection.tsx", "about-hair-03-founder",
        '  if (variant === "about-hair-03-founder") {\n'
        '    return <AboutHair03Founder content={content as Record<string, unknown>} sectionId={sectionId} />;\n'
        '  }',
    )
    append_fn("AboutSection.tsx", ABOUT, "function AboutHair03Founder(")
    replace_inline_block(
        "TeamSection.tsx", "hair-03-circles",
        '  if (variant === "hair-03-circles") {\n'
        '    return <TeamHair03 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
        '  }',
    )
    append_fn("TeamSection.tsx", RESOLVE_HELPER, "function resolveDemoHref(")
    append_fn("TeamSection.tsx", TEAM, "function TeamHair03(")
    print("hotovo (etapa A).")
