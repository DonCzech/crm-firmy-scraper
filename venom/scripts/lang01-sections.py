#!/usr/bin/env python3
"""lang-01 — doplnění chybějících sekcí (homepage byla „chabá a krátká").

Chybělo: kontaktní sekce na homepage (obsah v cs.json byl, ale nikde se nerenderoval),
rezervační widget Rezora, reference. Podstránky jely na generickém `hero-centered`
a kontaktní stránka dokonce na CIZÍ variantě `autoskola-01-contact`.

Přidává: hero-lang-01-page, lang-01-contact (reálný POST formulář), lang-01-testimonials.
Idempotentní.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import append_fn, add_dispatch, SEC  # noqa

FONT = "'Inter', -apple-system, sans-serif"

HERO_PAGE = '''
// hero-lang-01-page — podstránkový hero (jazyková škola). Podstránky dřív jely na
// generickém `hero-centered`. Navy pás s červeným akcentem a drobečky.
function HeroLang01Page({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const title = String(content.title ?? content.heading ?? "");
  const subtitle = String(content.subtitle ?? content.subheading ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section className="l01hp-wrap" data-template="lang-01">
      <style>{`
        .l01hp-wrap {
          background: var(--color-secondary, #1a1a2e); font-family: 'Inter', -apple-system, sans-serif;
          padding: calc(4.6rem + clamp(2.5rem, 6vw, 4.2rem)) clamp(1.25rem, 4vw, 2.75rem) clamp(2.5rem, 6vw, 4.2rem);
        }
        .l01hp-inner { max-width: 1200px; margin: 0 auto; }
        .l01hp-crumb { font-size: 0.84rem; color: rgba(255,255,255,0.6); margin-bottom: 0.9rem; }
        .l01hp-crumb a { color: rgba(255,255,255,0.6); text-decoration: none; }
        .l01hp-crumb a:hover { color: var(--color-primary, #e63946); }
        .l01hp-title {
          font-weight: 800; letter-spacing: -0.02em; font-size: clamp(2.1rem, 4.8vw, 3.4rem);
          line-height: 1.06; color: #fff; margin: 0 0 0.8rem; text-wrap: balance;
        }
        .l01hp-rule { display: block; width: 64px; height: 4px; border-radius: 2px; background: var(--color-primary, #e63946); margin-bottom: 1rem; }
        .l01hp-sub { font-size: 1.05rem; line-height: 1.65; color: rgba(255,255,255,0.78); max-width: 54ch; margin: 0; }
      `}</style>
      <div className="l01hp-inner">
        <div className="l01hp-crumb"><a href={resolve("/")}>Úvod</a> <span aria-hidden>/</span> {title}</div>
        <h1 className="l01hp-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h1>
        <span className="l01hp-rule" aria-hidden />
        {subtitle && <p className="l01hp-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
      </div>
    </section>
  );
}
'''

TESTIMONIALS = '''
// lang-01-testimonials — reference studentů. Iniciálové avatary (žádné stock portréty),
// červené hvězdy, světlá sekce pro rytmus mezi navy pásy.
function TestimonialsLang01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; text?: string; rating?: string };
  const eyebrow = String(content.eyebrow ?? "Reference");
  const heading = String(content.heading ?? "Co říkají studenti");
  const items = ((content.items ?? content.testimonials) as T[]) ?? [];
  const ini = (n: string) => n.split(/\\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <section id="reference" data-section-type="testimonials" data-variant="lang-01-testimonials" className="l01tm-section" data-template="lang-01">
      <style>{`
        .l01tm-section { background: var(--color-bg, #f7f8fc); font-family: 'Inter', -apple-system, sans-serif;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .l01tm-inner { max-width: 1200px; margin: 0 auto; }
        .l01tm-head { text-align: center; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .l01tm-eyebrow { display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--color-primary, #e63946); margin-bottom: 0.7rem; }
        .l01tm-title { font-weight: 800; letter-spacing: -0.02em; font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          line-height: 1.1; color: var(--color-text, #1a1a2e); margin: 0; text-wrap: balance; }
        .l01tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.2rem, 2.4vw, 1.8rem); }
        .l01tm-card { background: #fff; border: 1px solid var(--color-border, #e6e8f0); border-radius: 14px;
          padding: clamp(1.4rem, 2.4vw, 1.9rem); display: flex; flex-direction: column; }
        .l01tm-stars { color: var(--color-primary, #e63946); font-size: 0.92rem; letter-spacing: 0.15em; margin-bottom: 0.9rem; }
        .l01tm-text { font-size: 1rem; line-height: 1.68; color: var(--color-text, #1a1a2e); margin: 0 0 1.3rem; flex: 1; }
        .l01tm-who { display: flex; align-items: center; gap: 0.8rem; }
        .l01tm-av { width: 2.7rem; height: 2.7rem; border-radius: 999px; flex-shrink: 0; display: flex;
          align-items: center; justify-content: center; background: var(--color-secondary, #1a1a2e);
          color: #fff; font-size: 0.86rem; font-weight: 700; }
        .l01tm-name { font-weight: 700; font-size: 0.96rem; color: var(--color-text, #1a1a2e); display: block; }
        .l01tm-role { font-size: 0.84rem; color: var(--color-text-muted, #6b7280); }
        @media (max-width: 899px) { .l01tm-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="l01tm-inner">
        <div className="l01tm-head">
          <span className="l01tm-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></span>
          <h2 className="l01tm-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
        </div>
        <div className="l01tm-grid">
          {items.map((t, i) => (
            <figure className="l01tm-card" key={i}>
              <div className="l01tm-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>{"★".repeat(Number(t.rating ?? 5) || 5)}</div>
              <blockquote className="l01tm-text"><GenericEditableText sectionId={sectionId} field={`items.${i}.text`} value={t.text ?? ""} tag="span" /></blockquote>
              <figcaption className="l01tm-who">
                <span className="l01tm-av" aria-hidden>{ini(t.author ?? "")}</span>
                <span>
                  <span className="l01tm-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.author`} value={t.author ?? ""} tag="span" /></span>
                  <span className="l01tm-role"><GenericEditableText sectionId={sectionId} field={`items.${i}.role`} value={t.role ?? ""} tag="span" /></span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

CONTACT = '''
// lang-01-contact — kontakt s REÁLNÝM formulářem (POST /api/demo/<slug>/contact).
// Nahrazuje cizí variantu `autoskola-01-contact`, která se sem zatoulala z jiné šablony.
function ContactLang01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const heading = String(content.heading ?? "Ozvěte se nám");
  const subheading = String(content.subheading ?? "");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const hours = String(content.hours ?? "");

  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [tel, setTel] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin || hp || !tenantSlug) return;
    setStatus("sending"); setErrorMsg("");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: mail, phone: tel, message, website: hp }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat zprávu."); setStatus("error"); }
      else { setStatus("success"); setName(""); setMail(""); setTel(""); setMessage(""); }
    } catch { setErrorMsg("Nepodařilo se odeslat zprávu. Zkuste to znovu."); setStatus("error"); }
  }

  return (
    <section id="kontakt" data-section-type="contact" data-variant="lang-01-contact" className="l01co-section" data-template="lang-01">
      <style>{`
        .l01co-section { background: var(--color-surface, #ffffff); font-family: 'Inter', -apple-system, sans-serif;
          padding: clamp(4rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .l01co-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2.2rem, 5vw, 4rem); align-items: start; }
        .l01co-eyebrow { display: block; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--color-primary, #e63946); margin-bottom: 0.7rem; }
        .l01co-title { font-weight: 800; letter-spacing: -0.02em; font-size: clamp(1.8rem, 3.6vw, 2.6rem);
          line-height: 1.1; color: var(--color-text, #1a1a2e); margin: 0 0 0.9rem; text-wrap: balance; }
        .l01co-sub { font-size: 1.02rem; line-height: 1.65; color: var(--color-text-muted, #6b7280); margin: 0 0 1.8rem; max-width: 46ch; }
        .l01co-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding: 0.85rem 0; border-bottom: 1px solid var(--color-border, #e6e8f0); }
        .l01co-row:first-of-type { border-top: 1px solid var(--color-border, #e6e8f0); }
        .l01co-k { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #6b7280); }
        .l01co-v { font-size: 0.98rem; font-weight: 600; color: var(--color-text, #1a1a2e); text-align: right; text-decoration: none; }
        a.l01co-v:hover { color: var(--color-primary, #e63946); }
        .l01co-form { background: var(--color-bg, #f7f8fc); border-radius: 14px; padding: clamp(1.5rem, 3vw, 2.2rem); }
        .l01co-form h3 { font-weight: 800; font-size: 1.25rem; color: var(--color-text, #1a1a2e); margin: 0 0 1.3rem; }
        .l01co-f { margin-bottom: 0.95rem; }
        .l01co-f label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted, #6b7280); margin-bottom: 0.35rem; }
        .l01co-f input, .l01co-f textarea { width: 100%; padding: 0.78rem 1rem; border-radius: 10px; box-sizing: border-box;
          border: 1px solid var(--color-border, #e6e8f0); background: #fff; color: var(--color-text, #1a1a2e);
          font-family: inherit; font-size: 0.95rem; }
        .l01co-f input:focus, .l01co-f textarea:focus { outline: 2px solid var(--color-primary, #e63946); outline-offset: 1px; border-color: transparent; }
        .l01co-f textarea { min-height: 6.5rem; resize: vertical; }
        .l01co-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .l01co-submit { width: 100%; padding: 0.95rem 1.5rem; border: none; border-radius: 10px; cursor: pointer;
          background: var(--color-primary, #e63946); color: #fff; font-family: inherit; font-size: 0.98rem;
          font-weight: 700; transition: transform 0.2s, filter 0.2s; }
        .l01co-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.94); }
        .l01co-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .l01co-note { font-size: 0.79rem; line-height: 1.5; color: var(--color-text-muted, #6b7280); margin: 0.85rem 0 0; }
        .l01co-msg { font-size: 0.9rem; margin: 0.85rem 0 0; padding: 0.7rem 1rem; border-radius: 10px; }
        .l01co-msg[data-kind="success"] { background: #e4f0e8; color: #1f5133; }
        .l01co-msg[data-kind="error"] { background: #fbe3e5; color: #8a232e; }
        @media (max-width: 899px) { .l01co-inner { grid-template-columns: 1fr; } }
      `}</style>
      <div className="l01co-inner">
        <div>
          <span className="l01co-eyebrow">Kontakt</span>
          <h2 className="l01co-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
          {subheading && <p className="l01co-sub"><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>}
          {phone && <div className="l01co-row"><span className="l01co-k">Telefon</span><a className="l01co-v" href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a></div>}
          {email && <div className="l01co-row"><span className="l01co-k">E-mail</span><a className="l01co-v" href={`mailto:${email}`}>{email}</a></div>}
          {address && <div className="l01co-row"><span className="l01co-k">Adresa</span><span className="l01co-v"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span></div>}
          {hours && <div className="l01co-row"><span className="l01co-k">Otevřeno</span><span className="l01co-v"><GenericEditableText sectionId={sectionId} field="hours" value={hours} tag="span" /></span></div>}
        </div>
        <form className="l01co-form" onSubmit={handleSubmit} style={{ position: "relative" }}>
          <h3>Napište nám</h3>
          <div className="l01co-f"><label htmlFor={`l01-n-${sectionId}`}>Jméno *</label><input id={`l01-n-${sectionId}`} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div className="l01co-f"><label htmlFor={`l01-e-${sectionId}`}>E-mail *</label><input id={`l01-e-${sectionId}`} type="email" required value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" /></div>
          <div className="l01co-f"><label htmlFor={`l01-t-${sectionId}`}>Telefon</label><input id={`l01-t-${sectionId}`} value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" /></div>
          <div className="l01co-f"><label htmlFor={`l01-m-${sectionId}`}>Zpráva *</label><textarea id={`l01-m-${sectionId}`} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className="l01co-hp" aria-hidden>
            <label htmlFor={`l01-w-${sectionId}`}>Nevyplňujte</label>
            <input id={`l01-w-${sectionId}`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <button type="submit" className="l01co-submit" disabled={status === "sending"}>{status === "sending" ? "Odesílám…" : "Odeslat zprávu"}</button>
          {status === "success" && <p className="l01co-msg" data-kind="success" role="status">Děkujeme, ozveme se vám do 24 hodin.</p>}
          {status === "error" && <p className="l01co-msg" data-kind="error" role="alert">{errorMsg}</p>}
          <p className="l01co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
        </form>
      </div>
    </section>
  );
}
'''

if __name__ == "__main__":
    print("lang-01 — doplnění sekcí")
    append_fn("HeroSection.tsx", HERO_PAGE, "function HeroLang01Page(")
    hp = SEC / "HeroSection.tsx"
    src = hp.read_text()
    line = '  if (variant === "hero-lang-01-page") return <HeroLang01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'
    if line not in src:
        src = src.replace('  if (variant === "lang-01-hero") {', line + '\n  if (variant === "lang-01-hero") {', 1)
        hp.write_text(src); print("  ✓ dispatch hero-lang-01-page")

    append_fn("TestimonialsSection.tsx", TESTIMONIALS, "function TestimonialsLang01(")
    add_dispatch("TestimonialsSection.tsx", 'return <TestimonialsHair04 content={content}',
                 '  }\n    if (variant === "lang-01-testimonials") {\n    return <TestimonialsLang01 content={content} sectionId={sectionId} />;')

    append_fn("ContactSection.tsx", CONTACT, "function ContactLang01(")
    add_dispatch("ContactSection.tsx", 'if (variant === "hair-03-contact") {',
                 '    return <ContactHair03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
                 '  }\n  if (variant === "lang-01-contact") {\n'
                 '    return <ContactLang01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;')
    print("hotovo.")
