'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import BookingModal from '@/components/admin/BookingModal'
import type { Booking } from '@/types'

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.status === filter
    const matchesSearch =
      !search ||
      b.client_name.toLowerCase().includes(search.toLowerCase()) ||
      b.client_email.toLowerCase().includes(search.toLowerCase()) ||
      (b.service_name || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  async function handleStatusChange(bookingId: string, status: string) {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      fetchBookings()
      setSelectedBooking(null)
    }
  }

  async function handleDelete(bookingId: string) {
    if (!confirm('Opravdu chcete smazat tuto rezervaci?')) return
    const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchBookings()
      setSelectedBooking(null)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'Vše' },
    { value: 'confirmed', label: 'Potvrzeno' },
    { value: 'pending', label: 'Čekající' },
    { value: 'completed', label: 'Dokončeno' },
    { value: 'cancelled', label: 'Zrušeno' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Rezervace</h1>
          <p className="text-ink-400 mt-1 text-sm">Správa všech rezervací</p>
        </div>
        <a
          href="/api/bookings/export"
          download
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-700 bg-cream border border-ink-900/15 rounded-lg hover:bg-paper transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </a>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Hledat klienta, email, službu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div className="flex gap-1 bg-ink-50 p-1 rounded-lg overflow-x-auto flex-shrink-0">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === opt.value
                  ? 'bg-cream text-ink-900 shadow-sm'
                  : 'text-ink-400 hover:text-ink-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-ink-400">Žádné rezervace</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="p-4 cursor-pointer hover:bg-paper active:bg-ink-50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 text-sm">{booking.client_name}</p>
                    <p className="text-xs text-ink-300 truncate">{booking.client_email}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center gap-3 text-xs text-ink-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: booking.service_color || '#006bff' }} />
                    <span className="truncate max-w-[120px]">{booking.service_name}</span>
                  </div>
                  <span className="text-ink-200">·</span>
                  <span>{format(new Date(booking.booking_date), 'd. M. yyyy', { locale: cs })}</span>
                  <span>{booking.start_time.substring(0, 5)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-ink-400">Žádné rezervace</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-900/10 bg-paper">
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Klient</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Služba</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Datum a čas</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Cena</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-ink-400 uppercase tracking-wider">Stav</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filtered.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-paper transition-colors cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-ink-900 text-sm">{booking.client_name}</p>
                        <p className="text-xs text-ink-300">{booking.client_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: booking.service_color || '#006bff' }}
                          />
                          <span className="text-sm text-ink-700">{booking.service_name}</span>
                        </div>
                        <p className="text-xs text-ink-300 ml-4">{booking.duration_minutes} min</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-ink-700">
                          {format(new Date(booking.booking_date), 'd. M. yyyy', { locale: cs })}
                        </p>
                        <p className="text-xs text-ink-300">{booking.start_time.substring(0, 5)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-ink-900">
                          {booking.price === 0 ? 'Zdarma' : `${Number(booking.price).toLocaleString('cs-CZ')} ${booking.currency}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking) }}
                          className="text-ink-300 hover:text-ink-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <BookingModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
