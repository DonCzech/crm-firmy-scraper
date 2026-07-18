import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, User } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterSection from "@/components/NewsletterSection";
import Reveal from "@/components/Reveal";
import { getBlogPostBySlug } from "@/lib/queries";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) return {};
  const title = post.metaTitle || `${post.title} | Český Partner Blog`;
  const description = post.metaDesc || post.excerpt || "";
  const url = absoluteUrl(`/blog/${params.slug}`);
  return {
    title,
    description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: "cs_CZ",
      ...(post.coverImage ? { images: [{ url: post.coverImage, width: 1200, height: 630 }] } : {}),
      ...(post.publishedAt ? { publishedTime: new Date(post.publishedAt).toISOString() } : {}),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDesc || post.excerpt || undefined,
    inLanguage: "cs",
    mainEntityOfPage: absoluteUrl(`/blog/${params.slug}`),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    ...(post.publishedAt ? { datePublished: new Date(post.publishedAt).toISOString() } : {}),
    author: { "@type": "Person", name: post.author?.name || "Redakce" },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <Header variant="solid" />

      <main className="pt-16">
        <article className="mx-auto max-w-site px-6 pb-24 pt-10 xl:px-10">
          <nav aria-label="Drobečková navigace" className="flex items-center gap-2 text-[12.5px] text-muted">
            <Link href="/" className="transition-colors hover:text-ink">Úvod</Link>
            <ChevronRight size={13} strokeWidth={1.5} />
            <Link href="/blog" className="transition-colors hover:text-ink">Blog</Link>
            <ChevronRight size={13} strokeWidth={1.5} />
            <span className="text-ink line-clamp-1">{post.title}</span>
          </nav>

          <Reveal className="mt-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex flex-wrap justify-center gap-2">
                {post.tags?.map((t) => (
                  <span key={t} className="rounded bg-stone px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-5 text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
                {post.title}
              </h1>
              {post.excerpt && (
                <p className="mt-5 text-[16px] leading-[1.7] text-muted">{post.excerpt}</p>
              )}
              <div className="mt-6 flex items-center justify-center gap-5 text-[13px] text-muted">
                <span className="flex items-center gap-1.5">
                  <User size={14} /> {post.author?.name || "Redakce"}
                </span>
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(post.publishedAt).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          {post.coverImage && (
            <Reveal className="mt-10">
              <div className="relative mx-auto aspect-[2/1] max-w-4xl overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </Reveal>
          )}

          <Reveal className="mt-12">
            <div
              className="prose prose-lg mx-auto max-w-3xl prose-headings:font-semibold prose-headings:tracking-[-0.02em] prose-p:text-[15.5px] prose-p:leading-[1.75] prose-p:text-ink/85 prose-a:text-bronze-deep prose-a:underline-offset-4 prose-img:rounded"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </Reveal>
        </article>
      </main>

      <NewsletterSection />
      <Footer />
    </>
  );
}
