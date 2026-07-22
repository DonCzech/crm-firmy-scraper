#!/usr/bin/env python3
"""barber-06 SEKCE 3 — SLUŽBY / CENÍK.

Vady původní (klonované) sekce:
  · KOSOČTVERCE usekávaly obličeje — první karta byla nečitelná tmavá skvrna
  · fotky konkurence a k barberovi nesedící (žena s dlouhými vlasy, muž v brýlích)
  · třetí položka „Záruka spokojenosti" NENÍ služba, ale hodnotový slib
  · „Barvení vlasů" = obsah dámského salonu v barbershopu
  · ŽÁDNÉ ceny ani délka úkonu, přestože na sekci míří „Ceník" v menu
  · jen 3 položky, centrovaný šedý text na černé (nízký kontrast)

Nová sekce (dark & gold zachován):
  · tvar kosočtverce → OBLOUK (zaoblený vršek, rovné dno) = silueta vintage
    barberského zrcadla; výrazné, ale neusekává obličeje
  · 6 reálných barber služeb s cenou a délkou, foto ověřené vizuálně
  · zlaté pořadové číslo v obloučku, název Bebas Neue, cena zlatě na hairline
  · hover: zoom fotky + lehký lift karty
  · kotva #cenik uvnitř sekce, aby menu „Ceník" mířilo správně
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

SERVICES = '''
// barber-06-services — SEKCE 3. Ceník služeb v dark & gold. Obloukové foto karty
// (nahradily kosočtverce, které usekávaly obličeje). Pole: eyebrow/title/subtitle,
// items[].{title,body,image,price,duration}.
function ServicesBarber06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Item = { name?: string; title?: string; body?: string; description?: string; image?: string; price?: string; duration?: string };
  const eyebrow = String(content.eyebrow ?? "Ceník");
  const title = String(content.title ?? "Co u nás zvládneme");
  const subtitle = String(content.subtitle ?? "");
  const items = ((content.items ?? content.services) as Item[]) ?? [];
  const _resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  void _resolve;

  return (
    <section id="sluzby" data-section-type="services" data-variant="barber-06-services" className="b06s-section" data-template="barber-06">
      <span id="cenik" aria-hidden style={{ display: "block", position: "relative", top: "-5rem" }} />
      <style>{`
        .b06s-section {
          background: var(--color-secondary, #0A0A0A); font-family: 'Lato', system-ui, sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.15rem, 4vw, 3rem);
        }
        .b06s-inner { max-width: 84rem; margin: 0 auto; }
        .b06s-head { max-width: 46rem; margin-bottom: clamp(2.6rem, 5vw, 3.8rem); }
        .b06s-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem; margin-bottom: 1.1rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06s-eyebrow::before { content: ""; width: 36px; height: 2px; background: var(--color-primary, #FFC107); }
        .b06s-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase;
          font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: 0.01em;
          color: #fff; margin: 0 0 0.9rem; text-wrap: balance;
        }
        .b06s-sub { font-size: 1.02rem; line-height: 1.65; color: rgba(255,255,255,0.66); margin: 0; }
        .b06s-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.6rem, 3vw, 2.6rem); }
        .b06s-mediawrap { position: relative; display: block; }
        .b06s-card { display: flex; flex-direction: column; transition: transform 0.35s cubic-bezier(0.22,1,0.36,1); }
        .b06s-card:hover { transform: translateY(-6px); }
        /* OBLOUK — zaoblený vršek, rovné dno (silueta vintage barberského zrcadla) */
        .b06s-media {
          position: relative; display: block; aspect-ratio: 4 / 5; overflow: hidden;
          border-radius: 999px 999px 6px 6px; background: #141414;
          border: 1px solid rgba(255,193,7,0.28);
          transition: border-color 0.3s;
        }
        .b06s-card:hover .b06s-media { border-color: var(--color-primary, #FFC107); }
        .b06s-media img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .b06s-card:hover .b06s-media img { transform: scale(1.06); }
        .b06s-num {
          position: absolute; left: 50%; bottom: 0; transform: translate(-50%, 50%); z-index: 3;
          min-width: 2.1rem; height: 2.1rem; padding: 0 0.5rem; border-radius: 999px;
          display: flex; align-items: center; justify-content: center;
          background: var(--color-primary, #FFC107); color: #0a0a0a;
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 0.95rem; letter-spacing: 0.06em;
        }
        .b06s-body { padding: 2.1rem 0.4rem 0; display: flex; flex-direction: column; flex: 1; text-align: center; }
        .b06s-name {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.42rem; letter-spacing: 0.05em;
          text-transform: uppercase; color: #fff; margin: 0 0 0.55rem;
        }
        .b06s-desc { font-size: 0.94rem; line-height: 1.62; color: rgba(255,255,255,0.62); margin: 0 0 1.2rem; flex: 1; }
        .b06s-meta {
          display: flex; align-items: baseline; justify-content: center; gap: 0.9rem;
          padding-top: 0.9rem; border-top: 1px solid rgba(255,255,255,0.14);
        }
        .b06s-price {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.35rem; letter-spacing: 0.04em;
          color: var(--color-primary, #FFC107);
        }
        .b06s-dur { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
        @media (max-width: 959px) { .b06s-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 599px) { .b06s-grid { grid-template-columns: 1fr; max-width: 22rem; margin: 0 auto; } }
        @media (prefers-reduced-motion: reduce) { .b06s-card, .b06s-media img { transition: none; } }
      `}</style>

      <div className="b06s-inner">
        <div className="b06s-head">
          <span className="b06s-eyebrow">
            <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
          </span>
          <h2 className="b06s-title">
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
          {subtitle && (
            <p className="b06s-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
          )}
        </div>

        <div className="b06s-grid">
          {items.map((it, i) => (
            <article className="b06s-card" key={i}>
              <div className="b06s-mediawrap">
                {it.image && (
                  <GenericEditableImage sectionId={sectionId} field={`items.${i}.image`} src={it.image} alt={it.title ?? it.name ?? ""} className="b06s-media">
                    <img src={it.image} alt={it.title ?? it.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </GenericEditableImage>
                )}
                <span className="b06s-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="b06s-body">
                <h3 className="b06s-name">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={it.title ?? it.name ?? ""} tag="span" />
                </h3>
                <p className="b06s-desc">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.body`} value={it.body ?? it.description ?? ""} tag="span" />
                </p>
                <div className="b06s-meta">
                  <span className="b06s-price">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.price`} value={it.price ?? ""} tag="span" />
                  </span>
                  <span className="b06s-dur">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.duration`} value={it.duration ?? ""} tag="span" />
                  </span>
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

if __name__ == "__main__":
    print("barber-06 SEKCE 3 — služby")
    replace_fn("ServicesSection.tsx", "ServicesBarber06", SERVICES)
    print("hotovo.")
