#!/usr/bin/env python3
"""Cinematic redesign of proof-01: full-bleed photo hero with dark overlay + white type,
photo service cards, dark stats band, bigger typography. Surgical patches on pf01 tails."""

def patch(path, marker, repls):
    s = open(path).read()
    i = s.find(marker); assert i != -1, f"marker missing {path}"
    head, tail = s[:i], s[i:]
    miss = []
    for old, new in repls:
        if old not in tail: miss.append(old[:70]); continue
        tail = tail.replace(old, new)
    open(path, "w").write(head + tail)
    print(f"{path}: {len(repls)-len(miss)}/{len(repls)} applied"); [print("  MISS:", m) for m in miss]

# ═════════════════════════════ HERO — cinematic full-bleed ════════════════════
patch("src/components/sections/HeroSection.tsx", "PROOF — Universal Service Engine (proof-01)", [
  # section becomes full-bleed dark photo stage
  (""".pf01hero { position: relative; background: var(--pf-paper, #F4F1EB); overflow: hidden;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); color: var(--pf-ink, #1B3A5C); }""",
   """.pf01hero { position: relative; background: #0C1622; overflow: hidden;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif); color: #fff;
          display: flex; align-items: center; min-height: clamp(620px, 92vh, 880px); }
        .pf01hero-bgwrap { position: absolute; inset: 0; z-index: 0; }
        .pf01hero-bgwrap::after { content: ''; position: absolute; inset: 0;
          background: linear-gradient(88deg, rgba(9,17,27,.94) 0%, rgba(9,17,27,.72) 42%, rgba(9,17,27,.30) 75%, rgba(9,17,27,.42) 100%); }
        .pf01hero-bgwrap::before { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 140px; z-index: 1;
          background: linear-gradient(180deg, transparent, rgba(9,17,27,.85)); }"""),
  # photo wrap: absolute bg instead of framed panel
  (""".pf01hero-photo-wrap { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16 / 11;
          max-height: 420px; box-shadow: 0 14px 40px -22px rgba(27,58,92,.35); }""",
   """.pf01hero-photo-wrap { position: absolute; inset: 0; }"""),
  ("""background: none; pointer-events: none; }
        .pf01hero-photo-slot""", """background: none; pointer-events: none; display:none; }
        .pf01hero-photo-slot"""),
  # inner grid: text majority + card right
  (""".pf01hero-inner { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto;
          padding: clamp(40px, 6vw, 84px) clamp(20px, 5vw, 48px);
          display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 4vw, 56px); align-items: center; }""",
   """.pf01hero-inner { position: relative; z-index: 2; max-width: 1280px; margin: 0 auto; width: 100%;
          padding: clamp(96px, 12vh, 140px) clamp(20px, 5vw, 48px) clamp(56px, 8vh, 88px);
          display: grid; grid-template-columns: 1.15fr 0.85fr; gap: clamp(36px, 5vw, 80px); align-items: center; }"""),
  # big white typography
  (""".pf01hero-h1 { font-family: var(--font-heading, system-ui, sans-serif); color: var(--pf-ink, #1B3A5C);
          font-size: clamp(2.2rem, 4.6vw, 3.7rem); font-weight: 800; line-height: 1.04;
          letter-spacing: -0.03em; margin: 0 0 22px; }""",
   """.pf01hero-h1 { font-family: var(--font-heading, system-ui, sans-serif); color: #fff;
          font-size: clamp(2.5rem, 5.4vw, 4.6rem); font-weight: 800; line-height: 1.02;
          letter-spacing: -0.035em; margin: 0 0 24px; text-wrap: balance; }"""),
  ("""display: block; font-weight: 800; letter-spacing: -0.03em; color: var(--pf-accent, #C3352B); font-size: 1em; margin-top: .04em;""",
   """display: block; font-weight: 800; letter-spacing: -0.035em; color: #E85A48; font-size: 1em; margin-top: .05em;"""),
  (""".pf01hero-sub { font-size: clamp(1rem, 1.3vw, 1.14rem); line-height: 1.62; color: var(--pf-muted, #5C6B7A);
          max-width: 30em; margin: 0 0 32px; }""",
   """.pf01hero-sub { font-size: clamp(1.02rem, 1.35vw, 1.2rem); line-height: 1.65; color: rgba(255,255,255,.82);
          max-width: 30em; margin: 0 0 34px; }"""),
  # eyebrow on dark
  ("""font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: var(--pf-accent, #C3352B); margin: 0 0 18px;""",
   """font-size: .8rem; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; color: #E85A48; margin: 0 0 20px;"""),
  (""".pf01hero-eyebrow::before { content: ''; width: 40px; height: 2px; background: var(--pf-accent, #C3352B); }""",
   """.pf01hero-eyebrow::before { content: ''; width: 40px; height: 2px; background: #E85A48; }"""),
  # ghost btn on dark
  (""".pf01btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; background: #fff;
          color: var(--pf-ink, #1B3A5C); font-weight: 600; font-size: .98rem; text-decoration: none; border: 1.5px solid var(--pf-border, #D8D3C8);
          border-radius: 6px; transition: border-color .2s, background .2s; white-space: nowrap; }
        .pf01btn-ghost:hover { border-color: var(--pf-ink, #1B3A5C); }""",
   """.pf01btn-ghost { display: inline-flex; align-items: center; gap: 10px; padding: 15px 26px; background: rgba(255,255,255,.06);
          color: #fff; font-weight: 600; font-size: .98rem; text-decoration: none; border: 1.5px solid rgba(255,255,255,.35);
          border-radius: 6px; transition: border-color .2s, background .2s; white-space: nowrap; backdrop-filter: blur(6px); }
        .pf01btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,.12); }"""),
  # trust row on dark
  (""".pf01hero-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 34px;
          padding-top: 22px; border-top: 1px solid var(--pf-border, #E5E1D8); }
        .pf01hero-trust-item { display: inline-flex; align-items: center; gap: 8px; font-size: .87rem; font-weight: 700; }
        .pf01hero-trust-item svg { flex-shrink: 0; color: var(--pf-accent, #C3352B); }
        .pf01hero-trust-item + .pf01hero-trust-item::before { content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: var(--pf-border, #D8D3C8); margin-right: 14px; }""",
   """.pf01hero-trust { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 18px; margin-top: 36px;
          padding-top: 24px; border-top: 1px solid rgba(255,255,255,.22); }
        .pf01hero-trust-item { display: inline-flex; align-items: center; gap: 8px; font-size: .88rem; font-weight: 700; color: #fff; }
        .pf01hero-trust-item svg { flex-shrink: 0; color: #E85A48; }
        .pf01hero-trust-item + .pf01hero-trust-item::before { content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: rgba(255,255,255,.35); margin-right: 14px; }"""),
  # visual column = jen karta
  (""".pf01hero-visual { position: relative; min-width: 0; animation: pf01up .7s cubic-bezier(.22,.68,0,1) .18s both; }""",
   """.pf01hero-visual { position: relative; min-width: 0; animation: pf01up .7s cubic-bezier(.22,.68,0,1) .18s both; z-index: 2; }"""),
  (""".pf01sel { position: relative; z-index: 2; width: 100%; margin-top: 18px;""",
   """.pf01sel { position: relative; z-index: 2; width: 100%;"""),
  ("""box-shadow: 0 12px 34px -20px rgba(27,58,92,.28); overflow: hidden; }""",
   """box-shadow: 0 30px 70px -25px rgba(0,0,0,.55); overflow: hidden; }"""),
  # mobile
  ("""@media (max-width: 1000px) {
          .pf01hero-inner { grid-template-columns: 1fr; }
          .pf01hero-visual { padding: 0; }
          .pf01hero-photo-wrap { aspect-ratio: 16 / 10; max-height: 340px; }
          .pf01sel-noop {}
        }""",
   """@media (max-width: 1000px) {
          .pf01hero { min-height: 0; }
          .pf01hero-inner { grid-template-columns: 1fr; padding-top: 96px; }
        }"""),
  # JSX: move photo to section bg + overlay
  ("""      <section className="pf01hero" data-template="proof-01" id="uvod">
        <div className="pf01hero-inner">""",
   """      <section className="pf01hero" data-template="proof-01" id="uvod">
        <div className="pf01hero-bgwrap" aria-hidden="true">
          <GenericEditableImage sectionId={sectionId} field="photo" src={photo} alt={photoAlt} className="pf01hero-photo-slot">
            <img src={photo} alt="" className="pf01hero-photo" />
          </GenericEditableImage>
        </div>
        <div className="pf01hero-inner">"""),
  ("""          <div className="pf01hero-visual">
            <div className="pf01hero-photo-wrap">
              <GenericEditableImage sectionId={sectionId} field="photo" src={photo} alt={photoAlt} className="pf01hero-photo-slot">
                <img src={photo} alt={photoAlt} className="pf01hero-photo" />
              </GenericEditableImage>
            </div>

            <div className="pf01sel\"""",
   """          <div className="pf01hero-visual">
            <div className="pf01sel\""""),
])

# ═════════════════════ SERVICES — photo cards ═════════════════════════════════
patch("src/components/sections/ServicesSection.tsx", "PROOF (proof-01) — services / process / pricing", [
  ("type Pf01Svc = { name?: string; description?: string; icon?: string; priceFrom?: string; href?: string };",
   "type Pf01Svc = { name?: string; description?: string; icon?: string; photo?: string; priceFrom?: string; href?: string };"),
  (""".pf01svc-card { position:relative; display:flex; flex-direction:column; gap:14px; background:var(--pf-surface); border:1px solid var(--pf-border);
          border-radius:10px; padding:26px; text-decoration:none; color:inherit; overflow:hidden;""",
   """.pf01svc-card { position:relative; display:flex; flex-direction:column; gap:0; background:var(--pf-surface); border:1px solid var(--pf-border);
          border-radius:12px; padding:0; text-decoration:none; color:inherit; overflow:hidden;"""),
  (""".pf01svc-ic { width:52px; height:52px; border-radius:10px; background:rgba(195,53,43,.1); color:var(--pf-accent); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background .25s, color .25s, transform .35s cubic-bezier(.34,1.56,.64,1); }
        .pf01svc-card:hover .pf01svc-ic { background:var(--pf-accent); color:#fff; transform:scale(1.06) rotate(-4deg); }""",
   """.pf01svc-photo { position:relative; aspect-ratio:16/10; overflow:hidden; background:#E8E4DC; }
        .pf01svc-photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s cubic-bezier(.22,.68,0,1); }
        .pf01svc-card:hover .pf01svc-photo img { transform:scale(1.05); }
        .pf01svc-photo::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(12,22,34,.45)); }
        .pf01svc-num { position:absolute; left:16px; bottom:12px; z-index:1; color:#fff; font-weight:800; font-size:.8rem; letter-spacing:.14em; }
        .pf01svc-body { display:flex; flex-direction:column; gap:12px; padding:22px 24px 24px; flex:1; }"""),
  (""".pf01svc-idx { display:none; position:absolute;""", """.pf01svc-idx-old { display:none; position:absolute;"""),
  # JSX: photo header + body wrapper
  ("""                <span className="pf01svc-idx" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <span className="pf01svc-ic"><Pf01Icon name={s.icon} /></span>
                <h3 className="pf01svc-name">""",
   """                <span className="pf01svc-photo" aria-hidden="true">
                  {s.photo && <img src={String(s.photo)} alt="" loading="lazy" />}
                  <span className="pf01svc-num">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="pf01svc-body">
                <h3 className="pf01svc-name">"""),
  ("""                  </span>
                </div>
              </a>
            ))}""",
   """                  </span>
                </div>
                </span>
              </a>
            ))}"""),
  # bigger section titles
  ("font-size:clamp(1.8rem,3.6vw,2.75rem); font-weight:800; letter-spacing:-.02em; line-height:1.08; margin:0 0 14px; }",
   "font-size:clamp(1.9rem,3.8vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1.06; margin:0 0 14px; }"),
])

# ═════════════════════ STATS — dark band ══════════════════════════════════════
patch("src/components/sections/StatsSection.tsx", "PROOF (proof-01) — trust band", [
  (""".pf01st { --pf-accent:#C3352B; --pf-ink:#1B3A5C; --pf-muted:#5C6B7A; --pf-border:#E5E1D8;
          background:var(--pf-paper,#F4F1EB); font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:var(--pf-ink);
          padding:clamp(40px,5vw,64px) clamp(20px,5vw,48px); border-top:1px solid var(--pf-border); border-bottom:1px solid var(--pf-border); }""",
   """.pf01st { --pf-accent:#E85A48; --pf-ink:#1B3A5C; --pf-muted:#5C6B7A; --pf-border:rgba(255,255,255,.14);
          background:#0C1622; font-family:var(--font-body, system-ui, -apple-system, sans-serif); color:#fff;
          padding:clamp(44px,6vw,72px) clamp(20px,5vw,48px); }"""),
  (""".pf01st-num b { display:block; font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2rem,4vw,3rem); font-weight:800; letter-spacing:-.03em; line-height:1; color:var(--pf-ink); }""",
   """.pf01st-num { border-top:2px solid var(--pf-accent); padding-top:16px; }
        .pf01st-num b { display:block; font-family:var(--font-heading, system-ui, sans-serif); font-size:clamp(2.2rem,4.4vw,3.4rem); font-weight:800; letter-spacing:-.03em; line-height:1; color:#fff; }"""),
  ("""color:var(--pf-muted); margin-top:8px; line-height:1.35; }""",
   """color:rgba(255,255,255,.62); margin-top:8px; line-height:1.35; }"""),
  (""".pf01st-badges-lbl { font-size:.74rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:var(--pf-muted); margin:0 0 14px; }""",
   """.pf01st-badges-lbl { font-size:.74rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.55); margin:0 0 14px; }"""),
  (""".pf01st-chip { display:inline-flex; align-items:center; gap:7px; padding:8px 13px; background:#fff; border:1px solid var(--pf-border); border-radius:999px; font-size:.85rem; font-weight:600; }""",
   """.pf01st-chip { display:inline-flex; align-items:center; gap:7px; padding:8px 13px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.16); border-radius:999px; font-size:.85rem; font-weight:600; color:#fff; }"""),
])

# ═════════════════════ PRICING — featured dark ════════════════════════════════
patch("src/components/sections/ServicesSection.tsx", "function PricingProof01", [
  (""".pf01pr-card[data-featured="true"] { border:2px solid var(--pf-ink); box-shadow:0 14px 36px -22px rgba(27,58,92,.3); position:relative; }""",
   """.pf01pr-card[data-featured="true"] { border:1px solid #0C1622; background:#0C1622; color:#fff; box-shadow:0 24px 56px -24px rgba(12,22,34,.6); position:relative; }
        .pf01pr-card[data-featured="true"] .pf01pr-name, .pf01pr-card[data-featured="true"] .pf01pr-price b { color:#fff; }
        .pf01pr-card[data-featured="true"] .pf01pr-desc, .pf01pr-card[data-featured="true"] .pf01pr-price span { color:rgba(255,255,255,.65); }
        .pf01pr-card[data-featured="true"] .pf01pr-feats li { color:rgba(255,255,255,.88); }"""),
])
print("REDESIGN PATCH DONE")
