import { redirect } from "next/navigation";
import { getSession, getUserCompany } from "@/lib/auth";
import ExpenseForm from "@/components/ExpenseForm";

export default async function NewExpensePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nový náklad</h1>
        <p className="text-slate-500 text-sm mt-1">Evidujte přijatou fakturu od dodavatele.</p>
      </div>
      <ExpenseForm
        company={company}
        defaultIssueDate={today}
        defaultDueDate={due}
      />
    </div>
  );
}
