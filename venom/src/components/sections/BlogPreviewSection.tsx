"use client";

import { useEffect, useRef, useState } from "react";
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

  if (variant === "cafe-04-blog")      return <BlogCafe04 content={content} sectionId={sectionId} />;
  if (variant === "reality-02-blog")   return <BlogReality02 content={content} sectionId={sectionId} />;
  if (variant === "legal-02-blog")     return <BlogLegal02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} />;
  if (variant === "reality-03-blog")   return <BlogReality03 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-02-blog")    return <BlogUcetni02 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "ucetni-04-blog")    return <BlogUcetni04 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "arch-01-reels")     return <BlogArch01Reels content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "floors-01-blog")    return <BlogFloors01 content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;
  if (variant === "clean-02-blog")     return <BlogClean02  content={content} sectionId={sectionId} tenantSlug={tenantSlug} isAdmin={isAdmin} />;

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
    const eyebrow = String((c as Record<string, unknown>).eyebrow ?? "Magazín");
    const ctaLabel = String((c as Record<string, unknown>).ctaLabel ?? "Čti více");
    return (
      <section
        className="cafe01-blog relative overflow-hidden"
        data-template="cafe-01"
      >
        <div className="cafe01-blog__container">
          <div className="cafe01-blog__head">
            <div className="cafe01-blog__eyebrow">
              <span className="cafe01-blog__eyebrow-line" aria-hidden="true" />
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
              <span className="cafe01-blog__eyebrow-line" aria-hidden="true" />
            </div>
            <h2 className="cafe01-blog__title">
              <GenericEditableText sectionId={sectionId} field="title" value={c.title || "Co je nového"} tag="span" />
            </h2>
          </div>
          <div className="cafe01-blog__grid">
            {items.map((it, i) => (
              <article key={i} className="cafe01-blog__card">
                <div className="cafe01-blog__card-media">
                  {it.image && (
                    <GenericEditableImage
                      sectionId={sectionId}
                      field={`items.${i}.image`}
                      src={it.image}
                      alt={it.title}
                      className="absolute inset-0 w-full h-full"
                      style={{ width: "100%", height: "100%" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt={it.title} className="cafe01-blog__img" loading="lazy" />
                    </GenericEditableImage>
                  )}
                  <div className="cafe01-blog__overlay" aria-hidden="true" />
                  <div className="cafe01-blog__index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</div>
                </div>
                <div className="cafe01-blog__body">
                  {it.date && (
                    <div className="cafe01-blog__date">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M8 2v4M16 2v4M3 10h18" />
                      </svg>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={it.date} tag="span" />
                    </div>
                  )}
                  <h3 className="cafe01-blog__card-title">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={it.title} tag="span" />
                  </h3>
                  {it.excerpt && (
                    <p className="cafe01-blog__excerpt">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={it.excerpt} tag="span" />
                    </p>
                  )}
                  <a href={it.href ?? "#"} className="cafe01-blog__cta">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.ctaLabel`} value={ctaLabel} tag="span" />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="cafe01-blog__cta-arrow" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
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

// ── cafe-04-blog ───────────────────────────────────────────────────────────────
// Ref: coffeeroom.cz — "Behind the mugs, lifestyle stories"
// Header: subheadline-wrap deco lines (cc-separate-subheadline, mb 100px)
// Posts: .home-blog-item — border-left 2px #a25f4b33, flex row, date + title
// CTA: .view-all-articles-wrap centered underlined-link
// ─────────────────────────────────────────────────────────────────────────────
function BlogCafe04({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  type Post = { title: string; excerpt?: string; imageUrl?: string; date?: string; href?: string };
  const heading    = String(content.heading    ?? "Behind the mugs");
  const subheading = String(content.subheading ?? "lifestyle stories");
  const ctaText    = String(content.ctaText    ?? "Všechny příspěvky");
  const ctaHref    = String(content.ctaHref    ?? "#");
  const posts      = (content.posts as Post[] | undefined) ?? [];

  function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
  }

  return (
    <section style={{ backgroundColor: "#fff", fontFamily: "Montserrat, sans-serif" }}>
      <style>{`
        .cr04-blog-wrap { width: 70%; margin-left: auto; margin-right: auto; }
        .cr04-blog-header { text-align: center; justify-content: center; align-items: center; margin-bottom: 100px; display: flex; }
        .cr04-blog-deco { background-color: #ececed; width: 30px; height: 1px; display: inline-block; }
        .cr04-blog-label { opacity: 0.9; color: #b79570; letter-spacing: 2px; text-transform: uppercase; font-size: 12px; font-weight: 700; line-height: 18px; font-family: Montserrat, sans-serif; margin-left: 15px; margin-right: 15px; }
        .cr04-blog-list { margin-bottom: 100px; }
        .cr04-blog-item { color: #1d1f2eb3; border-left: 2px solid #a25f4b33; align-items: center; margin-bottom: 10px; padding-top: 8px; padding-bottom: 8px; padding-left: 20px; transition: color .4s, border .4s, background-color .4s; display: flex; gap: 24px; text-decoration: none; }
        .cr04-blog-item:hover { border-left-color: #a25f4b; color: #1d1f2e; background-color: #a25f4b0a; }
        .cr04-blog-date { font-family: Karla, sans-serif; font-size: 13px; font-weight: 400; color: #b79570; white-space: nowrap; flex-shrink: 0; }
        .cr04-blog-title { font-family: Montserrat, sans-serif; font-size: 16px; font-weight: 600; color: inherit; }
        .cr04-blog-excerpt { font-family: Karla, sans-serif; font-size: 14px; font-weight: 400; color: #6b6b6b; margin-top: 2px; }
        .cr04-view-all { justify-content: center; margin-bottom: 100px; display: flex; }
        .cr04-view-all a { border-bottom: 2px solid #a25f4b33; transition: color .4s, border-color .4s; display: inline-block; font-family: Montserrat, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; color: #1d1f2e; text-decoration: none; text-transform: uppercase; padding-bottom: 4px; }
        .cr04-view-all a:hover { color: #743f2f; border-bottom-color: #a25f4bb3; }
        @media (max-width: 828px) {
          .cr04-blog-wrap { width: 90%; }
          .cr04-blog-item { flex-direction: column; gap: 4px; align-items: flex-start; }
        }
      `}</style>
      <div className="cr04-blog-wrap">
        {/* Header */}
        <div className="cr04-blog-header">
          <div className="cr04-blog-deco" />
          <span className="cr04-blog-label">
            <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            {subheading && (
              <>, <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" /></>
            )}
          </span>
          <div className="cr04-blog-deco" />
        </div>

        {/* Posts */}
        <div className="cr04-blog-list">
          {posts.map((post, i) => (
            <a key={i} href={post.href ?? "#"} className="cr04-blog-item">
              {post.date && <span className="cr04-blog-date">{formatDate(post.date)}</span>}
              <div>
                <div className="cr04-blog-title">
                  <GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={post.title} tag="span" />
                </div>
                {post.excerpt && (
                  <div className="cr04-blog-excerpt">
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={post.excerpt} tag="span" />
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="cr04-view-all">
          <a href={ctaHref} data-btn="primary">
            <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
          </a>
        </div>
      </div>
    </section>
  );
}


// ── reality-03-blog ───────────────────────────────────────────────────────────
// 3 vysoké portrait karty — full-bleed fotky s tmavým overlayem
// Hover reveal: excerpt + CTA vyjede zdola, foto zoom, nadpis se posune nahoru
// Vstupní animace: karty přijedou zdola se staggerem, pozadí "BLOG" text dekorativní
// Heading: split-layout (H2 vlevo, popis vpravo) + velký ghost nápis "BLOG"
// ─────────────────────────────────────────────────────────────────────────────
function BlogReality03({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const items = (content.items as Array<{ title: string; image?: string; href?: string }>) ?? [];

  const DARK  = "#132538";
  const OCHRE = "#e38a6a";
  const WHITE = "#ffffff";
  const SANS  = "'Helvetica Neue', Helvetica, Arial, sans-serif";

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("#")) return href;
    if (href === "/") return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    return `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}${href}`;
  };

  return (
    <section
      ref={sectionRef}
      id="blog"
      style={{ position: "relative", backgroundColor: "#edeae4", fontFamily: SANS, padding: "clamp(64px, 9vw, 110px) clamp(20px, 4vw, 64px)", overflow: "hidden" }}
    >
      {/* Dekorativní ghost nápis */}
      <div aria-hidden style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "clamp(120px,22vw,320px)", fontWeight: 900, color: "rgba(19,37,56,0.045)", letterSpacing: "-0.06em", userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap", lineHeight: 1 }}>
        BLOG
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Heading — split layout */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "clamp(20px, 4vw, 48px)",
          marginBottom: "clamp(40px, 6vw, 68px)",
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)",
          transition: "opacity 0.65s ease, transform 0.65s ease",
        }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: OCHRE, letterSpacing: "4px", textTransform: "uppercase", margin: "0 0 12px" }}>Realitní rádce</p>
            <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, color: DARK, margin: 0, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Tipy, trendy<br/>a realitní novinky
            </h2>
          </div>
          <div style={{ maxWidth: 340, display: "flex", flexDirection: "column", gap: 20, paddingBottom: 4 }}>
            <p style={{ fontSize: 15, color: "#777", lineHeight: 1.7, margin: 0 }}>
              Vše, co potřebujete vědět o koupi, prodeji a pronájmu nemovitostí — v jednom místě.
            </p>
            <a
              href={resolve("#blog")}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: DARK, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", alignSelf: "flex-start", paddingBottom: 3, borderBottom: `2px solid ${OCHRE}`, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = OCHRE)}
              onMouseLeave={e => (e.currentTarget.style.color = DARK)}
            >
              Všechny články
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>

        {/* 3 portrait karty */}
        <div data-r03-blog-grid style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {items.slice(0, 3).map((item, i) => {
            const delay = `${i * 0.13}s`;
            return (
              <a
                key={`r03-blog-${i}`}
                href={resolve(item.href ?? "#blog")}
                className="r03-blog-card"
                style={{
                  display: "block",
                  position: "relative",
                  aspectRatio: "3/4",
                  overflow: "hidden",
                  borderRadius: 10,
                  textDecoration: "none",
                  cursor: "pointer",
                  opacity: visible ? 1 : 0,
                  animation: visible ? `r03BlogCardIn 0.7s cubic-bezier(0.22,1,0.36,1) ${delay} both` : "none",
                }}
              >
                {/* Fotka */}
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="r03-blog-img"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}

                {/* Overlay */}
                <div className="r03-blog-overlay" style={{ position: "absolute", inset: 0 }} />

                {/* Číslo */}
                <span className="r03-blog-num" style={{ position: "absolute", top: 22, left: 22, fontFamily: SANS, fontSize: 11, fontWeight: 800, color: OCHRE, letterSpacing: "3px" }}>
                  0{i + 1}
                </span>

                {/* Obsah dole */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(20px, 3vw, 30px)" }}>
                  <h3 className="r03-blog-title" style={{ fontFamily: SANS, fontSize: "clamp(1rem, 1.4vw, 1.2rem)", fontWeight: 700, color: WHITE, margin: 0, lineHeight: 1.38 }}>
                    {item.title}
                  </h3>
                  <p className="r03-blog-excerpt" style={{ fontFamily: SANS, fontSize: 13.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.62, margin: "12px 0 0" }}>
                    Přečtěte si náš pohled na téma realitního trhu a poradenství.
                  </p>
                  <span className="r03-blog-cta" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, fontFamily: SANS, fontSize: 11, fontWeight: 800, color: OCHRE, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Číst více
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes r03BlogCardIn {
          from { opacity: 0; transform: translateY(48px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }

        /* Foto zoom */
        .r03-blog-img {
          transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
          transform: scale(1);
        }
        .r03-blog-card:hover .r03-blog-img { transform: scale(1.09); }

        /* Overlay ztmavne */
        .r03-blog-overlay {
          background: linear-gradient(to top, rgba(8,16,28,0.90) 0%, rgba(8,16,28,0.45) 48%, rgba(8,16,28,0.10) 100%);
          transition: background 0.4s ease;
        }
        .r03-blog-card:hover .r03-blog-overlay {
          background: linear-gradient(to top, rgba(8,16,28,0.97) 0%, rgba(8,16,28,0.65) 55%, rgba(8,16,28,0.20) 100%);
        }

        /* Nadpis se posune nahoru */
        .r03-blog-title {
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .r03-blog-card:hover .r03-blog-title { transform: translateY(-12px); }

        /* Excerpt vyjede zdola */
        .r03-blog-excerpt {
          opacity: 0;
          transform: translateY(12px);
          max-height: 0;
          overflow: hidden;
          transition: opacity 0.35s ease 0.08s, transform 0.35s ease 0.08s, max-height 0.4s ease;
        }
        .r03-blog-card:hover .r03-blog-excerpt {
          opacity: 1;
          transform: none;
          max-height: 80px;
        }

        /* CTA vyjede zdola */
        .r03-blog-cta {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.3s ease 0.14s, transform 0.3s ease 0.14s;
        }
        .r03-blog-card:hover .r03-blog-cta {
          opacity: 1;
          transform: none;
        }

        /* Číslo se posune doprava */
        .r03-blog-num { transition: transform 0.3s ease, letter-spacing 0.3s ease; }
        .r03-blog-card:hover .r03-blog-num { transform: translateX(5px); letter-spacing: 5px; }

        /* Ochre box-shadow glow při hoveru */
        .r03-blog-card { transition: box-shadow 0.4s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
        .r03-blog-card:hover { box-shadow: 0 28px 64px rgba(0,0,0,0.35), 0 0 0 2px rgba(227,138,106,0.4); }

        @media (max-width: 900px) {
          [data-r03-blog-grid] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          [data-r03-blog-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

// ── reality-02-blog ─────────────────────────────────────────────────────────
// Bílé bg s teal zobáčkem nahoře; Montserrat; 3-col karty s fotkou (16:9),
// barevný category tag, H3 nadpis, krátký výtah, zelený "Přečíst →" link.
// Hover: karta se zvedne + shadow; foto se jemně přiblíží.
// ─────────────────────────────────────────────────────────────────────────────
function BlogReality02({ content, sectionId }: { content: Record<string, unknown>; sectionId: number }) {
  const c = content as { title?: string; tagline?: string; ctaText?: string; ctaHref?: string; posts?: Array<{ title: string; excerpt?: string; category?: string; image?: string; ctaText?: string; ctaHref?: string }> };
  const title   = c.title   ?? "Realitní rady a tipy";
  const ctaText = c.ctaText ?? "Všechny články";
  const ctaHref = c.ctaHref ?? "#blog";
  const posts   = c.posts   ?? [];

  const DARK  = "#05303a";
  const GREEN = "#3DCE78";
  const FONT  = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const TAG_COLORS = [
    { bg: "#e8f4ff", color: "#2563eb" },
    { bg: "#ecfdf5", color: "#059669" },
    { bg: "#f5f3ff", color: "#7c3aed" },
    { bg: "#fff7ed", color: "#d97706" },
  ];

  return (
    <section id="blog" style={{ backgroundColor: "#ffffff", fontFamily: FONT }}>
      <div style={{ width: 0, height: 0, borderLeft: "60px solid transparent", borderRight: "60px solid transparent", borderTop: "44px solid #ffffff", margin: "0 auto" }} />
      <style>{`
        .r02-blog-card { transition: transform 0.24s ease, box-shadow 0.24s ease; }
        .r02-blog-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(5,48,58,0.12); }
        .r02-blog-card:hover .r02-blog-img { transform: scale(1.06); }
        .r02-blog-img { transition: transform 0.5s ease; width: 100%; height: 100%; object-fit: cover; display: block; }
        .r02-blog-readmore { color: ${GREEN}; font-size: 13px; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; letter-spacing: 0.04em; }
        .r02-blog-readmore svg { transition: transform 0.2s; }
        .r02-blog-card:hover .r02-blog-readmore svg { transform: translateX(4px); }
        @media (max-width: 900px) { .r02-blog-grid { grid-template-columns: 1fr !important; } }
        @media (min-width: 601px) and (max-width: 900px) { .r02-blog-grid { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(40px,6vw,72px) clamp(16px,5vw,48px) clamp(56px,8vw,96px)" }}>
        <h2 style={{ fontSize: "clamp(22px,3vw,34px)", fontWeight: 700, color: DARK, marginBottom: "clamp(36px,5vw,56px)", textAlign: "center" }}>
          <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
        </h2>

        <div className="r02-blog-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
          {posts.map((post, i) => {
            const tag = TAG_COLORS[i % TAG_COLORS.length];
            return (
              <article key={`r02-blog-${i}`} className="r02-blog-card" style={{ background: "#fff", borderRadius: 14, border: "1px solid #e4eeed", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {/* Foto */}
                <div style={{ position: "relative", paddingTop: "56.25%", overflow: "hidden" }}>
                  {post.image && (
                    <GenericEditableImage sectionId={sectionId} field={`posts.${i}.image`} src={post.image} alt={post.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                      <img className="r02-blog-img" src={post.image} alt={post.title} loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </GenericEditableImage>
                  )}
                </div>
                {/* Obsah */}
                <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  {post.category && (
                    <span style={{ display: "inline-block", backgroundColor: tag.bg, color: tag.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 20, alignSelf: "flex-start" }}>
                      {post.category}
                    </span>
                  )}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.45 }}>
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={post.title} tag="span" />
                  </h3>
                  {post.excerpt && (
                    <p style={{ fontSize: 13.5, color: DARK, opacity: 0.72, lineHeight: 1.65, margin: 0 }}>
                      <GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={post.excerpt} tag="span" />
                    </p>
                  )}
                  <a href={post.ctaHref ?? "#blog"} data-btn="primary" className="r02-blog-readmore" style={{ marginTop: "auto", paddingTop: 8 }}>
                    {post.ctaText ?? "Přečíst článek"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "clamp(36px,5vw,56px)" }}>
          <a
            href={ctaHref}
            data-btn="primary"
            style={{ display: "inline-block", padding: "13px 40px", border: `2px solid ${GREEN}`, color: GREEN, fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", textDecoration: "none", borderRadius: 32, transition: "background 0.2s, color 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = GREEN; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = GREEN; }}
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}

function BlogLegal02({ content, sectionId, tenantSlug }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string }) {
  const c = content as Record<string, unknown>;

  const NAVY   = "#143171";
  const ORANGE = "#EB5C2E";
  const FONT_B = "'bw_gradualbold', 'Montserrat', 'Helvetica Neue', Arial, sans-serif";

  const title   = (c.title   as string) ?? "Vzděláváme laiky i odborníky, píšeme, přednášíme a školíme";
  const ctaText = (c.ctaText as string) ?? "Všechny novinky";
  const ctaHref = (c.ctaHref as string) ?? "/aktuality";

  type Post = { title: string; date: string; image: string; href: string; tag?: string };
  const posts: Post[] = Array.isArray(c.posts) ? (c.posts as Post[]) : [];

  const resolve = (href: string) => tenantSlug ? `/demo/${tenantSlug}${href}` : href;
  const CARD_COLORS = [ORANGE, NAVY, ORANGE];

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric" }); }
    catch { return d; }
  };

  return (
    <section data-variant="legal-02-blog" style={{ backgroundColor: "#fff", padding: "80px 0" }}>
      <style>{`
        @font-face { font-family:'bw_gradualbold'; src:url('/templates/legal-02/bwgradual-bold-webfont.woff2') format('woff2'); font-display:swap; }
        .l02b-card { display:flex; flex-direction:column; position:relative; overflow:hidden; }
        .l02b-link { position:absolute; inset:0; z-index:9; display:block; }
        .l02b-txt  { padding:35px 30px 40px; display:flex; flex-direction:column; flex:1; }
        .l02b-info { display:flex; gap:12px; margin-bottom:16px; font-family:'bw_gradualbold',sans-serif; font-size:13px; color:rgba(255,255,255,.75); }
        .l02b-h3   { font-family:'bw_gradualbold',sans-serif; font-size:22px; line-height:1.35; color:#fff; margin:0; }
        .l02b-cta  { display:inline-flex; align-items:center; gap:10px; border:2px solid #143171; border-radius:30px; color:#143171; padding:14px 40px; margin-top:48px; font-family:'bw_gradualbold','Montserrat',sans-serif; font-size:17px; text-decoration:none; transition:background .2s,color .2s; }
        .l02b-cta:hover { background:#143171; color:#fff; }
        @media (max-width:900px) { .l02b-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 80px" }}>
        <div style={{ maxWidth: 720, marginBottom: 48 }}>
          <h2 style={{ fontFamily: FONT_B, fontSize: 48, lineHeight: "56px", color: NAVY, margin: 0 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
          </h2>
        </div>

        <div className="l02b-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {posts.map((post, i) => (
            <div key={i} className="l02b-card">
              <a href={resolve(post.href)} className="l02b-link" aria-label={post.title} />
              <div style={{ position: "relative", width: "100%", paddingBottom: "54.28%", height: 0, overflow: "hidden" }}>
                <Image src={post.image} alt={post.title} fill style={{ objectFit: "cover" }} unoptimized />
              </div>
              <div className="l02b-txt" style={{ backgroundColor: CARD_COLORS[i % 2] }}>
                <div className="l02b-info">
                  {post.tag && <span>{post.tag}</span>}
                  <span>{formatDate(post.date)}</span>
                </div>
                <h3 className="l02b-h3">{post.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <a href={resolve(ctaHref)} data-btn="primary" className="l02b-cta">
          {ctaText}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </section>
  );
}

// ── ucetni-02-blog ────────────────────────────────────────────────────────────
// grantex.cz style: white bg, 3-col cards
// Card: white, border 1px #e8eeec, gold category badge, H3, excerpt, date, arrow link
// ─────────────────────────────────────────────────────────────────────────────
function BlogUcetni02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const GREEN  = "#004835";
  const GOLD   = "#bca160";
  const FONT_H = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";
  const FONT_B = "'Open Sans', Arial, sans-serif";

  const title   = String(content.title   ?? "Aktuality");
  const lead    = String(content.lead    ?? "Pravidelný přísun novinek ze světa dotací, daní a účetnictví.");
  const ctaText = String(content.ctaText ?? "Všechny články");
  const ctaHref = String(content.ctaHref ?? "#blog");
  const items   = (content.items as Array<{ title: string; excerpt?: string; date?: string; category?: string; imageUrl?: string; href?: string }>) ?? [];

  const resolveHref = (href: string) => {
    if (!tenantSlug) return href;
    if (href.startsWith("#") || href.startsWith("http")) return href;
    return `/${isAdmin ? "admin/" : ""}${tenantSlug}${href.startsWith("/") ? href : "/" + href}`;
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <>
      <style>{`
        .ucn02blog-section {
          background: #f4f7f5;
          padding: 80px 24px;
          font-family: ${FONT_B};
        }
        .ucn02blog-inner { max-width: 1200px; margin: 0 auto; }
        .ucn02blog-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .ucn02blog-heading-group {}
        .ucn02blog-overline {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_H};
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: ${GOLD};
          margin-bottom: 12px;
        }
        .ucn02blog-overline-bar {
          display: inline-block; width: 28px; height: 2px; background: ${GOLD};
        }
        .ucn02blog-h2 {
          font-family: ${FONT_H};
          font-size: clamp(1.6rem, 2.5vw, 2.2rem);
          font-weight: 700;
          color: ${GREEN};
          margin: 0 0 6px 0;
          line-height: 1.2;
        }
        .ucn02blog-lead {
          font-size: 0.95rem;
          color: #5a6b66;
          margin: 0;
          line-height: 1.6;
        }
        .ucn02blog-cta-top {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 2px solid ${GREEN};
          color: ${GREEN};
          font-family: ${FONT_H};
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 4px;
          white-space: nowrap;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }
        .ucn02blog-cta-top:hover { background: ${GREEN}; color: #fff; }
        .ucn02blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ucn02blog-card {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #dde8e4;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ucn02blog-card:hover {
          box-shadow: 0 8px 28px rgba(0,72,53,0.12);
          transform: translateY(-2px);
        }
        .ucn02blog-card-img {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          display: block;
        }
        .ucn02blog-card-img-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #d8e8e3 0%, #b8d4cc 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ucn02blog-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 12px;
        }
        .ucn02blog-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .ucn02blog-category {
          display: inline-block;
          padding: 3px 10px;
          background: rgba(188,161,96,0.12);
          color: ${GOLD};
          font-family: ${FONT_H};
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          border-radius: 20px;
          border: 1px solid rgba(188,161,96,0.3);
        }
        .ucn02blog-date {
          font-size: 0.78rem;
          color: #8a9e99;
          font-family: ${FONT_H};
        }
        .ucn02blog-card-title {
          font-family: ${FONT_H};
          font-size: 1rem;
          font-weight: 700;
          color: ${GREEN};
          margin: 0;
          line-height: 1.4;
        }
        .ucn02blog-card-excerpt {
          font-size: 0.875rem;
          color: #5a6b66;
          line-height: 1.65;
          margin: 0;
          flex: 1;
        }
        .ucn02blog-card-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: ${FONT_H};
          font-size: 0.8rem;
          font-weight: 600;
          color: ${GOLD};
          text-decoration: none;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: color 0.2s;
          margin-top: auto;
        }
        .ucn02blog-card-link:hover { color: ${GREEN}; }
        @media (max-width: 900px) {
          .ucn02blog-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .ucn02blog-section { padding: 56px 16px; }
          .ucn02blog-grid { grid-template-columns: 1fr; }
          .ucn02blog-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <section id="blog" className="ucn02blog-section" data-template="ucetni-02-blog">
        <div className="ucn02blog-inner">
          <div className="ucn02blog-header">
            <div className="ucn02blog-heading-group">
              <div className="ucn02blog-overline">
                <span className="ucn02blog-overline-bar" aria-hidden />
                Novinky &amp; aktuality
              </div>
              <h2 className="ucn02blog-h2">
                <GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" />
              </h2>
              <p className="ucn02blog-lead">
                <GenericEditableText sectionId={sectionId} field="lead" value={lead} tag="span" />
              </p>
            </div>
            <a href={resolveHref(ctaHref)} data-btn="primary" className="ucn02blog-cta-top">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

          <div className="ucn02blog-grid">
            {items.map((item, i) => (
              <article key={i} className="ucn02blog-card">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="ucn02blog-card-img" loading="lazy" />
                ) : (
                  <div className="ucn02blog-card-img-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.2" opacity="0.4" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                )}
                <div className="ucn02blog-card-body">
                  <div className="ucn02blog-card-meta">
                    {item.category && (
                      <span className="ucn02blog-category">
                        <GenericEditableText sectionId={sectionId} field={`items.${i}.category`} value={String(item.category)} tag="span" />
                      </span>
                    )}
                    {item.date && <span className="ucn02blog-date">{formatDate(item.date)}</span>}
                  </div>
                  <h3 className="ucn02blog-card-title">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(item.title ?? "")} tag="span" />
                  </h3>
                  {item.excerpt && (
                    <p className="ucn02blog-card-excerpt">
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={String(item.excerpt ?? "")} tag="span" />
                    </p>
                  )}
                  <a href={resolveHref(item.href ?? "#")} className="ucn02blog-card-link">
                    Číst více
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── arch-01-reels ─────────────────────────────────────────────────────────────
// 1:1 karesarch.cz reels sekce:
// - tmavé/černé pozadí
// - heading "Reels" vlevo s šipkou vpravo (news-arrow ikona)
// - 4-sloupcový scroll: čtvercové obrázky (1:1), titulek, datum, krátký excerpt
// - "Další reels" CTA šipka vpravo dole
// ─────────────────────────────────────────────────────────────────────────────
function BlogArch01Reels({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  type Post = { title?: string; date?: string; excerpt?: string; imageUrl?: string; href?: string };
  const c       = content as Record<string, unknown>;
  const posts   = (c.posts as Post[]) ?? [];
  const heading = String(c.heading  ?? "Reels");
  const ctaText = String(c.ctaText  ?? "Další reels");
  const ctaHref = String(c.ctaHref  ?? "/realizace");

  const FONT  = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const WHITE = "#ffffff";
  const BG    = "#111111";

  const resolvedCta = tenantSlug
    ? `/demo/${tenantSlug}/${ctaHref.replace(/^\//, "")}`
    : ctaHref;

  const NewsArrow = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 12" width="30" height="12" aria-hidden="true">
      <path fill={WHITE} d="M24,0l6,6l-6,6V7.5H0v-3h24V0z"/>
    </svg>
  );

  const styles = `
    .a01reels {
      background: ${BG};
      padding: 72px 0 64px;
    }
    .a01reels-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 clamp(24px, 5vw, 80px);
    }
    .a01reels-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
    }
    .a01reels-heading {
      font-family: ${FONT};
      font-size: clamp(22px, 2.5vw, 32px);
      font-weight: 400;
      color: ${WHITE};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .a01reels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .a01reels-card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: ${WHITE};
    }
    .a01reels-img-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      background: #222;
      margin-bottom: 14px;
    }
    .a01reels-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      transition: transform 0.4s ease;
    }
    .a01reels-card:hover .a01reels-img { transform: scale(1.04); }
    .a01reels-date {
      font-family: ${FONT};
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.45);
      margin: 0 0 8px;
    }
    .a01reels-title {
      font-family: ${FONT};
      font-size: clamp(14px, 1.3vw, 17px);
      font-weight: 400;
      color: ${WHITE};
      margin: 0 0 10px;
      line-height: 1.35;
    }
    .a01reels-excerpt {
      font-family: ${FONT};
      font-size: 13px;
      font-weight: 300;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .a01reels-cta-wrap {
      margin-top: 40px;
      display: flex;
      align-items: center;
    }
    .a01reels-cta {
      display: flex;
      align-items: center;
      gap: 14px;
      font-family: ${FONT};
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${WHITE};
      text-decoration: none;
      opacity: 0.7;
      transition: opacity 0.2s;
    }
    .a01reels-cta:hover { opacity: 1; }
    @media (max-width: 991px) {
      .a01reels-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 640px) {
      .a01reels-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    }
    @media (max-width: 400px) {
      .a01reels-grid { grid-template-columns: 1fr; }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <section className="a01reels" data-template="arch-01-reels">
        <div className="a01reels-inner">
          <div className="a01reels-header">
            <h2 className="a01reels-heading">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
              <NewsArrow />
            </h2>
          </div>

          <div className="a01reels-grid">
            {posts.map((post, i) => {
              const href = post.href
                ? (tenantSlug ? `/demo/${tenantSlug}/${post.href.replace(/^\//, "")}` : post.href)
                : resolvedCta;
              return (
                <a key={i} href={href} className="a01reels-card">
                  <div className="a01reels-img-wrap">
                    <GenericEditableImage
                      sectionId={sectionId}
                      field={`posts.${i}.imageUrl`}
                      src={post.imageUrl ?? ""}
                      alt={post.title ?? `Reel ${i + 1}`}
                      style={{ width: "100%", height: "100%", display: "block" }}
                    >
                      <img src={post.imageUrl} alt={post.title ?? `Reel ${i + 1}`} loading="lazy" className="a01reels-img" />
                    </GenericEditableImage>
                  </div>
                  {post.date && (
                    <p className="a01reels-date">
                      <GenericEditableText sectionId={sectionId} field={`posts.${i}.date`} value={post.date} tag="span" />
                    </p>
                  )}
                  <h3 className="a01reels-title">
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={post.title ?? ""} tag="span" />
                  </h3>
                  {post.excerpt && (
                    <p className="a01reels-excerpt">
                      <GenericEditableText sectionId={sectionId} field={`posts.${i}.excerpt`} value={post.excerpt} tag="span" />
                    </p>
                  )}
                </a>
              );
            })}
          </div>

          <div className="a01reels-cta-wrap">
            <a href={resolvedCta} className="a01reels-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
              <NewsArrow />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── ucetni-04-blog ────────────────────────────────────────────────────────────
// 1:1 bcas.cz articles section:
// - bg white, sectionHeader center (eyebrow + H2 + perex)
// - articleList: grid 3 col, gap 3em 8px
// - article: foto nahoře (aspect-ratio 16/9, overflow hidden, scale hover) +
//   H3 nadpis (1em, font-weight 600, margin 1.5em 0 8px) +
//   type badge (0.875rem, primColor = navy)
// - CTA odkaz na vzdělávání
// - fade-in stagger při vstupu
// ─────────────────────────────────────────────────────────────────────────────
function BlogUcetni04({ content, sectionId, tenantSlug, isAdmin }: {
  content: Record<string, unknown>;
  sectionId: number;
  tenantSlug?: string;
  isAdmin?: boolean;
}) {
  const BG   = "#ffffff";
  const NAVY = "#003366";
  const DARK = "#171F22";
  const FONT = "'Plus Jakarta Sans', Arial, 'Helvetica Neue', sans-serif";

  const eyebrow   = String(content.eyebrow   ?? "Od nás pro vás");
  const heading   = String(content.heading   ?? "Vědět víc znamená rozhodovat líp");
  const subheading = String(content.subheading ?? "Péče o finance a reality není jednorázová záležitost. Naše praktické průvodce, články a videa vám pomáhají být vždy krok napřed.");
  const ctaText   = String(content.ctaText   ?? "Vzdělávání");
  const ctaHref   = String(content.ctaHref   ?? "/");
  const rawItems  = Array.isArray(content.items) ? content.items as Array<{ type?: string; typeColor?: string; title?: string; excerpt?: string; href?: string; imageUrl?: string }> : [];
  const items     = rawItems.length > 0 ? rawItems : [
    { type: "Článek",     typeColor: NAVY,      title: "7 zlatých pravidel finančního plánování",           excerpt: "Jak si nastavit finanční plán, který skutečně funguje a pomáhá dosáhnout vašich cílů.", href: "/", imageUrl: "/templates/ucetni-04/blog/a1.webp" },
    { type: "Video",      typeColor: "#E52713",  title: "Zajímá vás, jak život ovlivňuje finanční plán?",   excerpt: "Sledujte naše video a zjistěte, jak správně plánovat finance v různých životních etapách.", href: "/", imageUrl: "/templates/ucetni-04/blog/a2.webp" },
    { type: "Průvodce",   typeColor: "#C8923A",  title: "Dlouhodobý investiční produkt – kompletní průvodce", excerpt: "Vše, co potřebujete vědět o státem podporovaném spoření a jak ho nejlépe využít.",       href: "/", imageUrl: "/templates/ucetni-04/blog/a3.jpg" },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const resolve = (href: string) => {
    if (href.startsWith("http") || href.startsWith("#")) return href;
    if (tenantSlug) return isAdmin ? `/demo/${tenantSlug}${href}/admin` : `/demo/${tenantSlug}${href}`;
    return href;
  };

  return (
    <>
      <style>{`
        .ucn04blog { background: ${BG}; font-family: ${FONT}; }
        .ucn04blog-inner {
          max-width: 1296px;
          margin: 0 auto;
          padding: 0 24px clamp(56px,6vw,80px);
        }
        .ucn04blog-hdr {
          text-align: center;
          margin: 0 auto;
          padding: clamp(56px,8vw,100px) 0 clamp(36px,5vw,56px);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          max-width: 43.75em;
        }
        .ucn04blog-eyebrow {
          font-size: 12px;
          font-weight: 600;
          color: ${NAVY};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0;
        }
        .ucn04blog-h2 {
          font-size: clamp(22px,2.8vw,34px);
          font-weight: 700;
          color: ${DARK};
          letter-spacing: -0.025em;
          margin: 0;
          line-height: 1.2;
        }
        .ucn04blog-sub {
          font-size: 15px;
          color: #486A72;
          line-height: 1.6;
          margin: 0;
        }
        /* Article grid */
        .ucn04blog-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5em 8px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ucn04blog-item {
          display: grid;
          grid-template-rows: auto auto auto auto;
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ucn04blog-item.ucn04blog-vis { opacity: 1; transform: translateY(0); }
        .ucn04blog-img-wrap {
          overflow: hidden;
          position: relative;
          aspect-ratio: 16 / 9;
          border-radius: 2px;
        }
        .ucn04blog-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transform: scale(1);
          transition: transform 0.35s ease-out;
        }
        .ucn04blog-item:hover .ucn04blog-img { transform: scale(1.04); }
        .ucn04blog-title {
          margin: 1.25em 0 8px;
          font-size: 1em;
          font-weight: 600;
          color: ${DARK};
          line-height: 1.4;
        }
        .ucn04blog-title a { color: inherit; text-decoration: none; }
        .ucn04blog-title a:hover { color: ${NAVY}; }
        .ucn04blog-excerpt {
          font-size: 0.875rem;
          color: #6B7280;
          line-height: 1.6;
          margin: 0 0 10px;
        }
        .ucn04blog-type {
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.025em;
        }
        /* CTA row */
        .ucn04blog-cta-row {
          display: flex;
          justify-content: center;
          padding-top: clamp(32px,4vw,48px);
        }
        .ucn04blog-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: ${NAVY};
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: ${FONT};
          border-radius: 2px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .ucn04blog-cta:hover { background: #002244; }
        @media (max-width: 768px) {
          .ucn04blog-list { grid-template-columns: 1fr; gap: 2em; }
        }
      `}</style>
      <section ref={sectionRef} className="ucn04blog" data-template="ucetni-04-blog">
        <div className="ucn04blog-inner">
          <div className="ucn04blog-hdr">
            <p className="ucn04blog-eyebrow">
              <GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" />
            </p>
            <h2 className="ucn04blog-h2">
              <GenericEditableText sectionId={sectionId} field="heading" value={heading} tag="span" />
            </h2>
            <p className="ucn04blog-sub">
              <GenericEditableText sectionId={sectionId} field="subheading" value={subheading} tag="span" />
            </p>
          </div>
          <ul className="ucn04blog-list">
            {items.map((item, i) => {
              const imgSrc = String(item.imageUrl ?? `/templates/ucetni-04/blog/a${(i % 3) + 1}.webp`);
              const typeColor = String(item.typeColor ?? NAVY);
              return (
                <li
                  key={i}
                  className={`ucn04blog-item${visible ? " ucn04blog-vis" : ""}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="ucn04blog-img-wrap">
                    <GenericEditableImage sectionId={sectionId} field={`items.${i}.imageUrl`} src={imgSrc} alt="" style={{ display: "block", width: "100%", height: "100%" }}>
                      <a href={resolve(String(item.href ?? "/"))}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgSrc} alt="" loading="lazy" className="ucn04blog-img" />
                      </a>
                    </GenericEditableImage>
                  </div>
                  <h3 className="ucn04blog-title">
                    <a href={resolve(String(item.href ?? "/"))}>
                      <GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={String(item.title ?? "")} tag="span" />
                    </a>
                  </h3>
                  <p className="ucn04blog-excerpt">
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.excerpt`} value={String(item.excerpt ?? "")} tag="span" />
                  </p>
                  <a href={resolve(String(item.href ?? "/"))} className="ucn04blog-type" style={{ color: typeColor }}>
                    <GenericEditableText sectionId={sectionId} field={`items.${i}.type`} value={String(item.type ?? "")} tag="span" />
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="ucn04blog-cta-row">
            <a href={resolve(ctaHref)} data-btn="primary" className="ucn04blog-cta">
              <GenericEditableText sectionId={sectionId} field="ctaText" value={ctaText} tag="span" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// ── floors-01-blog ────────────────────────────────────────────────────────────
// 3-sloupcový blog preview + "Další aktuality" odkaz
// ─────────────────────────────────────────────────────────────────────────────
function BlogFloors01({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin?: boolean }) {
  const GREEN  = "#007d47";
  const DARK   = "#212529";
  const BORDER = "#e9ecef";
  const FONT   = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

  const title        = String(content.title        ?? "Aktuality");
  const moreLinkText = String(content.moreLinkText ?? "Další aktuality");
  const moreLinkHref = String(content.moreLinkHref ?? "/sluzby");

  type Post = { image: string; tag: string; title: string; href: string };
  const posts = (content.posts as Post[]) ?? [
    { image: "/clones/supellex/user/www-supellex-cz/blog/skladweb-1000x500.jpg",                     tag: "Novinka", title: "Otevřeli jsme nový showroom podlah v Praze",                 href: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/blog/pxl-20260225-120606422-10.jpg",             tag: "Novinka", title: "Kompletní portfolio vinylových a hybridních podlah",         href: "/sluzby" },
    { image: "/clones/supellex/user/www-supellex-cz/blog/coretec-tytan-odolnost-bez-kompromisu.jpg", tag: "Novinka", title: "Nové odolné podlahy 100 % bez PVC — ta pravá pro váš domov", href: "/sluzby" },
  ];

  const resolve = (href: string) => {
    if (!tenantSlug) return href;
    const base = `/demo/${tenantSlug}${isAdmin ? "/admin" : ""}`;
    if (href.startsWith("http") || href.startsWith("#")) return href;
    return `${base}${href.startsWith("/") ? href : "/" + href}`;
  };

  return (
    <>
      <style>{`
        .f01bl-card { border: 1px solid ${BORDER}; border-radius: 8px; overflow: hidden; background: #fff; transition: box-shadow 0.2s, transform 0.2s; display: flex; flex-direction: column; }
        .f01bl-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10); transform: translateY(-3px); }
        .f01bl-img-wrap { overflow: hidden; }
        .f01bl-card img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform 0.4s; }
        .f01bl-card:hover img { transform: scale(1.04); }
        @media (max-width: 768px) { .f01bl-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 1024px) and (min-width: 769px) { .f01bl-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
      <section style={{ padding: "64px 20px", background: "#f8f9fa", fontFamily: FONT }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
            <GenericEditableText sectionId={sectionId} field="title" value={title} tag="h2" style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: 0, letterSpacing: "-0.01em" }}>
              {title}
            </GenericEditableText>
            <a href={resolve(moreLinkHref)} style={{ fontSize: 13, fontWeight: 700, color: GREEN, textDecoration: "none", borderBottom: `2px solid ${GREEN}`, paddingBottom: 2 }}>
              {moreLinkText} →
            </a>
          </div>
          <div className="f01bl-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {posts.map((post, i) => (
              <a key={i} href={resolve(post.href)} className="f01bl-card" style={{ textDecoration: "none" }}>
                <div className="f01bl-img-wrap">
                  <GenericEditableImage sectionId={sectionId} field={`posts.${i}.image`} src={post.image} alt={post.title}>
                    <img src={post.image} alt={post.title} loading="lazy" />
                  </GenericEditableImage>
                </div>
                <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ display: "inline-block", padding: "3px 10px", background: GREEN, color: "#fff", borderRadius: 3, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.tag`} value={post.tag} tag="span">{post.tag}</GenericEditableText>
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.45 }}>
                    <GenericEditableText sectionId={sectionId} field={`posts.${i}.title`} value={post.title} tag="span">{post.title}</GenericEditableText>
                  </p>
                  <span style={{ marginTop: "auto", fontSize: 13, color: GREEN, fontWeight: 600 }}>Číst více →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

// ── clean-02-blog ─────────────────────────────────────────────────────────────
function BlogClean02({ content, sectionId, tenantSlug, isAdmin }: { content: Record<string, unknown>; sectionId: number; tenantSlug?: string; isAdmin: boolean }) {
  const eyebrow = String(content.eyebrow ?? "Média a publikace");
  const title   = String(content.title ?? "Napsali o nás");
  const items   = (content.items as Array<{ date?: string; title?: string; href?: string; image?: string; source?: string; imageType?: string }>) ?? [];
  const NAVY = "#0e0e53"; const BLUE = "#019dff"; const GRAY = "#6b77a4";
  const resolve = (href: string) => {
    if (!tenantSlug || href.startsWith("http") || href.startsWith("#")) return href;
    const base = isAdmin ? `/demo/${tenantSlug}/admin` : `/demo/${tenantSlug}`;
    return href === "/" ? base : `${base}${href}`;
  };
  return (
    <>
      <style>{`
        .c02bl-section { background: #f3f9ff; padding: 5rem 5%; font-family: 'Onest',sans-serif; }
        .c02bl-inner { max-width: 80rem; margin: 0 auto; }
        .c02bl-header { display: flex; flex-direction: column; align-items: center; text-align: center; margin-bottom: 3rem; }
        .c02bl-kicker { display: inline-flex; align-items: center; gap: .45rem; font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: ${BLUE}; margin-bottom: .75rem; }
        .c02bl-kicker::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${BLUE}; }
        .c02bl-h2 { font-family: 'Bricolage Grotesque',sans-serif; font-size: clamp(1.65rem,3.2vw,2.5rem); font-weight: 800; color: ${NAVY}; margin: 0; line-height: 1.2; }
        .c02bl-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.75rem; }
        .c02bl-card { background: #fff; border: 1px solid #dfecff; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; transition: box-shadow .25s, transform .25s; }
        .c02bl-card:hover { box-shadow: 0 12px 40px -10px rgba(1,157,255,.18); transform: translateY(-3px); }
        .c02bl-img-logo { width: 100%; aspect-ratio: 16/7; background: #eef6ff; display: flex; align-items: center; justify-content: center; padding: 1.5rem 2rem; border-bottom: 1px solid #dfecff; overflow: hidden; }
        .c02bl-img-logo img { max-width: 100%; max-height: 80px; object-fit: contain; filter: grayscale(30%); }
        .c02bl-img-photo { width: 100%; aspect-ratio: 16/9; border-bottom: 1px solid #dfecff; overflow: hidden; }
        .c02bl-img-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; }
        .c02bl-body { padding: 1.5rem; display: flex; flex-direction: column; gap: .9rem; flex: 1; }
        .c02bl-meta { display: flex; align-items: center; gap: .45rem; }
        .c02bl-meta svg { width: 14px; height: 14px; flex-shrink: 0; color: ${BLUE}; }
        .c02bl-date { font-size: .75rem; font-weight: 500; color: ${GRAY}; }
        .c02bl-title { font-family: 'Bricolage Grotesque',sans-serif; font-size: 1rem; font-weight: 700; color: ${NAVY}; margin: 0; line-height: 1.5; flex: 1; }
        .c02bl-link { display: inline-flex; align-items: center; gap: .35rem; font-size: .85rem; font-weight: 700; color: ${BLUE}; margin-top: auto; transition: gap .2s; }
        .c02bl-link:hover { gap: .6rem; }
        .c02bl-link svg { width: 14px; height: 14px; }
        @media(max-width:900px) { .c02bl-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:550px) { .c02bl-grid { grid-template-columns: 1fr; } }
      `}</style>
      <section className="c02bl-section" id="blog" data-template="clean-02-blog">
        <div className="c02bl-inner">
          <div className="c02bl-header">
            <p className="c02bl-kicker"><GenericEditableText sectionId={sectionId} field="eyebrow" value={eyebrow} tag="span" /></p>
            <h2 className="c02bl-h2"><GenericEditableText sectionId={sectionId} field="title" value={title} tag="span" /></h2>
          </div>
          <div className="c02bl-grid">
            {items.map((item, i) => (
              <a key={i} href={resolve(item.href ?? "#blog")} className="c02bl-card">
                {item.imageType === "photo" ? (
                  <div className="c02bl-img-photo">
                    <img src={item.image} alt={item.source ?? "publikace"} loading="lazy" />
                  </div>
                ) : (
                  <div className="c02bl-img-logo">
                    {item.image ? (
                      <img src={item.image} alt={item.source ?? "publikace"} loading="lazy" />
                    ) : (
                      <span style={{fontSize:"1.5rem",fontWeight:800,color:BLUE,fontFamily:"'Bricolage Grotesque',sans-serif"}}>{item.source ?? "?"}</span>
                    )}
                  </div>
                )}
                <div className="c02bl-body">
                  <div className="c02bl-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span className="c02bl-date"><GenericEditableText sectionId={sectionId} field={`items.${i}.date`} value={item.date ?? ""} tag="span" /></span>
                  </div>
                  <p className="c02bl-title"><GenericEditableText sectionId={sectionId} field={`items.${i}.title`} value={item.title ?? ""} tag="span" /></p>
                  <span className="c02bl-link">
                    Přečíst článek
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
