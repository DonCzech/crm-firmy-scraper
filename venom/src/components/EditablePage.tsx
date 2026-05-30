"use client";

import { notFound } from "next/navigation";
import BlockRenderer from "@/components/BlockRenderer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useContent } from "@/context/ContentContext";

export default function EditablePage({ slug }: { slug: string }) {
  const { content, contentLoaded, admin } = useContent();

  if (!contentLoaded) {
    return (
      <>
        <Header />
        <main style={{ paddingTop: "102px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "#9ca3af", fontFamily: "'Poppins',sans-serif", fontSize: 16 }}>Načítám…</div>
        </main>
        <Footer />
      </>
    );
  }

  const page = (content.pages || []).find(p => p.slug === slug);
  if (!page) return notFound();

  return (
    <>
      <Header />
      <main style={{ paddingTop: admin.isAdmin ? "128px" : "102px", minHeight: "60vh" }}>
        <BlockRenderer blocks={page.blocks} pageSlug={slug} />
      </main>
      <Footer />
    </>
  );
}
