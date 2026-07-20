import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import type { Metadata } from "next";
import { BlogAdminDashboard, type AdminPost } from "@/components/admin/BlogAdminDashboard";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function BlogAdminListPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const posts = await query<AdminPost>(
    `SELECT id, slug, title, excerpt, featured_image, category, tags, status,
            published_at, scheduled_at, created_at, updated_at, reading_time_min
     FROM blog_posts WHERE tenant_id = $1
     ORDER BY COALESCE(published_at, created_at) DESC`,
    [tenant.id]
  );

  return <BlogAdminDashboard tenantSlug={tenantSlug} initialPosts={posts} />;
}
