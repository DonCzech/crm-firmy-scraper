import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { OptimizedPicture } from "@/components/OptimizedPicture";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

function demoLogoDataUrl(name: string): string {
  const initials = encodeURIComponent(name.slice(0, 2).toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23111'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='28' fill='white' font-family='sans-serif'%3E${initials}%3C/text%3E%3C/svg%3E`;
}

export function FooterSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {

  // hair-04: tmavý footer, logo vlevo, info uprostřed, soc. sítě vpravo, copyright bar dole
  if (variant === "hair-04-footer") {
    const siteName  = String(content.siteName  ?? "Impresiv Studio");
    const address   = String(content.address   ?? "");
    const phone     = String(content.phone     ?? "");
    const email     = String(content.email     ?? "");
    const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
    const gdprHref  = String(content.gdprHref  ?? "/gdpr");
    const facebook  = String(content.facebook  ?? "");
    const instagram = String(content.instagram ?? "");
    const GOLD  = "#FFDF25";
    const DARK  = "#0a0a0a";
    const LATO  = "'Lato', sans-serif";

    return (
      <footer data-template="hair-04" style={{ backgroundColor: DARK, borderTop: "1px solid rgba(255,223,37,0.2)" }}>
        {/* Hlavní řádek */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 32,
          padding: "52px clamp(32px,6vw,100px)",
        }}>
          {/* Logo vlevo */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: LATO, fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </span>
            <span style={{ fontFamily: LATO, fontSize: 11, fontWeight: 300, color: GOLD, letterSpacing: "0.25em", textTransform: "uppercase" }}>Hair Salon</span>
          </div>

          {/* Kontaktní info uprostřed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
            {address && (
              <GenericEditableText sectionId={sectionId} field="address" value={address} tag="p"
                style={{ fontFamily: LATO, fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }} />
            )}
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
              {phone && (
                <a href={`tel:+420${phone.replace(/\s/g,"")}`}
                  style={{ fontFamily: LATO, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  style={{ fontFamily: LATO, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              )}
            </div>
          </div>

          {/* Sociální sítě vpravo */}
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {facebook && (
              <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ color: "rgba(255,255,255,0.5)", transition: "color 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "18px clamp(32px,6vw,100px)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p"
            style={{ fontFamily: LATO, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", margin: 0 }} />
          <a href={gdprHref}
            style={{ fontFamily: LATO, fontSize: 13, fontWeight: 300, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
            onMouseEnter={e => { e.currentTarget.style.color = GOLD; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            Ochrana osobních údajů
          </a>
        </div>
      </footer>
    );
  }

  const siteName = String(content.siteName ?? "Web");
  const tagline = String(content.tagline ?? "");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const year = new Date().getFullYear();
  const columns = (content.columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) ?? [];
  const socials = (content.socials as Array<{ label?: string; href?: string; icon?: string }>) ?? [];
  const logoUrl = String(content.logoUrl ?? "");
  const logoSrc = logoUrl || demoLogoDataUrl(siteName);
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }>) ?? [];

  // beauty-01 — Demo Beauty Studio footer
  // Dark #1F1F1F bg, logo + CTA heading vlevo, 3 info sloupce vpravo, legal bar dole
  if (variant === "beauty-01-footer") {
    const heading    = String(content.heading    ?? "Jste připraveni vypadat a cítit se co nejlépe?");
    const subheading = String(content.subheading ?? "");
    const ctaText    = String(content.ctaText    ?? "REZERVOVAT");
    const ctaHref    = String(content.ctaHref    ?? "#rezervace");
    const hours      = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const legal      = String(content.legal ?? "");
    const web        = String(content.web ?? "");

    const BG     = "#1F1F1F";
    const BORDER = "rgba(224,190,154,0.15)";
    const SAND   = "#E0BE9A";
    const WHITE  = "#ffffff";
    const MUTED  = "rgba(255,255,255,0.55)";
    const FONT_H = "'Cormorant Garamond', 'Fahkwang', Georgia, serif";
    const FONT_B = "'Fahkwang', sans-serif";

    return (
      <footer style={{ backgroundColor: BG, fontFamily: FONT_B }} data-template="beauty-01">
        {/* Main grid */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 24px 48px" }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "48px 64px" }}>
            {/* Levý sloupec — logo + heading + CTA */}
            <div>
              {logoSrc && (
                <div style={{ marginBottom: 28 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoSrc} alt={siteName} style={{ height: 36, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                </div>
              )}
              <h2 style={{ fontFamily: FONT_H, fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 400, color: WHITE, lineHeight: 1.3, marginBottom: 16 }}>
                <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              </h2>
              {subheading && (
                <p style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 200, color: MUTED, lineHeight: 1.7, marginBottom: 28, maxWidth: 400 }}>
                  <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
                </p>
              )}
              <a
                href={resolveDemoHref(ctaHref, tenantSlug, isAdmin)}
                style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: SAND, color: BG,
                  fontFamily: FONT_B, fontSize: 11, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none",
                  padding: "12px 32px", transition: "background 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#C4A07E"; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = SAND; }}
              >
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
            </div>

            {/* Pravý sloupec — kontakt + hodiny + social */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "32px 32px" }}>
              {/* Kontakt */}
              <div>
                <p style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", color: SAND, textTransform: "uppercase", marginBottom: 14 }}>
                  Kontakt
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {phone && (
                    <a href={`tel:${phone.replace(/\s/g, "")}`} style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 200, color: WHITE, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                    </a>
                  )}
                  {email && (
                    <a href={`mailto:${email}`} style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 200, color: WHITE, textDecoration: "none" }}>
                      <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                    </a>
                  )}
                  {address && (
                    <p style={{ fontFamily: FONT_B, fontSize: 14, fontWeight: 200, color: MUTED, lineHeight: 1.6, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </p>
                  )}
                </div>
                {/* Social */}
                {socials.length > 0 && (
                  <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                    {socials.map((s, i) => (
                      <a
                        key={i}
                        href={s.href ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 300, color: MUTED, letterSpacing: "0.1em", textDecoration: "none", textTransform: "uppercase", transition: "color 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = SAND; }}
                        onMouseLeave={e => { e.currentTarget.style.color = MUTED as string; }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Hodiny */}
              {hours.length > 0 && (
                <div>
                  <p style={{ fontFamily: FONT_B, fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", color: SAND, textTransform: "uppercase", marginBottom: 14 }}>
                    Otevírací doba
                  </p>
                  {hours.map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontFamily: FONT_B, fontSize: 13, fontWeight: 200, color: MUTED }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </span>
                      <span style={{ fontFamily: FONT_B, fontSize: 13, fontWeight: 300, color: WHITE }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legal bar */}
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "18px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <p style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 200, color: MUTED, margin: 0 }}>
              <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
            </p>
            {web && (
              <a href={web} target="_blank" rel="noopener noreferrer" style={{ fontFamily: FONT_B, fontSize: 11, fontWeight: 200, color: MUTED, textDecoration: "none" }}>
                {web.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // hair-03 — Petra Studio — minimální šedá patička
  if (variant === "hair-03-footer") {
    return <FooterHair03 content={content} sectionId={sectionId} />;
  }

  // hair-01 — Salon Aria — dark footer: heading + 3-col (phone/hours/address+social) + legal
  if (variant === "hair-01-footer") {
    const heading  = String(content.heading ?? "Těšíme se na vás!");
    const phone    = String(content.phone ?? "");
    const emailVal = String(content.email ?? "");
    const address  = String(content.address ?? "").replace(/\\n/g, "\n");
    const legal    = String(content.legal ?? "");
    const hoursLabel = String(content.hoursLabel ?? "Otevírací doba:");
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const socials_ = (content.socials as Array<{ label: string; href: string }>) ?? [];
    const MONO = "'Montserrat',sans-serif";
    const GOLD = "#8a6f28";
    const BG = "#1e1e1e";
    const TEXT = "rgba(255,255,255,0.75)";
    const H = "#ffffff";
    return (
      <footer id="kontakt" data-template="hair-01" style={{ backgroundColor: BG, fontFamily: MONO }}>
        <div className="max-w-[1280px] mx-auto" style={{ padding: "80px clamp(20px,5vw,60px) 0" }}>
          {/* Heading */}
          <h2 style={{ color: H, fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 200, letterSpacing: "0.04em", marginBottom: 56, textAlign: "center" }}>
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
          </h2>

          {/* 3-col info */}
          <div className="grid gap-10" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 48 }}>
            {/* Zavolejte nám */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Zavolejte nám</p>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g,"")}`} style={{ color: H, fontSize: "clamp(15px,1.4vw,18px)", fontWeight: 300, textDecoration: "none", display: "block", marginBottom: 8 }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              )}
              {emailVal && (
                <a href={`mailto:${emailVal}`} style={{ color: TEXT, fontSize: 13, fontWeight: 300, textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={emailVal} tag="span" />
                </a>
              )}
            </div>

            {/* Otevírací doba */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
                <GenericEditableText sectionId={sectionId} field="hoursLabel" value={hoursLabel} tag="span" />
              </p>
              {hours.map((h, i) => (
                <div key={i} className="flex gap-3" style={{ marginBottom: 6 }}>
                  <span style={{ color: TEXT, fontSize: 13, fontWeight: 300, minWidth: 130 }}>
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                  </span>
                  <span style={{ color: H, fontSize: 13, fontWeight: 400 }}>
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                  </span>
                </div>
              ))}
            </div>

            {/* Adresa + social */}
            <div>
              <p style={{ color: GOLD, fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Adresa</p>
              {address && (
                <address style={{ color: TEXT, fontSize: 13, fontWeight: 300, lineHeight: 1.7, fontStyle: "normal", marginBottom: 20 }}>
                  {address.split("\n").map((line, i) => <span key={i} style={{ display: "block" }}>{line}</span>)}
                </address>
              )}
              {socials_.length > 0 && (
                <div className="flex gap-4">
                  {socials_.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ color: TEXT, fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                      onMouseLeave={e => (e.currentTarget.style.color = TEXT)}
                    >
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legal */}
          {legal && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, textAlign: "center", padding: "28px 0 28px", marginTop: 48, borderTop: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.6 }}>
              <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
            </p>
          )}
        </div>
      </footer>
    );
  }

  // Footer — barber-04 (Černý Fade) — 3-col blurbs (lokalita / hodiny / kontakt s legal a social) — bez bottom legal řádku
  if (variant === "barber-04-multi-blurb-legal") {
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursNote = String(content.hoursNote ?? "");
    const subway = String(content.subway ?? "");
    const ico = String(content.ico ?? "");
    const dic = String(content.dic ?? "");
    const vatNote = String(content.vatNote ?? "");
    const bankAccount = String(content.bankAccount ?? "");
    const paymentNote = String(content.paymentNote ?? "");
    const socials4 = (content.socials as Array<{ icon?: string; label?: string; href?: string }>) ?? [];
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
      switch (name) {
        case "instagram": return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
        case "facebook": return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
        case "youtube": return (<svg {...p}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"/></svg>);
        case "tiktok": return (<svg {...p}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>);
        default: return (<span style={{ fontSize: 11, textTransform: "uppercase" }}>{name}</span>);
      }
    };
    const h4 = {
      fontFamily: "'Bebas Neue','Oswald',Impact,sans-serif" as const,
      fontWeight: 300 as const,
      fontSize: 16,
      letterSpacing: 3,
      color: "#ffffff",
      textTransform: "uppercase" as const,
      marginBottom: 36,
      textAlign: "center" as const,
    };
    const body = {
      fontFamily: "'Lato',Helvetica,Arial,sans-serif" as const,
      fontSize: 14,
      lineHeight: 1.9,
      color: "rgba(255,255,255,0.85)",
      textAlign: "center" as const,
      margin: "0 0 14px",
    };
    const card = {
      backgroundColor: "#1d1d1d",
      padding: "56px 32px",
      minHeight: 460,
    };
    const goldLink = { color: "#d5b981", textDecoration: "none" } as const;
    return (
      <footer
        style={{ backgroundColor: "#000000", color: "rgba(255,255,255,0.85)", padding: "60px 24px 0" }}
        data-template="barber-04"
      >
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-7">
          {/* Lokalita */}
          <div style={card}>
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="locationTitle" value={String(content.locationTitle ?? "lokalita")} tag="span" />
            </h4>
            {address && address.split("\n").map((line, i) => (
              <p key={`addr-${i}`} style={body}>
                <GenericEditableText sectionId={sectionId} field={i === 0 ? "address" : `address-${i}`} value={line} tag="span" />
              </p>
            ))}
            {subway && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="subway" value={subway} tag="span" />
              </p>
            )}
          </div>

          {/* Otevírací doba — souhrnný řádek (Po–Ne 9–20) + poznámka */}
          <div style={card}>
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="hoursTitle" value={String(content.hoursTitle ?? "Otevírací doba")} tag="span" />
            </h4>
            {hours.map((h, i) => (
              <p key={`hr-${i}`} style={{ ...body, marginBottom: 4 }}>
                <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                {h.value && (
                  <>
                    <br />
                    <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                  </>
                )}
              </p>
            ))}
            {hoursNote && (
              <p style={{ ...body, marginTop: 22 }}>
                <GenericEditableText sectionId={sectionId} field="hoursNote" value={hoursNote} tag="span" />
              </p>
            )}
          </div>

          {/* Kontakt — telefon/email gold + IČ/DIČ/DPH/účet/platba + Daňový doklad + social */}
          <div style={card}>
            <h4 style={h4}>
              <GenericEditableText sectionId={sectionId} field="contactTitle" value={String(content.contactTitle ?? "kontakt")} tag="span" />
            </h4>
            {phone && (
              <p style={body}>
                <a href={`tel:${phone.replace(/\s/g, "")}`} style={goldLink}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </p>
            )}
            {email && (
              <p style={{ ...body, marginBottom: 28 }}>
                <a href={`mailto:${email}`} style={goldLink}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </p>
            )}
            {ico && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" />
              </p>
            )}
            {dic && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="dic" value={dic} tag="span" />
              </p>
            )}
            {vatNote && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="vatNote" value={vatNote} tag="span" />
              </p>
            )}
            {bankAccount && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="bankAccount" value={bankAccount} tag="span" />
              </p>
            )}
            {paymentNote && (
              <p style={{ ...body, fontStyle: "italic" }}>
                <GenericEditableText sectionId={sectionId} field="paymentNote" value={paymentNote} tag="span" />
              </p>
            )}
            {!!content.receiptNote && (
              <p style={body}>
                <GenericEditableText sectionId={sectionId} field="receiptNote" value={content.receiptNote as string} tag="span" />
              </p>
            )}
            {socials4.length > 0 && (
              <div className="flex items-center justify-center gap-5 mt-6" style={{ color: "#d5b981" }}>
                {socials4.map((s, i) => (
                  <a
                    key={`fs-${i}`}
                    href={s.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label ?? s.icon ?? "social"}
                    style={{ color: "inherit" }}
                  >
                    <SocialIcon name={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright (žádný oddělený legal řádek dle originálu) */}
        <div
          style={{
            maxWidth: 1180,
            margin: "48px auto 0",
            paddingTop: 20,
            paddingBottom: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "'Lato',Helvetica,Arial,sans-serif",
            fontSize: 12,
            lineHeight: 1.7,
            textAlign: "center",
          }}
        >
          <p>
            © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
          </p>
        </div>
      </footer>
    );
  }

  // Footer — map + contact (barber-03): large map left, contact widget right
  if (variant === "footer-map-contact") {
    const logoUrl = String(content.logoUrl ?? "");
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursTitle = String(content.hoursTitle ?? "Otevírací doba");
    const kontaktyTitle = String(content.kontaktyTitle ?? "Kontakty");
    const mapEmbedUrl = String(content.mapEmbedUrl ?? "");
    const mapImage = String(content.mapImage ?? "");
    const legal = String(content.legal ?? "");
    return (
      <footer id="footer" style={{ backgroundColor: "#1c1410", color: "rgba(255,255,255,0.7)" }} data-template="barber-03">
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px" }}>
          <div className="footer-bb03-grid" style={{ display: "grid", gap: 32 }}>
            <div>
              {mapEmbedUrl ? (
                <iframe
                  src={mapEmbedUrl}
                  style={{ border: 0, width: "100%", height: 360, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa"
                />
              ) : mapImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={mapImage} alt="Mapa" style={{ width: "100%", height: 360, objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: 360, backgroundColor: "#0f0a07", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
                  Mapa — vlož embed v Studio
                </div>
              )}
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,169,110,0.18)", padding: "32px 28px" }}>
              {logoUrl && (
                <a href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"} style={{ display: "inline-block", marginBottom: 24 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt={siteName} style={{ width: 140, height: "auto" }} />
                </a>
              )}
              <h3 className="uppercase" style={{ fontFamily: "var(--font-heading)", color: "#c8a96e", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.16em", marginBottom: 16 }}>
                <GenericEditableText sectionId={sectionId} field="kontaktyTitle" value={kontaktyTitle} tag="span" />
              </h3>
              {address && (
                <p style={{ fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 12, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-line" }}>
                  <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                </p>
              )}
              {phone && (
                <p style={{ fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 8 }}>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} style={{ color: "#c8a96e", textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                  </a>
                </p>
              )}
              {email && (
                <p style={{ fontSize: "0.92rem", lineHeight: 1.7, marginBottom: 16 }}>
                  <a href={`mailto:${email}`} style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
                    <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                  </a>
                </p>
              )}
              {hours.length > 0 && (
                <>
                  <h4 className="uppercase" style={{ fontFamily: "var(--font-heading)", color: "#c8a96e", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.14em", marginTop: 16, marginBottom: 10 }}>
                    <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
                  </h4>
                  <div style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
                    {hours.map((h, i) => (
                      <p key={i} style={{ marginBottom: 4 }}>
                        <strong style={{ color: "#fff", fontWeight: 500 }}>
                          <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                        </strong>
                        {": "}
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </p>
                    ))}
                  </div>
                </>
              )}
              {socials.length > 0 && (
                <div style={{ display: "flex", gap: 16, marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  {socials.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} style={{ color: "#c8a96e", textDecoration: "none", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          {legal && (
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
              <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
            </div>
          )}
        </div>
        <style>{`
          .footer-bb03-grid { grid-template-columns: 1fr; }
          @media (min-width: 1024px) {
            .footer-bb03-grid { grid-template-columns: 3fr 1fr; gap: 40px; }
          }
        `}</style>
      </footer>
    );
  }

  // Footer — luxury barber 2-col (barber-02): logo+contact+social left, hours right
  if (variant === "barber-luxury") {
    const logoUrl = String(content.logoUrl ?? "");
    const hours = (content.hours as Array<{ day: string; value: string }>) ?? [];
    const hoursTitle = String(content.hoursTitle ?? "Otevírací doba");
    const legal = String(content.legal ?? "");
    return (
      <footer
        style={{
          backgroundColor: "#111111",
          color: "rgba(255,255,255,0.65)",
          padding: "60px 40px",
        }}
      >
        <div
          data-footer-barber-luxury
          className="grid"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start",
          }}
        >
          <div>
            {logoUrl && (
              <a
                href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "#"}
                style={{ display: "inline-block", marginBottom: 20 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={siteName}
                  style={{ width: 80, height: "auto", filter: "brightness(0.85)" }}
                />
              </a>
            )}
            {address && (
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  marginBottom: 8,
                  color: "rgba(255,255,255,0.65)",
                  whiteSpace: "pre-line",
                }}
              >
                <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
              </p>
            )}
            {phone && (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 8 }}>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                </a>
              </p>
            )}
            {email && (
              <p style={{ fontSize: "0.9rem", lineHeight: 1.8, marginBottom: 8 }}>
                <a href={`mailto:${email}`} style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}>
                  <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                </a>
              </p>
            )}
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
                {socials.map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                  </a>
                ))}
              </div>
            )}
          </div>
          {hours.length > 0 && (
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: 20,
                  fontWeight: 400,
                }}
              >
                <GenericEditableText sectionId={sectionId} field="hoursTitle" value={hoursTitle} tag="span" />
              </h3>
              <table style={{ borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <tbody>
                  {hours.map((h, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 20px 6px 0", color: "rgba(255,255,255,0.65)" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.day`} value={h.day} tag="span" />
                      </td>
                      <td style={{ padding: "6px 20px 6px 0", color: "var(--color-accent, #d4a96e)" }}>
                        <GenericEditableText sectionId={sectionId} field={`hours.${i}.value`} value={h.value} tag="span" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {legal && (
          <div
            style={{
              maxWidth: 1100,
              margin: "32px auto 0",
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              fontFamily: "var(--font-body)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="legal" value={legal} tag="span" />
          </div>
        )}
        <style>{`
          @media(max-width:900px){[data-footer-barber-luxury]{grid-template-columns:1fr !important;gap:40px !important;}}
        `}</style>
      </footer>
    );
  }

  if (variant === "barber-dark") {
    return (
      <footer
        className="py-16 px-4"
        style={{ backgroundColor: "#0A0A0A", borderTop: "1px solid var(--color-border, #2A2A2A)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <p
                className="font-bold text-base mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent, #C9A84C)", letterSpacing: "0.12em" }}
              >
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </p>
              {tagline && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              )}
            </div>

            {links.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>Navigace</p>
                <ul className="space-y-3">
                  {links.map((l, i) => (
                    <li key={l.href}>
                      <a
                        href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                        className="text-sm transition-opacity hover:opacity-100"
                        style={{ color: "var(--color-text-muted, #A0A0A0)", opacity: 0.8 }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(phone || email || address) && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>Kontakt</p>
                <ul className="space-y-3 text-sm" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
                  {phone && (
                    <li><a href={`tel:${phone}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></li>
                  )}
                  {email && (
                    <li><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></li>
                  )}
                  {address && (
                    <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-2" style={{ borderColor: "var(--color-border, #2A2A2A)" }}>
            <p className="text-xs" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
              © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. Všechna práva vyhrazena.
            </p>
            {socials.length > 0 && (
              <ul className="flex gap-5">
                {socials.map((s, i) => (
                  <li key={i}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--color-text-muted, #A0A0A0)" }}>
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label ?? ""} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </footer>
    );
  }

  if (content.layout === "6col") {
    return (
      <footer>
        <div className="py-12 md:py-16" style={{ backgroundColor: "var(--color-primary-light, var(--color-primary, #b51144))", color: "rgba(255,255,255,0.95)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {columns.map((col, ci) => (
                <div key={ci}>
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wide">
                    <GenericEditableText sectionId={sectionId} field={`columns.${ci}.title`} value={col.title} tag="span" />
                  </h3>
                  <ul className="space-y-2">
                    {col.links.map((l, li) => (
                      <li key={li}>
                        <a href={resolveDemoHref(l.href, tenantSlug, isAdmin)} className="text-sm opacity-90 hover:opacity-100">
                          <GenericEditableText sectionId={sectionId} field={`columns.${ci}.links.${li}.label`} value={l.label} tag="span" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="py-12" style={{ backgroundColor: "var(--color-primary, #6d1f37)", color: "rgba(255,255,255,0.95)" }}>
          <div className="max-w-6xl mx-auto px-6">
            {legalLinks.length > 0 && (
              <ul className="md:flex gap-8 mb-8 text-sm">
                {legalLinks.map((l, i) => (
                  <li key={i} className="mb-2 md:mb-0">
                    <a href={l.href} className="hover:underline opacity-90">
                      <GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-sm opacity-80 mb-6">
              © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />, všechna práva vyhrazena
            </div>
            {socials.length > 0 && (
              <ul className="flex gap-5">
                {socials.map((s, i) => (
                  <li key={i}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-sm opacity-90 hover:opacity-100">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </footer>
    );
  }

  if (variant === "light") {
    // Jednořádkový minimální footer: logo vlevo | nav linky uprostřed | kontakt+social vpravo
    const SocialIcon = ({ name }: { name?: string }) => {
      const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
      if (name === "instagram") return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>);
      if (name === "facebook") return (<svg {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>);
      return <span style={{ fontSize: 10 }}>{name}</span>;
    };
    return (
      <footer
        style={{
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e8e4df",
          color: "#1a1a1a",
        }}
        data-template="peak-cut"
      >
        <div
          className="max-w-[1280px] mx-auto px-6 lg:px-10"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, minHeight: 72 }}
        >
          {/* Logo vlevo */}
          <a
            href={tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/"}
            className="flex items-center shrink-0"
            title={siteName}
          >
            <GenericEditableImage
              sectionId={sectionId}
              field="logoUrl"
              src={logoSrc}
              alt={siteName}
              className="relative overflow-hidden shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <OptimizedPicture src={logoSrc} alt={siteName} imgStyle={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </GenericEditableImage>
          </a>

          {/* Nav linky horizontálně uprostřed */}
          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-8">
              {links.map((l, i) => (
                <a
                  key={l.href}
                  href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                  className="hover:opacity-60 transition-opacity"
                  style={{ fontSize: 13, color: "#1a1a1a", letterSpacing: "0.02em" }}
                >
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
          )}

          {/* Kontakt + social vpravo */}
          <div className="hidden md:flex items-center gap-5">
            {email && (
              <a href={`mailto:${email}`} className="hover:opacity-60 transition-opacity flex items-center gap-2" style={{ fontSize: 13, color: "#1a1a1a" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:opacity-60 transition-opacity flex items-center gap-2" style={{ fontSize: 13, color: "#1a1a1a" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.99-.94a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
            )}
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label ?? s.icon}
                className="flex items-center justify-center rounded-full hover:opacity-60 transition-opacity"
                style={{ width: 32, height: 32, border: "1px solid #d0ccc6", color: "#1a1a1a" }}
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright řádek */}
        <div style={{ borderTop: "1px solid #e8e4df", padding: "10px 0", textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
            © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. Všechna práva vyhrazena.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="py-12 px-4"
      style={{
        backgroundColor: "var(--color-secondary, #111827)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <p
              className="font-bold text-lg mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            </p>
            {tagline && (
              <p className="text-sm opacity-70">
                <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
              </p>
            )}
          </div>

          {links.length > 0 && (
            <div>
              <p className="font-semibold text-sm mb-3 opacity-60 uppercase tracking-wide">Navigace</p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={resolveDemoHref(l.href, tenantSlug, isAdmin)} className="text-sm opacity-80 hover:opacity-100 transition-opacity">
                      <GenericEditableText sectionId={sectionId} field={`links.${links.indexOf(l)}.label`} value={l.label} tag="span" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(phone || email || address) && (
            <div>
              <p className="font-semibold text-sm mb-3 opacity-60 uppercase tracking-wide">Kontakt</p>
              <ul className="space-y-2 text-sm opacity-80">
                {phone && <li><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></li>}
                {email && <li><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></li>}
                {address && <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs opacity-50">
          © {year} <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />. Všechna práva vyhrazena.
        </div>
      </div>
    </footer>
  );
}

// hair-03-footer — šedá (#c1c1c1) minimální patička s centrovaným logem a copyrightem
function FooterHair03({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const siteName = String(content.siteName ?? "Petra Studio");
  const logoUrl  = String(content.logoUrl ?? "");
  const copyright = String(content.copyright ?? `Copyright © ${new Date().getFullYear()} Demo Studio s.r.o. – Všechna práva vyhrazena.`);
  const SANS = "Helvetica, Arial, sans-serif";
  const GOLD = "#c8a97e";
  const DARK = "#2f201a";

  const LogoSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 62" width="180" height="40" aria-label={siteName}>
      <text x="4" y="16" fontFamily={SANS} fontSize="10" fill={GOLD} letterSpacing="4">HAIR MAKING</text>
      <text x="4" y="44" fontFamily={SANS} fontSize="26" fontWeight="400" fill={DARK} letterSpacing="2">petra</text>
      <text x="98" y="44" fontFamily={SANS} fontSize="26" fill={GOLD} letterSpacing="2"> studio</text>
      <line x1="4" y1="50" x2="276" y2="50" stroke={GOLD} strokeWidth="0.8" />
    </svg>
  );

  return (
    <footer style={{ backgroundColor: "#c1c1c1", padding: "16px 12px" }} data-template="hair-03">
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {logoUrl ? (
          <img src={logoUrl} alt={siteName} style={{ height: 60, objectFit: "contain" }} />
        ) : (
          <LogoSvg />
        )}
        <GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="p"
          style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: "#525252", margin: 0, textAlign: "center" }}
        />
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: "#050505", textDecoration: "none" }}>
            Ochrana osobních údajů
          </a>
        </div>
      </div>
    </footer>
  );
}

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}
