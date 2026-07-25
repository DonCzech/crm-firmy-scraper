'use client'

import { useEffect, useState } from 'react'

interface Analytics {
  revenueByMonth: { month: string; revenue: number; count: number }[]
  topServices: { name: string; count: number; revenue: number }[]
  byWeekday: { dow: number; count: number }[]
  byHour: { hour: number; count: number }[]
  staffUtil: { staff: string; count: number; revenue: number }[]
  totals: {
    total: number; noShows: number; cancelled: number; completed: number
    clients: number; revenueTotal: number; noShowRate: number
  }
}

const WEEKDAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

function money(n: number) {
  return `${Math.round(n).toLocaleString('cs-CZ')} Kč`
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8 text-ink-400">Načítám…</div>
  if (!data) return <div className="p-8 text-ink-400">Data se nepodařilo načíst.</div>

  const maxRev = Math.max(1, ...data.revenueByMonth.map((m) => Number(m.revenue)))
  const maxHour = Math.max(1, ...data.byHour.map((h) => Number(h.count)))
  const maxDow = Math.max(1, ...data.byWeekday.map((d) => Number(d.count)))

  const cards = [
    { label: 'Realizované rezervace', value: data.totals.total },
    { label: 'Tržby celkem', value: money(data.totals.revenueTotal) },
    { label: 'Míra no-show', value: `${data.totals.noShowRate} %`, warn: data.totals.noShowRate > 10 },
    { label: 'Unikátní klienti', value: data.totals.clients },
  ]

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Analýza</h1>
      <p className="text-ink-400 mb-6">Přehled výkonu vašeho podnikání</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="card p-5">
            <p className={`text-2xl font-bold ${c.warn ? 'text-red-600' : 'text-ink-900'}`}>{c.value}</p>
            <p className="text-xs text-ink-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tržby v čase */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Tržby (6 měsíců)</h2>
          {data.revenueByMonth.length === 0 ? (
            <p className="text-sm text-ink-300">Zatím žádná data.</p>
          ) : (
            <div className="space-y-3">
              {data.revenueByMonth.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-ink-400 w-16">{m.month}</span>
                  <div className="flex-1 bg-paper rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-accent-500 rounded-full flex items-center justify-end px-2"
                         style={{ width: `${Math.max(6, (Number(m.revenue) / maxRev) * 100)}%` }}>
                      <span className="text-[10px] text-cream font-semibold whitespace-nowrap">{money(Number(m.revenue))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nejrušnější hodiny */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Nejrušnější hodiny</h2>
          {data.byHour.length === 0 ? (
            <p className="text-sm text-ink-300">Zatím žádná data.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.byHour.map((h) => (
                <div key={h.hour} className="flex-1 flex flex-col items-center justify-end">
                  <div className="w-full bg-sage-400 rounded-t" style={{ height: `${(Number(h.count) / maxHour) * 100}%` }} />
                  <span className="text-[9px] text-ink-400 mt-1">{h.hour}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top služby */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Nejžádanější služby</h2>
          {data.topServices.length === 0 ? (
            <p className="text-sm text-ink-300">Zatím žádná data.</p>
          ) : (
            <div className="divide-y divide-ink-900/5">
              {data.topServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-800 truncate">{s.name}</span>
                  <span className="text-sm text-ink-400 whitespace-nowrap ml-3">{s.count}× · {money(Number(s.revenue))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Podle dne v týdnu + vytížení pracovníků */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Rezervace podle dne</h2>
          <div className="flex items-end gap-2 h-32 mb-6">
            {WEEKDAYS.map((label, dow) => {
              const row = data.byWeekday.find((d) => d.dow === dow)
              const count = row ? Number(row.count) : 0
              return (
                <div key={dow} className="flex-1 flex flex-col items-center justify-end">
                  <span className="text-[10px] text-ink-400">{count || ''}</span>
                  <div className="w-full bg-accent-400 rounded-t" style={{ height: `${(count / maxDow) * 100}%` }} />
                  <span className="text-[10px] text-ink-400 mt-1">{label}</span>
                </div>
              )
            })}
          </div>
          <h3 className="font-semibold text-ink-900 mb-2 text-sm">Vytížení pracovníků</h3>
          <div className="divide-y divide-ink-900/5">
            {data.staffUtil.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink-800 truncate">{s.staff}</span>
                <span className="text-ink-400">{s.count}× · {money(Number(s.revenue))}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
