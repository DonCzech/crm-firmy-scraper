'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface BookingInfo {
  id: string
  status: string
  client_name: string
  booking_date: string
  start_time: string
  duration_minutes: number
  service_name: string
  provider_name: string
}

export default function CancelPage() {
  const { token } = useParams<{ token: string }>()
  const [booking, setBooking] = useState<BookingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/bookings/cancel?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setBooking(data)
      })
      .catch(() => setError('Chyba při načítání rezervace.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleCancel() {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/cancel?token=${token}`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) setDone(true)
      else setError(data.error || 'Nepodařilo se zrušit rezervaci.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md overflow-hidden">
        {done ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Rezervace zrušena</h1>
            <p className="text-gray-500 text-sm">Potvrzení vám bylo zasláno e-mailem.</p>
          </div>
        ) : error && !booking ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Chyba</h1>
            <p className="text-gray-500 text-sm">{error}</p>
          </div>
        ) : booking ? (
          <>
            <div className={`px-6 py-5 ${booking.status === 'cancelled' ? 'bg-gray-100' : 'bg-red-50'}`}>
              <h1 className="text-lg font-bold text-gray-900">Zrušení rezervace</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {booking.status === 'cancelled' ? 'Tato rezervace již byla zrušena.' : 'Opravdu chcete zrušit tuto rezervaci?'}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Služba</span>
                  <span className="font-medium text-gray-900">{booking.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Poskytovatel</span>
                  <span className="text-gray-700">{booking.provider_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Datum</span>
                  <span className="text-gray-700 capitalize">
                    {format(new Date(booking.booking_date.split('T')[0] + 'T00:00:00'), 'EEEE d. MMMM yyyy', { locale: cs })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Čas</span>
                  <span className="text-gray-700">{booking.start_time.substring(0, 5)}</span>
                </div>
              </div>

              {booking.status === 'cancelled' ? (
                <p className="text-center text-sm text-gray-400">Rezervace je již zrušena.</p>
              ) : (
                <>
                  {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Ruším...' : 'Potvrdit zrušení'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">Tuto akci nelze vrátit zpět.</p>
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
