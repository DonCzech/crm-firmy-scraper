import { notFound } from "next/navigation";
import { getTenantBySlug, query, getTenantPage, getPageSections } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";



const PER_PAGE = 9;

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

function hasBlogModule(tenant: { active_modules: string[] | null }): boolean {
  return (tenant.active_modules ?? []).includes("blog");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  return {
    title: `Blog — ${tenantSlug}`,
    robots: hasBlogModule(tenant) ? { index: true, follow: true } : { index: false, follow: false },
  };
}

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  published_at: string | null;
}

export default async function BlogListPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const { page: pageParam, category: catParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const activeCategory = catParam ?? null;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  if (!hasBlogModule(tenant)) return notFound();

  const [countRows, posts, categories] = await Promise.all([
    query<{ count: string }>(
      activeCategory
        ? "SELECT COUNT(*) as count FROM blog_posts WHERE tenant_id = $1 AND status = 'published' AND category = $2"
        : "SELECT COUNT(*) as count FROM blog_posts WHERE tenant_id = $1 AND status = 'published'",
      activeCategory ? [tenant.id, activeCategory] : [tenant.id]
    ),
    query<BlogPost>(
      activeCategory
        ? `SELECT id, slug, title, excerpt, featured_image, author, category, published_at
           FROM blog_posts WHERE tenant_id = $1 AND status = 'published' AND category = $2
           ORDER BY published_at DESC LIMIT $3 OFFSET $4`
        : `SELECT id, slug, title, excerpt, featured_image, author, category, published_at
           FROM blog_posts WHERE tenant_id = $1 AND status = 'published'
           ORDER BY published_at DESC LIMIT $2 OFFSET $3`,
      activeCategory
        ? [tenant.id, activeCategory, PER_PAGE, (page - 1) * PER_PAGE]
        : [tenant.id, PER_PAGE, (page - 1) * PER_PAGE]
    ),
    query<{ category: string }>(
      "SELECT DISTINCT category FROM blog_posts WHERE tenant_id = $1 AND status = 'published' AND category IS NOT NULL ORDER BY category",
      [tenant.id]
    ),
  ]);

  const total = parseInt(countRows[0]?.count ?? "0", 10);
  const totalPages = Math.ceil(total / PER_PAGE);

  // Get design tokens from the homepage sections
  const homepage = await getTenantPage(tenant.id, "home");
  const homeSections = homepage ? await getPageSections(tenant.id, homepage.id) : [];
  const designTokens = (homeSections[0]?.settings?.designTokens ?? {}) as Record<string, string>;

  const base = `/demo/${tenantSlug}`;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: designTokens.colorBackground || "#fff",
        color: designTokens.colorText || "#111827",
        fontFamily: designTokens.fontBody || "Inter, sans-serif",
      }}
    >
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
        <nav className="text-xs" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
          <Link href={base} className="hover:underline">{tenantSlug}</Link>
          <span className="mx-1">/</span>
          <span>Blog</span>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ fontFamily: designTokens.fontHeading || "inherit" }}
        >
          Blog
        </h1>

        {/* Category navigation */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={`${base}/blog`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${!activeCategory ? "border-transparent text-white" : "border-current hover:opacity-80"}`}
              style={!activeCategory
                ? { backgroundColor: designTokens.colorPrimary || "#6366f1", color: "#fff" }
                : { color: designTokens.colorTextMuted || "#6b7280", borderColor: designTokens.colorBorder || "#e5e7eb" }}
            >
              Vše
            </Link>
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`${base}/blog?category=${encodeURIComponent(c.category)}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors hover:opacity-80`}
                style={activeCategory === c.category
                  ? { backgroundColor: designTokens.colorPrimary || "#6366f1", color: "#fff", borderColor: "transparent" }
                  : { color: designTokens.colorTextMuted || "#6b7280", borderColor: designTokens.colorBorder || "#e5e7eb" }}
              >
                {c.category}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && (
          <p style={{ color: designTokens.colorTextMuted || "#6b7280" }}>Zatím žádné příspěvky.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col rounded-2xl overflow-hidden border"
              style={{ borderColor: designTokens.colorBorder || "#e5e7eb", backgroundColor: designTokens.colorSurface || "#f9fafb" }}
            >
              {post.featured_image && (
                <Link href={`${base}/blog/${post.slug}`} className="block relative h-44 overflow-hidden">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </Link>
              )}
              <div className="p-4 flex-1 flex flex-col">
                {post.category && (
                  <span
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{ color: designTokens.colorPrimary || "#6366f1" }}
                  >
                    {post.category}
                  </span>
                )}
                <h2
                  className="text-base font-bold mb-2 flex-1"
                  style={{ fontFamily: designTokens.fontHeading || "inherit" }}
                >
                  <Link href={`${base}/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-sm mb-3 line-clamp-2" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
                    {post.excerpt}
                  </p>
                )}
                <p className="text-xs mt-auto" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
                  {post.author && <span>{post.author} · </span>}
                  {post.published_at && new Date(post.published_at).toLocaleDateString("cs-CZ")}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {page > 1 && (
              <Link
                href={`${base}/blog?page=${page - 1}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: designTokens.colorBorder || "#e5e7eb" }}
              >
                ← Předchozí
              </Link>
            )}
            <span className="px-4 py-2 text-sm" style={{ color: designTokens.colorTextMuted || "#6b7280" }}>
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`${base}/blog?page=${page + 1}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-gray-50"
                style={{ borderColor: designTokens.colorBorder || "#e5e7eb" }}
              >
                Další →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
