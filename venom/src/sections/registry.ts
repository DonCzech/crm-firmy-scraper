import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Each section component has its own prop shape; the registry erases the
// difference at the boundary and SectionRenderer forwards the same shared
// props to every entry. Use `any` on purpose to keep the registry generic.
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyComp = ComponentType<any>;

export const SECTION_RENDERERS: Record<string, AnyComp> = {
  navbar: dynamic(() => import("@/components/sections/NavbarSection").then((m) => m.NavbarSection), { ssr: true }) as AnyComp,
  footer: dynamic(() => import("@/components/sections/FooterSection").then((m) => m.FooterSection), { ssr: true }) as AnyComp,
  hero: dynamic(() => import("@/components/sections/HeroSection").then((m) => m.HeroSection), { ssr: true }) as AnyComp,
  services: dynamic(() => import("@/components/sections/ServicesSection").then((m) => m.ServicesSection), { ssr: true }) as AnyComp,
  pricing: dynamic(() => import("@/components/sections/ServicesSection").then((m) => m.ServicesSection), { ssr: true }) as AnyComp,
  testimonials: dynamic(() => import("@/components/sections/TestimonialsSection").then((m) => m.TestimonialsSection), { ssr: true }) as AnyComp,
  gallery: dynamic(() => import("@/components/sections/GallerySection").then((m) => m.GallerySection), { ssr: true }) as AnyComp,
  contact: dynamic(() => import("@/components/sections/ContactSection").then((m) => m.ContactSection), { ssr: true }) as AnyComp,
  "opening-hours": dynamic(() => import("@/components/sections/OpeningHoursSection").then((m) => m.OpeningHoursSection), { ssr: true }) as AnyComp,
  faq: dynamic(() => import("@/components/sections/FaqSection").then((m) => m.FaqSection), { ssr: true }) as AnyComp,
  cta: dynamic(() => import("@/components/sections/CtaSection").then((m) => m.CtaSection), { ssr: true }) as AnyComp,
  "rezora-cta": dynamic(() => import("@/components/sections/CtaSection").then((m) => m.CtaSection), { ssr: true }) as AnyComp,
  "rezora-widget": dynamic(() => import("@/components/sections/RezoraWidget").then((m) => m.RezoraWidget), { ssr: true }) as AnyComp,
  team: dynamic(() => import("@/components/sections/TeamSection").then((m) => m.TeamSection), { ssr: true }) as AnyComp,
  about: dynamic(() => import("@/components/sections/AboutSection").then((m) => m.AboutSection), { ssr: true }) as AnyComp,
  "blog-preview": dynamic(() => import("@/components/sections/BlogPreviewSection").then((m) => m.BlogPreviewSection), { ssr: true }) as AnyComp,
  map: dynamic(() => import("@/components/sections/MapSection").then((m) => m.MapSection), { ssr: true }) as AnyComp,
  promo: dynamic(() => import("@/components/sections/PromoSection").then((m) => m.PromoSection), { ssr: true }) as AnyComp,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export function getSectionRenderer(type: string): AnyComp | null {
  return SECTION_RENDERERS[type] ?? null;
}
