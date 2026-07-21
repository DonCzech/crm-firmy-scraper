#!/usr/bin/env python3
"""Deterministic rebuild of all proof-01 section components.

The parallel session keeps reverting files; this script rebuilds the canonical
final state (elevated design + theme-var fonts + photo-forward hero) idempotently:
 - truncates each file at the pf01 marker (blocks live at EOF) and re-appends
 - ensures dispatch lines exist
Run from venom/: python3 scripts/proof01-rebuild.py
"""
import sys

FB = "var(--font-body, system-ui, -apple-system, sans-serif)"
FH = "var(--font-heading, system-ui, sans-serif)"
FS = "var(--font-instrument-serif, Georgia, serif)"

def ensure_dispatch(s, anchor, line):
    if line.strip() in s: return s
    assert anchor in s, f"dispatch anchor missing: {anchor[:60]!r}"
    return s.replace(anchor, line + "\n" + anchor, 1)

def rebuild(path, marker, block, dispatches):
    s = open(path).read()
    i = s.find(marker)
    if i != -1:
        # marker sits inside a comment banner starting with "// ══"
        j = s.rfind("// ══", 0, i)
        s = s[:j].rstrip() + "\n"
    s = s.rstrip() + "\n" + block
    for anchor, line in dispatches:
        s = ensure_dispatch(s, anchor, line)
    open(path, "w").write(s)
    print(f"rebuilt {path}")

# ═════════════════════════════ HERO ══════════════════════════════════════════
HERO = r'''
// ══ PROOF — Universal Service Engine (proof-01) ═══════════════════════════════
// Photo-forward hero: vlevo typografie (H1 + Instrument Serif akcent), vpravo
// fotka řemesla s plovoucí kalkulační kartou (signature interakce). Fonty jdou
// z theme tokenů (--font-heading/--font-body); serif akcent z --font-instrument-serif.
type ProofScope = { label?: string; mult?: number };
type ProofSvc = { label?: string; from?: number; to?: number; unit?: string; note?: string };

function proofResolveHref(href: string, tenantSlug?: string, isAdmin?: boolean) {
  if (!tenantSlug) return href;
  if (href.startsWith("#") || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) return href;
  return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href.startsWith("/") ? href : "/" + href}`;
}

function HeroProof01({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const eyebrow     = String(content.eyebrow     ?? "Servis, na který se spolehnete");
  const title       = String(content.title       ?? "Vyřešíme to napoprvé —");
  const titleAccent = String(content.titleAccent ?? "bez odkladů a bez překvapení.");
  const subtitle    = String(content.subtitle    ?? "Od nezávazné poptávky po hotové dílo. Pevná cena předem, jasné termíny a garantovaná kvalita.");
  const ctaText          = String(content.ctaText          ?? "Nezávazná poptávka");
  const ctaHref          = String(content.ctaHref          ?? "#poptavka");
  const ctaSecondaryText = String(content.ctaSecondaryText ?? "Zavolat: 704 123 456");
  const ctaSecondaryHref = String(content.ctaSecondaryHref ?? "tel:+420704123456");
  const photo    = String(content.photo    ?? "/templates/proof-01/img/hero-craftsman.webp");
  const photoAlt = String(content.photoAlt ?? "Řemeslník při práci");
  const rawTrust = content.trust as string[] | undefined;
  const trust = rawTrust && rawTrust.length ? rawTrust : ["Pevná cena předem", "Záruka 5 let", "Hodnocení 4,9 / 5"];

  const selectorTitle    = String(content.selectorTitle    ?? "Spočítejte si orientační cenu");
  const selectorSubtitle = String(content.selectorSubtitle ?? "Vyberte službu a rozsah zakázky.");
  const selectorScopeLbl = String(content.selectorScopeLbl ?? "Rozsah zakázky");
  const estimateLabel    = String(content.estimateLabel    ?? "Orientační cena");
  const selectorCtaText  = String(content.selectorCtaText  ?? "Chci přesnou nabídku");
  const selectorCtaHref  = String(content.selectorCtaHref  ?? "#poptavka");

  const services: ProofSvc[] = (content.services as ProofSvc[] | undefined)?.length
    ? (content.services as ProofSvc[])
    : [
        { label: "Drobná oprava", from: 900, to: 2500, unit: "zakázka", note: "Výjezd do 24 h" },
        { label: "Instalace / montáž", from: 4500, to: 18000, unit: "zakázka", note: "Vč. materiálu" },
        { label: "Kompletní realizace", from: 35000, to: 220000, unit: "projekt", note: "Na klíč se zárukou" },
      ];
  const scopes: ProofScope[] = (content.scopes as ProofScope[] | undefined)?.length
    ? (content.scopes as ProofScope[])
    : [{ label: "Malý", mult: 0.7 }, { label: "Střední", mult: 1 }, { label: "Velký", mult: 1.6 }];

  const [svcIdx, setSvcIdx] = useState(0);
  const [scopeIdx, setScopeIdx] = useState(1);
  const svc = services[Math.min(svcIdx, services.length - 1)] ?? {};
  const mult = scopes[Math.min(scopeIdx, scopes.length - 1)]?.mult ?? 1;
  const from = Math.round(((svc.from ?? 0) * mult) / 100) * 100;
  const to = Math.round(((svc.to ?? 0) * mult) / 100) * 100;
  const fmt = (v: number) => v.toLocaleString("cs-CZ");
  const unit = String(svc.unit ?? "zakázka");

  return (
    <>
      <style>{`
        .pf01hero { position: relative; background: var(--pf-paper, #F5F3EE); overflow: hidden;
          font-family: FONT_BODY; color: var(--pf-ink, #14161B); }
        .pf01hero-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto;
          padding: clamp(40px, 6vw, 84px) clamp(20px, 5vw, 48px);
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 4vw, 56px); align-items: center; }
        @keyframes pf01up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .pf01hero-left { min-width: 0; padding-right: clamp(0px, 2vw, 24px); }
        .pf01hero-left > * { animation: pf01up .65s cubic-bezier(.22,.68,0,1) both; }
        .pf01hero-left > *:nth-child(1) { animation-delay: .05s; }
        .pf01hero-left > *:nth-child(2) { animation-delay: .13s; }
        .pf01hero-left > *:nth-child(3) { animation-delay: .22s; }
        .pf01hero-left > *:nth-child(4) { animation-delay: .32s; }
        .pf01hero-left > *:nth-child(5) { animation-delay: .44s; }
        .pf01hero-eyebrow { font-family: FONT_SERIF; font-style: italic;
          font-size: clamp(1.05rem, 1.5vw, 1.3rem); color: var(--pf-accent, #E7502E); margin: 0 0 18px;
          display: inline-flex; align-items: center; gap: 12px; }
        .pf01hero-eyebrow::before { content: ''; width: 40px; height: 2px; background: var(--pf-accent, #E7502E); }
        .pf01hero-h1 { font-family: FONT_HEAD; color: var(--pf-ink, #14161B);
          font-size: clamp(2.2rem, 4.6vw, 3.7rem); font-weight: 800; line-height: 1.04;
          letter-spacing: -0.03em; margin: 0 0 22px; }
        .pf01hero-h1-accent { display: block; font-family: FONT_SERIF;
          font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: var(--pf-accent, #E7502E);
          font-size: .92em; margin-top: .08em; }
        .pf01hero-sub { font-size: clamp(1rem, 1.3vw, 1.14rem); line-height: 1.62; color: var(--pf-muted, #6A6E78);
          max-width: 30em; margin: 0 0 32px; }
        .pf01hero-ctas { display: flex; flex-wrap: wrap; gap: 14px; }
        .pf01btn-primary { position: relative; overflow: hidden; isolation: isolate; display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 30px; background: var(--pf-accent, #E7502E); color: #fff; font-weight: 700; font-size: .98rem;
          text-decoration: none; border-radius: 10px; transition: transform .35s cubic-bezier(.22,.68,0,1), box-shadow .35s ease; white-space: nowrap; }
        .pf01btn-primary > * { position: relative; z-index: 2; }
        .pf01btn-primary::before { content: ''; position: absolute; top: 0; left: -130%; width: 55%; height: 100%; z-index: 1;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.4), transparent); transform: skewX(-18deg); transition: left .6s cubic-bezier(.22,.68,0,1); }
        .pf01btn-primary:hover::before { left: 140%; }
        .pf01btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 30px -12px rgba(231,80,46,.7); }
        .pf01btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; background: #fff;
          color: var(--pf-ink, #14161B); font-weight: 600; font-size: .98rem; text-decoration: none; border: 1.5px solid var(--pf-border, #D9D4C9);
          border-radius: 10px; transition: border-color .2s, background .2s; white-space: nowrap; }
        .pf01btn-ghost:hover { border-color: var(--pf-ink, #14161B); }
        .pf01hero-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 34px;
          padding-top: 22px; border-top: 1px solid var(--pf-border, #E4E0D8); }
        .pf01hero-trust-item { display: inline-flex; align-items: center; gap: 8px; font-size: .87rem; font-weight: 700; }
        .pf01hero-trust-item svg { flex-shrink: 0; color: var(--pf-accent, #E7502E); }
        .pf01hero-trust-item + .pf01hero-trust-item::before { content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: var(--pf-border, #D9D4C9); margin-right: 14px; }
        /* right: photo + floating card */
        .pf01hero-visual { position: relative; min-width: 0; animation: pf01up .7s cubic-bezier(.22,.68,0,1) .18s both;
          padding: 0 0 56px clamp(0px, 6vw, 96px); }
        .pf01hero-photo-wrap { position: relative; border-radius: 22px; overflow: hidden; aspect-ratio: 4 / 5;
          max-height: 640px; box-shadow: 0 40px 80px -40px rgba(20,22,27,.45); }
        .pf01hero-photo-wrap::after { content: ''; position: absolute; inset: 0;
          background: linear-gradient(200deg, transparent 55%, rgba(20,22,27,.38) 100%); pointer-events: none; }
        .pf01hero-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .pf01sel { position: absolute; left: 0; bottom: 0; z-index: 2; width: min(400px, 92%);
          background: var(--pf-surface, #fff); border: 1px solid var(--pf-border, #E4E0D8);
          border-radius: 18px; padding: 22px 22px 20px; box-shadow: 0 34px 70px -30px rgba(20,22,27,.5); overflow: hidden; }
        .pf01sel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, var(--pf-accent, #E7502E), #f0855f); }
        @keyframes pf01pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(231,80,46,.45); } 50% { box-shadow: 0 0 0 5px rgba(231,80,46,0); } }
        .pf01sel-badge { position: absolute; top: 14px; right: 16px; display: inline-flex; align-items: center; gap: 7px;
          background: var(--pf-ink, #14161B); color: #fff; font-size: .62rem; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; padding: 5px 10px; border-radius: 999px; }
        .pf01sel-badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--pf-accent, #E7502E);
          animation: pf01pulse 2.2s ease-in-out infinite; }
        .pf01sel-title { font-size: 1.08rem; font-weight: 800; letter-spacing: -.01em; margin: 2px 0 2px; padding-right: 96px; }
        .pf01sel-sub { font-size: .8rem; color: var(--pf-muted, #6A6E78); margin: 0 0 14px; }
        .pf01sel-svcs { display: grid; gap: 7px; margin-bottom: 14px; }
        .pf01sel-svc { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; cursor: pointer;
          padding: 9px 12px; border-radius: 10px; border: 1.5px solid var(--pf-border, #E4E0D8); background: var(--pf-surface, #fff);
          transition: border-color .18s, background .18s; font-family: inherit; color: inherit; }
        .pf01sel-svc:hover { border-color: #c9c3b6; }
        .pf01sel-svc[aria-pressed="true"] { border-color: var(--pf-accent, #E7502E); background: rgba(231,80,46,.05); }
        .pf01sel-radio { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--pf-border, #D9D4C9); flex-shrink: 0; position: relative; transition: border-color .18s; }
        .pf01sel-svc[aria-pressed="true"] .pf01sel-radio { border-color: var(--pf-accent, #E7502E); }
        .pf01sel-svc[aria-pressed="true"] .pf01sel-radio::after { content: ''; position: absolute; inset: 2.5px; border-radius: 50%; background: var(--pf-accent, #E7502E); }
        .pf01sel-svc-label { display: block; font-weight: 700; font-size: .88rem; line-height: 1.25; }
        .pf01sel-svc-note { display: block; font-size: .72rem; color: var(--pf-muted, #6A6E78); line-height: 1.3; }
        .pf01sel-scope-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--pf-muted, #6A6E78); margin-bottom: 6px; }
        .pf01sel-scopes { position: relative; display: flex; background: var(--pf-paper, #F5F3EE); border-radius: 10px; padding: 3px; margin-bottom: 14px; width: 100%; isolation: isolate; }
        .pf01sel-scopes-thumb { position: absolute; top: 3px; bottom: 3px; left: 3px; border-radius: 8px; background: var(--pf-surface, #fff);
          box-shadow: 0 2px 8px rgba(20,22,27,.14); z-index: 0; transition: transform .28s cubic-bezier(.22,.68,0,1);
          width: calc((100% - 6px) / var(--pf-n, 3)); transform: translateX(calc(var(--pf-i, 0) * 100%)); }
        .pf01sel-scope { position: relative; z-index: 1; flex: 1; border: none; cursor: pointer; padding: 8px 4px; border-radius: 8px; font-family: inherit;
          font-weight: 700; font-size: .8rem; color: var(--pf-muted, #6A6E78); background: transparent; transition: color .2s; }
        .pf01sel-scope[aria-pressed="true"] { color: var(--pf-ink, #14161B); }
        @keyframes pf01price { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
        .pf01sel-result { display: flex; align-items: center; justify-content: space-between; gap: 12px;
          background: var(--pf-ink, #14161B); border-radius: 12px; padding: 13px 16px; color: #fff; }
        .pf01sel-result-lbl { font-size: .64rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.55); margin-bottom: 3px; }
        .pf01sel-result-val { font-size: 1.18rem; font-weight: 800; line-height: 1; letter-spacing: -.01em;
          animation: pf01price .32s cubic-bezier(.22,.68,0,1) both; font-variant-numeric: tabular-nums; white-space: nowrap; }
        .pf01sel-result-val em { font-style: normal; color: var(--pf-accent, #E7502E); }
        .pf01sel-result-unit { font-size: .68rem; color: rgba(255,255,255,.5); margin-top: 3px; }
        .pf01sel-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; width: 100%;
          padding: 12px; background: var(--pf-accent, #E7502E); color: #fff; font-weight: 700; font-size: .9rem; text-decoration: none;
          border-radius: 10px; transition: filter .2s, transform .2s; }
        .pf01sel-cta:hover { filter: brightness(1.06); transform: translateY(-1px); }
        @media (max-width: 1000px) {
          .pf01hero-inner { grid-template-columns: 1fr; }
          .pf01hero-visual { padding: 0; }
          .pf01hero-photo-wrap { aspect-ratio: 16 / 10; max-height: 340px; }
          .pf01sel { position: static; width: 100%; margin-top: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pf01hero-left > *, .pf01hero-visual, .pf01sel-result-val { animation: none; }
          .pf01sel-badge::before { animation: none; }
          .pf01btn-primary, .pf01btn-primary::before, .pf01sel-svc, .pf01sel-scope, .pf01sel-scopes-thumb { transition: none; }
        }
      `}</style>

      <section className="pf01hero" data-template="proof-01" id="uvod">
        <div className="pf01hero-inner">
          <div className="pf01hero-left">
            <p className="pf01hero-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h1 className="pf01hero-h1">
              <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              {titleAccent && (
                <span className="pf01hero-h1-accent">
                  <GenericEditableText sectionId={sectionId} field="titleAccent" value={titleAccent} tag="span" />
                </span>
              )}
            </h1>
            <p className="pf01hero-sub">
              <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="span" />
            </p>
            <div className="pf01hero-ctas">
              <a href={proofResolveHref(ctaHref, tenantSlug, isAdmin)} className="pf01btn-primary" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href={proofResolveHref(ctaSecondaryHref, tenantSlug, isAdmin)} className="pf01btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <GenericEditableText sectionId={sectionId} field="ctaSecondaryText" value={ctaSecondaryText} tag="span" />
              </a>
            </div>
            <div className="pf01hero-trust">
              {trust.map((t, i) => (
                <span key={i} className="pf01hero-trust-item">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                  <GenericEditableText sectionId={sectionId} field={`trust.${i}`} value={t} tag="span" />
                </span>
              ))}
            </div>
          </div>

          <div className="pf01hero-visual">
            <div className="pf01hero-photo-wrap">
              <GenericEditableImage sectionId={sectionId} field="photo" src={photo} alt={photoAlt} className="pf01hero-photo-slot">
                <img src={photo} alt={photoAlt} className="pf01hero-photo" />
              </GenericEditableImage>
            </div>

            <div className="pf01sel" role="group" aria-label={selectorTitle}>
              <span className="pf01sel-badge">Živá kalkulace</span>
              <div className="pf01sel-title">
                <GenericEditableText sectionId={sectionId} field="selectorTitle" value={selectorTitle} tag="span" />
              </div>
              <p className="pf01sel-sub">
                <GenericEditableText sectionId={sectionId} field="selectorSubtitle" value={selectorSubtitle} tag="span" />
              </p>
              <div className="pf01sel-svcs" role="radiogroup" aria-label="Typ služby">
                {services.map((s, i) => (
                  <button key={i} type="button" className="pf01sel-svc" role="radio" aria-checked={svcIdx === i} aria-pressed={svcIdx === i} onClick={() => setSvcIdx(i)}>
                    <span className="pf01sel-radio" aria-hidden="true" />
                    <span style={{ minWidth: 0 }}>
                      <span className="pf01sel-svc-label">
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.label`} value={String(s.label ?? "")} tag="span" />
                      </span>
                      <span className="pf01sel-svc-note">
                        <GenericEditableText sectionId={sectionId} field={`services.${i}.note`} value={String(s.note ?? "")} tag="span" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="pf01sel-scope-lbl">
                <GenericEditableText sectionId={sectionId} field="selectorScopeLbl" value={selectorScopeLbl} tag="span" />
              </div>
              <div className="pf01sel-scopes" role="radiogroup" aria-label={selectorScopeLbl}
                style={{ ["--pf-n" as string]: scopes.length, ["--pf-i" as string]: Math.min(scopeIdx, scopes.length - 1) }}>
                <span className="pf01sel-scopes-thumb" aria-hidden="true" />
                {scopes.map((s, i) => (
                  <button key={i} type="button" className="pf01sel-scope" role="radio" aria-checked={scopeIdx === i} aria-pressed={scopeIdx === i} onClick={() => setScopeIdx(i)}>
                    {String(s.label ?? "")}
                  </button>
                ))}
              </div>
              <div className="pf01sel-result" aria-live="polite">
                <div>
                  <div className="pf01sel-result-lbl">
                    <GenericEditableText sectionId={sectionId} field="estimateLabel" value={estimateLabel} tag="span" />
                  </div>
                  <div className="pf01sel-result-val" key={`${svcIdx}-${scopeIdx}`}>
                    <em>{fmt(from)}</em> – {fmt(to)} Kč
                  </div>
                  <div className="pf01sel-result-unit">za {unit} · vč. materiálu</div>
                </div>
              </div>
              <a href={proofResolveHref(selectorCtaHref, tenantSlug, isAdmin)} className="pf01sel-cta" data-btn="primary">
                <GenericEditableText sectionId={sectionId} field="selectorCtaText" value={selectorCtaText} tag="span" />
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ── hero-proof-01-page — podstránkové hero (breadcrumb + claim) ────────────────
function HeroProof01Page({ content, sectionId, tenantSlug, isAdmin }: Omit<Props, "variant">) {
  const title      = String(content.title      ?? "Podstránka");
  const subtitle   = String(content.subtitle   ?? "");
  const breadcrumb = String(content.breadcrumb ?? "Domů");
  const breadHref  = String(content.breadcrumbHref ?? "/");
  return (
    <>
      <style>{`
        .pf01pb { position: relative; background: var(--pf-ink, #14161B); color: #fff;
          font-family: FONT_BODY; overflow: hidden; }
        .pf01pb::before { content: ''; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 72px 72px; -webkit-mask-image: radial-gradient(900px 400px at 85% 0%, #000, transparent 70%); mask-image: radial-gradient(900px 400px at 85% 0%, #000, transparent 70%); }
        .pf01pb-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; padding: clamp(44px, 6vw, 76px) clamp(20px, 5vw, 48px); }
        .pf01pb-crumb { display: flex; align-items: center; gap: 8px; font-size: .82rem; color: rgba(255,255,255,.55); margin-bottom: 16px; }
        .pf01pb-crumb a { color: rgba(255,255,255,.55); text-decoration: none; transition: color .2s; }
        .pf01pb-crumb a:hover { color: var(--pf-accent, #E7502E); }
        .pf01pb-crumb .cur { color: #fff; }
        .pf01pb-title { font-family: FONT_HEAD; color: #fff; font-size: clamp(1.9rem, 4.2vw, 3rem); font-weight: 800; letter-spacing: -.02em; line-height: 1.06; margin: 0; }
        .pf01pb-sub { font-size: clamp(1rem, 1.35vw, 1.12rem); color: rgba(255,255,255,.66); max-width: 40em; margin: 14px 0 0; line-height: 1.6; }
        .pf01pb-rule { width: 56px; height: 3px; background: var(--pf-accent, #E7502E); margin-top: 24px; }
      `}</style>
      <section className="pf01pb" data-template="proof-01">
        <div className="pf01pb-inner">
          <div className="pf01pb-crumb">
            <a href={proofResolveHref(breadHref, tenantSlug, isAdmin)}>
              <GenericEditableText sectionId={sectionId} field="breadcrumb" value={breadcrumb} tag="span" />
            </a>
            <span aria-hidden="true">/</span>
            <span className="cur">{title}</span>
          </div>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h1" className="pf01pb-title" />
          {subtitle && <GenericEditableText sectionId={sectionId} field="subtitle" value={subtitle} tag="p" className="pf01pb-sub" />}
          <div className="pf01pb-rule" aria-hidden="true" />
        </div>
      </section>
    </>
  );
}
'''

rebuild("src/components/sections/HeroSection.tsx",
        "PROOF — Universal Service Engine (proof-01)",
        HERO.replace("FONT_BODY", FB).replace("FONT_HEAD", FH).replace("FONT_SERIF", FS),
        [(
          '  if (variant === "ddd-01-hero")',
          '  if (variant === "proof-01-hero") return <HeroProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
          '  if (variant === "hero-proof-01-page") return <HeroProof01Page content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'
        )])
print("OK hero")
