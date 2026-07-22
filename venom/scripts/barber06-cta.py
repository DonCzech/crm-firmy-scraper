#!/usr/bin/env python3
"""barber-06 SEKCE 4 — ZLATÝ CTA PÁS.

Vady původního pásu:
  · plochý úzký proužek bez hierarchie — titulek malým písmem vlevo
  · telefon jako malá černá pilulka vpravo, působí jako dodatek
  · žádný podpůrný text (kdy volat, že lze přijít bez objednání)
  · nulový vizuální zájem — jen žlutý obdélník

Nový pás (zlatá zachována jako brandový moment):
  · diagonální barber-pole textura v pozadí (nízká krytí, klasická signatura oboru)
  · Bebas Neue titulek v černé na zlaté, podpůrný řádek s otevírací dobou
  · velké černé pill tlačítko s ikonou telefonu, hover lift
  · sekundární textový odkaz na rezervaci
  · na mobilu stack + celoplošné tlačítko
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

CTA = '''
// barber-06-cta — SEKCE 4. Zlatý konverzní pás s barber-pole texturou.
// Pole: title, subtitle, phone, phoneHref, ctaText, ctaHref.
function CtaBarber06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? "Nechcete čekat? Zavolejte nám.");
  const subtitle = String(content.subtitle ?? "");
  const phone = String(content.phone ?? "704 123 456");
  const phoneHref = String(content.phoneHref ?? `tel:${phone.replace(/\\s/g, "")}`);
  const ctaText = String(content.ctaText ?? "");
  const ctaHref = String(content.ctaHref ?? "/#rezervace");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section className="b06c-section" data-template="barber-06">
      <style>{`
        .b06c-section {
          position: relative; overflow: hidden;
          background: var(--color-primary, #FFC107);
          font-family: 'Lato', system-ui, sans-serif;
          padding: clamp(2.6rem, 5vw, 4rem) clamp(1.15rem, 4vw, 3rem);
        }
        /* barber-pole: diagonální pruhy, klasická signatura oboru */
        .b06c-section::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            -45deg,
            rgba(10,10,10,0.055) 0px, rgba(10,10,10,0.055) 14px,
            transparent 14px, transparent 34px
          );
        }
        .b06c-inner {
          position: relative; z-index: 1; max-width: 84rem; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: clamp(1.4rem, 4vw, 3rem); flex-wrap: wrap;
        }
        .b06c-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase;
          font-size: clamp(1.7rem, 3.6vw, 2.7rem); line-height: 1.02; letter-spacing: 0.02em;
          color: #0a0a0a; margin: 0 0 0.4rem; text-wrap: balance; max-width: 22ch;
        }
        .b06c-sub { font-size: 0.98rem; line-height: 1.55; color: rgba(10,10,10,0.72); margin: 0; max-width: 46ch; }
        .b06c-actions { display: flex; align-items: center; gap: 1.4rem; flex-wrap: wrap; }
        .b06c-phone {
          display: inline-flex; align-items: center; gap: 0.7rem;
          padding: 1.05rem 2.2rem; border-radius: 999px;
          background: #0a0a0a; color: var(--color-primary, #FFC107);
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.45rem; letter-spacing: 0.06em;
          text-decoration: none; white-space: nowrap;
          box-shadow: 0 10px 28px rgba(10,10,10,0.28);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .b06c-phone:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(10,10,10,0.38); }
        .b06c-phone svg { flex-shrink: 0; }
        .b06c-link {
          font-size: 0.82rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
          color: #0a0a0a; text-decoration: none; border-bottom: 2px solid rgba(10,10,10,0.35);
          padding-bottom: 3px; transition: border-color 0.25s;
        }
        .b06c-link:hover { border-color: #0a0a0a; }
        @media (max-width: 767px) {
          .b06c-inner { flex-direction: column; align-items: stretch; text-align: center; }
          .b06c-title { max-width: none; }
          .b06c-sub { max-width: none; }
          .b06c-actions { flex-direction: column; align-items: stretch; }
          .b06c-phone { justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) { .b06c-phone { transition: none; } }
      `}</style>

      <div className="b06c-inner">
        <div>
          <h2 className="b06c-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="b06c-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>
        <div className="b06c-actions">
          <a href={phoneHref} className="b06c-phone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/>
            </svg>
            {phone}
          </a>
          {ctaText && <a href={resolve(ctaHref)} className="b06c-link">{ctaText}</a>}
        </div>
      </div>
    </section>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 4 — CTA pás")
    replace_fn("CtaSection.tsx", "CtaBarber06", CTA)
    print("hotovo.")
