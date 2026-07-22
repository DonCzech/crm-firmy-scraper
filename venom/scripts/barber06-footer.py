#!/usr/bin/env python3
"""barber-06 SEKCE 8 — PATIČKA.

Vady původní (obnovené z hair-04) patičky:
  · REZIDUUM KONKURENCE: siteName „Impresiv Studio" + copyright
    „© 2024 Impresiv Studio" — poslední zbytek klonu v celé šabloně
  · natvrdo „HAIR SALON" v kódu — barbershop není dámský salon
  · zastaralý rok 2024 v copyrightu
  · jméno v Lato bold, zbytek šablony jede Bebas Neue
  · zlatá natvrdo #FFDF25 ≠ --color-primary → nedědila mood presety
  · jeden plochý řádek: logo | drobný šedý text uprostřed | ikony
    → žádná navigace, žádné otevírací hodiny, žádné CTA
  · hover řešen inline onMouseEnter JS místo CSS
  · CHYBĚL WeberoCredit úplně

Nová patička (dark & gold, konzistentní se sekcemi 1–7):
  · zlatá hairline nahoře, 4 sloupce: značka (monogram + Bebas název +
    eyebrow + sociální kroužky), Navigace, Kontakt, Otevřeno
  · spodní pás: copyright · GDPR vlevo, WeberoCredit vpravo — na JEDNOM
    řádku (flex + wrap), ne posunutý pod
  · otevírací doba sdílí `hoursRows` formát s kontaktem
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn  # noqa

FOOTER = '''
// barber-06-footer — SEKCE 8. Čtyřsloupcová patička, dark & gold.
// Pole: siteName, tagline, monogram, address, phone, phoneHref, email,
// navLinks[].{label,href}, hoursRows[].{day,time}, facebook, instagram, copyright, gdprHref.
function FooterBarber06({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName = String(content.siteName ?? "ALFA Barbershop");
  const tagline = String(content.tagline ?? "Barbershop · Praha");
  const monogram = String(content.monogram ?? siteName.trim().charAt(0).toUpperCase());
  const address = String(content.address ?? "");
  const phone = String(content.phone ?? "");
  const phoneHref = String(content.phoneHref ?? (phone ? `tel:${phone.replace(/\\s/g, "")}` : ""));
  const email = String(content.email ?? "");
  const facebook = String(content.facebook ?? "");
  const instagram = String(content.instagram ?? "");
  const gdprHref = String(content.gdprHref ?? "/gdpr");
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const navLinks = ((content.navLinks as Array<{ label: string; href: string }>) ?? []).filter((l) => l && l.label);
  const hoursRows = ((content.hoursRows as Array<{ day: string; time: string }>) ?? []).filter((r) => r && (r.day || r.time));
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-template="barber-06" className="b06f-footer">
      <style>{`
        .b06f-footer {
          background: var(--color-secondary, #0A0A0A); font-family: 'Lato', system-ui, sans-serif;
          border-top: 1px solid rgba(255,193,7,0.28);
        }
        .b06f-inner {
          max-width: 84rem; margin: 0 auto;
          padding: clamp(3rem, 6vw, 4.6rem) clamp(1.15rem, 4vw, 3rem) clamp(1.8rem, 3vw, 2.4rem);
          display: grid; grid-template-columns: 1.3fr 0.8fr 1fr 1fr; gap: clamp(2rem, 4vw, 3.4rem);
        }
        .b06f-brand-row { display: flex; align-items: center; gap: 0.9rem; margin-bottom: 1rem; }
        .b06f-mono {
          width: 2.9rem; height: 2.9rem; flex-shrink: 0;
          border: 2px solid var(--color-primary, #FFC107); color: var(--color-primary, #FFC107);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.5rem; line-height: 1;
        }
        .b06f-name {
          font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1.6rem; letter-spacing: 0.04em;
          text-transform: uppercase; color: #fff; display: block; line-height: 1.05;
        }
        .b06f-tag {
          font-size: 0.66rem; font-weight: 900; letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--color-primary, #FFC107); display: block; margin-top: 0.2rem;
        }
        .b06f-addr { font-size: 0.92rem; line-height: 1.65; color: rgba(255,255,255,0.55); margin: 0 0 1.4rem; max-width: 26ch; }
        .b06f-social { display: flex; gap: 0.55rem; }
        .b06f-soc {
          width: 2.5rem; height: 2.5rem; border-radius: 999px;
          border: 1px solid rgba(255,193,7,0.4); color: var(--color-primary, #FFC107);
          display: inline-flex; align-items: center; justify-content: center;
          transition: background 0.25s, color 0.25s, transform 0.25s;
        }
        .b06f-soc:hover { background: var(--color-primary, #FFC107); color: #0a0a0a; transform: translateY(-2px); }
        .b06f-h {
          font-size: 0.68rem; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--color-primary, #FFC107); margin: 0 0 1.1rem;
        }
        .b06f-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.65rem; }
        .b06f-list a, .b06f-list span { font-size: 0.94rem; color: rgba(255,255,255,0.62); text-decoration: none; transition: color 0.25s; }
        .b06f-list a:hover { color: var(--color-primary, #FFC107); }
        /* bez omezení šířky by se den a čas rozjely na opačné konce celého sloupce */
        .b06f-hrow { display: flex; justify-content: space-between; gap: 0.9rem; font-size: 0.9rem; max-width: 13rem; }
        .b06f-hday { color: rgba(255,255,255,0.55); }
        .b06f-htime { font-family: 'Bebas Neue', Impact, sans-serif; font-size: 1rem; letter-spacing: 0.04em; color: #fff; white-space: nowrap; }
        /* spodní pás: copyright vlevo, credit vpravo — na JEDNOM řádku */
        .b06f-bottom {
          max-width: 84rem; margin: 0 auto;
          padding: 1.2rem clamp(1.15rem, 4vw, 3rem) 1.6rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 0.8rem 1.4rem;
        }
        .b06f-legal {
          margin: 0; font-size: 0.78rem; color: rgba(255,255,255,0.42);
          display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem;
        }
        .b06f-legal a { color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.25s; }
        .b06f-legal a:hover { color: var(--color-primary, #FFC107); }
        .b06f-dot { opacity: 0.4; }
        @media (max-width: 899px) {
          .b06f-inner { grid-template-columns: 1fr 1fr; gap: 2.2rem; }
        }
        @media (max-width: 559px) {
          .b06f-inner { grid-template-columns: 1fr; }
          .b06f-bottom { justify-content: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) { .b06f-soc, .b06f-list a, .b06f-legal a { transition: none; } }
      `}</style>

      <div className="b06f-inner">
        <div>
          <div className="b06f-brand-row">
            <span className="b06f-mono" aria-hidden>{monogram}</span>
            <span>
              <span className="b06f-name"><GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" /></span>
              <span className="b06f-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            </span>
          </div>
          {address && (
            <p className="b06f-addr"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></p>
          )}
          {(facebook || instagram) && (
            <div className="b06f-social">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="b06f-soc" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="b06f-soc" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>
                </a>
              )}
            </div>
          )}
        </div>

        {navLinks.length > 0 && (
          <div>
            <p className="b06f-h">Navigace</p>
            <ul className="b06f-list">
              {navLinks.map((l, i) => (
                <li key={i}><a href={resolve(l.href)}>{l.label}</a></li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="b06f-h">Kontakt</p>
          <ul className="b06f-list">
            {phone && <li><a href={phoneHref}>{phone}</a></li>}
            {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
          </ul>
        </div>

        {hoursRows.length > 0 && (
          <div>
            <p className="b06f-h">Otevřeno</p>
            <ul className="b06f-list">
              {hoursRows.map((r, i) => (
                <li className="b06f-hrow" key={i}>
                  <span className="b06f-hday">{r.day}</span>
                  {r.time && <span className="b06f-htime">{r.time}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="b06f-bottom">
        <p className="b06f-legal">
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" />
          <span className="b06f-dot">·</span>
          <a href={resolve(gdprHref)}>Ochrana osobních údajů</a>
        </p>
        <WeberoCredit />
      </div>
    </footer>
  );
}
'''

if __name__ == "__main__":
    print("barber-06 SEKCE 8 — patička")
    replace_fn("FooterSection.tsx", "FooterBarber06", FOOTER)
    print("hotovo.")
