"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";
import type { SiteLocale } from "@/lib/locale";

type FavoriteButtonProps = {
  id: string;
  /** image = glass kroužek přes fotku, detail = kroužek s hairline borderem */
  variant?: "image" | "detail";
  className?: string;
  locale?: SiteLocale;
};

export default function FavoriteButton({ id, variant = "image", className = "", locale = "cs" }: FavoriteButtonProps) {
  const { has, toggle } = useFavorites();
  const active = has(id);

  const base =
    variant === "image"
      ? `flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300 ${
          active ? "bg-paper text-bronze-deep" : "bg-ink/35 text-paper hover:bg-ink/55"
        }`
      : `flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${
          active
            ? "border-bronze bg-bronze/10 text-bronze-deep"
            : "border-line text-ink hover:border-ink"
        }`;

  return (
    <button
      type="button"
      aria-label={
        locale === "en"
          ? active ? "Remove from favourites" : "Add to favourites"
          : active ? "Odebrat z oblíbených" : "Přidat do oblíbených"
      }
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={`${base} ${className}`}
    >
      <Heart
        size={variant === "image" ? 16 : 18}
        strokeWidth={1.5}
        className={`transition-transform duration-300 ${active ? "scale-110" : ""}`}
        fill={active ? "currentColor" : "none"}
      />
    </button>
  );
}
