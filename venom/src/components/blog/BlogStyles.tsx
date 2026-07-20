/** Shared skin CSS for blog pages (drop caps, selection, links inside content). */
export function BlogStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
.blog-root ::selection { background: var(--blog-primary); color: #fff; }
.blog-root a { text-underline-offset: 3px; }
.blog-prose a { color: var(--blog-primary); text-decoration: underline; text-decoration-thickness: 1px; }
.blog-prose a:hover { text-decoration-thickness: 2px; }
.blog-prose strong { font-weight: 700; }
.blog-prose code { background: var(--blog-surface); border: 1px solid var(--blog-border); border-radius: 4px; padding: .1em .35em; font-size: .9em; }
.blog-prose pre code { background: none; border: none; padding: 0; font-size: 1em; }
.blog-drop-cap::first-letter {
  float: left;
  font-family: var(--blog-font-heading);
  font-size: 3.4em;
  line-height: .85;
  padding-right: .12em;
  padding-top: .06em;
  font-weight: 700;
  color: var(--blog-primary);
}
/*
  Hover zoom on cards/galleries animates a full-bleed next/image bitmap. Without
  a compositor layer the browser re-rasterises that large image every frame,
  which is the stutter you feel on hover. Promoting the image (and only the
  image) makes the scale a pure GPU composite.
*/
.blog-root img {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
@media (prefers-reduced-motion: reduce) {
  .blog-root * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
`,
      }}
    />
  );
}
