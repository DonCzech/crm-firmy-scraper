#!/usr/bin/env python3
"""Deterministic rebuild of all signal-01 (SIGNAL — Swiss authority) section components.

Vzor: scripts/proof01-rebuild.py. Paralelní session občas přepisuje soubory na disku;
tento skript idempotentně obnoví kanonický stav signal-01 bloků:
 - najde SIGNAL banner v každém souboru, odřízne od něj (bloky žijí na EOF za proof-01)
 - znovu appenduje blok a zajistí dispatch řádky + registrace ve variants.ts
Run from venom/: python3 scripts/signal-rebuild.py
"""

BANNER = "// ══ SIGNAL — Swiss authority (signal-01)"


def ensure_line(s, anchor, line):
    if line.strip() in s:
        return s
    assert anchor in s, f"anchor missing: {anchor[:70]!r}"
    return s.replace(anchor, line + "\n" + anchor, 1)


def rebuild(path, block, dispatches):
    s = open(path).read()
    i = s.find(BANNER)
    if i != -1:
        s = s[:i].rstrip() + "\n"
    s = s.rstrip() + "\n\n" + block.strip() + "\n"
    for anchor, line in dispatches:
        s = ensure_line(s, anchor, line)
    open(path, "w").write(s)
    print(f"rebuilt {path}")


# ═════════════════════════════ NAVBAR ════════════════════════════════════════
NAVBAR = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Sticky světlý navbar s hairline spodní linkou, electric blue CTA, mobil drawer
// + fixní spodní CTA lišta (Zavolat / Konzultace). Fonty z theme tokenů.
function NavbarSignal01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const siteName = String(content.siteName ?? "Ukázka Consulting");
  const logoUrl  = String(content.logoUrl ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText = String(content.ctaText ?? "Rezervovat konzultaci");
  const ctaHref = String(content.ctaHref ?? "#konzultace");
  const phone   = String(content.phone ?? "704 123 456");
  const phoneHref = String(content.phoneHref ?? "tel:+420704123456");
  const mCallLabel = String(content.mobileCtaCallLabel ?? "Zavolat");
  const mCallHref  = String(content.mobileCtaCallHref ?? phoneHref);
  const mLeadLabel = String(content.mobileCtaLeadLabel ?? "Konzultace");
  const mLeadHref  = String(content.mobileCtaLeadHref ?? ctaHref);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  return (
    <>
      <style>{`
        .sg01nav-wrap { --sg-accent:#2563EB; --sg-ink:#101418; --sg-text:#111827; --sg-border:#E3E7EB;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); }
        .sg01nav { position: sticky; top: 0; z-index: 60; background: rgba(255,255,255,.9);
          backdrop-filter: saturate(1.4) blur(12px); -webkit-backdrop-filter: saturate(1.4) blur(12px);
          border-bottom: 1px solid var(--sg-border); }
        .sg01nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 48px); height: 72px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .sg01nav-brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; color: var(--sg-ink); min-width: 0; }
        .sg01nav-brand img { height: 32px; width: auto; display: block; }
        .sg01nav-links { display: flex; align-items: center; gap: 2px; }
        .sg01nav-links a { padding: 8px 14px; font-size: .92rem; font-weight: 600; color: var(--sg-text); text-decoration: none;
          border-radius: 6px; transition: background .18s, color .18s; }
        .sg01nav-links a:hover { background: rgba(37,99,235,.06); color: var(--sg-accent); }
        .sg01nav-right { display: flex; align-items: center; gap: 14px; }
        .sg01nav-phone { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: .92rem; color: var(--sg-ink); text-decoration: none; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .sg01nav-phone svg { color: var(--sg-accent); }
        .sg01nav-cta { display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px; background: var(--sg-accent);
          color: #fff; font-weight: 700; font-size: .9rem; text-decoration: none; border-radius: 6px; white-space: nowrap; transition: transform .2s, box-shadow .2s; }
        .sg01nav-cta:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -10px rgba(37,99,235,.7); }
        .sg01nav-burger { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid var(--sg-border);
          border-radius: 6px; background: #fff; cursor: pointer; color: var(--sg-ink); }
        .sg01nav-drawer { position: fixed; inset: 0; z-index: 70; background: rgba(16,20,24,.55); opacity: 0; pointer-events: none; transition: opacity .25s; }
        .sg01nav-drawer[data-open="true"] { opacity: 1; pointer-events: auto; }
        .sg01nav-panel { position: absolute; top: 0; right: 0; height: 100%; width: min(84vw, 340px); background: #F3F5F7;
          transform: translateX(100%); transition: transform .3s cubic-bezier(.22,.68,0,1); display: flex; flex-direction: column; padding: 20px; }
        .sg01nav-drawer[data-open="true"] .sg01nav-panel { transform: translateX(0); }
        .sg01nav-panel-close { align-self: flex-end; width: 44px; height: 44px; border: 1px solid var(--sg-border); border-radius: 6px; background: #fff; font-size: 1.4rem; cursor: pointer; color: var(--sg-ink); }
        .sg01nav-panel a { padding: 14px 8px; font-size: 1.02rem; font-weight: 700; color: var(--sg-ink); text-decoration: none; border-bottom: 1px solid var(--sg-border); }
        .sg01nav-panel-cta { margin-top: 18px; text-align: center; background: var(--sg-accent); color: #fff !important; border-radius: 6px; border-bottom: none !important; }
        .sg01nav-mobar { display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 55;
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); gap: 10px; background: rgba(255,255,255,.94);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-top: 1px solid var(--sg-border); }
        .sg01nav-mobar a { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;
          font-weight: 700; font-size: .95rem; text-decoration: none; border-radius: 6px; }
        .sg01nav-mobar-call { background: #fff; color: var(--sg-ink); border: 1.5px solid var(--sg-border); }
        .sg01nav-mobar-lead { background: var(--sg-accent); color: #fff; }
        @media (max-width: 900px) {
          .sg01nav-links, .sg01nav-phone, .sg01nav-cta { display: none; }
          .sg01nav-burger { display: inline-flex; }
          .sg01nav-mobar { display: flex; }
        }
        @media (prefers-reduced-motion: reduce) { .sg01nav-drawer, .sg01nav-panel, .sg01nav-cta { transition: none; } }
      `}</style>

      <div className="sg01nav-wrap" data-template="signal-01">
        <header className="sg01nav">
          <div className="sg01nav-inner">
            <a href={homeHref} className="sg01nav-brand" aria-label={siteName}>
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="sg01nav-logoslot">
                <img src={logoSrc} alt={siteName} />
              </GenericEditableImage>
            </a>
            <nav className="sg01nav-links" aria-label="Hlavní navigace">
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
            <div className="sg01nav-right">
              <a href={phoneHref} className="sg01nav-phone">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" />
              </a>
              <a href={resolve(ctaHref)} className="sg01nav-cta" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <button className="sg01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="sg01nav-drawer" data-open={open} onClick={() => setOpen(false)}>
          <div className="sg01nav-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Navigace">
            <button className="sg01nav-panel-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
            <nav>
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)} style={{ display: "block" }}>{l.label}</a>
              ))}
            </nav>
            <a href={resolve(ctaHref)} className="sg01nav-panel-cta" style={{ display: "block", padding: "14px" }} onClick={() => setOpen(false)}>{ctaText}</a>
          </div>
        </div>

        <nav className="sg01nav-mobar" aria-label="Rychlý kontakt">
          <a href={mCallHref} className="sg01nav-mobar-call">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <GenericEditableText sectionId={sectionId} field="mobileCtaCallLabel" value={mCallLabel} tag="span" />
          </a>
          <a href={resolve(mLeadHref)} className="sg01nav-mobar-lead" data-btn="primary">
            <GenericEditableText sectionId={sectionId} field="mobileCtaLeadLabel" value={mLeadLabel} tag="span" />
          </a>
        </nav>
      </div>
    </>
  );
}
'''

# ═════════════════════════════ HERO ══════════════════════════════════════════
HERO = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Cinematic hero: full-bleed korporátní fotka + charcoal overlay, Oswald typografie,
// dark glass panel se signature interakcí „Vyberte svou roli" (segmented se sliding
// thumb) → živé přepnutí 3 benefitů + case metriky + CTA Rezervovat konzultaci.
type Sg01Role = { label?: string; benefits?: string[]; metric?: string; metricLabel?: string; note?: string };

function sg01ResolveHref(href: string, tenantSlug?: string, isAdmin?: boolean) {
  if (!tenantSlug) return href;
  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href.startsWith("/") ? href : "/" + href}`;
}

function HeroSignal01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const eyebrow     = String(content.eyebrow     ?? "Consulting pro měřitelné výsledky");
  const title       = String(content.title       ?? "Rozhodnutí podložená daty,");
  const titleAccent = String(content.titleAccent ?? "výsledky podložené čísly.");
  const subtitle    = String(content.subtitle    ?? "Pomáháme vedení firem doručit strategii do provozu. Pevný rozsah, jasná metrika úspěchu a senioři, kteří už firmy vedli.");
  const ctaText          = String(content.ctaText          ?? "Rezervovat konzultaci");
  const ctaHref          = String(content.ctaHref          ?? "#konzultace");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Zavolat: 704 123 456");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:+420704123456");
  const photo    = String(content.photo    ?? "/templates/signal-01/img/hero.webp");
  const photoAlt = String(content.photoAlt ?? "Korporátní budovy");
  const rawTrust = content.trust as string[] | undefined;
  const trust = rawTrust && rawTrust.length ? rawTrust : ["120+ dokončených projektů", "ISO 9001 / 27001", "NPS 74"];

  const selectorTitle    = String(content.selectorTitle    ?? "Vyberte svou roli");
  const selectorSubtitle = String(content.selectorSubtitle ?? "Ukážeme vám, co nejčastěji řešíme pro lidi ve vaší pozici.");
  const metricEyebrow    = String(content.metricEyebrow    ?? "Typický výsledek");
  const selectorCtaText  = String(content.selectorCtaText  ?? "Rezervovat konzultaci");
  const selectorCtaHref  = String(content.selectorCtaHref  ?? "#konzultace");
  const selectorCtaNote  = String(content.selectorCtaNote  ?? "Prvních 30 minut zdarma · bez závazku");

  const roles: Sg01Role[] = (content.roles as Sg01Role[] | undefined)?.length
    ? (content.roles as Sg01Role[])
    : [
        { label: "CEO", benefits: ["Strategie růstu s jasnou metrikou", "Provozní model, který škáluje", "Reporting pro board na jedné stránce"], metric: "+18 %", metricLabel: "růst EBITDA do 18 měsíců", note: "Výrobní skupina, 240 zaměstnanců" },
        { label: "CFO", benefits: ["Controlling a cashflow řízení", "Snížení provozních nákladů", "Automatizovaný reporting"], metric: "−23 %", metricLabel: "provozních nákladů za 12 měsíců", note: "Obchodní skupina, 5 poboček" },
      ];

  const [roleIdx, setRoleIdx] = useState(0);
  const role = roles[Math.min(roleIdx, roles.length - 1)] ?? {};
  const benefits = (role.benefits ?? []).slice(0, 3);

  return (
    <>
      <style>{`
        .sg01hero { position: relative; background: #101418; overflow: hidden;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); color: #fff;
          display: flex; align-items: center; min-height: clamp(640px, 92vh, 900px); }
        .sg01hero-bgwrap { position: absolute; inset: 0; z-index: 0; }
        .sg01hero-bgwrap::after { content: ''; position: absolute; inset: 0;
          background: linear-gradient(92deg, rgba(13,17,22,.95) 0%, rgba(13,17,22,.78) 40%, rgba(13,17,22,.42) 72%, rgba(13,17,22,.55) 100%); }
        .sg01hero-bgwrap::before { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 140px; z-index: 1;
          background: linear-gradient(180deg, transparent, rgba(13,17,22,.88)); }
        .sg01hero-photo-slot { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
        .sg01hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .sg01hero-inner { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; width: 100%;
          padding: clamp(96px, 12vh, 140px) clamp(20px, 5vw, 48px) clamp(56px, 8vh, 88px);
          display: grid; grid-template-columns: 1.12fr 0.88fr; gap: clamp(36px, 5vw, 80px); align-items: center; }
        @keyframes sg01up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .sg01hero-left { min-width: 0; padding-right: clamp(0px, 2vw, 24px); }
        .sg01hero-left > * { animation: sg01up .65s cubic-bezier(.22,.68,0,1) both; }
        .sg01hero-left > *:nth-child(1) { animation-delay: .05s; }
        .sg01hero-left > *:nth-child(2) { animation-delay: .13s; }
        .sg01hero-left > *:nth-child(3) { animation-delay: .22s; }
        .sg01hero-left > *:nth-child(4) { animation-delay: .32s; }
        .sg01hero-left > *:nth-child(5) { animation-delay: .44s; }
        .sg01hero-eyebrow { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .78rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #6EA8FE; margin: 0 0 20px;
          display: inline-flex; align-items: center; gap: 12px; }
        .sg01hero-eyebrow::before { content: ''; width: 40px; height: 2px; background: #6EA8FE; }
        .sg01hero-h1 { font-family: var(--font-heading, system-ui, sans-serif); color: #fff;
          font-size: clamp(2.5rem, 5.2vw, 4.4rem); font-weight: 600; line-height: 1.05;
          letter-spacing: 0; margin: 0 0 24px; text-wrap: balance; }
        .sg01hero-h1-accent { display: block; font-weight: 600; color: #6EA8FE; font-size: 1em; margin-top: .06em; }
        .sg01hero-sub { font-size: clamp(1.02rem, 1.35vw, 1.18rem); line-height: 1.65; color: rgba(255,255,255,.82);
          max-width: 30em; margin: 0 0 34px; }
        .sg01hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; }
        .sg01btn-primary { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 30px; background: #2563EB; color: #fff; font-weight: 700; font-size: .98rem;
          text-decoration: none; border-radius: 6px; transition: transform .35s cubic-bezier(.22,.68,0,1), box-shadow .35s ease; white-space: nowrap; }
        .sg01btn-primary > * { position: relative; z-index: 2; }
        .sg01btn-primary::before { content: ''; position: absolute; top: 0; left: -130%; width: 55%; height: 100%; z-index: 1;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.35), transparent); transform: skewX(-18deg); transition: left .6s cubic-bezier(.22,.68,0,1); }
        .sg01btn-primary:hover::before { left: 140%; }
        .sg01btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px rgba(37,99,235,.7); }
        .sg01btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; background: rgba(255,255,255,.06);
          color: #fff; font-weight: 600; font-size: .98rem; text-decoration: none; border: 1.5px solid rgba(255,255,255,.35);
          border-radius: 6px; transition: border-color .2s, background .2s; white-space: nowrap; backdrop-filter: blur(6px); }
        .sg01btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,.12); }
        .sg01hero-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 36px;
          padding-top: 24px; border-top: 1px solid rgba(255,255,255,.22); }
        .sg01hero-trust-item { display: inline-flex; align-items: center; gap: 8px; font-size: .88rem; font-weight: 700; color: #fff; }
        .sg01hero-trust-item svg { flex-shrink: 0; color: #6EA8FE; }
        .sg01hero-trust-item + .sg01hero-trust-item::before { content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,.35); margin-right: 14px; }
        /* glass panel */
        .sg01hero-visual { position: relative; min-width: 0; animation: sg01up .7s cubic-bezier(.22,.68,0,1) .18s both; z-index: 2; }
        .sg01sel { position: relative; z-index: 2; width: 100%; color: #fff;
          background: rgba(10,15,22,.66); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px; padding: clamp(24px,2.4vw,32px); box-shadow: 0 30px 70px -25px rgba(0,0,0,.55); }
        .sg01sel-title { font-family: var(--font-heading, system-ui, sans-serif); color: #fff; font-size: 1.24rem; font-weight: 600; letter-spacing: .01em; margin: 0 0 4px; }
        .sg01sel-sub { font-size: .84rem; color: rgba(255,255,255,.62); margin: 0 0 18px; }
        .sg01sel-roles { position: relative; display: flex; background: rgba(255,255,255,.08); border-radius: 8px; padding: 3px; margin-bottom: 6px; width: 100%; isolation: isolate; }
        .sg01sel-roles-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 6px; background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,.35); z-index: 0; transition: transform .28s cubic-bezier(.22,.68,0,1);
          width: calc((100% - 6px) / var(--sg-n, 4)); transform: translateX(calc(var(--sg-i, 0) * 100%)); }
        .sg01sel-role { position: relative; z-index: 1; flex: 1; border: none; cursor: pointer; padding: 9px 2px; border-radius: 6px; font-family: inherit;
          font-weight: 700; font-size: .8rem; color: rgba(255,255,255,.62); background: transparent; transition: color .2s; white-space: nowrap; }
        .sg01sel-role[aria-checked="true"] { color: #101418; }
        .sg01sel-benefits { display: block; margin: 0 0 16px; border-top: 1px solid rgba(255,255,255,.12); }
        @keyframes sg01fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .sg01sel-benefit { display: flex; align-items: center; gap: 11px; padding: 12px 2px; border-bottom: 1px solid rgba(255,255,255,.12);
          font-size: .92rem; font-weight: 600; color: rgba(255,255,255,.9); animation: sg01fade .3s cubic-bezier(.22,.68,0,1) both; }
        .sg01sel-benefit:nth-child(2) { animation-delay: .05s; }
        .sg01sel-benefit:nth-child(3) { animation-delay: .1s; }
        .sg01sel-benefit svg { flex-shrink: 0; color: #6EA8FE; }
        .sg01sel-metric { padding: 4px 0 0; animation: sg01fade .32s cubic-bezier(.22,.68,0,1) both; }
        .sg01sel-metric-lbl { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .66rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 6px; }
        .sg01sel-metric-val { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .sg01sel-metric-val > b { font-family: var(--font-heading, system-ui, sans-serif); font-size: clamp(2.1rem, 2.6vw, 2.7rem); font-weight: 600; line-height: 1; color: #6EA8FE;
          font-variant-numeric: tabular-nums; white-space: nowrap; }
        .sg01sel-metric-val b span { font-size: inherit; }
        .sg01sel-metric-val > span { font-size: .88rem; color: rgba(255,255,255,.85); font-weight: 600; max-width: 16em; line-height: 1.35; }
        .sg01sel-metric-note { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .72rem; color: rgba(255,255,255,.5); margin-top: 8px; }
        .sg01sel-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; width: 100%;
          padding: 15px; background: #2563EB; color: #fff; font-weight: 700; font-size: .95rem; text-decoration: none;
          border-radius: 6px; transition: filter .2s, transform .2s; box-shadow: 0 10px 30px -10px rgba(37,99,235,.6); }
        .sg01sel-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .sg01sel-cta-note { font-family: var(--font-overpass-mono, ui-monospace, monospace); text-align: center; font-size: .7rem; color: rgba(255,255,255,.5); margin-top: 10px; }
        @media (max-width: 1000px) {
          .sg01hero { min-height: 0; }
          .sg01hero-inner { grid-template-columns: 1fr; padding-top: 96px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .sg01hero-left > *, .sg01hero-visual, .sg01sel-benefit, .sg01sel-metric { animation: none; }
          .sg01btn-primary, .sg01btn-primary::before, .sg01sel-role, .sg01sel-roles-thumb { transition: none; }
        }
      `}</style>

      <section className="sg01hero" data-template="signal-01" id="uvod">
        <div className="sg01hero-bgwrap" aria-hidden="true">
          <GenericEditableImage sectionId={sectionId} field="photo" src={photo} alt={photoAlt} className="sg01hero-photo-slot">
            <img src={photo} alt="" className="sg01hero-photo" />
          </GenericEditableImage>
        </div>
        <div className="sg01hero-inner">
          <div className="sg01hero-left">
            <p className="sg01hero-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h1 className="sg01hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {titleAccent && (
                <span className="sg01hero-h1-accent">
                  <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                </span>
              )}
            </h1>
            <p className="sg01hero-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div className="sg01hero-ctas">
              <a href={sg01ResolveHref(ctaHref, tenantSlug, isAdmin)} className="sg01btn-primary" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href={sg01ResolveHref(ctaSecondaryHref, tenantSlug, isAdmin)} className="sg01btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>
            <div className="sg01hero-trust">
              {trust.map((t, i) => (
                <span key={i} className="sg01hero-trust-item">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                  <GenericEditableText sectionId={sectionId} field={`trust.${i}`} value={t} tag="span" />
                </span>
              ))}
            </div>
          </div>

          <div className="sg01hero-visual">
            <div className="sg01sel" role="group" aria-label={selectorTitle}>
              <div className="sg01sel-title">
                <GenericEditableText sectionId={sectionId} field="selectorTitle" value={selectorTitle} tag="span" />
              </div>
              <p className="sg01sel-sub">
                <GenericEditableText sectionId={sectionId} field="selectorSubtitle" value={selectorSubtitle} tag="span" />
              </p>
              <div className="sg01sel-roles" role="radiogroup" aria-label={selectorTitle}
                style={{ ["--sg-n" as string]: roles.length, ["--sg-i" as string]: Math.min(roleIdx, roles.length - 1) }}>
                <span className="sg01sel-roles-thumb" aria-hidden="true" />
                {roles.map((r, i) => (
                  <button key={i} type="button" className="sg01sel-role" role="radio" aria-checked={roleIdx === i} onClick={() => setRoleIdx(i)}>
                    {String(r.label ?? "")}
                  </button>
                ))}
              </div>
              <div className="sg01sel-benefits" key={`b-${roleIdx}`} aria-live="polite">
                {benefits.map((b, i) => (
                  <div key={i} className="sg01sel-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`roles.${roleIdx}.benefits.${i}`} value={b} tag="span" />
                  </div>
                ))}
              </div>
              <div className="sg01sel-metric" key={`m-${roleIdx}`} aria-live="polite">
                <div className="sg01sel-metric-lbl">
                  <GenericEditableText sectionId={sectionId} field="metricEyebrow" value={metricEyebrow} tag="span" />
                </div>
                <div className="sg01sel-metric-val">
                  <b><GenericEditableText sectionId={sectionId} field={`roles.${roleIdx}.metric`} value={String(role.metric ?? "")} tag="span" /></b>
                  <span><GenericEditableText sectionId={sectionId} field={`roles.${roleIdx}.metricLabel`} value={String(role.metricLabel ?? "")} tag="span" /></span>
                </div>
                {role.note && (
                  <div className="sg01sel-metric-note">
                    <GenericEditableText sectionId={sectionId} field={`roles.${roleIdx}.note`} value={String(role.note ?? "")} tag="span" />
                  </div>
                )}
              </div>
              <a href={sg01ResolveHref(selectorCtaHref, tenantSlug, isAdmin)} className="sg01sel-cta" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="selectorCtaText" value={selectorCtaText} tag="span" />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <p className="sg01sel-cta-note">
                <GenericEditableText sectionId={sectionId} field="selectorCtaNote" value={selectorCtaNote} tag="span" />
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hero-signal-01-page — podstránkové hero (breadcrumb + claim) ──────────────
function HeroSignal01Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title      = String(content.title      ?? "Podstránka");
  const subtitle   = String(content.subtitle   ?? "");
  const breadcrumb = String(content.breadcrumb ?? "Domů");
  const breadHref  = String(content.breadcrumbHref ?? "/");
  return (
    <>
      <style>{`
        .sg01pb { position: relative; background: #101418; color: #fff;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); overflow: hidden; }
        .sg01pb-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: clamp(44px, 6vw, 76px) clamp(20px, 5vw, 48px); }
        .sg01pb-crumb { display: flex; align-items: center; gap: 8px; font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .78rem; color: rgba(255,255,255,.55); margin-bottom: 16px; }
        .sg01pb-crumb a { color: rgba(255,255,255,.55); text-decoration: none; transition: color .2s; }
        .sg01pb-crumb a:hover { color: #6EA8FE; }
        .sg01pb-crumb .cur { color: #fff; }
        .sg01pb-title { font-family: var(--font-heading, system-ui, sans-serif); color: #fff; font-size: clamp(2rem, 4.2vw, 3.1rem); font-weight: 600; letter-spacing: .01em; line-height: 1.06; margin: 0; }
        .sg01pb-sub { font-size: clamp(1rem, 1.35vw, 1.12rem); color: rgba(255,255,255,.72); max-width: 42em; margin: 14px 0 0; line-height: 1.6; }
        .sg01pb-rule { width: 56px; height: 3px; background: #2563EB; margin-top: 24px; }
      `}</style>
      <section className="sg01pb" data-template="signal-01">
        <div className="sg01pb-inner">
          <div className="sg01pb-crumb">
            <a href={sg01ResolveHref(breadHref, tenantSlug, isAdmin)}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden="true">/</span>
            <span className="cur">{title}</span>
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1" className="sg01pb-title" />
          {subtitle && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="sg01pb-sub" />}
          <div className="sg01pb-rule" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ STATS ═════════════════════════════════════════
STATS = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Bílý trust pás: velká Oswald čísla s count-up, vertikální hairline oddělovače,
// mono popisky; badges jako jeden inline řádek s modrými fajfkami pod linkou.
function StatsSignal01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const items = (content.items as Array<{ value?: string; label?: string }> | undefined) ?? [];
  const rawBadges = content.badges as string[] | undefined;
  const badges = rawBadges && rawBadges.length ? rawBadges : [];
  return (
    <>
      <style>{`
        .sg01st { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(40px,5vw,60px) clamp(20px,5vw,48px); border-bottom:1px solid var(--sg-border); }
        .sg01st-inner { max-width:1280px; margin:0 auto; }
        .sg01st-nums { display:grid; grid-template-columns:repeat(4,1fr); }
        .sg01st-num { padding:6px clamp(18px,3vw,40px); }
        .sg01st-num + .sg01st-num { border-left:1px solid var(--sg-border); }
        .sg01st-num:first-child { padding-left:0; }
        .sg01st-num b { display:block; font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2rem,3.6vw,3.1rem); font-weight:600; letter-spacing:0; line-height:1; color:var(--sg-ink); }
        .sg01st-num > span { display:block; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.8rem; color:var(--sg-muted); margin-top:9px; line-height:1.4; }
        .sg01st-num b span { font-size:inherit; }
        .sg01st-badges { display:flex; flex-wrap:wrap; align-items:center; gap:10px 22px; margin-top:clamp(22px,3vw,32px); padding-top:clamp(18px,2.5vw,24px); border-top:1px solid var(--sg-border); }
        .sg01st-chip { display:inline-flex; align-items:center; gap:8px; font-size:.88rem; font-weight:600; color:var(--sg-ink); }
        .sg01st-chip svg { color:var(--sg-accent); flex-shrink:0; }
        .sg01st-chip + .sg01st-chip::before { content:''; width:4px; height:4px; border-radius:50%; background:var(--sg-border); margin-right:16px; }
        @media (max-width:900px){ .sg01st-nums{ grid-template-columns:repeat(2,1fr); row-gap:22px; } .sg01st-num:nth-child(3){ border-left:none; padding-left:0; } }
        @media (max-width:480px){ .sg01st-nums{ grid-template-columns:1fr 1fr; } }
      `}</style>
      <section className="sg01st" data-template="signal-01">
        <div className="sg01st-inner">
          <div className="sg01st-nums">
            {items.map((it, i) => (
              <div key={i} className="sg01st-num">
                <b>
                  {isAdmin
                    ? <GenericEditableText sectionId={sectionId} field={`items.${i}.value`} value={String(it.value ?? "")} tag="span" />
                    : <Pf01CountUp value={String(it.value ?? "")} />}
                </b>
                <span><GenericEditableText sectionId={sectionId} field={`items.${i}.label`} value={String(it.label ?? "")} tag="span" /></span>
              </div>
            ))}
          </div>
          {badges.length > 0 && (
            <div className="sg01st-badges">
              {badges.map((b, i) => (
                <span key={i} className="sg01st-chip">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                  <GenericEditableText sectionId={sectionId} field={`badges.${i}`} value={b} tag="span" />
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ SERVICES + METHOD ═════════════════════════════
SERVICES = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Řešení: fotokarty na ledově šedém pozadí (16/10, hover scale, spodní gradient,
// mono index v rohu) + Metodika: číslované kroky na charcoal s hairline mřížkou.
function ServicesSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Řešení");
  const title   = String(content.title   ?? "Oblasti, ve kterých doručujeme čísla");
  const lead    = String(content.lead    ?? "Každé řešení má jasný rozsah, tým a metriku úspěchu, na které se dohodneme předem.");
  type SgSvc = { name?: string; description?: string; photo?: string; href?: string; tag?: string };
  const items = (content.items as SgSvc[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Zjistit více");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".sg01svc-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sg01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .sg01svc { --sg-accent:#2563EB; --sg-ink:#101418; --sg-text:#111827; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#F3F5F7; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-text);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01svc-inner { max-width:1280px; margin:0 auto; }
        .sg01svc-head { max-width:660px; margin-bottom:clamp(32px,5vw,56px); }
        .sg01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01svc-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01svc-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01svc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
        .sg01svc-card { position:relative; display:flex; flex-direction:column; background:#fff; border:1px solid var(--sg-border);
          border-radius:10px; text-decoration:none; color:inherit; overflow:hidden;
          opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), box-shadow .25s, border-color .25s; }
        .sg01svc-card.sg01-vis { opacity:1; transform:translateY(0); }
        .sg01svc-card.sg01-vis:hover { transform:translateY(-5px); box-shadow:0 14px 30px -18px rgba(16,20,24,.28); border-color:#CBD5E1;
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .sg01svc-photo { position:relative; aspect-ratio:16/10; overflow:hidden; background:#E4E8ED; }
        .sg01svc-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .sg01svc-card:hover .sg01svc-photo img { transform:scale(1.05); }
        .sg01svc-photo::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(13,17,22,.5)); }
        .sg01svc-num { position:absolute; left:16px; bottom:12px; z-index:1; color:#fff; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-weight:700; font-size:.78rem; letter-spacing:.14em; }
        .sg01svc-body { display:flex; flex-direction:column; gap:10px; padding:22px 24px 24px; flex:1; }
        .sg01svc-tag { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--sg-accent); }
        .sg01svc-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.2rem; font-weight:600; letter-spacing:.01em; margin:0; }
        .sg01svc-desc { font-size:.94rem; color:var(--sg-muted); line-height:1.55; margin:0; flex:1; }
        .sg01svc-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--sg-accent); margin-top:4px; }
        .sg01svc-more svg { transition:transform .25s; } .sg01svc-card:hover .sg01svc-more svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .sg01svc-card{ opacity:1; transform:none; transition:none; } .sg01svc-more svg,.sg01svc-photo img{ transition:none; } }
      `}</style>
      <section className="sg01svc" data-template="signal-01" id="reseni">
        <div className="sg01svc-inner">
          <div className="sg01svc-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01svc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01svc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01svc-grid" ref={gridRef}>
            {items.map((s, i) => (
              <a key={i} className="sg01svc-card" style={{ ["--i" as string]: i % 4 }} href={resolveDemoHref(String(s.href ?? "/reseni"), tenantSlug, isAdmin)}>
                <span className="sg01svc-photo" aria-hidden="true">
                  {s.photo && <img src={String(s.photo)} alt="" loading="lazy" />}
                  <span className="sg01svc-num">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="sg01svc-body">
                  <span className="sg01svc-tag"><GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={String(s.tag ?? "")} tag="span" /></span>
                  <h3 className="sg01svc-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(s.name ?? "")} tag="span" /></h3>
                  <p className="sg01svc-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
                  <span className="sg01svc-more">
                    <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MethodSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Metodika");
  const title   = String(content.title   ?? "Od diagnostiky k měřitelnému výsledku");
  const lead    = String(content.lead    ?? "Žádné nekonečné analýzy. Pevné fáze, pevné výstupy a metrika úspěchu dohodnutá předem.");
  const steps = (content.steps as Array<{ title?: string; description?: string; duration?: string }> | undefined) ?? [];
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".sg01mt-step"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sg01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);
  return (
    <>
      <style>{`
        .sg01mt { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; --sg-ink:#101418;
          background:var(--sg-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01mt-inner { max-width:1280px; margin:0 auto; }
        .sg01mt-head { max-width:660px; margin-bottom:clamp(36px,5vw,60px); }
        .sg01mt .sg01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent-lt); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01mt .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent-lt); }
        .sg01mt-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01mt-lead { font-size:1.05rem; color:rgba(255,255,255,.78); line-height:1.6; margin:0; }
        .sg01mt-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:1px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.12); border-radius:10px; overflow:hidden; }
        .sg01mt-step { background:var(--sg-ink); padding:34px 26px 30px; position:relative;
          opacity:0; transform:translateY(18px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), background .25s; }
        .sg01mt-step.sg01-vis { opacity:1; transform:translateY(0); }
        .sg01mt-step:hover { background:#161C24; }
        .sg01mt-step::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--sg-accent);
          transform:scaleX(0); transform-origin:left; transition:transform .6s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms + 250ms); }
        .sg01mt-step.sg01-vis::before { transform:scaleX(1); }
        .sg01mt-toprow { display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:18px; }
        .sg01mt-num { display:inline-flex; align-items:baseline; gap:8px; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-weight:700;
          font-size:1.7rem; line-height:1; color:var(--sg-accent-lt); }
        .sg01mt-num::after { content:''; width:26px; height:1px; background:rgba(110,168,254,.45); align-self:center; }
        .sg01mt-dur { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.72); }
        .sg01mt-step h3 { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:1.14rem; font-weight:600; margin:0 0 8px; letter-spacing:.01em; }
        .sg01mt-step p { font-size:.92rem; color:rgba(255,255,255,.78); line-height:1.58; margin:0; }
        @media (prefers-reduced-motion: reduce){ .sg01mt-step{ opacity:1; transform:none; transition:none; } .sg01mt-step::before{ transform:scaleX(1); transition:none; } }
      `}</style>
      <section className="sg01mt" data-template="signal-01" id="metodika">
        <div className="sg01mt-inner">
          <div className="sg01mt-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01mt-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01mt-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01mt-grid" ref={gridRef}>
            {steps.map((s, i) => (
              <div key={i} className="sg01mt-step" style={{ ["--i" as string]: i }}>
                <div className="sg01mt-toprow">
                  <span className="sg01mt-num">{String(i + 1).padStart(2, "0")}</span>
                  {s.duration && (
                    <span className="sg01mt-dur">
                      <GenericEditableText sectionId={sectionId} field={`steps.${i}.duration`} value={String(s.duration ?? "")} tag="span" />
                    </span>
                  )}
                </div>
                <h3><GenericEditableText sectionId={sectionId} field={`steps.${i}.title`} value={String(s.title ?? "")} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field={`steps.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ CASES (gallery) ═══════════════════════════════
CASES = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Case studies: fotokarty s velkou metrikou (Oswald, electric blue), industry mono
// štítkem a odkazem na CMS detail /case-studies/<slug>.
function CasesSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Case studies");
  const title   = String(content.title   ?? "Výsledky, které si můžete přeměřit");
  const lead    = String(content.lead    ?? "Každý projekt končí číslem, ne prezentací. Vybrané case studies s měřitelným dopadem.");
  type SgCase = { slug?: string; title?: string; excerpt?: string; body?: string; metric?: string; metricLabel?: string; industry?: string; photo?: string; client?: string };
  const items = (content.items as SgCase[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Celá case study");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".sg01cs-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("sg01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .sg01cs { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01cs-inner { max-width:1280px; margin:0 auto; }
        .sg01cs-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01cs .sg01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01cs .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01cs-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01cs-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01cs-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:18px; }
        .sg01cs-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--sg-border); border-radius:10px; overflow:hidden;
          text-decoration:none; color:inherit; opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 80ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 80ms), box-shadow .25s, border-color .25s; }
        .sg01cs-card.sg01-vis { opacity:1; transform:translateY(0); }
        .sg01cs-card.sg01-vis:hover { transform:translateY(-5px); box-shadow:0 14px 30px -18px rgba(16,20,24,.28); border-color:#CBD5E1;
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .sg01cs-photo { position:relative; aspect-ratio:16/10; overflow:hidden; background:#E4E8ED; }
        .sg01cs-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .sg01cs-card:hover .sg01cs-photo img { transform:scale(1.05); }
        .sg01cs-photo::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(13,17,22,.5)); }
        .sg01cs-ind { position:absolute; left:14px; top:14px; z-index:1; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.7rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          color:#fff; background:rgba(13,17,22,.72); padding:5px 10px; border-radius:4px; backdrop-filter:blur(6px); }
        .sg01cs-body { display:flex; flex-direction:column; gap:8px; padding:22px 24px 24px; flex:1; }
        .sg01cs-metric { display:flex; align-items:baseline; gap:10px; padding-bottom:12px; border-bottom:1px solid var(--sg-border); margin-bottom:6px; }
        .sg01cs-metric > b { font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(1.9rem,2.4vw,2.4rem); font-weight:600; line-height:1; color:var(--sg-accent); font-variant-numeric:tabular-nums; white-space:nowrap; }
        .sg01cs-metric b span { font-size:inherit; }
        .sg01cs-metric > span { font-size:.84rem; color:var(--sg-muted); font-weight:600; line-height:1.35; }
        .sg01cs-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.18rem; font-weight:600; letter-spacing:.01em; margin:0; }
        .sg01cs-excerpt { font-size:.93rem; color:var(--sg-muted); line-height:1.55; margin:0; flex:1; }
        .sg01cs-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--sg-accent); margin-top:6px; }
        .sg01cs-more svg { transition:transform .25s; } .sg01cs-card:hover .sg01cs-more svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .sg01cs-card{ opacity:1; transform:none; transition:none; } .sg01cs-more svg,.sg01cs-photo img{ transition:none; } }
      `}</style>
      <section className="sg01cs" data-template="signal-01" id="case-studies">
        <div className="sg01cs-inner">
          <div className="sg01cs-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01cs-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01cs-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01cs-grid" ref={gridRef}>
            {items.map((c, i) => {
              const href = isAdmin ? "#" : c.slug && tenantSlug ? `/demo/${tenantSlug}/case-studies/${c.slug}` : "#";
              return (
                <a key={i} className="sg01cs-card" style={{ ["--i" as string]: i % 3 }} href={href}>
                  <span className="sg01cs-photo" aria-hidden="true">
                    {c.photo && <img src={String(c.photo)} alt="" loading="lazy" />}
                    {c.industry && (
                      <span className="sg01cs-ind">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.industry`} value={String(c.industry ?? "")} tag="span" />
                      </span>
                    )}
                  </span>
                  <span className="sg01cs-body">
                    <span className="sg01cs-metric">
                      <b><GenericEditableText sectionId={sectionId} field={`items.${i}.metric`} value={String(c.metric ?? "")} tag="span" /></b>
                      <span><GenericEditableText sectionId={sectionId} field={`items.${i}.metricLabel`} value={String(c.metricLabel ?? "")} tag="span" /></span>
                    </span>
                    <h3 className="sg01cs-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(c.title ?? "")} tag="span" /></h3>
                    <p className="sg01cs-excerpt"><GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={String(c.excerpt ?? "")} tag="span" /></p>
                    <span className="sg01cs-more">
                      <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ TEAM ══════════════════════════════════════════
TEAM = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Tým: portrétní karty 4/5, jméno Oswald, mono role, krátké bio. Ledové pozadí.
function TeamSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Tým");
  const title   = String(content.title   ?? "Senioři, kteří už firmy vedli");
  const lead    = String(content.lead    ?? "Žádní junioři na fakturaci. Na projektu pracují lidé, kteří mají výsledky za sebou.");
  type SgMember = { name?: string; role?: string; bio?: string; image?: string };
  const members = (content.members as SgMember[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .sg01tm { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#F3F5F7; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01tm-inner { max-width:1180px; margin:0 auto; }
        .sg01tm-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01tm .sg01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01tm .sg01-eyebrow::before { content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01tm-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01tm-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01tm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:18px; }
        .sg01tm-card { background:#fff; border:1px solid var(--sg-border); border-radius:10px; overflow:hidden; transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .sg01tm-card:hover { transform:translateY(-4px); box-shadow:0 12px 28px -18px rgba(16,20,24,.25); }
        .sg01tm-photo { position:relative; aspect-ratio:4/5; overflow:hidden; background:#E4E8ED; }
        .sg01tm-photoslot { position:absolute; inset:0; width:100%; height:100%; display:block; }
        .sg01tm-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .sg01tm-card:hover .sg01tm-photo img { transform:scale(1.04); }
        .sg01tm-body { padding:20px 22px 22px; }
        .sg01tm-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.12rem; font-weight:600; letter-spacing:.01em; margin:0 0 4px; }
        .sg01tm-role { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 10px; }
        .sg01tm-bio { font-size:.9rem; color:var(--sg-muted); line-height:1.55; margin:0; }
        @media (prefers-reduced-motion: reduce){ .sg01tm-card,.sg01tm-photo img{ transition:none; } }
      `}</style>
      <section className="sg01tm" data-template="signal-01" id="tym">
        <div className="sg01tm-inner">
          <div className="sg01tm-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01tm-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01tm-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01tm-grid">
            {members.map((m, i) => (
              <div key={i} className="sg01tm-card">
                <div className="sg01tm-photo">
                  <GenericEditableImage sectionId={sectionId} field={`members.${i}.image`} src={String(m.image ?? "")} alt={String(m.name ?? "")} className="sg01tm-photoslot">
                    {m.image && <img src={String(m.image)} alt={String(m.name ?? "")} loading="lazy" />}
                  </GenericEditableImage>
                </div>
                <div className="sg01tm-body">
                  <h3 className="sg01tm-name"><GenericEditableText sectionId={sectionId} field={`members.${i}.name`} value={String(m.name ?? "")} tag="span" /></h3>
                  <p className="sg01tm-role"><GenericEditableText sectionId={sectionId} field={`members.${i}.role`} value={String(m.role ?? "")} tag="span" /></p>
                  <p className="sg01tm-bio"><GenericEditableText sectionId={sectionId} field={`members.${i}.bio`} value={String(m.bio ?? "")} tag="span" /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ TESTIMONIALS ══════════════════════════════════
TESTIMONIALS = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Reference: featured layout — první citace na charcoal, ostatní bílé hairline karty.
function TestimonialsSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title   ?? "Co říkají klienti");
  const lead    = String(content.lead    ?? "Reference od lidí, kteří odpovídají za výsledek — jednatelé, CFO a ředitelé.");
  type T = { text?: string; quote?: string; name?: string; role?: string; rating?: number };
  const items = (content.testimonials as T[] | undefined) ?? (content.items as T[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .sg01ts { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01ts-inner { max-width:1180px; margin:0 auto; }
        .sg01ts-head { max-width:660px; margin-bottom:clamp(32px,5vw,52px); }
        .sg01ts .sg01-eyebrow{ font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01ts .sg01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--sg-accent); }
        .sg01ts-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:600; letter-spacing:.01em; line-height:1.08; margin:0 0 14px; }
        .sg01ts-lead { font-size:1.05rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01ts-grid { display:grid; grid-template-columns:1.15fr 1fr; gap:18px; }
        .sg01ts-card { display:flex; flex-direction:column; background:#fff; border:1px solid var(--sg-border); border-radius:10px; padding:28px;
          transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .sg01ts-card:hover { transform:translateY(-4px); box-shadow:0 10px 24px -16px rgba(16,20,24,.22); }
        .sg01ts-card:first-child { grid-row:span 2; background:var(--sg-ink); border-color:var(--sg-ink); color:#fff; justify-content:center; padding:36px 32px; }
        .sg01ts-card:first-child .sg01ts-quote { font-weight:600; font-size:1.28rem; line-height:1.55; }
        .sg01ts-card:first-child .sg01ts-role { color:rgba(255,255,255,.72); }
        .sg01ts-card:first-child .sg01ts-av { background:var(--sg-accent); }
        .sg01ts-stars { display:flex; gap:3px; margin-bottom:16px; color:var(--sg-accent); }
        .sg01ts-card:first-child .sg01ts-stars { color:var(--sg-accent-lt); }
        .sg01ts-quote { font-size:1.02rem; line-height:1.6; margin:0 0 22px; flex:none; }
        .sg01ts-quote::before { content:'\\201C'; color:var(--sg-accent); font-size:2rem; line-height:0; vertical-align:-.35em; margin-right:4px; }
        .sg01ts-card:first-child .sg01ts-quote::before { color:var(--sg-accent-lt); }
        .sg01ts-meta { display:flex; align-items:center; gap:12px; }
        .sg01ts-av { width:44px; height:44px; border-radius:50%; background:var(--sg-ink); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; }
        .sg01ts-name { font-weight:800; font-size:.96rem; }
        .sg01ts-role { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; color:var(--sg-muted); }
        @media (max-width:820px){ .sg01ts-grid{ grid-template-columns:1fr; } .sg01ts-card:first-child{ grid-row:auto; } }
        @media (prefers-reduced-motion: reduce){ .sg01ts-card{ transition:none; } }
      `}</style>
      <section className="sg01ts" data-template="signal-01" id="reference">
        <div className="sg01ts-inner">
          <div className="sg01ts-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01ts-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01ts-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01ts-grid">
            {items.map((t, i) => {
              const rating = Math.max(1, Math.min(5, Number(t.rating ?? 5)));
              const name = String(t.name ?? "");
              return (
                <figure key={i} className="sg01ts-card" style={{ margin: 0 }}>
                  <div className="sg01ts-stars" role="img" aria-label={`Hodnocení ${rating} z 5`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <svg key={si} width="16" height="16" viewBox="0 0 24 24" fill={si < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <blockquote className="sg01ts-quote" style={{ margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={String(t.text ?? t.quote ?? "")} tag="span" />
                  </blockquote>
                  <figcaption className="sg01ts-meta">
                    <span className="sg01ts-av" aria-hidden="true">{name.charAt(0) || "?"}</span>
                    <span>
                      <span className="sg01ts-name" style={{ display: "block" }}><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={name} tag="span" /></span>
                      <span className="sg01ts-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={String(t.role ?? "")} tag="span" /></span>
                    </span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ FAQ ═══════════════════════════════════════════
FAQ = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// FAQ: centrovaný úzký sloupec, hairline accordion, kruhový toggle, CTA na #konzultace.
function FaqSignal01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Časté dotazy");
  const title   = String(content.title   ?? "Na co se klienti ptají před spoluprací");
  const lead    = String(content.lead    ?? "Nenašli jste odpověď? Rezervujte si 30 minut — první konzultace je zdarma.");
  const ctaText = String(content.ctaText ?? "Rezervovat konzultaci");
  const ctaHref = String(content.ctaHref ?? "#konzultace");
  const faq = (
    (content as { items?: FaqItem[] }).items ??
    ((content as { faq?: Array<{ question?: string; answer?: string }> }).faq ?? []).map(
      (i) => ({ question: i.question ?? "", answer: i.answer ?? "" })
    )
  );
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <style>{`
        .sg01fq { --sg-accent:#2563EB; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--sg-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01fq-inner { max-width:760px; margin:0 auto; }
        .sg01fq-head { text-align:center; margin-bottom:clamp(28px,4vw,44px); }
        .sg01fq .sg01-eyebrow{ font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01fq-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:clamp(1.7rem,3.2vw,2.5rem); font-weight:600; letter-spacing:.01em; line-height:1.1; margin:0 0 12px; }
        .sg01fq-lead { font-size:1rem; color:var(--sg-muted); line-height:1.6; margin:0; }
        .sg01fq-list { border-top:1px solid var(--sg-border); }
        .sg01fq-item { border-bottom:1px solid var(--sg-border); }
        .sg01fq-q { width:100%; display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px 2px; background:none; border:none; cursor:pointer; text-align:left; font-family:inherit; color:var(--sg-ink); }
        .sg01fq-q-text { font-size:1.02rem; font-weight:700; line-height:1.4; transition:color .2s; }
        .sg01fq-q:hover .sg01fq-q-text { color:var(--sg-accent); }
        .sg01fq-tog { flex-shrink:0; width:28px; height:28px; border-radius:50%; border:1.5px solid var(--sg-border); color:var(--sg-ink); display:flex; align-items:center; justify-content:center; transition:background .2s, color .2s, border-color .2s, transform .3s; }
        .sg01fq-item[data-open="true"] .sg01fq-tog { background:var(--sg-accent); border-color:var(--sg-accent); color:#fff; transform:rotate(45deg); }
        .sg01fq-a { display:grid; grid-template-rows:0fr; transition:grid-template-rows .32s cubic-bezier(.22,.68,0,1); }
        .sg01fq-item[data-open="true"] .sg01fq-a { grid-template-rows:1fr; }
        .sg01fq-a-inner { overflow:hidden; }
        .sg01fq-a-inner p { margin:0; padding:0 40px 20px 2px; font-size:.96rem; color:var(--sg-muted); line-height:1.7; }
        .sg01fq-cta { display:flex; justify-content:center; margin-top:clamp(24px,3vw,36px); }
        .sg01fq-cta a { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:var(--sg-accent); color:#fff; font-weight:700; font-size:.95rem; text-decoration:none; border-radius:6px; transition:transform .2s, box-shadow .2s; }
        .sg01fq-cta a:hover { transform:translateY(-1px); box-shadow:0 12px 26px -12px rgba(37,99,235,.6); }
        .sg01fq-cta svg { transition:transform .25s; }
        .sg01fq-cta a:hover svg { transform:translateY(2px); }
        @media (prefers-reduced-motion: reduce){ .sg01fq-a,.sg01fq-tog,.sg01fq-cta a{ transition:none; } }
      `}</style>
      <section className="sg01fq" data-template="signal-01" id="faq">
        <div className="sg01fq-inner">
          <div className="sg01fq-head">
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01fq-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="sg01fq-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="sg01fq-list">
            {faq.map((item, i) => (
              <div key={i} className="sg01fq-item" data-open={open === i}>
                <button type="button" className="sg01fq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  <span className="sg01fq-q-text"><GenericEditableText sectionId={sectionId} field={`items.${i}.question`} value={item.question} tag="span" /></span>
                  <span className="sg01fq-tog" aria-hidden="true">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div className="sg01fq-a">
                  <div className="sg01fq-a-inner">
                    <p><GenericEditableText sectionId={sectionId} field={`items.${i}.answer`} value={item.answer} tag="span" /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sg01fq-cta">
            <a href={ctaHref}>
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ CONTACT ═══════════════════════════════════════
CONTACT = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Konzultace: charcoal panel s info řádky + bílá karta s formulářem (jméno,
// společnost, e-mail, telefon, select Co řešíte, zpráva, GDPR, honeypot).
function ContactSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow  = String(content.eyebrow  ?? "Konzultace");
  const heading  = String(content.heading  ?? "Rezervujte si 30 minut s partnerem");
  const subheading = String(content.subheading ?? "Popíšete situaci, my řekneme, jak bychom postupovali a co by to přineslo. Prvních 30 minut zdarma a bez závazku.");
  const phone    = String(content.phone    ?? "+420 704 123 456");
  const email    = String(content.email    ?? "poptavka@demo.cz");
  const address  = String(content.address  ?? "Ukázková 123, 110 00 Praha 1");
  const hours    = String(content.hours    ?? "Po–Pá 9:00–18:00");
  const icoLabel = String(content.icoLabel ?? "Fakturační údaje");
  const ico      = String(content.ico ?? "IČO 12345678 · vedeno u MS v Praze");
  const formTitle = String(content.formTitle ?? "Nezávazná konzultace");
  const nameLabel = String(content.nameLabel ?? "Jméno a příjmení");
  const companyLabel = String(content.companyLabel ?? "Společnost");
  const phoneLabel = String(content.phoneLabel ?? "Telefon");
  const emailLabel = String(content.emailLabel ?? "Pracovní e-mail");
  const topicLabel = String(content.topicLabel ?? "Co řešíte");
  const rawTopics = content.topics as string[] | undefined;
  const topics = rawTopics && rawTopics.length ? rawTopics : ["Strategie a růst", "Finance a controlling", "Compliance a právo", "Procesy a provoz", "Jiné"];
  const messageLabel = String(content.messageLabel ?? "Stručně popište situaci");
  const consentLabel = String(content.consentLabel ?? "Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.");
  const submitLabel = String(content.submitLabel ?? "Rezervovat konzultaci");
  const successTitle = String(content.successTitle ?? "Děkujeme, poptávka odešla.");
  const successBody  = String(content.successBody ?? "Do 24 hodin se ozve partner odpovědný za vaši oblast a domluvíte si termín konzultace.");

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email2, setEmail2] = useState("");
  const [phone2, setPhone2] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAdmin) return;
    if (honeypot) return;
    if (!consent) { setErrorMsg("Pro odeslání potvrďte souhlas se zpracováním údajů."); setStatus("error"); return; }
    if (!message.trim()) { setErrorMsg("Popište prosím stručně, co řešíte."); setStatus("error"); return; }
    if (!tenantSlug) { setStatus("success"); return; }
    setStatus("sending");
    setErrorMsg("");
    const composed = [
      topic ? `Co řešíme: ${topic}` : "",
      company ? `Společnost: ${company}` : "",
      "",
      message,
    ].filter((l, i) => l !== "" || i === 2).join("\n");
    try {
      const res = await fetch(`/api/demo/${tenantSlug}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email2, phone: phone2, message: composed, website: honeypot }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setErrorMsg(json.error ?? "Nepodařilo se odeslat poptávku."); setStatus("error"); }
      else { setStatus("success"); setName(""); setCompany(""); setEmail2(""); setPhone2(""); setTopic(""); setMessage(""); setConsent(false); }
    } catch {
      setErrorMsg("Nepodařilo se odeslat poptávku. Zkuste to znovu, nebo nám zavolejte.");
      setStatus("error");
    }
  }

  const infoRows: Array<{ icon: React.ReactNode; label: string; value: string; href?: string }> = [
    { label: "Telefon", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/> },
    { label: "E-mail", value: email, href: `mailto:${email}`, icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></> },
    { label: "Kancelář", value: address, icon: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></> },
    { label: "K zastižení", value: hours, icon: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></> },
  ];

  return (
    <>
      <style>{`
        .sg01ct { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; --sg-ink:#101418; --sg-muted:#5B6472; --sg-border:#E3E7EB;
          background:var(--sg-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .sg01ct-inner { max-width:1180px; margin:0 auto; display:grid; grid-template-columns:0.9fr 1.1fr; gap:clamp(32px,5vw,64px); align-items:start; }
        .sg01ct .sg01-eyebrow{ font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--sg-accent-lt); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .sg01ct .sg01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--sg-accent-lt); }
        .sg01ct-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.8rem,3.4vw,2.6rem); font-weight:600; letter-spacing:.01em; line-height:1.1; margin:0 0 14px; }
        .sg01ct-sub { font-size:1.02rem; color:rgba(255,255,255,.8); line-height:1.6; margin:0 0 30px; }
        .sg01ct-info { display:grid; gap:16px; margin-bottom:26px; }
        .sg01ct-row { display:flex; align-items:flex-start; gap:14px; }
        .sg01ct-row-ic { width:42px; height:42px; border-radius:6px; background:rgba(37,99,235,.2); color:var(--sg-accent-lt); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sg01ct-row-lbl { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.72); }
        .sg01ct-row-val { font-weight:700; color:#fff; text-decoration:none; }
        a.sg01ct-row-val:hover { color:var(--sg-accent-lt); }
        .sg01ct-ico { border-top:1px solid rgba(255,255,255,.12); padding-top:20px; }
        .sg01ct-ico-lbl { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:rgba(255,255,255,.72); margin:0 0 6px; }
        .sg01ct-ico-val { font-weight:700; }
        .sg01ct-card { background:#fff; border-radius:12px; padding:clamp(24px,3vw,36px); color:var(--sg-ink); box-shadow:0 14px 40px -22px rgba(0,0,0,.35); }
        .sg01ct-card-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.22rem; font-weight:600; letter-spacing:.01em; margin:0 0 20px; }
        .sg01ct-field { margin-bottom:16px; }
        .sg01ct-field label { display:block; font-size:.82rem; font-weight:700; color:var(--sg-ink); margin-bottom:6px; }
        .sg01ct-field input, .sg01ct-field textarea, .sg01ct-field select { width:100%; padding:12px 14px; border:1.5px solid var(--sg-border); border-radius:8px; font-family:inherit; font-size:.96rem; color:var(--sg-ink); background:#fff; transition:border-color .18s, box-shadow .18s; }
        .sg01ct-field input:focus, .sg01ct-field textarea:focus, .sg01ct-field select:focus { outline:none; border-color:var(--sg-accent); box-shadow:0 0 0 3px rgba(37,99,235,.15); }
        .sg01ct-field textarea { min-height:110px; resize:vertical; }
        .sg01ct-field select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235B6472' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; }
        .sg01ct-2col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .sg01ct-consent { display:flex; align-items:flex-start; gap:9px; font-size:.85rem; color:var(--sg-muted); line-height:1.45; margin:4px 0 18px; }
        .sg01ct-consent input { margin-top:3px; accent-color:var(--sg-accent); flex-shrink:0; }
        .sg01ct-submit { width:100%; display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:15px; background:var(--sg-accent); color:#fff; font-weight:700; font-size:1rem; border:none; border-radius:6px; cursor:pointer; font-family:inherit; transition:transform .2s, box-shadow .2s, filter .2s; }
        .sg01ct-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 14px 28px -12px rgba(37,99,235,.7); }
        .sg01ct-submit:disabled { opacity:.6; cursor:not-allowed; }
        .sg01ct-err { background:#fdecea; color:#b3261e; border:1px solid #f5c6c2; border-radius:8px; padding:11px 14px; font-size:.88rem; margin-bottom:14px; }
        .sg01ct-hp { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
        .sg01ct-success { text-align:center; padding:24px 8px; }
        .sg01ct-success-ic { width:64px; height:64px; border-radius:50%; background:rgba(37,99,235,.12); color:var(--sg-accent); display:flex; align-items:center; justify-content:center; margin:0 auto 18px; }
        .sg01ct-success h3 { font-family:var(--font-heading, system-ui, sans-serif); color:var(--sg-ink); font-size:1.35rem; font-weight:600; margin:0 0 8px; }
        .sg01ct-success p { color:var(--sg-muted); line-height:1.6; margin:0; }
        @media (max-width:820px){ .sg01ct-inner{ grid-template-columns:1fr; } .sg01ct-2col{ grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce){ .sg01ct-submit,.sg01ct-field input,.sg01ct-field textarea{ transition:none; } }
      `}</style>
      <section className="sg01ct" data-template="signal-01" id="konzultace">
        <div className="sg01ct-inner">
          <div>
            <p className="sg01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="sg01ct-title"><GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" /></h2>
            <p className="sg01ct-sub"><GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></p>
            <div className="sg01ct-info">
              {infoRows.map((r, i) => (
                <div key={i} className="sg01ct-row">
                  <span className="sg01ct-row-ic">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{r.icon}</svg>
                  </span>
                  <span>
                    <span className="sg01ct-row-lbl" style={{ display: "block" }}>{r.label}</span>
                    {r.href
                      ? <a href={r.href} className="sg01ct-row-val">{r.value}</a>
                      : <span className="sg01ct-row-val">{r.value}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="sg01ct-ico">
              <p className="sg01ct-ico-lbl"><GenericEditableText sectionId={sectionId} field="icoLabel" value={icoLabel} tag="span" /></p>
              <p className="sg01ct-ico-val" style={{ margin: 0 }}><GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></p>
            </div>
          </div>

          <div className="sg01ct-card">
            {status === "success" ? (
              <div className="sg01ct-success" role="status" aria-live="polite">
                <span className="sg01ct-success-ic">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                </span>
                <h3><GenericEditableText sectionId={sectionId} field="successTitle" value={successTitle} tag="span" /></h3>
                <p><GenericEditableText sectionId={sectionId} field="successBody" value={successBody} tag="span" /></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="sg01ct-card-title"><GenericEditableText sectionId={sectionId} field="formTitle" value={formTitle} tag="span" /></h3>
                {status === "error" && <div className="sg01ct-err" role="alert">{errorMsg}</div>}
                <div className="sg01ct-2col">
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-name-${sectionId}`}><GenericEditableText sectionId={sectionId} field="nameLabel" value={nameLabel} tag="span" /></label>
                    <input id={`sg01-name-${sectionId}`} type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                  </div>
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-company-${sectionId}`}><GenericEditableText sectionId={sectionId} field="companyLabel" value={companyLabel} tag="span" /></label>
                    <input id={`sg01-company-${sectionId}`} type="text" name="company" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
                  </div>
                </div>
                <div className="sg01ct-2col">
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-email-${sectionId}`}><GenericEditableText sectionId={sectionId} field="emailLabel" value={emailLabel} tag="span" /></label>
                    <input id={`sg01-email-${sectionId}`} type="email" name="email" value={email2} onChange={(e) => setEmail2(e.target.value)} required autoComplete="email" />
                  </div>
                  <div className="sg01ct-field">
                    <label htmlFor={`sg01-phone-${sectionId}`}><GenericEditableText sectionId={sectionId} field="phoneLabel" value={phoneLabel} tag="span" /></label>
                    <input id={`sg01-phone-${sectionId}`} type="tel" name="phone" value={phone2} onChange={(e) => setPhone2(e.target.value)} autoComplete="tel" />
                  </div>
                </div>
                <div className="sg01ct-field">
                  <label htmlFor={`sg01-topic-${sectionId}`}><GenericEditableText sectionId={sectionId} field="topicLabel" value={topicLabel} tag="span" /></label>
                  <select id={`sg01-topic-${sectionId}`} name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="">— Vyberte oblast —</option>
                    {topics.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="sg01ct-field">
                  <label htmlFor={`sg01-msg-${sectionId}`}><GenericEditableText sectionId={sectionId} field="messageLabel" value={messageLabel} tag="span" /></label>
                  <textarea id={`sg01-msg-${sectionId}`} name="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <div className="sg01ct-hp" aria-hidden="true">
                  <label>Web<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
                </div>
                <label className="sg01ct-consent">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <GenericEditableText sectionId={sectionId} field="consentLabel" value={consentLabel} tag="span" />
                </label>
                <button type="submit" className="sg01ct-submit" disabled={status === "sending" || isAdmin}>
                  {status === "sending" ? "Odesílám…" : <GenericEditableText sectionId={sectionId} field="submitLabel" value={submitLabel} tag="span" />}
                  {status !== "sending" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ FOOTER ════════════════════════════════════════
FOOTER = r'''
// ══ SIGNAL — Swiss authority (signal-01) ══════════════════════════════════════
// Footer: tmavší charcoal (#0B0F14), brand + tagline + social, Navigace / Kontakt /
// Odvětví chipy; spodní řádek copyright + legal + WeberoCredit.
function FooterSignal01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteName = String(content.siteName ?? "Ukázka Consulting");
  const logoUrl  = String(content.logoUrl ?? "");
  const tagline  = String(content.tagline ?? "Consulting pro měřitelné výsledky. Strategie, finance, compliance a provoz pro střední a větší firmy.");
  const email    = String(content.email ?? "poptavka@demo.cz");
  const phone    = String(content.phone ?? "+420 704 123 456");
  const address  = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const ico      = String(content.ico ?? "12345678");
  const indTitle = String(content.industriesTitle ?? "Odvětví");
  const industries = (content.industries as string[] | undefined) ?? [];
  const navColTitle = String(content.navColTitle ?? "Navigace");
  const contactColTitle = String(content.contactColTitle ?? "Kontakt");
  const links = (content.links as Array<{ label: string; href: string }> | undefined) ?? [];
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }> | undefined) ?? [];
  const socials = (content.socials as Array<{ icon: string; href: string; label?: string }> | undefined) ?? [];
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const resolve = (href: string) => (isAdmin ? "#" : (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) ? href : tenantSlug ? `/demo/${tenantSlug}${href.startsWith("/") ? href : "/" + href}` : href);

  return (
    <>
      <style>{`
        .sg01ft { --sg-accent:#2563EB; --sg-accent-lt:#6EA8FE; background:#0B0F14; color:#fff;
          font-family:var(--font-body, system-ui, sans-serif);
          padding:clamp(48px,7vw,80px) clamp(20px,5vw,48px) 28px; }
        .sg01ft-inner { max-width:1280px; margin:0 auto; }
        .sg01ft-grid { display:grid; grid-template-columns:1.6fr 1fr 1fr 1.2fr; gap:clamp(28px,4vw,56px); padding-bottom:40px; border-bottom:1px solid rgba(255,255,255,.1); }
        .sg01ft-brand-name { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:1.25rem; font-weight:600; letter-spacing:.02em; margin:0 0 12px; display:flex; align-items:center; gap:10px; }
        .sg01ft-brand-name img { height:28px; width:auto; }
        .sg01ft-tag { font-size:.94rem; color:rgba(255,255,255,.78); line-height:1.6; max-width:32em; margin:0; }
        .sg01ft-col-t { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.66); margin:0 0 16px; }
        .sg01ft-col a, .sg01ft-col li { color:rgba(255,255,255,.72); text-decoration:none; font-size:.94rem; line-height:2; display:block; }
        .sg01ft-col a:hover { color:var(--sg-accent-lt); }
        .sg01ft-col ul { list-style:none; padding:0; margin:0; }
        .sg01ft-inds { display:flex; flex-wrap:wrap; gap:7px; }
        .sg01ft-ind-chip { font-size:.82rem; color:rgba(255,255,255,.72); background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:4px; padding:5px 11px; }
        .sg01ft-bottom { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; padding-top:24px; }
        .sg01ft-legal { display:flex; gap:18px; flex-wrap:wrap; }
        .sg01ft-legal a { color:rgba(255,255,255,.72); text-decoration:none; font-size:.84rem; }
        .sg01ft-legal a:hover { color:#fff; }
        .sg01ft-copy { font-size:.84rem; color:rgba(255,255,255,.72); }
        .sg01ft-social { display:flex; gap:9px; margin-top:16px; }
        .sg01ft-social a { width:36px; height:36px; border-radius:6px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); display:flex; align-items:center; justify-content:center; color:#fff; transition:background .2s, border-color .2s; }
        .sg01ft-social a:hover { background:var(--sg-accent); border-color:var(--sg-accent); }
        .sg01ft-credit { margin-top:22px; padding-top:16px; border-top:1px solid rgba(255,255,255,.08); display:flex; justify-content:center; opacity:.75; }
        @media (max-width:900px){ .sg01ft-grid{ grid-template-columns:1fr 1fr; } }
        @media (max-width:560px){ .sg01ft-grid{ grid-template-columns:1fr; } }
      `}</style>
      <footer className="sg01ft" data-template="signal-01">
        <div className="sg01ft-inner">
          <div className="sg01ft-grid">
            <div className="sg01ft-brand">
              <div className="sg01ft-brand-name">
                {logoUrl && <img src={logoUrl} alt={siteName} />}
              </div>
              <p className="sg01ft-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>
              {socials.length > 0 && (
                <div className="sg01ft-social">
                  {socials.map((s, i) => (
                    <a key={i} href={s.href} aria-label={s.label ?? s.icon} target="_blank" rel="noopener noreferrer">
                      <Es06SocialIcon kind={s.icon} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="sg01ft-col">
              <p className="sg01ft-col-t"><GenericEditableText sectionId={sectionId} field="navColTitle" value={navColTitle} tag="span" /></p>
              <ul>
                {links.map((l, i) => (
                  <li key={i}><a href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a></li>
                ))}
              </ul>
            </div>

            <div className="sg01ft-col">
              <p className="sg01ft-col-t"><GenericEditableText sectionId={sectionId} field="contactColTitle" value={contactColTitle} tag="span" /></p>
              <ul>
                <li><a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></li>
                <li><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></li>
                <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>
                <li style={{ color: "rgba(255,255,255,.4)" }}>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></li>
              </ul>
            </div>

            <div className="sg01ft-col">
              <p className="sg01ft-col-t"><GenericEditableText sectionId={sectionId} field="industriesTitle" value={indTitle} tag="span" /></p>
              <div className="sg01ft-inds">
                {industries.map((a, i) => (
                  <span key={i} className="sg01ft-ind-chip"><GenericEditableText sectionId={sectionId} field={`industries.${i}`} value={a} tag="span" /></span>
                ))}
              </div>
            </div>
          </div>

          <div className="sg01ft-bottom">
            <span className="sg01ft-copy"><GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" /></span>
            <div className="sg01ft-legal">
              {legalLinks.map((l, i) => (
                <a key={i} href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" /></a>
              ))}
            </div>
          </div>
          <div className="sg01ft-credit"><WeberoCredit /></div>
        </div>
      </footer>
    </>
  );
}
'''


# ═════════════════════════════ RUN ═══════════════════════════════════════════

rebuild("src/components/sections/NavbarSection.tsx", NAVBAR, [(
    '  if (props.variant === "proof-01-navbar") return <NavbarProof01 {...props} />;',
    '  if (props.variant === "signal-01-navbar") return <NavbarSignal01 {...props} />;',
)])

rebuild("src/components/sections/HeroSection.tsx", HERO, [
    ('  if (variant === "proof-01-hero") return',
     '  if (variant === "signal-01-hero") return <HeroSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
     '  if (variant === "hero-signal-01-page") return <HeroSignal01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'),
])

rebuild("src/components/sections/StatsSection.tsx", STATS, [(
    '  if (variant === "proof-01-stats") return',
    '  if (variant === "signal-01-stats") return <StatsSignal01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;',
)])

rebuild("src/components/sections/ServicesSection.tsx", SERVICES, [
    ('  if (variant === "proof-01-services") return',
     '  if (variant === "signal-01-services") return <ServicesSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
     '  if (variant === "signal-01-method")   return <MethodSignal01 content={content} sectionId={sectionId} />;'),
])

rebuild("src/components/sections/GallerySection.tsx", CASES, [(
    '  if (variant === "proof-01-beforeafter") return',
    '  if (variant === "signal-01-cases") return <CasesSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
)])

rebuild("src/components/sections/TeamSection.tsx", TEAM, [(
    '  if (variant === "legal-02-team")',
    '  if (variant === "signal-01-team")  return <TeamSignal01 content={content} sectionId={sectionId} />;',
)])

rebuild("src/components/sections/TestimonialsSection.tsx", TESTIMONIALS, [(
    '  if (variant === "proof-01-testimonials") return',
    '  if (variant === "signal-01-testimonials") return <TestimonialsSignal01 content={content} sectionId={sectionId} />;',
)])

rebuild("src/components/sections/FaqSection.tsx", FAQ, [(
    '  if (variant === "proof-01-faq")',
    '  if (variant === "signal-01-faq")    return <FaqSignal01 content={content} sectionId={sectionId} />;',
)])

rebuild("src/components/sections/ContactSection.tsx", CONTACT, [(
    '  if (variant === "proof-01-contact") return',
    '  if (variant === "signal-01-contact") return <ContactSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
)])

rebuild("src/components/sections/FooterSection.tsx", FOOTER, [(
    '  if (variant === "proof-01-footer") return',
    '  if (variant === "signal-01-footer") return <FooterSignal01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
)])

# ── variants.ts registrace (POZOR §2.4: v description žádné hranaté závorky) ──
V = "src/sections/variants.ts"
s = open(V).read()

ENTRIES = [
    ('    { key: "proof-01-hero",',
     '    { key: "signal-01-hero", label: "Hero – cinematic + přepínač rolí (signal-01)", description: "SIGNAL Swiss authority: full-bleed korporátní fotka, charcoal overlay, Oswald typografie s electric blue akcentovou linkou; dark glass panel se signature interakcí — segmented přepínač rolí CEO/CFO/IT/HR se sliding thumb, živé 3 benefity + case metrika velkou typografií + CTA Rezervovat konzultaci; trust řádek s fajfkami; editovatelné eyebrow, title, titleAccent, subtitle, CTA, trust, roles vč. benefitů a metrik; reduced-motion — signal-01 SIGNAL", industries: ["*"] },\n'
     '    { key: "hero-signal-01-page", label: "Hero podstránka – charcoal banner + breadcrumb (signal-01)", description: "SIGNAL podstránkové hero: charcoal panel, mono breadcrumb, Oswald claim + volitelný podnadpis + electric blue linka; editovatelné title, subtitle, breadcrumb — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-services",',
     '    { key: "signal-01-services", label: "Řešení – fotokarty s mono tagem (signal-01)", description: "SIGNAL: bílé karty na ledové šedé, fotka 16/10 s hover scale a spodním gradientem, mono index v rohu, mono modrý tag oblasti, Oswald název, popis a šipkový odkaz; IO scroll-reveal se staggerem; editovatelné eyebrow, title, lead, items s name, description, tag, photo, href a linkLabel — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-process",',
     '    { key: "signal-01-method", label: "Metodika – číslované kroky na charcoal (signal-01)", description: "SIGNAL: charcoal panel, mřížka kroků s hairline oddělovači, IO reveal + modrý top-rail scaleX per krok, mono číslo s linkou + volitelná mono durace, Oswald název + popis; editovatelné eyebrow, title, lead, steps s title, description, duration — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-beforeafter",',
     '    { key: "signal-01-cases", label: "Case studies – fotokarty s velkou metrikou (signal-01)", description: "SIGNAL: karty s fotkou 16/10, industry mono štítkem, velkou Oswald metrikou v electric blue nad hairline, titulkem, excerptem a odkazem na CMS detail case-studies/slug; IO reveal, hover lift; editovatelné eyebrow, title, lead, items s metric, metricLabel, industry, title, excerpt, photo a linkLabel — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "arch-01-team",',
     '    { key: "signal-01-team", label: "Tým – portrétní karty 4/5 + mono role (signal-01)", description: "SIGNAL: bílé karty na ledové šedé, portrét 4/5 s jemným hover scale, Oswald jméno, mono modrá role, krátké bio; editovatelné eyebrow, title, lead, members s name, role, bio, image — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-testimonials",',
     '    { key: "signal-01-testimonials", label: "Reference – featured charcoal layout (signal-01)", description: "SIGNAL: asymetrický grid, první reference featured na charcoal s velkou citací, ostatní bílé hairline karty s hover lift; modré hvězdy, avatar iniciála, mono role; editovatelné eyebrow, title, lead, testimonials s text, name, role, rating — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-faq",',
     '    { key: "signal-01-faq", label: "FAQ – centrovaný hairline accordion + CTA (signal-01)", description: "SIGNAL: bílý centrovaný sloupec max 760, hairline accordion s kruhovým plus/kříž togglem, pod ním electric blue CTA s anchor odkazem na konzultaci; editovatelné eyebrow, title, lead, items s question a answer, ctaText, ctaHref — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-contact",',
     '    { key: "signal-01-contact", label: "Konzultace – charcoal panel + formulář se selectem (signal-01)", description: "SIGNAL: charcoal panel vlevo s mono info řádky a fakturačními údaji, vpravo bílá karta s formulářem — jméno, společnost, pracovní e-mail, telefon, select Co řešíte, zpráva, GDPR souhlas, honeypot; POST na contact API, stavy sending/success/error; editovatelné všechny labely, topics i success texty — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-stats",',
     '    { key: "signal-01-stats", label: "Trust pás – Oswald čísla count-up + mono popisky (signal-01)", description: "SIGNAL: bílý pás s velkými Oswald čísly s count-up na scroll jen na veřejném webu, vertikální hairline oddělovače, mono popisky; pod horizontální linkou inline badges s modrými fajfkami; editovatelné items s value a label, badges — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-navbar",',
     '    { key: "signal-01-navbar", label: "Navbar – sticky světlý + mobilní CTA lišta (signal-01)", description: "SIGNAL: sticky bílý blur navbar s hairline linkou, logo, flat linky, telefon + electric blue CTA radius 6; mobil hamburger s drawer panelem a fixní spodní CTA lištou Zavolat/Konzultace se safe-area paddingem; editovatelné siteName, logoUrl, links, ctaText, ctaHref, phone i mobilní labely — signal-01 SIGNAL", industries: ["*"] },'),
    ('    { key: "proof-01-footer",',
     '    { key: "signal-01-footer", label: "Footer – tmavší charcoal + odvětví chipy (signal-01)", description: "SIGNAL: footer na tmavším charcoal, bílé logo + tagline + social, sloupce Navigace a Kontakt s tel, e-mail, adresa, IČO, sloupec Odvětví s chipy; spodní řádek copyright + legal odkazy + WeberoCredit; editovatelné tagline, links, socials, industries, legalLinks i kontakty — signal-01 SIGNAL", industries: ["*"] },'),
]

for anchor, line in ENTRIES:
    s = ensure_line(s, anchor, line)
open(V, "w").write(s)
print(f"registered variants in {V}")
print("DONE — signal-01 rebuild complete")
