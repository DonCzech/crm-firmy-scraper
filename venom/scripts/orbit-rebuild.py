#!/usr/bin/env python3
"""Deterministic rebuild of all orbit-01 (ORBIT — Precision instrument) section components.

Vzor: scripts/signal-rebuild.py. Paralelní session občas přepisuje soubory na disku;
tento skript idempotentně obnoví kanonický stav orbit-01 bloků:
 - najde ORBIT banner v každém souboru, odřízne od něj (bloky žijí na EOF za signal-01)
 - znovu appenduje blok a zajistí dispatch řádky + registrace ve variants.ts
Run from venom/: python3 scripts/orbit-rebuild.py
"""

BANNER = "// ══ ORBIT — Precision instrument (orbit-01)"


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
// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Sticky tmavý ink navbar s blur + hairline linkou, ghost Přihlásit se + emerald
// CTA; mobil drawer + fixní spodní CTA lišta (Zavolat / Vyzkoušet). Theme tokeny.
function NavbarOrbit01({ content, isAdmin, tenantSlug, sectionId }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const siteName = String(content.siteName ?? "Ukázka Flow");
  const logoUrl  = String(content.logoUrl ?? "");
  const logoSrc  = logoUrl || demoLogoDataUrl(siteName);
  const links = (content.links as Array<{ label: string; href: string }>) ?? [];
  const ctaText = String(content.ctaText ?? "Vyzkoušet zdarma");
  const ctaHref = String(content.ctaHref ?? "#demo");
  const loginText = String(content.loginText ?? "Přihlásit se");
  const loginHref = String(content.loginHref ?? "#");
  const phoneHref = String(content.phoneHref ?? "tel:+420704123456");
  const mCallLabel = String(content.mobileCtaCallLabel ?? "Zavolat");
  const mCallHref  = String(content.mobileCtaCallHref ?? phoneHref);
  const mLeadLabel = String(content.mobileCtaLeadLabel ?? "Vyzkoušet");
  const mLeadHref  = String(content.mobileCtaLeadHref ?? ctaHref);

  const resolve = (href: string) => resolveDemoHref(href, tenantSlug, isAdmin);
  const homeHref = tenantSlug ? `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}` : "/";

  return (
    <>
      <style>{`
        .ob01nav-wrap { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); }
        .ob01nav { position: sticky; top: 0; z-index: 60; background: color-mix(in srgb, var(--ob-ink) 86%, transparent);
          backdrop-filter: saturate(1.3) blur(14px); -webkit-backdrop-filter: saturate(1.3) blur(14px);
          border-bottom: 1px solid rgba(255,255,255,.09); }
        .ob01nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 48px); height: 70px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px; }
        .ob01nav-brand { display: inline-flex; align-items: center; gap: 11px; text-decoration: none; color: #fff; min-width: 0; }
        .ob01nav-brand img { height: 30px; width: auto; display: block; }
        .ob01nav-links { display: flex; align-items: center; gap: 2px; }
        .ob01nav-links a { padding: 8px 13px; font-size: .92rem; font-weight: 600; color: rgba(255,255,255,.78); text-decoration: none;
          border-radius: 6px; transition: background .18s, color .18s; }
        .ob01nav-links a:hover { background: rgba(255,255,255,.07); color: #fff; }
        .ob01nav-right { display: flex; align-items: center; gap: 12px; }
        .ob01nav-login { font-size: .92rem; font-weight: 700; color: rgba(255,255,255,.82); text-decoration: none; padding: 8px 12px;
          border-radius: 6px; transition: color .18s, background .18s; white-space: nowrap; }
        .ob01nav-login:hover { color: #fff; background: rgba(255,255,255,.07); }
        .ob01nav-cta { display: inline-flex; align-items: center; gap: 8px; padding: 11px 19px; background: var(--ob-accent);
          color: #fff; font-weight: 700; font-size: .9rem; text-decoration: none; border-radius: 6px; white-space: nowrap; transition: transform .2s, box-shadow .2s; }
        .ob01nav-cta:hover { transform: translateY(-1px); box-shadow: 0 10px 22px -10px color-mix(in srgb, var(--ob-accent) 75%, transparent); }
        .ob01nav-burger { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1px solid rgba(255,255,255,.18);
          border-radius: 6px; background: transparent; cursor: pointer; color: #fff; }
        .ob01nav-drawer { position: fixed; inset: 0; z-index: 70; background: rgba(5,8,12,.6); opacity: 0; pointer-events: none; transition: opacity .25s; }
        .ob01nav-drawer[data-open="true"] { opacity: 1; pointer-events: auto; }
        .ob01nav-panel { position: absolute; top: 0; right: 0; height: 100%; width: min(84vw, 340px); background: var(--ob-ink);
          border-left: 1px solid rgba(255,255,255,.1);
          transform: translateX(100%); transition: transform .3s cubic-bezier(.22,.68,0,1); display: flex; flex-direction: column; padding: 20px; }
        .ob01nav-drawer[data-open="true"] .ob01nav-panel { transform: translateX(0); }
        .ob01nav-panel-close { align-self: flex-end; width: 44px; height: 44px; border: 1px solid rgba(255,255,255,.18); border-radius: 6px; background: transparent; font-size: 1.4rem; cursor: pointer; color: #fff; }
        .ob01nav-panel a { padding: 14px 8px; font-size: 1.02rem; font-weight: 700; color: #fff; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,.1); }
        .ob01nav-panel-cta { margin-top: 18px; text-align: center; background: var(--ob-accent); color: #fff !important; border-radius: 6px; border-bottom: none !important; }
        .ob01nav-mobar { display: none; position: fixed; left: 0; right: 0; bottom: 0; z-index: 55;
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom)); gap: 10px; background: color-mix(in srgb, var(--ob-ink) 92%, transparent);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-top: 1px solid rgba(255,255,255,.1); }
        .ob01nav-mobar a { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px;
          font-weight: 700; font-size: .95rem; text-decoration: none; border-radius: 6px; }
        .ob01nav-mobar-call { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,.3); }
        .ob01nav-mobar-lead { background: var(--ob-accent); color: #fff; }
        @media (max-width: 900px) {
          .ob01nav-links, .ob01nav-login, .ob01nav-cta { display: none; }
          .ob01nav-burger { display: inline-flex; }
          .ob01nav-mobar { display: flex; }
        }
        @media (prefers-reduced-motion: reduce) { .ob01nav-drawer, .ob01nav-panel, .ob01nav-cta { transition: none; } }
      `}</style>

      <div className="ob01nav-wrap" data-template="orbit-01">
        <header className="ob01nav">
          <div className="ob01nav-inner">
            <a href={homeHref} className="ob01nav-brand" aria-label={siteName}>
              <GenericEditableImage sectionId={sectionId} field="logoUrl" src={logoSrc} alt={siteName} className="ob01nav-logoslot">
                <img src={logoSrc} alt={siteName} />
              </GenericEditableImage>
            </a>
            <nav className="ob01nav-links" aria-label="Hlavní navigace">
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)}>
                  <GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" />
                </a>
              ))}
            </nav>
            <div className="ob01nav-right">
              <a href={resolve(loginHref)} className="ob01nav-login">
                <GenericEditableText sectionId={sectionId} field="loginText" value={loginText} tag="span" />
              </a>
              <a href={resolve(ctaHref)} className="ob01nav-cta" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              </a>
              <button className="ob01nav-burger" onClick={() => setOpen(true)} aria-label="Otevřít menu" aria-expanded={open}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              </button>
            </div>
          </div>
        </header>

        <div className="ob01nav-drawer" data-open={open} onClick={() => setOpen(false)}>
          <div className="ob01nav-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Navigace">
            <button className="ob01nav-panel-close" onClick={() => setOpen(false)} aria-label="Zavřít menu">×</button>
            <nav>
              {links.map((l, i) => (
                <a key={i} href={resolve(l.href)} onClick={() => setOpen(false)} style={{ display: "block" }}>{l.label}</a>
              ))}
            </nav>
            <a href={resolve(loginHref)} onClick={() => setOpen(false)} style={{ display: "block" }}>{loginText}</a>
            <a href={resolve(ctaHref)} className="ob01nav-panel-cta" style={{ display: "block", padding: "14px" }} onClick={() => setOpen(false)}>{ctaText}</a>
          </div>
        </div>

        <nav className="ob01nav-mobar" aria-label="Rychlé akce">
          <a href={mCallHref} className="ob01nav-mobar-call">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <GenericEditableText sectionId={sectionId} field="mobileCtaCallLabel" value={mCallLabel} tag="span" />
          </a>
          <a href={resolve(mLeadHref)} className="ob01nav-mobar-lead" data-btn="primary">
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
// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Produktový hero na ink s jemnou technickou mřížkou: velká Overpass 800 typografie
// s emerald akcentovým řádkem; glass „produktové okno" = signature interakce —
// segmented taby (Přehled / Automatizace / Reporty) živě přepínají CSS mockup
// (velká metrika, hairline řádky, bar chart) bez videa. CTA Rezervovat demo.
type Ob01TabRow = { name?: string; value?: string };
type Ob01Tab = { label?: string; metric?: string; metricLabel?: string; rows?: Ob01TabRow[] };

function ob01ResolveHref(href: string, tenantSlug?: string, isAdmin?: boolean) {
  if (!tenantSlug) return href;
  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href.startsWith("/") ? href : "/" + href}`;
}

const OB01_BARS: number[][] = [
  [38, 52, 44, 66, 58, 74, 86],
  [28, 28, 60, 60, 78, 78, 92],
  [54, 40, 66, 50, 78, 62, 88],
];

function HeroOrbit01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const eyebrow     = String(content.eyebrow     ?? "Platforma pro firemní procesy");
  const title       = String(content.title       ?? "Procesy, které se řídí samy.");
  const titleAccent = String(content.titleAccent ?? "Vy řídíte firmu.");
  const subtitle    = String(content.subtitle    ?? "Ukázka Flow spojí zakázky, schvalování a reporting do jedné automatizované platformy. Nasazení do 14 dnů, bez programování.");
  const ctaText          = String(content.ctaText          ?? "Vyzkoušet 14 dní zdarma");
  const ctaHref          = String(content.ctaHref          ?? "#demo");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Prohlédnout produkt");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "/produkt");
  const rawTrust = content.trust as string[] | undefined;
  const trust = rawTrust && rawTrust.length ? rawTrust : ["Nasazení do 14 dnů", "Data v EU, GDPR", "Bez platební karty"];

  const windowUrl   = String(content.windowUrl   ?? "app.ukazkaflow.cz");
  const windowBadge = String(content.windowBadge ?? "LIVE");
  const panelCtaText = String(content.panelCtaText ?? "Rezervovat demo");
  const panelCtaHref = String(content.panelCtaHref ?? "#demo");
  const panelCtaNote = String(content.panelCtaNote ?? "14 dní zdarma · bez platební karty");

  const tabs: Ob01Tab[] = (content.tabs as Ob01Tab[] | undefined)?.length
    ? (content.tabs as Ob01Tab[])
    : [
        { label: "Přehled", metric: "128", metricLabel: "zakázek běží právě teď bez ručního zásahu", rows: [
          { name: "Nové objednávky", value: "+24 dnes" },
          { name: "Čeká na schválení", value: "3" },
          { name: "Průměrná doba vyřízení", value: "1,8 dne" },
        ] },
        { label: "Automatizace", metric: "46 h", metricLabel: "ušetřených každý týden automatickými kroky", rows: [
          { name: "Objednávka → faktura", value: "Aktivní" },
          { name: "Urgence po 48 hodinách", value: "Aktivní" },
          { name: "Schválení nad 50 000 Kč", value: "Aktivní" },
        ] },
        { label: "Reporty", metric: "99,2 %", metricLabel: "zakázek doručených v termínu tento měsíc", rows: [
          { name: "Obrat za červenec", value: "4,2 mil. Kč" },
          { name: "Vytížení týmu", value: "82 %" },
          { name: "Reklamace", value: "0,4 %" },
        ] },
      ];

  const [tabIdx, setTabIdx] = useState(0);
  const tab = tabs[Math.min(tabIdx, tabs.length - 1)] ?? {};
  const rows = (tab.rows ?? []).slice(0, 3);
  const bars = OB01_BARS[Math.min(tabIdx, OB01_BARS.length - 1)] ?? OB01_BARS[0];

  return (
    <>
      <style>{`
        .ob01hero { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          position: relative; background: var(--ob-ink); overflow: hidden;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); color: #fff;
          display: flex; align-items: center; min-height: clamp(640px, 90vh, 880px); }
        .ob01hero::before { content: ''; position: absolute; inset: 0; opacity: .55;
          background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
          background-size: 46px 46px; mask-image: linear-gradient(180deg, rgba(0,0,0,.9), rgba(0,0,0,.25) 70%, transparent); }
        .ob01hero-inner { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; width: 100%;
          padding: clamp(88px, 11vh, 128px) clamp(20px, 5vw, 48px) clamp(56px, 8vh, 88px);
          display: grid; grid-template-columns: 1.04fr 0.96fr; gap: clamp(36px, 5vw, 72px); align-items: center; }
        @keyframes ob01up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .ob01hero-left { min-width: 0; }
        .ob01hero-left > * { animation: ob01up .65s cubic-bezier(.22,.68,0,1) both; }
        .ob01hero-left > *:nth-child(1) { animation-delay: .05s; }
        .ob01hero-left > *:nth-child(2) { animation-delay: .13s; }
        .ob01hero-left > *:nth-child(3) { animation-delay: .22s; }
        .ob01hero-left > *:nth-child(4) { animation-delay: .32s; }
        .ob01hero-left > *:nth-child(5) { animation-delay: .44s; }
        .ob01hero-eyebrow { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .78rem; font-weight: 700;
          letter-spacing: .16em; text-transform: uppercase; color: var(--ob-accent-lt); margin: 0 0 20px;
          display: inline-flex; align-items: center; gap: 12px; }
        .ob01hero-eyebrow::before { content: ''; width: 40px; height: 2px; background: var(--ob-accent-lt); }
        .ob01hero-h1 { font-family: var(--font-heading, system-ui, sans-serif); color: #fff;
          font-size: clamp(2.5rem, 5.2vw, 4.3rem); font-weight: 800; line-height: 1.03;
          letter-spacing: -0.035em; margin: 0 0 24px; text-wrap: balance; }
        .ob01hero-h1-accent { display: block; font-weight: 800; color: var(--ob-accent-lt); font-size: 1em; margin-top: .08em; }
        .ob01hero-sub { font-size: clamp(1.02rem, 1.35vw, 1.16rem); line-height: 1.65; color: rgba(255,255,255,.8);
          max-width: 30em; margin: 0 0 34px; }
        .ob01hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; }
        .ob01btn-primary { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 28px; background: var(--ob-accent); color: #fff; font-weight: 700; font-size: .98rem;
          text-decoration: none; border-radius: 6px; transition: transform .35s cubic-bezier(.22,.68,0,1), box-shadow .35s ease; white-space: nowrap; }
        .ob01btn-primary > * { position: relative; z-index: 2; }
        .ob01btn-primary::before { content: ''; position: absolute; top: 0; left: -130%; width: 55%; height: 100%; z-index: 1;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.32), transparent); transform: skewX(-18deg); transition: left .6s cubic-bezier(.22,.68,0,1); }
        .ob01btn-primary:hover::before { left: 140%; }
        .ob01btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px color-mix(in srgb, var(--ob-accent) 75%, transparent); }
        .ob01btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 15px 24px; background: rgba(255,255,255,.06);
          color: #fff; font-weight: 600; font-size: .98rem; text-decoration: none; border: 1.5px solid rgba(255,255,255,.35);
          border-radius: 6px; transition: border-color .2s, background .2s; white-space: nowrap; backdrop-filter: blur(6px); }
        .ob01btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,.12); }
        .ob01hero-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 36px;
          padding-top: 24px; border-top: 1px solid rgba(255,255,255,.2); }
        .ob01hero-trust-item { display: inline-flex; align-items: center; gap: 8px; font-size: .88rem; font-weight: 700; color: #fff; }
        .ob01hero-trust-item svg { flex-shrink: 0; color: var(--ob-accent-lt); }
        .ob01hero-trust-item + .ob01hero-trust-item::before { content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,.35); margin-right: 14px; }
        /* produktové okno */
        .ob01hero-visual { position: relative; min-width: 0; animation: ob01up .7s cubic-bezier(.22,.68,0,1) .18s both; z-index: 2; }
        .ob01win { position: relative; z-index: 2; width: 100%; color: #fff;
          background: rgba(10,17,27,.66); backdrop-filter: blur(18px) saturate(1.2); -webkit-backdrop-filter: blur(18px) saturate(1.2);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px; box-shadow: 0 30px 70px -25px rgba(0,0,0,.55); overflow: hidden; }
        .ob01win-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,.12); }
        .ob01win-dots { display: inline-flex; gap: 6px; }
        .ob01win-dots i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,.22); }
        .ob01win-url { flex: 1; text-align: center; font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .72rem;
          color: rgba(255,255,255,.6); background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 6px;
          padding: 5px 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
        .ob01win-live { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-overpass-mono, ui-monospace, monospace);
          font-size: .64rem; font-weight: 700; letter-spacing: .12em; color: var(--ob-accent-lt); }
        .ob01win-live::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--ob-accent-lt); }
        .ob01win-body { padding: clamp(18px, 2vw, 26px); }
        .ob01win-tabs { position: relative; display: flex; background: rgba(255,255,255,.08); border-radius: 8px; padding: 3px; margin-bottom: 18px; width: 100%; isolation: isolate; }
        .ob01win-tabs-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 6px; background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,.35); z-index: 0; transition: transform .28s cubic-bezier(.22,.68,0,1);
          width: calc((100% - 6px) / var(--ob-n, 3)); transform: translateX(calc(var(--ob-i, 0) * 100%)); }
        .ob01win-tab { position: relative; z-index: 1; flex: 1; border: none; cursor: pointer; padding: 9px 2px; border-radius: 6px; font-family: inherit;
          font-weight: 700; font-size: .8rem; color: rgba(255,255,255,.62); background: transparent; transition: color .2s; white-space: nowrap; }
        .ob01win-tab[aria-checked="true"] { color: var(--ob-ink); }
        @keyframes ob01fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .ob01win-metric { animation: ob01fade .32s cubic-bezier(.22,.68,0,1) both; }
        .ob01win-metric-val { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .ob01win-metric-val > b { font-family: var(--font-heading, system-ui, sans-serif); font-size: clamp(2.3rem, 2.9vw, 3rem); font-weight: 800;
          letter-spacing: -0.02em; line-height: 1; color: var(--ob-accent-lt); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .ob01win-metric-val b span { font-size: inherit; }
        .ob01win-metric-val > span { font-size: .88rem; color: rgba(255,255,255,.85); font-weight: 600; max-width: 17em; line-height: 1.35; }
        .ob01win-rows { margin: 16px 0 0; border-top: 1px solid rgba(255,255,255,.12); }
        .ob01win-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 2px;
          border-bottom: 1px solid rgba(255,255,255,.12); font-size: .9rem; font-weight: 600; color: rgba(255,255,255,.9);
          animation: ob01fade .3s cubic-bezier(.22,.68,0,1) both; }
        .ob01win-row:nth-child(2) { animation-delay: .05s; }
        .ob01win-row:nth-child(3) { animation-delay: .1s; }
        .ob01win-row > .ob01win-row-val { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .78rem; font-weight: 700;
          color: var(--ob-accent-lt); white-space: nowrap; }
        .ob01win-bars { display: flex; align-items: flex-end; gap: 7px; height: 64px; margin-top: 18px; }
        .ob01win-bars i { flex: 1; border-radius: 3px 3px 0 0; background: linear-gradient(180deg, var(--ob-accent-lt), color-mix(in srgb, var(--ob-accent-lt) 45%, transparent));
          opacity: .85; height: calc(var(--h) * 1%); transition: height .45s cubic-bezier(.22,.68,0,1); }
        .ob01win-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; width: 100%;
          padding: 15px; background: var(--ob-accent); color: #fff; font-weight: 700; font-size: .95rem; text-decoration: none;
          border-radius: 6px; transition: filter .2s, transform .2s; box-shadow: 0 10px 30px -10px color-mix(in srgb, var(--ob-accent) 70%, transparent); }
        .ob01win-cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .ob01win-cta-note { font-family: var(--font-overpass-mono, ui-monospace, monospace); text-align: center; font-size: .7rem;
          color: rgba(255,255,255,.5); margin: 10px 0 0; }
        @media (max-width: 1000px) {
          .ob01hero { min-height: 0; }
          .ob01hero-inner { grid-template-columns: 1fr; padding-top: 88px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ob01hero-left > *, .ob01hero-visual, .ob01win-metric, .ob01win-row { animation: none; }
          .ob01btn-primary, .ob01btn-primary::before, .ob01win-tab, .ob01win-tabs-thumb, .ob01win-bars i { transition: none; }
        }
      `}</style>

      <section className="ob01hero" data-template="orbit-01" id="uvod">
        <div className="ob01hero-inner">
          <div className="ob01hero-left">
            <p className="ob01hero-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h1 className="ob01hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {titleAccent && (
                <span className="ob01hero-h1-accent">
                  <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                </span>
              )}
            </h1>
            <p className="ob01hero-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div className="ob01hero-ctas">
              <a href={ob01ResolveHref(ctaHref, tenantSlug, isAdmin)} className="ob01btn-primary" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href={ob01ResolveHref(ctaSecondaryHref, tenantSlug, isAdmin)} className="ob01btn-ghost">
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>
            <div className="ob01hero-trust">
              {trust.map((t, i) => (
                <span key={i} className="ob01hero-trust-item">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                  <GenericEditableText sectionId={sectionId} field={`trust.${i}`} value={t} tag="span" />
                </span>
              ))}
            </div>
          </div>

          <div className="ob01hero-visual">
            <div className="ob01win" role="group" aria-label="Ukázka produktu">
              <div className="ob01win-bar">
                <span className="ob01win-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="ob01win-url">
                  <GenericEditableText sectionId={sectionId} field="windowUrl" value={windowUrl} tag="span" />
                </span>
                <span className="ob01win-live">
                  <GenericEditableText sectionId={sectionId} field="windowBadge" value={windowBadge} tag="span" />
                </span>
              </div>
              <div className="ob01win-body">
                <div className="ob01win-tabs" role="radiogroup" aria-label="Části produktu"
                  style={{ ["--ob-n" as string]: tabs.length, ["--ob-i" as string]: Math.min(tabIdx, tabs.length - 1) }}>
                  <span className="ob01win-tabs-thumb" aria-hidden="true" />
                  {tabs.map((t, i) => (
                    <button key={i} type="button" className="ob01win-tab" role="radio" aria-checked={tabIdx === i} onClick={() => setTabIdx(i)}>
                      {String(t.label ?? "")}
                    </button>
                  ))}
                </div>
                <div className="ob01win-metric" key={`m-${tabIdx}`} aria-live="polite">
                  <div className="ob01win-metric-val">
                    <b><GenericEditableText sectionId={sectionId} field={`tabs.${tabIdx}.metric`} value={String(tab.metric ?? "")} tag="span" /></b>
                    <span><GenericEditableText sectionId={sectionId} field={`tabs.${tabIdx}.metricLabel`} value={String(tab.metricLabel ?? "")} tag="span" /></span>
                  </div>
                </div>
                <div className="ob01win-rows" key={`r-${tabIdx}`}>
                  {rows.map((r, i) => (
                    <div key={i} className="ob01win-row">
                      <GenericEditableText sectionId={sectionId} field={`tabs.${tabIdx}.rows.${i}.name`} value={String(r.name ?? "")} tag="span" />
                      <span className="ob01win-row-val">
                        <GenericEditableText sectionId={sectionId} field={`tabs.${tabIdx}.rows.${i}.value`} value={String(r.value ?? "")} tag="span" />
                      </span>
                    </div>
                  ))}
                </div>
                <div className="ob01win-bars" aria-hidden="true">
                  {bars.map((h, i) => (
                    <i key={i} style={{ ["--h" as string]: h }} />
                  ))}
                </div>
                <a href={ob01ResolveHref(panelCtaHref, tenantSlug, isAdmin)} className="ob01win-cta" data-btn="primary">
                  <GenericEditableText sectionId={sectionId} field="panelCtaText" value={panelCtaText} tag="span" />
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
                <p className="ob01win-cta-note">
                  <GenericEditableText sectionId={sectionId} field="panelCtaNote" value={panelCtaNote} tag="span" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hero-orbit-01-page — podstránkové hero (breadcrumb + claim na ink) ────────
function HeroOrbit01Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title      = String(content.title      ?? "Podstránka");
  const subtitle   = String(content.subtitle   ?? "");
  const breadcrumb = String(content.breadcrumb ?? "Domů");
  const breadHref  = String(content.breadcrumbHref ?? "/");
  return (
    <>
      <style>{`
        .ob01pb { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          position: relative; background: var(--ob-ink); color: #fff;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); overflow: hidden; }
        .ob01pb::before { content: ''; position: absolute; inset: 0; opacity: .5;
          background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
          background-size: 46px 46px; mask-image: linear-gradient(180deg, rgba(0,0,0,.9), transparent); }
        .ob01pb-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: clamp(44px, 6vw, 76px) clamp(20px, 5vw, 48px); }
        .ob01pb-crumb { display: flex; align-items: center; gap: 8px; font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .78rem; color: rgba(255,255,255,.55); margin-bottom: 16px; }
        .ob01pb-crumb a { color: rgba(255,255,255,.55); text-decoration: none; transition: color .2s; }
        .ob01pb-crumb a:hover { color: var(--ob-accent-lt); }
        .ob01pb-crumb .cur { color: #fff; }
        .ob01pb-title { font-family: var(--font-heading, system-ui, sans-serif); color: #fff; font-size: clamp(2rem, 4.2vw, 3.1rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.05; margin: 0; }
        .ob01pb-sub { font-size: clamp(1rem, 1.35vw, 1.12rem); color: rgba(255,255,255,.72); max-width: 42em; margin: 14px 0 0; line-height: 1.6; }
        .ob01pb-rule { width: 56px; height: 3px; background: var(--ob-accent-lt); margin-top: 24px; }
      `}</style>
      <section className="ob01pb" data-template="orbit-01">
        <div className="ob01pb-inner">
          <div className="ob01pb-crumb">
            <a href={ob01ResolveHref(breadHref, tenantSlug, isAdmin)}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden="true">/</span>
            <span className="cur">{title}</span>
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1" className="ob01pb-title" />
          {subtitle && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="ob01pb-sub" />}
          <div className="ob01pb-rule" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ FOOTER ════════════════════════════════════════
FOOTER = r'''
// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Footer: tmavší ink než sekce, bílé logo + tagline + status řádek se zelenou
// tečkou; sloupce Produkt / Zdroje (Dokumentace, Changelog, Status, API) /
// Kontakt; spodní řádek copyright + legal + WeberoCredit.
function FooterOrbit01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const siteName = String(content.siteName ?? "Ukázka Flow");
  const logoUrl  = String(content.logoUrl ?? "");
  const tagline  = String(content.tagline ?? "Platforma pro automatizaci firemních procesů. Zakázky, schvalování a reporting na jednom místě.");
  const statusText = String(content.statusText ?? "Všechny systémy v provozu");
  const email    = String(content.email ?? "poptavka@demo.cz");
  const phone    = String(content.phone ?? "+420 704 123 456");
  const address  = String(content.address ?? "Ukázková 123, 110 00 Praha 1");
  const ico      = String(content.ico ?? "12345678");
  const navColTitle = String(content.navColTitle ?? "Produkt");
  const resColTitle = String(content.resourcesColTitle ?? "Zdroje");
  const contactColTitle = String(content.contactColTitle ?? "Kontakt");
  const links = (content.links as Array<{ label: string; href: string }> | undefined) ?? [];
  const resources = (content.resources as Array<{ label: string; href: string }> | undefined) ?? [];
  const legalLinks = (content.legalLinks as Array<{ label: string; href: string }> | undefined) ?? [];
  const socials = (content.socials as Array<{ icon: string; href: string; label?: string }> | undefined) ?? [];
  const copyright = String(content.copyright ?? `© ${new Date().getFullYear()} ${siteName}. Všechna práva vyhrazena.`);
  const resolve = (href: string) => (isAdmin ? "#" : (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) ? href : tenantSlug ? `/demo/${tenantSlug}${href.startsWith("/") ? href : "/" + href}` : href);

  return (
    <>
      <style>{`
        .ob01ft { --ob-accent: var(--color-accent, #047857);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          background: color-mix(in srgb, var(--color-secondary, #0A0F16) 62%, #000); color: #fff;
          font-family: var(--font-body, system-ui, sans-serif);
          padding: clamp(48px,7vw,80px) clamp(20px,5vw,48px) 28px; }
        .ob01ft-inner { max-width: 1280px; margin: 0 auto; }
        .ob01ft-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: clamp(28px,4vw,56px); padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,.1); }
        .ob01ft-brand-name { margin: 0 0 12px; display: flex; align-items: center; gap: 10px; }
        .ob01ft-brand-name img { height: 28px; width: auto; }
        .ob01ft-tag { font-size: .94rem; color: rgba(255,255,255,.78); line-height: 1.6; max-width: 32em; margin: 0; }
        .ob01ft-status { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px;
          font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .74rem; color: rgba(255,255,255,.72);
          border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 6px 13px; }
        .ob01ft-status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--ob-accent-lt); }
        .ob01ft-col-t { font-family: var(--font-overpass-mono, ui-monospace, monospace); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.66); margin: 0 0 16px; }
        .ob01ft-col a, .ob01ft-col li { color: rgba(255,255,255,.72); text-decoration: none; font-size: .94rem; line-height: 2; display: block; }
        .ob01ft-col a:hover { color: var(--ob-accent-lt); }
        .ob01ft-col ul { list-style: none; padding: 0; margin: 0; }
        .ob01ft-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-top: 24px; }
        .ob01ft-legal { display: flex; gap: 18px; flex-wrap: wrap; }
        .ob01ft-legal a { color: rgba(255,255,255,.72); text-decoration: none; font-size: .84rem; }
        .ob01ft-legal a:hover { color: #fff; }
        .ob01ft-copy { font-size: .84rem; color: rgba(255,255,255,.72); }
        .ob01ft-social { display: flex; gap: 9px; margin-top: 16px; }
        .ob01ft-social a { width: 36px; height: 36px; border-radius: 6px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center; color: #fff; transition: background .2s, border-color .2s; }
        .ob01ft-social a:hover { background: var(--ob-accent); border-color: var(--ob-accent); }
        .ob01ft-credit { margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.08); display: flex; justify-content: center; opacity: .75; }
        @media (max-width:900px){ .ob01ft-grid{ grid-template-columns: 1fr 1fr; } }
        @media (max-width:560px){ .ob01ft-grid{ grid-template-columns: 1fr; } }
      `}</style>
      <footer className="ob01ft" data-template="orbit-01">
        <div className="ob01ft-inner">
          <div className="ob01ft-grid">
            <div className="ob01ft-brand">
              <div className="ob01ft-brand-name">
                {logoUrl && <img src={logoUrl} alt={siteName} />}
              </div>
              <p className="ob01ft-tag"><GenericEditableText sectionId={sectionId} field="tagline" value={tagline} tag="span" /></p>
              <span className="ob01ft-status"><GenericEditableText sectionId={sectionId} field="statusText" value={statusText} tag="span" /></span>
              {socials.length > 0 && (
                <div className="ob01ft-social">
                  {socials.map((s, i) => (
                    <a key={i} href={s.href} aria-label={s.label ?? s.icon} target="_blank" rel="noopener noreferrer">
                      <Es06SocialIcon kind={s.icon} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="ob01ft-col">
              <p className="ob01ft-col-t"><GenericEditableText sectionId={sectionId} field="navColTitle" value={navColTitle} tag="span" /></p>
              <ul>
                {links.map((l, i) => (
                  <li key={i}><a href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`links.${i}.label`} value={l.label} tag="span" /></a></li>
                ))}
              </ul>
            </div>

            <div className="ob01ft-col">
              <p className="ob01ft-col-t"><GenericEditableText sectionId={sectionId} field="resourcesColTitle" value={resColTitle} tag="span" /></p>
              <ul>
                {resources.map((l, i) => (
                  <li key={i}><a href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`resources.${i}.label`} value={l.label} tag="span" /></a></li>
                ))}
              </ul>
            </div>

            <div className="ob01ft-col">
              <p className="ob01ft-col-t"><GenericEditableText sectionId={sectionId} field="contactColTitle" value={contactColTitle} tag="span" /></p>
              <ul>
                <li><a href={`tel:${phone.replace(/\s/g, "")}`}><GenericEditableText sectionId={sectionId} field="phone" value={phone} tag="span" /></a></li>
                <li><a href={`mailto:${email}`}><GenericEditableText sectionId={sectionId} field="email" value={email} tag="span" /></a></li>
                <li><GenericEditableText sectionId={sectionId} field="address" value={address} tag="span" /></li>
                <li style={{ color: "rgba(255,255,255,.4)" }}>IČO: <GenericEditableText sectionId={sectionId} field="ico" value={ico} tag="span" /></li>
              </ul>
            </div>
          </div>

          <div className="ob01ft-bottom">
            <span className="ob01ft-copy"><GenericEditableText sectionId={sectionId} field="copyright" value={copyright} tag="span" /></span>
            <div className="ob01ft-legal">
              {legalLinks.map((l, i) => (
                <a key={i} href={resolve(l.href)}><GenericEditableText sectionId={sectionId} field={`legalLinks.${i}.label`} value={l.label} tag="span" /></a>
              ))}
            </div>
          </div>
          <div className="ob01ft-credit"><WeberoCredit /></div>
        </div>
      </footer>
    </>
  );
}
'''


# ═════════════════════════════ STATS ═════════════════════════════════════════
STATS = r'''
// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Bílý trust pás: velká Overpass 800 čísla s count-up, vertikální hairline
// oddělovače, mono popisky; badges jako inline řádek s emerald fajfkami.
function StatsOrbit01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const items = (content.items as Array<{ value?: string; label?: string }> | undefined) ?? [];
  const rawBadges = content.badges as string[] | undefined;
  const badges = rawBadges && rawBadges.length ? rawBadges : [];
  return (
    <>
      <style>{`
        .ob01st { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-muted: var(--color-text-muted, #5C6672); --ob-border: var(--color-border, #E1E7E2);
          background:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--color-text, #0E1420);
          padding:clamp(40px,5vw,60px) clamp(20px,5vw,48px); border-bottom:1px solid var(--ob-border); }
        .ob01st-inner { max-width:1280px; margin:0 auto; }
        .ob01st-nums { display:grid; grid-template-columns:repeat(4,1fr); }
        .ob01st-num { padding:6px clamp(18px,3vw,40px); }
        .ob01st-num + .ob01st-num { border-left:1px solid var(--ob-border); }
        .ob01st-num:first-child { padding-left:0; }
        .ob01st-num b { display:block; font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2rem,3.6vw,3.1rem); font-weight:800; letter-spacing:-0.02em; line-height:1; color:var(--ob-ink); font-variant-numeric:tabular-nums; }
        .ob01st-num > span { display:block; font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.8rem; color:var(--ob-muted); margin-top:9px; line-height:1.4; }
        .ob01st-num b span { font-size:inherit; }
        .ob01st-badges { display:flex; flex-wrap:wrap; align-items:center; gap:10px 22px; margin-top:clamp(22px,3vw,32px); padding-top:clamp(18px,2.5vw,24px); border-top:1px solid var(--ob-border); }
        .ob01st-chip { display:inline-flex; align-items:center; gap:8px; font-size:.88rem; font-weight:600; color:var(--ob-ink); }
        .ob01st-chip svg { color:var(--ob-accent); flex-shrink:0; }
        .ob01st-chip + .ob01st-chip::before { content:''; width:4px; height:4px; border-radius:50%; background:var(--ob-border); margin-right:16px; }
        @media (max-width:900px){ .ob01st-nums{ grid-template-columns:repeat(2,1fr); row-gap:22px; } .ob01st-num:nth-child(3){ border-left:none; padding-left:0; } }
        @media (max-width:480px){ .ob01st-nums{ grid-template-columns:1fr 1fr; } }
      `}</style>
      <section className="ob01st" data-template="orbit-01">
        <div className="ob01st-inner">
          <div className="ob01st-nums">
            {items.map((it, i) => (
              <div key={i} className="ob01st-num">
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
            <div className="ob01st-badges">
              {badges.map((b, i) => (
                <span key={i} className="ob01st-chip">
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

# ═════════════════════════════ BENTO + USE CASES ═════════════════════════════
SERVICES = r'''
// ══ ORBIT — Precision instrument (orbit-01) ═══════════════════════════════════
// Feature bento: mřížka na ledové šedé s CSS produkt vizuály místo ikonek —
// featured karta s mini workflow, menší karty s bar chartem, avatary, sparkline
// a telefonem. + Use cases: ink sekce s přepínačem rolí a živým panelem.
function Ob01BentoViz({ i }: { i: number }) {
  if (i === 0) return (
    <span className="ob01bn-viz ob01bn-viz-flow" aria-hidden="true">
      <span className="ob01bn-flowrow"><i className="ob01bn-dot" /><span className="ob01bn-flowline" /><em>Nová objednávka</em><b>spustí</b></span>
      <span className="ob01bn-flowrow"><i className="ob01bn-dot" /><span className="ob01bn-flowline" /><em>Schválení vedoucím</em><b>Aktivní</b></span>
      <span className="ob01bn-flowrow"><i className="ob01bn-dot" /><span className="ob01bn-flowline" /><em>Faktura + e-mail zákazníkovi</em><b>Auto</b></span>
    </span>
  );
  if (i === 1) return (
    <span className="ob01bn-viz ob01bn-viz-bars" aria-hidden="true">
      {[42, 58, 38, 72, 52, 86].map((h, k) => <i key={k} style={{ ["--h" as string]: h }} />)}
    </span>
  );
  if (i === 2) return (
    <span className="ob01bn-viz ob01bn-viz-people" aria-hidden="true">
      <span className="ob01bn-avatars"><i>JN</i><i>PK</i><i>MV</i></span>
      <span className="ob01bn-bubble"><b /><b style={{ width: "62%" }} /></span>
    </span>
  );
  if (i === 3) return (
    <span className="ob01bn-viz ob01bn-viz-spark" aria-hidden="true">
      <svg viewBox="0 0 120 40" preserveAspectRatio="none"><polyline points="0,32 20,28 40,30 60,18 80,20 100,10 120,6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
  return (
    <span className="ob01bn-viz ob01bn-viz-phone" aria-hidden="true">
      <span className="ob01bn-phone"><b /><i style={{ width: "82%" }} /><i style={{ width: "64%" }} /><i style={{ width: "74%" }} /></span>
    </span>
  );
}

function BentoOrbit01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Funkce");
  const title   = String(content.title   ?? "Všechno, co proces potřebuje. Nic navíc.");
  const lead    = String(content.lead    ?? "");
  type ObBn = { name?: string; description?: string; tag?: string; href?: string };
  const items = (content.items as ObBn[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Více o produktu");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".ob01bn-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("ob01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .ob01bn { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-muted: var(--color-text-muted, #5C6672); --ob-border: var(--color-border, #E1E7E2);
          background:var(--color-bg, #F2F5F3); font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--color-text, #0E1420);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .ob01bn-inner { max-width:1280px; margin:0 auto; }
        .ob01bn-head { max-width:660px; margin-bottom:clamp(32px,5vw,56px); }
        .ob01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--ob-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .ob01-eyebrow::before { content:''; width:32px; height:2px; background:var(--ob-accent); }
        .ob01bn-title { font-family:var(--font-heading, system-ui, sans-serif); color:var(--ob-ink); font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:800; letter-spacing:-0.03em; line-height:1.06; margin:0 0 14px; }
        .ob01bn-lead { font-size:1.05rem; color:var(--ob-muted); line-height:1.6; margin:0; }
        .ob01bn-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        .ob01bn-card { position:relative; display:flex; flex-direction:column; gap:10px; background:var(--color-surface, #fff); border:1px solid var(--ob-border);
          border-radius:12px; padding:24px 26px; text-decoration:none; color:inherit; overflow:hidden;
          opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), box-shadow .25s, border-color .25s; }
        .ob01bn-card.ob01-vis { opacity:1; transform:translateY(0); }
        .ob01bn-card.ob01-vis:hover { transform:translateY(-5px); box-shadow:0 14px 30px -18px rgba(10,15,22,.28); border-color:color-mix(in srgb, var(--ob-accent) 40%, var(--ob-border));
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .ob01bn-card-featured { grid-column:span 2; }
        .ob01bn-tag { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.72rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--ob-accent); }
        .ob01bn-name { font-family:var(--font-heading, system-ui, sans-serif); color:var(--ob-ink); font-size:1.22rem; font-weight:800; letter-spacing:-0.015em; margin:0; }
        .ob01bn-desc { font-size:.94rem; color:var(--ob-muted); line-height:1.55; margin:0; flex:1; }
        .ob01bn-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--ob-accent); margin-top:2px; }
        .ob01bn-more svg { transition:transform .25s; } .ob01bn-card:hover .ob01bn-more svg { transform:translateX(4px); }
        .ob01bn-viz { display:block; margin-top:14px; padding-top:14px; border-top:1px solid var(--ob-border); color:var(--ob-accent); }
        .ob01bn-flowrow { display:flex; align-items:center; gap:10px; padding:7px 0; font-size:.82rem; }
        .ob01bn-flowrow em { font-style:normal; color:var(--color-text, #0E1420); font-weight:600; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ob01bn-flowrow b { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.68rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ob-accent);
          border:1px solid color-mix(in srgb, var(--ob-accent) 35%, transparent); border-radius:999px; padding:3px 9px; }
        .ob01bn-dot { width:9px; height:9px; border-radius:50%; background:var(--ob-accent); flex-shrink:0; }
        .ob01bn-flowline { width:22px; height:1px; background:var(--ob-border); flex-shrink:0; }
        .ob01bn-viz-bars { display:flex; align-items:flex-end; gap:8px; height:58px; }
        .ob01bn-viz-bars i { flex:1; border-radius:3px 3px 0 0; background:linear-gradient(180deg, var(--ob-accent), color-mix(in srgb, var(--ob-accent) 40%, transparent)); opacity:.8; height:calc(var(--h) * 1%); }
        .ob01bn-avatars { display:inline-flex; }
        .ob01bn-avatars i { width:32px; height:32px; border-radius:50%; background:color-mix(in srgb, var(--ob-accent) 14%, #fff); border:2px solid #fff; color:var(--ob-accent);
          font-size:.62rem; font-weight:800; display:inline-flex; align-items:center; justify-content:center; font-style:normal; margin-left:-8px; }
        .ob01bn-avatars i:first-child { margin-left:0; }
        .ob01bn-bubble { display:block; margin-top:10px; padding:10px 12px; background:color-mix(in srgb, var(--ob-accent) 7%, #fff); border:1px solid var(--ob-border); border-radius:8px 8px 8px 2px; }
        .ob01bn-bubble b { display:block; height:6px; border-radius:3px; background:color-mix(in srgb, var(--ob-accent) 28%, #fff); margin-bottom:6px; }
        .ob01bn-bubble b:last-child { margin-bottom:0; }
        .ob01bn-viz-spark svg { display:block; width:100%; height:44px; }
        .ob01bn-phone { display:block; width:96px; border:1.5px solid var(--ob-border); border-radius:12px; padding:10px 9px 12px; background:#fff; }
        .ob01bn-phone b { display:block; width:26px; height:4px; border-radius:2px; background:var(--ob-border); margin:0 auto 9px; }
        .ob01bn-phone i { display:block; height:6px; border-radius:3px; background:color-mix(in srgb, var(--ob-accent) 24%, #fff); margin-bottom:6px; }
        @media (max-width:980px){ .ob01bn-grid{ grid-template-columns:1fr 1fr; } .ob01bn-card-featured{ grid-column:span 2; } }
        @media (max-width:620px){ .ob01bn-grid{ grid-template-columns:1fr; } .ob01bn-card-featured{ grid-column:span 1; } }
        @media (prefers-reduced-motion: reduce){ .ob01bn-card{ opacity:1; transform:none; transition:none; } .ob01bn-more svg{ transition:none; } }
      `}</style>
      <section className="ob01bn" data-template="orbit-01" id="funkce">
        <div className="ob01bn-inner">
          <div className="ob01bn-head">
            <p className="ob01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="ob01bn-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {lead && <p className="ob01bn-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>}
          </div>
          <div className="ob01bn-grid" ref={gridRef}>
            {items.map((s, i) => (
              <a key={i} className={`ob01bn-card${i === 0 ? " ob01bn-card-featured" : ""}`} style={{ ["--i" as string]: i % 3 }} href={resolveDemoHref(String(s.href ?? "/produkt"), tenantSlug, isAdmin)}>
                <span className="ob01bn-tag"><GenericEditableText sectionId={sectionId} field={`items.${i}.tag`} value={String(s.tag ?? "")} tag="span" /></span>
                <h3 className="ob01bn-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(s.name ?? "")} tag="span" /></h3>
                <p className="ob01bn-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
                <span className="ob01bn-more">
                  <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
                <Ob01BentoViz i={i} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

type Ob01Role = { label?: string; description?: string; benefits?: string[]; metric?: string; metricLabel?: string };

function UsecasesOrbit01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Use cases");
  const title   = String(content.title   ?? "Jedna platforma. Každá role v ní vidí to svoje.");
  const lead    = String(content.lead    ?? "");
  const metricEyebrow = String(content.metricEyebrow ?? "Typický výsledek");
  const roles: Ob01Role[] = (content.roles as Ob01Role[] | undefined) ?? [];
  const [idx, setIdx] = useState(0);
  const role = roles[Math.min(idx, Math.max(roles.length - 1, 0))] ?? {};
  const benefits = (role.benefits ?? []).slice(0, 3);
  return (
    <>
      <style>{`
        .ob01uc { --ob-accent: var(--color-accent, #047857); --ob-ink: var(--color-secondary, #0A0F16);
          --ob-accent-lt: color-mix(in srgb, var(--color-accent, #047857) 52%, #fff);
          background:var(--ob-ink); color:#fff; font-family:var(--font-body, system-ui, -apple-system, sans-serif);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .ob01uc-inner { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:0.9fr 1.1fr; gap:clamp(32px,5vw,72px); align-items:start; }
        .ob01uc .ob01-eyebrow { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.76rem; font-weight:700; letter-spacing:.16em; text-transform:uppercase; color:var(--ob-accent-lt); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .ob01uc .ob01-eyebrow::before { content:''; width:32px; height:2px; background:var(--ob-accent-lt); }
        .ob01uc-title { font-family:var(--font-heading, system-ui, sans-serif); color:#fff; font-size:clamp(1.9rem,3.8vw,2.9rem); font-weight:800; letter-spacing:-0.03em; line-height:1.06; margin:0 0 14px; }
        .ob01uc-lead { font-size:1.05rem; color:rgba(255,255,255,.78); line-height:1.6; margin:0; }
        .ob01uc-panelwrap { min-width:0; }
        .ob01uc-tabs { position:relative; display:flex; background:rgba(255,255,255,.08); border-radius:8px; padding:3px; margin-bottom:18px; isolation:isolate; }
        .ob01uc-tabs-thumb { position:absolute; top:3px; bottom:3px; left:3px; border-radius:6px; background:#fff;
          box-shadow:0 2px 10px rgba(0,0,0,.35); z-index:0; transition:transform .28s cubic-bezier(.22,.68,0,1);
          width:calc((100% - 6px) / var(--ob-n, 4)); transform:translateX(calc(var(--ob-i, 0) * 100%)); }
        .ob01uc-tab { position:relative; z-index:1; flex:1; border:none; cursor:pointer; padding:10px 2px; border-radius:6px; font-family:inherit;
          font-weight:700; font-size:.84rem; color:rgba(255,255,255,.62); background:transparent; transition:color .2s; white-space:nowrap; }
        .ob01uc-tab[aria-checked="true"] { color:var(--ob-ink); }
        @keyframes ob01ucfade { 0% { opacity:0; transform:translateY(8px); } 100% { opacity:1; transform:translateY(0); } }
        .ob01uc-panel { background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.12); border-radius:12px;
          padding:clamp(22px,2.6vw,32px); animation:ob01ucfade .3s cubic-bezier(.22,.68,0,1) both; }
        .ob01uc-desc { font-size:1rem; color:rgba(255,255,255,.85); line-height:1.6; margin:0 0 16px; }
        .ob01uc-benefits { margin:0 0 18px; border-top:1px solid rgba(255,255,255,.12); }
        .ob01uc-benefit { display:flex; align-items:center; gap:11px; padding:12px 2px; border-bottom:1px solid rgba(255,255,255,.12);
          font-size:.94rem; font-weight:600; color:rgba(255,255,255,.9); }
        .ob01uc-benefit svg { flex-shrink:0; color:var(--ob-accent-lt); }
        .ob01uc-metric-lbl { font-family:var(--font-overpass-mono, ui-monospace, monospace); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.55); margin-bottom:6px; }
        .ob01uc-metric-val { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
        .ob01uc-metric-val > b { font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2.1rem,2.6vw,2.7rem); font-weight:800; letter-spacing:-0.02em; line-height:1; color:var(--ob-accent-lt); font-variant-numeric:tabular-nums; white-space:nowrap; }
        .ob01uc-metric-val b span { font-size:inherit; }
        .ob01uc-metric-val > span { font-size:.88rem; color:rgba(255,255,255,.85); font-weight:600; max-width:18em; line-height:1.35; }
        @media (max-width:980px){ .ob01uc-inner{ grid-template-columns:1fr; } }
        @media (max-width:560px){ .ob01uc-tab{ font-size:.74rem; } }
        @media (prefers-reduced-motion: reduce){ .ob01uc-panel{ animation:none; } .ob01uc-tabs-thumb, .ob01uc-tab{ transition:none; } }
      `}</style>
      <section className="ob01uc" data-template="orbit-01" id="use-cases">
        <div className="ob01uc-inner">
          <div className="ob01uc-head">
            <p className="ob01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="ob01uc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            {lead && <p className="ob01uc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>}
          </div>
          <div className="ob01uc-panelwrap">
            <div className="ob01uc-tabs" role="radiogroup" aria-label={title}
              style={{ ["--ob-n" as string]: Math.max(roles.length, 1), ["--ob-i" as string]: Math.min(idx, Math.max(roles.length - 1, 0)) }}>
              <span className="ob01uc-tabs-thumb" aria-hidden="true" />
              {roles.map((r, i) => (
                <button key={i} type="button" className="ob01uc-tab" role="radio" aria-checked={idx === i} onClick={() => setIdx(i)}>
                  {String(r.label ?? "")}
                </button>
              ))}
            </div>
            <div className="ob01uc-panel" key={idx} aria-live="polite">
              <p className="ob01uc-desc"><GenericEditableText sectionId={sectionId} field={`roles.${idx}.description`} value={String(role.description ?? "")} tag="span" /></p>
              <div className="ob01uc-benefits">
                {benefits.map((b, i) => (
                  <div key={i} className="ob01uc-benefit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`roles.${idx}.benefits.${i}`} value={b} tag="span" />
                  </div>
                ))}
              </div>
              <div className="ob01uc-metric-lbl"><GenericEditableText sectionId={sectionId} field="metricEyebrow" value={metricEyebrow} tag="span" /></div>
              <div className="ob01uc-metric-val">
                <b><GenericEditableText sectionId={sectionId} field={`roles.${idx}.metric`} value={String(role.metric ?? "")} tag="span" /></b>
                <span><GenericEditableText sectionId={sectionId} field={`roles.${idx}.metricLabel`} value={String(role.metricLabel ?? "")} tag="span" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
'''

# ═════════════════════════════ RUN ═══════════════════════════════════════════

rebuild("src/components/sections/NavbarSection.tsx", NAVBAR, [(
    '  if (props.variant === "signal-01-navbar") return <NavbarSignal01 {...props} />;',
    '  if (props.variant === "orbit-01-navbar") return <NavbarOrbit01 {...props} />;',
)])

rebuild("src/components/sections/HeroSection.tsx", HERO, [
    ('  if (variant === "signal-01-hero") return',
     '  if (variant === "orbit-01-hero") return <HeroOrbit01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
     '  if (variant === "hero-orbit-01-page") return <HeroOrbit01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'),
])

rebuild("src/components/sections/FooterSection.tsx", FOOTER, [(
    '  if (variant === "signal-01-footer") return',
    '  if (variant === "orbit-01-footer") return <FooterOrbit01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;',
)])

rebuild("src/components/sections/StatsSection.tsx", STATS, [(
    '  if (variant === "signal-01-stats") return',
    '  if (variant === "orbit-01-stats") return <StatsOrbit01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;',
)])

rebuild("src/components/sections/ServicesSection.tsx", SERVICES, [
    ('  if (variant === "signal-01-services") return',
     '  if (variant === "orbit-01-bento") return <BentoOrbit01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
     '  if (variant === "orbit-01-usecases") return <UsecasesOrbit01 content={content} sectionId={sectionId} />;'),
])

# ── variants.ts registrace (POZOR §2.4: v description žádné hranaté závorky) ──
V = "src/sections/variants.ts"
s = open(V).read()

ENTRIES = [
    ('    { key: "signal-01-hero",',
     '    { key: "orbit-01-hero", label: "Hero – produktové okno s taby (orbit-01)", description: "ORBIT Precision instrument: ink pozadí s jemnou technickou mřížkou, Overpass 800 typografie s emerald akcentovým řádkem; glass produktové okno = signature interakce — segmented taby Přehled, Automatizace a Reporty se sliding thumb živě přepínají mockup s velkou metrikou, hairline řádky a bar chartem bez videa; CTA Rezervovat demo, trust řádek; editovatelné eyebrow, title, titleAccent, subtitle, CTA, trust, windowUrl, taby vč. metrik a řádků; reduced-motion — orbit-01 ORBIT", industries: ["*"] },\n'
     '    { key: "hero-orbit-01-page", label: "Hero podstránka – ink banner + breadcrumb (orbit-01)", description: "ORBIT podstránkové hero: ink panel s technickou mřížkou, mono breadcrumb, Overpass 800 claim + volitelný podnadpis + emerald linka; editovatelné title, subtitle, breadcrumb — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-services",',
     '    { key: "orbit-01-bento", label: "Feature bento – mřížka s CSS produkt vizuály (orbit-01)", description: "ORBIT: bento mřížka na ledové šedé — jedna velká featured karta s mini UI mockupem a menší karty s vlastními CSS vizuály namísto ikon ve čtverečcích; mono tag, Overpass 800 titulky, hairline oddělovače, IO reveal se staggerem; editovatelné eyebrow, title, lead, items s tag, name, description a href — orbit-01 ORBIT", industries: ["*"] },\n'
     '    { key: "orbit-01-usecases", label: "Use cases – přepínač podle role (orbit-01)", description: "ORBIT: ink sekce s interaktivním přepínačem rolí Provoz, Obchod, Finance a Vedení — sliding thumb, panel s popisem, třemi přínosy s fajfkami a velkou metrikou; editovatelné eyebrow, title, lead, roles s label, description, benefits, metric a metricLabel — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "proof-01-pricing",',
     '    { key: "orbit-01-pricing", label: "Pricing – 3 plány + toggle ročně (orbit-01)", description: "ORBIT: 3 cenové plány na ledové šedé, prostřední featured s ink pozadím a badge Nejoblíbenější; segmented toggle Měsíčně a Ročně se sliding thumb živě přepíná ceny, mono ceny s velkou typografií, feature list s emerald checky, CTA per plán; editovatelné eyebrow, title, lead, note, badge, periods a plans s name, priceMonthly, priceYearly, unit, description, features, ctaText, ctaHref a featured — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-cases",',
     '    { key: "orbit-01-cases", label: "Customer stories – fotokarty s metrikou (orbit-01)", description: "ORBIT: karty zákaznických příběhů s fotkou 16/10, industry mono štítkem, velkou Overpass 800 metrikou v emerald nad hairline, titulkem, excerptem a odkazem na CMS detail zakaznici lomeno slug; IO reveal, hover lift; editovatelné eyebrow, title, lead, items s metric, metricLabel, industry, title, excerpt, photo a linkLabel — orbit-01 ORBIT", industries: ["*"] },\n'
     '    { key: "orbit-01-integrations", label: "Integrace – grid nástrojů + API karta (orbit-01)", description: "ORBIT: bílé dlaždice napojení s iniciálovým tile v barvě kategorie a mono popiskem na ledové šedé; poslední karta API s mono code řádkem; IO reveal; editovatelné eyebrow, title, lead, apiTitle, apiCode, apiNote a items s name a category — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "eshop-19-categories",',
     '    { key: "orbit-01-workflow", label: "Workflow – 4 kroky s konektory (orbit-01)", description: "ORBIT: bílá sekce se čtyřmi kroky nasazení propojenými linkou s šipkami, mono číslo s emerald kroužkem, Overpass 800 název, popis a mono durace; IO reveal se staggerem postupně rozsvěcí kroky i konektory; editovatelné eyebrow, title, lead a steps s title, description a duration — orbit-01 ORBIT", industries: ["*"] },\n'
     '    { key: "orbit-01-security", label: "Security pás – compliance badges (orbit-01)", description: "ORBIT: ink pás s velkým titulkem, třemi bezpečnostními body s fajfkami a řadou mono compliance badge chipů typu GDPR, ISO 27017, šifrování a data v EU; editovatelné eyebrow, title, lead, items s title a description, badges — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-testimonials",',
     '    { key: "orbit-01-testimonials", label: "Reference – featured ink layout (orbit-01)", description: "ORBIT: asymetrický grid, první reference featured na ink s velkou citací a metrikou, ostatní bílé hairline karty s hover lift; emerald hvězdy, avatar iniciála, mono role; editovatelné eyebrow, title, lead, testimonials s text, name, role, rating — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-faq",',
     '    { key: "orbit-01-faq", label: "FAQ – centrovaný hairline accordion + CTA (orbit-01)", description: "ORBIT: bílý centrovaný sloupec max 760, hairline accordion s kruhovým plus a kříž togglem, pod ním emerald CTA s anchor odkazem na demo formulář; editovatelné eyebrow, title, lead, items s question a answer, ctaText, ctaHref — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-contact",',
     '    { key: "orbit-01-contact", label: "Demo formulář – ink panel + select (orbit-01)", description: "ORBIT: ink panel vlevo s mono info řádky, harmonogramem dema a fakturačními údaji, vpravo bílá karta s formulářem — jméno, společnost, pracovní e-mail, telefon, select Počet lidí v týmu, zpráva, GDPR souhlas, honeypot; POST na contact API, stavy sending, success a error; editovatelné všechny labely, teamSizes i success texty — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-stats",',
     '    { key: "orbit-01-stats", label: "Trust pás – Overpass čísla count-up + mono popisky (orbit-01)", description: "ORBIT: bílý pás s velkými Overpass 800 čísly s count-up na scroll jen na veřejném webu, vertikální hairline oddělovače, mono popisky; pod horizontální linkou inline badges s emerald fajfkami; editovatelné items s value a label, badges — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-navbar",',
     '    { key: "orbit-01-navbar", label: "Navbar – sticky ink + mobilní CTA lišta (orbit-01)", description: "ORBIT: sticky tmavý ink blur navbar s hairline linkou, logo, flat linky, ghost Přihlásit se + emerald CTA radius 6; mobil hamburger s drawer panelem a fixní spodní CTA lištou Zavolat a Vyzkoušet se safe-area paddingem; editovatelné siteName, logoUrl, links, loginText, ctaText, ctaHref i mobilní labely — orbit-01 ORBIT", industries: ["*"] },'),
    ('    { key: "signal-01-footer",',
     '    { key: "orbit-01-footer", label: "Footer – tmavší ink + status řádek (orbit-01)", description: "ORBIT: footer na tmavším ink, bílé logo + tagline + status chip se zelenou tečkou Všechny systémy v provozu + social; sloupce Produkt, Zdroje s odkazy na dokumentaci, changelog, status a API, Kontakt s tel, e-mail, adresa, IČO; spodní řádek copyright + legal odkazy + WeberoCredit; editovatelné tagline, statusText, links, resources, socials, legalLinks i kontakty — orbit-01 ORBIT", industries: ["*"] },'),
]

for anchor, line in ENTRIES:
    s = ensure_line(s, anchor, line)
open(V, "w").write(s)
print(f"registered variants in {V}")
print("DONE — orbit-01 rebuild complete (wave 1: navbar, hero, page hero, footer)")
