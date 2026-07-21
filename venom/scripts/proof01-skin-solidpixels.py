#!/usr/bin/env python3
"""Solidpixels skin for proof-01: navy + red CTA + light beige, zero decorations,
clean 8-12px radius, small-caps eyebrows, no serif accents. Patches only pf01 tails."""

FILES = {
 "src/components/sections/HeroSection.tsx":        "PROOF — Universal Service Engine (proof-01)",
 "src/components/sections/NavbarSection.tsx":      "proof-01-navbar — sticky minimal header",
 "src/components/sections/ServicesSection.tsx":    "PROOF (proof-01) — services / process / pricing",
 "src/components/sections/GallerySection.tsx":     "PROOF (proof-01) — Before/After",
 "src/components/sections/StatsSection.tsx":       "PROOF (proof-01) — trust band",
 "src/components/sections/TestimonialsSection.tsx":"PROOF (proof-01) — reference",
 "src/components/sections/FaqSection.tsx":         "PROOF (proof-01) — FAQ",
 "src/components/sections/ContactSection.tsx":     "PROOF (proof-01) — poptávkový formulář",
 "src/components/sections/FooterSection.tsx":      "PROOF (proof-01) — footer",
}

# order matters: specific → generic
REPL = [
  # ── palette: ember→red, ink→navy, paper→beige ────────────────────────────────
  ("#E7502E", "#C3352B"),
  ("#f0855f", "#d95c47"),
  ("rgba(231,80,46", "rgba(195,53,43"),
  ("#14161B", "#1B3A5C"),
  ("rgba(20,22,27", "rgba(27,58,92"),
  ("#F5F3EE", "#F4F1EB"),
  ("#0F1013", "#16304A"),
  ("#1a1d24", "#22456B"),
  ("#E4E0D8", "#E5E1D8"),
  ("#D9D4C9", "#D8D3C8"),
  ("#c9c3b6", "#c8c2b4"),
  # ── radius: clean solidpixels 8-12 ───────────────────────────────────────────
  ("border-radius: 22px", "border-radius: 12px"),
  ("border-radius: 18px", "border-radius: 12px"),
  ("border-radius:18px", "border-radius:12px"),
  ("border-radius:16px", "border-radius:10px"),
  ("border-radius: 16px", "border-radius: 10px"),
  ("border-radius:13px", "border-radius:10px"),
  ("border-radius:12px; overflow:hidden; aspect-ratio:4/3", "border-radius:10px; overflow:hidden; aspect-ratio:4/3"),
  ("border-radius: 10px; transition: transform .35s", "border-radius: 6px; transition: transform .35s"),   # primary btn
  ("border-radius: 10px; transition: border-color .2s", "border-radius: 6px; transition: border-color .2s"), # ghost btn
  ("border-radius:10px; transition:transform .2s, box-shadow .2s, background .2s;", "border-radius:6px; transition:transform .2s, box-shadow .2s, background .2s;"), # pricing cta
  ("border-radius:11px;", "border-radius:6px;"),
  # ── eyebrows: serif italic → small caps label ────────────────────────────────
  ("font-family: var(--font-instrument-serif, Georgia, serif); font-style: italic;\n          font-size: clamp(1.05rem, 1.5vw, 1.3rem); color: var(--pf-accent, #C3352B); margin: 0 0 18px;",
   "font-size: .78rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: var(--pf-accent, #C3352B); margin: 0 0 18px;"),
  ("font-family:var(--font-instrument-serif, Georgia, serif); font-style:italic; font-size:1.2rem; color:var(--pf-accent); margin:0 0 12px;",
   "font-size:.78rem; font-weight:800; letter-spacing:.16em; text-transform:uppercase; color:var(--pf-accent); margin:0 0 12px;"),
  # gallery inline eyebrow style
  ('fontFamily: "var(--font-instrument-serif, Georgia, serif)", fontStyle: "italic", fontSize: "1.2rem"',
   'fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" as const, fontSize: ".78rem"'),
  # ── hero H1 accent: serif italic → same sans, accent color ───────────────────
  ("display: block; font-family: var(--font-instrument-serif, Georgia, serif);\n          font-style: italic; font-weight: 400; letter-spacing: -0.01em; color: var(--pf-accent, #C3352B);\n          font-size: .92em; margin-top: .08em;",
   "display: block; font-weight: 800; letter-spacing: -0.03em; color: var(--pf-accent, #C3352B); font-size: 1em; margin-top: .04em;"),
  # ── process numbers: serif italic → plain bold sans in accent ────────────────
  ("display:inline-flex; align-items:baseline; gap:8px; font-family:var(--font-instrument-serif, Georgia, serif); font-style:italic;\n          font-size:2.7rem;",
   "display:inline-flex; align-items:baseline; gap:8px; font-family:var(--font-heading, system-ui, sans-serif); font-weight:800;\n          font-size:2.2rem;"),
  # ── testimonial featured quote: serif → clean sans ───────────────────────────
  ("font-family:var(--font-instrument-serif, Georgia, serif); font-style:italic; font-size:1.45rem; line-height:1.45;",
   "font-weight:600; font-style:italic; font-size:1.3rem; line-height:1.5;"),
  # quote mark serif ok → simplify to sans quote
  ("content:'\\201C'; font-family:var(--font-instrument-serif, Georgia, serif);", "content:'\\201C';"),
  # ── kill decorations ─────────────────────────────────────────────────────────
  # ghost index numbers
  (".pf01svc-idx { position:absolute;", ".pf01svc-idx { display:none; position:absolute;"),
  # pulsing dot on badge → static
  ("animation: pf01pulse 2.2s ease-in-out infinite;", ""),
  # radial glows (testimonial featured, contact — none; hero none already)
  ("background:radial-gradient(circle, rgba(195,53,43,.2) 0%, transparent 65%); pointer-events:none; }",
   "background:none; pointer-events:none; }"),
  # ink grid overlay on subpage hero → none
  ("background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);\n          background-size: 72px 72px;", "background: none;"),
  # ── hero: floating card → clean static card under photo ─────────────────────
  (".pf01sel { position: absolute; left: 0; bottom: 0; z-index: 2; width: min(400px, 92%);",
   ".pf01sel { position: static; z-index: 2; width: 100%; margin-top: 18px;"),
  (".pf01hero-visual { position: relative; min-width: 0; animation: pf01up .7s cubic-bezier(.22,.68,0,1) .18s both;\n          padding: 0 0 56px clamp(0px, 6vw, 96px); }",
   ".pf01hero-visual { position: relative; min-width: 0; animation: pf01up .7s cubic-bezier(.22,.68,0,1) .18s both; }"),
  (".pf01hero-photo-wrap { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 4 / 5;\n          max-height: 640px;",
   ".pf01hero-photo-wrap { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16 / 11;\n          max-height: 420px;"),
  ("background: linear-gradient(200deg, transparent 55%, rgba(27,58,92,.38) 100%);", "background: none;"),
  (".pf01sel { position: static; width: 100%; margin-top: 16px; }", ".pf01sel-noop {}"),  # obsolete mobile override
  # softer shadows overall (solidpixels barely uses them)
  ("box-shadow: 0 40px 80px -40px rgba(27,58,92,.45);", "box-shadow: 0 14px 40px -22px rgba(27,58,92,.35);"),
  ("box-shadow: 0 34px 70px -30px rgba(27,58,92,.5);", "box-shadow: 0 12px 34px -20px rgba(27,58,92,.28);"),
  ("box-shadow:0 34px 64px -34px rgba(27,58,92,.55);", "box-shadow:0 14px 36px -22px rgba(27,58,92,.3);"),
  ("box-shadow:0 26px 48px -26px rgba(27,58,92,.42);", "box-shadow:0 12px 28px -18px rgba(27,58,92,.25);"),
  ("box-shadow:0 26px 48px -28px rgba(27,58,92,.42);", "box-shadow:0 12px 28px -18px rgba(27,58,92,.25);"),
  ("box-shadow:0 24px 44px -28px rgba(27,58,92,.35);", "box-shadow:0 10px 24px -16px rgba(27,58,92,.22);"),
  ("box-shadow:0 40px 80px -40px rgba(0,0,0,.6);", "box-shadow:0 14px 40px -22px rgba(0,0,0,.35);"),
]

total = 0
for path, marker in FILES.items():
    s = open(path).read()
    i = s.find(marker)
    assert i != -1, f"marker missing: {path}"
    head, tail = s[:i], s[i:]
    hits = 0
    for old, new in REPL:
        n = tail.count(old)
        if n: tail = tail.replace(old, new); hits += n
    open(path, "w").write(head + tail)
    print(f"{path}: {hits} replacements")
    total += hits
print("TOTAL", total)
