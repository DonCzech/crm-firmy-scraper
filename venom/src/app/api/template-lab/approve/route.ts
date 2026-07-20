import { NextRequest, NextResponse } from "next/server";
import { query, initDb } from "@/lib/db";
import { updateReviewItem, logProgress } from "@/lib/template-lab/workflow";
import { requirePlatformAdmin } from "@/lib/platform-admin";

export async function POST(req: NextRequest) {
  const auth = requirePlatformAdmin(req, { mutation: true });
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const { templateSlug, action, notes } = body as {
    templateSlug?: string;
    action?: "approve" | "reject";
    notes?: string;
  };

  if (!templateSlug || !action) {
    return NextResponse.json({ error: "templateSlug and action required" }, { status: 400 });
  }

  await initDb();

  const [template] = await query<{ id: number; job_id: number; template_slug: string }>(
    "SELECT id, job_id, template_slug FROM template_lab_generated WHERE template_slug = $1",
    [templateSlug]
  );

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (action === "approve") {
    await query(
      "UPDATE template_lab_generated SET status = 'approved', approved_at = now(), review_notes = $1, updated_at = now() WHERE id = $2",
      [notes || null, template.id]
    );
    await query(
      "INSERT INTO template_lab_publish_log (generated_id, action, notes) VALUES ($1, 'approved', $2)",
      [template.id, notes || "Approved by admin"]
    );
    updateReviewItem(templateSlug, { status: "approved", notes: notes || "" });
    logProgress(`✅ Template approved: ${templateSlug}`);
  } else {
    await query(
      "UPDATE template_lab_generated SET status = 'rejected', review_notes = $1, updated_at = now() WHERE id = $2",
      [notes || null, template.id]
    );
    await query(
      "INSERT INTO template_lab_publish_log (generated_id, action, notes) VALUES ($1, 'rejected', $2)",
      [template.id, notes || "Rejected by admin"]
    );
    updateReviewItem(templateSlug, { status: "rejected", notes: notes || "" });
    logProgress(`❌ Template rejected: ${templateSlug}`);
  }

  return NextResponse.json({ success: true, action, templateSlug });
}
