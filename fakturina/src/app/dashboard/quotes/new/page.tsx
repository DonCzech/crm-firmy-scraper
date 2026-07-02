import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import QuoteForm from "@/components/QuoteForm";

export default async function NewQuotePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: clients } = await query(
    "SELECT id, name, ico, dic, email, address, city, zip, country FROM fak_clients WHERE company_id = $1 AND archived = false ORDER BY name",
    [company.id]
  );

  const today = new Date().toISOString().split("T")[0];
  const validUntil = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nová nabídka</h1>
        <p className="text-slate-500 text-sm mt-1">Sestavte cenovou nabídku pro klienta.</p>
      </div>
      <QuoteForm
        company={company}
        clients={clients}
        defaultIssueDate={today}
        defaultValidUntil={validUntil}
      />
    </div>
  );
}
