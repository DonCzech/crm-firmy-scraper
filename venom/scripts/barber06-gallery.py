#!/usr/bin/env python3
"""barber-06 SEKCE 6 — GALERIE.

Vady původní (klonované) galerie:
  · karusel s fotkami konkurence — růžová dámská křesla, žena s dlouhými vlasy,
    dámské barvení; alt texty „Barvení vlasů" (dámský salon v barbershopu)
  · karusel = jen část fotek vidět, zbytek schovaný za šipkami
  · klik na fotku nic nedělal

Nová galerie (dark & gold zachován):
  · mřížka 6 fotek 4/5, první přes 2 sloupce jako akcent
  · hover: zoom + zlatý rám; grayscale→barva pro sjednocení tónu
  · KLIK → fullscreen lightbox (Esc, šipky, klik na pozadí) — sdílená komponenta
  · reálné barber fotky, vizuálně ověřené
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

GALLERY = '''
// barber-06-gallery — SEKCE 6. Mřížka barber fotek s hover zoomem a lightboxem.
// Nahradila karusel s fotkami konkurence. Pole: eyebrow/title/subtitle, images[].{url,alt}.
function GalleryBarber06({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Img = { url?: string; alt?: string };
  const eyebrow = String(content.eyebrow ?? "Galerie");
  const title = String(content.title ?? "Práce z našeho křesla");
  const subtitle = String(content.subtitle ?? "");
  const images = ((content.images as Img[]) ?? []).filter((i) => i && i.url);
  const editor = useGenericInlineEditor();
  const [lb, setLb] = useState<number | null>(null);
  const navLb = useCallback((dir: number) => setLb((v) => v === null ? v : (v + dir + images.length) % images.length), [images.length]);

  return (
    <section id="galerie" data-section-type="gallery" data-variant="barber-06-gallery" className="b06g-section" data-template="barber-06">
      <style>{`
        .b06g-section {
          scroll-margin-top: 5rem;
          background: var(--color-secondary, #0A0A0A); font-family: 'Lato', system-ui, sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.15rem, 4vw, 3rem);
        }
        .b06g-inner { max-width: 84rem; margin: 0 auto; }
        .b06g-head { max-width: 46rem; margin-bottom: clamp(2.4rem, 5vw, 3.4rem); }
        .b06g-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem; margin-bottom: 1.1rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06g-eyebrow::before { content: ""; width: 36px; height: 2px; background: var(--color-primary, #FFC107); }
        .b06g-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase;
          font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: 0.01em;
          color: #fff; margin: 0 0 0.9rem; text-wrap: balance;
        }
        .b06g-sub { font-size: 1.02rem; line-height: 1.65; color: rgba(255,255,255,0.62); margin: 0; }
        .b06g-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(0.7rem, 1.4vw, 1.1rem); }
        .b06g-cell { position: relative; display: block; }
        .b06g-cell:nth-child(1) { grid-column: span 2; grid-row: span 2; }
        .b06g-item {
          position: relative; display: block; width: 100%; height: 100%; aspect-ratio: 4 / 5;
          overflow: hidden; background: #141414;
        }
        .b06g-cell:nth-child(1) .b06g-item { aspect-ratio: auto; }
        .b06g-item img {
          width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.92);
          transition: transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease;
          will-change: transform;
        }
        .b06g-cell:hover .b06g-item img { transform: scale(1.05); filter: brightness(1.02); }
        /* premium hover: tmavý gradient + zlatý kruh s ikonou + popisek */
        .b06g-ov {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(180deg, rgba(10,10,10,0) 42%, rgba(10,10,10,0.72) 100%);
          opacity: 0; transition: opacity 0.45s ease;
        }
        .b06g-cell:hover .b06g-ov, .b06g-cell:focus-within .b06g-ov { opacity: 1; }
        .b06g-ico {
          width: 3.3rem; height: 3.3rem; border-radius: 999px; border: 1.5px solid var(--color-primary, #FFC107);
          display: flex; align-items: center; justify-content: center; color: var(--color-primary, #FFC107);
          background: rgba(10,10,10,0.32); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
          transform: scale(0.7); opacity: 0; transition: transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease;
        }
        .b06g-cell:hover .b06g-ico, .b06g-cell:focus-within .b06g-ico { transform: scale(1); opacity: 1; }
        .b06g-cap {
          position: absolute; left: 1.1rem; bottom: 0.95rem; z-index: 2; max-width: 80%;
          font-size: 0.7rem; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase;
          color: #fff; text-shadow: 0 1px 6px rgba(0,0,0,0.6);
          transform: translateY(10px); opacity: 0; transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease;
        }
        .b06g-cell:hover .b06g-cap, .b06g-cell:focus-within .b06g-cap { transform: none; opacity: 1; }
        .b06g-frame {
          position: absolute; inset: 0.6rem; z-index: 1; pointer-events: none;
          border: 1px solid rgba(255,193,7,0); transition: border-color 0.45s ease, inset 0.45s ease;
        }
        .b06g-cell:hover .b06g-frame { border-color: rgba(255,193,7,0.85); }
        .b06g-zoom {
          position: absolute; inset: 0; z-index: 3; background: transparent; border: 0; cursor: pointer;
        }
        @media (max-width: 767px) {
          .b06g-grid { grid-template-columns: repeat(2, 1fr); }
          .b06g-cell:nth-child(1) { grid-column: span 2; grid-row: auto; }
          .b06g-cell:nth-child(1) .b06g-item { aspect-ratio: 16 / 10; }
        }
        @media (prefers-reduced-motion: reduce) { .b06g-item img { transition: none; } }
      `}</style>

      <div className="b06g-inner">
        <div className="b06g-head">
          <span className="b06g-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
          <h2 className="b06g-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="b06g-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="b06g-grid">
          {images.map((im, i) => (
            <div className="b06g-cell" key={i}>
              <GenericEditableImage sectionId={sectionId} field={`images.${i}.url`} src={im.url ?? ""} alt={im.alt ?? ""} className="b06g-item">
                <img src={im.url ?? ""} alt={im.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </GenericEditableImage>
              <span className="b06g-frame" aria-hidden />
              <span className="b06g-ov" aria-hidden>
                <span className="b06g-ico">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </span>
              </span>
              {im.alt && <span className="b06g-cap" aria-hidden>{im.alt}</span>}
              {!editor.isAdmin && (
                <button className="b06g-zoom" aria-label={`Zvětšit: ${im.alt ?? "fotografie"}`} onClick={() => setLb(i)} />
              )}
            </div>
          ))}
        </div>
      </div>
      <GalleryLightbox images={images} index={lb} onClose={() => setLb(null)} onNav={navLb} />
    </section>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 6 — galerie")
    replace_fn("GallerySection.tsx", "GalleryBarber06", GALLERY)
    print("hotovo.")
