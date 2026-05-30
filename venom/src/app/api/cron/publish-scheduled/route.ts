import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Called by Vercel Cron (see vercel.json) or any external scheduler every minute.
// Publishes blog posts whose scheduled_at has passed.
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== (process.env.CRON_SECRET ?? "")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await query<{ id: number; slug: string; tenant_slug: string }>(
    `SELECT bp.id, bp.slug, t.slug AS tenant_slug
     FROM blog_posts bp
     JOIN tenants t ON t.id = bp.tenant_id
     WHERE bp.status = 'draft'
       AND bp.scheduled_at IS NOT NULL
       AND bp.scheduled_at <= now()`,
    []
  );

  if (!rows.length) {
    return Response.json({ published: 0 });
  }

  for (const row of rows) {
    await query(
      `UPDATE blog_posts
       SET status = 'published', published_at = now(), updated_at = now()
       WHERE id = $1`,
      [row.id]
    );
    revalidatePath(`/demo/${row.tenant_slug}/blog`);
    revalidatePath(`/demo/${row.tenant_slug}/blog/${row.slug}`);
  }

  return Response.json({ published: rows.length, posts: rows.map((r) => r.slug) });
}
