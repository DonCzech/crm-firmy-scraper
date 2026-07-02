import ClientForm from "@/components/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nový klient</h1>
      <ClientForm />
    </div>
  );
}
