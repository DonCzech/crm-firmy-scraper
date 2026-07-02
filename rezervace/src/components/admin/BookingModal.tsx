'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Booking } from '@/types'

interface Props {
  booking: Booking
  onClose: () => void
  onStatusChange: (bookingId: string, status: string) => void
  onDelete: (bookingId: string) => void
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

function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.substring(0, 5).split(':').map(Number)
  const total = hour * 60 + minute + minutes
  const endHour = Math.floor(total / 60) % 24
  const endMinute = total % 60
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

export default function BookingModal({ booking, onClose, onStatusChange, onDelete }: Props) {
  const endTime = addMinutesToTime(booking.start_time, booking.duration_minutes)

  const formattedDate = format(new Date(booking.booking_date.split('T')[0] + 'T00:00:00'), "EEEE, d. MMMM yyyy", { locale: cs })

  const statusOptions = [
    { value: 'confirmed', label: 'Potvrdit' },
    { value: 'completed', label: 'Označit jako dokončeno' },
    { value: 'cancelled', label: 'Zrušit rezervaci' },
    { value: 'pending', label: 'Nastavit jako čekající' },
  ].filter((opt) => opt.value !== booking.status)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: booking.service_color || '#006bff' }}
            />
            <h3 className="font-semibold text-gray-900">{booking.service_name}</h3>
            <StatusBadge status={booking.status} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Time details */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-800 capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-blue-700">
                {booking.start_time.substring(0, 5)} – {endTime} ({booking.duration_minutes} min)
              </span>
            </div>
          </div>

          {/* Client details */}
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Klient</h4>
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600">
                  {booking.client_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{booking.client_name}</p>
                <a href={`mailto:${booking.client_email}`} className="text-xs text-blue-600 hover:underline">
                  {booking.client_email}
                </a>
              </div>
            </div>
            {booking.client_phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${booking.client_phone}`} className="hover:text-blue-600">
                  {booking.client_phone}
                </a>
              </div>
            )}
          </div>

          {booking.client_notes && (
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Poznámky</h4>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{booking.client_notes}</p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between text-sm mb-6">
            <span className="text-gray-500">Cena</span>
            <span className="font-semibold text-gray-900">
              {Number(booking.price) === 0 ? 'Zdarma' : `${Number(booking.price).toLocaleString('cs-CZ')} ${booking.currency}`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onStatusChange(booking.id, opt.value)}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  opt.value === 'cancelled'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : opt.value === 'completed'
                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => onDelete(booking.id)}
              className="ml-auto text-sm px-3 py-1.5 rounded-lg font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Smazat
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
