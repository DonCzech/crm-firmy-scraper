import type { CSSProperties } from "react";

interface Props {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}

export function OptimizedPicture({ src, alt = "", className, style, imgStyle }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={imgStyle ?? style} />
  );
}
