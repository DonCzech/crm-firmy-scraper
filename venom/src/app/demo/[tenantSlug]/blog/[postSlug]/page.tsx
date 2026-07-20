import { notFound } from "next/navigation";
import { getTenantBySlug, getTenantPage, getPageSections } from "@/lib/db";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import { TenantChrome } from "@/components/tenant/TenantChrome";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogTheme, blogCssVars } from "@/lib/blog/theme";
import { getPublishedPost, getRelatedPosts, getAdjacentPosts } from "@/lib/blog/queries";
import { extractToc, readingTimeMinutes, type BlogBlock } from "@/lib/blog/content";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { PostCard, formatDate } from "@/components/blog/PostCard";
import { BlogStyles } from "@/components/blog/BlogStyles";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ShareBar } from "@/components/blog/ShareBar";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { LightboxProvider } from "@/components/blog/Lightbox";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

interface Props {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

function hasBlogModule(tenant: { active_modules: string[] | null }): boolean {
  return (tenant.active_modules ?? []).includes("blog");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const post = await getPublishedPost(tenant.id, postSlug);
  if (!post) return {};

  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? undefined;
  const url = `${BASE_URL}/demo/${tenantSlug}/blog/${post.slug}`;
  const image = post.og_image ?? post.featured_image ?? undefined;
  const indexable = hasBlogModule(tenant) && !post.noindex;

  return {
    title,
    description,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags?.length ? post.tags : undefined,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  if (!hasBlogModule(tenant)) return notFound();

  const post = await getPublishedPost(tenant.id, postSlug);
  if (!post) return notFound();

  const blocks: BlogBlock[] = Array.isArray(post.content) ? post.content : [];
  const toc = extractToc(blocks);
  const readingTime = post.reading_time_min ?? readingTimeMinutes(blocks);

  const [theme, related, adjacent] = await Promise.all([
    getBlogTheme(tenant),
    getRelatedPosts(tenant.id, post),
    getAdjacentPosts(tenant.id, post.published_at, post.id),
  ]);

  // Contact info for the closing CTA
  const homepage = await getTenantPage(tenant.id, "home");
  const homeSections = homepage ? await getPageSections(tenant.id, homepage.id) : [];
  const contactSection = homeSections.find((s) => s.section_type === "contact");
  const contactContent = (contactSection?.settings?.content ?? {}) as { phone?: string; email?: string };

  const base = `/demo/${tenantSlug}`;
  const url = `${BASE_URL}${base}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featured_image ?? undefined,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? undefined,
    wordCount: undefined,
    timeRequired: `PT${readingTime}M`,
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    articleSection: post.category ?? undefined,
    publisher: { "@type": "Organization", name: theme.businessName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: `${BASE_URL}${base}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}${base}/blog` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <TenantChrome tenant={tenant}>
    <div
      className="blog-root"
      style={{
        ...blogCssVars(theme),
        backgroundColor: "var(--blog-bg)",
        color: "var(--blog-text)",
        fontFamily: "var(--blog-font-body)",
      }}
    >
      <LightboxProvider>
      <BlogStyles />
      <TenantCustomCode tenantId={tenant.id} placement="head" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <ReadingProgress targetId="blog-article-body" />

      {/* ── Article header ──────────────────────────────────────────── */}
      <header className="max-w-3xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        <nav className="text-xs mb-8" style={{ color: "var(--blog-muted)" }} aria-label="Drobečková navigace">
          <Link href={base} className="hover:underline">{theme.businessName}</Link>
          <span className="mx-1.5" aria-hidden>/</span>
          <Link href={`${base}/blog`} className="hover:underline">Blog</Link>
          {post.category && (
            <>
              <span className="mx-1.5" aria-hidden>/</span>
              <Link href={`${base}/blog?category=${encodeURIComponent(post.category)}`} className="hover:underline">
                {post.category}
              </Link>
            </>
          )}
        </nav>

        {post.category && (
          <Link
            href={`${base}/blog?category=${encodeURIComponent(post.category)}`}
            className="inline-block px-3 py-1 mb-4 text-[11px] font-bold uppercase tracking-wide transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)", borderRadius: "999px" }}
          >
            {post.category}
          </Link>
        )}

        <h1
          className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-6"
          style={{ fontFamily: "var(--blog-font-heading)" }}
        >
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-8" style={{ color: "var(--blog-muted)" }}>
          {post.author && (
            <span className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)" }}
                aria-hidden
              >
                {post.author.charAt(0).toUpperCase()}
              </span>
              <span className="font-medium" style={{ color: "var(--blog-text)" }}>{post.author}</span>
            </span>
          )}
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
          <span className="flex items-center gap-1">
            <span aria-hidden>◷</span> {readingTime} min čtení
          </span>
        </div>
      </header>

      {/* ── Featured image ─────────────────────────────────────────── */}
      {post.featured_image && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 mb-10 md:mb-14">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "21/10", borderRadius: "var(--blog-radius-lg)" }}
          >
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      {/* ── Body with TOC rail ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:grid lg:grid-cols-[1fr_minmax(0,44rem)_1fr] lg:gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>

        <article id="blog-article-body" className="blog-prose min-w-0">
          {post.excerpt && (
            <p
              className="text-lg md:text-xl leading-relaxed mb-10 pl-5"
              style={{ borderLeft: "3px solid var(--blog-primary)", color: "var(--blog-muted)" }}
            >
              {post.excerpt}
            </p>
          )}

          <div className="text-[1.05rem]">
            <BlogContentRenderer blocks={blocks} skin={theme.skin} />
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`${base}/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-xs font-medium border transition-colors hover:[border-color:var(--blog-primary)] hover:[color:var(--blog-primary)]"
                  style={{ borderColor: "var(--blog-border)", color: "var(--blog-muted)", borderRadius: "999px" }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Share + author */}
          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t"
            style={{ borderColor: "var(--blog-border)" }}
          >
            {post.author ? (
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)" }}
                  aria-hidden
                >
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{post.author}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--blog-muted)" }}>
                    Autor článku · {theme.businessName}
                  </p>
                </div>
              </div>
            ) : <span />}
            <ShareBar title={post.title} url={url} />
          </div>

          {/* Prev / next */}
          {(adjacent.prev || adjacent.next) && (
            <nav className="mt-10 grid sm:grid-cols-2 gap-4" aria-label="Další články">
              {adjacent.prev ? (
                <Link
                  href={`${base}/blog/${adjacent.prev.slug}`}
                  className="group p-5 border transition-colors hover:[border-color:var(--blog-primary)]"
                  style={{ borderColor: "var(--blog-border)", borderRadius: "var(--blog-radius-lg)" }}
                >
                  <p className="text-xs mb-2" style={{ color: "var(--blog-muted)" }}>← Starší článek</p>
                  <p className="text-sm font-semibold leading-snug line-clamp-2 transition-colors group-hover:[color:var(--blog-primary)]">
                    {adjacent.prev.title}
                  </p>
                </Link>
              ) : <span className="hidden sm:block" />}
              {adjacent.next && (
                <Link
                  href={`${base}/blog/${adjacent.next.slug}`}
                  className="group p-5 border text-right transition-colors hover:[border-color:var(--blog-primary)]"
                  style={{ borderColor: "var(--blog-border)", borderRadius: "var(--blog-radius-lg)" }}
                >
                  <p className="text-xs mb-2" style={{ color: "var(--blog-muted)" }}>Novější článek →</p>
                  <p className="text-sm font-semibold leading-snug line-clamp-2 transition-colors group-hover:[color:var(--blog-primary)]">
                    {adjacent.next.title}
                  </p>
                </Link>
              )}
            </nav>
          )}
        </article>

        <div className="hidden lg:block" />
      </div>

      {/* ── Related ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 mt-20 pb-10">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--blog-font-heading)" }}>
              Mohlo by vás zajímat
            </h2>
            <Link href={`${base}/blog`} className="text-sm font-semibold hover:underline" style={{ color: "var(--blog-primary)" }}>
              Všechny články →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((rp) => (
              <PostCard key={rp.id} post={rp} base={base} skin={theme.skin} />
            ))}
          </div>
        </section>
      )}

      {/* ── Closing CTA ─────────────────────────────────────────────── */}
      {(contactContent.phone || contactContent.email) && (
        <section className="max-w-3xl mx-auto px-4 md:px-6 pb-20">
          <div
            className="px-8 py-10 text-center text-white relative overflow-hidden"
            style={{ backgroundColor: "var(--blog-primary)", borderRadius: "var(--blog-radius-lg)" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-15"
              style={{ background: "radial-gradient(circle at 80% 20%, #fff, transparent 55%)" }}
            />
            <h2 className="relative text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "var(--blog-font-heading)" }}>
              Máte zájem o naše služby?
            </h2>
            <p className="relative text-sm opacity-90 mb-6">Ozvěte se nám — rádi vám poradíme.</p>
            <div className="relative flex flex-wrap justify-center gap-3">
              {contactContent.phone && (
                <a
                  href={`tel:${contactContent.phone}`}
                  className="px-6 py-3 bg-white text-sm font-bold transition-transform hover:scale-105"
                  style={{ color: "var(--blog-primary)", borderRadius: "var(--blog-radius-md)" }}
                >
                  Zavolat: {contactContent.phone}
                </a>
              )}
              {contactContent.email && (
                <a
                  href={`mailto:${contactContent.email}`}
                  className="px-6 py-3 border border-white/50 text-white text-sm font-bold transition-colors hover:bg-white/10"
                  style={{ borderRadius: "var(--blog-radius-md)" }}
                >
                  Napsat e-mail
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </LightboxProvider>
    </div>
    </TenantChrome>
  );
}
