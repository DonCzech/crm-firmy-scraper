"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Send, Trash2, Download, Loader2, Pencil, Mail, X } from "lucide-react";

export default function InvoiceActions({
  invoiceId,
  status,
  invoiceNumber,
  clientEmail,
}: {
  invoiceId: string;
  status: string;
  invoiceNumber?: string;
  clientEmail?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailTo, setEmailTo] = useState(clientEmail ?? "");
  const [emailNote, setEmailNote] = useState("");
  const [sendError, setSendError] = useState("");

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function downloadPdf() {
    setLoading("pdf");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faktura-${invoiceNumber ?? invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(null);
    }
  }

  async function sendEmail() {
    if (!emailTo) { setSendError("Zadejte e-mailovou adresu"); return; }
    setLoading("email");
    setSendError("");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, note: emailNote || undefined, attachPdf: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSendError(data.error ?? "Odeslání selhalo");
        return;
      }
      setShowSendModal(false);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  const Btn = ({ action, icon: Icon, label, className }: {
    action: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    className: string;
  }) => (
    <button
      onClick={() => updateStatus(action)}
      disabled={loading !== null}
      className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${className}`}
    >
      {loading === action ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  return (
    <>
      <div className="card p-5 space-y-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Akce</h3>

        {(status === "draft" || status === "sent") && (
          <Link
            href={`/dashboard/invoices/${invoiceId}/edit`}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Upravit fakturu
          </Link>
        )}

        {status !== "cancelled" && status !== "paid" && (
          <button
            onClick={() => { setEmailTo(clientEmail ?? ""); setSendError(""); setShowSendModal(true); }}
            disabled={loading !== null}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Odeslat emailem
          </button>
        )}

        {status === "draft" && (
          <Btn action="sent" icon={Send} label="Označit jako odesláno" className="bg-blue-50 text-blue-700 hover:bg-blue-100" />
        )}

        {(status === "sent" || status === "viewed" || status === "overdue") && (
          <Btn action="paid" icon={CheckCircle} label="Označit jako zaplaceno" className="bg-green-50 text-green-700 hover:bg-green-100" />
        )}

        {status !== "cancelled" && status !== "paid" && (
          <Btn action="cancelled" icon={Trash2} label="Stornovat fakturu" className="bg-red-50 text-red-600 hover:bg-red-100" />
        )}

        <button
          onClick={downloadPdf}
          disabled={loading !== null}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          {loading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Stáhnout PDF
        </button>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Odeslat fakturu emailem</h2>
              <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail příjemce *</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="klient@example.cz"
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zpráva (volitelné)</label>
                <textarea
                  value={emailNote}
                  onChange={(e) => setEmailNote(e.target.value)}
                  rows={3}
                  placeholder="Dobrý den, v příloze zasíláme fakturu..."
                  className="input w-full resize-none"
                />
              </div>
              {sendError && <p className="text-sm text-red-600">{sendError}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={sendEmail}
                disabled={loading === "email"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading === "email" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Odeslat s PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
