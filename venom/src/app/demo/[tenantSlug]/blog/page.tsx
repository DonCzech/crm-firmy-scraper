import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/db";
import { TenantCustomCode } from "@/components/tenant/TenantCustomCode";
import { TenantChrome } from "@/components/tenant/TenantChrome";
import type { Metadata } from "next";
import Link from "next/link";
import { getBlogTheme, blogCssVars } from "@/lib/blog/theme";
import { listPublishedPosts, listCategories } from "@/lib/blog/queries";
import { PostCard, formatDate } from "@/components/blog/PostCard";
import { BlogStyles } from "@/components/blog/BlogStyles";
import Image from "next/image";

const PER_PAGE = 9;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://webero.co";

interface Props {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ page?: string; category?: string; q?: string; tag?: string }>;
}

function hasBlogModule(tenant: { active_modules: string[] | null }): boolean {
  return (tenant.active_modules ?? []).includes("blog");
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tenantSlug } = await params;
  const { category, page } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return {};
  // Same resolver the page body uses — business_name is null on most demo
  // tenants, which otherwise put the raw slug in the title.
  const { businessName: name } = await getBlogTheme(tenant);
  const title = category ? `${category} — Blog | ${name}` : `Blog | ${name}`;
  return {
    title,
    description: `Články, novinky a tipy od ${name}.`,
    robots: hasBlogModule(tenant) ? { index: true, follow: true } : { index: false, follow: false },
    alternates: {
      canonical: `${BASE_URL}/demo/${tenantSlug}/blog${category ? `?category=${encodeURIComponent(category)}` : ""}${page && page !== "1" ? `${category ? "&" : "?"}page=${page}` : ""}`,
      types: { "application/rss+xml": `${BASE_URL}/demo/${tenantSlug}/blog/rss.xml` },
    },
    openGraph: { title, type: "website" },
  };
}

export default async function BlogListPage({ params, searchParams }: Props) {
  const { tenantSlug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const activeCategory = sp.category ?? null;
  const q = (sp.q ?? "").trim() || null;
  const tag = sp.tag ?? null;

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return notFound();
  if (!hasBlogModule(tenant)) return notFound();

  const [theme, { posts, total }, categories] = await Promise.all([
    getBlogTheme(tenant),
    listPublishedPosts(tenant.id, { page, perPage: PER_PAGE, category: activeCategory, q, tag }),
    listCategories(tenant.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const base = `/demo/${tenantSlug}`;

  // The newest post gets the hero treatment — only on the unfiltered first page
  const showHeroPost = page === 1 && !activeCategory && !q && !tag && posts.length > 0;
  const heroPost = showHeroPost ? posts[0] : null;
  const gridPosts = heroPost ? posts.slice(1) : posts;

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    if (activeCategory) qs.set("category", activeCategory);
    if (q) qs.set("q", q);
    if (tag) qs.set("tag", tag);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `${base}/blog${s ? `?${s}` : ""}`;
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Blog — ${theme.businessName}`,
    url: `${BASE_URL}${base}/blog`,
    publisher: { "@type": "Organization", name: theme.businessName },
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${BASE_URL}${base}/blog/${p.slug}`,
      datePublished: p.published_at ?? undefined,
      image: p.featured_image ?? undefined,
    })),
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
      <BlogStyles />
      <TenantCustomCode tenantId={tenant.id} placement="head" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      {/* ── Hero header ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 70% 0%, var(--blog-primary), transparent 60%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-8 md:pb-12">
          <nav className="text-xs mb-8" style={{ color: "var(--blog-muted)" }} aria-label="Drobečková navigace">
            <Link href={base} className="hover:underline">{theme.businessName}</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <span>Blog</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
                style={{ color: "var(--blog-primary)" }}
              >
                {theme.businessName}
              </p>
              <h1
                className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight"
                style={{ fontFamily: "var(--blog-font-heading)" }}
              >
                Blog
              </h1>
              <p className="mt-4 text-base md:text-lg max-w-xl" style={{ color: "var(--blog-muted)" }}>
                Články, novinky a tipy z našeho oboru.
              </p>
            </div>

            {/* Search */}
            <form action={`${base}/blog`} method="get" className="w-full md:w-72" role="search">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              <div
                className="flex items-center gap-2 px-4 py-2.5 border transition-colors focus-within:[border-color:var(--blog-primary)]"
                style={{
                  borderColor: "var(--blog-border)",
                  borderRadius: "var(--blog-radius-md)",
                  backgroundColor: "var(--blog-surface)",
                }}
              >
                <span aria-hidden style={{ color: "var(--blog-muted)" }}>⌕</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Hledat v článcích…"
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: "var(--blog-text)" }}
                  aria-label="Hledat v článcích"
                />
              </div>
            </form>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8" role="navigation" aria-label="Kategorie">
              <Link
                href={`${base}/blog`}
                className="px-4 py-1.5 text-xs font-semibold border transition-colors duration-200"
                style={
                  !activeCategory
                    ? { backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)", borderColor: "transparent", borderRadius: "999px" }
                    : { color: "var(--blog-muted)", borderColor: "var(--blog-border)", borderRadius: "999px" }
                }
              >
                Vše
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.category}
                  href={`${base}/blog?category=${encodeURIComponent(c.category)}`}
                  className="px-4 py-1.5 text-xs font-semibold border transition-colors duration-200"
                  style={
                    activeCategory === c.category
                      ? { backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)", borderColor: "transparent", borderRadius: "999px" }
                      : { color: "var(--blog-muted)", borderColor: "var(--blog-border)", borderRadius: "999px" }
                  }
                >
                  {c.category}
                  <span className="ml-1.5 opacity-60">{c.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        {/* Active filter note */}
        {(q || tag) && (
          <p className="mb-6 text-sm" style={{ color: "var(--blog-muted)" }}>
            {q ? <>Výsledky hledání „{q}“ — {total} {total === 1 ? "článek" : total < 5 ? "články" : "článků"}. </> : null}
            {tag ? <>Štítek „{tag}“. </> : null}
            <Link href={`${base}/blog`} className="font-semibold hover:underline" style={{ color: "var(--blog-primary)" }}>
              Zrušit filtr
            </Link>
          </p>
        )}

        {posts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-4xl mb-4" aria-hidden>✎</p>
            <p className="text-lg font-semibold mb-1">Zatím tu nic není</p>
            <p className="text-sm" style={{ color: "var(--blog-muted)" }}>
              {q ? "Zkuste jiný hledaný výraz." : "První článek se právě připravuje."}
            </p>
          </div>
        )}

        {/* ── Featured post ──────────────────────────────────────────── */}
        {heroPost && (
            <Link
              href={`${base}/blog/${heroPost.slug}`}
              className="group grid md:grid-cols-5 gap-6 md:gap-10 items-center mb-14 md:mb-20"
            >
              <div
                className="relative md:col-span-3 overflow-hidden"
                style={{ aspectRatio: "16/10", borderRadius: "var(--blog-radius-lg)", backgroundColor: "var(--blog-surface)" }}
              >
                {heroPost.featured_image ? (
                  <Image
                    src={heroPost.featured_image}
                    alt={heroPost.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 640px"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-6xl font-bold opacity-20"
                    style={{ color: "var(--blog-primary)", fontFamily: "var(--blog-font-heading)" }}
                  >
                    {heroPost.title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--blog-muted)" }}>
                  <span
                    className="px-2.5 py-0.5 font-bold uppercase tracking-wide text-[10px] text-white"
                    style={{ backgroundColor: "var(--blog-primary)", borderRadius: "999px" }}
                  >
                    Nejnovější
                  </span>
                  {heroPost.category && <span>{heroPost.category}</span>}
                  {heroPost.published_at && (
                    <>
                      <span aria-hidden>·</span>
                      <time dateTime={heroPost.published_at}>{formatDate(heroPost.published_at)}</time>
                    </>
                  )}
                </div>
                <h2
                  className="text-2xl md:text-4xl font-bold leading-tight mb-4 transition-colors duration-200 group-hover:[color:var(--blog-primary)]"
                  style={{ fontFamily: "var(--blog-font-heading)" }}
                >
                  {heroPost.title}
                </h2>
                {heroPost.excerpt && (
                  <p className="text-sm md:text-base leading-relaxed line-clamp-3 mb-5" style={{ color: "var(--blog-muted)" }}>
                    {heroPost.excerpt}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-3"
                  style={{ color: "var(--blog-primary)" }}
                >
                  Přečíst celý článek <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
        )}

        {/* ── Grid ───────────────────────────────────────────────────── */}
        {gridPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {gridPosts.map((post) => (
              <PostCard key={post.id} post={post} base={base} skin={theme.skin} />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-1.5 mt-16" aria-label="Stránkování">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="px-4 py-2 text-sm font-medium border transition-colors hover:[border-color:var(--blog-primary)]"
                style={{ borderColor: "var(--blog-border)", borderRadius: "var(--blog-radius-md)" }}
              >
                ← Novější
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p) => {
                const last = acc[acc.length - 1];
                if (typeof last === "number" && p - last > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-2 text-sm" style={{ color: "var(--blog-muted)" }}>…</span>
                ) : (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className="w-9 h-9 flex items-center justify-center text-sm font-semibold transition-colors"
                    style={
                      p === page
                        ? { backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)", borderRadius: "var(--blog-radius-md)" }
                        : { color: "var(--blog-muted)", borderRadius: "var(--blog-radius-md)" }
                    }
                  >
                    {p}
                  </Link>
                )
              )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="px-4 py-2 text-sm font-medium border transition-colors hover:[border-color:var(--blog-primary)]"
                style={{ borderColor: "var(--blog-border)", borderRadius: "var(--blog-radius-md)" }}
              >
                Starší →
              </Link>
            )}
          </nav>
        )}
      </main>
    </div>
    </TenantChrome>
  );
}
