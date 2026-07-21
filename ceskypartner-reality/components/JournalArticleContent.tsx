import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, User } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import { getBlogPostBySlug } from "@/lib/queries";
import { ARTICLES_EN } from "@/data/articles-en";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import type { SiteLocale } from "@/lib/locale";

export default async function JournalArticleContent({ slug, locale = "cs" }: { slug: string; locale?: SiteLocale }) {
  const en = locale === "en";
  const englishArticle = en ? ARTICLES_EN.find((article) => article.slug === slug) : null;
  const dbPost = en ? null : await getBlogPostBySlug(slug).catch(() => null);
  if (!englishArticle && !dbPost) notFound();

  const article = englishArticle
    ? {
        title: englishArticle.title,
        excerpt: englishArticle.excerpt,
        tags: [englishArticle.category],
        author: "Editorial team",
        date: englishArticle.date,
        isoDate: "2026-07-02",
        coverImage: englishArticle.image,
        content: englishArticle.content.map((paragraph) => `<p>${paragraph}</p>`).join(""),
      }
    : {
        title: dbPost!.title,
        excerpt: dbPost!.excerpt,
        tags: dbPost!.tags,
        author: dbPost!.author?.name || "Redakce",
        date: dbPost!.publishedAt ? new Date(dbPost!.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" }) : null,
        isoDate: dbPost!.publishedAt ? new Date(dbPost!.publishedAt).toISOString() : null,
        coverImage: dbPost!.coverImage,
        content: dbPost!.content,
      };
  const homePath = en ? "/en" : "/";
  const journalPath = en ? "/en/journal" : "/blog";
  const articlePath = `${journalPath}/${slug}`;

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt || undefined,
        inLanguage: en ? "en-GB" : "cs-CZ",
        mainEntityOfPage: absoluteUrl(articlePath),
        ...(article.coverImage ? { image: article.coverImage } : {}),
        ...(article.isoDate ? { datePublished: article.isoDate } : {}),
        author: { "@type": en ? "Organization" : "Person", name: article.author },
        publisher: { "@type": "Organization", name: SITE_NAME, url: en ? `${SITE_URL}/en` : SITE_URL },
      }} />
      <Header variant="solid" locale={locale} />
      <main className="pt-16">
        <article className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label={en ? "Breadcrumb" : "Drobečková navigace"} className="flex items-center gap-2 text-[12.5px] text-muted">
            <Link href={homePath} className="transition-colors hover:text-ink">{en ? "Home" : "Úvod"}</Link>
            <ChevronRight size={13} strokeWidth={1.5} />
            <Link href={journalPath} className="transition-colors hover:text-ink">{en ? "Journal" : "Blog"}</Link>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="line-clamp-1 text-ink">{article.title}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {article.tags?.map((tag) => <span key={tag} className="rounded bg-stone px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{tag}</span>)}
              </div>
              <h1 className="mt-5 text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">{article.title}</h1>
              {article.excerpt && <p className="mt-5 text-[16px] leading-[1.7] text-muted">{article.excerpt}</p>}
              <div className="mt-6 flex items-center justify-center gap-5 text-[13px] text-muted">
                <span className="flex items-center gap-1.5"><User size={14} />{article.author}</span>
                {article.date && <span className="flex items-center gap-1.5"><Calendar size={14} />{article.date}</span>}
              </div>
            </div>
          </Reveal>

          {article.coverImage && (
            <Reveal className="mt-10">
              <div className="relative mx-auto aspect-[2/1] max-w-4xl overflow-hidden">
                <Image src={article.coverImage} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
              </div>
            </Reveal>
          )}
          <Reveal className="mt-12">
            <div
              className="prose prose-lg mx-auto max-w-3xl prose-headings:font-semibold prose-headings:tracking-[-0.02em] prose-p:text-[15.5px] prose-p:leading-[1.75] prose-p:text-ink/85 prose-a:text-bronze-deep prose-a:underline-offset-4 prose-img:rounded"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </Reveal>
        </article>
      </main>
      <NewsletterSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
