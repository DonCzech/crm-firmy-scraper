"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GenericEditableText } from "@/components/tenant/GenericEditableText";
import { GenericEditableImage } from "@/components/tenant/GenericEditableImage";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  published_at: string | null;
}

interface BlogPreviewContent {
  title?: string;
  subtitle?: string;
  count?: number;
}

interface Props {
  content: Record<string, unknown>;
  variant: string;
  isAdmin: boolean;
  tenantSlug?: string;
  sectionId: number;
}

export function BlogPreviewSection({ content, variant, isAdmin, tenantSlug, sectionId }: Props) {
  const c = content as BlogPreviewContent & { items?: Array<{ title: string; excerpt?: string; image?: string; date?: string; href?: string }>; posts?: Array<{ title: string; excerpt?: string; image?: string; date?: string; href?: string }>; buttonText?: string };
  const limit = Math.min(Number(c.count ?? 3), 6);
  const isCafeFilled = variant === "cafe-filled-cards";

  // hair-03: white bg, H1 40px Helvetica 400, 3-col cards, solid dark CTA
  if (variant === "hair-03-blog-cards") {
    const DARK = "#2f201a";
    const SANS = "Helvetica, Arial, sans-serif";
    const posts = c.posts ?? [];
    const btnText = c.buttonText ?? "Ostatní články";
    return (
      <section id="blog" style={{ backgroundColor: "#ffffff", padding: "80px 0" }} data-template="hair-03">
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 60px" }}>
          <h1
            style={{
              fontFamily: SANS,
              fontSize: 40,
              fontWeight: 400,
              color: DARK,
              textAlign: "center",
              margin: "0 0 60px 0",
              lineHeight: 1.2,
            }}
          >
            <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Z blogu"} tag="span" />
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {posts.map((post, i) => (
              <article key={i} style={{ display: "flex", flexDirection: "column" }}>
                {post.image && (
                  <GenericEditableImage
                    sectionId={sectionId}
                    field={`posts.${i}.image`}
                    src={post.image}
                    alt={post.title}
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "382/320", width: "100%", flexShrink: 0 }}
                  >
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1300px) 33vw, 400px"
                    />
                  </GenericEditableImage>
                )}
                <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", flex: 1 }}>
                  <h2 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 400, color: DARK, margin: "0 0 12px 0", lineHeight: 1.3 }}>
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={post.title} tag="span" />
                  </h2>
                  {post.excerpt && (
                    <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 400, color: "#2b2b2b", lineHeight: 1.6, margin: "0 0 20px 0" }}>
                      <GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={post.excerpt} tag="span" />
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: "auto" }}>
                    <a
                      href={post.href ?? "#"}
                      style={{
                        fontFamily: SANS,
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#ffffff",
                        backgroundColor: DARK,
                        padding: "7px 24px",
                        textDecoration: "none",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    >
                      <GenericEditableText sectionId={sectionId} field={`posts.${i}.cta`} value="Celý článek" tag="span" />
                    </a>
                    {post.date && (
                      <span style={{ fontFamily: SANS, fontSize: 14, color: "#888", fontWeight: 400 }}>
                        <GenericEditableText sectionId={sectionId} field={`posts.${i}.date`} value={post.date} tag="span" />
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: 48 }}>
            <a
              href="#blog"
              style={{
                fontFamily: SANS,
                fontSize: 16,
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: DARK,
                padding: "7px 24px",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              <GenericEditableText sectionId={sectionId} field="buttonText" value={btnText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    );
  }
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  if (isCafeFilled) {
    const items = c.items ?? [];
    return (
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "var(--color-bg, #fff)" }}>
        <h2
          className="text-4xl md:text-5xl mb-12"
          style={{ color: "var(--color-text, #111)", fontFamily: "var(--font-heading)" }}
        >
          <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Co je nového"} tag="span" />
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <article
              key={i}
              className="text-center flex flex-col"
              style={{ backgroundColor: "var(--color-primary, #6d1f37)", color: "#fff" }}
            >
              {it.image && (
                <GenericEditableImage
                  sectionId={sectionId}
                  field={`items.${i}.image`}
                  src={it.image}
                  alt={it.title}
                  className="relative h-52 overflow-hidden"
                >
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" loading="lazy" />
                </GenericEditableImage>
              )}
              <div className="flex-1 flex flex-col px-5 pt-6 pb-4">
                <h3 className="text-xl font-bold mb-2">
                  <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={it.title} tag="span" />
                </h3>
                {it.date && (
                  <p className="text-sm opacity-70 mb-3">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={it.date} tag="span" />
                  </p>
                )}
                {it.excerpt && (
                  <p className="text-sm opacity-90 mb-5 line-clamp-3">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={it.excerpt} tag="span" />
                  </p>
                )}
                <div className="mt-auto">
                  <a
                    href={it.href ?? "#"}
                    className="inline-block px-5 py-2 bg-white rounded-full font-semibold"
                    style={{ color: "var(--color-primary, #6d1f37)" }}
                  >
                    Čti více
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  useEffect(() => {
    if (!tenantSlug) { setLoading(false); return; }
    fetch(`/api/demo/${tenantSlug}/blog?limit=${limit}&published=true`)
      .then((r) => r.ok ? r.json() as Promise<{ posts: BlogPost[] }> : Promise.resolve({ posts: [] }))
      .then(({ posts: p }) => setPosts(p ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [tenantSlug, limit]);

  const base = tenantSlug ? `/demo/${tenantSlug}` : "#";

  return (
    <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface, #f9fafb)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}>
            <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Z našeho blogu"} tag="span" />
          </h2>
          {c.subtitle && (
            <p style={{ color: "var(--color-text-muted, #6b7280)" }}>
              <GenericEditableText sectionId={sectionId} field="subtitle" value={c.subtitle} tag="span" />
            </p>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ backgroundColor: "var(--color-bg, #fff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-center" style={{ color: "var(--color-text-muted, #6b7280)" }}>
            {isAdmin ? "Blog articles will appear here once published." : "Brzy přidáme první články."}
          </p>
        )}

        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col rounded-2xl overflow-hidden border"
                style={{ borderColor: "var(--color-border, #e5e7eb)", backgroundColor: "var(--color-bg, #fff)" }}
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
                    <span className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--color-primary, #6366f1)" }}>
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-base font-bold mb-2 flex-1" style={{ fontFamily: "var(--font-heading)", color: "var(--color-text, #111)" }}>
                    <Link href={`${base}/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                      {post.excerpt}
                    </p>
                  )}
                  {post.published_at && (
                    <p className="text-xs mt-auto" style={{ color: "var(--color-text-muted, #6b7280)" }}>
                      {new Date(post.published_at).toLocaleDateString("cs-CZ")}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href={`${base}/blog`}
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm border"
            style={{
              borderColor: "var(--color-primary, #6366f1)",
              color: "var(--color-primary, #6366f1)",
              borderRadius: "var(--radius, 8px)",
            }}
          >
            <GenericEditableText sectionId={sectionId} field="buttonText" value={String((content.buttonText as string | undefined) ?? "Všechny články →")} tag="span" />
          </Link>
        </div>
      </div>
    </section>
  );
}
