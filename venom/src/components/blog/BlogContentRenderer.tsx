import Image from "next/image";
import { sanitizeRichHtml, stripHtml } from "@/lib/sanitize-content";
import { headingId, videoEmbedUrl, type BlogBlock } from "@/lib/blog/content";
import type { BlogSkin } from "@/lib/blog/theme";
import { ClickableImage } from "./ClickableImage";

interface Props {
  blocks: BlogBlock[];
  skin: BlogSkin;
}

/**
 * Server-side renderer of blog content blocks. All free-text strings pass
 * through sanitizeRichHtml before dangerouslySetInnerHTML (defense in depth —
 * they are already sanitized on write).
 */
export function BlogContentRenderer({ blocks, skin }: Props) {
  const firstTextIndex = blocks.findIndex((block) => {
    const b: BlogBlock = typeof block === "string" ? { type: "text", text: block } : block;
    return (b.type === "text" || !b.type) && Boolean(b.text?.trim());
  });

  return (
    <>
      {blocks.map((block, i) => {
        const b: BlogBlock = typeof block === "string" ? { type: "text", text: block } : block;

        switch (b.type) {
          case "heading": {
            const id = headingId(b.text ?? "", i);
            const Tag = b.level === 3 ? "h3" : "h2";
            return (
              <Tag
                key={i}
                id={id}
                className={`scroll-mt-24 font-bold leading-tight ${
                  b.level === 3 ? "text-lg md:text-xl mt-8 mb-3" : "text-xl md:text-2xl mt-12 mb-4"
                }`}
                style={{ fontFamily: "var(--blog-font-heading)" }}
              >
                {stripHtml(b.text ?? "")}
              </Tag>
            );
          }

          case "quote":
            return (
              <figure key={i} className="my-10">
                <blockquote
                  className={`relative text-lg md:text-xl leading-relaxed italic ${
                    skin === "magazine" ? "text-center px-4 md:px-10" : "pl-6"
                  }`}
                  style={
                    skin === "magazine"
                      ? { color: "var(--blog-text)" }
                      : { borderLeft: "3px solid var(--blog-primary)", color: "var(--blog-text)" }
                  }
                >
                  {skin === "magazine" && (
                    <span
                      aria-hidden
                      className="block text-5xl leading-none mb-2 font-serif"
                      style={{ color: "var(--blog-primary)" }}
                    >
                      &ldquo;
                    </span>
                  )}
                  <span dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(b.text ?? "") }} />
                </blockquote>
                {b.cite && (
                  <figcaption
                    className={`mt-3 text-sm font-medium ${skin === "magazine" ? "text-center" : "pl-6"}`}
                    style={{ color: "var(--blog-muted)" }}
                  >
                    — {stripHtml(b.cite)}
                  </figcaption>
                )}
              </figure>
            );

          case "image":
            if (!b.url) return null;
            return (
              <figure key={i} className="my-10 -mx-2 md:-mx-8">
                <ClickableImage
                  images={[{ url: b.url, alt: b.alt, caption: b.caption }]}
                  index={0}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "16/9", borderRadius: "var(--blog-radius-lg)" }}
                  >
                    <Image
                      src={b.url}
                      alt={b.alt ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  </div>
                </ClickableImage>
                {(b.caption || b.alt) && (
                  <figcaption className="text-xs text-center mt-3" style={{ color: "var(--blog-muted)" }}>
                    {stripHtml(b.caption || b.alt || "")}
                  </figcaption>
                )}
              </figure>
            );

          case "gallery": {
            const galleryImages = (b.images ?? []).filter((img) => img?.url);
            if (!galleryImages.length) return null;
            const lightboxImages = galleryImages.map((img) => ({ url: img.url, alt: img.alt }));
            return (
              <div
                key={i}
                className={`my-10 grid gap-3 ${galleryImages.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}
              >
                {galleryImages.map((img, j) => (
                  <ClickableImage key={j} images={lightboxImages} index={j}>
                    <div
                      className="relative overflow-hidden group"
                      style={{ aspectRatio: "1/1", borderRadius: "var(--blog-radius-md)" }}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? ""}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 260px"
                      />
                    </div>
                  </ClickableImage>
                ))}
              </div>
            );
          }

          case "list": {
            const items = Array.isArray(b.items) ? b.items : [];
            const ListTag = b.ordered ? "ol" : "ul";
            return (
              <ListTag
                key={i}
                className={`mb-6 pl-6 space-y-2 ${b.ordered ? "list-decimal" : "list-none"}`}
              >
                {items.map((item, j) => (
                  <li key={j} className="leading-relaxed relative">
                    {!b.ordered && (
                      <span
                        aria-hidden
                        className="absolute -left-5 top-[0.55em] w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--blog-primary)" }}
                      />
                    )}
                    <span dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(item) }} />
                  </li>
                ))}
              </ListTag>
            );
          }

          case "cta":
            return (
              <div
                key={i}
                className="my-12 px-6 py-8 text-center"
                style={{
                  backgroundColor: "var(--blog-surface)",
                  borderRadius: "var(--blog-radius-lg)",
                  border: "1px solid var(--blog-border)",
                }}
              >
                {b.text && (
                  <p className="text-base font-medium mb-4" style={{ color: "var(--blog-text)" }}>
                    {stripHtml(b.text)}
                  </p>
                )}
                <a
                  href={b.ctaHref || "#kontakt"}
                  className="inline-block px-8 py-3.5 font-semibold text-sm transition-transform duration-200 hover:scale-105"
                  style={{ backgroundColor: "var(--blog-primary)", color: "var(--blog-on-primary)", borderRadius: "var(--blog-radius-md)" }}
                >
                  {stripHtml(b.ctaText || "Kontaktujte nás")}
                </a>
              </div>
            );

          case "divider":
            return (
              <div key={i} className="my-12 flex items-center justify-center gap-2" aria-hidden>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--blog-border)" }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--blog-primary)" }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--blog-border)" }} />
              </div>
            );

          case "video": {
            const embed = b.url ? videoEmbedUrl(b.url) : null;
            if (!embed) return null;
            return (
              <figure key={i} className="my-10 -mx-2 md:-mx-8">
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "16/9", borderRadius: "var(--blog-radius-lg)" }}
                >
                  <iframe
                    src={embed}
                    title={b.caption || "Video"}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
                {b.caption && (
                  <figcaption className="text-xs text-center mt-3" style={{ color: "var(--blog-muted)" }}>
                    {stripHtml(b.caption)}
                  </figcaption>
                )}
              </figure>
            );
          }

          case "code":
            return (
              <pre
                key={i}
                className="my-8 p-5 overflow-x-auto text-sm leading-relaxed"
                style={{
                  backgroundColor: "#0d1117",
                  color: "#e6edf3",
                  borderRadius: "var(--blog-radius-md)",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                <code>{b.text ?? ""}</code>
              </pre>
            );

          case "text":
          default: {
            const dropCap = i === firstTextIndex && skin === "editorial";
            return (
              <p
                key={i}
                className={`mb-6 leading-[1.8] ${dropCap ? "blog-drop-cap" : ""}`}
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(b.text ?? "") }}
              />
            );
          }
        }
      })}
    </>
  );
}
