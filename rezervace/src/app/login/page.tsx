'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  function handleDemoFill() {
    setEmail('test@test.cz')
    setPassword('heslo123')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Přihlášení selhalo')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Nastala chyba. Zkuste to prosím znovu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-2">
      {/* Levý brand panel */}
      <div className="hidden lg:flex relative bg-ink-900 text-cream flex-col justify-between p-12 overflow-hidden grain">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-80 h-80 rounded-full bg-sage-500/15 blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-display text-xl">Rezervace</span>
        </div>

        <div className="relative">
          <h2 className="font-display text-5xl xl:text-6xl leading-[1.05]">
            Váš čas.<br />
            <span className="text-accent-400 italic">Vaše pravidla.</span>
          </h2>
          <p className="text-cream/50 mt-6 max-w-sm leading-relaxed">
            Rezervační systém, který pracuje za vás — 24 hodin denně, 7 dní v týdnu.
          </p>
        </div>

        <p className="text-[11px] text-cream/30 tracking-[0.2em] uppercase relative">
          Online rezervační systém pro profesionály
        </p>
      </div>

      {/* Formulář */}
      <div className="min-h-screen lg:min-h-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobilní logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 bg-ink-900 rounded-xl flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-cream w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-display text-lg text-ink-900">Rezervace</span>
          </div>

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-2">Vítejte zpět</p>
            <h1 className="font-display text-4xl text-ink-900">Přihlášení</h1>
            <p className="text-ink-400 mt-2 text-sm">Přihlaste se do svého účtu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">E-mailová adresa</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="vas@email.cz"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Přihlašuji...
                </>
              ) : 'Přihlásit se'}
            </button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-900/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-paper text-xs text-ink-400">nebo</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoFill}
              className="w-full py-3 px-4 rounded-full border-2 border-dashed border-accent-300 text-accent-700 text-sm font-semibold hover:bg-accent-50 hover:border-accent-400 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vyzkoušet demo
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-8">
            Nemáte účet?{' '}
            <Link href="/register" className="text-ink-900 hover:text-accent-600 font-semibold underline underline-offset-4 decoration-accent-400 transition-colors">
              Zaregistrujte se
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
