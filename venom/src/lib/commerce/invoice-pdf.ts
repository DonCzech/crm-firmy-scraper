import * as fs from "fs";

// Fallback na systémový Chrome, když Playwright nemá stažené vlastní Chromium
const SYSTEM_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
];

const LAUNCH_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];

/**
 * Vyrenderuje HTML dokladu do PDF (reálná A4 — respektuje @page pravidla
 * a print CSS z renderInvoiceHtml). Vrací null, když není k dispozici
 * Chromium ani systémový Chrome.
 */
export async function renderInvoicePdf(html: string): Promise<Buffer | null> {
  const playwrightCore = await import("playwright-core").catch(() => null);
  if (!playwrightCore) return null;
  const { chromium } = playwrightCore;

  let browser;
  try {
    // Nejdřív Chromium z Playwright cache (ms-playwright)
    browser = await chromium.launch({ args: LAUNCH_ARGS });
  } catch {
    const executablePath = SYSTEM_CHROME_PATHS.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });
    if (!executablePath) return null;
    browser = await chromium.launch({ executablePath, args: LAUNCH_ARGS });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle", timeout: 15000 });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
