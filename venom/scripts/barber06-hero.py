#!/usr/bin/env python3
"""barber-06 SEKCE 2 — HERO na awwwards úrovni.

Vady původního (klonovaného) hera:
  · fotka konkurence — lokální asset, v zrcadle čitelné logo „Kim Impressive"
  · titulek naskládaný do tmavého zaobleného boxu uprostřed → vypadá jako placeholder
  · žádný eyebrow, žádný podtitul, žádný důvod kliknout
  · CTA jen obrysová, obě stejné váhy → není jasné, co je hlavní akce
  · nic pod ohybem: chybí otevírací doba / walk-in / hodnocení
  · pevná výška podle NAV_H, na mobilu se text tlačí k okraji

Nový hero (dark & gold styl zachován):
  · full-bleed cinematic fotka + dvojitý scrim (shora pro čitelnost hlavičky, zdola pro text)
  · zlatý eyebrow s linkou, Bebas Neue display clamp až 6rem, akcentní řádek zlatě
  · podtitul s konkrétním benefitem, CTA pár (plné zlaté + ghost)
  · spodní meta pás na hairline: otevřeno / bez objednání / hodnocení
  · scroll indikátor, prefers-reduced-motion, text-wrap: balance
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

HERO = '''
// barber-06-hero — SEKCE 2. Cinematic full-bleed hero, dark & gold.
// Pole: backgroundImage, eyebrow, title, titleAccent, subtitle,
// ctaPrimaryText/Href, ctaSecondaryText/Href, meta[].{value,label}.
function HeroBarber06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const bg = String(content.backgroundImage ?? "");
  const eyebrow = String(content.eyebrow ?? "Barbershop · Praha 3");
  const title = String(content.title ?? "Střih, který drží tvar");
  const titleAccent = String(content.titleAccent ?? "i po třech týdnech");
  const subtitle = String(content.subtitle ?? "");
  const c1t = String(content.ctaPrimaryText ?? "Rezervovat termín");
  const c1h = String(content.ctaPrimaryHref ?? "/#rezervace");
  const c2t = String(content.ctaSecondaryText ?? "Ceník");
  const c2h = String(content.ctaSecondaryHref ?? "/#cenik");
  const meta = (content.meta as Array<{ value: string; label: string }>) ?? [];
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="uvod" className="b06h-hero" data-template="barber-06">
      <style>{`
        .b06h-hero {
          position: relative; min-height: 100svh; display: flex; align-items: flex-end;
          overflow: hidden; background: var(--color-secondary, #0A0A0A);
          font-family: 'Lato', system-ui, sans-serif;
        }
        .b06h-photo { position: absolute; inset: 0; }
        .b06h-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        /* dvojitý scrim: shora kvůli čitelnosti hlavičky, zdola kvůli textu */
        .b06h-scrim {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.28) 26%, rgba(10,10,10,0.55) 62%, rgba(10,10,10,0.94) 100%),
            radial-gradient(120% 80% at 15% 85%, rgba(10,10,10,0.55) 0%, transparent 60%);
        }
        .b06h-inner {
          position: relative; z-index: 2; width: 100%; max-width: 84rem; margin: 0 auto;
          padding: 0 clamp(1.15rem, 4vw, 3rem) clamp(2.5rem, 5vw, 4rem);
        }
        .b06h-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem; margin-bottom: 1.4rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06h-eyebrow::before { content: ""; width: 36px; height: 2px; background: var(--color-primary, #FFC107); }
        .b06h-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400;
          font-size: clamp(2.9rem, 8vw, 6rem); line-height: 0.94; letter-spacing: 0.01em;
          text-transform: uppercase; color: #fff; margin: 0 0 1.3rem; text-wrap: balance; max-width: 18ch;
        }
        .b06h-title em { display: block; font-style: normal; color: var(--color-primary, #FFC107); }
        .b06h-sub {
          font-size: clamp(1rem, 1.35vw, 1.14rem); line-height: 1.65; color: rgba(255,255,255,0.82);
          max-width: 48ch; margin: 0 0 2.2rem;
        }
        .b06h-ctas { display: flex; flex-wrap: wrap; gap: 0.85rem; align-items: center; }
        .b06h-btn {
          display: inline-flex; align-items: center; justify-content: center; padding: 1.05rem 2.3rem;
          border-radius: 999px; font-size: 0.84rem; font-weight: 900; letter-spacing: 0.12em;
          text-transform: uppercase; text-decoration: none; transition: transform 0.25s, background 0.25s, box-shadow 0.25s;
        }
        .b06h-btn-p { background: var(--color-primary, #FFC107); color: #0a0a0a; box-shadow: 0 12px 34px rgba(255,193,7,0.34); }
        .b06h-btn-p:hover { background: var(--color-accent, #E0A800); transform: translateY(-2px); box-shadow: 0 16px 42px rgba(255,193,7,0.46); }
        .b06h-btn-g { color: #fff; border: 1.5px solid rgba(255,255,255,0.42); }
        .b06h-btn-g:hover { border-color: var(--color-primary, #FFC107); color: var(--color-primary, #FFC107); transform: translateY(-2px); }
        .b06h-meta {
          display: flex; flex-wrap: wrap; gap: clamp(1.5rem, 4vw, 3.4rem);
          margin-top: clamp(2.4rem, 5vw, 3.4rem); padding-top: 1.6rem;
          border-top: 1px solid rgba(255,255,255,0.16);
        }
        .b06h-meta-v {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.5rem; letter-spacing: 0.03em;
          color: #fff; display: block; line-height: 1; margin-bottom: 0.35rem;
        }
        .b06h-meta-l { font-size: 0.76rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .b06h-scroll {
          position: absolute; left: 50%; bottom: 1.1rem; transform: translateX(-50%); z-index: 2;
          width: 1px; height: 42px; background: linear-gradient(180deg, transparent, var(--color-primary, #FFC107));
          animation: b06h-pulse 2.4s ease-in-out infinite;
        }
        @keyframes b06h-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        @media (max-width: 767px) {
          .b06h-hero { min-height: 92svh; }
          .b06h-btn { flex: 1 1 auto; }
          .b06h-scroll { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .b06h-btn, .b06h-scroll { transition: none; animation: none; }
        }
      `}</style>

      {bg && (
        <GenericEditableImage
          sectionId={sectionId} field="backgroundImage" src={bg} alt={title} className="b06h-photo"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          priority
        >
          <img src={bg} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </GenericEditableImage>
      )}
      <div className="b06h-scrim" aria-hidden />

      <div className="b06h-inner">
        <span className="b06h-eyebrow">
          <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
        </span>
        <h1 className="b06h-title">
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          <em><GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" /></em>
        </h1>
        {subtitle && (
          <p className="b06h-sub">
            <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
          </p>
        )}
        <div className="b06h-ctas">
          <a href={resolve(c1h)} data-btn="primary" className="b06h-btn b06h-btn-p">{c1t}</a>
          <a href={resolve(c2h)} className="b06h-btn b06h-btn-g">{c2t}</a>
        </div>
        {meta.length > 0 && (
          <div className="b06h-meta">
            {meta.map((m, i) => (
              <div key={i}>
                <span className="b06h-meta-v">
                  <GenericEditableText sectionId={sectionId} field={`meta.${i}.value`} value={m.value} tag="span" />
                </span>
                <span className="b06h-meta-l">
                  <GenericEditableText sectionId={sectionId} field={`meta.${i}.label`} value={m.label} tag="span" />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="b06h-scroll" aria-hidden />
    </section>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 2 — hero")
    replace_fn("HeroSection.tsx", "HeroBarber06", HERO)
    print("hotovo.")
