"use client";

import { useMemo } from "react";
import EditablePage from "@/components/EditablePage";
import { StaticContentProvider } from "@/context/ContentContext";
import type { SiteContent } from "@/lib/content-types";
import LiveEditor from "@/components/admin/LiveEditor";
import CustomStyles from "@/components/CustomStyles";

interface Props {
  content: SiteContent;
  tenantSlug: string;
  pageSlug: string;
  isAdmin?: boolean;
  sectionId?: number;
}

export function AsteraDemoPageTemplate({ content, tenantSlug, pageSlug, isAdmin = false, sectionId }: Props) {
  const localizedContent = useMemo(
    () => localizeDemoLinks(content, tenantSlug),
    [content, tenantSlug]
  );

  async function saveContent(nextContent: SiteContent) {
    if (!sectionId) return;
    await fetch(`/api/demo/${tenantSlug}/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: { content: nextContent } }),
    });
  }

  return (
    <StaticContentProvider
      content={localizedContent}
      admin={{ isAdmin, email: isAdmin ? `${tenantSlug}@demo.local` : null, setupRequired: false }}
      onSaveContent={isAdmin ? saveContent : undefined}
    >
      <CustomStyles />
      {isAdmin && <LiveEditor />}
      <EditablePage slug={pageSlug} />
    </StaticContentProvider>
  );
}

function localizeDemoLinks(content: SiteContent, tenantSlug: string): SiteContent {
  const base = `/demo/${tenantSlug}`;
  const localizeHref = (href: string) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return href;
    }
    if (href.startsWith("/demo/")) return href;
    if (href.startsWith("/")) return `${base}${href}`;
    return "#";
  };

  return {
    ...content,
    header: {
      ...content.header,
      logoHref: base,
      signInHref: `${base}/login`,
      navItems: content.header.navItems.map((item) => ({
        ...item,
        href: localizeHref(item.href),
        dropdown: item.dropdown?.map((dropdownItem) => ({
          ...dropdownItem,
          href: localizeHref(dropdownItem.href),
        })),
      })),
    },
    hero: {
      ...content.hero,
      ctaHref: localizeHref(content.hero.ctaHref),
      secondaryButtonHref: localizeHref(content.hero.secondaryButtonHref ?? "/shop"),
    },
    about: { ...content.about, buttonHref: localizeHref(content.about.buttonHref) },
    manifest: {
      ...content.manifest,
      cards: content.manifest.cards.map((card) => ({ ...card, btnHref: localizeHref(card.btnHref) })),
    },
    pickacard: { ...content.pickacard, buttonHref: localizeHref(content.pickacard.buttonHref) },
    footer: {
      ...content.footer,
      footerLinks: content.footer.footerLinks.map((link) => ({ ...link, href: localizeHref(link.href) })),
    },
    aboutPage: { ...content.aboutPage, ctaButtonHref: localizeHref(content.aboutPage.ctaButtonHref) },
    pages: content.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => ({
        ...block,
        href: block.href ? localizeHref(block.href) : block.href,
        ctaHref: block.ctaHref ? localizeHref(block.ctaHref) : block.ctaHref,
        twoColBtnHref: block.twoColBtnHref ? localizeHref(block.twoColBtnHref) : block.twoColBtnHref,
        cards: block.cards?.map((card) => ({ ...card, btnHref: localizeHref(card.btnHref) })),
      })),
    })),
  };
}
