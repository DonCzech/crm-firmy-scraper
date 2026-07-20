/**
 * AiCustomSection — sekce navržená AI Designérem (section_type "ai-custom").
 *
 * Renderuje HTML + CSS z settings.content. Obsah je sanitizován při zápisu
 * (sanitize-html whitelist, žádné skripty ani event handlery — viz
 * src/lib/ai-designer/apply.ts). CSS je scopované pod [data-ai-sec="<id>"].
 */

interface Props {
  content: Record<string, unknown>;
  sectionId: number;
}

export function AiCustomSection({ content, sectionId }: Props) {
  const html = typeof content.html === "string" ? content.html : "";
  const css = typeof content.css === "string" ? content.css : "";
  if (!html) return null;

  return (
    <section data-ai-sec={sectionId}>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
