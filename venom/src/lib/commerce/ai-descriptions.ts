import { query, queryOne } from "@/lib/db";
import { initCommerceDb } from "./schema";
import { sanitizeRichHtml } from "./html";

interface ProductContext {
  title: string;
  brand: string | null;
  category: string | null;
  params: Array<{ name: string; value: string; unit?: string }>;
  price: string;
  existing_description?: string;
}

function buildPrompt(ctx: ProductContext, type: "description" | "seo_title" | "seo_description" | "short"): string {
  const parts = [`Produkt: ${ctx.title}`];
  if (ctx.brand) parts.push(`Značka: ${ctx.brand}`);
  if (ctx.category) parts.push(`Kategorie: ${ctx.category}`);
  if (ctx.params.length) {
    parts.push("Parametry:");
    ctx.params.forEach((p) => parts.push(`  ${p.name}: ${p.value}${p.unit ? ` ${p.unit}` : ""}`));
  }
  parts.push(`Cena: ${ctx.price}`);

  const productInfo = parts.join("\n");

  switch (type) {
    case "description":
      return `Jsi expert na e-commerce copywriting pro český trh. Napiš prodejní popis produktu v češtině.

${productInfo}

Pravidla:
- Struktura jako popis na Alza.cz: úvodní odstavec, poté 2–3 tematické sekce s nadpisy, klíčové vlastnosti v odrážkách
- Celkem 200–400 slov
- Začni výstižným úvodem, který zaujme
- Zdůrazni klíčové vlastnosti a přínosy pro zákazníka
- Použij přirozený, přesvědčivý styl bez přehnaných superlativů
- Zahrň relevantní parametry přirozeně do textu
- Formát: čistý HTML — povolené tagy h2, h3, p, ul/li, strong; žádné inline styly, žádný h1, žádné code fence
${ctx.existing_description ? `\nStávající popis (vylepši, neopisuj): ${ctx.existing_description.slice(0, 500)}` : ""}`;

    case "seo_title":
      return `Napiš SEO title tag pro tento produkt. Max 60 znaků, česky. Obsahuj název produktu a klíčovou vlastnost.

${productInfo}

Odpověz POUZE textem title tagu, nic jiného.`;

    case "seo_description":
      return `Napiš SEO meta description pro tento produkt. Max 155 znaků, česky. Měl by motivovat ke kliknutí.

${productInfo}

Odpověz POUZE textem meta description, nic jiného.`;

    case "short":
      return `Napiš krátký podtitulek produktu (1 věta, max 120 znaků, česky). Měl by vystihnout hlavní benefit.

${productInfo}

Odpověz POUZE textem podtitulku, nic jiného.`;
  }
}

export async function generateProductDescription(
  tenantId: number,
  productId: number,
  type: "description" | "seo_title" | "seo_description" | "short" = "description"
): Promise<string> {
  await initCommerceDb();

  const product = await queryOne<{
    title: string; brand: string | null; description: string | null;
    primary_category_id: number | null;
  }>(
    `SELECT title, brand, description, primary_category_id FROM products WHERE id = $1 AND tenant_id = $2`,
    [productId, tenantId]
  );
  if (!product) throw new Error("Produkt nenalezen");

  let categoryName: string | null = null;
  if (product.primary_category_id) {
    const cat = await queryOne<{ name: string }>(
      `SELECT name FROM product_categories WHERE id = $1`, [product.primary_category_id]
    );
    categoryName = cat?.name ?? null;
  }

  const variant = await queryOne<{ price_cents: number }>(
    `SELECT price_cents FROM product_variants WHERE product_id = $1 AND tenant_id = $2 AND is_default = true LIMIT 1`,
    [productId, tenantId]
  );

  const params = await query<{ name: string; value: string; unit: string | null }>(
    `SELECT pd.name, pp.value, pd.unit
     FROM commerce_product_params pp
     JOIN commerce_param_definitions pd ON pd.id = pp.param_id
     WHERE pp.product_id = $1 AND pp.tenant_id = $2
     ORDER BY pd.position`,
    [productId, tenantId]
  ) ?? [];

  const ctx: ProductContext = {
    title: product.title,
    brand: product.brand,
    category: categoryName,
    params: params.map((p) => ({ name: p.name, value: p.value, unit: p.unit ?? undefined })),
    price: variant ? `${(variant.price_cents / 100).toFixed(0)} Kč` : "neuvedena",
    existing_description: type === "description" ? product.description ?? undefined : undefined,
  };

  const prompt = buildPrompt(ctx, type);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY není nastavena");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: type === "description" ? 1024 : 256,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`AI generování selhalo: ${(err as { error?: { message?: string } }).error?.message ?? res.status}`);
  }

  const data = await res.json() as { content: Array<{ text: string }> };
  const text = data.content[0]?.text?.trim() ?? "";
  if (type === "description") {
    // model občas obalí výstup do code fence; HTML vždy prožene whitelistem
    return sanitizeRichHtml(text.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, ""));
  }
  return text;
}

export async function generateBulkDescriptions(
  tenantId: number,
  productIds: number[],
  type: "description" | "seo_title" | "seo_description" | "short" = "description"
): Promise<Array<{ productId: number; text: string; error?: string }>> {
  const results: Array<{ productId: number; text: string; error?: string }> = [];
  for (const id of productIds) {
    try {
      const text = await generateProductDescription(tenantId, id, type);
      results.push({ productId: id, text });
    } catch (e) {
      results.push({ productId: id, text: "", error: e instanceof Error ? e.message : "Chyba" });
    }
  }
  return results;
}

export async function saveGeneratedDescription(
  tenantId: number,
  productId: number,
  field: "description" | "subtitle" | "seo_title" | "seo_description",
  value: string
) {
  await initCommerceDb();
  const clean = field === "description" ? sanitizeRichHtml(value) : value;
  await query(
    `UPDATE products SET ${field} = $1, updated_at = now() WHERE id = $2 AND tenant_id = $3`,
    [clean, productId, tenantId]
  );
}
