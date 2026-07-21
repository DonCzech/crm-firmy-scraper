#!/usr/bin/env python3
"""Rebuild proof-01 components part 2: services/process/pricing, stats, testimonials, faq, contact."""
FB = "var(--font-body, system-ui, -apple-system, sans-serif)"
FH = "var(--font-heading, system-ui, sans-serif)"
FS = "var(--font-instrument-serif, Georgia, serif)"

def sub(t): return t.replace("FONT_BODY", FB).replace("FONT_HEAD", FH).replace("FONT_SERIF", FS)

def ensure_dispatch(s, anchor, line):
    if line.strip() in s: return s
    assert anchor in s, f"anchor missing: {anchor[:60]!r}"
    return s.replace(anchor, line + "\n" + anchor, 1)

def rebuild(path, marker, block, dispatches):
    s = open(path).read()
    i = s.find(marker)
    if i != -1:
        j = s.rfind("// ══", 0, i)
        s = s[:j].rstrip() + "\n"
    s = s.rstrip() + "\n" + sub(block)
    for anchor, line in dispatches:
        s = ensure_dispatch(s, anchor, line)
    open(path, "w").write(s)
    print(f"rebuilt {path}")

# ═════════════════════ SERVICES / PROCESS / PRICING ═══════════════════════════
SVC = r'''
// ══ PROOF (proof-01) — services / process / pricing ═══════════════════════════
type Pf01Svc = { name?: string; description?: string; icon?: string; priceFrom?: string; href?: string };

function Pf01Icon({ name }: { name?: string }) {
  const p: Record<string, React.ReactNode> = {
    wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    droplet: <path d="M12 2.7l5.66 5.66a8 8 0 1 1-11.31 0z"/>,
    leaf: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6"/>,
    truck: <><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
    tool: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>,
  };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name ?? "wrench"] ?? p.wrench}
    </svg>
  );
}

function ServicesProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Co pro vás uděláme");
  const title   = String(content.title   ?? "Služby na míru vaší zakázce");
  const lead    = String(content.lead    ?? "Vyberte oblast — na detailu služby najdete rozsah, ceník a příklady realizací.");
  const items = (content.items as Pf01Svc[] | undefined) ?? [];
  const linkLabel = String(content.linkLabel ?? "Zjistit více");
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".pf01svc-card"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pf01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);
  return (
    <>
      <style>{`
        .pf01svc { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8; --pf-surface:#fff;
          background:#fff; font-family:FONT_BODY; color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01svc-inner { max-width:1280px; margin:0 auto; }
        .pf01svc-head { max-width:640px; margin-bottom:clamp(32px,5vw,56px); }
        .pf01-eyebrow { font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01-eyebrow::before { content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01svc-title { font-family:FONT_HEAD; color:var(--pf-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01svc-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01svc-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:18px; }
        .pf01svc-card { position:relative; display:flex; flex-direction:column; gap:14px; background:var(--pf-surface); border:1px solid var(--pf-border);
          border-radius:16px; padding:26px; text-decoration:none; color:inherit; overflow:hidden;
          opacity:0; transform:translateY(20px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 70ms), box-shadow .25s, border-color .25s; }
        .pf01svc-card.pf01-vis { opacity:1; transform:translateY(0); }
        .pf01svc-card.pf01-vis:hover { transform:translateY(-5px); box-shadow:0 26px 48px -26px rgba(20,22,27,.42); border-color:#d4cec1;
          transition:opacity .2s, transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s, border-color .25s; }
        .pf01svc-card::after { content:''; position:absolute; left:0; top:0; height:100%; width:3px; background:var(--pf-accent); transform:scaleY(0); transform-origin:top; transition:transform .3s cubic-bezier(.22,.68,0,1); }
        .pf01svc-card:hover::after { transform:scaleY(1); }
        .pf01svc-idx { position:absolute; top:14px; right:18px; font-family:FONT_SERIF; font-style:italic;
          font-size:2.2rem; line-height:1; color:rgba(20,22,27,.07); transition:color .3s; pointer-events:none; user-select:none; }
        .pf01svc-card:hover .pf01svc-idx { color:rgba(231,80,46,.22); }
        .pf01svc-ic { width:52px; height:52px; border-radius:13px; background:rgba(231,80,46,.1); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .25s, color .25s, transform .35s cubic-bezier(.34,1.56,.64,1); }
        .pf01svc-card:hover .pf01svc-ic { background:var(--pf-accent); color:#fff; transform:scale(1.06) rotate(-4deg); }
        .pf01svc-name { font-family:FONT_HEAD; color:var(--pf-ink); font-size:1.18rem; font-weight:800; letter-spacing:-.01em; margin:0; }
        .pf01svc-desc { font-size:.94rem; color:var(--pf-muted); line-height:1.55; margin:0; flex:1; }
        .pf01svc-foot { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:4px; }
        .pf01svc-price { font-weight:800; font-size:.98rem; }
        .pf01svc-more { display:inline-flex; align-items:center; gap:6px; font-weight:700; font-size:.88rem; color:var(--pf-accent); }
        .pf01svc-more svg { transition:transform .25s; } .pf01svc-card:hover .pf01svc-more svg { transform:translateX(4px); }
        @media (prefers-reduced-motion: reduce){ .pf01svc-card{ opacity:1; transform:none; transition:none; } .pf01svc-card::after,.pf01svc-more svg,.pf01svc-ic{ transition:none; } }
      `}</style>
      <section className="pf01svc" data-template="proof-01" id="sluzby">
        <div className="pf01svc-inner">
          <div className="pf01svc-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01svc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01svc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01svc-grid" ref={gridRef}>
            {items.map((s, i) => (
              <a key={i} className="pf01svc-card" style={{ ["--i" as string]: i % 3 }} href={resolveDemoHref(String(s.href ?? "/sluzby"), tenantSlug, isAdmin)}>
                <span className="pf01svc-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="pf01svc-ic"><Pf01Icon name={s.icon} /></span>
                <h3 className="pf01svc-name"><GenericEditableText sectionId={sectionId} field={`items.${i}.name`} value={String(s.name ?? "")} tag="span" /></h3>
                <p className="pf01svc-desc"><GenericEditableText sectionId={sectionId} field={`items.${i}.description`} value={String(s.description ?? "")} tag="span" /></p>
                <div className="pf01svc-foot">
                  <span className="pf01svc-price"><GenericEditableText sectionId={sectionId} field={`items.${i}.priceFrom`} value={String(s.priceFrom ?? "")} tag="span" /></span>
                  <span className="pf01svc-more">
                    <GenericEditableText sectionId={sectionId} field="linkLabel" value={linkLabel} tag="span" />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProcessProof01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Jak to probíhá");
  const title   = String(content.title   ?? "Čtyři kroky od poptávky k hotovu");
  const lead    = String(content.lead    ?? "Transparentní proces bez skrytých kroků. Vždy víte, co bude následovat.");
  const steps = (content.steps as Array<{ title?: string; description?: string }> | undefined) ?? [];
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = gridRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".pf01proc-step"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("pf01-vis"); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);
  return (
    <>
      <style>{`
        .pf01proc { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8;
          background:var(--pf-ink); color:#fff; font-family:FONT_BODY;
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01proc-inner { max-width:1280px; margin:0 auto; }
        .pf01proc-head { max-width:640px; margin-bottom:clamp(36px,5vw,60px); }
        .pf01proc .pf01-eyebrow { font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01proc .pf01-eyebrow::before { content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01proc-title { font-family:FONT_HEAD; color:#fff; font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01proc-lead { font-size:1.05rem; color:rgba(255,255,255,.62); line-height:1.6; margin:0; }
        .pf01proc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:2px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.1); border-radius:16px; overflow:hidden; }
        .pf01proc-step { background:var(--pf-ink); padding:34px 26px 30px; position:relative;
          opacity:0; transform:translateY(18px);
          transition:opacity .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), transform .55s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms), background .25s; }
        .pf01proc-step.pf01-vis { opacity:1; transform:translateY(0); }
        .pf01proc-step:hover { background:#1a1d24; }
        .pf01proc-step::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--pf-accent);
          transform:scaleX(0); transform-origin:left; transition:transform .6s cubic-bezier(.22,.68,0,1) calc(var(--i,0) * 110ms + 250ms); }
        .pf01proc-step.pf01-vis::before { transform:scaleX(1); }
        .pf01proc-num { display:inline-flex; align-items:baseline; gap:8px; font-family:FONT_SERIF; font-style:italic;
          font-size:2.7rem; line-height:1; color:var(--pf-accent); margin-bottom:18px; }
        .pf01proc-num::after { content:''; width:26px; height:1px; background:rgba(231,80,46,.5); align-self:center; }
        .pf01proc-step h3 { font-family:FONT_HEAD; color:#fff; font-size:1.13rem; font-weight:800; margin:0 0 8px; letter-spacing:-.01em; }
        .pf01proc-step p { font-size:.92rem; color:rgba(255,255,255,.62); line-height:1.58; margin:0; }
        @media (prefers-reduced-motion: reduce){ .pf01proc-step{ opacity:1; transform:none; transition:none; } .pf01proc-step::before{ transform:scaleX(1); transition:none; } }
      `}</style>
      <section className="pf01proc" data-template="proof-01" id="postup">
        <div className="pf01proc-inner">
          <div className="pf01proc-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01proc-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01proc-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01proc-grid" ref={gridRef}>
            {steps.map((s, i) => (
              <div key={i} className="pf01proc-step" style={{ ["--i" as string]: i }}>
                <div className="pf01proc-num">{String(i + 1).padStart(2, "0")}</div>
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

function PricingProof01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Orientační ceník");
  const title   = String(content.title   ?? "Balíčky, které dávají smysl");
  const lead    = String(content.lead    ?? "Přehledné ceny předem. Přesnou nabídku připravíme po nezávazné konzultaci.");
  const note    = String(content.note    ?? "Ceny jsou orientační vč. DPH. Finální cena dle konkrétního rozsahu zakázky.");
  type Tier = { name?: string; price?: string; unit?: string; description?: string; features?: string[]; ctaText?: string; ctaHref?: string; featured?: boolean };
  const tiers = (content.tiers as Tier[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .pf01pr { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8; --pf-surface:#fff;
          background:var(--pf-paper,#F5F3EE); font-family:FONT_BODY; color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01pr-inner { max-width:1180px; margin:0 auto; }
        .pf01pr-head { max-width:640px; margin-bottom:clamp(32px,5vw,52px); }
        .pf01pr .pf01-eyebrow { font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01pr .pf01-eyebrow::before { content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01pr-title { font-family:FONT_HEAD; color:var(--pf-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01pr-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01pr-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:18px; align-items:stretch; }
        .pf01pr-card { display:flex; flex-direction:column; background:var(--pf-surface); border:1px solid var(--pf-border); border-radius:18px; padding:30px 26px; transition:transform .25s, box-shadow .25s; }
        .pf01pr-card[data-featured="true"] { border:2px solid var(--pf-ink); box-shadow:0 34px 64px -34px rgba(20,22,27,.55); position:relative; }
        @media (min-width:900px){ .pf01pr-card[data-featured="true"] { transform:scale(1.03); } .pf01pr-card[data-featured="true"]:hover { transform:scale(1.03) translateY(-4px); } }
        .pf01pr-card:hover { transform:translateY(-4px); box-shadow:0 26px 48px -28px rgba(20,22,27,.42); }
        .pf01pr-badge { position:absolute; top:-12px; left:26px; background:var(--pf-accent); color:#fff; font-size:.68rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:5px 11px; border-radius:999px; }
        .pf01pr-name { font-family:FONT_HEAD; color:var(--pf-ink); font-size:1.05rem; font-weight:800; letter-spacing:.01em; margin:0 0 10px; }
        .pf01pr-price { display:flex; align-items:baseline; gap:6px; margin-bottom:6px; }
        .pf01pr-price b { font-size:2rem; font-weight:800; letter-spacing:-.02em; }
        .pf01pr-price span { color:var(--pf-muted); font-weight:600; font-size:.86rem; }
        .pf01pr-desc { font-size:.9rem; color:var(--pf-muted); line-height:1.5; margin:0 0 20px; }
        .pf01pr-feats { list-style:none; padding:0; margin:0 0 24px; display:grid; gap:10px; flex:1; }
        .pf01pr-feats li { display:flex; align-items:flex-start; gap:9px; font-size:.92rem; line-height:1.4; }
        .pf01pr-feats svg { flex-shrink:0; color:var(--pf-accent); margin-top:2px; }
        .pf01pr-cta { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:13px; border-radius:10px; font-weight:700; font-size:.94rem; text-decoration:none; transition:transform .2s, box-shadow .2s, background .2s; }
        .pf01pr-cta-solid { background:var(--pf-accent); color:#fff; } .pf01pr-cta-solid:hover { transform:translateY(-1px); box-shadow:0 12px 24px -12px rgba(231,80,46,.7); }
        .pf01pr-cta-out { background:transparent; color:var(--pf-ink); border:1.5px solid var(--pf-border); } .pf01pr-cta-out:hover { border-color:var(--pf-ink); }
        .pf01pr-note { font-size:.82rem; color:var(--pf-muted); margin:22px 0 0; text-align:center; }
        @media (prefers-reduced-motion: reduce){ .pf01pr-card,.pf01pr-cta{ transition:none; } }
      `}</style>
      <section className="pf01pr" data-template="proof-01" id="cenik">
        <div className="pf01pr-inner">
          <div className="pf01pr-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01pr-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01pr-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01pr-grid">
            {tiers.map((t, i) => {
              const feats = (t.features as string[] | undefined) ?? [];
              const featured = Boolean(t.featured);
              return (
                <div key={i} className="pf01pr-card" data-featured={featured}>
                  {featured && <span className="pf01pr-badge">Nejoblíbenější</span>}
                  <h3 className="pf01pr-name"><GenericEditableText sectionId={sectionId} field={`tiers.${i}.name`} value={String(t.name ?? "")} tag="span" /></h3>
                  <div className="pf01pr-price">
                    <b><GenericEditableText sectionId={sectionId} field={`tiers.${i}.price`} value={String(t.price ?? "")} tag="span" /></b>
                    <span><GenericEditableText sectionId={sectionId} field={`tiers.${i}.unit`} value={String(t.unit ?? "")} tag="span" /></span>
                  </div>
                  <p className="pf01pr-desc"><GenericEditableText sectionId={sectionId} field={`tiers.${i}.description`} value={String(t.description ?? "")} tag="span" /></p>
                  <ul className="pf01pr-feats">
                    {feats.map((f, fi) => (
                      <li key={fi}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                        <GenericEditableText sectionId={sectionId} field={`tiers.${i}.features.${fi}`} value={f} tag="span" />
                      </li>
                    ))}
                  </ul>
                  <a href={resolveDemoHref(String(t.ctaHref ?? "#poptavka"), tenantSlug, isAdmin)} className={`pf01pr-cta ${featured ? "pf01pr-cta-solid" : "pf01pr-cta-out"}`} data-btn={featured ? "primary" : undefined}>
                    <GenericEditableText sectionId={sectionId} field={`tiers.${i}.ctaText`} value={String(t.ctaText ?? "Poptat")} tag="span" />
                  </a>
                </div>
              );
            })}
          </div>
          <p className="pf01pr-note"><GenericEditableText sectionId={sectionId} field="note" value={note} tag="span" /></p>
        </div>
      </section>
    </>
  );
}
'''

rebuild("src/components/sections/ServicesSection.tsx",
        "PROOF (proof-01) — services / process / pricing", SVC,
        [(
          '  if (variant === "pricing-photo-01")',
          '  if (variant === "proof-01-services") return <ServicesProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;\n'
          '  if (variant === "proof-01-process")  return <ProcessProof01 content={content} sectionId={sectionId} />;\n'
          '  if (variant === "proof-01-pricing")  return <PricingProof01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;'
        )])

# ═════════════════════════════ STATS ══════════════════════════════════════════
STATS = r'''
// ══ PROOF (proof-01) — trust band (count-up čísla + certifikace) ═══════════════
// Count-up jen na veřejném webu; ve Studiu zůstává editovatelný text.
function Pf01CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const m = value.match(/^([\d\s ]+(?:,\d+)?)([\s\S]*)$/);
    if (!m) { setDisplay(value); return; }
    const numStr = m[1].trim();
    const suffix = m[2] ?? "";
    const target = parseFloat(numStr.replace(/[\s ]/g, "").replace(",", "."));
    if (!isFinite(target)) { setDisplay(value); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(value); return; }
    const el = ref.current;
    if (!el) return;
    const decimals = numStr.includes(",") ? (numStr.split(",")[1] ?? "").length : 0;
    const fmtN = (v: number) => v.toLocaleString("cs-CZ", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    let raf = 0;
    let started = false;
    setDisplay(fmtN(0) + suffix);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started) return;
      started = true;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        if (p < 1) { setDisplay(fmtN(target * eased) + suffix); raf = requestAnimationFrame(tick); }
        else setDisplay(value);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [value]);
  return <span ref={ref} style={{ fontVariantNumeric: "tabular-nums" }}>{display}</span>;
}

function StatsProof01({ content, sectionId, isAdmin }: { content: Record<string, unknown>; sectionId: number; isAdmin: boolean }) {
  const items = (content.items as Array<{ value?: string; label?: string }> | undefined) ?? [];
  const rawBadges = content.badges as string[] | undefined;
  const badges = rawBadges && rawBadges.length ? rawBadges : [];
  const badgesLabel = String(content.badgesLabel ?? "Certifikace a záruky");
  return (
    <>
      <style>{`
        .pf01st { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8;
          background:var(--pf-paper,#F5F3EE); font-family:FONT_BODY; color:var(--pf-ink);
          padding:clamp(40px,5vw,64px) clamp(20px,5vw,48px); border-top:1px solid var(--pf-border); border-bottom:1px solid var(--pf-border); }
        .pf01st-inner { max-width:1280px; margin:0 auto; display:grid; grid-template-columns:1.3fr 1fr; gap:clamp(28px,5vw,64px); align-items:center; }
        .pf01st-nums { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:clamp(20px,3vw,40px); }
        .pf01st-num b { display:block; font-family:FONT_HEAD; font-size:clamp(2rem,4vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1; color:var(--pf-ink); }
        .pf01st-num span { display:block; font-size:.88rem; color:var(--pf-muted); margin-top:8px; line-height:1.35; }
        .pf01st-badges { border-left:1px solid var(--pf-border); padding-left:clamp(20px,3vw,40px); }
        .pf01st-badges-lbl { font-size:.74rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--pf-muted); margin:0 0 14px; }
        .pf01st-chips { display:flex; flex-wrap:wrap; gap:9px; }
        .pf01st-chip { display:inline-flex; align-items:center; gap:7px; padding:8px 13px; background:#fff; border:1px solid var(--pf-border); border-radius:999px; font-size:.85rem; font-weight:600; }
        .pf01st-chip svg { color:var(--pf-accent); flex-shrink:0; }
        @media (max-width:820px){ .pf01st-inner{ grid-template-columns:1fr; } .pf01st-badges{ border-left:none; border-top:1px solid var(--pf-border); padding-left:0; padding-top:24px; } }
      `}</style>
      <section className="pf01st" data-template="proof-01">
        <div className="pf01st-inner">
          <div className="pf01st-nums">
            {items.map((it, i) => (
              <div key={i} className="pf01st-num">
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
            <div className="pf01st-badges">
              <p className="pf01st-badges-lbl"><GenericEditableText sectionId={sectionId} field="badgesLabel" value={badgesLabel} tag="span" /></p>
              <div className="pf01st-chips">
                {badges.map((b, i) => (
                  <span key={i} className="pf01st-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    <GenericEditableText sectionId={sectionId} field={`badges.${i}`} value={b} tag="span" />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
'''

rebuild("src/components/sections/StatsSection.tsx",
        "PROOF (proof-01) — trust band", STATS,
        [(
          '  if (variant === "florist-01-stats")',
          '  if (variant === "proof-01-stats") return <StatsProof01 content={content} sectionId={sectionId} isAdmin={isAdmin} />;'
        )])

# ═══════════════════════════ TESTIMONIALS ═════════════════════════════════════
TS = r'''
// ══ PROOF (proof-01) — reference (editorial featured layout) ═══════════════════
function TestimonialsProof01({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const eyebrow = String(content.eyebrow ?? "Reference");
  const title   = String(content.title   ?? "Co říkají klienti");
  const lead    = String(content.lead    ?? "Hodnocení z reálných zakázek — bez úprav.");
  type T = { text?: string; quote?: string; name?: string; role?: string; rating?: number };
  const items = (content.testimonials as T[] | undefined) ?? (content.items as T[] | undefined) ?? [];
  return (
    <>
      <style>{`
        .pf01ts { --pf-accent:#E7502E; --pf-ink:#14161B; --pf-muted:#6A6E78; --pf-border:#E4E0D8; --pf-surface:#fff;
          background:#fff; font-family:FONT_BODY; color:var(--pf-ink);
          padding:clamp(56px,8vw,104px) clamp(20px,5vw,48px); }
        .pf01ts-inner { max-width:1180px; margin:0 auto; }
        .pf01ts-head { max-width:640px; margin-bottom:clamp(32px,5vw,52px); }
        .pf01ts .pf01-eyebrow{ font-family:FONT_SERIF; font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px; display:inline-flex; align-items:center; gap:12px; }
        .pf01ts .pf01-eyebrow::before{ content:''; width:32px; height:2px; background:var(--pf-accent); }
        .pf01ts-title { font-family:FONT_HEAD; color:var(--pf-ink); font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }
        .pf01ts-lead { font-size:1.05rem; color:var(--pf-muted); line-height:1.6; margin:0; }
        .pf01ts-grid { display:grid; grid-template-columns:1.15fr 1fr; gap:18px; }
        .pf01ts-card { display:flex; flex-direction:column; background:var(--pf-surface); border:1px solid var(--pf-border); border-radius:16px; padding:28px;
          transition:transform .25s cubic-bezier(.22,.68,0,1), box-shadow .25s; }
        .pf01ts-card:hover { transform:translateY(-4px); box-shadow:0 24px 44px -28px rgba(20,22,27,.35); }
        .pf01ts-card:first-child { grid-row:span 2; background:var(--pf-ink); border-color:var(--pf-ink); color:#fff; justify-content:center; padding:36px 32px; position:relative; overflow:hidden; }
        .pf01ts-card:first-child::after { content:''; position:absolute; bottom:-70px; left:-70px; width:220px; height:220px; border-radius:50%;
          background:radial-gradient(circle, rgba(231,80,46,.2) 0%, transparent 65%); pointer-events:none; }
        .pf01ts-card:first-child .pf01ts-quote { font-family:FONT_SERIF; font-style:italic; font-size:1.45rem; line-height:1.45; }
        .pf01ts-card:first-child .pf01ts-role { color:rgba(255,255,255,.55); }
        .pf01ts-card:first-child .pf01ts-av { background:var(--pf-accent); }
        .pf01ts-stars { display:flex; gap:3px; margin-bottom:16px; color:var(--pf-accent); }
        .pf01ts-quote { font-size:1.05rem; line-height:1.6; margin:0 0 22px; flex:none; }
        .pf01ts-quote::before { content:'\201C'; font-family:FONT_SERIF; color:var(--pf-accent); font-size:2rem; line-height:0; vertical-align:-.35em; margin-right:4px; }
        .pf01ts-meta { display:flex; align-items:center; gap:12px; }
        .pf01ts-av { width:44px; height:44px; border-radius:50%; background:var(--pf-ink); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0; }
        .pf01ts-name { font-weight:800; font-size:.96rem; }
        .pf01ts-role { font-size:.84rem; color:var(--pf-muted); }
        @media (max-width:820px){ .pf01ts-grid{ grid-template-columns:1fr; } .pf01ts-card:first-child{ grid-row:auto; } }
        @media (prefers-reduced-motion: reduce){ .pf01ts-card{ transition:none; } }
      `}</style>
      <section className="pf01ts" data-template="proof-01" id="reference">
        <div className="pf01ts-inner">
          <div className="pf01ts-head">
            <p className="pf01-eyebrow"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="pf01ts-title"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
            <p className="pf01ts-lead"><GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" /></p>
          </div>
          <div className="pf01ts-grid">
            {items.map((t, i) => {
              const rating = Math.max(1, Math.min(5, Number(t.rating ?? 5)));
              const name = String(t.name ?? "");
              return (
                <figure key={i} className="pf01ts-card" style={{ margin: 0 }}>
                  <div className="pf01ts-stars" aria-label={`Hodnocení ${rating} z 5`}>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <svg key={si} width="17" height="17" viewBox="0 0 24 24" fill={si < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <blockquote className="pf01ts-quote" style={{ margin: 0 }}>
                    <GenericEditableText sectionId={sectionId} field={`testimonials.${i}.text`} value={String(t.text ?? t.quote ?? "")} tag="span" />
                  </blockquote>
                  <figcaption className="pf01ts-meta">
                    <span className="pf01ts-av" aria-hidden="true">{name.charAt(0) || "?"}</span>
                    <span>
                      <span className="pf01ts-name" style={{ display: "block" }}><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.name`} value={name} tag="span" /></span>
                      <span className="pf01ts-role"><GenericEditableText sectionId={sectionId} field={`testimonials.${i}.role`} value={String(t.role ?? "")} tag="span" /></span>
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

rebuild("src/components/sections/TestimonialsSection.tsx",
        "PROOF (proof-01) — reference", TS,
        [(
          '  if (variant === "eshop-02-testimonials")',
          '  if (variant === "proof-01-testimonials") return <TestimonialsProof01 content={content} sectionId={sectionId} />;'
        )])
print("part2 OK")
