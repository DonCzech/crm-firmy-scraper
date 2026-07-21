'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface Inquiry {
  id: string
  mode: string
  subject: string | null
  service_name: string | null
  client_name: string
  client_email: string
  client_phone: string
  client_notes: string
  party_size: number | null
  preferred_date: string | null
  preferred_time: string | null
  check_in: string | null
  check_out: string | null
  status: string
  created_at: string
}

const MODE_LABEL: Record<string, string> = {
  inquiry: 'Poptávka',
  course: 'Přihláška',
  table: 'Stůl',
  stay: 'Pobyt',
}

const STATUS_LABEL: Record<string, string> = {
  new: 'Nová',
  contacted: 'Kontaktováno',
  closed: 'Uzavřeno',
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'new'
      ? 'bg-accent-50 text-accent-700'
      : status === 'contacted'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-ink-50 text-ink-400'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function fmtDate(d: string | null) {
  if (!d) return ''
  try {
    return format(new Date(d), 'd. M. yyyy', { locale: cs })
  } catch {
    return d
  }
}

/** Strukturované detaily poptávky — jen pole relevantní pro daný režim. */
function details(i: Inquiry): [string, string][] {
  const rows: [string, string][] = []
  const label = i.subject || i.service_name
  if (label) rows.push([i.mode === 'course' ? 'Kurz' : i.mode === 'stay' ? 'Ubytování' : 'Předmět', label])
  if (i.party_size) rows.push(['Počet osob', String(i.party_size)])
  if (i.preferred_date) rows.push(['Preferované datum', fmtDate(i.preferred_date)])
  if (i.preferred_time) rows.push(['Preferovaný čas', i.preferred_time])
  if (i.check_in) rows.push(['Příjezd', fmtDate(i.check_in)])
  if (i.check_out) rows.push(['Odjezd', fmtDate(i.check_out)])
  return rows
}

export default function InquiriesPage() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inquiries')
      if (res.ok) setItems(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) fetchItems()
  }

  async function remove(id: string) {
    if (!confirm('Opravdu chcete smazat tuto poptávku?')) return
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
    if (res.ok) fetchItems()
  }

  const filtered = items.filter((i) => filter === 'all' || i.status === filter)

  const filterOptions = [
    { value: 'all', label: 'Vše' },
    { value: 'new', label: 'Nové' },
    { value: 'contacted', label: 'Kontaktováno' },
    { value: 'closed', label: 'Uzavřeno' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Poptávky</h1>
        <p className="text-ink-400 mt-1 text-sm">Poptávky, přihlášky a rezervace bez pevného termínu</p>
      </div>

      <div className="card p-2 mb-6 inline-flex gap-1 bg-ink-50">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === opt.value ? 'bg-cream text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card py-12 text-center">
          <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-ink-400">Žádné poptávky</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((i) => (
            <div key={i.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide bg-ink-900/5 text-ink-500">
                      {MODE_LABEL[i.mode] || i.mode}
                    </span>
                    <StatusBadge status={i.status} />
                    <span className="text-xs text-ink-300">
                      {format(new Date(i.created_at), 'd. M. yyyy HH:mm', { locale: cs })}
                    </span>
                  </div>
                  <p className="font-semibold text-ink-900">{i.client_name}</p>
                  <p className="text-sm text-ink-400">
                    {i.client_email && <a href={`mailto:${i.client_email}`} className="text-accent-600 hover:underline">{i.client_email}</a>}
                    {i.client_email && i.client_phone ? ' · ' : ''}
                    {i.client_phone && <a href={`tel:${i.client_phone}`} className="hover:underline">{i.client_phone}</a>}
                  </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {i.status !== 'contacted' && (
                    <button onClick={() => setStatus(i.id, 'contacted')} className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                      Kontaktováno
                    </button>
                  )}
                  {i.status !== 'closed' && (
                    <button onClick={() => setStatus(i.id, 'closed')} className="px-3 py-1.5 text-xs font-medium text-ink-600 bg-ink-50 rounded-lg hover:bg-ink-100 transition-colors">
                      Uzavřít
                    </button>
                  )}
                  {i.status !== 'new' && (
                    <button onClick={() => setStatus(i.id, 'new')} className="px-3 py-1.5 text-xs font-medium text-accent-700 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors">
                      Znovu otevřít
                    </button>
                  )}
                  <button onClick={() => remove(i.id)} aria-label="Smazat" className="p-1.5 text-ink-300 hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {(details(i).length > 0 || i.client_notes) && (
                <div className="mt-4 pt-4 border-t border-ink-900/10 grid sm:grid-cols-2 gap-x-8 gap-y-2">
                  {details(i).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 text-sm">
                      <span className="text-ink-400">{label}</span>
                      <span className="text-ink-900 font-medium text-right">{value}</span>
                    </div>
                  ))}
                  {i.client_notes && (
                    <div className="sm:col-span-2 text-sm">
                      <span className="text-ink-400 block mb-1">Zpráva</span>
                      <p className="text-ink-700 whitespace-pre-wrap">{i.client_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
