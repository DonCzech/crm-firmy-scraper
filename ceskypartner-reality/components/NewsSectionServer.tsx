import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicBlogPost } from "@/lib/queries";
import { ARTICLES } from "@/data/articles";
import Reveal from "./Reveal";
import type { SiteLocale } from "@/lib/locale";
import { ARTICLES_EN as ENGLISH_ARTICLES } from "@/data/articles-en";

type Article = {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  href: string;
};

function mapBlogPost(p: PublicBlogPost, locale: SiteLocale): Article {
  return {
    id: p.id,
    title: p.title,
    category: p.tags?.[0] || "Blog",
    date: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString(locale === "en" ? "en-GB" : "cs-CZ", { day: "numeric", month: "long", year: "numeric" })
      : "",
    image: p.coverImage || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80&auto=format&fit=crop",
    href: `/blog/${p.slug}`,
  };
}

function mapHardcoded(a: (typeof ARTICLES)[0]): Article {
  return { id: a.id, title: a.title, category: a.category, date: a.date, image: a.image, href: "#" };
}

function ArticleCard({ article, large = false }: { article: Article; large?: boolean }) {
  return (
    <Link href={article.href} className="group block" aria-label={article.title}>
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
    </Link>
  );
}

export default function NewsSectionServer({ posts, locale = "cs" }: { posts: PublicBlogPost[]; locale?: SiteLocale }) {
  const en = locale === "en";
  const articles: Article[] =
    en
      ? ENGLISH_ARTICLES.map((article) => ({
          id: article.id,
          title: article.title,
          category: article.category,
          date: article.date,
          image: article.image,
          href: `/en/journal/${article.slug}`,
        }))
      : posts.length > 0
        ? posts.map((post) => mapBlogPost(post, locale))
        : ARTICLES.map(mapHardcoded);

  const [main, ...rest] = articles;
  if (!main) return null;

  return (
    <section id="aktualne" className="bg-paper">
      <div className="mx-auto max-w-site px-6 py-24 md:py-28 xl:px-10">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-muted">{en ? "Market journal" : "Aktuálně"}</p>
              <h2 className="mt-4 text-[clamp(1.9rem,3vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {en ? "Perspective on Czech property" : "Aktuálně z realitního trhu"}
              </h2>
            </div>
            <Link href={en ? "/en/journal" : "/blog"} className="nav-link flex items-center gap-1.5 text-[13.5px] tracking-[0.03em]">
              {en ? "All articles" : "Všechny články"}
              <ArrowUpRight size={15} strokeWidth={1.5} className="text-bronze" />
            </Link>
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
