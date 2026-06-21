/**
 * Audit notes generator — turns scan + auto-fix results into a structured
 * human-readable markdown report for the admin review queue UI.
 *
 * Three sections:
 *   ✓ Hotovo Claude        — what auto-fix accomplished
 *   ⚠ Pro tebe (10%)        — what the human reviewer must do
 *   📝 Doporučení           — context-specific hints based on residue/perf findings
 */
import type { AutoFixSummary } from "./auto-fix";

export interface ScanResult {
  residueDisk: number;
  residueRender: number;
  perfScore: number | null;
  perfIssues: string[];
  hasH1: boolean;
  hasDescription: boolean;
  jsonLdCount: number;
  imgCount: number;
  lazyImgCount: number;
  bytesKb: number;
  elapsedMs: number;
}

export interface AuditNotes {
  done: string[];
  todo: string[];
  hints: string[];
  generatedAt: string;
}

export function buildAuditNotes(fix: AutoFixSummary | null, scan: ScanResult): AuditNotes {
  const done: string[] = [];
  const todo: string[] = [];
  const hints: string[] = [];

  // ── ✓ Hotovo ───────────────────────────────────────────────────────────────
  if (fix) {
    const s = fix.steps;
    if (s.cleanedLocalUrls > 0) {
      done.push(`Přepsáno ${s.cleanedLocalUrls} interních cest \`/clones/.../wp-content/...\` → \`/assets/${fix.key}/...\``);
    }
    if (s.downloadedExternalAssets > 0) {
      done.push(`Staženo ${s.downloadedExternalAssets} externích assetů (CDN) do \`/assets/${fix.key}/\``);
    }
    if (s.reseed.updated) {
      done.push(`Šablona přeseedlá do \`template_versions\` (změny v content / skin se propíšou všem v2 tenantům).`);
    } else if (s.reseed.skipped) {
      done.push(`Šablona je v DB aktuální (checksum match) — žádný reseed nepotřeba.`);
    }
    if (s.clearedStaleOverrides > 0) {
      done.push(`Vyčištěno ${s.clearedStaleOverrides} starých overrides s reziduemi z legacy migrace.`);
    }
    if (s.skippedExternal.length > 0) {
      hints.push(`${s.skippedExternal.length} externích URL nešlo stáhnout (HTTP error) — zvaž zda jsou v šabloně potřeba.`);
    }
    if (s.missingSourceFiles.length > 0) {
      todo.push(`${s.missingSourceFiles.length} interních souborů chybí na disku — nahraď obrázky (např. \`${s.missingSourceFiles[0].slice(0, 60)}...\`)`);
    }
  }

  if (scan.residueDisk === 0 && scan.residueRender === 0) {
    done.push("Rezidua: 0 (disk i render čistý).");
  } else {
    if (scan.residueRender > 0) {
      todo.push(`V renderu ${scan.residueRender} reziduí — některé v2 tenanti mají v overrides starou URL. Spusť 'Auto-fix' znovu.`);
    }
    if (scan.residueDisk > 0) {
      todo.push(`V kódu šablony ${scan.residueDisk} reziduí — manuálně zkontroluj (nezachytí ani auto-fix).`);
    }
  }

  // ── ⚠ Pro tebe ────────────────────────────────────────────────────────────
  todo.push("Obrázky: projdi sekci po sekci a vyměň cokoli, co je viditelně z původního referenčního webu (loga, foto interiérů, portréty).");

  if (!scan.hasH1) {
    todo.push("Šablona nemá `<h1>` — přidej do hero sekce hlavní nadpis.");
  }
  if (!scan.hasDescription) {
    todo.push("Chybí `<meta description>` — vyplň v Brand panelu slot `seo.defaultDescription`.");
  }
  if (scan.jsonLdCount === 0) {
    todo.push("Chybí JSON-LD structured data — zkontroluj že tenant má vyplněný `brand.name` a `contact.phone/email`.");
  }
  if (scan.imgCount > 0 && scan.lazyImgCount / Math.max(1, scan.imgCount - 2) < 0.7) {
    todo.push(`Lazy loading: ${scan.lazyImgCount}/${scan.imgCount} obrázků má \`loading="lazy"\` — sekce galerie/služeb by měly přidat.`);
  }

  // ── 📝 Doporučení ─────────────────────────────────────────────────────────
  if (scan.perfScore !== null) {
    if (scan.perfScore >= 90) {
      hints.push(`Perf score **${scan.perfScore}/100** — výborné, mobile bude rychlý.`);
    } else if (scan.perfScore >= 70) {
      hints.push(`Perf score **${scan.perfScore}/100** — solidní, ale dolad ještě pár drobností:`);
      for (const issue of scan.perfIssues.slice(0, 3)) hints.push(`  · ${issue}`);
    } else {
      hints.push(`Perf score **${scan.perfScore}/100** — nutné optimalizovat. Hlavní problémy:`);
      for (const issue of scan.perfIssues.slice(0, 5)) hints.push(`  · ${issue}`);
    }
  }
  if (scan.bytesKb > 120) {
    hints.push(`HTML váží **${scan.bytesKb} KB** — zvaž zda všechny sekce jsou nutné na úvodní stránce (cíl: pod 120 KB).`);
  }
  if (scan.elapsedMs > 1000) {
    hints.push(`Response time **${scan.elapsedMs}ms** — bude lepší až tenant prohřejeme přes cache (cron warmup-renders to dělá hourly).`);
  }

  hints.push("Studio: ověř že kliknutím na sekce se otevírá Inspector s editovatelnými poli.");
  hints.push("Studio: vyzkoušej drag&drop sekcí (↑↓ tlačítka), vypnout/zapnout viditelnost.");

  return {
    done,
    todo,
    hints,
    generatedAt: new Date().toISOString(),
  };
}
