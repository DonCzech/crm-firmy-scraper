"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Chyba při přihlášení");
        return;
      }

      router.push(mode === "register" ? "/dashboard/settings/company" : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-7 space-y-4">
      {error && (
        <div role="alert" aria-live="polite" className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {mode === "register" && (
        <div>
          <label className="label">Jméno</label>
          <input
            className="input"
            value={form.name}
            onChange={set("name")}
            required
            placeholder="Jan Novák"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <label className="label">E-mail</label>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={set("email")}
          required
          placeholder="vas@email.cz"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="label">Heslo</label>
        <div className="relative">
          <input
            className="input pr-10"
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            required
            minLength={mode === "register" ? 12 : 1}
            placeholder={mode === "register" ? "Min. 12 znaků" : "Vaše heslo"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPass ? "Skrýt heslo" : "Zobrazit heslo"}
            aria-pressed={showPass}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {mode === "login" ? "Přihlásit se" : "Vytvořit účet"}
      </button>
    </form>
  );
}
