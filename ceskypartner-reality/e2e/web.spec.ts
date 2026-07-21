import { test, expect } from "@playwright/test";

// Happy path veřejného webu. Poptávkové formuláře se interceptují,
// aby testy nezapisovaly do databáze a neposílaly e-maily.

test("výpis kategorie → detail nemovitosti", async ({ page }) => {
  await page.goto("/nabidka/prodej");
  await expect(page.getByRole("heading", { name: "Nemovitosti na prodej" })).toBeVisible();

  const firstCard = page.locator('main a[href^="/nemovitost/"]').first();
  await firstCard.scrollIntoViewIfNeeded();
  const href = await firstCard.getAttribute("href");
  await page.goto(href!);

  // scope do main — MegaMenu/overlaye obsahují skryté duplicity textů
  await expect(page.locator("main").getByText("Exkluzivně").first()).toBeVisible();
  await expect(page.locator("main").getByText("Podrobné informace")).toBeVisible();
  await expect(page.locator("main").getByText("Kontaktujte makléře nemovitosti")).toBeVisible();
});

test("hypoteční kalkulačka počítá a otevře formulář", async ({ page }) => {
  await page.goto("/nemovitost/p1");
  await expect(page.getByText("Spočítejte si splátku hypotéky")).toBeVisible();
  await expect(page.getByText("Měsíční splátka od")).toBeVisible();

  await page.getByRole("button", { name: "Zařídit hypotéku" }).click();
  const dialog = page.getByRole("dialog", { name: "Žádost o financování hypotékou" });
  await expect(dialog.getByText("Nezávazná žádost o nabídku")).toBeVisible();

  // Odeslání s interceptem API
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
  await dialog.locator('input[name="name"]').fill("Test Tester");
  await dialog.locator('input[name="phone"]').fill("777123456");
  await dialog.locator('input[name="email"]').fill("test@example.com");
  await dialog.locator('input[type="checkbox"]').check();
  await dialog.getByRole("button", { name: /Odeslat nezávaznou žádost/ }).click();
  await expect(dialog.getByText("Děkujeme za váš zájem")).toBeVisible();
});

test("poptávka makléři se odešle", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
  await page.goto("/nemovitost/p1");

  const form = page.locator("#kontakt-makler");
  await form.scrollIntoViewIfNeeded();
  await form.locator('input[name="name"]').fill("Test Tester");
  await form.locator('input[name="email"]').fill("test@example.com");
  await form.locator('input[type="checkbox"]').check();
  await form.getByRole("button", { name: /Odeslat poptávku/ }).click();
  await expect(page.getByText("Děkujeme za Váš zájem").first()).toBeVisible();
});

test("oblíbené přežijí reload", async ({ page }) => {
  await page.goto("/nemovitost/p1");
  const main = page.locator("main");
  await main.locator('button[aria-label="Přidat do oblíbených"]').first().click();
  await expect(main.locator('button[aria-label="Odebrat z oblíbených"]').first()).toBeVisible();

  await page.reload();
  await expect(main.locator('button[aria-label="Odebrat z oblíbených"]').first()).toBeVisible();
});

test("odhad ceny — formulář se odešle", async ({ page }) => {
  await page.route("**/api/contact", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
  await page.goto("/odhad-nemovitosti");
  await expect(page.getByRole("heading", { name: /Za kolik prodáte/ })).toBeVisible();
  await page.fill('input[name="location"]', "Praha 5, Smíchov");
  await page.fill('input[name="name"]', "Test Tester");
  await page.fill('input[name="phone"]', "777123456");
  await page.fill('input[name="email"]', "test@example.com");
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole("button", { name: /Chci odhad zdarma/ }).click();
  await expect(page.getByText("Žádost o odhad jsme přijali")).toBeVisible();
});

test("nové stránky se načtou", async ({ page }) => {
  for (const [url, text] of [
    ["/prodano", "Úspěšně prodáno a pronajato"],
    ["/makleri", "Makléři, kteří znají"],
    ["/en", "Exceptional property across the Czech Republic"],
    ["/nemovitosti/prodej-bytu-praha", "Prodej bytů v Praze"],
    ["/ochrana-osobnich-udaju", "Zásady zpracování osobních údajů"],
  ] as const) {
    await page.goto(url);
    await expect(page.getByText(text).first()).toBeVisible();
  }
});

test("anglická homepage je kompletně lokalizovaná", async ({ page }) => {
  await page.goto("/en");

  await expect(page.getByRole("heading", { name: /Český Partner/ })).toBeVisible();
  await expect(page.getByText("Selected properties", { exact: true })).toBeVisible();
  await expect(page.getByText("Expertise at every stage", { exact: true })).toBeVisible();
  await expect(page.getByText("The finest new listings, in your inbox", { exact: true })).toBeVisible();
  await expect(page.getByText("All rights reserved.", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: "Explore our properties" }).click();
  const search = page.getByRole("dialog", { name: "Property search" });
  await expect(search.getByText("Find a property", { exact: true })).toBeVisible();
  await expect(search.getByText("Listing type", { exact: true })).toBeVisible();
  await expect(search.getByRole("button", { name: "For sale", exact: true })).toBeVisible();
});

test("hlídací pes v kategorii", async ({ page }) => {
  await page.route("**/api/demand", (route) =>
    route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) })
  );
  await page.goto("/nabidka/pronajem");
  const watchdog = page.getByText("Hlídací pes").first();
  await watchdog.scrollIntoViewIfNeeded();
  await page.fill('input[name="email"]', "test@example.com");
  await page.getByRole("button", { name: /Aktivovat hlídání/ }).click();
  await expect(page.getByText("Hlídací pes je aktivní")).toBeVisible();
});
