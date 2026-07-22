#!/usr/bin/env python3
"""barber-06 SEKCE 1 — HEADER na awwwards úrovni.

Původní hlavička byla zapečená uvnitř hero komponenty a měla vady:
  · nav ve font-weight 100 (vlásková, na 18px nečitelná)
  · pevný padding 137px → rozpadá se na středních šířkách
  · natvrdo ztmavená lišta bez scroll stavu (žádný přechod nad hero fotkou)
  · ŽÁDNÉ CTA ani telefon v hlavičce — u barbera přímá konverzní ztráta
  · hrubý monogram (obří „A" + dělítko + tři naskládané řádky)
  · nav výška 113px, mobil bez sticky CTA

Nový `barber-06-navbar` = samostatná sticky sekce, dark + gold styl zachován:
  · průhledná nad hero fotkou → po scrollu ztmavne + blur + zlatá hairline
  · tenký zlatý akcentní proužek nahoře (signatura prémiového barbera)
  · monogram v zlatém rámečku + dvouřádkový wordmark s prostrkaným podtitulem
  · uppercase nav 0.82rem/600, letter-spacing .14em, podtržení vyjíždějící zleva
  · telefon + zlaté pill CTA „Rezervovat" se stínem
  · fullscreen overlay menu (stagger, Esc, scroll-lock) + sticky mobilní CTA lišta
  · vše přes var(--color-*), aby fungovaly mood presety
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import append_fn, SEC  # noqa

NAVBAR = '''
// barber-06-navbar — SEKCE 1 (header). Sticky, průhledná nad hero fotkou, po scrollu
// ztmavne + blur. Dark & gold barber styl zachován, ale povýšený: čitelná uppercase
// nav s podtržením, telefon + zlaté CTA, overlay menu, sticky mobilní CTA lišta.
function NavbarBarber06({ content, variant: _v, isAdmin, tenantSlug, sectionId }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const siteName = String(content.siteName ?? "Alfa Barbershop");
  const monogram = String(content.monogram ?? (siteName.trim().charAt(0) || "A"));
  const tagline = String(content.tagline ?? "Barbershop · Praha");
  const phone = String(content.phone ?? "704 123 456");
  const ctaText = String(content.ctaText ?? "Rezervovat");
  const ctaHref = String(content.ctaHref ?? "/#rezervace");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@300;400;700;900&display=swap" rel="stylesheet" />
      <style>{`
        .b06n-bar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          font-family: 'Lato', system-ui, sans-serif;
          background: ${scrolled ? "rgba(10,10,10,0.94)" : "linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.12) 100%)"};
          -webkit-backdrop-filter: ${scrolled ? "blur(16px)" : "blur(2px)"};
          backdrop-filter: ${scrolled ? "blur(16px)" : "blur(2px)"};
          border-bottom: 1px solid ${scrolled ? "rgba(255,193,7,0.22)" : "transparent"};
          transition: background 0.35s ease, backdrop-filter 0.35s ease, border-color 0.35s ease;
        }
        .b06n-accent { height: 2px; background: linear-gradient(90deg, var(--color-primary, #ffc107) 0%, rgba(255,193,7,0.15) 55%, transparent 100%); }
        .b06n-inner {
          max-width: 84rem; margin: 0 auto; padding: 0 clamp(1.15rem, 4vw, 3rem);
          height: ${scrolled ? "4.6rem" : "5.4rem"};
          display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
          transition: height 0.35s ease;
        }
        .b06n-logo { display: flex; align-items: center; gap: 0.85rem; text-decoration: none; flex-shrink: 0; }
        .b06n-mono {
          width: 2.6rem; height: 2.6rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--color-primary, #ffc107); color: var(--color-primary, #ffc107);
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.55rem; line-height: 1; padding-top: 2px;
          transition: background 0.25s, color 0.25s;
        }
        .b06n-logo:hover .b06n-mono { background: var(--color-primary, #ffc107); color: #0a0a0a; }
        .b06n-word { display: flex; flex-direction: column; gap: 2px; }
        .b06n-name {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.28rem; letter-spacing: 0.06em;
          color: #fff; line-height: 1; text-transform: uppercase;
        }
        .b06n-tag { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.26em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
        .b06n-links { display: flex; align-items: center; gap: 2rem; list-style: none; margin: 0; padding: 0; }
        .b06n-links a {
          position: relative; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.84); text-decoration: none; padding: 0.5rem 0; transition: color 0.22s;
        }
        .b06n-links a::after {
          content: ""; position: absolute; left: 0; right: 100%; bottom: 0.15rem; height: 1.5px;
          background: var(--color-primary, #ffc107); transition: right 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .b06n-links a:hover { color: #fff; }
        .b06n-links a:hover::after, .b06n-links a[data-active="true"]::after { right: 0; }
        .b06n-links a[data-active="true"] { color: var(--color-primary, #ffc107); }
        .b06n-right { display: flex; align-items: center; gap: 1.4rem; }
        .b06n-phone {
          font-size: 0.88rem; font-weight: 700; letter-spacing: 0.04em; color: rgba(255,255,255,0.9);
          text-decoration: none; white-space: nowrap; transition: color 0.22s;
        }
        .b06n-phone:hover { color: var(--color-primary, #ffc107); }
        .b06n-cta {
          display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.72rem 1.7rem; border-radius: 999px;
          background: var(--color-primary, #ffc107); color: #0a0a0a;
          font-size: 0.8rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap; box-shadow: 0 8px 24px rgba(255,193,7,0.3);
          transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
        }
        .b06n-cta:hover { background: var(--color-accent, #e0a800); transform: translateY(-2px); box-shadow: 0 12px 30px rgba(255,193,7,0.42); }
        .b06n-burger { display: none; background: none; border: none; cursor: pointer; padding: 8px; color: #fff; }
        .b06n-ov {
          position: fixed; inset: 0; background: #0a0a0a; z-index: 1200;
          display: flex; flex-direction: column; padding: 1.1rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
          opacity: 0; pointer-events: none; transition: opacity 0.28s ease; font-family: 'Lato', sans-serif;
        }
        .b06n-ov[data-open="true"] { opacity: 1; pointer-events: auto; }
        .b06n-ov-top { display: flex; align-items: center; justify-content: space-between; height: 3.8rem; }
        .b06n-ov-close { background: none; border: none; color: #fff; font-size: 2.1rem; line-height: 1; cursor: pointer; padding: 4px 10px; }
        .b06n-ov-links { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 0.15rem; }
        .b06n-ov-links a {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: clamp(2rem, 8vw, 2.9rem); letter-spacing: 0.04em;
          text-transform: uppercase; color: #fff; text-decoration: none; padding: 0.55rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          opacity: 0; transform: translateY(16px); transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .b06n-ov[data-open="true"] .b06n-ov-links a { opacity: 1; transform: none; }
        .b06n-ov-links a:nth-child(1) { transition-delay: 0.06s; } .b06n-ov-links a:nth-child(2) { transition-delay: 0.12s; }
        .b06n-ov-links a:nth-child(3) { transition-delay: 0.18s; } .b06n-ov-links a:nth-child(4) { transition-delay: 0.24s; }
        .b06n-ov-links a:nth-child(5) { transition-delay: 0.3s; }  .b06n-ov-links a:nth-child(6) { transition-delay: 0.36s; }
        .b06n-ov-foot { display: flex; flex-direction: column; gap: 0.85rem; }
        .b06n-ov-phone { font-size: 1.1rem; font-weight: 700; color: var(--color-primary, #ffc107); text-decoration: none; text-align: center; }
        .b06n-ov-cta {
          display: flex; align-items: center; justify-content: center; padding: 1.05rem; border-radius: 999px;
          background: var(--color-primary, #ffc107); color: #0a0a0a; font-weight: 900;
          letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
        }
        .b06n-mb {
          display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 990;
          padding: 0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom));
          background: rgba(10,10,10,0.95); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,193,7,0.25);
        }
        .b06n-mb-cta {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.92rem;
          border-radius: 999px; background: var(--color-primary, #ffc107); color: #0a0a0a;
          font-size: 0.88rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
        }
        @media (max-width: 1023px) {
          .b06n-links, .b06n-phone, .b06n-cta { display: none; }
          .b06n-burger { display: block; }
          .b06n-mb { display: block; }
          .b06n-inner { height: 4.3rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .b06n-bar, .b06n-inner, .b06n-ov, .b06n-ov-links a, .b06n-cta, .b06n-links a::after { transition: none; }
        }
      `}</style>

      <header className="b06n-bar" data-template="barber-06">
        <div className="b06n-accent" aria-hidden />
        <div className="b06n-inner">
          <a href={resolve("/")} className="b06n-logo" aria-label={siteName}>
            <span className="b06n-mono" aria-hidden>{monogram}</span>
            <span className="b06n-word">
              <span className="b06n-name"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
              <span className="b06n-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            </span>
          </a>

          <ul className="b06n-links">
            {links.map((l, i) => (
              <li key={i}><a href={resolve(l.href)} data-active={i === 0}>{l.label}</a></li>
            ))}
          </ul>

          <div className="b06n-right">
            <a href={`tel:${phone.replace(/\\s/g, "")}`} className="b06n-phone">{phone}</a>
            <a href={resolve(ctaHref)} data-btn="primary" className="b06n-cta">{ctaText}</a>
            <button className="b06n-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="b06n-ov" data-open={open} aria-hidden={!open}>
        <div className="b06n-ov-top">
          <span className="b06n-logo" style={{ pointerEvents: "none" }}>
            <span className="b06n-mono" aria-hidden>{monogram}</span>
            <span className="b06n-word"><span className="b06n-name">{siteName}</span><span className="b06n-tag">{tagline}</span></span>
          </span>
          <button className="b06n-ov-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
        </div>
        <nav className="b06n-ov-links" aria-label="Hlavní menu">
          {links.map((l, i) => (<a key={i} href={resolve(l.href)} onClick={() => setOpen(false)}>{l.label}</a>))}
        </nav>
        <div className="b06n-ov-foot">
          <a href={`tel:${phone.replace(/\\s/g, "")}`} className="b06n-ov-phone">{phone}</a>
          <a href={resolve(ctaHref)} data-btn="primary" className="b06n-ov-cta" onClick={() => setOpen(false)}>{ctaText}</a>
        </div>
      </div>

      <div className="b06n-mb" aria-hidden={open}>
        <a href={resolve(ctaHref)} className="b06n-mb-cta">{ctaText}</a>
      </div>
    </>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 1 — header")
    append_fn("NavbarSection.tsx", NAVBAR, "function NavbarBarber06(")
    p = SEC / "NavbarSection.tsx"
    src = p.read_text()
    line = '  if (props.variant === "barber-06-navbar") return <NavbarBarber06 {...props} />;'
    if line not in src:
        src = src.replace('  if (props.variant === "hair-04-navbar")', line + '\n  if (props.variant === "hair-04-navbar")', 1)
        p.write_text(src)
        print("  ✓ dispatch barber-06-navbar")
    else:
        print("  = dispatch už existuje")

    # vyříznout starou hlavičku z hero komponenty (jinak by se navbar zdvojil)
    h = SEC / "HeroSection.tsx"
    lines = h.read_text().split("\n")
    start = next((i for i, l in enumerate(lines) if "═══ STICKY NAVBAR" in l), None)
    if start is None:
        print("  = hlavička už z hera vyříznuta")
    else:
        end = next(i for i in range(start + 1, len(lines)) if "═══ HERO CONTENT" in lines[i])
        removed = end - start
        lines[start:end] = ["        {/* hlavička vyříznuta — žije samostatně jako sekce `barber-06-navbar` */}", ""]
        h.write_text("\n".join(lines))
        print(f"  ✓ stará hlavička vyříznuta z HeroBarber06 ({removed} řádků)")
    print("hotovo.")
