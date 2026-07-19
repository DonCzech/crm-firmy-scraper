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

  // Monday-first grid padding
  const firstDayOfWeek = getDay(monthStart)
  const paddingStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  function handleDateClick(date: Date) {
    if (isBefore(date, today)) return
    if (!availableDates.has(format(date, 'yyyy-MM-dd'))) return

    setSelectedDate(date)
    const dateStr = format(date, 'yyyy-MM-dd')

    setTimeout(() => {
      onDateSelect(dateStr)
    }, 200)
  }

  return (
    <div>
      {/* Nadpis */}
      <div className="mb-6 flex items-start gap-4">
        <button
          onClick={onBack}
          className="w-11 h-11 mt-1 bg-cream border border-ink-900/15 hover:bg-ink-900 hover:text-cream rounded-full flex items-center justify-center text-ink-700 transition-all flex-shrink-0 shadow-soft"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-1">Krok 2</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink-900 leading-tight">Vyberte datum</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-sm text-ink-400">{service.name} · {service.duration_minutes} min</p>
            {onChangeService && (
              <button onClick={onChangeService} className="text-xs text-accent-600 hover:text-accent-700 underline underline-offset-2 transition-colors font-medium">
                Změnit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Výběr pracovníka */}
      {staff.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.2em] mb-2.5">Vyberte pracovníka</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onStaffSelect(null)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                !selectedStaff
                  ? 'bg-ink-900 text-cream border-ink-900 shadow-soft'
                  : 'bg-cream text-ink-600 border-ink-900/15 hover:border-ink-900/40'
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
                  className={`flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    isActive
                      ? 'bg-ink-900 text-cream border-ink-900 shadow-soft'
                      : 'bg-cream text-ink-600 border-ink-900/15 hover:border-ink-900/40'
                  }`}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-cream text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: member.color }}
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

      <div className="card p-5 lg:p-7">
        {/* Navigace měsíců */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
            className="w-10 h-10 rounded-full border border-ink-900/15 hover:bg-ink-900 hover:text-cream flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-ink-600 transition-all text-ink-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="font-display text-xl text-ink-900 capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: cs })}
          </h3>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="w-10 h-10 rounded-full border border-ink-900/15 hover:bg-ink-900 hover:text-cream flex items-center justify-center transition-all text-ink-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Hlavičky dní */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-ink-400 py-1 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Mřížka */}
        {loadingDays ? (
          <div className="flex items-center justify-center py-14">
            <svg className="animate-spin h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: paddingStart }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

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
                  whileHover={isAvailable && !isSelected ? { scale: 1.08 } : undefined}
                  whileTap={isAvailable ? { scale: 0.92 } : undefined}
                  animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`
                    h-11 relative flex items-center justify-center rounded-xl text-sm font-bold transition-all
                    ${isSelected
                      ? 'bg-accent-500 text-cream shadow-lift'
                      : isAvailable
                        ? 'bg-ink-900/[0.04] text-ink-900 border border-ink-900/15 hover:bg-ink-900 hover:text-cream hover:border-ink-900 cursor-pointer'
                        : 'bg-transparent text-ink-200 cursor-not-allowed'
                    }
                    ${isToday && !isSelected ? 'ring-1 ring-accent-500 ring-offset-1 ring-offset-cream' : ''}
                  `}
                >
                  {format(date, 'd')}
                  {isAvailable && !isSelected && (
                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-accent-500" />
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        <p className="text-xs text-ink-400 mt-4 text-center flex items-center justify-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-accent-500 inline-block" />
          Dostupné termíny jsou označeny tečkou
        </p>
      </div>
    </div>
  )
}
