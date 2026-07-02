"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";

export default function ExpenseActions({ expenseId, status }: { expenseId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStatus: string) {
    setLoading(true);
    await fetch(`/api/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Opravdu smazat tento náklad?")) return;
    setLoading(true);
    await fetch(`/api/expenses/${expenseId}`, { method: "DELETE" });
    router.push("/dashboard/expenses");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "paid" && status !== "cancelled" && (
        <button
          onClick={() => update("paid")}
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Označit jako zaplaceno
        </button>
      )}
      {status !== "cancelled" && (
        <button
          onClick={() => update("cancelled")}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" /> Stornovat
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700 ml-auto"
      >
        <Trash2 className="w-4 h-4" /> Smazat
      </button>
    </div>
  );
}
