import type { Metadata } from "next";
import JournalArticleContent from "@/components/JournalArticleContent";
import { getBlogPostBySlug } from "@/lib/queries";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug).catch(() => null);
  if (!post) return {};
  const title = post.metaTitle || `${post.title} | Český Partner Blog`;
  const description = post.metaDesc || post.excerpt || "";
  return {
    title, description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      type: "article", url: absoluteUrl(`/blog/${params.slug}`), title, description, siteName: SITE_NAME, locale: "cs_CZ",
      ...(post.coverImage ? { images: [{ url: post.coverImage, width: 1200, height: 630 }] } : {}),
      ...(post.publishedAt ? { publishedTime: new Date(post.publishedAt).toISOString() } : {}),
    },
    twitter: { card: post.coverImage ? "summary_large_image" : "summary", title, description, ...(post.coverImage ? { images: [post.coverImage] } : {}) },
  };
}

export default function BlogPostPage({ params }: Props) {
  return <JournalArticleContent slug={params.slug} />;
}
