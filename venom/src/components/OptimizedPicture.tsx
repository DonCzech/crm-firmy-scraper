import type { CSSProperties } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
  fetchPriority?: "high" | "low" | "auto";
}

export function OptimizedPicture({ src, alt = "", className, style, imgStyle, fetchPriority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={imgStyle ?? style} fetchPriority={fetchPriority} />
  );
}
