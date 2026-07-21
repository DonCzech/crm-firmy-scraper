import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, User } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import { getPublishedBlogPosts } from "@/lib/queries";
import { ARTICLES_EN } from "@/data/articles-en";
import type { SiteLocale } from "@/lib/locale";

export default async function JournalPageContent({ locale = "cs" }: { locale?: SiteLocale }) {
  const en = locale === "en";
  const dbPosts = en ? [] : await getPublishedBlogPosts().catch(() => []);
  const posts = en
    ? ARTICLES_EN.map((article) => ({
        id: article.id, slug: article.slug, title: article.title, excerpt: article.excerpt,
        coverImage: article.image, tags: [article.category], author: "Editorial team", date: article.date,
      }))
    : dbPosts.map((post) => ({
        id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt,
        coverImage: post.coverImage, tags: post.tags, author: post.author?.name || "Redakce",
        date: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" }) : null,
      }));
  const homePath = en ? "/en" : "/";
  const journalPath = en ? "/en/journal" : "/blog";

  return (
    <>
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <div className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <Link href={homePath} className="transition-colors hover:text-ink">{en ? "Home" : "Úvod"}</Link>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink">{en ? "Journal" : "Blog"}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="max-w-2xl">
              <p className="eyebrow text-bronze-deep">{en ? "Journal" : "Blog"}</p>
              <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.02em]">
                {en ? "Perspective on Czech property" : "Aktuálně z realitního trhu"}
              </h1>
              <p className="mt-5 text-[15.5px] leading-[1.7] text-muted">
                {en
                  ? "Market analysis, practical advice and neighbourhood intelligence for buyers, sellers and investors."
                  : "Analýzy trhu, tipy pro kupující i prodávající a novinky ze světa nemovitostí."}
              </p>
            </div>
          </Reveal>

          {posts.length === 0 ? (
            <div className="mt-16 flex flex-col items-center border border-line bg-stone/50 px-8 py-20 text-center">
              <p className="text-[18px] font-semibold">{en ? "No articles yet" : "Zatím žádné články"}</p>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
                {en ? "We are preparing new perspectives for you. Please check back soon." : "Připravujeme pro vás zajímavé články. Vraťte se brzy!"}
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={(i % 3) * 80}>
                  <Link href={`${journalPath}/${post.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                      {post.coverImage ? (
                        <Image src={post.coverImage} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-[800ms] ease-luxe group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[13px] text-muted">{en ? "No image" : "Bez obrázku"}</div>
                      )}
                    </div>
                    <div className="pt-5">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags?.slice(0, 2).map((tag) => <span key={tag} className="rounded bg-stone px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{tag}</span>)}
                      </div>
                      <h2 className="mt-2.5 text-[17px] font-semibold leading-snug tracking-[-0.01em]"><span className="card-title">{post.title}</span></h2>
                      {post.excerpt && <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{post.excerpt}</p>}
                      <div className="mt-4 flex items-center gap-4 text-[12px] text-muted">
                        <span className="flex items-center gap-1"><User size={12} />{post.author}</span>
                        {post.date && <span className="flex items-center gap-1"><Calendar size={12} />{post.date}</span>}
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
