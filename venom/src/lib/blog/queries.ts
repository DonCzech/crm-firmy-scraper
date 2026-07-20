import { query, queryOne } from "@/lib/db";
import type { BlogBlock } from "./content";

export interface BlogPostCard {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
  reading_time_min: number | null;
}

export interface BlogPostFull extends BlogPostCard {
  content: BlogBlock[];
  updated_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  noindex: boolean | null;
}

export interface ListOptions {
  page?: number;
  perPage?: number;
  category?: string | null;
  q?: string | null;
  tag?: string | null;
}

const CARD_COLS =
  "id, slug, title, excerpt, featured_image, author, category, tags, published_at, reading_time_min";

export async function listPublishedPosts(
  tenantId: number,
  { page = 1, perPage = 9, category = null, q = null, tag = null }: ListOptions = {}
): Promise<{ posts: BlogPostCard[]; total: number }> {
  const where: string[] = ["tenant_id = $1", "status = 'published'"];
  const vals: unknown[] = [tenantId];

  if (category) {
    vals.push(category);
    where.push(`category = $${vals.length}`);
  }
  if (tag) {
    vals.push(tag);
    where.push(`$${vals.length} = ANY(tags)`);
  }
  if (q) {
    vals.push(`%${q}%`);
    where.push(`(title ILIKE $${vals.length} OR excerpt ILIKE $${vals.length})`);
  }

  const whereSql = where.join(" AND ");
  const countRows = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM blog_posts WHERE ${whereSql}`,
    vals
  );

  vals.push(perPage, (page - 1) * perPage);
  const posts = await query<BlogPostCard>(
    `SELECT ${CARD_COLS} FROM blog_posts WHERE ${whereSql}
     ORDER BY published_at DESC NULLS LAST, id DESC
     LIMIT $${vals.length - 1} OFFSET $${vals.length}`,
    vals
  );

  return { posts, total: parseInt(countRows[0]?.count ?? "0", 10) };
}

export async function listCategories(tenantId: number): Promise<{ category: string; count: number }[]> {
  const rows = await query<{ category: string; count: string }>(
    `SELECT category, COUNT(*) as count FROM blog_posts
     WHERE tenant_id = $1 AND status = 'published' AND category IS NOT NULL AND category != ''
     GROUP BY category ORDER BY count DESC, category`,
    [tenantId]
  );
  return rows.map((r) => ({ category: r.category, count: parseInt(r.count, 10) }));
}

export async function getPublishedPost(tenantId: number, slug: string): Promise<BlogPostFull | null> {
  return queryOne<BlogPostFull>(
    "SELECT * FROM blog_posts WHERE tenant_id = $1 AND slug = $2 AND status = 'published'",
    [tenantId, slug]
  );
}

export async function getRelatedPosts(
  tenantId: number,
  post: { id: number; category: string | null; tags: string[] | null },
  limit = 3
): Promise<BlogPostCard[]> {
  return query<BlogPostCard>(
    `SELECT ${CARD_COLS} FROM blog_posts
     WHERE tenant_id = $1 AND status = 'published' AND id != $2
       AND (category = $3 OR tags && $4)
     ORDER BY published_at DESC LIMIT $5`,
    [tenantId, post.id, post.category ?? "", post.tags ?? [], limit]
  );
}

export async function getAdjacentPosts(
  tenantId: number,
  publishedAt: string | null,
  postId: number
): Promise<{ prev: BlogPostCard | null; next: BlogPostCard | null }> {
  if (!publishedAt) return { prev: null, next: null };
  const [prev, next] = await Promise.all([
    queryOne<BlogPostCard>(
      `SELECT ${CARD_COLS} FROM blog_posts
       WHERE tenant_id = $1 AND status = 'published' AND (published_at, id) < ($2, $3)
       ORDER BY published_at DESC, id DESC LIMIT 1`,
      [tenantId, publishedAt, postId]
    ),
    queryOne<BlogPostCard>(
      `SELECT ${CARD_COLS} FROM blog_posts
       WHERE tenant_id = $1 AND status = 'published' AND (published_at, id) > ($2, $3)
       ORDER BY published_at ASC, id ASC LIMIT 1`,
      [tenantId, publishedAt, postId]
    ),
  ]);
  return { prev, next };
}
