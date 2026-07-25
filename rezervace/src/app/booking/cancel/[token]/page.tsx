'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface BookingInfo {
  id: string
  status: string
  client_name: string
  booking_date: string
  start_time: string
  duration_minutes: number
  service_id: string
  staff_id: string | null
  service_name: string
  provider_name: string
  provider_slug: string
}

export default function CancelPage() {
  const { token } = useParams<{ token: string }>()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [done, setDone] = useState<null | 'cancelled' | 'rescheduled'>(null)
  const [error, setError] = useState('')

  // Režim přeobjednání
  const [mode, setMode] = useState<'view' | 'reschedule'>('view')
  const [newDate, setNewDate] = useState('')
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/bookings/cancel?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else {
          setBooking(data)
          if (searchParams.get('action') === 'reschedule' && data.status !== 'cancelled') {
            setMode('reschedule')
          }
        }
      })
      .catch(() => setError('Chyba při načítání rezervace.'))
      .finally(() => setLoading(false))
  }, [token, searchParams])

  // Načtení slotů při změně data
  useEffect(() => {
    if (mode !== 'reschedule' || !newDate || !booking) return
    setSlotsLoading(true)
    setSelectedTime('')
    const staffParam = booking.staff_id ? `&staffId=${booking.staff_id}` : ''
    fetch(`/api/bookings/slots?slug=${booking.provider_slug}&date=${newDate}&serviceId=${booking.service_id}${staffParam}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [newDate, mode, booking])

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/cancel?token=${token}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) setDone('cancelled')
      else setError(data.error || 'Nepodařilo se zrušit rezervaci.')
    } finally {
      setCancelling(false)
    }
  }

  async function handleReschedule() {
    if (!newDate || !selectedTime) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/reschedule?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, time: selectedTime }),
      })
      const data = await res.json()
      if (res.ok) setDone('rescheduled')
      else setError(data.error || 'Přeobjednání se nezdařilo.')
    } finally {
      setSaving(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-accent-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="bg-cream rounded-2xl shadow-sm border border-ink-900/10 w-full max-w-md overflow-hidden">
        {done ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">
              {done === 'cancelled' ? 'Rezervace zrušena' : 'Termín přeobjednán'}
            </h1>
            <p className="text-ink-400 text-sm">Potvrzení vám bylo zasláno e-mailem.</p>
          </div>
        ) : error && !booking ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-ink-900 mb-2">Chyba</h1>
            <p className="text-ink-400 text-sm">{error}</p>
          </div>
        ) : booking ? (
          <>
            <div className={`px-6 py-5 ${booking.status === 'cancelled' ? 'bg-ink-50' : mode === 'reschedule' ? 'bg-indigo-50' : 'bg-red-50'}`}>
              <h1 className="text-lg font-bold text-ink-900">
                {mode === 'reschedule' ? 'Přeobjednání' : 'Zrušení rezervace'}
              </h1>
              <p className="text-sm text-ink-400 mt-0.5">
                {booking.status === 'cancelled'
                  ? 'Tato rezervace již byla zrušena.'
                  : mode === 'reschedule'
                    ? 'Vyberte nový termín níže.'
                    : 'Opravdu chcete zrušit tuto rezervaci?'}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-paper rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-300">Služba</span>
                  <span className="font-medium text-ink-900">{booking.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-300">Poskytovatel</span>
                  <span className="text-ink-700">{booking.provider_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-300">Původní termín</span>
                  <span className="text-ink-700 capitalize">
                    {format(new Date(booking.booking_date.split('T')[0] + 'T00:00:00'), 'd. M. yyyy', { locale: cs })}
                    {' '}{booking.start_time.substring(0, 5)}
                  </span>
                </div>
              </div>

              {booking.status === 'cancelled' ? (
                <p className="text-center text-sm text-ink-300">Rezervace je již zrušena.</p>
              ) : mode === 'reschedule' ? (
                <>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Nové datum</label>
                  <input
                    type="date"
                    min={today}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input-field w-full mb-4"
                  />

                  {newDate && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Volné časy</label>
                      {slotsLoading ? (
                        <p className="text-sm text-ink-300 py-2">Načítám…</p>
                      ) : slots.filter((s) => s.available).length === 0 ? (
                        <p className="text-sm text-ink-300 py-2">Na tento den nejsou volné termíny.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.filter((s) => s.available).map((s) => (
                            <button
                              key={s.time}
                              onClick={() => setSelectedTime(s.time)}
                              className={`py-2 text-sm rounded-lg border transition-colors ${
                                selectedTime === s.time
                                  ? 'bg-ink-900 text-cream border-ink-900'
                                  : 'bg-cream text-ink-700 border-ink-900/15 hover:border-ink-900/40'
                              }`}
                            >
                              {s.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                  <button
                    onClick={handleReschedule}
                    disabled={saving || !selectedTime}
                    className="w-full py-3 bg-ink-900 hover:bg-ink-800 text-cream font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
                    {saving ? 'Ukládám…' : 'Potvrdit nový termín'}
                  </button>
                  <button
                    onClick={() => { setMode('view'); setError('') }}
                    className="w-full py-2 mt-2 text-sm text-ink-400 hover:text-ink-700"
                  >
                    Zpět
                  </button>
                </>
              ) : (
                <>
                  {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                  <button
                    onClick={() => setMode('reschedule')}
                    className="w-full py-3 mb-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors"
                  >
                    Přeobjednat na jiný termín
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-cream font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Ruším...' : 'Zrušit rezervaci'}
                  </button>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
