#!/usr/bin/env python3
"""hair-03 „Noir & Oxblood" — etapa B: služby, blog, galerie, recenze, kontakt, footer.
Idempotentní; navazuje na scripts/hair03-rebuild.py.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _remaster_lib import replace_fn, replace_inline_block, append_fn, add_dispatch, SEC  # noqa

EYEBROW_LIGHT = """        .h03-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-primary, #8E2B36);
        }
        .h03-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #8E2B36); }"""

SERVICES = '''
// hair-03-services — V3 editoriální ceník: číslované hairline řádky s malým náhledem,
// cena vpravo (vědomě jiný jazyk než foto karty hair-02). Pole: tagline/title/subtitle,
// services[].{name,description,price,duration,image}.
function ServicesHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Item = { name?: string; description?: string; price?: string; duration?: string; image?: string };
  const tagline = String(content.tagline ?? "Ceník");
  const title = String(content.title ?? "Co u nás zvládneme");
  const subtitle = String(content.subtitle ?? "");
  const items = ((content.services ?? content.items) as Item[]) ?? [];

  return (
    <section id="sluzby" data-section-type="services" data-variant="hair-03-services" className="h03sv-section" data-template="hair-03">
      <style>{`
        .h03sv-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03sv-inner { max-width: 82rem; margin: 0 auto; }
        .h03sv-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
EYEBROW_PLACEHOLDER
        .h03sv-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110);
          margin: 0 0 0.9rem; text-wrap: balance;
        }
        .h03sv-sub { font-size: 1rem; line-height: 1.65; color: var(--color-text-muted, #6E645D); margin: 0; }
        .h03sv-row {
          display: grid; grid-template-columns: 3.2rem 5.5rem 1fr auto; gap: clamp(1rem, 2.4vw, 2rem);
          align-items: center; padding: 1.5rem 0; border-top: 1px solid var(--color-border, #E0D9D2);
          transition: background 0.25s;
        }
        .h03sv-row:last-child { border-bottom: 1px solid var(--color-border, #E0D9D2); }
        .h03sv-row:hover { background: rgba(142,43,54,0.035); }
        .h03sv-num { font-family: 'Archivo', sans-serif; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em; color: var(--color-primary, #8E2B36); }
        .h03sv-thumb { width: 5.5rem; aspect-ratio: 1 / 1; overflow: hidden; display: block; background: #E7E1DB; }
        .h03sv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); transition: filter 0.4s ease; }
        .h03sv-row:hover .h03sv-thumb img { filter: grayscale(0); }
        .h03sv-name { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 1.16rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--color-text, #141110); margin: 0 0 0.3rem; }
        .h03sv-desc { font-size: 0.93rem; line-height: 1.6; color: var(--color-text-muted, #6E645D); margin: 0; max-width: 52ch; }
        .h03sv-meta { text-align: right; white-space: nowrap; }
        .h03sv-price { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--color-text, #141110); display: block; }
        .h03sv-dur { font-size: 0.82rem; color: var(--color-text-muted, #6E645D); }
        @media (max-width: 767px) {
          .h03sv-row { grid-template-columns: 3rem 1fr; grid-template-areas: "num name" "thumb name" "meta meta"; row-gap: 0.7rem; }
          .h03sv-num { grid-area: num; } .h03sv-thumb { grid-area: thumb; width: 3rem; }
          .h03sv-body { grid-area: name; } .h03sv-meta { grid-area: meta; text-align: left; }
        }
        @media (prefers-reduced-motion: reduce) { .h03sv-thumb img, .h03sv-row { transition: none; } }
      `}</style>
      <div className="h03sv-inner">
        <div className="h03sv-head">
          <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03sv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="h03sv-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        {items.map((it, i) => (
          <div className="h03sv-row" key={i}>
            <span className="h03sv-num">{String(i + 1).padStart(2, "0")}</span>
            {it.image ? (
              <GenericEditableImage sectionId={sectionId} field={`services.${i}.image`} src={it.image} alt={it.name ?? ""} className="h03sv-thumb">
                <img src={it.image} alt={it.name ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
              </GenericEditableImage>
            ) : <span />}
            <div className="h03sv-body">
              <h3 className="h03sv-name"><GenericEditableText sectionId={sectionId} field={`services.${i}.name`} value={it.name ?? ""} tag="span" /></h3>
              <p className="h03sv-desc"><GenericEditableText sectionId={sectionId} field={`services.${i}.description`} value={it.description ?? ""} tag="span" /></p>
            </div>
            <div className="h03sv-meta">
              <span className="h03sv-price"><GenericEditableText sectionId={sectionId} field={`services.${i}.price`} value={it.price ?? ""} tag="span" /></span>
              <span className="h03sv-dur"><GenericEditableText sectionId={sectionId} field={`services.${i}.duration`} value={it.duration ?? ""} tag="span" /></span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW_LIGHT)

GALLERY = '''
// hair-03-gallery-slider — V3 noir: tmavá sekce (rytmus), mřížka 3 sloupce s hover
// zoomem a grayscale→barva. Nahrazuje rozbitý slider s mikro-náhledy.
// Pole: tagline/title/subtitle, images[].{url,alt}.
function GalleryHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Img = { url?: string; alt?: string };
  const tagline = String(content.tagline ?? "Kolekce");
  const title = String(content.title ?? "Jak to u nás vypadá");
  const subtitle = String(content.subtitle ?? "");
  const images = ((content.images as Img[]) ?? []).filter((i) => i && i.url);

  return (
    <section id="galerie" data-section-type="gallery" data-variant="hair-03-gallery-slider" className="h03g-section" data-template="hair-03">
      <style>{`
        .h03g-section {
          background: var(--color-secondary, #141110); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03g-inner { max-width: 82rem; margin: 0 auto; }
        .h03g-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h03g-eyebrow {
          display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.1rem;
          font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase; color: #E9A7AE;
        }
        .h03g-eyebrow::before { content: ""; width: 28px; height: 2px; background: var(--color-primary, #8E2B36); }
        .h03g-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: #fff; margin: 0 0 0.9rem; text-wrap: balance;
        }
        .h03g-sub { font-size: 1rem; line-height: 1.65; color: rgba(241,238,234,0.72); margin: 0; }
        .h03g-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.8rem, 1.5vw, 1.2rem); }
        .h03g-item { aspect-ratio: 4 / 5; overflow: hidden; display: block; background: #23201E; }
        .h03g-item img {
          width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1);
          transition: transform 0.7s cubic-bezier(0.22,1,0.36,1), filter 0.5s ease;
        }
        .h03g-item:hover img { transform: scale(1.05); filter: grayscale(0); }
        @media (max-width: 899px) { .h03g-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (prefers-reduced-motion: reduce) { .h03g-item img { transition: none; } }
      `}</style>
      <div className="h03g-inner">
        <div className="h03g-head">
          <span className="h03g-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03g-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {subtitle && <p className="h03g-sub"><GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" /></p>}
        </div>
        <div className="h03g-grid">
          {images.map((im, i) => (
            <GenericEditableImage key={i} sectionId={sectionId} field={`images.${i}.url`} src={im.url ?? ""} alt={im.alt ?? ""} className="h03g-item">
              <img src={im.url ?? ""} alt={im.alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(1)" }} />
            </GenericEditableImage>
          ))}
        </div>
      </div>
    </section>
  );
}
'''

BLOG = '''
// hair-03-blog-cards — V3: bone bg, editoriální karty s datem nad titulkem a hairline,
// hover zoom fotky. Pole: tagline/title, posts[].{title,excerpt,image,href,date}, buttonText.
function BlogHair03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type P = { title?: string; excerpt?: string; image?: string; href?: string; date?: string };
  const tagline = String(content.tagline ?? "Magazín");
  const title = String(content.title ?? "");
  const posts = (content.posts as P[]) ?? [];
  const buttonText = String(content.buttonText ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <section id="blog" data-section-type="blog-preview" data-variant="hair-03-blog-cards" className="h03bl-section" data-template="hair-03">
      <style>{`
        .h03bl-section {
          background: var(--color-bg, #F1EEEA); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03bl-inner { max-width: 82rem; margin: 0 auto; }
        .h03bl-head { max-width: 44rem; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
EYEBROW_PLACEHOLDER
        .h03bl-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110);
          margin: 0; text-wrap: balance;
        }
        .h03bl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 2.6vw, 2.2rem); }
        .h03bl-card { display: flex; flex-direction: column; text-decoration: none; }
        .h03bl-photo { aspect-ratio: 3 / 2; overflow: hidden; display: block; background: #E7E1DB; margin-bottom: 1.1rem; }
        .h03bl-photo img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .h03bl-card:hover .h03bl-photo img { transform: scale(1.05); }
        .h03bl-date { font-family: 'Archivo', sans-serif; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-primary, #8E2B36); display: block; margin-bottom: 0.5rem; }
        .h03bl-h { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 1.14rem; line-height: 1.3; color: var(--color-text, #141110); margin: 0 0 0.6rem; }
        .h03bl-x { font-size: 0.93rem; line-height: 1.62; color: var(--color-text-muted, #6E645D); margin: 0 0 1rem; flex: 1; }
        .h03bl-more { font-family: 'Archivo', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text, #141110); padding-top: 0.8rem; border-top: 1px solid var(--color-border, #E0D9D2); }
        .h03bl-card:hover .h03bl-more { color: var(--color-primary, #8E2B36); }
        .h03bl-all {
          display: inline-flex; align-items: center; margin-top: clamp(2.2rem, 4vw, 3rem); padding: 0.95rem 2rem;
          background: var(--color-text, #141110); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-decoration: none; transition: background 0.25s, transform 0.25s;
        }
        .h03bl-all:hover { background: var(--color-primary, #8E2B36); transform: translateY(-2px); }
        @media (max-width: 899px) { .h03bl-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .h03bl-photo img { transition: none; } }
      `}</style>
      <div className="h03bl-inner">
        <div className="h03bl-head">
          <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03bl-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
        </div>
        <div className="h03bl-grid">
          {posts.map((p, i) => (
            <a className="h03bl-card" key={i} href={resolve(p.href ?? "/blog")}>
              {p.image && (
                <GenericEditableImage sectionId={sectionId} field={`posts.${i}.image`} src={p.image} alt={p.title ?? ""} className="h03bl-photo">
                  <img src={p.image} alt={p.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </GenericEditableImage>
              )}
              <span className="h03bl-date"><GenericEditableText sectionId={sectionId} field={`posts.${i}.date`} value={p.date ?? ""} tag="span" /></span>
              <h3 className="h03bl-h"><GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={p.title ?? ""} tag="span" /></h3>
              <p className="h03bl-x"><GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={p.excerpt ?? ""} tag="span" /></p>
              <span className="h03bl-more">Číst dál</span>
            </a>
          ))}
        </div>
        {buttonText && <a href={resolve("/blog")} className="h03bl-all">{buttonText}</a>}
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW_LIGHT)

TESTIMONIALS = '''
// hair-03-testimonials — V3: bílá sekce, velký Archivo citát, iniciálové avatary
// (NIKDY stock portréty), oxblood hvězdy. Pole: tagline/title/rating/ratingLabel,
// testimonials[].{author,role,rating,text}.
function TestimonialsHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type T = { author?: string; role?: string; rating?: string; text?: string };
  const tagline = String(content.tagline ?? "Recenze");
  const title = String(content.title ?? "Co říkají klienti");
  const rating = String(content.rating ?? "");
  const ratingLabel = String(content.ratingLabel ?? "");
  const items = (content.testimonials as T[]) ?? [];
  const initials = (n: string) => n.split(/\\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <section id="recenze" data-section-type="testimonials" data-variant="hair-03-testimonials" className="h03rv-section" data-template="hair-03">
      <style>{`
        .h03rv-section {
          background: var(--color-surface, #FFFFFF); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03rv-inner { max-width: 82rem; margin: 0 auto; }
        .h03rv-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; margin-bottom: clamp(2.2rem, 4vw, 3rem); }
EYEBROW_PLACEHOLDER
        .h03rv-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110); margin: 0; text-wrap: balance;
        }
        .h03rv-score { text-align: right; }
        .h03rv-score-v { font-family: 'Archivo', sans-serif; font-weight: 800; font-size: clamp(2.2rem, 4.5vw, 3rem); color: var(--color-primary, #8E2B36); line-height: 1; display: block; }
        .h03rv-score-l { font-size: 0.84rem; color: var(--color-text-muted, #6E645D); }
        .h03rv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .h03rv-item { padding: 0 clamp(1.2rem, 2.4vw, 2.2rem); border-left: 1px solid var(--color-border, #E0D9D2); }
        .h03rv-item:first-child { padding-left: 0; border-left: none; }
        .h03rv-item:last-child { padding-right: 0; }
        .h03rv-stars { color: var(--color-primary, #8E2B36); font-size: 0.92rem; letter-spacing: 0.16em; margin-bottom: 1rem; }
        .h03rv-text { font-size: 1.02rem; line-height: 1.7; color: var(--color-text, #141110); margin: 0 0 1.5rem; }
        .h03rv-who { display: flex; align-items: center; gap: 0.85rem; }
        .h03rv-av {
          width: 2.7rem; height: 2.7rem; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          background: var(--color-text, #141110); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.04em;
        }
        .h03rv-name { font-family: 'Archivo', sans-serif; font-weight: 700; font-size: 0.96rem; color: var(--color-text, #141110); display: block; }
        .h03rv-role { font-size: 0.83rem; color: var(--color-text-muted, #6E645D); }
        @media (max-width: 899px) {
          .h03rv-grid { grid-template-columns: 1fr; gap: 2rem; }
          .h03rv-item { padding: 2rem 0 0; border-left: none; border-top: 1px solid var(--color-border, #E0D9D2); }
          .h03rv-item:first-child { padding-top: 0; border-top: none; }
          .h03rv-score { text-align: left; }
        }
      `}</style>
      <div className="h03rv-inner">
        <div className="h03rv-head">
          <div>
            <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
            <h2 className="h03rv-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          {rating && (
            <div className="h03rv-score">
              <span className="h03rv-score-v"><GenericEditableText sectionId={sectionId} field="rating" value={rating} tag="span" /></span>
              <span className="h03rv-score-l"><GenericEditableText sectionId={sectionId} field="ratingLabel" value={ratingLabel} tag="span" /></span>
            </div>
          )}
        </div>
        <div className="h03rv-grid">
          {items.map((t, i) => (
            <figure className="h03rv-item" key={i}>
              <div className="h03rv-stars" role="img" aria-label={`Hodnocení ${t.rating ?? "5"} z 5`}>{"★".repeat(Number(t.rating ?? 5) || 5)}</div>
              <blockquote className="h03rv-text"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={t.text ?? ""} tag="span" /></blockquote>
              <figcaption className="h03rv-who">
                <span className="h03rv-av" aria-hidden>{initials(t.author ?? "")}</span>
                <span>
                  <span className="h03rv-name"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.author`} value={t.author ?? ""} tag="span" /></span>
                  <span className="h03rv-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={t.role ?? ""} tag="span" /></span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW_LIGHT)

CONTACT = '''
// hair-03-contact — V3: bone bg; vlevo hairline kontaktní řádky + otevírací doba + foto,
// vpravo REÁLNÝ formulář (POST /api/demo/<slug>/contact) se stavy a honeypotem.
// Pole: tagline/title/body/phone/email/address/image, hours[].{days,time}.
function ContactHair03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const tagline = String(content.tagline ?? "Kontakt");
  const title = String(content.title ?? "Ozvěte se nám");
  const body = String(content.body ?? "");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const image = String(content.image ?? "");
  const hours = (content.hours as Array<{ days?: string; time?: string }>) ?? [];

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
    <section id="kontakt" data-section-type="contact" data-variant="hair-03-contact" className="h03co-section" data-template="hair-03">
      <style>{`
        .h03co-section {
          background: var(--color-bg, #F1EEEA); font-family: 'Gantari', sans-serif;
          padding: clamp(4.5rem, 9vw, 7.5rem) clamp(1.25rem, 4vw, 2.75rem);
        }
        .h03co-inner { max-width: 82rem; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(2.5rem, 5vw, 4.5rem); align-items: start; }
EYEBROW_PLACEHOLDER
        .h03co-title {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 3.8vw, 2.9rem); line-height: 1.06; color: var(--color-text, #141110); margin: 0 0 1rem; text-wrap: balance;
        }
        .h03co-body { font-size: 1rem; line-height: 1.68; color: var(--color-text-muted, #6E645D); margin: 0 0 1.8rem; max-width: 46ch; }
        .h03co-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding: 0.85rem 0; border-bottom: 1px solid var(--color-border, #E0D9D2); }
        .h03co-row:first-of-type { border-top: 1px solid var(--color-border, #E0D9D2); }
        .h03co-k { font-family: 'Archivo', sans-serif; font-size: 0.76rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-muted, #6E645D); }
        .h03co-v { font-size: 0.98rem; font-weight: 600; color: var(--color-text, #141110); text-align: right; text-decoration: none; }
        a.h03co-v:hover { color: var(--color-primary, #8E2B36); }
        .h03co-photo { margin-top: 1.8rem; aspect-ratio: 16 / 10; overflow: hidden; display: block; background: #E7E1DB; }
        .h03co-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .h03co-form { background: var(--color-surface, #fff); padding: clamp(1.6rem, 3vw, 2.4rem); border: 1px solid var(--color-border, #E0D9D2); }
        .h03co-form h3 { font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase; font-size: 1.2rem; letter-spacing: 0.04em; color: var(--color-text, #141110); margin: 0 0 1.4rem; }
        .h03co-f { margin-bottom: 1rem; }
        .h03co-f label { display: block; font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-text-muted, #6E645D); margin-bottom: 0.4rem; }
        .h03co-f input, .h03co-f textarea {
          width: 100%; padding: 0.8rem 1rem; box-sizing: border-box; border-radius: 0;
          border: 1px solid var(--color-border, #E0D9D2); background: var(--color-bg, #F1EEEA);
          color: var(--color-text, #141110); font-family: inherit; font-size: 0.95rem;
        }
        .h03co-f input:focus, .h03co-f textarea:focus { outline: 2px solid var(--color-primary, #8E2B36); outline-offset: 1px; }
        .h03co-f textarea { min-height: 7rem; resize: vertical; }
        .h03co-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
        .h03co-submit {
          width: 100%; padding: 1rem 1.5rem; border: none; border-radius: 0; cursor: pointer;
          background: var(--color-primary, #8E2B36); color: #fff; font-family: 'Archivo', sans-serif;
          font-size: 0.84rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; transition: background 0.25s;
        }
        .h03co-submit:hover:not(:disabled) { background: var(--color-accent, #6E1F28); }
        .h03co-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .h03co-note { font-size: 0.79rem; line-height: 1.5; color: var(--color-text-muted, #6E645D); margin: 0.9rem 0 0; }
        .h03co-msg { font-size: 0.9rem; margin: 0.9rem 0 0; padding: 0.75rem 1rem; }
        .h03co-msg[data-kind="success"] { background: #E4F0E8; color: #1F5133; }
        .h03co-msg[data-kind="error"] { background: #F6DEDE; color: #7E2229; }
        @media (max-width: 899px) { .h03co-inner { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h03co-inner">
        <div>
          <span className="h03-eyebrow"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></span>
          <h2 className="h03co-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          {body && <p className="h03co-body"><GenericEditableText sectionId={sectionId} field="body" value={body} tag="span" /></p>}
          {phone && <div className="h03co-row"><span className="h03co-k">Telefon</span><a className="h03co-v" href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a></div>}
          {email && <div className="h03co-row"><span className="h03co-k">E-mail</span><a className="h03co-v" href={`mailto:${email}`}>{email}</a></div>}
          {address && <div className="h03co-row"><span className="h03co-k">Adresa</span><span className="h03co-v"><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></span></div>}
          {hours.map((h, i) => (
            <div className="h03co-row" key={i}>
              <span className="h03co-k"><GenericEditableText sectionId={sectionId} field={`hours.${i}.days`} value={h.days ?? ""} tag="span" /></span>
              <span className="h03co-v"><GenericEditableText sectionId={sectionId} field={`hours.${i}.time`} value={h.time ?? ""} tag="span" /></span>
            </div>
          ))}
          {image && (
            <GenericEditableImage sectionId={sectionId} field="image" src={image} alt={title} className="h03co-photo">
              <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </GenericEditableImage>
          )}
        </div>
        <form className="h03co-form" onSubmit={handleSubmit} style={{ position: "relative" }}>
          <h3>Napište nám</h3>
          <div className="h03co-f"><label htmlFor={`h03-n-${sectionId}`}>Jméno *</label><input id={`h03-n-${sectionId}`} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div className="h03co-f"><label htmlFor={`h03-e-${sectionId}`}>E-mail *</label><input id={`h03-e-${sectionId}`} type="email" required value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" /></div>
          <div className="h03co-f"><label htmlFor={`h03-t-${sectionId}`}>Telefon</label><input id={`h03-t-${sectionId}`} value={tel} onChange={(e) => setTel(e.target.value)} autoComplete="tel" /></div>
          <div className="h03co-f"><label htmlFor={`h03-m-${sectionId}`}>Zpráva *</label><textarea id={`h03-m-${sectionId}`} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className="h03co-hp" aria-hidden>
            <label htmlFor={`h03-w-${sectionId}`}>Nevyplňujte</label>
            <input id={`h03-w-${sectionId}`} tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>
          <button type="submit" className="h03co-submit" disabled={status === "sending"}>{status === "sending" ? "Odesílám…" : "Odeslat zprávu"}</button>
          {status === "success" && <p className="h03co-msg" data-kind="success" role="status">Děkujeme, ozveme se vám do 24 hodin.</p>}
          {status === "error" && <p className="h03co-msg" data-kind="error" role="alert">{errorMsg}</p>}
          <p className="h03co-note">Odesláním souhlasíte se zpracováním osobních údajů za účelem vyřízení poptávky.</p>
        </form>
      </div>
    </section>
  );
}
'''.replace("EYEBROW_PLACEHOLDER", EYEBROW_LIGHT)

FOOTER = '''
// hair-03-footer — V3 noir footer: Archivo wordmark + CTA, 4 sloupce (navigace/kontakt/
// otevírací doba/sítě), copyright bar s WeberoCredit. Nahrazuje původní „jen copyright" pás.
function FooterHair03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const siteName = String(content.siteName ?? "Ateliér Noir");
  const heading = String(content.heading ?? "Těšíme se na vás");
  const tagline = String(content.tagline ?? "");
  const ctaText = String(content.ctaText ?? "Rezervace");
  const ctaHref = String(content.ctaHref ?? "/kontakt");
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const hours = (content.hours as Array<{ days?: string; time?: string }>) ?? [];
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const socials = (content.socials as Array<{ label: string; href: string }>) ?? [];
  const copyright = String(content.copyright ?? "");
  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);

  return (
    <footer data-section-type="footer" data-variant="hair-03-footer" className="h03ft-footer" data-template="hair-03">
      <style>{`
        .h03ft-footer {
          background: var(--color-secondary, #141110); color: #F1EEEA; font-family: 'Gantari', sans-serif;
          padding: clamp(3.5rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.75rem) 0;
        }
        .h03ft-inner { max-width: 82rem; margin: 0 auto; }
        .h03ft-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; flex-wrap: wrap; padding-bottom: clamp(2.2rem, 4vw, 3rem); }
        .h03ft-heading {
          font-family: 'Archivo', sans-serif; font-weight: 800; text-transform: uppercase;
          font-size: clamp(1.9rem, 4.2vw, 3rem); line-height: 1.04; color: #fff; margin: 0 0 0.7rem; text-wrap: balance;
        }
        .h03ft-tag { font-size: 0.98rem; line-height: 1.6; color: rgba(241,238,234,0.7); margin: 0; max-width: 42ch; }
        .h03ft-cta {
          display: inline-flex; align-items: center; padding: 0.95rem 2rem; background: var(--color-primary, #8E2B36);
          color: #fff; font-family: 'Archivo', sans-serif; font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; white-space: nowrap;
          transition: background 0.25s, transform 0.25s;
        }
        .h03ft-cta:hover { background: var(--color-accent, #6E1F28); transform: translateY(-2px); }
        .h03ft-cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(1.6rem, 3vw, 2.6rem); padding: clamp(2.2rem, 4vw, 3rem) 0; border-top: 1px solid rgba(241,238,234,0.14); }
        .h03ft-h { font-family: 'Archivo', sans-serif; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #E9A7AE; margin: 0 0 1.1rem; }
        .h03ft-list { list-style: none; margin: 0; padding: 0; }
        .h03ft-list li { margin-bottom: 0.6rem; font-size: 0.94rem; color: rgba(241,238,234,0.8); line-height: 1.5; }
        .h03ft-list a { color: rgba(241,238,234,0.8); text-decoration: none; transition: color 0.2s; }
        .h03ft-list a:hover { color: #E9A7AE; }
        .h03ft-hrow { display: flex; justify-content: space-between; gap: 1rem; }
        .h03ft-bottom {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
          padding: 1.4rem 0 calc(1.4rem + env(safe-area-inset-bottom)); border-top: 1px solid rgba(241,238,234,0.14);
          font-size: 0.84rem; color: rgba(241,238,234,0.6);
        }
        @media (max-width: 899px) { .h03ft-cols { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 519px) { .h03ft-cols { grid-template-columns: 1fr; } }
      `}</style>
      <div className="h03ft-inner">
        <div className="h03ft-top">
          <div>
            <h2 className="h03ft-heading"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            {tagline && <p className="h03ft-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>}
          </div>
          <a href={resolve(ctaHref)} data-btn="primary" className="h03ft-cta">{ctaText}</a>
        </div>
        <div className="h03ft-cols">
          <div>
            <h3 className="h03ft-h">Navigace</h3>
            <ul className="h03ft-list">{links.map((l, i) => (<li key={i}><a href={resolve(l.href)}>{l.label}</a></li>))}</ul>
          </div>
          <div>
            <h3 className="h03ft-h">Kontakt</h3>
            <ul className="h03ft-list">
              {phone && <li><a href={`tel:${phone.replace(/\\s/g, "")}`}>{phone}</a></li>}
              {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
              {address && <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>}
            </ul>
          </div>
          <div>
            <h3 className="h03ft-h">Otevírací doba</h3>
            <ul className="h03ft-list">
              {hours.map((h, i) => (
                <li className="h03ft-hrow" key={i}>
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.days`} value={h.days ?? ""} tag="span" />
                  <GenericEditableText sectionId={sectionId} field={`hours.${i}.time`} value={h.time ?? ""} tag="span" />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="h03ft-h">Sledujte nás</h3>
            <ul className="h03ft-list">{socials.map((s, i) => (<li key={i}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>))}</ul>
          </div>
        </div>
        <div className="h03ft-bottom">
          <span><GenericEditableText sectionId={sectionId} field="copyright" value={copyright || siteName} tag="span" /></span>
          <WeberoCredit />
        </div>
      </div>
    </footer>
  );
}
'''

if __name__ == "__main__":
    print("hair-03 rebuild — etapa B (služby, galerie, blog, recenze, kontakt, footer)")
    append_fn("ServicesSection.tsx", SERVICES, "function ServicesHair03(")
    add_dispatch("ServicesSection.tsx", 'return <ServicesHair02 content={content}',
                 '  }\n  if (variant === "hair-03-services") {\n    return <ServicesHair03 content={content} sectionId={sectionId} />;')
    replace_inline_block("GallerySection.tsx", "hair-03-gallery-slider",
                         '  if (variant === "hair-03-gallery-slider") {\n'
                         '    return <GalleryHair03 content={content as Record<string, unknown>} sectionId={sectionId} />;\n  }')
    append_fn("GallerySection.tsx", GALLERY, "function GalleryHair03(")
    replace_inline_block("BlogPreviewSection.tsx", "hair-03-blog-cards",
                         '  if (variant === "hair-03-blog-cards") {\n'
                         '    return <BlogHair03 content={content as Record<string, unknown>} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n  }')
    append_fn("BlogPreviewSection.tsx", BLOG, "function BlogHair03(")
    append_fn("TestimonialsSection.tsx", TESTIMONIALS, "function TestimonialsHair03(")
    add_dispatch("TestimonialsSection.tsx", 'return <TestimonialsHair02 content={content}',
                 '  }\n    if (variant === "hair-03-testimonials") {\n    return <TestimonialsHair03 content={content} sectionId={sectionId} />;')
    append_fn("ContactSection.tsx", CONTACT, "function ContactHair03(")
    add_dispatch("ContactSection.tsx", 'return <ContactHair02Location content={content}',
                 '  }\n  if (variant === "hair-03-contact") {\n    return <ContactHair03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;')
    replace_fn("FooterSection.tsx", "FooterHair03", FOOTER)
    fp = SEC / "FooterSection.tsx"
    fp.write_text(fp.read_text().replace(
        "<FooterHair03 content={content} sectionId={sectionId} />",
        "<FooterHair03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />"))
    print("hotovo (etapa B).")
