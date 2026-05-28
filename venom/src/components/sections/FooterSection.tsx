import { GenericEditableText } from "@/components/tenant/GenericEditableText";

interface Props {
  content: Record<string, unknown>;
  variant?: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function FooterSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const siteName = String(content.siteName ?? "Web");
  const tagline = String(content.tagline ?? "");
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const phone = String(content.phone ?? "");
  const email = String(content.email ?? "");
  const address = String(content.address ?? "");
  const year = new Date().getFullYear();
  const columns = (content.columns as Array<{ title: string; links: Array<{ label: string; href: string }> }>) ?? [];
  const socials = (content.socials as Array<{ label: string; href: string }>) ?? [];
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }>) ?? [];

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
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
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
                    <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
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
                      <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
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
    return (
      <footer
        className="py-12 px-4"
        style={{
          backgroundColor: "var(--color-surface, #f5f5f5)",
          borderTop: "1px solid var(--color-border, rgba(0,0,0,0.1))",
          color: "var(--color-text, #000)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <p
                className="font-bold text-sm mb-3 uppercase tracking-widest"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #000)" }}
              >
                <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
              </p>
              {tagline && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted, #666)" }}>
                  <GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" />
                </p>
              )}
              {socials.length > 0 && (
                <ul className="flex gap-4 mt-4">
                  {socials.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold uppercase tracking-wide hover:opacity-60 transition-opacity"
                        style={{ color: "var(--color-primary, #004679)" }}
                      >
                        <GenericEditableText sectionId={sectionId} field={`socials.${i}.label`} value={s.label} tag="span" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {links.length > 0 && (
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--color-text-muted, #666)" }}
                >
                  Navigace
                </p>
                <ul className="space-y-3">
                  {links.map((l, i) => (
                    <li key={l.href}>
                      <a
                        href={resolveDemoHref(l.href, tenantSlug, isAdmin)}
                        className="text-sm hover:opacity-60 transition-opacity"
                        style={{ color: "var(--color-text, #000)" }}
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
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--color-text-muted, #666)" }}
                >
                  Kontakt
                </p>
                <ul className="space-y-3 text-sm" style={{ color: "var(--color-text, #000)" }}>
                  {phone && (
                    <li>
                      <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:opacity-60 transition-opacity">
                        <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} className="hover:opacity-60 transition-opacity">
                        <GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" />
                      </a>
                    </li>
                  )}
                  {address && (
                    <li>
                      <GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" />
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div
            className="pt-6 text-xs"
            style={{
              borderTop: "1px solid var(--color-border, rgba(0,0,0,0.1))",
              color: "var(--color-text-muted, #666)",
            }}
          >
            © {year}{" "}
            <GenericEditableText sectionId={sectionId} field="siteName" value={siteName} tag="span" />
            . Všechna práva vyhrazena.
          </div>
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

function resolveDemoHref(href: string, tenantSlug?: string, isAdmin = false) {
  if (!tenantSlug || !href.startsWith("/")) return href;
  if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
}
