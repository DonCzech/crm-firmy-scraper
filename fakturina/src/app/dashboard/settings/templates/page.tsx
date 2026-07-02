import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import TemplatesManager from "./TemplatesManager";

export default async function TemplatesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: templates } = await query(
    `SELECT t.*,
       COALESCE(json_agg(ti ORDER BY ti.sort_order) FILTER (WHERE ti.id IS NOT NULL), '[]') as items
     FROM fak_invoice_templates t
     LEFT JOIN fak_invoice_template_items ti ON ti.template_id = t.id
     WHERE t.company_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [company.id]
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Šablony faktur</h1>
        <p className="text-slate-500 text-sm mt-1">
          Uložte opakovaně používané faktury jako šablony pro rychlé vystavení.
        </p>
      </div>
      <TemplatesManager initialTemplates={templates} />
    </div>
  );
}
