"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Přihlášení selhalo.");
      return;
    }

    const next = searchParams.get("next");
    window.location.href = next && next.startsWith("/") ? next : "/admin/dashboard";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080810] flex items-center justify-center px-4">
      {/* Background glow blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: 600,
          height: 300,
          background:
            "radial-gradient(ellipse 100% 100% at 50% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[400px] rounded-3xl border border-white/10 p-10"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(24px)",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06) inset, 0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.08)",
        }}
      >
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-5 flex items-center gap-3">
            <svg width="44" height="44" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 6px 20px rgba(99,102,241,0.5))" }}>
              <rect width="30" height="30" rx="8" fill="url(#wm-login-grad)" />
              <path d="M7 9.5L10.8 20.5L15 12.5L19.2 20.5L23 9.5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <defs>
                <linearGradient id="wm-login-grad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-[26px] font-bold tracking-[-0.025em] text-white">Webero</span>
          </div>
          <h1 className="text-[15px] font-medium tracking-[-0.01em] text-white/45">
            Admin přístup
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/45">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="vas@email.cz"
              className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-[14.5px] text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-indigo-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-white/45">
              Heslo
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-3 pr-12 text-[14.5px] text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-indigo-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
                tabIndex={-1}
              >
                {showPw ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[13px] text-red-400">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="group relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-[14.5px] font-semibold text-white outline-none transition-all duration-300 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
            }}
          >
            <span className="relative z-10">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Přihlašuji…
                </span>
              ) : "Přihlásit se"}
            </span>
            <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
          </button>
        </form>

        <p className="mt-8 text-center text-[12px] text-white/30">
          <a href="/" className="text-indigo-400/80 transition hover:text-indigo-300">
            ← Zpět na web
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
