import { readdir, readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { PreviewGrid, type PreviewItem } from "./PreviewGrid";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Webero — Hotové šablony (engine v2)",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const INDUSTRY_LABELS: Record<string, string> = {
  cafe: "Kavárna",
  bakery: "Pekárna",
  restaurant: "Restaurace",
  barber: "Barbershop",
  hairdresser: "Kadeřnictví",
  wellness: "Wellness",
  beauty: "Beauty",
  nails: "Nehtové studio",
  fitness: "Fitness",
  physio: "Fyzioterapie",
  dentist: "Stomatologie",
  lawyer: "Advokát",
  realEstate: "Reality",
  auto: "Autoservis",
  cleaning: "Úklid",
  construction: "Stavebnictví",
  florist: "Květinářství",
  catering: "Catering",
  hotel: "Hotel",
  events: "Eventy",
  tattoo: "Tetování",
  veterinary: "Veterinář",
  accounting: "Účetnictví",
  finance: "Finance",
  architecture: "Architektura",
  solar: "Fotovoltaika",
  photographer: "Fotograf",
  dj: "DJ",
  education: "Vzdělávání",
  pets: "Domácí mazlíčci",
  default: "Ostatní",
};

interface TemplateManifest {
  key: string;
  name: string;
  industry: string;
  version: string;
  description?: string;
  baseTemplate?: string | null;
}

async function discoverTemplates(): Promise<PreviewItem[]> {
  const templatesRoot = path.join(process.cwd(), "src", "templates");
  if (!existsSync(templatesRoot)) return [];

  const dirs = await readdir(templatesRoot, { withFileTypes: true });
  const candidates = dirs.filter((d) => d.isDirectory()).map((d) => d.name);

  // Engine tenant naming convention: "{key}-v2" (separate namespace from clone "{key}-demo").
  // Legacy "{key}-demo" / "{key}" supported only for backwards compat with templates DONE before 2026-05-27.
  const candidateSlugs = candidates.flatMap((k) => [`${k}-v2`, `${k}-demo`, k]);
  const tenantRows = await query<{ slug: string; access_token: string | null; status: string; id: number; parent_tenant_id: number | null; showcase_kind: string | null }>(
    "SELECT id, slug, access_token, status, parent_tenant_id, showcase_kind FROM tenants WHERE slug = ANY($1::text[]) OR parent_tenant_id IN (SELECT id FROM tenants WHERE slug = ANY($1::text[]))",
    [candidateSlugs]
  );
  const tenantBySlug = new Map(tenantRows.map((r) => [r.slug, r]));
  const showcasesByParent = new Map<number, typeof tenantRows>();
  for (const t of tenantRows) {
    if (t.parent_tenant_id) {
      const arr = showcasesByParent.get(t.parent_tenant_id) ?? [];
      arr.push(t);
      showcasesByParent.set(t.parent_tenant_id, arr);
    }
  }

  const items: PreviewItem[] = [];
  for (const key of candidates) {
    const manifestPath = path.join(templatesRoot, key, "template.json");
    if (!existsSync(manifestPath)) continue;
    try {
      const raw = await readFile(manifestPath, "utf-8");
      const manifest = JSON.parse(raw) as TemplateManifest;
      const themeRaw = await readFile(path.join(templatesRoot, key, "theme.json"), "utf-8").catch(() => "");
      const theme = themeRaw ? (JSON.parse(themeRaw) as { colors?: Record<string, string> }) : null;

      // Prefer "{key}-v2" (new engine tenant). Fall back to legacy "{key}-demo" / "{key}" for older templates.
      const tenant =
        tenantBySlug.get(`${key}-v2`) ??
        tenantBySlug.get(`${key}-demo`) ??
        tenantBySlug.get(key);
      const demoSlug = tenant?.slug ?? `${key}-v2`;

      const previewPath = `/templates/${key}/preview.png`;
      const previewFsPath = path.join(process.cwd(), "public", "templates", key, "preview.png");
      const hasScreenshot = existsSync(previewFsPath);

      const variants: PreviewItem["variants"] = [
        {
          kind: "core",
          label: "Core",
          demoSlug,
          tenantStatus: tenant?.status ?? "missing",
          accessToken: tenant?.access_token ?? null,
        },
      ];
      if (tenant?.id) {
        const showcases = showcasesByParent.get(tenant.id) ?? [];
        for (const sc of showcases) {
          variants.push({
            kind: "showcase",
            label: "Ukázková",
            demoSlug: sc.slug,
            tenantStatus: sc.status,
            accessToken: sc.access_token,
          });
        }
      }

      items.push({
        key: manifest.key,
        name: manifest.name,
        industry: manifest.industry,
        category: INDUSTRY_LABELS[manifest.industry] ?? INDUSTRY_LABELS.default,
        version: manifest.version,
        description: manifest.description ?? "",
        baseTemplate: manifest.baseTemplate ?? null,
        primaryColor: theme?.colors?.primary ?? "#1f1f1f",
        accentColor: theme?.colors?.accent ?? theme?.colors?.secondary ?? "#9ca3af",
        screenshot: hasScreenshot ? previewPath : null,
        demoSlug,
        tenantStatus: tenant?.status ?? "missing",
        accessToken: tenant?.access_token ?? null,
        showcaseKind: null,
        variants,
      });
    } catch {
      // ignore broken manifest
    }
  }

  return items.sort((a, b) => a.category.localeCompare(b.category, "cs") || a.name.localeCompare(b.name, "cs"));
}

export default async function PreviewV2Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  console.log("[preview-2] token present:", !!token, "| valid:", token ? !!verifyToken(token) : false);
  if (!token || !verifyToken(token)) {
    console.log("[preview-2] → redirect to login");
    redirect("/admin/login?next=%2Fpreview-2");
  }

  const items = await discoverTemplates();
  console.log("[preview-2] items count:", items.length);
  return <PreviewGrid items={items} />;
}
