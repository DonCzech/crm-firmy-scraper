import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { Zap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">Fakturina</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Registrace</h1>
          <p className="text-slate-500 text-sm mt-1">Vytvořte si bezplatný účet</p>
        </div>
        <AuthForm mode="register" />
        <p className="text-center text-sm text-slate-500 mt-6">
          Máte již účet?{" "}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Přihlásit se
          </Link>
        </p>
      </div>
    </div>
  );
}
