#!/usr/bin/env python3
"""barber-06 SEKCE 7 — KONTAKT.

Vady původní (obnovené z hair-04) sekce:
  · nadpis Lato bold zlatě a VYCENTROVANÝ — celý zbytek šablony jede
    Bebas Neue uppercase bíle, vlevo, se zlatým eyebrow na lince
  · zlatá natvrdo `#FFDF25` ≠ theme --color-primary → nedědí mood presety
  · mapa měla marginLeft clamp(32px,6vw,100px), ale vpravo končila uprostřed
    → asymetrie, nesedí do 84rem gridu jako ostatní sekce
  · pravý sloupec = drobný řádkový seznam s ikonkami, žádná hierarchie
  · otevírací doba slepená do jednoho řádku „Po–Pá 9:00–18:00, So 9:00–14:00"
  · žádná akce — konec stránky bez „navigovat" / „zavolat"
  · pozůstatek tříd `h04-contact-*`

Nová sekce (dark & gold, konzistentní se sekcemi 1–6):
  · eyebrow s linkou + Bebas Neue nadpis + podtitul, vlevo v 84rem gridu
  · mapa se zlatou hairline v rámu, plná výška sloupce
  · vpravo dlaždice: adresa (+ Navigovat), telefon (velký, Bebas), e-mail,
    otevírací doba rozepsaná po řádcích s hairlines
  · sociální ikony jako kroužky se zlatým obrysem (echo .b06g-ico z galerie)
  · zpětně kompatibilní: `hours` string se rozparsuje, `hoursRows[]` má přednost
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

CONTACT = '''
// barber-06-contact — SEKCE 7. Mapa + dlaždice údajů, dark & gold.
// Pole: eyebrow, title, subtitle, addressTitle, address, mapLink, hours | hoursRows[].{day,time},
// phone, phoneHref, email, facebook, instagram, mapEmbedUrl.
function ContactBarber06({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Kontakt");
  const title = String(content.title ?? "Kudy k nám");
  const subtitle = String(content.subtitle ?? "Najdete nás kousek od metra. Přijďte na objednávku i bez ní.");
  const address = String(content.address ?? "");
  const hours = String(content.hours ?? "");
  const phone = String(content.phone ?? "");
  const phoneHref = String(content.phoneHref ?? (phone ? `tel:${phone.replace(/\\s/g, "")}` : ""));
  const email = String(content.email ?? "");
  const facebook = String(content.facebook ?? "");
  const instagram = String(content.instagram ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");
  const mapLink = String(content.mapLink ?? (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : ""));

  // Otevírací dobu chceme po řádcích. Když přijde jen slepený string
  // („Po – Pá 9:00–18:00, So 9:00–14:00"), rozsekáme ho na čárkách a
  // oddělíme popisek dne od času podle první číslice.
  type Row = { day: string; time: string };
  const rows: Row[] = ((content.hoursRows as Row[]) ?? []).filter((r) => r && (r.day || r.time));
  const hourRows: Row[] = rows.length > 0
    ? rows
    : hours
      ? hours.split(",").map((part) => {
          const t = part.trim();
          const m = t.match(/^(.*?)(\\d.*)$/);
          return m ? { day: m[1].trim(), time: m[2].trim() } : { day: t, time: "" };
        })
      : [];

  const DEMO_MAP = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.5!2d14.4378!3d50.0755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA0JzMxLjkiTiAxNMKwMjYnMTYuMSJF!5e0!3m2!1scs!2scz!4v1600000000000";
  const mapSrc = mapEmbedUrl || DEMO_MAP;

  return (
    <section id="kontakt" data-section-type="contact" data-variant="barber-06-contact" className="b06k-section" data-template="barber-06">
      <style>{`
        .b06k-section {
          scroll-margin-top: 5rem;
          background: var(--color-secondary, #0A0A0A); font-family: 'Lato', system-ui, sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.15rem, 4vw, 3rem);
        }
        .b06k-inner { max-width: 84rem; margin: 0 auto; }
        .b06k-head { max-width: 46rem; margin-bottom: clamp(2.4rem, 5vw, 3.4rem); }
        .b06k-eyebrow {
          display: inline-flex; align-items: center; gap: 0.8rem; margin-bottom: 1.1rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.28em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06k-eyebrow::before { content: ""; width: 36px; height: 2px; background: var(--color-primary, #FFC107); }
        .b06k-title {
          font-family: 'Bebas Neue', Impact, sans-serif; font-weight: 400; text-transform: uppercase;
          font-size: clamp(2.2rem, 5vw, 3.6rem); line-height: 0.98; letter-spacing: 0.01em;
          color: #fff; margin: 0 0 0.9rem; text-wrap: balance;
        }
        .b06k-sub { font-size: 1.02rem; line-height: 1.65; color: rgba(255,255,255,0.62); margin: 0; }
        .b06k-grid {
          display: grid; grid-template-columns: 1.15fr 0.85fr; gap: clamp(1.4rem, 3vw, 2.4rem);
          align-items: stretch;
        }
        /* mapa se zlatou hairline, plná výška sloupce */
        .b06k-map {
          position: relative; min-height: 26rem; overflow: hidden; background: #141414;
          border: 1px solid rgba(255,193,7,0.28);
        }
        /* Google iframe neumí dark styl bez API klíče — invert+hue-rotate ho převrátí
           do tmavého režimu, aby mapa nesvítila bíle uprostřed tmavé stránky. */
        .b06k-map iframe {
          width: 100%; height: 100%; min-height: 26rem; border: 0; display: block;
          filter: invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(0.88) saturate(0.7);
        }
        .b06k-tiles { display: flex; flex-direction: column; gap: clamp(0.7rem, 1.4vw, 1rem); }
        .b06k-tile {
          background: #141414; border: 1px solid rgba(255,255,255,0.09);
          padding: clamp(1.3rem, 2.2vw, 1.7rem); transition: border-color 0.3s;
        }
        .b06k-tile:hover { border-color: rgba(255,193,7,0.5); }
        .b06k-tile-l {
          display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.7rem;
          font-size: 0.68rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--color-primary, #FFC107);
        }
        .b06k-tile-l svg { flex-shrink: 0; }
        .b06k-addr { font-size: 1.02rem; line-height: 1.6; color: rgba(255,255,255,0.88); margin: 0 0 0.9rem; }
        .b06k-nav {
          display: inline-flex; align-items: center; gap: 0.45rem;
          font-size: 0.74rem; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--color-primary, #FFC107); text-decoration: none;
          border-bottom: 1px solid rgba(255,193,7,0.4); padding-bottom: 2px; transition: border-color 0.25s;
        }
        .b06k-nav:hover { border-color: var(--color-primary, #FFC107); }
        .b06k-phone {
          display: inline-block; font-family: 'Bebas Neue', Impact, sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.3rem); letter-spacing: 0.04em; line-height: 1;
          color: #fff; text-decoration: none; transition: color 0.25s;
        }
        .b06k-phone:hover { color: var(--color-primary, #FFC107); }
        .b06k-mail { font-size: 1rem; color: rgba(255,255,255,0.88); text-decoration: none; transition: color 0.25s; word-break: break-word; }
        .b06k-mail:hover { color: var(--color-primary, #FFC107); }
        .b06k-hours { display: flex; flex-direction: column; }
        .b06k-hrow {
          display: flex; justify-content: space-between; align-items: baseline; gap: 1rem;
          padding: 0.55rem 0; border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .b06k-hrow:last-child { border-bottom: none; padding-bottom: 0; }
        .b06k-hday { font-size: 0.86rem; color: rgba(255,255,255,0.6); }
        .b06k-htime { font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.06rem; letter-spacing: 0.04em; color: #fff; white-space: nowrap; }
        .b06k-social { display: flex; gap: 0.6rem; margin-top: 0.2rem; }
        /* echo zlatého kroužku z hoveru galerie */
        .b06k-soc {
          width: 2.7rem; height: 2.7rem; border-radius: 999px;
          border: 1px solid rgba(255,193,7,0.45); color: var(--color-primary, #FFC107);
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.25s, color 0.25s, transform 0.25s;
        }
        .b06k-soc:hover { background: var(--color-primary, #FFC107); color: #0a0a0a; transform: translateY(-2px); }
        @media (max-width: 899px) {
          .b06k-grid { grid-template-columns: 1fr; }
          .b06k-map { min-height: 20rem; }
          .b06k-map iframe { min-height: 20rem; }
        }
        @media (prefers-reduced-motion: reduce) { .b06k-tile, .b06k-soc, .b06k-phone { transition: none; } }
      `}</style>

      <div className="b06k-inner">
        <div className="b06k-head">
          <span className="b06k-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
          <h2 className="b06k-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="b06k-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>

        <div className="b06k-grid">
          <div className="b06k-map">
            <iframe src={mapSrc} title="Mapa — kudy k nám" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>

          <div className="b06k-tiles">
            {address && (
              <div className="b06k-tile">
                <span className="b06k-tile-l">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Adresa
                </span>
                <p className="b06k-addr"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="b06k-nav">
                    Navigovat
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17L17 7M7 7h10v10"/></svg>
                  </a>
                )}
              </div>
            )}

            {phone && (
              <div className="b06k-tile">
                <span className="b06k-tile-l">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z"/></svg>
                  Telefon
                </span>
                <a href={phoneHref} className="b06k-phone">{phone}</a>
              </div>
            )}

            {email && (
              <div className="b06k-tile">
                <span className="b06k-tile-l">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16v16H4z"/><path d="m4 6 8 6 8-6"/></svg>
                  E-mail
                </span>
                <a href={`mailto:${email}`} className="b06k-mail">{email}</a>
              </div>
            )}

            {hourRows.length > 0 && (
              <div className="b06k-tile">
                <span className="b06k-tile-l">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                  Otevírací doba
                </span>
                <div className="b06k-hours">
                  {hourRows.map((r, i) => (
                    <div className="b06k-hrow" key={i}>
                      <span className="b06k-hday">{r.day}</span>
                      {r.time && <span className="b06k-htime">{r.time}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(facebook || instagram) && (
              <div className="b06k-social">
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="b06k-soc" aria-label="Facebook">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="b06k-soc" aria-label="Instagram">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 7 — kontakt")
    replace_fn("ContactSection.tsx", "ContactBarber06", CONTACT)
    print("hotovo.")
