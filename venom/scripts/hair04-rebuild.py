#!/usr/bin/env python3
"""hair-04 „Studio Pop" V3 remaster — deterministický rebuild (REMASTER_PLAYBOOK §3).
Idempotentní: python3 scripts/hair04-rebuild.py
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn, replace_inline_block, append_fn, add_dispatch, SEC  # noqa

FONTS = ('<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />\n'
         '      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700'
         '&family=Epilogue:wght@400;500;600;700&display=swap" rel="stylesheet" />')

EB = """        .h04-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary, #6D4AFF);
        }
        .h04-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #6D4AFF); }"""

H2 = """          font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: var(--color-text, #17132A);
          margin: 0 0 0.9rem; text-wrap: balance;"""

NAVBAR = '''
// hair-04-navbar — Studio Pop · V3: blur sticky bar, Space Grotesk wordmark s violet
// tečkou, underline-slide linky, violet pill CTA, overlay menu + sticky mobilní CTA lišta.
function NavbarHair04({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 30);
    s(); window.addEventListener("scroll", s, { passive: true });
    return () => window.removeEventListener("scroll", s);
  }, []);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [open]);

  const siteName = String(content.siteName ?? "Studio Pop");
  const phone = String(content.phone ?? "+420 704 123 456");
  const ctaText = String(content.ctaText ?? "Rezervovat");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      LINKS_PLACEHOLDER
      <style>{`
        .h04n-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; font-family: 'Epilogue', sans-serif;
          background: rgba(245,244,250,${scrolled ? "0.95" : "0.86"});
          -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border, #E4E1F2); transition: background 0.3s;
        }
        .h04n-inner { max-width: 82rem; margin: 0 auto; padding: 0 clamp(1.25rem, 4vw, 2.75rem);
          height: 4.9rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
        .h04n-logo { display: flex; align-items: center; gap: 0.45rem; text-decoration: none; flex-shrink: 0; }
        .h04n-word { font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--color-text, #17132A); line-height: 1; }
        .h04n-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--color-primary, #6D4AFF); }
        .h04n-links { display: flex; align-items: center; gap: 1.7rem; list-style: none; margin: 0; padding: 0; }
        .h04n-links a { position: relative; font-size: 0.94rem; font-weight: 500; color: #5A5370;
          text-decoration: none; padding: 0.35rem 0; transition: color 0.2s; }
        .h04n-links a::after { content: ""; position: absolute; left: 0; right: 100%; bottom: 0; height: 2px;
          background: var(--color-primary, #6D4AFF); transition: right 0.28s cubic-bezier(0.22,1,0.36,1); }
        .h04n-links a:hover { color: var(--color-text, #17132A); }
        .h04n-links a:hover::after { right: 0; }
        .h04n-right { display: flex; align-items: center; gap: 1.1rem; }
        .h04n-phone { font-size: 0.92rem; font-weight: 600; color: var(--color-text, #17132A); text-decoration: none; white-space: nowrap; }
        .h04n-cta { display: inline-flex; align-items: center; padding: 0.72rem 1.6rem; border-radius: 999px;
          background: var(--color-primary, #6D4AFF); color: #fff; font-size: 0.9rem; font-weight: 600;
          text-decoration: none; white-space: nowrap; box-shadow: 0 6px 18px rgba(109,74,255,0.3);
          transition: background 0.25s, transform 0.25s; }
        .h04n-cta:hover { background: var(--color-accent, #5233E0); transform: translateY(-1px); }
        .h04n-burger { display: none; background: none; border: none; cursor: pointer; padding: 6px; color: var(--color-text, #17132A); }
        .h04n-ov { position: fixed; inset: 0; background: var(--color-secondary, #17132A); z-index: 200;
          display: flex; flex-direction: column; padding: 1.1rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
          opacity: 0; pointer-events: none; transition: opacity 0.25s ease; font-family: 'Epilogue', sans-serif; }
        .h04n-ov[data-open="true"] { opacity: 1; pointer-events: auto; }
        .h04n-ov-top { display: flex; align-items: center; justify-content: space-between; height: 3.7rem; }
        .h04n-ov-word { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.25rem; color: #F5F4FA; }
        .h04n-ov-close { background: none; border: none; color: #F5F4FA; font-size: 2rem; line-height: 1; cursor: pointer; padding: 4px 10px; }
        .h04n-ov-links { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.2rem; }
        .h04n-ov-links a { font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.8rem, 6.6vw, 2.5rem);
          font-weight: 700; letter-spacing: -0.02em; color: #F5F4FA; text-decoration: none; padding: 0.45rem 0;
          border-bottom: 1px solid rgba(245,244,250,0.13);
          opacity: 0; transform: translateY(14px); transition: opacity 0.4s ease, transform 0.4s ease; }
        .h04n-ov[data-open="true"] .h04n-ov-links a { opacity: 1; transform: none; }
        .h04n-ov-links a:nth-child(1) { transition-delay: 0.05s; } .h04n-ov-links a:nth-child(2) { transition-delay: 0.1s; }
        .h04n-ov-links a:nth-child(3) { transition-delay: 0.15s; } .h04n-ov-links a:nth-child(4) { transition-delay: 0.2s; }
        .h04n-ov-links a:nth-child(5) { transition-delay: 0.25s; } .h04n-ov-links a:nth-child(6) { transition-delay: 0.3s; }
        .h04n-ov-cta { display: flex; align-items: center; justify-content: center; padding: 1.05rem;
          border-radius: 999px; background: var(--color-primary, #6D4AFF); color: #fff; font-weight: 600; text-decoration: none; }
        .h04n-mb { display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 90;
          padding: 0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom));
          background: rgba(245,244,250,0.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border-top: 1px solid var(--color-border, #E4E1F2); }
        .h04n-mb-cta { display: flex; align-items: center; justify-content: center; padding: 0.9rem;
          border-radius: 999px; background: var(--color-primary, #6D4AFF); color: #fff; font-size: 0.95rem; font-weight: 600; text-decoration: none; }
        @media (max-width: 1023px) {
          .h04n-links, .h04n-phone, .h04n-cta { display: none; }
          .h04n-burger { display: block; } .h04n-mb { display: block; } .h04n-inner { height: 4.3rem; }
        }
        @media (prefers-reduced-motion: reduce) { .h04n-ov, .h04n-ov-links a, .h04n-cta { transition: none; } }
      `}</style>
      <header className="h04n-bar" data-template="hair-04">
        <div className="h04n-inner">
          <a href={resolve("/")} className="h04n-logo" aria-label={siteName}>
            <span className="h04n-word"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
            <span className="h04n-dot" aria-hidden />
          </a>
          <ul className="h04n-links">{links.map((l, i) => (<li key={i}><a href={resolve(l.href)}>{l.label}</a></li>))}</ul>
          <div className="h04n-right">
            <a href={`tel:${phone.replace(/\\s/g, "")}`} className="h04n-phone">{phone}</a>
            <a href={resolve(ctaHref)} data-btn="primary" className="h04n-cta">{ctaText}</a>
            <button className="h04n-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>
      <div className="h04n-ov" data-open={open} aria-hidden={!open}>
        <div className="h04n-ov-top">
          <span className="h04n-ov-word">{siteName}</span>
          <button className="h04n-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        </div>
        <nav className="h04n-ov-links">{links.map((l, i) => (<a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>))}</nav>
        <a href={resolve(ctaHref)} data-btn="primary" className="h04n-ov-cta" onClick={() => setOpen(false)}>{ctaText}</a>
      </div>
      <div className="h04n-mb" aria-hidden={open}>
        <a href={resolve(ctaHref)} className="h04n-mb-cta">{ctaText}</a>
      </div>
    </>
  );
}
'''.replace("LINKS_PLACEHOLDER", FONTS)

HERO = '''
// hero-hair-04-with-navbar — V3 Studio Pop: čistý cinematic hero (navbar je nově
// samostatná sekce hair-04-navbar). Fullbleed fotka, scrim, Space Grotesk H1,
// dvojice CTA, spodní meta pás. Pole: backgroundImage, eyebrow, title, subtitle,
// ctaPrimaryText/Href, ctaSecondaryText/Href, meta[].
function HeroHair04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const image = String(content.backgroundImage ?? content.image ?? "");
  const eyebrow = String(content.eyebrow ?? "Barbershop · Praha 3");
  const title = String(content.title ?? "Je čas se ostříhat?");
  const subtitle = String(content.subtitle ?? "");
  const c1t = String(content.ctaPrimaryText ?? "Ceník a rezervace");
  const c1h = String(content.ctaPrimaryHref ?? "/sluzby");
  const c2t = String(content.ctaSecondaryText ?? "Zavolat");
  const c2h = String(content.ctaSecondaryHref ?? "/kontakt");
  const meta = (content.meta as Array<{ value: string; label: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="uvod" className="h04h-hero" data-template="hair-04">
      <style>{`
        .h04h-hero { position: relative; min-height: 92vh; display: flex; align-items: flex-end;
          overflow: hidden; background: var(--color-secondary, #17132A); font-family: 'Epilogue', sans-serif; }
        .h04h-photo { position: absolute; inset: 0; }
        .h04h-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h04h-scrim { position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(23,19,42,0.5) 0%, rgba(23,19,42,0.24) 38%, rgba(23,19,42,0.88) 100%); }
        .h04h-inner { position: relative; z-index: 2; width: 100%; max-width: 82rem; margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 2.75rem) clamp(3rem, 6vw, 4.5rem); }
        .h04h-eyebrow { display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: #C3B2FF; }
        .h04h-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #6D4AFF); }
        .h04h-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.03em;
          font-size: clamp(2.6rem, 6.6vw, 5rem); line-height: 1.02; color: #fff; margin: 0 0 1.2rem;
          text-wrap: balance; max-width: 17ch; }
        .h04h-sub { font-size: clamp(1rem, 1.4vw, 1.12rem); line-height: 1.65; color: rgba(255,255,255,0.85); max-width: 46ch; margin: 0 0 2.1rem; }
        .h04h-ctas { display: flex; flex-wrap: wrap; gap: 0.8rem; }
        .h04h-btn { display: inline-flex; align-items: center; justify-content: center; padding: 1rem 2.1rem;
          border-radius: 999px; font-size: 0.97rem; font-weight: 600; text-decoration: none;
          transition: transform 0.25s, background 0.25s; }
        .h04h-btn-p { background: var(--color-primary, #6D4AFF); color: #fff; box-shadow: 0 10px 30px rgba(109,74,255,0.42); }
        .h04h-btn-p:hover { background: var(--color-accent, #5233E0); transform: translateY(-2px); }
        .h04h-btn-g { color: #fff; border: 1px solid rgba(255,255,255,0.45); }
        .h04h-btn-g:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .h04h-meta { display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 4vw, 3.2rem);
          margin-top: clamp(2.2rem, 5vw, 3.2rem); padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2); }
        .h04h-meta-v { font-family: 'Space Grotesk', sans-serif; font-size: 1.65rem; font-weight: 700;
          color: #fff; display: block; line-height: 1; margin-bottom: 0.3rem; }
        .h04h-meta-l { font-size: 0.82rem; color: rgba(255,255,255,0.7); }
        @media (max-width: 767px) { .h04h-hero { min-height: 88vh; } .h04h-btn { flex: 1 1 auto; } }
        @media (prefers-reduced-motion: reduce) { .h04h-btn { transition: none; } }
      `}</style>
      {image && (
        <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="h04h-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} priority>
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      )}
      <div className="h04h-scrim" aria-hidden />
      <div className="h04h-inner">
        <span className="h04h-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
        <h1 className="h04h-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="h04h-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        <div className="h04h-ctas">
          <a href={resolve(c1h)} data-btn="primary" className="h04h-btn h04h-btn-p">{c1t}</a>
          <a href={resolve(c2h)} className="h04h-btn h04h-btn-g">{c2t}</a>
        </div>
        {meta.length > 0 && (
          <div className="h04h-meta">
            {meta.map((m, i) => (
              <div key={i}>
                <span className="h04h-meta-v"><GenericEditableText sectionId={sectionId} field={`meta.${i}.value`} value={m.value} tag="span" /></span>
                <span className="h04h-meta-l"><GenericEditableText sectionId={sectionId} field={`meta.${i}.label`} value={m.label} tag="span" /></span>
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
// hero-hair-04-page — podstránkový hero Studio Pop: světlý pás, drobečky, Space Grotesk H1.
function HeroHair04Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const image = String(content.backgroundImage ?? content.image ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section className="h04hp-wrap" data-template="hair-04">
      <style>{`
        .h04hp-wrap { background: var(--color-bg, #F5F4FA); font-family: 'Epilogue', sans-serif;
          padding: calc(4.9rem + clamp(2.5rem, 6vw, 4.5rem)) clamp(1.25rem, 4vw, 2.75rem) 0; }
        .h04hp-inner { max-width: 82rem; margin: 0 auto; }
        .h04hp-crumb { font-size: 0.82rem; color: var(--color-text-muted, #6A6382); margin-bottom: 1rem; }
        .h04hp-crumb a { color: var(--color-text-muted, #6A6382); text-decoration: none; }
        .h04hp-crumb a:hover { color: var(--color-primary, #6D4AFF); }
        .h04hp-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.03em;
          font-size: clamp(2.3rem, 5vw, 3.8rem); line-height: 1.04; color: var(--color-text, #17132A);
          margin: 0 0 0.9rem; text-wrap: balance; }
        .h04hp-sub { font-size: 1.04rem; line-height: 1.65; color: var(--color-text-muted, #6A6382); max-width: 52ch; margin: 0; }
        .h04hp-photo { margin-top: clamp(2rem, 5vw, 3.2rem); border-radius: 14px; overflow: hidden; aspect-ratio: 21 / 8; display: block; }
        .h04hp-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 767px) { .h04hp-photo { aspect-ratio: 16 / 9; } }
      `}</style>
      <div className="h04hp-inner">
        <div className="h04hp-crumb"><a href={resolve("/")}>Domů</a> <span aria-hidden>/</span> {title}</div>
        <h1 className="h04hp-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        {subtitle && <p className="h04hp-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        {image && (
          <GenericEditableImage sectionId={sectionId} field="backgroundImage" src={image} alt={title} className="h04hp-photo">
            <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </GenericEditableImage>
        )}
      </div>
    </section>
  );
}
'''

SERVICES = '''
// hair-04-service-cards — V3 Studio Pop: foto karty s cenou (nahrazuje kosočtvercové
// rámy, které usekávaly hlavy). Pole: tagline/title/subtitle, items[].{name,description,
// price,duration,image}.
function ServicesHair04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type I = { name?: string; title?: string; description?: string; body?: string; price?: string; duration?: string; image?: string };
  const tagline = String(content.tagline ?? "Služby");
  const title = String(content.title ?? "Naše služby");
  const subtitle = String(content.subtitle ?? "");
  const items = ((content.items ?? content.services) as I[]) ?? [];
  return (
    <section id="sluzby" data-section-type="services" data-variant="hair-04-service-cards" className="h04sv-section" data-template="hair-04">
      <style>{`
        .h04sv-section { background: var(--color-surface, #FFFFFF); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04sv-inner { max-width: 82rem; margin: 0 auto; }
        .h04sv-head { max-width: 44rem; margin-bottom: clamp(2.4rem, 5vw, 3.4rem); }
EB_PLACEHOLDER
        .h04sv-title {
H2_PLACEHOLDER
        }
        .h04sv-sub { font-size: 1.02rem; line-height: 1.65; color: var(--color-text-muted, #6A6382); margin: 0; }
        .h04sv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 2.6vw, 2.1rem); }
        .h04sv-card { display: flex; flex-direction: column; background: var(--color-bg, #F5F4FA);
          border-radius: 14px; overflow: hidden; transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s; }
        .h04sv-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(23,19,42,0.12); }
        .h04sv-media { aspect-ratio: 16 / 10; overflow: hidden; display: block; background: #E4E1F2; }
        .h04sv-media img { width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .h04sv-card:hover .h04sv-media img { transform: scale(1.05); }
        .h04sv-body { padding: 1.4rem 1.5rem 1.6rem; display: flex; flex-direction: column; flex: 1; }
        .h04sv-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.2rem;
          letter-spacing: -0.01em; color: var(--color-text, #17132A); margin: 0 0 0.5rem; }
        .h04sv-desc { font-size: 0.94rem; line-height: 1.62; color: var(--color-text-muted, #6A6382); margin: 0 0 1.1rem; flex: 1; }
        .h04sv-meta { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding-top: 0.9rem; border-top: 1px solid var(--color-border, #E4E1F2); }
        .h04sv-price { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.05rem; color: var(--color-primary, #6D4AFF); }
        .h04sv-dur { font-size: 0.85rem; color: var(--color-text-muted, #6A6382); }
        @media (max-width: 1023px) { .h04sv-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 639px) { .h04sv-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .h04sv-card, .h04sv-media img { transition: none; } }
      `}</style>
      <div className="h04sv-inner">
        <div className="h04sv-head">
          <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h04sv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="h04sv-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="h04sv-grid">
          {items.map((it, i) => (
            <article className="h04sv-card" key={i}>
              {it.image && (
                <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={it.image} alt={it.name ?? it.title ?? ""} className="h04sv-media">
                  <img src={it.image} alt={it.name ?? it.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <div className="h04sv-body">
                <h3 className="h04sv-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={it.name ?? it.title ?? ""} tag="span" /></h3>
                <p className="h04sv-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={it.description ?? it.body ?? ""} tag="span" /></p>
                <div className="h04sv-meta">
                  <span className="h04sv-price"><GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={it.price ?? ""} tag="span" /></span>
                  <span className="h04sv-dur"><GenericEditableText sectionId={sectionId} field={`items.${i}.duration`} value={it.duration ?? ""} tag="span" /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
'''.replace("EB_PLACEHOLDER", EB).replace("H2_PLACEHOLDER", H2)

CTA = '''
// hair-04-cta-phone — V3 Studio Pop: violet pás s telefonem (nahrazuje křiklavý žlutý).
// Pole: title, subtitle, phone, phoneHref, ctaText, ctaHref.
function CtaHair04Phone({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "");
  const subtitle = String(content.subtitle ?? "");
  const phone = String(content.phone ?? "");
  const phoneHref = String(content.phoneHref ?? (phone ? `tel:${phone.replace(/\\s/g, "")}` : "#"));
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section className="h04ct-section" data-template="hair-04">
      <style>{`
        .h04ct-section { background: var(--color-primary, #6D4AFF); font-family: 'Epilogue', sans-serif;
          padding: clamp(2.8rem, 6vw, 4.2rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04ct-inner { max-width: 82rem; margin: 0 auto; display: flex; align-items: center;
          justify-content: space-between; gap: 1.8rem; flex-wrap: wrap; }
        .h04ct-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(1.5rem, 3vw, 2.2rem); line-height: 1.15; color: #fff; margin: 0 0 0.4rem; text-wrap: balance; }
        .h04ct-sub { font-size: 0.98rem; line-height: 1.6; color: rgba(255,255,255,0.82); margin: 0; max-width: 46ch; }
        .h04ct-actions { display: flex; align-items: center; gap: 0.9rem; flex-wrap: wrap; }
        .h04ct-phone { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.95rem 2rem;
          border-radius: 999px; background: #fff; color: var(--color-primary, #6D4AFF);
          font-family: 'Space Grotesk', sans-serif; font-size: 1.02rem; font-weight: 700;
          text-decoration: none; white-space: nowrap; transition: transform 0.25s; }
        .h04ct-phone:hover { transform: translateY(-2px); }
        .h04ct-link { display: inline-flex; align-items: center; padding: 0.95rem 1.8rem; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.5); color: #fff; font-size: 0.95rem; font-weight: 600;
          text-decoration: none; white-space: nowrap; transition: background 0.25s; }
        .h04ct-link:hover { background: rgba(255,255,255,0.14); }
        @media (prefers-reduced-motion: reduce) { .h04ct-phone { transition: none; } }
      `}</style>
      <div className="h04ct-inner">
        <div>
          <h2 className="h04ct-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="h04ct-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="h04ct-actions">
          {phone && <a href={phoneHref} className="h04ct-phone">{phone}</a>}
          {ctaText && <a href={resolve(ctaHref)} className="h04ct-link">{ctaText}</a>}
        </div>
      </div>
    </section>
  );
}
'''

ABOUT = '''
// about-hair-04-split — V3 Studio Pop: vlevo eyebrow + H2 + odstavce + statistiky,
// vpravo foto radius 14 s violet offsetem. Pole: tagline/title/body/body2/image/stats.
function AboutHair04Split({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const tagline = String(content.tagline ?? "O nás");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const body2 = String(content.body2 ?? "");
  const image = String(content.image ?? "");
  const stats = (content.stats as Array<{ value: string; label: string }>) ?? [];
  return (
    <section id="o-nas" data-section-type="about" data-variant="about-hair-04-split" className="h04ab-section" data-template="hair-04">
      <style>{`
        .h04ab-section { background: var(--color-bg, #F5F4FA); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04ab-inner { max-width: 82rem; margin: 0 auto; display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center; }
EB_PLACEHOLDER
        .h04ab-title {
H2_PLACEHOLDER
        }
        .h04ab-p { font-size: 1rem; line-height: 1.75; color: var(--color-text-muted, #6A6382); margin: 0 0 1.1rem; max-width: 54ch; }
        .h04ab-stats { display: flex; gap: clamp(1.4rem, 3vw, 2.6rem); margin-top: 2rem; flex-wrap: wrap; }
        .h04ab-stat { padding-left: 1.3rem; border-left: 2px solid var(--color-primary, #6D4AFF); }
        .h04ab-stat:first-child { padding-left: 0; border-left: none; }
        .h04ab-stat-v { font-family: 'Space Grotesk', sans-serif; font-size: clamp(1.7rem, 2.8vw, 2.3rem);
          font-weight: 700; color: var(--color-text, #17132A); line-height: 1; display: block; margin-bottom: 0.3rem; }
        .h04ab-stat-l { font-size: 0.85rem; color: var(--color-text-muted, #6A6382); }
        .h04ab-media { position: relative; }
        .h04ab-media::before { content: ""; position: absolute; inset: 1.4rem -1.4rem -1.4rem 1.4rem;
          border-radius: 14px; background: var(--color-primary, #6D4AFF); opacity: 0.16; z-index: 0; }
        .h04ab-photo { position: relative; z-index: 1; border-radius: 14px; overflow: hidden;
          aspect-ratio: 4 / 5; display: block; background: #E4E1F2; }
        .h04ab-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 899px) { .h04ab-inner { grid-template-columns: 1fr; gap: 3rem; }
          .h04ab-media::before { inset: 1rem -1rem -1rem 1rem; } }
      `}</style>
      <div className="h04ab-inner">
        <div>
          <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h04ab-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {body && <p className="h04ab-p"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>}
          {body2 && <p className="h04ab-p"><GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" /></p>}
          {stats.length > 0 && (
            <div className="h04ab-stats">
              {stats.map((s, i) => (
                <div className="h04ab-stat" key={i}>
                  <span className="h04ab-stat-v"><GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" /></span>
                  <span className="h04ab-stat-l"><GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" /></span>
                </div>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="h04ab-media">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h04ab-photo">
              <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        )}
      </div>
    </section>
  );
}
'''.replace("EB_PLACEHOLDER", EB).replace("H2_PLACEHOLDER", H2)

GALLERY = '''
// hair-04-carousel — V3 Studio Pop: tmavá mřížka 3 sloupce s hover zoomem
// (nahrazuje karusel s useknutými fotkami). Pole: tagline/title/subtitle, images[].
function GalleryHair04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Img = { url?: string; alt?: string };
  const tagline = String(content.tagline ?? "Galerie");
  const title = String(content.title ?? "Galerie");
  const subtitle = String(content.subtitle ?? "");
  const images = ((content.images as Img[]) ?? []).filter((i) => i && i.url);
  return (
    <section id="galerie" data-section-type="gallery" data-variant="hair-04-carousel" className="h04g-section" data-template="hair-04">
      <style>{`
        .h04g-section { background: var(--color-secondary, #17132A); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04g-inner { max-width: 82rem; margin: 0 auto; }
        .h04g-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h04g-eyebrow { display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: #C3B2FF; }
        .h04g-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #6D4AFF); }
        .h04g-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: #fff; margin: 0 0 0.9rem; text-wrap: balance; }
        .h04g-sub { font-size: 1rem; line-height: 1.65; color: rgba(255,255,255,0.72); margin: 0; }
        .h04g-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.8rem, 1.5vw, 1.2rem); }
        .h04g-item { aspect-ratio: 4 / 5; overflow: hidden; display: block; border-radius: 14px; background: #241E3D; }
        .h04g-item img { width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .h04g-item:hover img { transform: scale(1.06); }
        @media (max-width: 899px) { .h04g-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (prefers-reduced-motion: reduce) { .h04g-item img { transition: none; } }
      `}</style>
      <div className="h04g-inner">
        <div className="h04g-head">
          <span className="h04g-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h04g-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="h04g-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="h04g-grid">
          {images.map((im, i) => (
            <GenericEditableImage key={i} sectionId={sectionId} field={`images.${i}.url`} src={im.url ?? ""} alt={im.alt ?? ""} className="h04g-item">
              <img src={im.url ?? ""} alt={im.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

if __name__ == "__main__":
    print("hair-04 rebuild — etapa A")
    append_fn("NavbarSection.tsx", NAVBAR, "function NavbarHair04(")
    add_dispatch("NavbarSection.tsx", 'if (props.variant === "hair-03-navbar")',
                 '  if (props.variant === "hair-04-navbar") return <NavbarHair04 {...props} />;')
    replace_inline_block("HeroSection.tsx", "hero-hair-04-with-navbar",
                         '  if (variant === "hero-hair-04-with-navbar") {\n'
                         '    return <HeroHair04 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }\n'
                         '  if (variant === "hero-hair-04-page") {\n'
                         '    return <HeroHair04Page content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }')
    append_fn("HeroSection.tsx", HERO, "function HeroHair04(")
    append_fn("HeroSection.tsx", HERO_PAGE, "function HeroHair04Page(")
    replace_inline_block("ServicesSection.tsx", "hair-04-service-cards",
                         '  if (variant === "hair-04-service-cards") {\n'
                         '    return <ServicesHair04 content={content} sectionId={sectionId} />;\n  }')
    append_fn("ServicesSection.tsx", SERVICES, "function ServicesHair04(")
    replace_inline_block("CtaSection.tsx", "hair-04-cta-phone",
                         '  if (variant === "hair-04-cta-phone") {\n'
                         '    return <CtaHair04Phone content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }')
    append_fn("CtaSection.tsx", CTA, "function CtaHair04Phone(")
    replace_inline_block("AboutSection.tsx", "about-hair-04-split",
                         '  if (variant === "about-hair-04-split") {\n'
                         '    return <AboutHair04Split content={content as Record<string, unknown>} sectionId={sectionId} />;\n  }')
    append_fn("AboutSection.tsx", ABOUT, "function AboutHair04Split(")
    replace_inline_block("GallerySection.tsx", "hair-04-carousel",
                         '  if (variant === "hair-04-carousel") {\n'
                         '    return <GalleryHair04 content={content as Record<string, unknown>} sectionId={sectionId} />;\n  }')
    append_fn("GallerySection.tsx", GALLERY, "function GalleryHair04(")
    print("hotovo (etapa A).")
