import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";
import { query, initDb } from "@/lib/db";
import { logProgress, saveWorkflowState } from "@/lib/template-lab/workflow";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { templateSlug } = body as { templateSlug?: string };

  if (!templateSlug) {
    return NextResponse.json({ error: "templateSlug required" }, { status: 400 });
  }

  await initDb();

  const [template] = await query<{
    id: number;
    industry: string;
    template_slug: string;
    template_name: string;
    status: string;
    design_tokens: Record<string, string>;
    sections_data: unknown[];
    pages_data: unknown[];
    content_schema: unknown;
  }>(
    "SELECT * FROM template_lab_generated WHERE template_slug = $1",
    [templateSlug]
  );

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }
  if (template.status !== "approved") {
    return NextResponse.json(
      { error: "Template must be approved before publishing" },
      { status: 400 }
    );
  }

  // Load the generated template JSON
  const generatedPath = path.join(
    process.cwd(),
    "template-lab",
    "generated",
    template.industry,
    templateSlug,
    "template.json"
  );

  let generatedData: {
    definition: {
      key: string;
      name: string;
      industry: string;
      version: string;
      designTokens: Record<string, string>;
      defaultSections: unknown[];
      pages?: unknown[];
      demoContent: Record<string, unknown>;
    };
  } | null = null;

  if (fs.existsSync(generatedPath)) {
    try {
      generatedData = JSON.parse(fs.readFileSync(generatedPath, "utf-8"));
    } catch {}
  }

  // Insert or update in the main templates table
  const [existing] = await query<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1",
    [templateSlug]
  );

  if (existing) {
    await query(
      "UPDATE templates SET name = $1, industry = $2, status = 'active', updated_at = now() WHERE id = $3",
      [template.template_name, template.industry, existing.id]
    );
  } else {
    await query(
      "INSERT INTO templates (key, name, industry, current_version, status) VALUES ($1, $2, $3, '1.0.0', 'active')",
      [templateSlug, template.template_name, template.industry]
    );
  }

  const [templateRow] = await query<{ id: number }>(
    "SELECT id FROM templates WHERE key = $1",
    [templateSlug]
  );

  // Insert template version
  if (templateRow && generatedData) {
    await query(
      `INSERT INTO template_versions (template_id, version, schema_version, default_config, default_sections, default_design_tokens, default_demo_content)
       VALUES ($1, '1.0.0', 1, '{}', $2, $3, $4)
       ON CONFLICT (template_id, version) DO UPDATE SET
         default_sections = $2, default_design_tokens = $3, default_demo_content = $4`,
      [
        templateRow.id,
        JSON.stringify(generatedData.definition.defaultSections),
        JSON.stringify(generatedData.definition.designTokens),
        JSON.stringify(generatedData.definition.demoContent),
      ]
    );
  }

  // Move to published state
  await query(
    "UPDATE template_lab_generated SET status = 'published', published_at = now(), updated_at = now() WHERE id = $1",
    [template.id]
  );
  await query(
    "INSERT INTO template_lab_publish_log (generated_id, action, notes) VALUES ($1, 'published', 'Published to public catalog')",
    [template.id]
  );

  // Copy files to published directory
  const publishedDir = path.join(process.cwd(), "template-lab", "published", templateSlug);
  const generatedDir = path.join(process.cwd(), "template-lab", "generated", template.industry, templateSlug);
  fs.mkdirSync(publishedDir, { recursive: true });
  if (fs.existsSync(generatedDir)) {
    for (const file of fs.readdirSync(generatedDir)) {
      fs.copyFileSync(path.join(generatedDir, file), path.join(publishedDir, file));
    }
  }

  saveWorkflowState({ currentStage: "published", status: "published", requiresHumanApproval: false });
  logProgress(`🚀 Template published: ${templateSlug}`);

  return NextResponse.json({
    success: true,
    templateSlug,
    message: `Template ${templateSlug} published to public catalog`,
  });
}
