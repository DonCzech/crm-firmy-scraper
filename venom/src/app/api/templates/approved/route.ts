import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getOnboardingEshop, ONBOARDING_ESHOP_KEYS } from "@/lib/templates/onboarding-catalog";

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
       WHERE tpl.status = 'active'
         AND (tpl.review_status = 'approved' OR tpl.key = ANY($1::text[]))
       ORDER BY CASE WHEN tpl.key = ANY($1::text[]) THEN 0 ELSE 1 END,
                tpl.reviewed_at DESC NULLS LAST, tpl.key ASC`,
      [ONBOARDING_ESHOP_KEYS]
    );

    const items = rows.map((r) => {
      const featuredEshop = getOnboardingEshop(r.key);
      return {
        key: r.key,
        name: r.name,
        industry: r.industry ?? null,
        previewImage: featuredEshop?.previewImage ?? null,
        demoUrl: featuredEshop
          ? `/demo/${featuredEshop.demoSlug}`
          : r.demo_slug ? `/demo/${r.demo_slug}` : null,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[/api/templates/approved] error:", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
