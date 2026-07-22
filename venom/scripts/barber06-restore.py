#!/usr/bin/env python3
"""barber-06 — obnova PŮVODNÍ šablony hair-04 („Impresiv Studio" / ALFA Barbershop) z gitu
jako samostatné šablony s novými klíči.

Kontext: hair-04 jsem remasteroval na „Studio Pop" (uživatel si ji nechává). Původní barber
podoba se ale má zachovat jako NOVÁ šablona — proto se komponenty vytahují z commitu před
remasterem a přejmenovávají na `barber-06-*`, aby obě mohly existovat vedle sebe.

Zdrojový commit: 6e106fdb (poslední stav hair-04 před remasterem 367e5969).
Idempotentní.
"""
import re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEC = ROOT / "src/components/sections"
SRC_COMMIT = "6e106fdb"

# (soubor, starý variant klíč, nový variant klíč, název nové funkce)
BLOCKS = [
    ("HeroSection.tsx",     "hero-hair-04-with-navbar", "barber-06-hero",     "HeroBarber06"),
    ("ServicesSection.tsx", "hair-04-service-cards",    "barber-06-services", "ServicesBarber06"),
    ("CtaSection.tsx",      "hair-04-cta-phone",        "barber-06-cta",      "CtaBarber06"),
    ("AboutSection.tsx",    "about-hair-04-split",      "barber-06-about",    "AboutBarber06"),
    ("GallerySection.tsx",  "hair-04-carousel",         "barber-06-gallery",  "GalleryBarber06"),
    ("ContactSection.tsx",  "hair-04-contact",          "barber-06-contact",  "ContactBarber06"),
    ("FooterSection.tsx",   "hair-04-footer",           "barber-06-footer",   "FooterBarber06"),
]


def git_file(path):
    return subprocess.run(["git", "show", f"{SRC_COMMIT}:./src/components/sections/{path}"],
                          cwd=ROOT, capture_output=True, text=True, check=True).stdout


def extract_block(src, variant):
    """Vytáhne tělo inline bloku `if (variant === "<variant>") { ... }` (brace counting)."""
    needle = f'if (variant === "{variant}")'
    i = src.find(needle)
    if i < 0:
        return None
    start = src.index("{", i)
    depth, j = 0, start
    while j < len(src):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                break
        j += 1
    return src[start + 1:j]


def build_component(body, fn_name, new_variant, old_variant):
    body = body.replace(old_variant, new_variant)
    # data-template a id, ať se styly netlučou s hair-04
    body = body.replace('data-template="hair-04"', 'data-template="barber-06"')
    header = (
        f"\n// {new_variant} — obnoveno z původní šablony hair-04 „Impresiv Studio\" (commit {SRC_COMMIT}).\n"
        f"// hair-04 byla remasterována na „Studio Pop\"; tahle barber podoba žije dál samostatně.\n"
        f"function {fn_name}({{ content, sectionId, tenantSlug, isAdmin }}: "
        "{ content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {"
    )
    return header + body + "}\n"


def append_and_dispatch(path, fn_name, new_variant, component, anchor_variant):
    p = SEC / path
    src = p.read_text()
    if f"function {fn_name}(" not in src:
        src = src.rstrip("\n") + "\n" + component
        print(f"  ✓ {fn_name} → {path}")
    disp = (f'  if (variant === "{new_variant}") return <{fn_name} content={{content as Record<string, unknown>}} '
            f'sectionId={{sectionId}} tenantSlug={{tenantSlug}} isAdmin={{isAdmin}} />;')
    if f'variant === "{new_variant}"' not in src:
        m = re.search(r'^(\s*)if \(variant === "' + re.escape(anchor_variant) + r'"\)', src, re.M)
        if not m:
            print(f"  ! kotva {anchor_variant} nenalezena v {path}")
        else:
            src = src[:m.start()] + disp + "\n" + src[m.start():]
            print(f"  ✓ dispatch {new_variant}")
    p.write_text(src)


if __name__ == "__main__":
    print(f"barber-06 — obnova komponent z {SRC_COMMIT}")
    for path, old_v, new_v, fn in BLOCKS:
        old_src = git_file(path)
        body = extract_block(old_src, old_v)
        if body is None:
            print(f"  ! blok {old_v} nenalezen v {path}@{SRC_COMMIT}")
            continue
        comp = build_component(body, fn, new_v, old_v)
        append_and_dispatch(path, fn, new_v, comp, old_v)
    print("hotovo.")
