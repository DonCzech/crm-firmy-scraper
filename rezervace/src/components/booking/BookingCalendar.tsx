'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Service, Staff } from '@/types'

interface Props {
  service: Service
  providerSlug: string
  staff?: Staff[]
  selectedStaff: Staff | null
  onStaffSelect: (staff: Staff | null) => void
  onDateSelect: (date: string) => void
  onBack: () => void
  onChangeService?: () => void
}

const DAY_HEADERS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']

export default function BookingCalendar({ service, providerSlug, staff = [], selectedStaff, onStaffSelect, onDateSelect, onBack, onChangeService }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [loadingDays, setLoadingDays] = useState(true)

  // Fetch available dates from server (respects overrides, staff schedules, etc.)
  useEffect(() => {
    setLoadingDays(true)
    const monthStr = format(currentMonth, 'yyyy-MM')
    const staffParam = selectedStaff ? `&staffId=${selectedStaff.id}` : ''
    fetch(`/api/bookings/available-dates?slug=${providerSlug}&month=${monthStr}${staffParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.dates)) {
          setAvailableDates(new Set<string>(data.dates))
        }
        setLoadingDays(false)
      })
      .catch(() => setLoadingDays(false))
  }, [providerSlug, selectedStaff, currentMonth])

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Padding at the start: Monday-based grid (Monday=0 in array)
  // getDay() returns 0=Sun, 1=Mon, ..., 6=Sat
  // We want Monday first, so: Mon=0, Tue=1, ..., Sun=6
  const firstDayOfWeek = getDay(monthStart) // 0=Sun,...,6=Sat
  const paddingStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // shift to Mon-first

  function handleDateClick(date: Date) {
    if (isBefore(date, today)) return
    if (!availableDates.has(format(date, 'yyyy-MM-dd'))) return

    setSelectedDate(date)
    const dateStr = format(date, 'yyyy-MM-dd')

    // Small delay for animation
    setTimeout(() => {
      onDateSelect(dateStr)
    }, 200)
  }

  return (
    <div className="card overflow-hidden">
      {/* Title bar */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold text-gray-900">Vyberte datum</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{service.name} · {service.duration_minutes} min</p>
            {onChangeService && (
              <button onClick={onChangeService} className="text-xs text-blue-500 hover:text-blue-700 underline transition-colors">
                Změnit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff selector — only when there are staff members */}
      {staff.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vyberte pracovníka</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStaffSelect(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                !selectedStaff
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Kdokoli
            </button>
            {staff.map((member) => {
              const isActive = selectedStaff?.id === member.id
              return (
                <button
                  key={member.id}
                  onClick={() => onStaffSelect(isActive ? null : member)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    isActive ? 'text-white border-transparent shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                  style={isActive ? { backgroundColor: member.color, borderColor: member.color } : {}}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : member.color }}
                    >
                      {member.name[0]}
                    </span>
                  )}
                  {member.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-semibold text-gray-900 capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: cs })}
          </h3>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1 tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loadingDays ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {/* Padding cells */}
            {Array.from({ length: paddingStart }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {/* Day cells */}
            {days.map((date) => {
              const isPast = isBefore(date, today)
              const isAvailable = availableDates.has(format(date, 'yyyy-MM-dd')) && !isPast
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false
              const isToday = isSameDay(date, today)

              return (
                <motion.button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  disabled={!isAvailable}
                  whileHover={isAvailable && !isSelected ? { scale: 1.1 } : undefined}
                  whileTap={isAvailable ? { scale: 0.9 } : undefined}
                  animate={isSelected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`
                    h-11 relative overflow-hidden flex items-center justify-center rounded-lg text-sm font-bold transition-all
                    ${isSelected
                      ? 'bg-green-600 text-white shadow-md shadow-green-200 ring-2 ring-green-100'
                      : isAvailable
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white hover:shadow-md hover:border-transparent cursor-pointer'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
                    }
                    ${isToday && !isSelected ? 'ring-2 ring-green-400 ring-offset-1' : ''}
                  `}
                >
                  {!isAvailable && (
                    <span
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(to top right, transparent calc(50% - 0.7px), #d1d5db calc(50% - 0.7px), #d1d5db calc(50% + 0.7px), transparent calc(50% + 0.7px))',
                      }}
                    />
                  )}
                  {format(date, 'd')}
                </motion.button>
              )
            })}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2 text-center">
          Dostupné termíny jsou zvýrazněny
        </p>
      </div>
    </div>
  )
}
