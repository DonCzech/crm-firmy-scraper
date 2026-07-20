import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/lib/template-lab/workflow";
import { query, initDb } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/platform-admin";

export async function GET(req: NextRequest) {
  const auth = requirePlatformAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    await initDb();
    // Try DB first
    const dbJobs = await query<{
      id: number;
      url: string;
      industry: string;
      status: string;
      stage: string | null;
      error_message: string | null;
      log: string[];
      started_at: string | null;
      completed_at: string | null;
      created_at: string;
      updated_at: string;
    }>(`
      SELECT j.*, g.template_slug, g.template_name, g.preview_desktop, g.preview_mobile
      FROM template_lab_jobs j
      LEFT JOIN template_lab_generated g ON g.job_id = j.id
      ORDER BY j.created_at DESC
      LIMIT 100
    `);

    if (dbJobs.length > 0) {
      return NextResponse.json({ jobs: dbJobs });
    }

    // Fallback to file system
    const jobs = getJobs();
    return NextResponse.json({ jobs });
  } catch {
    const jobs = getJobs();
    return NextResponse.json({ jobs });
  }
}
