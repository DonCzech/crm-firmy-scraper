"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, Trash2, Loader2, Send, Pencil } from "lucide-react";

export default function QuoteActions({
  quoteId, status, convertedInvoiceId,
}: {
  quoteId: string; status: string; convertedInvoiceId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function update(newStatus: string) {
    setLoading(true);
    await fetch(`/api/quotes/${quoteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  async function convertToInvoice() {
    if (!confirm("Vytvořit fakturu z této nabídky?")) return;
    setLoading(true);
    const res = await fetch(`/api/quotes/${quoteId}`, { method: "POST" });
    if (res.ok) {
      const { invoiceId } = await res.json();
      router.push(`/dashboard/invoices/${invoiceId}`);
    }
    setLoading(false);
  }

  async function sendQuote() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/quotes/${quoteId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachPdf: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Nabídku se nepodařilo odeslat");
    }
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Smazat tuto nabídku?")) return;
    setLoading(true);
    await fetch(`/api/quotes/${quoteId}`, { method: "DELETE" });
    router.push("/dashboard/quotes");
  }

  if (convertedInvoiceId) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
      {(status === "draft" || status === "sent") && (
        <Link href={`/dashboard/quotes/${quoteId}/edit`} className="btn-secondary flex items-center gap-2">
          <Pencil className="w-4 h-4" /> Upravit
        </Link>
      )}
      {status === "draft" && (
        <button onClick={sendQuote} disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Odeslat klientovi
        </button>
      )}
      {(status === "sent" || status === "draft") && (
        <>
          <button onClick={() => update("accepted")} disabled={loading}
            className="btn-secondary flex items-center gap-2 text-green-700 hover:text-green-800">
            <CheckCircle className="w-4 h-4" /> Označit jako přijato
          </button>
          <button onClick={() => update("rejected")} disabled={loading}
            className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700">
            <XCircle className="w-4 h-4" /> Odmítnuto
          </button>
        </>
      )}
      {status === "accepted" && (
        <button onClick={convertToInvoice} disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Převést na fakturu
        </button>
      )}
      <button onClick={handleDelete} disabled={loading}
        className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700 ml-auto">
        <Trash2 className="w-4 h-4" /> Smazat
      </button>
      </div>
      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
    </div>
  );
}
