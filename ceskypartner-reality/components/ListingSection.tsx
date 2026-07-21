"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Listing } from "@/data/listings";
import ListingCard from "./ListingCard";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";

type ListingSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  perex?: string;
  ctaLabel: string;
  ctaHref?: string;
  listings: Listing[];
  /** Podklad sekce — paper (default) nebo stone */
  tone?: "paper" | "stone";
  locale?: SiteLocale;
};

export default function ListingSection({
  id,
  eyebrow,
  title,
  perex,
  ctaLabel,
  ctaHref = "#",
  listings,
  tone = "paper",
  locale = "cs",
}: ListingSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    skipSnaps: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 hover:border-ink disabled:cursor-default disabled:opacity-30 disabled:hover:border-line";

  return (
    <section id={id} className={tone === "stone" ? "bg-stone" : "bg-paper"}>
      <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow text-muted">{eyebrow}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {title}
              </h2>
              {perex && <p className="mt-4 text-[15px] leading-[1.65] text-muted">{perex}</p>}
            </div>
            <div className="flex items-center gap-6">
              <a
                href={ctaHref}
                className="nav-link hidden items-center gap-1.5 text-[13.5px] tracking-[0.03em] sm:flex"
              >
                {ctaLabel}
                <ArrowUpRight size={15} strokeWidth={1.5} className="text-bronze" />
              </a>
              <div className="flex gap-3">
                <button
                  type="button"
                  aria-label={locale === "en" ? "Previous properties" : "Předchozí nemovitosti"}
                  disabled={!canPrev}
                  onClick={() => emblaApi?.scrollPrev()}
                  className={arrowClass}
                >
                  <ArrowLeft size={17} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  aria-label={locale === "en" ? "Next properties" : "Další nemovitosti"}
                  disabled={!canNext}
                  onClick={() => emblaApi?.scrollNext()}
                  className={arrowClass}
                >
                  <ArrowRight size={17} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-12">
          <div className="cursor-grab overflow-hidden active:cursor-grabbing" ref={emblaRef}>
            <div className="-ml-7 flex touch-pan-y">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="min-w-0 flex-[0_0_86%] pl-7 sm:flex-[0_0_52%] md:flex-[0_0_45%] xl:flex-[0_0_31%]"
                >
                  <ListingCard listing={listing} locale={locale} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA na mobilu pod sliderem */}
        <a
          href={ctaHref}
          className="mt-10 flex items-center gap-1.5 text-[13.5px] tracking-[0.03em] sm:hidden"
        >
          {ctaLabel}
          <ArrowUpRight size={15} strokeWidth={1.5} className="text-bronze" />
        </a>
      </div>
    </section>
  );
}
