"use client";
import { useContent } from "@/astera/context/ContentContext";

export default function CustomStyles() {
  const { content } = useContent();
  const css = content.siteSettings?.customCss || "";
  const accent = content.siteSettings?.accentColor || "#7c3bb2";

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      :root { --accent: ${accent}; }
      .btn-primary { background: ${accent} !important; }
      .btn-primary:hover { background: #5f2a8d !important; }
      .btn-primary.btn-secondary { background: #ffffff !important; color: ${accent} !important; box-shadow: inset 0 0 0 1px ${accent}; }
      .btn-primary.btn-secondary:hover { background: #f7f0fb !important; color: ${accent} !important; }
      ${css}
    `}} />
  );
}
