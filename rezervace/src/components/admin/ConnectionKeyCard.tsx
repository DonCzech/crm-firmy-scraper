'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * Párovací klíč pro propojení vlastního webu s tímto rezervačním účtem.
 *
 * Klíč nahrazuje dřívější ruční opisování veřejného slugu — ten mohl do svého
 * webu napsat kdokoli a připojit se tak na cizí kalendář. Klíč zná jen majitel
 * účtu, web ho ověří serverově a do stránky se pak ukládá zase jen veřejný slug.
 */
export function ConnectionKeyCard() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetch('/api/connect/key')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load'))))
      .then((d) => setKey(d.key ?? ''))
      .catch(() => setError('Klíč se nepodařilo načíst'))
      .finally(() => setLoading(false))
  }, [])

  async function regenerate() {
    if (!confirm('Vygenerovat nový klíč? Weby propojené starým klíčem zůstanou funkční, ale pro další propojení už starý klíč nepůjde použít.')) return
    setRegenerating(true)
    setError('')
    try {
      const res = await fetch('/api/connect/key', { method: 'POST' })
      if (!res.ok) throw new Error('regen')
      const d = await res.json()
      setKey(d.key)
      setRevealed(true)
    } catch {
      setError('Nový klíč se nepodařilo vygenerovat')
    } finally {
      setRegenerating(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Kopírování se nezdařilo — klíč označte a zkopírujte ručně')
    }
  }

  const masked = key ? `${key.slice(0, 6)}${'•'.repeat(24)}` : ''

  return (
    <div className="card p-4 sm:p-6 mt-6 min-w-0">
      <h2 className="text-lg font-semibold text-ink-900 mb-1">Propojení webu</h2>
      <p className="text-sm text-ink-400 mb-6">
        Tímto klíčem propojíte svůj web s rezervacemi. Vložte ho v administraci webu
        do sekce <span className="text-ink-600">Moduly → Rezervace</span>. Klíč se
        nikdy nezobrazí návštěvníkům — web si jím jen ověří, že účet patří vám.
      </p>

      {loading ? (
        <p className="text-sm text-ink-400">Načítám…</p>
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center max-w-xl">
            <input
              readOnly
              value={revealed ? key : masked}
              onFocus={(e) => e.target.select()}
              className="input-field font-mono text-sm flex-1"
              aria-label="Párovací klíč"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setRevealed((v) => !v)} className="btn-secondary whitespace-nowrap">
                {revealed ? 'Skrýt' : 'Zobrazit'}
              </button>
              <button type="button" onClick={copy} disabled={!key} className="btn-primary whitespace-nowrap">
                Kopírovat
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mt-4">
            <button type="button" onClick={regenerate} disabled={regenerating} className="text-sm text-ink-500 hover:text-ink-800 underline">
              {regenerating ? 'Generuji…' : 'Vygenerovat nový klíč'}
            </button>
            {copied && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-green-600">
                ✓ Zkopírováno
              </motion.span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
