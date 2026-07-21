import type { Metadata } from "next";
import JournalArticleContent from "@/components/JournalArticleContent";
import { ARTICLES_EN } from "@/data/articles-en";

type Props = { params: { slug: string } };
export function generateStaticParams() {
  return ARTICLES_EN.map((article) => ({ slug: article.slug }));
}
export function generateMetadata({ params }: Props): Metadata {
  const article = ARTICLES_EN.find((item) => item.slug === params.slug);
  if (!article) return {};
  const path = `/en/journal/${article.slug}`;
  return {
    title: article.title, description: article.excerpt,
    alternates: { canonical: path, languages: { "en-GB": path } },
    openGraph: { type: "article", title: article.title, description: article.excerpt, images: [{ url: article.image }], locale: "en_GB" },
  };
}

export default function EnglishArticlePage({ params }: Props) {
  return <JournalArticleContent slug={params.slug} locale="en" />;
}
