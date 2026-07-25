'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Info {
  clientName: string
  serviceName: string
  providerName: string
  alreadyReviewed: boolean
}

export default function ReviewPage() {
  const { token } = useParams<{ token: string }>()
  const [info, setInfo] = useState<Info | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/reviews/submit?token=${token}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setInfo(d)))
      .catch(() => setError('Nepodařilo se načíst.'))
      .finally(() => setLoading(false))
  }, [token])

  async function submit() {
    if (!rating) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/reviews/submit?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const d = await res.json()
      if (res.ok) setDone(true)
      else setError(d.error || 'Nepodařilo se odeslat.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-paper flex items-center justify-center text-ink-400">Načítám…</div>
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl shadow-sm border border-ink-900/10 w-full max-w-md overflow-hidden">
        <div className="bg-amber-50 px-6 py-5">
          <h1 className="text-lg font-bold text-ink-900">Hodnocení</h1>
          {info && <p className="text-sm text-ink-400 mt-0.5">{info.serviceName} · {info.providerName}</p>}
        </div>
        <div className="p-6">
          {done || info?.alreadyReviewed ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🙏</div>
              <p className="text-ink-700 font-medium">Děkujeme za vaše hodnocení!</p>
            </div>
          ) : error && !info ? (
            <p className="text-red-600 text-sm text-center py-6">{error}</p>
          ) : (
            <>
              <p className="text-sm text-ink-600 mb-4">Jak jste byli spokojeni?</p>
              <div className="flex justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="text-4xl transition-transform hover:scale-110"
                    aria-label={`${n} hvězd`}
                  >
                    <span className={(hover || rating) >= n ? 'text-amber-400' : 'text-ink-200'}>★</span>
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napište pár slov (nepovinné)…"
                rows={4}
                className="input-field w-full mb-4 resize-none"
              />
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <button
                onClick={submit}
                disabled={saving || !rating}
                className="w-full py-3 bg-ink-900 hover:bg-ink-800 text-cream font-semibold rounded-xl transition-colors disabled:opacity-40"
              >
                {saving ? 'Odesílám…' : 'Odeslat hodnocení'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
