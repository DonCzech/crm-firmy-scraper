#!/usr/bin/env node
/**
 * Build the public design gallery catalog while the complete repository is
 * available. Vercel serves public/ separately from the server function, so
 * application code must not discover these files with fs.existsSync at
 * request time.
 */

import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, "..");
const TEMPLATES_DIR = join(ROOT, "src", "templates");
const PUBLIC_TEMPLATES_DIR = join(ROOT, "public", "templates");
const OUTPUT = join(ROOT, "src", "generated", "design-catalog.json");

const PREVIEW_CANDIDATES = [
  "showcase/desktop-full.webp",
  "showcase/desktop-full.png",
  "showcase/desktop-hero.webp",
  "showcase/desktop-hero.png",
  "preview.webp",
  "hero-bg.webp",
  "hero.webp",
  "hero-1.webp",
  "hero-art.webp",
  "hero-2.webp",
  "preview.png",
];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function findPreview(slug) {
  for (const candidate of PREVIEW_CANDIDATES) {
    if (await exists(join(PUBLIC_TEMPLATES_DIR, slug, candidate))) {
      return `/templates/${slug}/${candidate}`;
    }
  }
  return null;
}

async function main() {
  const directories = await readdir(TEMPLATES_DIR, { withFileTypes: true });
  const catalog = [];
  const missingPreviews = [];

  for (const directory of directories) {
    if (!directory.isDirectory()) continue;

    const manifestPath = join(TEMPLATES_DIR, directory.name, "template.json");
    if (!(await exists(manifestPath))) continue;

    const preview = await findPreview(directory.name);
    if (!preview) {
      missingPreviews.push(directory.name);
      continue;
    }

    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    catalog.push({
      slug: directory.name,
      manifestName: typeof manifest.name === "string" ? manifest.name : "",
      preview,
    });
  }

  catalog.sort((a, b) => a.slug.localeCompare(b.slug));
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  console.log(`Wrote ${catalog.length} design templates to ${OUTPUT}`);
  if (missingPreviews.length > 0) {
    console.warn(`Skipped ${missingPreviews.length} templates without a gallery preview: ${missingPreviews.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
