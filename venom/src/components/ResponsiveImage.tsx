import type { CSSProperties } from "react";
import { getDimensionPreset, type ImageDimensionKey } from "@/lib/image-dimensions";

export interface ResponsiveImageVariant {
  width: number;
  height: number;
  webpUrl: string;
  jpegUrl: string;
}

interface ResponsiveImageProps {
  src: string;
  variants?: ResponsiveImageVariant[];
  alt: string;
  dimensions?: ImageDimensionKey | string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  lqip?: string;
  objectFit?: "cover" | "contain";
  sizes?: string;
  jpegFallback?: string;
}

function buildSrcSet(items: Array<{ width: number; url: string | null | undefined }>): string | undefined {
  const valid = items.filter((it): it is { width: number; url: string } => Boolean(it.url));
  if (!valid.length) return undefined;
  return valid.map((it) => `${it.url} ${it.width}w`).join(", ");
}

export function ResponsiveImage({
  src,
  variants,
  alt,
  dimensions,
  width,
  height,
  priority,
  className,
  lqip,
  objectFit = "cover",
  sizes: sizesOverride,
  jpegFallback,
}: ResponsiveImageProps) {
  const preset = getDimensionPreset(dimensions);
  const sizes = sizesOverride ?? preset.sizes ?? undefined;

  const aspect = preset.aspect ?? (width && height ? width / height : undefined);
  const explicitWidth = width ?? (variants && variants.length ? variants[variants.length - 1].width : undefined);
  const explicitHeight = height ?? (variants && variants.length ? variants[variants.length - 1].height : undefined);

  const wrapStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    ...(aspect ? { aspectRatio: String(aspect) } : null),
    ...(lqip
      ? {
          backgroundImage: `url("${lqip}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : null),
  };

  const imgStyle: CSSProperties = {
    objectFit,
    width: "100%",
    height: "100%",
    display: "block",
  };

  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  // Case 1: full variants — primary WebP source + JPG fallback srcSet/src
  if (variants && variants.length) {
    const webpSrcSet = buildSrcSet(variants.map((v) => ({ width: v.width, url: v.webpUrl })));
    const jpegSrcSet = buildSrcSet(variants.map((v) => ({ width: v.width, url: v.jpegUrl })));
    const largest = variants[variants.length - 1];
    const fallbackSrc = largest.jpegUrl || largest.webpUrl || src;
    return (
      <div className={className} style={wrapStyle}>
        <picture>
          {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fallbackSrc}
            srcSet={jpegSrcSet}
            sizes={sizes}
            alt={alt}
            width={explicitWidth}
            height={explicitHeight}
            loading={loading}
            decoding="async"
            fetchPriority={fetchPriority}
            style={imgStyle}
          />
        </picture>
      </div>
    );
  }

  // Case 2: single-source — WebP primary + JPG fallback if provided
  return (
    <div className={className} style={wrapStyle}>
      <picture>
        <source type="image/webp" srcSet={src} sizes={sizes} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={jpegFallback ?? src}
          sizes={sizes}
          alt={alt}
          width={explicitWidth}
          height={explicitHeight}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          style={imgStyle}
        />
      </picture>
    </div>
  );
}
