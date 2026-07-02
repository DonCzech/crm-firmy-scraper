const labels: Record<string, string> = {
  draft: "Koncept",
  sent: "Odesláno",
  viewed: "Zobrazeno",
  paid: "Zaplaceno",
  overdue: "Po splatnosti",
  cancelled: "Stornováno",
};

export default function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge-${status}`}>{labels[status] ?? status}</span>
  );
}
