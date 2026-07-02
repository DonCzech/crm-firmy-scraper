import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession, getUserCompany } from "@/lib/auth";
import { query } from "@/lib/db";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import ExpenseActions from "./ExpenseActions";

function fmt(n: number, currency = "CZK") {
  return new Intl.NumberFormat("cs-CZ", { style: "currency", currency, minimumFractionDigits: 2 }).format(n);
}

const STATUS_LABELS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  unpaid: { label: "Nezaplaceno", cls: "text-amber-600 bg-amber-50", icon: <Clock className="w-4 h-4" /> },
  paid: { label: "Zaplaceno", cls: "text-green-600 bg-green-50", icon: <CheckCircle className="w-4 h-4" /> },
  overdue: { label: "Po splatnosti", cls: "text-red-600 bg-red-50", icon: <Clock className="w-4 h-4" /> },
  cancelled: { label: "Stornováno", cls: "text-slate-500 bg-slate-50", icon: <XCircle className="w-4 h-4" /> },
};

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");
  const company = await getUserCompany(user.id);
  if (!company) redirect("/dashboard");

  const { rows: [expense] } = await query(
    "SELECT * FROM fak_expenses WHERE id = $1 AND company_id = $2",
    [id, company.id]
  );
  if (!expense) notFound();

  const { rows: items } = await query(
    "SELECT * FROM fak_expense_items WHERE expense_id = $1 ORDER BY sort_order",
    [id]
  );

  const st = STATUS_LABELS[expense.status] ?? { label: expense.status, cls: "text-slate-600 bg-slate-50", icon: null };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{expense.supplier_name ?? "Náklad"}</h1>
          <p className="text-slate-500 text-sm">{expense.number ?? "bez čísla"}</p>
        </div>
        <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${st.cls}`}>
          {st.icon} {st.label}
        </div>
      </div>

      <ExpenseActions expenseId={expense.id} status={expense.status} />

      <div className="card p-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Dodavatel</div>
          <div className="font-medium text-slate-900">{expense.supplier_name ?? "—"}</div>
          {expense.supplier_ico && <div className="text-sm text-slate-500">IČO: {expense.supplier_ico}</div>}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Platba</div>
          <div className="text-sm text-slate-700">Vystaveno: {expense.issue_date}</div>
          <div className="text-sm text-slate-700">Splatnost: {expense.due_date}</div>
          {expense.variable_symbol && <div className="text-sm text-slate-500">VS: {expense.variable_symbol}</div>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Položka</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Množství</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cena/ks</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">DPH</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Celkem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-3 text-slate-700">{item.name}</td>
                <td className="px-4 py-3 text-right text-slate-500">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3 text-right text-slate-500">{fmt(parseFloat(item.unit_price), expense.currency)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{item.vat_rate} %</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">{fmt(parseFloat(item.total_with_vat), expense.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200">
            <tr>
              <td colSpan={4} className="px-6 py-3 font-bold text-slate-900">CELKEM</td>
              <td className="px-6 py-3 text-right font-bold text-xl text-indigo-700">
                {fmt(parseFloat(expense.total), expense.currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {expense.note && (
        <div className="card p-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Poznámka</div>
          <p className="text-sm text-slate-600">{expense.note}</p>
        </div>
      )}
    </div>
  );
}
