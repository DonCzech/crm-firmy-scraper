"use client";
import { useEffect, useRef, useState } from "react";
import { OPTIMIZED_IMAGE_MAP } from "@/astera/lib/optimized-image-map";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  mobileSrc?: string;
  pictureStyle?: React.CSSProperties;
  noPlaceholder?: boolean;
};

const uploadVariantWidths = [480, 828, 1600];

function extensionFor(src: string) {
  const clean = src.split("?")[0];
  const match = clean.match(/\.(png|jpe?g|webp)$/i);
  if (!match) return ".jpg";
  const ext = match[1].toLowerCase();
  return ext === "jpeg" ? ".jpg" : `.${ext}`;
}

function uploadBase(src: string) {
  return `/optimized${src.replace(/\.(png|jpe?g|webp)$/i, "")}`;
}

function derivedUploadImage(src: string) {
  const isLocalUpload = src.startsWith("/uploads/");
  const isBlobUpload = src.startsWith("http") && src.includes("/astera-upload-");
  if (!isLocalUpload && !isBlobUpload) return null;

  const fallbackExt = extensionFor(src);
  const base = isLocalUpload
    ? uploadBase(src)
    : src.replace(/\.(png|jpe?g|webp)(\?.*)?$/i, "");
  return {
    webp: `${base}.webp`,
    fallback: `${base}${fallbackExt}`,
    webpSrcSet: uploadVariantWidths.map(width => `${base}-${width}w.webp ${width}w`).join(", "),
    fallbackSrcSet: uploadVariantWidths.map(width => `${base}-${width}w${fallbackExt} ${width}w`).join(", "),
    width: undefined as number | undefined,
    height: undefined as number | undefined,
    lqip: undefined as string | undefined,
  };
}

export function getOptimizedImage(src?: string) {
  if (!src || src.startsWith("data:") || src.endsWith(".svg")) {
    return null;
  }
  // Check the build-time map first — covers committed /uploads/ and /images/ that have LQIP
  if (OPTIMIZED_IMAGE_MAP[src]) return OPTIMIZED_IMAGE_MAP[src];
  // HTTP blob URLs and runtime /uploads/ — derive paths if pattern matches
  if (src.startsWith("http") || src.startsWith("/uploads/")) {
    return derivedUploadImage(src);
  }
  return null;
}

function pickFromSrcSet(srcSet: string | undefined, preferredWidth: number) {
  if (!srcSet) return null;

  const candidates = srcSet
    .split(",")
    .map(candidate => {
      const [url, widthDescriptor] = candidate.trim().split(/\s+/);
      const width = Number(widthDescriptor?.replace("w", ""));
      return url && Number.isFinite(width) ? { url, width } : null;
    })
    .filter((candidate): candidate is { url: string; width: number } => Boolean(candidate))
    .sort((a, b) => a.width - b.width);

  return candidates.find(candidate => candidate.width >= preferredWidth)?.url ?? candidates.at(-1)?.url ?? null;
}

export function optimizedImageUrl(src: string | undefined, preferredWidth: number, format: "webp" | "fallback" = "webp") {
  const image = getOptimizedImage(src);
  if (!src) return "";
  if (!image) return src;

  return pickFromSrcSet(format === "webp" ? image.webpSrcSet : image.fallbackSrcSet, preferredWidth)
    ?? (format === "webp" ? image.webp : image.fallback);
}

export function optimizedImageSet(src?: string) {
  const image = getOptimizedImage(src);
  if (!src) return "";
  if (!image) return `url('${src}')`;

  const width = image.width || 1800;
  const webp = pickFromSrcSet(image.webpSrcSet, width) ?? image.webp;
  const fallback = pickFromSrcSet(image.fallbackSrcSet, width) ?? image.fallback;

  return `image-set(
    url('${webp}') type('image/webp'),
    url('${fallback}')
  )`;
}

export default function OptimizedImage({ src, mobileSrc, alt = "", pictureStyle, noPlaceholder, ...imgProps }: Props) {
  const stringSrc = typeof src === "string" ? src : undefined;
  const image = getOptimizedImage(stringSrc);
  const effectiveMobileSrc = mobileSrc || stringSrc;
  const mobileImage = getOptimizedImage(effectiveMobileSrc);
  const sizes = imgProps.sizes || "100vw";
  const isEager = imgProps.fetchPriority === "high" || imgProps.loading === "eager";
  const loading = imgProps.loading ?? (isEager ? "eager" : "lazy");
  const decoding = imgProps.decoding ?? "async";
  const [loaded, setLoaded] = useState(isEager || noPlaceholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle already-cached images — onLoad won't fire if img.complete is already true
  useEffect(() => {
    if (!imgRef.current?.complete) return;
    queueMicrotask(() => setLoaded(true));
  }, []);

  if (!image && (!mobileSrc || mobileSrc === stringSrc)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={stringSrc} alt={alt} loading={loading} decoding={decoding} {...imgProps} />;
  }

  const usePlaceholder = !noPlaceholder && !!image?.lqip;

  return (
    <picture
      style={{
        ...pictureStyle,
        position: "relative",
        display: pictureStyle?.display ?? "block",
        backgroundImage: usePlaceholder && !loaded ? `url(${image?.lqip})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        borderRadius: imgProps.style?.borderRadius ?? pictureStyle?.borderRadius,
      }}
    >
      {/* Shimmer overlay — visible while image loads */}
      {usePlaceholder && !loaded && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "img-shimmer 1.4s ease-in-out infinite",
            zIndex: 1,
          }}
        />
      )}
      {mobileSrc && mobileImage && (
        <source media="(max-width: 768px)" srcSet={mobileImage.webpSrcSet || mobileImage.webp} sizes={sizes} type="image/webp" />
      )}
      {mobileSrc && (
        <source
          media="(max-width: 768px)"
          srcSet={mobileImage?.fallbackSrcSet || mobileImage?.fallback || mobileSrc}
          sizes={sizes}
        />
      )}
      {image && <source srcSet={image.webpSrcSet || image.webp} sizes={sizes} type="image/webp" />}
      <img
        ref={imgRef}
        src={image?.fallback || stringSrc}
        srcSet={image?.fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        width={image?.width}
        height={image?.height}
        loading={loading}
        decoding={decoding}
        {...imgProps}
        onLoad={(e) => {
          setLoaded(true);
          imgProps.onLoad?.(e);
        }}
        style={{
          ...imgProps.style,
          position: "relative",
          zIndex: 2,
        }}
      />
      <style>{`
        @keyframes img-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </picture>
  );
}
