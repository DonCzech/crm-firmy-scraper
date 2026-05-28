"use client";

import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";
import { OptimizedPicture } from "@/components/OptimizedPicture";

interface PromoCard {
  bgImage?: string;
  bullets?: string[];
  desc?: string;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function PromoSection({ content, variant, sectionId }: Props) {
  const cards = ((content.cards as PromoCard[]) ?? []).slice(0, 2);

  if (variant === "promo-2cards") {
    return (
      <section
        className="relative w-full"
        style={{ backgroundColor: "#1c1410", padding: "60px 0" }}
        data-template="barber-03"
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid gap-6 lg:gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(420px, 100%), 1fr))" }}>
          {cards.map((card, i) => (
            <div
              key={i}
              className="relative overflow-hidden flex flex-col justify-between"
              style={{
                minHeight: 320,
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              {card.bgImage && (
                <div className="absolute inset-0">
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`cards.${i}.bgImage`}
                    src={card.bgImage}
                    alt=""
                    className="absolute inset-0 w-full h-full"
                  >
                    <OptimizedPicture src={card.bgImage} alt="" imgStyle={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </GenericEditableImage>
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(15,10,7,0.45) 0%, rgba(15,10,7,0.72) 100%)" }}
                  />
                </div>
              )}
              <div className="relative z-10 p-8 lg:p-10 flex flex-col gap-6 justify-between" style={{ minHeight: 320 }}>
                <ul className="flex flex-col gap-2" style={{ color: "#c8a96e", fontFamily: "var(--font-heading)", fontSize: "1.6rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, lineHeight: 1.2 }}>
                  {(card.bullets ?? []).map((b, bi) => (
                    <li key={bi}>
                      <GenericEditableText sectionId={sectionId} field={`cards.${i}.bullets.${bi}`} value={b} tag="span" />
                    </li>
                  ))}
                </ul>
                <p style={{ color: "#fff", fontFamily: "var(--font-body)", fontSize: "1.05rem", lineHeight: 1.5, letterSpacing: "0.04em", maxWidth: 320 }}>
                  <GenericEditableText sectionId={sectionId} field={`cards.${i}.desc`} value={card.desc ?? ""} tag="span" />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return null;
}
