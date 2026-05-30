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

export function getSectionLabel(type: string): string {
  return SECTION_TYPE_LABELS[type] ?? type;
}
