import * as fs from "fs";
import * as path from "path";

export interface ScreenshotResult {
  desktop: string | null;
  mobile: string | null;
  error?: string;
}

export async function captureScreenshots(
  url: string,
  outputDir: string
): Promise<ScreenshotResult> {
  try {
    // Try to find chromium/chrome
    const chromiumPaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      "/usr/bin/google-chrome",
      "/usr/bin/chromium-browser",
    ];

    const executablePath = chromiumPaths.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    });

    if (!executablePath) {
      return {
        desktop: null,
        mobile: null,
        error: "Chrome/Chromium not found",
      };
    }

    // Dynamic import to avoid build-time issues
    const playwrightCore = await import("playwright-core").catch(() => null);
    if (!playwrightCore) {
      return { desktop: null, mobile: null, error: "playwright-core not available" };
    }

    const { chromium } = playwrightCore;

    fs.mkdirSync(outputDir, { recursive: true });

    const browser = await chromium.launch({
      executablePath,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const desktopPath = path.join(outputDir, "desktop.png");
    const mobilePath = path.join(outputDir, "mobile.png");

    // Desktop
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await desktopPage.waitForTimeout(2000);
    await desktopPage.screenshot({ path: desktopPath, fullPage: true });
    await desktopCtx.close();

    // Mobile
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await mobilePage.waitForTimeout(1000);
    await mobilePage.screenshot({ path: mobilePath, fullPage: true });
    await mobileCtx.close();

    await browser.close();

    return {
      desktop: desktopPath,
      mobile: mobilePath,
    };
  } catch (err) {
    console.error("[screenshot] Error:", err);
    return {
      desktop: null,
      mobile: null,
      error: String(err),
    };
  }
}
