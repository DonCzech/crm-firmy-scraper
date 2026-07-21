import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ARTICLES, type Article } from "@/data/articles";
import Reveal from "./Reveal";

function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <a href="#" className="group block" aria-label={article.title}>
      <div className={`relative overflow-hidden bg-stone ${large ? "aspect-[3/2]" : "aspect-[16/10]"}`}>
        <Image
          src={article.image}
          alt=""
          fill
          sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
          className="object-cover transition-transform duration-[800ms] ease-luxe group-hover:scale-105"
        />
      </div>
      <div className={large ? "pt-6" : "pt-4"}>
        <p className="eyebrow text-bronze-deep">{article.category}</p>
        <h3
          className={`mt-2.5 font-semibold leading-snug tracking-[-0.01em] ${
            large ? "text-[clamp(1.3rem,1.8vw,1.7rem)] max-w-xl" : "text-[16px]"
          }`}
        >
          <span className="card-title">{article.title}</span>
        </h3>
        <p className="mt-2.5 text-[12.5px] text-muted">{article.date}</p>
      </div>
    </a>
  );
}

export default function NewsSection() {
  const [main, ...rest] = ARTICLES;

  return (
    <section id="aktualne" className="bg-paper">
      <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-muted">Aktuálně</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                Aktuálně z realitního trhu
              </h2>
            </div>
            <a href="#" className="nav-link flex items-center gap-1.5 text-[13.5px] tracking-[0.03em]">
              Všechny články
              <ArrowUpRight size={15} strokeWidth={1.5} className="text-bronze" />
            </a>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <ArticleCard article={main} large />
          </Reveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {rest.map((article, i) => (
              <Reveal key={article.id} delay={80 + i * 80}>
                <ArticleCard article={article} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
