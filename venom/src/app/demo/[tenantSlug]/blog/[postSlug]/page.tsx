import { notFound } from "next/navigation";
import { getTenantBySlug, queryOne, getTenantPage, getPageSections, query } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";



interface Props {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown[];
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

function hasBlogModule(tenant: { active_modules: string[] }): boolean {
  return tenant.active_modules.includes("blog");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};

  const post = await queryOne<Pick<BlogPost, "seo_title" | "seo_description" | "title" | "excerpt" | "featured_image">>(
    "SELECT seo_title, seo_description, title, excerpt, featured_image FROM blog_posts WHERE tenant_id = $1 AND slug = $2 AND status = 'published'",
    [tenant.id, postSlug]
  );
  if (!post) return {};

  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? undefined;

  return {
    title,
    description,
    robots: hasBlogModule(tenant) ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: post.featured_image ? [{ url: post.featured_image }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  if (!hasBlogModule(tenant)) return notFound();

  const post = await queryOne<BlogPost>(
    "SELECT * FROM blog_posts WHERE tenant_id = $1 AND slug = $2 AND status = 'published'",
    [tenant.id, postSlug]
  );
  if (!post) return notFound();

  // Design tokens + contact info from homepage
  const homepage = await getTenantPage(tenant.id, "home");
  const homeSections = homepage ? await getPageSections(tenant.id, homepage.id) : [];
  const designTokens = (homeSections[0]?.settings?.designTokens ?? {}) as Record<string, string>;

  const contactSection = homeSections.find((s) => s.section_type === "contact");
  const contactContent = (contactSection?.settings?.content ?? {}) as { phone?: string; email?: string };

  // Related posts (same category or tags, exclude current)
  interface RelatedPost { id: number; slug: string; title: string; excerpt: string | null; featured_image: string | null; published_at: string | null; }
  const relatedPosts = await query<RelatedPost>(
    `SELECT id, slug, title, excerpt, featured_image, published_at
     FROM blog_posts
     WHERE tenant_id = $1 AND status = 'published' AND id != $2
       AND (category = $3 OR tags && $4)
     ORDER BY published_at DESC LIMIT 3`,
    [tenant.id, post.id, post.category ?? "", post.tags ?? []]
  );

  const base = `/demo/${tenantSlug}`;

  // Schema.org Article + Breadcrumb
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.featured_image ?? undefined,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? undefined,
    publisher: {
      "@type": "Organization",
      name: tenantSlug,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://webero.co${base}/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Domů", item: `https://webero.co${base}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `https://webero.co${base}/blog` },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  const renderContent = (blocks: unknown[]) =>
    blocks.map((block, i) => {
      if (typeof block === "string") return <p key={i} className="mb-5 leading-relaxed">{block}</p>;
      const b = block as Record<string, unknown>;
      if (b.type === "heading") return (
        <h2 key={i} className="text-xl font-bold mt-8 mb-3" style={{ fontFamily: designTokens.fontHeading || "inherit" }}>
          {String(b.text ?? "")}
        </h2>
      );
      if (b.type === "quote") return (
        <blockquote
          key={i}
          className="pl-4 py-1 my-5 italic text-base"
          style={{ borderLeft: `3px solid ${designTokens.colorPrimary || "#6366f1"}`, color: designTokens.colorTextMuted || "#6b7280" }}
        >
          {String(b.text ?? "")}
        </blockquote>
      );
      if (b.type === "image") return (
        <figure key={i} className="my-6">
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <Image
              src={String(b.url ?? "")}
              alt={String(b.alt ?? "")}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
          {b.alt ? <figcaption className="text-xs text-center mt-2" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>{String(b.alt)}</figcaption> : null}
        </figure>
      );
      if (b.type === "list") {
        const items = Array.isArray(b.items) ? (b.items as string[]) : [];
        return (
          <ul key={i} className="mb-5 pl-5 space-y-1 list-disc" style={{ color: designTokens.colorText || "#111" }}>
            {items.map((item, j) => <li key={j} className="leading-relaxed">{item}</li>)}
          </ul>
        );
      }
      if (b.type === "cta") return (
        <div key={i} className="my-8 text-center">
          <a
            href={String(b.ctaHref ?? "#")}
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ backgroundColor: designTokens.colorPrimary || "#6366f1", borderRadius: "var(--radius, 8px)" }}
          >
            {String(b.ctaText ?? "Kontaktujte nás")}
          </a>
        </div>
      );
      return <p key={i} className="mb-5 leading-relaxed">{String(b.text ?? "")}</p>;
    });

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: designTokens.colorBackground || "#fff",
        color: designTokens.colorText || "#111827",
        fontFamily: designTokens.fontBody || "Inter, sans-serif",
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="max-w-2xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
          <Link href={base} className="hover:underline">{tenantSlug}</Link>
          <span className="mx-1">/</span>
          <Link href={`${base}/blog`} className="hover:underline">Blog</Link>
          <span className="mx-1">/</span>
          <span className="truncate">{post.title}</span>
        </nav>

        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wide block mb-2" style={{ color: designTokens.colorPrimary || "#6366f1" }}>
            {post.category}
          </span>
        )}

        <h1
          className="text-3xl font-bold mb-4 leading-tight"
          style={{ fontFamily: designTokens.fontHeading || "inherit" }}
        >
          {post.title}
        </h1>

        <p className="text-sm mb-6" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
          {post.author && <span>{post.author} · </span>}
          {post.published_at && new Date(post.published_at).toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        {post.featured_image && (
          <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 672px) 100vw, 672px"
            />
          </div>
        )}

        {post.excerpt && (
          <p
            className="text-lg leading-relaxed mb-8 pl-4"
            style={{ borderLeft: `3px solid ${designTokens.colorPrimary || "#6366f1"}`, color: designTokens.colorTextMuted || "#6b7280" }}
          >
            {post.excerpt}
          </p>
        )}

        <div className="text-base">
          {renderContent(Array.isArray(post.content) ? post.content : [])}
        </div>

        {/* Author box */}
        {post.author && (
          <div
            className="mt-10 p-5 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: designTokens.colorSurface || "#f9fafb", border: `1px solid ${designTokens.colorBorder || "#e5e7eb"}` }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: designTokens.colorPrimary || "#6366f1" }}
            >
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: designTokens.colorText || "#111" }}>{post.author}</p>
              <p className="text-xs mt-0.5" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>Autor článku</p>
            </div>
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: designTokens.colorSurface || "#f9fafb", color: designTokens.colorTextMuted || "#6b7280" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t" style={{ borderColor: designTokens.colorBorder || "#e5e7eb" }}>
          <Link href={`${base}/blog`} className="text-sm font-medium hover:underline" style={{ color: designTokens.colorPrimary || "#6366f1" }}>
            ← Zpět na blog
          </Link>
        </div>
      </article>

      {/* Related articles */}
      {relatedPosts.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: designTokens.fontHeading || "inherit", color: designTokens.colorText || "#111" }}>
            Související články
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedPosts.map((rp) => (
              <Link key={rp.id} href={`${base}/blog/${rp.slug}`} className="group block rounded-xl overflow-hidden border hover:shadow-md transition-shadow" style={{ borderColor: designTokens.colorBorder || "#e5e7eb", backgroundColor: designTokens.colorSurface || "#f9fafb" }}>
                {rp.featured_image && (
                  <div className="relative w-full h-28 overflow-hidden">
                    <Image src={rp.featured_image} alt={rp.title} fill className="object-cover" sizes="33vw" />
                  </div>
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold group-hover:underline line-clamp-2" style={{ color: designTokens.colorText || "#111" }}>{rp.title}</p>
                  {rp.published_at && (
                    <p className="text-xs mt-1" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
                      {new Date(rp.published_at).toLocaleDateString("cs-CZ")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sticky CTA */}
      {(contactContent.phone || contactContent.email) && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 py-3 px-4"
          style={{ backgroundColor: designTokens.colorPrimary || "#6366f1" }}
        >
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <p className="text-white text-sm font-medium">Máte zájem? Kontaktujte nás.</p>
            <div className="flex gap-2 flex-shrink-0">
              {contactContent.phone && (
                <a href={`tel:${contactContent.phone}`} className="px-4 py-1.5 bg-white rounded-lg text-xs font-semibold" style={{ color: designTokens.colorPrimary || "#6366f1" }}>
                  📞 Zavolat
                </a>
              )}
              {contactContent.email && (
                <a href={`mailto:${contactContent.email}`} className="px-4 py-1.5 bg-white rounded-lg text-xs font-semibold" style={{ color: designTokens.colorPrimary || "#6366f1" }}>
                  ✉️ E-mail
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
