import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { scrapeWebsite } from "@/lib/template-lab/scraper";
import { analyzeScrapeResult } from "@/lib/template-lab/analyzer";
import { generateTemplate } from "@/lib/template-lab/generator";
import {
  createJob,
  updateJob,
  appendJobLog,
  addToReviewQueue,
  saveWorkflowState,
  addCheckpoint,
  logProgress,
} from "@/lib/template-lab/workflow";
import { captureScreenshots } from "@/lib/template-lab/screenshot";
import { query, initDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url, industry } = body as { url?: string; industry?: string };

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const detectedIndustry = industry || detectIndustryFromUrl(url);
  const job = createJob(url, detectedIndustry);

  // Run analysis in background (don't await — return job ID immediately)
  runAnalysis(job.id, url, detectedIndustry).catch((err) => {
    console.error("[template-lab/analyze] Fatal error:", err);
    updateJob(job.id, { status: "failed", error: String(err) });
  });

  return NextResponse.json({
    jobId: job.id,
    message: "Analysis started",
    statusUrl: `/api/template-lab/jobs/${job.id}`,
  });
}

async function runAnalysis(jobId: string, url: string, industry: string) {
  const t0 = Date.now();
  appendJobLog(jobId, `Starting analysis of ${url}`);
  updateJob(jobId, { status: "analyzing", stage: "scraping", startedAt: new Date().toISOString() });
  saveWorkflowState({ currentWebsite: url, currentIndustry: industry, currentStage: "scraping", status: "analyzing" });

  try {
    await initDb();

    // ── Step 1: Scrape ────────────────────────────────────────────────────────
    appendJobLog(jobId, "Scraping website...");
    logProgress(`[${jobId}] Scraping: ${url}`);
    const scrapeResult = await scrapeWebsite(url);

    if (scrapeResult.error) {
      appendJobLog(jobId, `Scrape warning: ${scrapeResult.error}`);
    }
    appendJobLog(jobId, `Scraped ${scrapeResult.pages.length} pages`);
    addCheckpoint("scraping_completed", {
      log: `Scraped ${scrapeResult.pages.length} pages from ${url}`,
      generatedFiles: [],
      errorCount: scrapeResult.error ? 1 : 0,
      warningCount: 0,
      duration: Date.now() - t0,
    });

    // ── Step 2: Save research files ───────────────────────────────────────────
    const domain = new URL(url).hostname.replace(/^www\./, "");
    const researchDir = path.join(process.cwd(), "template-lab", "research", industry, domain);
    fs.mkdirSync(researchDir, { recursive: true });

    const pagesJson = scrapeResult.pages.map((p) => ({
      url: p.url,
      title: p.title,
      description: p.description,
      navigation: p.navigation,
      headings: p.headings,
      sections: p.sections,
      forms: p.forms,
      contactInfo: p.contactInfo,
      openingHours: p.openingHours,
      socialLinks: p.socialLinks,
      ogData: p.ogData,
      schemaOrg: p.schemaOrg,
      canonicalUrl: p.canonicalUrl,
      imageCount: p.images.length,
      linkCount: p.links.length,
      loadedAt: p.loadedAt,
    }));
    fs.writeFileSync(path.join(researchDir, "pages.json"), JSON.stringify(pagesJson, null, 2));

    // ── Step 3: Analyze ───────────────────────────────────────────────────────
    updateJob(jobId, { stage: "analyzing" });
    appendJobLog(jobId, "Analyzing structure and design...");
    const analysis = analyzeScrapeResult(scrapeResult, industry);

    fs.writeFileSync(path.join(researchDir, "analysis.json"), JSON.stringify(analysis, null, 2));
    fs.writeFileSync(path.join(researchDir, "design-tokens.json"), JSON.stringify(analysis.designTokens, null, 2));
    fs.writeFileSync(
      path.join(researchDir, "seo.json"),
      JSON.stringify({ ...analysis.seo, schemaOrg: analysis.schemaOrg }, null, 2)
    );
    fs.writeFileSync(
      path.join(researchDir, "content-model.json"),
      JSON.stringify(
        {
          industry: analysis.industry,
          services: analysis.services,
          contactInfo: analysis.contactInfo,
          openingHours: analysis.openingHours,
          pages: analysis.pages.map((p) => ({
            slug: p.slug,
            sections: p.sections.map((s) => s.type),
          })),
        },
        null,
        2
      )
    );

    addCheckpoint("analysis_completed", {
      log: `Analysis complete: ${analysis.pages.length} pages, ${analysis.services.length} services detected`,
      generatedFiles: [
        path.join(researchDir, "analysis.json"),
        path.join(researchDir, "design-tokens.json"),
      ],
      errorCount: 0,
      warningCount: 0,
      duration: Date.now() - t0,
    });

    // ── Step 4: Screenshots ───────────────────────────────────────────────────
    updateJob(jobId, { stage: "screenshots" });
    appendJobLog(jobId, "Capturing screenshots...");
    const screenshotDir = path.join(researchDir, "screenshots");
    const screenshots = await captureScreenshots(url, screenshotDir);
    appendJobLog(
      jobId,
      screenshots.error
        ? `Screenshot warning: ${screenshots.error}`
        : `Screenshots captured: desktop=${screenshots.desktop}, mobile=${screenshots.mobile}`
    );
    addCheckpoint("screenshots_completed", {
      log: screenshots.error ? `Screenshot failed: ${screenshots.error}` : "Screenshots captured",
      generatedFiles: [screenshots.desktop, screenshots.mobile].filter(Boolean) as string[],
      errorCount: screenshots.error ? 1 : 0,
      warningCount: 0,
    });

    // ── Step 5: Generate template ─────────────────────────────────────────────
    updateJob(jobId, { stage: "generating" });
    appendJobLog(jobId, "Generating Webero template...");
    const generated = generateTemplate(analysis);

    const generatedDir = path.join(
      process.cwd(),
      "template-lab",
      "generated",
      industry,
      generated.slug
    );
    fs.mkdirSync(generatedDir, { recursive: true });
    fs.writeFileSync(
      path.join(generatedDir, "template.json"),
      JSON.stringify(generated, null, 2)
    );
    fs.writeFileSync(
      path.join(generatedDir, "content-schema.json"),
      JSON.stringify(generated.editableSchema, null, 2)
    );

    addCheckpoint("template_generated", {
      log: `Template generated: ${generated.slug}`,
      generatedFiles: [path.join(generatedDir, "template.json")],
      errorCount: 0,
      warningCount: 0,
      duration: Date.now() - t0,
    });

    // ── Step 6: Save to DB ────────────────────────────────────────────────────
    appendJobLog(jobId, "Saving to database...");

    // Save source
    const [sourceRow] = await query<{ id: number }>(
      `INSERT INTO template_lab_sources (url, industry, domain, status, priority)
       VALUES ($1, $2, $3, 'analyzed', 1)
       ON CONFLICT (url) DO UPDATE SET status = 'analyzed', updated_at = now()
       RETURNING id`,
      [url, industry, domain]
    );

    // Save job to DB
    const [jobRow] = await query<{ id: number }>(
      `INSERT INTO template_lab_jobs (source_id, url, industry, status, stage, started_at, completed_at)
       VALUES ($1, $2, $3, 'generating', 'template_generated', $4, now())
       RETURNING id`,
      [sourceRow?.id, url, industry, new Date().toISOString()]
    );

    // Save snapshot
    const [snapshotRow] = await query<{ id: number }>(
      `INSERT INTO template_lab_snapshots (job_id, url, industry, domain, analysis, pages, seo, screenshot_desktop, screenshot_mobile)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        jobRow?.id,
        url,
        industry,
        domain,
        JSON.stringify(analysis),
        JSON.stringify(pagesJson),
        JSON.stringify(analysis.seo),
        screenshots.desktop,
        screenshots.mobile,
      ]
    );

    // Save design tokens
    await query(
      `INSERT INTO template_lab_design_tokens (job_id, snapshot_id, domain, tokens)
       VALUES ($1, $2, $3, $4)`,
      [jobRow?.id, snapshotRow?.id, domain, JSON.stringify(analysis.designTokens)]
    );

    // Save generated template
    const [genRow] = await query<{ id: number }>(
      `INSERT INTO template_lab_generated (
         job_id, industry, source_url, template_slug, template_name, status,
         preview_desktop, preview_mobile, editable_schema, content_schema, design_tokens, sections_data, pages_data
       ) VALUES ($1, $2, $3, $4, $5, 'ready-for-review', $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (template_slug) DO UPDATE SET
         status = 'ready-for-review', updated_at = now(),
         editable_schema = $8, content_schema = $9, design_tokens = $10, sections_data = $11, pages_data = $12
       RETURNING id`,
      [
        jobRow?.id,
        industry,
        url,
        generated.slug,
        generated.name,
        screenshots.desktop,
        screenshots.mobile,
        JSON.stringify(generated.editableSchema),
        JSON.stringify(generated.definition.demoContent),
        JSON.stringify(generated.definition.designTokens),
        JSON.stringify(generated.definition.defaultSections),
        JSON.stringify(generated.pagesData),
      ]
    );

    // Update job record
    updateJob(jobId, {
      status: "ready-for-review",
      stage: "ready_for_review",
      templateSlug: generated.slug,
      templateId: genRow?.id ?? null,
      completedAt: new Date().toISOString(),
    });

    // Add to review queue
    addToReviewQueue({
      jobId,
      templateSlug: generated.slug,
      templateName: generated.name,
      industry,
      sourceUrl: url,
    });

    saveWorkflowState({
      currentStage: "ready_for_review",
      status: "ready-for-review",
      lastCompletedStep: "template_generated",
      nextStep: "waiting_for_manual_review",
      requiresHumanApproval: true,
    });

    addCheckpoint("ready_for_review", {
      log: `Template ${generated.slug} is ready for review`,
      generatedFiles: [path.join(generatedDir, "template.json")],
      errorCount: 0,
      warningCount: 0,
      duration: Date.now() - t0,
    });

    logProgress(`[${jobId}] ✅ Template ${generated.slug} ready for review (${Math.round((Date.now() - t0) / 1000)}s)`);
    appendJobLog(jobId, `✅ Template ${generated.slug} ready for review!`);
  } catch (err) {
    const errMsg = String(err);
    updateJob(jobId, { status: "failed", error: errMsg });
    saveWorkflowState({ currentStage: "failed", status: "failed" });
    logProgress(`[${jobId}] ❌ Error: ${errMsg}`, "error");
    appendJobLog(jobId, `❌ Error: ${errMsg}`);
    throw err;
  }
}

function detectIndustryFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (/barber|holič|holic/.test(lower)) return "barber";
  if (/kadernick|salon|kader|hair/.test(lower)) return "hairdresser";
  if (/wellness|masaz|masáž|spa|relax/.test(lower)) return "wellness";
  if (/tattoo|tato|tribo/.test(lower)) return "tattoo";
  if (/fitness|gym|sport|trenér/.test(lower)) return "fitness";
  if (/kosmetick|beauty|visage/.test(lower)) return "cosmetics";
  if (/nehet|nail/.test(lower)) return "nails";
  if (/fyzio|physio|rehab/.test(lower)) return "physiotherapy";
  if (/restaurac|bistro|jidlo|food/.test(lower)) return "restaurant";
  if (/kavarna|coffee|cafe/.test(lower)) return "cafe";
  if (/realit|reality|nemovitost/.test(lower)) return "realEstate";
  if (/autoservis|auto|servis|garant/.test(lower)) return "autoService";
  if (/zubar|zubni|smile|dent/.test(lower)) return "dentist";
  if (/advokatni|advokat|legal|lawyer|partners/.test(lower)) return "lawyer";
  if (/malir|remsln|facility/.test(lower)) return "craftsman";
  return "general";
}
