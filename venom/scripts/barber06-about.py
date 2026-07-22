#!/usr/bin/env python3
"""barber-06 SEKCE 5 — O NÁS.

Vady původní (klonované) sekce — nejvíc konkurence z celé šablony:
  · nadpis „Impresivní střihy. Už 10 let." = slovní hříčka na jméno konkurenta
    (Kim Impressive), text končí „Chceme, abyste byli zkrátka – Impresivní!"
  · „barvení vlasů" v textu = obsah dámského salonu v barbershopu
  · fotka: černobílý interiér konkurence
  · plochý dvousloupec, drobný šedý text, žádný důkaz (roky, tým, počty)
  · žádný podpis ani lidský prvek

Nová sekce (dark & gold zachován):
  · vlevo eyebrow + Bebas Neue nadpis + lead + text + STATISTIKY na zlatých
    hairlines + podpis majitele
  · vpravo portrét v obloukovém rámu se zlatým offsetem (echo tvaru ze služeb)
  · demo text bez jediné zmínky konkurence
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

ABOUT = '''
// barber-06-about — SEKCE 5. Split s portrétem v obloukovém rámu, statistiky a podpis.
// Pole: eyebrow, title, body, body2, image, stats[].{value,label}, signature, signatureRole.
function AboutBarber06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow = String(content.eyebrow ?? "O nás");
  const title = String(content.title ?? "");
  const body = String(content.body ?? "");
  const body2 = String(content.body2 ?? "");
  const image = String(content.image ?? "");
  const stats = (content.stats as Array<{ value: string; label: string }>) ?? [];
  const signature = String(content.signature ?? "");
  const signatureRole = String(content.signatureRole ?? "");
  const _r = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  void _r;

  return (
    <section id="o-nas" data-section-type="about" data-variant="barber-06-about" className="b06a-section" data-template="barber-06">
      <style>{`
        .b06a-section {
          scroll-margin-top: 5rem;
          background: var(--color-background, #121212); font-family: 'Lato', system-ui, sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.15rem, 4vw, 3rem);
        }
        .b06a-inner {
          max-width: 84rem; margin: 0 auto; display: grid; grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(2.5rem, 6vw, 5rem); align-items: center;
        }
        .b06a-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem; margin-bottom: 1.1rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06a-eyebrow::before { content: ""; width: 36px; height: 2px; background: var(--color-primary, #FFC107); }
        .b06a-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase;
          font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: 0.01em;
          color: #fff; margin: 0 0 1.2rem; text-wrap: balance;
        }
        .b06a-lead { font-size: clamp(1.02rem, 1.4vw, 1.14rem); line-height: 1.62; color: rgba(255,255,255,0.86); margin: 0 0 1.1rem; max-width: 50ch; }
        .b06a-body { font-size: 0.98rem; line-height: 1.75; color: rgba(255,255,255,0.6); margin: 0 0 1.1rem; max-width: 54ch; }
        .b06a-stats { display: flex; flex-wrap: wrap; gap: clamp(1.4rem, 3vw, 2.8rem); margin: 2rem 0 1.8rem; }
        .b06a-stat { padding-left: 1.3rem; border-left: 2px solid var(--color-primary, #FFC107); }
        .b06a-stat:first-child { padding-left: 0; border-left: none; }
        .b06a-stat-v {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: clamp(1.9rem, 3vw, 2.5rem);
          letter-spacing: 0.03em; color: #fff; display: block; line-height: 1; margin-bottom: 0.3rem;
        }
        .b06a-stat-l { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.52); }
        .b06a-sign { padding-top: 1.2rem; border-top: 1px solid rgba(255,255,255,0.14); }
        .b06a-sign-n {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.2rem; letter-spacing: 0.05em;
          color: var(--color-primary, #FFC107); display: block;
        }
        .b06a-sign-r { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        .b06a-media { position: relative; padding: 14px; }
        /* zlatý obrys obepínající obloukový tvar ze všech stran (echo tvaru služeb) */
        .b06a-media::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          border: 2px solid var(--color-primary, #FFC107); border-radius: 999px 999px 8px 8px;
          opacity: 0.9; z-index: 2;
        }
        .b06a-photo {
          position: relative; z-index: 1; display: block; aspect-ratio: 4 / 5; overflow: hidden;
          border-radius: 999px 999px 4px 4px; background: #1a1a1a;
        }
        .b06a-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        @media (max-width: 899px) {
          .b06a-inner { grid-template-columns: 1fr; gap: 3rem; }
          .b06a-media { max-width: 22rem; margin: 0 auto; }
        }
      `}</style>

      <div className="b06a-inner">
        <div>
          <span className="b06a-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="b06a-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {body && (
            <p className="b06a-lead">
              <GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" />
            </p>
          )}
          {body2 && (
            <p className="b06a-body">
              <GenericEditableText sectionId={sectionId} field="body2" value={body2} tag="span" />
            </p>
          )}
          {stats.length > 0 && (
            <div className="b06a-stats">
              {stats.map((s, i) => (
                <div className="b06a-stat" key={i}>
                  <span className="b06a-stat-v">
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.value`} value={s.value} tag="span" />
                  </span>
                  <span className="b06a-stat-l">
                    <GenericEditableText sectionId={sectionId} field={`stats.${i}.label`} value={s.label} tag="span" />
                  </span>
                </div>
              ))}
            </div>
          )}
          {signature && (
            <div className="b06a-sign">
              <span className="b06a-sign-n">
                <GenericEditableText sectionId={sectionId} field="signature" value={signature} tag="span" />
              </span>
              <span className="b06a-sign-r">
                <GenericEditableText sectionId={sectionId} field="signatureRole" value={signatureRole} tag="span" />
              </span>
            </div>
          )}
        </div>

        {image && (
          <div className="b06a-media">
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={signature || title} className="b06a-photo">
              <img src={image} alt={signature || title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          </div>
        )}
      </div>
    </section>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 5 — o nás")
    replace_fn("AboutSection.tsx", "AboutBarber06", ABOUT)
    print("hotovo.")
