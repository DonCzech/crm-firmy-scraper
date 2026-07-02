import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import NumberingForm from "./NumberingForm";

export default async function NumberingPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Číslování faktur</h1>
        <p className="text-slate-500 text-sm mt-1">Nastavte formát čísel faktur podle svých potřeb.</p>
      </div>
      <NumberingForm
        initial={{
          invoice_prefix: company.invoice_prefix ?? "",
          invoice_number_year_format: company.invoice_number_year_format ?? "full",
          invoice_number_month: company.invoice_number_month ?? false,
          invoice_number_position: company.invoice_number_position ?? "end",
          invoice_number_volume: company.invoice_number_volume ?? 10000,
          invoice_number_separator: company.invoice_number_separator ?? "-",
          invoice_next: company.invoice_next ?? 1,
        }}
      />
    </div>
  );
}
