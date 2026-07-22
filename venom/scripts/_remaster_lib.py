#!/usr/bin/env python3
"""Sdílené helpery pro V3 remaster běh (REMASTER_PLAYBOOK §4).
Splice/append komponent v obřích *Section.tsx souborech — idempotentní.
Použití:  from _remaster_lib import replace_fn, replace_inline_block, append_fn, add_dispatch, insert_before
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SEC = ROOT / "src/components/sections"


def replace_fn(path, name, body):
    """Nahradí top-level `function <name>` (+ bezprostředně předcházející // komentáře)."""
    p = SEC / path
    lines = p.read_text().split("\n")
    start = next((i for i, l in enumerate(lines) if l.startswith("function " + name + "(")), None)
    if start is None:
        raise SystemExit("NENALEZENO: function %s v %s" % (name, path))
    # pohltit předcházející komentářové řádky
    while start > 0 and lines[start - 1].lstrip().startswith("//"):
        start -= 1
    # POZOR: komponenty obnovené z gitu končí ODSAZENÝM `  }` (zbytek po extrakci
    # inline bloku), proto se nesmí hledat jen `}` v prvním sloupci.
    end = next(i for i in range(start + 1, len(lines))
               if lines[i].strip() == "}" and len(lines[i]) - len(lines[i].lstrip()) <= 2)
    p.write_text("\n".join(lines[:start] + body.strip("\n").split("\n") + lines[end + 1:]))
    print("  ✓ %-22s %s" % (name, path))


def insert_before(path, anchor, body, marker):
    """Vloží nový blok před řádek `anchor` (jen když `marker` v souboru není)."""
    p = SEC / path
    src = p.read_text()
    if marker in src:
        print("  = %-22s už existuje" % marker)
        return
    lines = src.split("\n")
    idx = next(i for i, l in enumerate(lines) if l.startswith(anchor))
    p.write_text("\n".join(lines[:idx] + body.strip("\n").split("\n") + [""] + lines[idx:]))
    print("  ✓ vložen blok %s → %s" % (marker, path))


def add_dispatch(path, after_line, new_line):
    """Přidá dispatch řádek za existující (idempotentně)."""
    p = SEC / path
    src = p.read_text()
    if new_line.strip() in src:
        print("  = dispatch už existuje: %s" % new_line.strip()[:52])
        return
    lines = src.split("\n")
    idx = next(i for i, l in enumerate(lines) if after_line in l)
    lines.insert(idx + 1, new_line)
    p.write_text("\n".join(lines))
    print("  ✓ dispatch %s" % new_line.strip()[:52])


def replace_inline_block(path, variant, replacement):
    """Nahradí inline `if (variant === "<variant>") { ... }` blok (brace counting)."""
    p = SEC / path
    lines = p.read_text().split("\n")
    needle = 'if (variant === "%s")' % variant
    start = next((i for i, l in enumerate(lines) if needle in l), None)
    if start is None:
        print("  = inline blok %s už nahrazen" % variant)
        return
    depth, end = 0, None
    for i in range(start, len(lines)):
        depth += lines[i].count("{") - lines[i].count("}")
        if depth == 0 and i > start:
            end = i
            break
        if depth == 0 and i == start and "{" in lines[i]:
            continue
    if end is None:
        raise SystemExit("nenalezen konec bloku %s" % variant)
    p.write_text("\n".join(lines[:start] + replacement.strip("\n").split("\n") + lines[end + 1:]))
    print("  ✓ inline blok %s → delegace" % variant)


def append_fn(path, body, marker):
    """Přidá komponentu na konec souboru (jen když tam ještě není)."""
    p = SEC / path
    src = p.read_text()
    if marker in src:
        # už existuje → nahraď celou
        name = marker.replace("function ", "").replace("(", "")
        replace_fn(path, name, body)
        return
    p.write_text(src.rstrip("\n") + "\n\n" + body.strip("\n") + "\n")
    print("  ✓ přidána komponenta %s → %s" % (marker, path))
