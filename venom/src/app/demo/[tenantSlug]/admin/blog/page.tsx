import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTenantBySlug, query } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ tenantSlug: string }>;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default async function BlogAdminListPage({ params }: Props) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant || tenant.status === "suspended") return notFound();

  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(`webero_access_${tenantSlug}`)?.value;
  if (!tenant.access_token || accessCookie !== tenant.access_token) {
    redirect(`/demo/${tenantSlug}/login`);
  }

  const posts = await query<BlogPost>(
    "SELECT id, slug, title, status, published_at, created_at FROM blog_posts WHERE tenant_id = $1 ORDER BY created_at DESC",
    [tenant.id]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <Link href={`/demo/${tenantSlug}/admin`} className="text-gray-400 hover:text-white">← Editor</Link>
          <span className="font-semibold">Blog</span>
        </div>
        <a href={`/demo/${tenantSlug}/blog`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-xs">Veřejný blog ↗</a>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Články</h1>
          <Link
            href={`/demo/${tenantSlug}/admin/blog/new`}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            + Nový článek
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">Zatím žádné články</p>
            <p className="text-sm">Začněte psát první článek pro váš blog.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    post.status === "published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {post.status === "published" ? "Publikováno" : "Koncept"}
                  </span>
                  <Link
                    href={`/demo/${tenantSlug}/admin/blog/${post.slug}`}
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Upravit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
