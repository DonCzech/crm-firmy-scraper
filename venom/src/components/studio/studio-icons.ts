import {
  Sparkles,
  Boxes,
  Info,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Mail,
  Megaphone,
  Navigation,
  Anchor,
  Users,
  Newspaper,
  Clock,
  Map as MapIcon,
  Tag,
  Square,
  type LucideIcon,
} from "lucide-react";
import { SECTION_VARIANTS } from "@/sections/variants";

export const SECTION_ICON: Record<string, LucideIcon> = {
  hero: Sparkles,
  services: Boxes,
  pricing: Tag,
  about: Info,
  gallery: ImageIcon,
  testimonials: MessageSquare,
  faq: HelpCircle,
  contact: Mail,
  cta: Megaphone,
  "rezora-cta": Megaphone,
  "rezora-widget": Megaphone,
  navbar: Navigation,
  footer: Anchor,
  team: Users,
  "blog-preview": Newspaper,
  "opening-hours": Clock,
  map: MapIcon,
};

export const SECTION_TYPE_LABELS: Record<string, string> = {
  "full-page-clone": "Klonovaná stránka",
  "astera-home": "Astera Home",
  hero: "Hero",
  services: "Služby",
  pricing: "Ceník",
  about: "O nás",
  gallery: "Galerie",
  testimonials: "Reference",
  faq: "FAQ",
  contact: "Kontakt",
  cta: "CTA",
  "rezora-cta": "Rezervační CTA",
  "rezora-widget": "Rezervační widget",
  navbar: "Navigace",
  footer: "Patička",
  team: "Tým",
  "blog-preview": "Náhled blogu",
  "opening-hours": "Otevírací doba",
  map: "Mapa",
};

export function getSectionIcon(type: string): LucideIcon {
  return SECTION_ICON[type] ?? Square;
}

export function getSectionLabel(type: string, variant?: string): string {
  // If a variant is provided, look up its human-readable label in SECTION_VARIANTS
  if (variant && variant !== "default") {
    const variantList = SECTION_VARIANTS[type] ?? [];
    const found = variantList.find(v => v.key === variant);
    if (found) {
      // Use the label up to the first " – " or " (" to get a short name
      const shortLabel = found.label.split(" – ")[0].split(" (")[0].trim();
      return shortLabel;
    }
  }
  return SECTION_TYPE_LABELS[type] ?? type;
}
