"use client";

/**
 * StorefrontMegaMenu — DOČASNÝ STUB (signal-01 session).
 *
 * Paralelní session přidala do NavbarSection importy a použití této komponenty,
 * ale soubor zatím nevytvořila — bez něj padá webpack build celého webu.
 * Tento stub drží build zelený a renderuje jednoduchou lištu kategorií + trailing.
 * Až vznikne plná implementace (catalog dropdowny, extras, témata), tento soubor
 * klidně celý přepište — žádný jiný kód na jeho vnitřek nespoléhá.
 */

import React from "react";

export type MegaMenuTheme = Record<string, unknown>;

type MegaCategory = {
  label?: string;
  slug?: string;
  href?: string;
  image?: string;
  items?: Array<{ label?: string; href?: string; slug?: string }>;
  children?: Array<{ label?: string; href?: string; slug?: string }>;
};

interface StorefrontMegaMenuProps {
  categories?: MegaCategory[];
  extras?: unknown;
  mode?: string;
  catalogLabel?: string;
  allLabel?: string;
  theme?: MegaMenuTheme;
  resolveHref?: (href: string) => string;
  trailing?: React.ReactNode;
  [key: string]: unknown;
}

export function StorefrontMegaMenu({ categories, catalogLabel, resolveHref, trailing }: StorefrontMegaMenuProps) {
  const resolve = resolveHref ?? ((h: string) => h);
  const cats = Array.isArray(categories) ? categories : [];
  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 46, flexWrap: "nowrap", overflow: "hidden" }}>
      {catalogLabel && (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "0 14px", height: 46, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap" }}>
          {catalogLabel}
        </span>
      )}
      {cats.map((c, i) => {
        const href = c.href ?? (c.slug ? `/kategorie/${c.slug}` : "#");
        return (
          <a
            key={i}
            href={resolve(href)}
            style={{ display: "inline-flex", alignItems: "center", padding: "0 14px", height: 46, fontSize: 13.5, fontWeight: 500, color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {c.label ?? ""}
          </a>
        );
      })}
      {trailing}
    </div>
  );
}

export default StorefrontMegaMenu;
