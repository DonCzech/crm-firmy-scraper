#!/usr/bin/env python3
"""hair-04 „Studio Pop" — etapa B: recenze, blog, kontakt (mapa + reálný formulář), footer."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn, replace_inline_block, append_fn, add_dispatch, SEC  # noqa

EB = """        .h04-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-primary, #6D4AFF);
        }
        .h04-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #6D4AFF); }"""

TESTIMONIALS = '''
// hair-04-testimonials — V3 Studio Pop: bílá sekce, karty s violet iniciálovými avatary
// (NIKDY stock portréty). Pole: tagline/title/rating/ratingLabel, testimonials[].
function TestimonialsHair04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klienti");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const ini = (n: string) => n.split(/\\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-04-testimonials" className="h04rv-section" data-template="hair-04">
      <style>{`
        .h04rv-section { background: var(--color-surface, #FFFFFF); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04rv-inner { max-width: 82rem; margin: 0 auto; }
        .h04rv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
          flex-wrap: wrap; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
EB_PLACEHOLDER
        .h04rv-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: var(--color-text, #17132A); margin: 0; text-wrap: balance; }
        .h04rv-score { text-align: right; }
        .h04rv-score-v { font-family: 'Space Grotesk', sans-serif; font-weight: 700;
          font-size: clamp(2.2rem, 4.5vw, 3rem); color: var(--color-primary, #6D4AFF); line-height: 1; display: block; }
        .h04rv-score-l { font-size: 0.84rem; color: var(--color-text-muted, #6A6382); }
        .h04rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.2rem, 2.4vw, 1.8rem); }
        .h04rv-card { background: var(--color-bg, #F5F4FA); border-radius: 14px; padding: clamp(1.4rem, 2.4vw, 1.9rem); display: flex; flex-direction: column; }
        .h04rv-stars { color: var(--color-primary, #6D4AFF); font-size: 0.92rem; letter-spacing: 0.16em; margin-bottom: 0.9rem; }
        .h04rv-text { font-size: 1rem; line-height: 1.68; color: var(--color-text, #17132A); margin: 0 0 1.4rem; flex: 1; }
        .h04rv-who { display: flex; align-items: center; gap: 0.8rem; }
        .h04rv-av { width: 2.7rem; height: 2.7rem; border-radius: 999px; flex-shrink: 0; display: flex;
          align-items: center; justify-content: center; background: var(--color-primary, #6D4AFF); color: #fff;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.86rem; font-weight: 700; }
        .h04rv-name { font-weight: 600; font-size: 0.96rem; color: var(--color-text, #17132A); display: block; }
        .h04rv-role { font-size: 0.83rem; color: var(--color-text-muted, #6A6382); }
        @media (max-width: 899px) { .h04rv-grid { grid-template-columns: 1fr; } .h04rv-score { text-align: left; } }
      `}</style>
      <div className="h04rv-inner">
        <div className="h04rv-head">
          <div>
            <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            <h2 className="h04rv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          {rating && (
            <div className="h04rv-score">
              <span className="h04rv-score-v"><GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" /></span>
              <span className="h04rv-score-l"><GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" /></span>
            </div>
          )}
        </div>
        <div className="h04rv-grid">
          {items.map((t, i) => (
            <figure className="h04rv-card" key={i}>
              <div className="h04rv-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>{"★".repeat(Number(t.rating ?? 5) || 5)}</div>
              <blockquote className="h04rv-text"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" /></blockquote>
              <figcaption className="h04rv-who">
                <span className="h04rv-av" aria-hidden>{ini(t.author ?? "")}</span>
                <span>
                  <span className="h04rv-name"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" /></span>
                  <span className="h04rv-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" /></span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
'''.replace("EB_PLACEHOLDER", EB)

BLOG = '''
// hair-04-blog — V3 Studio Pop: karty s fotkou 3/2, violet datem a hairline patičkou.
// Nahrazuje generický 'default' (renderoval kancelářské stock fotky u barbershopu).
function BlogHair04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type P = { title?: string; excerpt?: string; image?: string; href?: string; date?: string };
  const tagline = String(content.tagline ?? "Magazín");
  const title = String(content.title ?? "Z našeho blogu");
  const posts = (content.posts as P[]) ?? [];
  const buttonText = String(content.buttonText ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <section id="blog" data-section-type="blog-preview" data-variant="hair-04-blog" className="h04bl-section" data-template="hair-04">
      <style>{`
        .h04bl-section { background: var(--color-bg, #F5F4FA); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04bl-inner { max-width: 82rem; margin: 0 auto; }
        .h04bl-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
EB_PLACEHOLDER
        .h04bl-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: var(--color-text, #17132A); margin: 0; text-wrap: balance; }
        .h04bl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 2.6vw, 2.1rem); }
        .h04bl-card { display: flex; flex-direction: column; text-decoration: none; background: var(--color-surface, #fff);
          border-radius: 14px; overflow: hidden; transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s; }
        .h04bl-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(23,19,42,0.12); }
        .h04bl-photo { aspect-ratio: 3 / 2; overflow: hidden; display: block; background: #E4E1F2; }
        .h04bl-photo img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .h04bl-card:hover .h04bl-photo img { transform: scale(1.05); }
        .h04bl-body { padding: 1.3rem 1.5rem 1.5rem; display: flex; flex-direction: column; flex: 1; }
        .h04bl-date { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-primary, #6D4AFF); display: block; margin-bottom: 0.5rem; }
        .h04bl-h { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.12rem; line-height: 1.3;
          color: var(--color-text, #17132A); margin: 0 0 0.6rem; }
        .h04bl-x { font-size: 0.93rem; line-height: 1.62; color: var(--color-text-muted, #6A6382); margin: 0 0 1rem; flex: 1; }
        .h04bl-more { font-size: 0.86rem; font-weight: 600; color: var(--color-primary, #6D4AFF);
          padding-top: 0.8rem; border-top: 1px solid var(--color-border, #E4E1F2); }
        .h04bl-all { display: inline-flex; align-items: center; margin-top: clamp(2rem, 4vw, 2.8rem);
          padding: 0.95rem 2rem; border-radius: 999px; background: var(--color-primary, #6D4AFF); color: #fff;
          font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: background 0.25s, transform 0.25s; }
        .h04bl-all:hover { background: var(--color-accent, #5233E0); transform: translateY(-2px); }
        @media (max-width: 899px) { .h04bl-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .h04bl-card, .h04bl-photo img { transition: none; } }
      `}</style>
      <div className="h04bl-inner">
        <div className="h04bl-head">
          <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h04bl-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
        </div>
        <div className="h04bl-grid">
          {posts.map((p, i) => (
            <a className="h04bl-card" key={i} href={resolve(p.href ?? "/blog")}>
              {p.image && (
                <GenericEditableImage sectionId={sectionId} field={`posts.${i}.image`} src={p.image} alt={p.title ?? ""} className="h04bl-photo">
                  <img src={p.image} alt={p.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <div className="h04bl-body">
                <span className="h04bl-date"><GenericEditableText sectionId={sectionId} field={`posts.${i}.date`} value={p.date ?? ""} tag="span" /></span>
                <h3 className="h04bl-h"><GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={p.title ?? ""} tag="span" /></h3>
                <p className="h04bl-x"><GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={p.excerpt ?? ""} tag="span" /></p>
                <span className="h04bl-more">Číst dál →</span>
              </div>
            </a>
          ))}
        </div>
        {buttonText && <a href={resolve("/blog")} className="h04bl-all">{buttonText}</a>}
      </div>
    </section>
  );
}
'''.replace("EB_PLACEHOLDER", EB)

CONTACT = '''
// hair-04-contact — V3 Studio Pop: vlevo hairline údaje + otevírací doba, vpravo REÁLNÝ
// formulář (POST /api/demo/<slug>/contact); mapa jen když je vyplněn mapEmbedUrl
// (dřív se renderoval prázdný šedý box). Pole: tagline/title/addressTitle/address/hours/
// phone/phoneHref/email/facebook/instagram/mapEmbedUrl/image.
function ContactHair04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Kontakt");
  const title = String(content.title ?? "Kudy k nám");
  const body = String(content.body ?? "");
  const address = String(content.address ?? "");
  const hoursText = String(content.hours ?? "");
  const phone = String(content.phone ?? "");
  const phoneHref = String(content.phoneHref ?? (phone ? `tel:${phone.replace(/\\s/g, "")}` : "#"));
  const email = String(content.email ?? "");
  const mapEmbedUrl = String(content.mapEmbedUrl ?? "");
  const image = String(content.image ?? "");

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
    <section id="kontakt" data-section-type="contact" data-variant="hair-04-contact" className="h04co-section" data-template="hair-04">
      <style>{`
        .h04co-section { background: var(--color-surface, #FFFFFF); font-family: 'Epilogue', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem); }
        .h04co-inner { max-width: 82rem; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2.5rem, 5vw, 4.5rem); align-items: start; }
EB_PLACEHOLDER
        .h04co-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(2rem, 4vw, 3.1rem); line-height: 1.06; color: var(--color-text, #17132A); margin: 0 0 1rem; text-wrap: balance; }
        .h04co-body { font-size: 1rem; line-height: 1.68; color: var(--color-text-muted, #6A6382); margin: 0 0 1.8rem; max-width: 46ch; }
        .h04co-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
          padding: 0.85rem 0; border-bottom: 1px solid var(--color-border, #E4E1F2); }
        .h04co-row:first-of-type { border-top: 1px solid var(--color-border, #E4E1F2); }
        .h04co-k { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #6A6382); }
        .h04co-v { font-size: 0.98rem; font-weight: 600; color: var(--color-text, #17132A); text-align: right; text-decoration: none; }
        a.h04co-v:hover { color: var(--color-primary, #6D4AFF); }
        .h04co-media { margin-top: 1.8rem; border-radius: 14px; overflow: hidden; aspect-ratio: 16 / 10; display: block; background: var(--color-bg, #F5F4FA); }
        .h04co-media img, .h04co-media iframe { width: 100%; height: 100%; object-fit: cover; display: block; border: 0; }
        .h04co-form { background: var(--color-bg, #F5F4FA); border-radius: 14px; padding: clamp(1.6rem, 3vw, 2.4rem); }
        .h04co-form h3 { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.3rem;
          color: var(--color-text, #17132A); margin: 0 0 1.4rem; }
        .h04co-f { margin-bottom: 1rem; }
        .h04co-f label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted, #6A6382); margin-bottom: 0.4rem; }
        .h04co-f input, .h04co-f textarea { width: 100%; padding: 0.8rem 1rem; border-radius: 10px; box-sizing: border-box;
          border: 1px solid var(--color-border, #E4E1F2); background: #fff; color: var(--color-text, #17132A);
          font-family: inherit; font-size: 0.95rem; }
        .h04co-f input:focus, .h04co-f textarea:focus { outline: 2px solid var(--color-primary, #6D4AFF); outline-offset: 1px; border-color: transparent; }
        .h04co-f textarea { min-height: 7rem; resize: vertical; }
        .h04co-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .h04co-submit { width: 100%; padding: 0.95rem 1.5rem; border: none; border-radius: 999px; cursor: pointer;
          background: var(--color-primary, #6D4AFF); color: #fff; font-family: inherit; font-size: 0.98rem;
          font-weight: 600; transition: background 0.25s, transform 0.25s; }
        .h04co-submit:hover:not(:disabled) { background: var(--color-accent, #5233E0); transform: translateY(-1px); }
        .h04co-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .h04co-note { font-size: 0.79rem; line-height: 1.5; color: var(--color-text-muted, #6A6382); margin: 0.9rem 0 0; }
        .h04co-msg { font-size: 0.9rem; margin: 0.9rem 0 0; padding: 0.75rem 1rem; border-radius: 10px; }
        .h04co-msg[data-kind="success"] { background: #E4F0E8; color: #1F5133; }
        .h04co-msg[data-kind="error"] { background: #F6DEE2; color: #7E2237; }
        @media (max-width: 899px) { .h04co-inner { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h04co-inner">
        <div>
          <span className="h04-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h04co-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {body && <p className="h04co-body"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>}
          {address && <div className="h04co-row"><span className="h04co-k">Adresa</span><span className="h04co-v"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span></div>}
          {phone && <div className="h04co-row"><span className="h04co-k">Telefon</span><a className="h04co-v" href={phoneHref}>{phone}</a></div>}
          {email && <div className="h04co-row"><span className="h04co-k">E-mail</span><a className="h04co-v" href={`mailto:${email}`}>{email}</a></div>}
          {hoursText && <div className="h04co-row"><span className="h04co-k">Otevřeno</span><span className="h04co-v"><GenericEditableText sectionId={sectionId} field="hours" value={hoursText} tag="span" /></span></div>}
          {mapEmbedUrl ? (
            <div className="h04co-media"><iframe src={mapEmbedUrl} title="Mapa" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          ) : image ? (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h04co-media">
              <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          ) : null}
        </div>
        <form className="h04co-form" onSubmit={handleSubmit} style={{ position: "relative" }}>
          <h3>Napište nám</h3>
          <div className="h04co-f"><label htmlFor={`h04-n-${sectionId}`}>Jméno *</label><input id={`h04-n-${sectionId}`} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div className="h04co-f"><label htmlFor={`h04-e-${sectionId}`}>E-mail *</label><input id={`h04-e-${sectionId}`} type="email" required value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" /></div>
          <div className="h04co-f"><label htmlFor={`h04-t-${sectionId}`}>Telefon</label><input id={`h04-t-${sectionId}`} value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" /></div>
          <div className="h04co-f"><label htmlFor={`h04-m-${sectionId}`}>Zpráva *</label><textarea id={`h04-m-${sectionId}`} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className="h04co-hp" aria-hidden>
            <label htmlFor={`h04-w-${sectionId}`}>Nevyplňujte</label>
            <input id={`h04-w-${sectionId}`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <button type="submit" className="h04co-submit" disabled={status === "sending"}>{status === "sending" ? "Odesílám…" : "Odeslat zprávu"}</button>
          {status === "success" && <p className="h04co-msg" data-kind="success" role="status">Děkujeme, ozveme se vám do 24 hodin.</p>}
          {status === "error" && <p className="h04co-msg" data-kind="error" role="alert">{errorMsg}</p>}
          <p className="h04co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
        </form>
      </div>
    </section>
  );
}
'''.replace("EB_PLACEHOLDER", EB)

FOOTER = '''
// hair-04-footer — V3 Studio Pop: tmavá patička, 4 sloupce + WeberoCredit v copyright baru.
function FooterHair04({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName = String(content.siteName ?? "Studio Pop");
  const heading = String(content.heading ?? "Těšíme se na vás");
  const tagline = String(content.tagline ?? "");
  const ctaText = String(content.ctaText ?? "Rezervovat");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const hours = (content.hoursList as Array<{ days?: string; time?: string }>) ?? [];
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const socials = (content.socials as Array<{ label: string; href: string }>) ?? [];
  const copyright = String(content.copyright ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  return (
    <footer data-section-type="footer" data-variant="hair-04-footer" className="h04ft-footer" data-template="hair-04">
      <style>{`
        .h04ft-footer { background: var(--color-secondary, #17132A); color: #F5F4FA; font-family: 'Epilogue', sans-serif;
          padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.75rem) 0; }
        .h04ft-inner { max-width: 82rem; margin: 0 auto; }
        .h04ft-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; padding-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h04ft-heading { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em;
          font-size: clamp(1.9rem, 4vw, 2.9rem); line-height: 1.06; color: #fff; margin: 0 0 0.7rem; text-wrap: balance; }
        .h04ft-tag { font-size: 0.98rem; line-height: 1.6; color: rgba(245,244,250,0.7); margin: 0; max-width: 42ch; }
        .h04ft-cta { display: inline-flex; align-items: center; padding: 0.95rem 2rem; border-radius: 999px;
          background: var(--color-primary, #6D4AFF); color: #fff; font-size: 0.95rem; font-weight: 600;
          text-decoration: none; white-space: nowrap; transition: background 0.25s, transform 0.25s; }
        .h04ft-cta:hover { background: var(--color-accent, #5233E0); transform: translateY(-2px); }
        .h04ft-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(1.6rem, 3vw, 2.6rem);
          padding: clamp(2.2rem, 4vw, 3rem) 0; border-top: 1px solid rgba(245,244,250,0.14); }
        .h04ft-h { font-family: 'Space Grotesk', sans-serif; font-size: 0.76rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase; color: #C3B2FF; margin: 0 0 1.1rem; }
        .h04ft-list { list-style: none; margin: 0; padding: 0; }
        .h04ft-list li { margin-bottom: 0.6rem; font-size: 0.94rem; color: rgba(245,244,250,0.8); line-height: 1.5; }
        .h04ft-list a { color: rgba(245,244,250,0.8); text-decoration: none; transition: color 0.2s; }
        .h04ft-list a:hover { color: #C3B2FF; }
        .h04ft-hrow { display: flex; justify-content: space-between; gap: 1rem; }
        .h04ft-bottom { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          padding: 1.4rem 0 calc(1.4rem + env(safe-area-inset-bottom)); border-top: 1px solid rgba(245,244,250,0.14);
          font-size: 0.84rem; color: rgba(245,244,250,0.6); }
        @media (max-width: 899px) { .h04ft-cols { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 519px) { .h04ft-cols { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h04ft-inner">
        <div className="h04ft-top">
          <div>
            <h2 className="h04ft-heading"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            {tagline && <p className="h04ft-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>}
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="h04ft-cta">{ctaText}</a>
        </div>
        <div className="h04ft-cols">
          <div><h3 className="h04ft-h">Navigace</h3><ul className="h04ft-list">{links.map((l, i) => (<li key={i}><a href={resolve(l.href)}>{l.label}</a></li>))}</ul></div>
          <div><h3 className="h04ft-h">Kontakt</h3><ul className="h04ft-list">
            {phone && <li><a href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a></li>}
            {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
            {address && <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>}
          </ul></div>
          <div><h3 className="h04ft-h">Otevírací doba</h3><ul className="h04ft-list">
            {hours.map((h, i) => (
              <li className="h04ft-hrow" key={i}>
                <GenericEditableText sectionId={sectionId} field={`hoursList.${i}.days`} value={h.days ?? ""} tag="span" />
                <GenericEditableText sectionId={sectionId} field={`hoursList.${i}.time`} value={h.time ?? ""} tag="span" />
              </li>
            ))}
          </ul></div>
          <div><h3 className="h04ft-h">Sledujte nás</h3><ul className="h04ft-list">{socials.map((s, i) => (<li key={i}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>))}</ul></div>
        </div>
        <div className="h04ft-bottom">
          <span><GenericEditableText sectionId={sectionId} field="copyright" value={copyright || siteName} tag="span" /></span>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}
'''

if __name__ == "__main__":
    print("hair-04 rebuild — etapa B")
    append_fn("TestimonialsSection.tsx", TESTIMONIALS, "function TestimonialsHair04(")
    add_dispatch("TestimonialsSection.tsx", 'return <TestimonialsHair03 content={content}',
                 '  }\n    if (variant === "hair-04-testimonials") {\n    return <TestimonialsHair04 content={content} sectionId={sectionId} />;')
    append_fn("BlogPreviewSection.tsx", BLOG, "function BlogHair04(")
    add_dispatch("BlogPreviewSection.tsx", 'return <BlogHair03 content={content as Record<string, unknown>}',
                 '  }\n  if (variant === "hair-04-blog") {\n    return <BlogHair04 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;')
    replace_inline_block("ContactSection.tsx", "hair-04-contact",
                         '  if (variant === "hair-04-contact") {\n'
                         '    return <ContactHair04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }')
    append_fn("ContactSection.tsx", CONTACT, "function ContactHair04(")
    replace_inline_block("FooterSection.tsx", "hair-04-footer",
                         '  if (variant === "hair-04-footer") {\n'
                         '    return <FooterHair04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }')
    append_fn("FooterSection.tsx", FOOTER, "function FooterHair04(")
    print("hotovo (etapa B).")
