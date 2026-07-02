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
    transition: { staggerChildren: 0.04 },
  },
}

const slotItem = {
  hidden: { opacity: 0, y: 16 },
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
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 transition-colors flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="font-semibold text-gray-900 capitalize">{formattedDate}</h2>
          <p className="text-sm text-gray-500">
            {service.name} · {service.duration_minutes} min
          </p>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : slots.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">😔</div>
            <p className="text-gray-600 font-medium">Žádné termíny</p>
            <p className="text-sm text-gray-400 mt-1">
              Pro tento den nejsou dostupné termíny. Zkuste jiný datum.
            </p>
            <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Vybrat jiný datum
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{availableCount} volných termínů</p>
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
                      py-3 px-2 rounded-lg text-sm font-medium border-2 transition-colors
                      ${!slot.available
                        ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                        : selectedTime === slot.time
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:text-blue-700'
                      }
                    `}
                  >
                    <span className={!slot.available ? 'line-through' : ''}>{slot.time}</span>
                    {!slot.available && (
                      <span className="block text-[10px] text-gray-400 font-normal mt-0.5 no-underline">obsazeno</span>
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
