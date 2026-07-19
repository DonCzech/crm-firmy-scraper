'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    slug: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setForm((prev) => ({ ...prev, name: value, slug }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Hesla se neshodují')
      return
    }
    if (form.password.length < 8) {
      setError('Heslo musí mít alespoň 8 znaků')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          slug: form.slug,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrace selhala')
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
            Začněte přijímat<br />
            <span className="text-accent-400 italic">rezervace dnes.</span>
          </h2>
          <p className="text-cream/50 mt-6 max-w-sm leading-relaxed">
            Vlastní rezervační stránka během dvou minut. Žádné poplatky za start, žádná karta.
          </p>
        </div>

        <p className="text-[11px] text-cream/30 tracking-[0.2em] uppercase relative">
          Online rezervační systém pro profesionály
        </p>
      </div>

      {/* Formulář */}
      <div className="min-h-screen lg:min-h-0 flex items-center justify-center p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobilní logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 bg-ink-900 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-display text-lg text-ink-900">Rezervace</span>
          </div>

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-2">Zdarma na start</p>
            <h1 className="font-display text-4xl text-ink-900">Vytvořit účet</h1>
            <p className="text-ink-400 mt-2 text-sm">Začněte přijímat rezervace ještě dnes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Celé jméno</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Jan Novák"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">E-mailová adresa</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="jan@email.cz"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                URL adresa rezervační stránky
              </label>
              <div className="flex rounded-xl border border-ink-900/15 overflow-hidden focus-within:ring-2 focus-within:ring-ink-900 focus-within:border-transparent bg-cream">
                <span className="px-3 py-3 bg-ink-900/5 text-ink-400 text-sm border-r border-ink-900/10 whitespace-nowrap">
                  /book/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="flex-1 px-3 py-3 text-sm focus:outline-none bg-cream"
                  placeholder="jan-novak"
                  required
                  pattern="[a-z0-9-]+"
                />
              </div>
              <p className="text-xs text-ink-400 mt-1">Pouze malá písmena, čísla a pomlčky</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Heslo</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Min. 8 znaků"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">Potvrdit heslo</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="Zopakujte heslo"
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
                  Vytvářím účet...
                </>
              ) : 'Vytvořit účet'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-8">
            Již máte účet?{' '}
            <Link href="/login" className="text-ink-900 hover:text-accent-600 font-semibold underline underline-offset-4 decoration-accent-400 transition-colors">
              Přihlaste se
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
