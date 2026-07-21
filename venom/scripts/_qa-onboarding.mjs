import { chromium } from "playwright-core";

const OUT = "/private/tmp/claude-501/-Users-apple-DEV-CRM/6a63bb57-07f9-43dc-a294-a67cc189c174/scratchpad";
const browser = await chromium.launch({
  executablePath: "/Users/apple/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell",
});
const page = await (await browser.newContext({ viewport: { width: 1500, height: 940 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

await page.goto("http://localhost:3015/cs", { waitUntil: "load", timeout: 90000 });
await page.waitForTimeout(1500);

// Otevřít onboarding modal (hero CTA)
await page.click("text=/Vyzkoušet zdarma/i");
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/qa-1-choice.png` });

// E-shop cesta
await page.click("text=Vybrat šablonu e-shopu");
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/qa-2-eshop-templates.png` });
const eshopCards = await page.locator("div.grid > button").count();
console.log("eshop template cards:", eshopCards);

// Vybrat šablonu → preview sheet → Použít → registrace
await page.locator("div.grid > button").first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/qa-3-preview-sheet.png` });
await page.click("text=Použít →");
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/qa-4-register.png` });

// Zpět na volbu → Web cesta (kategorie + bez eshopů)
await page.click("text=Zpět"); // register -> templates
await page.waitForTimeout(600);
await page.click("text=Zpět"); // templates -> choice
await page.waitForTimeout(700);
await page.click("text=Vybrat šablonu webu");
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/qa-5-web-templates.png` });
const webCards = await page.locator("div.grid > button").count();
console.log("web template cards:", webCards);

// Zpět → dotazník profíků
await page.click("text=Zpět");
await page.waitForTimeout(700);
await page.click("text=Nezávazná poptávka");
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/qa-6-wizard-1.png` });
await page.click("text=Nový e-shop");
await page.waitForTimeout(800);
await page.fill("textarea", "Chceme prodávat ručně šité batohy online, dnes jen Instagram. Web má odbavit platby kartou a působit prémiově.");
await page.screenshot({ path: `${OUT}/qa-7-wizard-2.png` });
await page.click("text=Pokračovat");
await page.waitForTimeout(700);
await page.click("text=50 – 120 tis.");
await page.click("text=Do měsíce");
await page.screenshot({ path: `${OUT}/qa-8-wizard-3.png` });
await page.click("text=Pokračovat");
await page.waitForTimeout(700);
await page.fill('input[placeholder*="Jméno a příjmení"]', "Testovací Poptávka");
await page.fill('input[placeholder*="E-mail"]', "qa-lead@test.cz");
await page.fill('input[placeholder*="Firma"]', "QA s.r.o.");
await page.screenshot({ path: `${OUT}/qa-9-wizard-4.png` });
await page.click("text=Odeslat poptávku");
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/qa-10-sent.png` });

console.log("pageerrors:", errors.length ? errors : "none");
await browser.close();
