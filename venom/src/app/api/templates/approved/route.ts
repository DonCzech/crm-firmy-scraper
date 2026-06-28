import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/** Public read-only endpoint for the onboarding modal template picker. */

export const dynamic = "force-dynamic";
export const revalidate = 300;

interface Row {
  key: string;
  name: string;
  industry: string | null;
  demo_slug: string | null;
}

export async function GET() {
  try {
    /* For each approved template, attach the first v2-content tenant slug so the
       picker can render a live iframe preview. */
    const rows = await query<Row>(
      `SELECT
         tpl.key,
         tpl.name,
         tpl.industry,
         (
           SELECT t.slug FROM tenants t
            WHERE t.template_id = tpl.id
              AND EXISTS (SELECT 1 FROM sections s WHERE s.tenant_id = t.id AND s.content_source = 'v2')
            ORDER BY t.id LIMIT 1
         ) AS demo_slug
       FROM templates tpl
       WHERE tpl.review_status = 'approved' AND tpl.status = 'active'
       ORDER BY tpl.reviewed_at DESC NULLS LAST, tpl.key ASC`
    );

    const items = rows.map((r) => ({
      key: r.key,
      name: r.name,
      industry: r.industry ?? null,
      previewImage: `/templates/${r.key}/preview.png`,
      demoUrl: r.demo_slug ? `/demo/${r.demo_slug}` : null,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[/api/templates/approved] error:", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
