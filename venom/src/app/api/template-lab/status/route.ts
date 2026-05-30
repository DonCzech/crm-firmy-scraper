import { NextResponse } from "next/server";
import { getWorkflowState, getJobs, getReviewQueue } from "@/lib/template-lab/workflow";
import { query, initDb } from "@/lib/db";

export async function GET() {
  const state = getWorkflowState();
  const jobs = getJobs();
  const reviewQueue = getReviewQueue();

  let dbTemplates: unknown[] = [];
  try {
    await initDb();
    dbTemplates = await query(`
      SELECT id, template_slug, template_name, industry, source_url, status,
             preview_desktop, preview_mobile, created_at, updated_at, approved_at, published_at
      FROM template_lab_generated
      ORDER BY created_at DESC
    `);
  } catch {}

  return NextResponse.json({
    state,
    jobStats: {
      total: jobs.length,
      analyzing: jobs.filter((j) => j.status === "analyzing").length,
      readyForReview: jobs.filter((j) => j.status === "ready-for-review").length,
      approved: jobs.filter((j) => j.status === "approved").length,
      published: jobs.filter((j) => j.status === "published").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    },
    reviewQueue,
    templates: dbTemplates,
    queueLength: 54,
  });
}
