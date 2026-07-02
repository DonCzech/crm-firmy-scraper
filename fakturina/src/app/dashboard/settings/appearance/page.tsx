import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import AppearanceForm from "./AppearanceForm";

export default async function AppearancePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vzhled faktur</h1>
        <p className="text-slate-500 text-sm mt-1">Přizpůsobte vzhled svých faktur — šablona, barva, logo, razítko.</p>
      </div>
      <AppearanceForm
        initial={{
          invoice_template: company.invoice_template ?? "modern",
          invoice_color: company.invoice_color ?? "#4f46e5",
          invoice_spacing: company.invoice_spacing ?? "spacious",
          invoice_footer: company.invoice_footer ?? "",
          logo_url: company.logo_url ?? null,
          stamp_url: company.stamp_url ?? null,
          show_qr_payment: company.show_qr_payment ?? true,
          default_language: company.default_language ?? "cs",
        }}
      />
    </div>
  );
}
