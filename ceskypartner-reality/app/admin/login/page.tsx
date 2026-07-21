"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.error) {
      setError("Nespravny e-mail nebo heslo");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/40">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@ceskypartner.cz"
          className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-[14px] text-paper outline-none transition-colors placeholder:text-white/25 focus:border-bronze/60 focus:bg-white/8"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/40">
          Heslo
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={"........"}
          className="h-12 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-[14px] text-paper outline-none transition-colors placeholder:text-white/25 focus:border-bronze/60 focus:bg-white/8"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-bronze text-[13px] font-semibold uppercase tracking-[0.12em] text-paper transition-all duration-300 hover:bg-bronze-deep disabled:opacity-50"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
        ) : (
          <>
            Prihlasit se
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-bronze text-[18px] font-semibold text-paper">
            CP
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-paper">
            Cesky Partner
          </h1>
          <p className="mt-1 text-[13px] text-white/45">Administrace realitni kancelare</p>
        </div>

        <Suspense fallback={<div className="h-64" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-8 text-center text-[11px] text-white/25">
          <Lock size={10} className="mr-1 inline" />
          Chranena sekce - pristup pouze pro opravnene uzivatele
        </p>
      </div>
    </div>
  );
}
