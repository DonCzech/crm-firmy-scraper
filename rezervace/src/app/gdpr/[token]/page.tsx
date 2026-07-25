'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

export default function GdprPage() {
  const { token } = useParams<{ token: string }>()
  const [deleting, setDeleting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function exportData() {
    window.location.href = `/api/gdpr?token=${token}`
  }

  async function requestDelete() {
    if (!confirm('Opravdu chcete nechat smazat své osobní údaje u tohoto poskytovatele? Akci nelze vzít zpět.')) return
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`/api/gdpr?token=${token}`, { method: 'POST' })
      const d = await res.json()
      if (res.ok) setDone(true)
      else setError(d.error || 'Nepodařilo se zpracovat.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl shadow-sm border border-ink-900/10 w-full max-w-md overflow-hidden">
        <div className="bg-ink-900 text-cream px-6 py-5">
          <h1 className="text-lg font-bold">Vaše osobní údaje</h1>
          <p className="text-sm text-cream/60 mt-0.5">Správa podle GDPR</p>
        </div>
        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✓</div>
              <p className="text-ink-700 font-medium">Vaše osobní údaje byly odstraněny.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-ink-600 mb-5">
                Můžete si stáhnout kopii svých dat, nebo požádat o jejich výmaz u tohoto poskytovatele.
              </p>
              <button onClick={exportData} className="w-full py-3 mb-3 bg-ink-900 hover:bg-ink-800 text-cream font-semibold rounded-xl transition-colors">
                Stáhnout moje data (JSON)
              </button>
              <button onClick={requestDelete} disabled={deleting} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors disabled:opacity-50">
                {deleting ? 'Zpracovávám…' : 'Smazat moje osobní údaje'}
              </button>
              {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
