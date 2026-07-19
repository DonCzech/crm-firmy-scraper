'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'

interface Client {
  client_name: string
  client_email: string
  client_phone: string
  total_bookings: number
  confirmed_bookings: number
  total_spent: number
  currency: string
  last_booking: string
  first_booking: string
}

interface ClientDetail {
  client_email: string
  bookings: Array<{
    id: string
    booking_date: string
    start_time: string
    service_name: string
    status: string
    price: number
    currency: string
  }>
}

function StatusBadge({ status }: { status: string }) {
  const classes = {
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    completed: 'badge-completed',
    pending: 'badge-pending',
  }[status] || 'badge-pending'

  const labels = {
    confirmed: 'Potvrzeno',
    cancelled: 'Zrušeno',
    completed: 'Dokončeno',
    pending: 'Čekající',
  }[status] || status

  return <span className={classes}>{labels}</span>
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ClientDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((bookings: Array<Record<string, unknown>>) => {
        // Aggregate clients from bookings
        const clientMap = new Map<string, Client>()

        for (const b of bookings) {
          const email = b.client_email as string
          if (!clientMap.has(email)) {
            clientMap.set(email, {
              client_name: b.client_name as string,
              client_email: email,
              client_phone: (b.client_phone as string) || '',
              total_bookings: 0,
              confirmed_bookings: 0,
              total_spent: 0,
              currency: (b.currency as string) || 'CZK',
              last_booking: b.booking_date as string,
              first_booking: b.booking_date as string,
            })
          }
          const c = clientMap.get(email)!
          c.total_bookings++
          if (b.status === 'confirmed' || b.status === 'completed') {
            c.confirmed_bookings++
            c.total_spent += Number(b.price) || 0
          }
          if ((b.booking_date as string) > c.last_booking) {
            c.last_booking = b.booking_date as string
          }
          if ((b.booking_date as string) < c.first_booking) {
            c.first_booking = b.booking_date as string
          }
        }

        setClients(Array.from(clientMap.values()).sort((a, b) =>
          new Date(b.last_booking).getTime() - new Date(a.last_booking).getTime()
        ))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function openClient(email: string) {
    setLoadingDetail(true)
    const res = await fetch('/api/bookings')
    if (res.ok) {
      const bookings = await res.json()
      const clientBookings = bookings.filter((b: Record<string, unknown>) => b.client_email === email)
      setSelected({ client_email: email, bookings: clientBookings })
    }
    setLoadingDetail(false)
  }

  const filtered = clients.filter((c) =>
    !search ||
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.client_email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Klienti</h1>
        <p className="text-ink-400 mt-1 text-sm">{clients.length} klientů celkem</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Hledat klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-ink-400">Žádní klienti</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-900/10 bg-paper">
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Klient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Rezervace</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Utraceno</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Poslední rezervace</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((client) => (
                  <tr
                    key={client.client_email}
                    className="hover:bg-paper transition-colors cursor-pointer"
                    onClick={() => openClient(client.client_email)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-accent-600">
                            {client.client_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-ink-900 text-sm">{client.client_name}</p>
                          <p className="text-xs text-ink-300">{client.client_email}</p>
                          {client.client_phone && (
                            <p className="text-xs text-ink-300">{client.client_phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-ink-900">{client.total_bookings}</span>
                      <span className="text-xs text-ink-300 ml-1">celkem</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-ink-900">
                        {client.total_spent === 0 ? '—' : `${client.total_spent.toLocaleString('cs-CZ')} ${client.currency}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-ink-600">
                        {format(new Date(client.last_booking), 'd. M. yyyy', { locale: cs })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-accent-600 hover:text-accent-700 text-xs font-medium">
                        Detail →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-cream rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-ink-900/10 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-ink-900">
                    {clients.find((c) => c.client_email === selected.client_email)?.client_name}
                  </h3>
                  <p className="text-sm text-ink-300">{selected.client_email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-ink-300 hover:text-ink-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-6 space-y-3">
                {loadingDetail ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-6 w-6 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : selected.bookings.length === 0 ? (
                  <p className="text-center text-ink-300 py-8">Žádné rezervace</p>
                ) : (
                  selected.bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-paper rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{b.service_name}</p>
                        <p className="text-xs text-ink-300">
                          {format(new Date(b.booking_date), 'd. M. yyyy', { locale: cs })} · {b.start_time.substring(0, 5)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-ink-600">
                          {b.price === 0 ? '—' : `${Number(b.price).toLocaleString('cs-CZ')} ${b.currency}`}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
