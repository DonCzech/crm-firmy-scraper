'use client'

import { useEffect, useState } from 'react'

interface Review { client_name: string; rating: number; comment: string; created_at: string }
interface Data { reviews: Review[]; average: number; count: number }

// Kompaktní pruh s hodnocením pro veřejnou rezervační stránku (levý panel).
export default function ReviewsStrip({ slug, variant = 'dark' }: { slug: string; variant?: 'dark' | 'light' }) {
  const [data, setData] = useState<Data | null>(null)

  useEffect(() => {
    fetch(`/api/reviews?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
  }, [slug])

  if (!data || data.count === 0) return null

  const dark = variant === 'dark'
  const muted = dark ? 'text-cream/60' : 'text-ink-400'
  const strong = dark ? 'text-cream' : 'text-ink-900'

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-sm">
          {'★'.repeat(Math.round(data.average))}<span className={dark ? 'text-cream/20' : 'text-ink-200'}>{'★'.repeat(5 - Math.round(data.average))}</span>
        </span>
        <span className={`text-sm font-semibold ${strong}`}>{data.average}</span>
        <span className={`text-xs ${muted}`}>({data.count})</span>
      </div>
      {data.reviews[0]?.comment && (
        <p className={`text-xs ${muted} mt-2 leading-relaxed line-clamp-3`}>
          „{data.reviews[0].comment}" — {data.reviews[0].client_name}
        </p>
      )}
    </div>
  )
}
