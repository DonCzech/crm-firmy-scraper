"use client";

import { notFound } from "next/navigation";
import BlockRenderer from "@/astera/components/BlockRenderer";
import Footer from "@/astera/components/Footer";
import Header from "@/astera/components/Header";
import { useContent } from "@/astera/context/ContentContext";
import { resolveLocalizedPageSlug, UI_STRINGS } from "@/astera/lib/i18n";

export default function EditablePage({ slug }: { slug: string }) {
  const { content, contentLoaded, admin, currentLang } = useContent();
  const ui = UI_STRINGS[currentLang];

  if (!contentLoaded) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: "102px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "#9ca3af", fontFamily: "'Poppins',sans-serif", fontSize: 16 }}>{ui.loading}</div>
        </main>
        <Footer />
      </>
    );
  }

  const slugCandidates = resolveLocalizedPageSlug(slug, currentLang);
  const page = (content.pages || []).find(p => slugCandidates.includes(p.slug));
  if (!page) return notFound();

  return (
    <>
      <Header />
      <main style={{ paddingTop: admin.isAdmin ? "128px" : "102px", minHeight: "60vh" }}>
        <BlockRenderer blocks={page.blocks} pageSlug={page.slug} />
      </main>
      <Footer />
    </>
  );
}
