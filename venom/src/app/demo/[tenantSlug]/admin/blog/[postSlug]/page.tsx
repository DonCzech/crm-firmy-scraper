import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, queryOne } from "@/lib/db";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ tenantSlug: string; postSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown[];
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  status: "draft" | "published";
  seo_title: string | null;
  seo_description: string | null;
  noindex: boolean;
  scheduled_at: string | null;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { tenantSlug, postSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`venom_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const post = await queryOne<BlogPost>(
    "SELECT * FROM blog_posts WHERE tenant_id = $1 AND slug = $2",
    [tenant.id, postSlug]
  );
  if (!post) return notFound();

  return (
    <BlogPostEditor
      tenantSlug={tenantSlug}
      postSlug={postSlug}
      initial={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: Array.isArray(post.content) ? (post.content as Array<{ type: string; text?: string; url?: string; alt?: string }>) : [],
        featured_image: post.featured_image ?? "",
        author: post.author ?? "",
        category: post.category ?? "",
        tags: (post.tags ?? []).join(", "),
        status: post.status,
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
        noindex: post.noindex ?? false,
        scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : "",
      }}
    />
  );
}
