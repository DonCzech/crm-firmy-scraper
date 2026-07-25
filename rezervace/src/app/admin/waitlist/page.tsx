'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface WaitItem {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  desired_date: string
  status: string
  created_at: string
  service_name: string | null
  staff_name: string | null
}

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Čeká', notified: 'Informován', converted: 'Rezervoval', cancelled: 'Zrušeno',
}

export default function WaitlistPage() {
  const [items, setItems] = useState<WaitItem[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    fetch('/api/waitlist').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function setStatus(id: string, status: string) {
    setItems((p) => p.map((x) => (x.id === id ? { ...x, status } : x)))
    await fetch(`/api/waitlist/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
  }
  async function remove(id: string) {
    setItems((p) => p.filter((x) => x.id !== id))
    await fetch(`/api/waitlist/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Čekací listina</h1>
      <p className="text-ink-400 mb-6">Zájemci o obsazené termíny — při zrušení jim automaticky přijde nabídka</p>

      {loading ? <p className="text-ink-400">Načítám…</p> : items.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-ink-400">Čekací listina je prázdná.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-ink-900/5">
            {items.map((w) => (
              <div key={w.id} className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 text-sm">{w.client_name}</p>
                  <p className="text-xs text-ink-300">
                    {w.client_email || w.client_phone}
                    {w.service_name ? ` · ${w.service_name}` : ''}
                    {w.staff_name ? ` · ${w.staff_name}` : ''}
                  </p>
                </div>
                <div className="text-sm text-ink-600 capitalize whitespace-nowrap">
                  {format(new Date(String(w.desired_date).split('T')[0] + 'T00:00:00'), 'd. M. yyyy', { locale: cs })}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  w.status === 'waiting' ? 'bg-amber-50 text-amber-700' :
                  w.status === 'notified' ? 'bg-blue-50 text-blue-700' :
                  w.status === 'converted' ? 'bg-green-50 text-green-700' : 'bg-ink-50 text-ink-400'
                }`}>{STATUS_LABEL[w.status] || w.status}</span>
                <div className="flex gap-1">
                  {w.status !== 'converted' && (
                    <button onClick={() => setStatus(w.id, 'converted')} className="text-xs px-2 py-1 rounded text-green-700 hover:bg-green-50">Vyřízeno</button>
                  )}
                  <button onClick={() => remove(w.id)} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50">Smazat</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
