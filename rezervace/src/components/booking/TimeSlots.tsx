'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Service, TimeSlot } from '@/types'

interface Props {
  service: Service
  providerSlug: string
  date: string
  staffId?: string
  onTimeSelect: (time: string) => void
  onBack: () => void
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035 },
  },
}

const slotItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 28 } },
}

export default function TimeSlots({ service, providerSlug, date, staffId, onTimeSelect, onBack }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ slug: providerSlug, date, serviceId: service.id })
    if (staffId) params.set('staffId', staffId)
    fetch(`/api/bookings/slots?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [providerSlug, date, service.id, staffId])

  function handleSelect(time: string) {
    setSelectedTime(time)
    setTimeout(() => {
      onTimeSelect(time)
    }, 180)
  }

  const formattedDate = format(new Date(date + 'T00:00:00'), "EEEE, d. MMMM yyyy", { locale: cs })
  const availableCount = slots.filter((s) => s.available).length

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
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-1">Krok 3</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink-900 leading-tight capitalize">{formattedDate}</h2>
          <p className="text-sm text-ink-400 mt-1.5">
            {service.name} · {service.duration_minutes} min
          </p>
        </div>
      </div>

      <div className="card p-5 lg:p-7">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-7 w-7 text-accent-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-2xl text-ink-900">Žádné termíny</p>
            <p className="text-sm text-ink-400 mt-2">
              Pro tento den nejsou dostupné termíny. Zkuste jiný datum.
            </p>
            <button onClick={onBack} className="mt-5 btn-secondary text-sm py-2.5 px-5">
              ← Vybrat jiný datum
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-400 mb-4">
              <span className="font-bold text-ink-900">{availableCount}</span> volných termínů
            </p>
            <AnimatePresence>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-3 sm:grid-cols-4 gap-2"
              >
                {slots.map((slot) => (
                  <motion.button
                    key={slot.time}
                    variants={slotItem}
                    whileHover={slot.available ? { scale: 1.04 } : {}}
                    whileTap={slot.available ? { scale: 0.94 } : {}}
                    onClick={() => slot.available && handleSelect(slot.time)}
                    disabled={!slot.available}
                    title={!slot.available ? 'Obsazeno' : undefined}
                    className={`
                      py-3 px-2 rounded-xl text-sm font-bold border transition-colors
                      ${!slot.available
                        ? 'bg-transparent border-ink-900/5 text-ink-200 cursor-not-allowed'
                        : selectedTime === slot.time
                          ? 'bg-accent-500 border-accent-500 text-cream shadow-lift'
                          : 'bg-cream border-ink-900/15 text-ink-800 hover:bg-ink-900 hover:border-ink-900 hover:text-cream'
                      }
                    `}
                  >
                    <span className={!slot.available ? 'line-through' : ''}>{slot.time}</span>
                    {!slot.available && (
                      <span className="block text-[10px] text-ink-300 font-normal mt-0.5 no-underline">obsazeno</span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}
