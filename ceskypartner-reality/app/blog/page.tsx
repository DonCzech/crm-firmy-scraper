import type { Metadata } from "next";
import JournalPageContent from "@/components/JournalPageContent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog | Český Partner",
  description: "Aktuální články z realitního trhu, rady pro kupující i prodávající.",
  alternates: { canonical: "/blog", languages: { "cs-CZ": "/blog", "en-GB": "/en/journal", "x-default": "/blog" } },
};

export default function BlogListPage() {
  return <JournalPageContent />;
}
