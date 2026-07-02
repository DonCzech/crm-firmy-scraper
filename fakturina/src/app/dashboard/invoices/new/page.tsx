import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import InvoiceForm from "@/components/InvoiceForm";

export default async function NewInvoicePage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client: defaultClientId } = await searchParams;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const { rows: clients } = await query(
    "SELECT id, name, ico, dic, address, city, zip, country, email FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name ASC",
    [company.id]
  );

  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date(Date.now() + company.default_due_days * 86400000).toISOString().split("T")[0];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nová faktura</h1>
      <InvoiceForm
        company={company}
        clients={clients}
        defaultClientId={defaultClientId}
        defaultIssueDate={today}
        defaultDueDate={dueDate}
      />
    </div>
  );
}
