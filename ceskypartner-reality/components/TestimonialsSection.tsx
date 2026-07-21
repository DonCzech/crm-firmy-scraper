"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Quote } from "lucide-react";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";

const TESTIMONIALS_CS = [
  {
    quote:
      "Byt prodali za tři týdny a o dva miliony výš, než byl původní odhad jiné kanceláře. Profesionalita v každém detailu.",
    name: "Martina Doležalová",
    context: "Prodej bytu, Praha 2",
  },
  {
    quote:
      "Ocenili jsme diskrétnost a to, že nás nikdo do ničeho netlačil. Dům jsme kupovali off-market, bez inzerátu.",
    name: "Petr a Jana Struhovi",
    context: "Koupě domu, Praha-západ",
  },
  {
    quote:
      "Spravují nám tři činžovní domy. Reporty chodí každý měsíc, obsazenost drží na sto procentech. Nemám starosti.",
    name: "Ing. Tomáš Vaněk",
    context: "Správa portfolia, Brno",
  },
  {
    quote:
      "Z Londýna jsme celý prodej vyřídili na dálku — video prohlídky, elektronické podpisy, advokátní úschova. Bez jediné cesty do Prahy.",
    name: "Kateřina Marešová",
    context: "Prodej vily, Praha 6",
  },
];
const TESTIMONIALS_EN = [
  {
    quote: "They sold the apartment in three weeks, for CZK 2 million more than another agency had valued it. Professional in every detail.",
    name: "Martina Doležalová",
    context: "Apartment sale, Prague 2",
  },
  {
    quote: "We valued their discretion and never felt under pressure. We bought the house off market, before it was ever advertised.",
    name: "Petr and Jana Struhovi",
    context: "House purchase, Prague-West",
  },
  {
    quote: "They manage three apartment buildings for us. Reports arrive every month and occupancy remains at one hundred per cent. It is genuinely hands-off.",
    name: "Tomáš Vaněk",
    context: "Portfolio management, Brno",
  },
  {
    quote: "We completed the entire sale from London — video viewings, electronic signatures and solicitor escrow. Not a single trip to Prague.",
    name: "Kateřina Marešová",
    context: "Villa sale, Prague 6",
  },
];

type TestimonialItem = { quote: string; name: string; context: string };

export default function TestimonialsSection({ items, locale = "cs" }: { items?: TestimonialItem[]; locale?: SiteLocale }) {
  const en = locale === "en";
  // Recenze z adminu (DB); fallback na výchozí, dokud žádné nejsou
  const testimonials = items && items.length > 0 ? items : en ? TESTIMONIALS_EN : TESTIMONIALS_CS;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="bg-stone">
      <div className="mx-auto max-w-site px-6 py-24 md:py-32 xl:px-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-muted">{en ? "Client stories" : "Reference"}</p>

          <div className="mt-10 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t) => (
                <figure key={t.name} className="min-w-0 flex-[0_0_100%] px-2">
                  <Quote
                    size={34}
                    strokeWidth={0}
                    fill="currentColor"
                    className="mx-auto rotate-180 text-bronze"
                    aria-hidden="true"
                  />
                  <blockquote className="mt-8 text-[clamp(1.2rem,2vw,1.55rem)] font-normal leading-[1.5] tracking-[-0.01em]">
                    {en ? `“${t.quote}”` : `„${t.quote}“`}
                  </blockquote>
                  <figcaption className="mt-8">
                    <p className="text-[15px] font-semibold">{t.name}</p>
                    <p className="mt-1 text-[13px] text-muted">{t.context}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                aria-label={`${en ? "Testimonial" : "Reference"} ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-[3px] w-8 transition-colors duration-300 ${
                  selected === i ? "bg-bronze" : "bg-ink/15 hover:bg-ink/30"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
