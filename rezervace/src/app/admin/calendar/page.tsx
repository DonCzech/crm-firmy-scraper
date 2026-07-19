'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  format, addDays, startOfWeek, isSameDay,
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isBefore, startOfDay,
} from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Booking } from '@/types'

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8:00–19:00

function bookingColor(color?: string) {
  return color || '#006bff'
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  currency: string
  color: string
  is_addon: boolean
}

interface NewBookingForm {
  date: string
  time: string
  serviceId: string
  addonIds: string[]
  clientName: string
  clientEmail: string
  clientPhone: string
  clientNotes: string
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<{ date: string; hour: number } | null>(null)
  const dragBooking = useRef<Booking | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  // Mobile-specific state
  const [mobileView, setMobileView] = useState<'month' | 'week'>('month')
  const [mobileMonth, setMobileMonth] = useState(new Date())
  const [mobileSelectedDay, setMobileSelectedDay] = useState<Date | null>(null)
  const [rescheduling, setRescheduling] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const touchDragRef = useRef<{ booking: Booking; targetDate: string | null } | null>(null)
  const [touchDragTargetDate, setTouchDragTargetDate] = useState<string | null>(null)
  const [touchDraggingId, setTouchDraggingId] = useState<string | null>(null)
  // New booking modal
  const [newBooking, setNewBooking] = useState<NewBookingForm | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [newBookingSaving, setNewBookingSaving] = useState(false)
  const [newBookingError, setNewBookingError] = useState('')

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) setBookings(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  function openNewBooking(date: string, hour: number) {
    setNewBookingError('')
    setNewBooking({
      date,
      time: `${String(hour).padStart(2, '0')}:00`,
      serviceId: '',
      addonIds: [],
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientNotes: '',
    })
    // Fetch services lazily
    if (services.length === 0) {
      fetch('/api/services').then((r) => r.json()).then(setServices).catch(() => {})
    }
  }

  async function submitNewBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!newBooking) return
    setNewBookingSaving(true)
    setNewBookingError('')
    try {
      const addonNote = newBooking.addonIds.length > 0
        ? `\n[Doplňky: ${newBooking.addonIds.map((id) => services.find((s) => s.id === id)?.name).filter(Boolean).join(', ')}]`
        : ''
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: newBooking.serviceId,
          clientName: newBooking.clientName,
          clientEmail: newBooking.clientEmail,
          clientPhone: newBooking.clientPhone,
          clientNotes: (newBooking.clientNotes || '') + addonNote,
          bookingDate: newBooking.date,
          startTime: newBooking.time,
        }),
      })
      if (res.ok) {
        setNewBooking(null)
        fetchBookings()
      } else {
        const data = await res.json()
        setNewBookingError(data.error || 'Chyba při vytváření rezervace')
      }
    } catch {
      setNewBookingError('Síťová chyba')
    } finally {
      setNewBookingSaving(false)
    }
  }

  function bookingsForSlot(day: Date, hour: number) {
    const dateStr = format(day, 'yyyy-MM-dd')
    return bookings.filter((b) => {
      const bDate = b.booking_date.split('T')[0]
      const bHour = parseInt(b.start_time.substring(0, 2))
      return bDate === dateStr && bHour === hour && b.status !== 'cancelled'
    })
  }

  function handleDragStart(booking: Booking) {
    setDragId(booking.id)
    dragBooking.current = booking
  }

  function handleDragOver(e: React.DragEvent, date: string, hour: number) {
    e.preventDefault()
    setDropTarget({ date, hour })
  }

  async function handleDrop(date: string, hour: number) {
    const booking = dragBooking.current
    if (!booking) return
    const newTime = `${String(hour).padStart(2, '0')}:00`
    const newDate = date

    // Optimistic update
    setBookings((prev) =>
      prev.map((b) =>
        b.id === booking.id
          ? { ...b, booking_date: newDate + 'T00:00:00.000Z', start_time: newTime + ':00' }
          : b
      )
    )
    setDragId(null)
    setDropTarget(null)
    dragBooking.current = null

    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_date: newDate, start_time: newTime }),
    })
  }

  function handleDragEnd() {
    setDragId(null)
    setDropTarget(null)
    dragBooking.current = null
  }

  const statusLabel: Record<string, string> = {
    confirmed: 'Potvrzeno',
    pending: 'Čekající',
    completed: 'Dokončeno',
    cancelled: 'Zrušeno',
  }

  // Month view helpers
  const monthStart = startOfMonth(mobileMonth)
  const monthEnd = endOfMonth(mobileMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDow = getDay(monthStart)
  const monthPaddingStart = firstDow === 0 ? 6 : firstDow - 1
  const today = startOfDay(new Date())

  function bookingsForDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    return bookings.filter((b) => b.booking_date.split('T')[0] === dateStr && b.status !== 'cancelled')
  }

  // Touch drag for month view
  function handleTouchStart(e: React.TouchEvent, booking: Booking) {
    touchDragRef.current = { booking, targetDate: null }
    setTouchDraggingId(booking.id)
    setTouchDragTargetDate(null)
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchDragRef.current) return
    e.preventDefault()
    const touch = e.touches[0]
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const dateStr = el?.closest('[data-date]')?.getAttribute('data-date') ?? null
    touchDragRef.current.targetDate = dateStr
    setTouchDragTargetDate(dateStr)
  }

  async function handleTouchEnd() {
    const drag = touchDragRef.current
    setTouchDraggingId(null)
    setTouchDragTargetDate(null)
    touchDragRef.current = null
    if (!drag || !drag.targetDate) return
    const { booking, targetDate } = drag
    if (booking.booking_date.split('T')[0] === targetDate) return
    setBookings((prev) =>
      prev.map((b) => b.id === booking.id ? { ...b, booking_date: targetDate + 'T00:00:00.000Z' } : b)
    )
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_date: targetDate }),
    })
  }

  // Reschedule from modal
  async function handleReschedule() {
    if (!selectedBooking || !rescheduleDate || !rescheduleTime) return
    setRescheduleLoading(true)
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_date: rescheduleDate, start_time: rescheduleTime }),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id
              ? { ...b, booking_date: rescheduleDate + 'T00:00:00.000Z', start_time: rescheduleTime + ':00' }
              : b
          )
        )
        setSelectedBooking((prev) => prev ? { ...prev, booking_date: rescheduleDate + 'T00:00:00.000Z', start_time: rescheduleTime + ':00' } : null)
        setRescheduling(false)
      }
    } finally {
      setRescheduleLoading(false)
    }
  }

  async function handleStatusChange(bookingId: string, newStatus: string) {
    setStatusUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, status: newStatus as Booking['status'] } : b)
        )
        setSelectedBooking((prev) => prev ? { ...prev, status: newStatus as Booking['status'] } : null)
      }
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Kalendář</h1>
          <p className="text-sm text-ink-400 mt-1">
            {format(weekStart, 'd. MMMM', { locale: cs })} –{' '}
            {format(addDays(weekStart, 6), 'd. MMMM yyyy', { locale: cs })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => addDays(w, -7))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-900/15 hover:bg-paper transition-colors"
          >
            <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-ink-900/15 hover:bg-paper transition-colors"
          >
            Dnes
          </button>
          <button
            onClick={() => setWeekStart((w) => addDays(w, 7))}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-ink-900/15 hover:bg-paper transition-colors"
          >
            <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE views */}
      <div className="lg:hidden flex flex-col flex-1 overflow-auto">
        {/* View toggle */}
        <div className="flex gap-1 bg-ink-50 p-1 rounded-lg mb-3 mx-0">
          <button
            onClick={() => setMobileView('month')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mobileView === 'month' ? 'bg-cream text-ink-900 shadow-sm' : 'text-ink-400'}`}
          >
            Měsíc
          </button>
          <button
            onClick={() => setMobileView('week')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${mobileView === 'week' ? 'bg-cream text-ink-900 shadow-sm' : 'text-ink-400'}`}
          >
            Týden
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : mobileView === 'month' ? (
          /* ── MONTH VIEW ── */
          <div className="flex flex-col flex-1">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setMobileMonth((m) => subMonths(m, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-50">
                <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-ink-900 capitalize">
                {format(mobileMonth, 'LLLL yyyy', { locale: cs })}
              </span>
              <button onClick={() => setMobileMonth((m) => addMonths(m, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-50">
                <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {['Po','Út','St','Čt','Pá','So','Ne'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-ink-400 py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid with touch drag */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: monthPaddingStart }).map((_, i) => <div key={`p-${i}`} />)}
              {monthDays.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dayBs = bookingsForDay(date)
                const isToday = isSameDay(date, today)
                const isSelected = mobileSelectedDay ? isSameDay(date, mobileSelectedDay) : false
                const isPast = isBefore(date, today)
                const isDragTarget = touchDragTargetDate === dateStr
                return (
                  <div
                    key={dateStr}
                    data-date={dateStr}
                    onClick={() => setMobileSelectedDay(isSelected ? null : date)}
                    className={`relative flex flex-col items-center rounded-lg py-1 px-0.5 cursor-pointer transition-colors min-h-[48px]
                      ${isDragTarget ? 'bg-accent-100 ring-2 ring-ink-400' : isSelected ? 'bg-accent-50' : 'hover:bg-paper'}
                      ${isPast ? 'opacity-60' : ''}`}
                  >
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-ink-900 text-cream' : isSelected ? 'text-accent-700' : 'text-ink-700'}`}>
                      {format(date, 'd')}
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {dayBs.slice(0, 3).map((b) => (
                        <span key={b.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bookingColor(b.service_color) }} />
                      ))}
                      {dayBs.length > 3 && <span className="text-[9px] text-ink-300">+{dayBs.length - 3}</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected day bookings */}
            {mobileSelectedDay && (
              <div className="mt-3 border-t border-ink-900/15 pt-3 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide capitalize">
                    {format(mobileSelectedDay, 'EEEE d. MMMM', { locale: cs })}
                  </p>
                  <button
                    onClick={() => openNewBooking(format(mobileSelectedDay, 'yyyy-MM-dd'), 9)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-ink-900 text-cream rounded-lg text-xs font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Přidat
                  </button>
                </div>
                {bookingsForDay(mobileSelectedDay).length === 0 ? (
                  <p className="text-sm text-ink-300 italic">Žádné rezervace</p>
                ) : (
                  bookingsForDay(mobileSelectedDay)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time))
                    .map((b) => (
                      <div
                        key={b.id}
                        onTouchStart={(e) => handleTouchStart(e, b)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => { setSelectedBooking(b); setRescheduling(false) }}
                        className={`flex items-center gap-3 p-3 rounded-xl border mb-2 cursor-pointer active:opacity-70 transition-opacity
                          ${touchDraggingId === b.id ? 'opacity-40 border-accent-300 bg-accent-50' : 'border-ink-900/10 bg-cream'}`}
                        style={{ touchAction: 'none' }}
                      >
                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: bookingColor(b.service_color) }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-ink-900">{b.start_time.substring(0, 5)} – {b.client_name}</p>
                          <p className="text-xs text-ink-400 truncate">{b.service_name} · {b.duration_minutes} min</p>
                        </div>
                        <svg className="w-3 h-3 text-ink-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))
                )}
                {touchDraggingId && (
                  <p className="text-xs text-accent-600 text-center mt-2 animate-pulse">Přetáhněte na jiný den v kalendáři</p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── WEEK LIST VIEW ── */
          <>
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const isToday = isSameDay(day, new Date())
              const dayBookings = bookings
                .filter((b) => b.booking_date.split('T')[0] === dateStr && b.status !== 'cancelled')
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
              return (
                <div key={dateStr} className="mb-2">
                  <div className={`px-4 py-2 flex items-center gap-2 ${isToday ? 'bg-accent-50' : 'bg-paper'} border-b border-ink-900/15`}>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-accent-700' : 'text-ink-400'}`}>
                      {format(day, 'EEEE d. MMMM', { locale: cs })}
                    </span>
                    {isToday && <span className="text-xs bg-ink-900 text-cream rounded-full px-2 py-0.5">Dnes</span>}
                    {dayBookings.length > 0 && (
                      <span className="ml-auto text-xs text-ink-300">{dayBookings.length} rezerv.</span>
                    )}
                  </div>
                  {dayBookings.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-ink-200 italic">Žádné rezervace</div>
                  ) : (
                    dayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => { setSelectedBooking(b); setRescheduling(false) }}
                        className="px-4 py-3 border-b border-ink-900/10 flex items-center gap-3 cursor-pointer hover:bg-paper active:bg-ink-50"
                      >
                        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ backgroundColor: bookingColor(b.service_color) }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-ink-900">{b.start_time.substring(0, 5)} – {b.client_name}</p>
                          <p className="text-xs text-ink-400 truncate">{b.service_name} · {b.duration_minutes} min</p>
                        </div>
                        <svg className="w-4 h-4 text-ink-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* DESKTOP: week grid */}
      <div className="hidden lg:flex flex-col flex-1 overflow-auto">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-ink-900/15 sticky top-0 bg-cream z-10">
            <div className="py-2 px-2 text-xs text-ink-300" />
            {days.map((day) => {
              const isToday = isSameDay(day, new Date())
              return (
                <div key={day.toISOString()} className="py-2 px-2 text-center">
                  <p className="text-xs text-ink-300 capitalize">
                    {format(day, 'EEE', { locale: cs })}
                  </p>
                  <p className={`text-sm font-semibold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto
                    ${isToday ? 'bg-ink-900 text-cream' : 'text-ink-900'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Time rows */}
          {loading ? (
            <div className="py-16 text-center">
              <svg className="animate-spin h-8 w-8 text-accent-600 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-ink-900/10 min-h-[60px]">
                <div className="py-1 px-2 text-xs text-ink-300 text-right pt-2 border-r border-ink-900/10">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {days.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isDropTarget = dropTarget?.date === dateStr && dropTarget?.hour === hour
                  const slotBookings = bookingsForSlot(day, hour)
                  return (
                    <div
                      key={dateStr}
                      onDragOver={(e) => handleDragOver(e, dateStr, hour)}
                      onDrop={() => handleDrop(dateStr, hour)}
                      onClick={() => { if (slotBookings.length === 0) openNewBooking(dateStr, hour) }}
                      className={`p-1 border-r border-ink-900/10 relative transition-colors group ${
                        isDropTarget ? 'bg-accent-50' : 'hover:bg-paper cursor-pointer'
                      }`}
                    >
                      {slotBookings.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <svg className="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      )}
                      {slotBookings.map((b) => (
                        <div
                          key={b.id}
                          draggable
                          onDragStart={() => handleDragStart(b)}
                          onDragEnd={handleDragEnd}
                          onClick={(e) => { e.stopPropagation(); setSelectedBooking(b) }}
                          className={`text-cream text-xs rounded px-1.5 py-1 mb-0.5 cursor-pointer select-none ${dragId === b.id ? 'opacity-40' : 'opacity-100'}`}
                          style={{ backgroundColor: bookingColor(b.service_color) }}
                          title={`${b.client_name} — ${b.service_name}\n${statusLabel[b.status] || b.status}`}
                        >
                          <p className="font-medium truncate">{b.start_time.substring(0, 5)} {b.client_name}</p>
                          <p className="truncate opacity-80">{b.service_name}</p>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-ink-300 mt-3 hidden lg:block">Přetáhněte rezervaci na jiný termín pro přesun. Kliknutím na prázdný slot vytvoříte rezervaci.</p>
      <p className="text-xs text-ink-300 mt-3 lg:hidden">Klepnutím na rezervaci zobrazíte detail.</p>

      {/* Booking detail modal */}
      {/* New booking modal */}
      {newBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4" onClick={() => setNewBooking(null)}>
          <div className="bg-cream w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-ink-900/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink-900">Nová rezervace</h3>
                <p className="text-xs text-ink-400">{newBooking.date} v {newBooking.time}</p>
              </div>
              <button onClick={() => setNewBooking(null)} className="text-ink-300 hover:text-ink-600 p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submitNewBooking} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Služba <span className="text-red-500">*</span></label>
                <select
                  value={newBooking.serviceId}
                  onChange={(e) => setNewBooking((p) => p ? { ...p, serviceId: e.target.value, addonIds: [] } : null)}
                  className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  required
                >
                  <option value="">— vyberte —</option>
                  {services.filter((s) => !s.is_addon).map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.duration_minutes} min{Number(s.price) > 0 ? `, ${Number(s.price)} ${s.currency}` : ''})</option>
                  ))}
                </select>
              </div>
              {/* Addon services */}
              {services.filter((s) => s.is_addon).length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1.5">Doplňkové služby (cross-sell)</label>
                  <div className="space-y-1.5">
                    {services.filter((s) => s.is_addon).map((addon) => {
                      const checked = newBooking.addonIds.includes(addon.id)
                      return (
                        <label key={addon.id} className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${checked ? 'border-amber-300 bg-amber-50' : 'border-ink-900/10 bg-paper hover:border-ink-900/15'}`}>
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-amber-500 border-amber-500' : 'border-ink-200 bg-cream'}`}
                            onClick={() => setNewBooking((p) => {
                              if (!p) return null
                              const ids = checked ? p.addonIds.filter((id) => id !== addon.id) : [...p.addonIds, addon.id]
                              return { ...p, addonIds: ids }
                            })}
                          >
                            {checked && <svg className="w-2.5 h-2.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-xs text-ink-700 flex-1">{addon.name}</span>
                          {Number(addon.price) > 0 && <span className="text-xs font-medium text-amber-700">+{Number(addon.price)} {addon.currency}</span>}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Datum</label>
                  <input type="date" value={newBooking.date} onChange={(e) => setNewBooking((p) => p ? { ...p, date: e.target.value } : null)}
                    className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Čas</label>
                  <input type="time" value={newBooking.time} onChange={(e) => setNewBooking((p) => p ? { ...p, time: e.target.value } : null)}
                    className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Jméno klienta <span className="text-red-500">*</span></label>
                <input type="text" value={newBooking.clientName} onChange={(e) => setNewBooking((p) => p ? { ...p, clientName: e.target.value } : null)}
                  placeholder="Jan Novák" className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">E-mail <span className="text-red-500">*</span></label>
                <input type="email" value={newBooking.clientEmail} onChange={(e) => setNewBooking((p) => p ? { ...p, clientEmail: e.target.value } : null)}
                  placeholder="jan@email.cz" className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Telefon <span className="text-ink-300 font-normal">(nepovinné)</span></label>
                <input type="tel" value={newBooking.clientPhone} onChange={(e) => setNewBooking((p) => p ? { ...p, clientPhone: e.target.value } : null)}
                  placeholder="+420 777 123 456" className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900" />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Poznámka <span className="text-ink-300 font-normal">(nepovinné)</span></label>
                <textarea value={newBooking.clientNotes} onChange={(e) => setNewBooking((p) => p ? { ...p, clientNotes: e.target.value } : null)}
                  rows={2} className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900 resize-none" />
              </div>
              {newBookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{newBookingError}</div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setNewBooking(null)} className="flex-1 py-2.5 border border-ink-900/15 rounded-lg text-sm text-ink-600 hover:bg-paper">Zrušit</button>
                <button type="submit" disabled={newBookingSaving} className="flex-1 py-2.5 bg-ink-900 text-cream rounded-lg text-sm font-medium hover:bg-ink-800 disabled:opacity-50">
                  {newBookingSaving ? 'Ukládám...' : 'Vytvořit rezervaci'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-cream rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ backgroundColor: bookingColor(selectedBooking.service_color) }}
            >
              <div>
                <p className="text-cream font-semibold">{selectedBooking.client_name}</p>
                <p className="text-cream/80 text-sm">{selectedBooking.service_name}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center text-cream hover:bg-cream/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-ink-300 text-xs mb-0.5">Datum</p>
                  <p className="font-medium text-ink-900">
                    {selectedBooking.booking_date.split('T')[0]}
                  </p>
                </div>
                <div>
                  <p className="text-ink-300 text-xs mb-0.5">Čas</p>
                  <p className="font-medium text-ink-900">
                    {selectedBooking.start_time.substring(0, 5)}
                    {' '}({selectedBooking.duration_minutes} min)
                  </p>
                </div>
                {selectedBooking.client_email && (
                  <div className="col-span-2">
                    <p className="text-ink-300 text-xs mb-0.5">E-mail</p>
                    <p className="font-medium text-ink-900 truncate">{selectedBooking.client_email}</p>
                  </div>
                )}
                {selectedBooking.client_phone && (
                  <div className="col-span-2">
                    <p className="text-ink-300 text-xs mb-0.5">Telefon</p>
                    <p className="font-medium text-ink-900">{selectedBooking.client_phone}</p>
                  </div>
                )}
                {selectedBooking.client_notes && (
                  <div className="col-span-2">
                    <p className="text-ink-300 text-xs mb-0.5">Poznámka</p>
                    <p className="text-ink-700 text-sm">{selectedBooking.client_notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-ink-300 text-xs mb-0.5">Cena</p>
                  <p className="font-medium text-ink-900">
                    {Number(selectedBooking.price) > 0
                      ? `${selectedBooking.price} ${selectedBooking.currency}`
                      : 'Zdarma'}
                  </p>
                </div>
              </div>

              {/* Reschedule */}
              <div>
                {!rescheduling ? (
                  <button
                    onClick={() => {
                      setRescheduling(true)
                      setRescheduleDate(selectedBooking.booking_date.split('T')[0])
                      setRescheduleTime(selectedBooking.start_time.substring(0, 5))
                    }}
                    className="w-full py-2 rounded-lg text-xs font-medium bg-accent-50 text-accent-600 hover:bg-accent-100 transition-colors"
                  >
                    Přesunout termín
                  </button>
                ) : (
                  <div className="bg-accent-50 rounded-xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-accent-700">Nový termín</p>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-accent-200 rounded-lg text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-ink-400"
                    />
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full px-3 py-2 border border-accent-200 rounded-lg text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-ink-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRescheduling(false)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-cream text-ink-600 border border-ink-900/15 hover:bg-paper"
                      >
                        Zrušit
                      </button>
                      <button
                        onClick={handleReschedule}
                        disabled={rescheduleLoading}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-ink-900 text-cream hover:bg-ink-800 disabled:opacity-50"
                      >
                        {rescheduleLoading ? 'Ukládám...' : 'Uložit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status change */}
              <div>
                <p className="text-ink-300 text-xs mb-1.5">Stav rezervace</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['confirmed', 'pending', 'completed', 'cancelled'] as const).map((s) => (
                    <button
                      key={s}
                      disabled={statusUpdating || selectedBooking.status === s}
                      onClick={() => handleStatusChange(selectedBooking.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedBooking.status === s
                          ? 'bg-ink-900 text-cream'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      } disabled:opacity-50`}
                    >
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
