'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface Review {
  id: string
  client_name: string
  rating: number
  comment: string
  is_published: boolean
  created_at: string
  service_name: string | null
}

function Stars({ n }: { n: number }) {
  return (
    <span className="text-amber-400">
      {'★'.repeat(n)}<span className="text-ink-200">{'★'.repeat(5 - n)}</span>
    </span>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    fetch('/api/reviews').then((r) => r.json()).then((d) => setReviews(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function togglePublish(r: Review) {
    setReviews((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_published: !x.is_published } : x)))
    await fetch(`/api/reviews/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !r.is_published }),
    })
  }

  async function remove(id: string) {
    if (!confirm('Smazat recenzi?')) return
    setReviews((prev) => prev.filter((x) => x.id !== id))
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
  }

  const published = reviews.filter((r) => r.is_published)
  const avg = published.length ? Math.round((published.reduce((a, r) => a + r.rating, 0) / published.length) * 10) / 10 : 0

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Recenze</h1>
      <p className="text-ink-400 mb-6">
        Publikované recenze se zobrazují na vaší rezervační stránce · průměr {avg} ★ ({published.length})
      </p>

      {loading ? (
        <p className="text-ink-400">Načítám…</p>
      ) : reviews.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-ink-400">Zatím žádné recenze.</p>
          <p className="text-sm text-ink-300 mt-1">Po dokončeném termínu se klientům automaticky odešle žádost o hodnocení.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-ink-900">{r.client_name}</span>
                  <Stars n={r.rating} />
                  {!r.is_published && <span className="badge-pending text-xs">Neschváleno</span>}
                </div>
                {r.service_name && <p className="text-xs text-ink-300 mb-1">{r.service_name}</p>}
                {r.comment && <p className="text-sm text-ink-600">{r.comment}</p>}
                <p className="text-xs text-ink-300 mt-2">{format(new Date(r.created_at), 'd. M. yyyy', { locale: cs })}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => togglePublish(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    r.is_published ? 'bg-ink-100 text-ink-600 hover:bg-ink-200' : 'bg-ink-900 text-cream hover:bg-ink-800'
                  }`}
                >
                  {r.is_published ? 'Skrýt' : 'Publikovat'}
                </button>
                <button onClick={() => remove(r.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50">
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
