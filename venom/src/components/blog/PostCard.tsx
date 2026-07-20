import Link from "next/link";
import Image from "next/image";
import type { BlogPostCard } from "@/lib/blog/queries";
import type { BlogSkin } from "@/lib/blog/theme";

interface Props {
  post: BlogPostCard;
  base: string;
  skin: BlogSkin;
  /** Larger typography for the lead card in magazine layouts */
  size?: "default" | "large";
}

export function formatDate(date: string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("cs-CZ", { year: "numeric", month: "long", day: "numeric" });
}

export function PostCard({ post, base, skin, size = "default" }: Props) {
  const href = `${base}/blog/${post.slug}`;
  const large = size === "large";

  return (
    <article className="group h-full">
      <Link href={href} className="flex flex-col h-full">
        <div
          className="relative overflow-hidden mb-4"
          style={{
            aspectRatio: large ? "16/10" : "3/2",
            borderRadius: "var(--blog-radius-lg)",
            backgroundColor: "var(--blog-surface)",
          }}
        >
          {post.featured_image ? (
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              sizes={large ? "(max-width: 768px) 100vw, 640px" : "(max-width: 768px) 100vw, 400px"}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center text-4xl font-bold opacity-20"
              style={{ color: "var(--blog-primary)", fontFamily: "var(--blog-font-heading)" }}
            >
              {post.title.charAt(0).toUpperCase()}
            </div>
          )}
          {post.category && (
            <span
              className="absolute top-3 left-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-sm"
              style={{
                backgroundColor: skin === "magazine" ? "var(--blog-primary)" : "rgba(0,0,0,.55)",
                color: skin === "magazine" ? "var(--blog-on-primary)" : "#fff",
                borderRadius: "var(--blog-radius-md)",
              }}
            >
              {post.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs mb-2" style={{ color: "var(--blog-muted)" }}>
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
          {post.reading_time_min ? (
            <>
              <span aria-hidden>·</span>
              <span>{post.reading_time_min} min čtení</span>
            </>
          ) : null}
        </div>

        <h3
          className={`font-bold leading-snug mb-2 transition-colors duration-200 group-hover:[color:var(--blog-primary)] ${
            large ? "text-xl md:text-2xl" : "text-base md:text-lg"
          }`}
          style={{ fontFamily: "var(--blog-font-heading)", color: "var(--blog-text)" }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className={`text-sm leading-relaxed ${large ? "line-clamp-3" : "line-clamp-2"}`}
            style={{ color: "var(--blog-muted)" }}
          >
            {post.excerpt}
          </p>
        )}

        <span
          className="mt-auto pt-3 inline-flex items-center gap-1 text-sm font-semibold transition-all duration-200 group-hover:gap-2"
          style={{ color: "var(--blog-primary)" }}
        >
          Číst článek <span aria-hidden>→</span>
        </span>
      </Link>
    </article>
  );
}
