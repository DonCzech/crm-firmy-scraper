import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import RecurringInvoiceForm from "@/components/RecurringInvoiceForm";

export default async function NewRecurringInvoicePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard/settings/company");

  const { rows: clients } = await query(
    "SELECT id, name FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name ASC",
    [company.id]
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/invoices/recurring" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nová pravidelná faktura</h1>
      </div>
      <RecurringInvoiceForm company={company} clients={clients} />
    </div>
  );
}
