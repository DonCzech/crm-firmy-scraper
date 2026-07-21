import type { Section } from "@/lib/db";

/**
 * Ensures a "Blog" entry lives in a navbar/footer section's `links` array when
 * the tenant has the blog module active — done at render time, not by editing
 * every tenant's data. Matches the blog module's "one engine, zero per-template
 * work" philosophy: the link appears and disappears with the module.
 *
 * Idempotent and dedupes: a template that already ships a Blog link (some point
 * it at "#blog") gets that entry's href corrected to the real /blog route
 * rather than a second copy.
 *
 * Footer variants that read a different key than `links` (infoLinks, navLinks,
 * columns[].links) fall through unchanged — those need the entry in their own
 * shape and are handled per-variant.
 */
/**
 * Keys that hold site navigation, most canonical first. Footer variants each
 * name their nav column differently, and many carry a vestigial `links` array
 * they never render — so we target the first navigation-ish array that is
 * actually populated. Social/legal/payment arrays are deliberately absent:
 * a Blog entry must never land in "Sledujte nás" or "Obchodní podmínky".
 */
const NAV_ARRAY_KEYS = [
  "links",
  "navLinks",
  "menuLinks",
  "quickLinks",
  "navigationLinks",
  "infoLinks",
  "helpLinks",
  "shopLinks",
  "catalogLinks",
  "serviceLinks",
  "propertyLinks",
  "col1Links",
  "col2Links",
  "col3Links",
] as const;

function isLinkArray(v: unknown): v is Array<Record<string, unknown>> {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    typeof v[0] === "object" &&
    v[0] !== null &&
    ("href" in (v[0] as object) || "label" in (v[0] as object))
  );
}

export function withBlogNavLink(
  section: Section,
  hasBlog: boolean,
  label = "Blog",
  tenantSlug?: string,
): Section {
  if (!hasBlog) return section;
  const content = (section.settings?.content ?? {}) as Record<string, unknown>;

  const blogHref = tenantSlug ? `/demo/${tenantSlug}/blog` : "/blog";

  // Variants that build their link list in code (hardcoded fallback, navGroups…)
  // can't be reached through data at all. They read this flag and append the
  // entry themselves via appendBlogLink() in FooterSection.tsx.
  const flagged: Record<string, unknown> = {
    ...content,
    __withBlog: true,
    __blogHref: blogHref,
  };

  const targetKey = NAV_ARRAY_KEYS.find((k) => isLinkArray(content[k]));
  if (!targetKey) {
    return { ...section, settings: { ...section.settings, content: flagged } };
  }
  const links = content[targetKey] as Array<Record<string, unknown>>;

  const isBlog = (l: unknown) => {
    const link = l as { href?: string; label?: string };
    const href = (link?.href ?? "").toLowerCase();
    const lab = (link?.label ?? "").toLowerCase();
    return href === "/blog" || href.endsWith("/blog") || href === "#blog" || lab === "blog";
  };

  let nextLinks: Array<Record<string, unknown>>;
  if (links.some(isBlog)) {
    nextLinks = links.map((l) =>
      isBlog(l) ? { ...(l as Record<string, unknown>), href: blogHref, label } : (l as Record<string, unknown>)
    );
  } else {
    nextLinks = [...(links as Array<Record<string, unknown>>), { label, href: blogHref }];
  }

  return {
    ...section,
    settings: {
      ...section.settings,
      content: { ...flagged, [targetKey]: nextLinks },
    },
  };
}
