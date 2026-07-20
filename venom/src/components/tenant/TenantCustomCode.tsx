import { getTenantCustomCode } from "@/lib/custom-code";

/**
 * Server komponenta — vloží tenantův vlastní kód (admin → Nastavení → Vlastní kód)
 * do veřejné stránky. Vkládá se POUZE na veřejné stránky (web, podstránky,
 * /obchod, blog) — nikdy do admin/studio/login.
 *
 * placement="head"     → CSS + hlavičkové HTML (analytika, pixely, fonty).
 *                        Rendruje se na začátku body — skripty/styly fungují
 *                        stejně jako v <head>, jen meta tagy sem nepatří.
 * placement="body-end" → HTML/JS před koncem stránky (chat widgety, patičkové
 *                        skripty) + pole "JavaScript".
 */
export async function TenantCustomCode({
  tenantId,
  placement,
}: {
  tenantId: number;
  placement: "head" | "body-end";
}) {
  const code = await getTenantCustomCode(tenantId);
  if (!code || code.enabled === false) return null;

  if (placement === "head") {
    const hasCss = code.custom_css.trim().length > 0;
    const hasHtml = code.head_html.trim().length > 0;
    if (!hasCss && !hasHtml) return null;
    return (
      <>
        {hasCss && (
          <style
            data-webero-custom="css"
            dangerouslySetInnerHTML={{ __html: code.custom_css }}
          />
        )}
        {hasHtml && (
          <div
            data-webero-custom="head"
            style={{ display: "contents" }}
            dangerouslySetInnerHTML={{ __html: code.head_html }}
          />
        )}
      </>
    );
  }

  const hasHtml = code.body_end_html.trim().length > 0;
  const hasJs = code.custom_js.trim().length > 0;
  if (!hasHtml && !hasJs) return null;
  return (
    <>
      {hasHtml && (
        <div
          data-webero-custom="body-end"
          style={{ display: "contents" }}
          dangerouslySetInnerHTML={{ __html: code.body_end_html }}
        />
      )}
      {hasJs && (
        <script
          data-webero-custom="js"
          dangerouslySetInnerHTML={{ __html: code.custom_js }}
        />
      )}
    </>
  );
}
