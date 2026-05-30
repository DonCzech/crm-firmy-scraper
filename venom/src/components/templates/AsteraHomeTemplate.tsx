"use client";

import { useMemo } from "react";
import { StaticContentProvider } from "@/context/ContentContext";
import type { SiteContent } from "@/lib/content-types";
import LiveEditor from "@/components/admin/LiveEditor";
import CustomStyles from "@/components/CustomStyles";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import AboutAstera from "@/components/AboutAstera";
import FeaturedIn from "@/components/FeaturedIn";
import ManifestCards from "@/components/ManifestCards";
import PickACard from "@/components/PickACard";
import MonthlyOracle from "@/components/MonthlyOracle";
import Footer from "@/components/Footer";

interface Props {
  content: SiteContent;
  tenantSlug?: string;
  isAdmin?: boolean;
  adminEmail?: string;
  onSaveContent?: (content: SiteContent) => Promise<void>;
}

export function AsteraHomeTemplate({ content, tenantSlug, isAdmin = false, adminEmail, onSaveContent }: Props) {
  const localizedContent = useMemo(
    () => localizeDemoLinks(content, tenantSlug),
    [content, tenantSlug]
  );

  return (
    <StaticContentProvider
      content={localizedContent}
      admin={{ isAdmin, email: adminEmail ?? null, setupRequired: false }}
      onSaveContent={onSaveContent}
    >
      <CustomStyles />
      {isAdmin && <LiveEditor />}
      <Header />
      <main>
        <Hero />
        <Newsletter />
        <AboutAstera />
        <FeaturedIn />
        <ManifestCards />
        <PickACard />
        <MonthlyOracle />
      </main>
      <Footer />
    </StaticContentProvider>
  );
}

function localizeDemoLinks(content: SiteContent, tenantSlug?: string): SiteContent {
  if (!tenantSlug) return content;

  const base = `/demo/${tenantSlug}`;
  const localizeHref = (href: string) => {
    const asteraPath = href
      .replace(/^https:\/\/www\.asteralight\.cz/, "")
      .replace(/^https:\/\/asteralight\.cz/, "");
    if (asteraPath !== href) {
      return asteraPath ? `${base}${asteraPath}` : base;
    }
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
    about: {
      ...content.about,
      buttonHref: localizeHref(content.about.buttonHref),
    },
    manifest: {
      ...content.manifest,
      cards: content.manifest.cards.map((card) => ({
        ...card,
        btnHref: localizeHref(card.btnHref),
      })),
    },
    pickacard: {
      ...content.pickacard,
      buttonHref: localizeHref(content.pickacard.buttonHref),
    },
    footer: {
      ...content.footer,
      footerLinks: content.footer.footerLinks.map((link) => ({
        ...link,
        href: localizeHref(link.href),
      })),
    },
    aboutPage: {
      ...content.aboutPage,
      ctaButtonHref: localizeHref(content.aboutPage.ctaButtonHref),
    },
  };
}
