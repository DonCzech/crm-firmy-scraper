'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Service, User, Staff } from '@/types'

interface Props {
  services: Service[]
  addonServices: Service[]
  user: User
  staff?: Staff[]
  onSelect: (service: Service, addons: Service[]) => void
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Zdarma'
  return `${Number(price).toLocaleString('cs-CZ')} ${currency}`
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export default function ServiceSelector({ services, addonServices, user, staff = [], onSelect }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Service[]>([])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  function handleServiceClick(service: Service) {
    if (addonServices.length > 0) {
      if (expandedId === service.id) {
        // Already expanded → proceed
        onSelect(service, selectedAddons)
      } else {
        setExpandedId(service.id)
        setSelectedAddons([])
      }
    } else {
      onSelect(service, [])
    }
  }

  function toggleAddon(addon: Service) {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  function handleContinue(service: Service) {
    onSelect(service, selectedAddons)
  }

  const expandedService = services.find((s) => s.id === expandedId) ?? null

  return (
    <div>
      {/* Provider card */}
      <div className="card p-6 mb-6 text-center">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover mx-auto mb-3"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3"
            style={{ backgroundColor: user.avatar_color }}
          >
            {initials}
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        {user.bio && <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{user.bio}</p>}
      </div>

      {/* Staff showcase */}
      {staff.length > 0 && (
        <div className="card p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Náš tým</p>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {staff.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-base shadow"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                )}
                <p className="text-xs font-medium text-gray-700 text-center max-w-[64px] truncate">{member.name.split(' ')[0]}</p>
                {member.bio && <p className="text-xs text-gray-400 text-center max-w-[72px] line-clamp-1 leading-tight">{member.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400">Momentálně nejsou k dispozici žádné služby.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {services.map((service) => {
            const isExpanded = expandedId === service.id
            return (
              <motion.div key={service.id} variants={item} className="card overflow-hidden">
                {/* Service row */}
                <button
                  onClick={() => handleServiceClick(service)}
                  className="p-5 w-full text-left flex items-center gap-4 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden transition-transform group-hover:scale-110">
                    {service.image_url ? (
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: service.color + '20' }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={service.color} strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold transition-colors ${isExpanded ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'}`}>
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-3 leading-snug">{service.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: service.color }}>
                        {formatPrice(Number(service.price), service.currency)}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${isExpanded ? 'rotate-90 text-blue-500' : 'text-gray-300 group-hover:text-blue-500'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Inline addon dropdown */}
                <AnimatePresence>
                  {isExpanded && addonServices.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-blue-100 bg-blue-50 px-5 py-4">
                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">
                          Chcete přidat doplňkové služby?
                        </p>
                        <div className="space-y-2 mb-4">
                          {addonServices.map((addon) => {
                            const checked = selectedAddons.some((a) => a.id === addon.id)
                            return (
                              <button
                                key={addon.id}
                                onClick={() => toggleAddon(addon)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                  checked
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                  checked ? 'bg-white border-white' : 'border-gray-300'
                                }`}>
                                  {checked && (
                                    <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{addon.name}</p>
                                  {addon.description && (
                                    <p className={`text-xs mt-0.5 ${checked ? 'text-blue-100' : 'text-gray-400'}`}>{addon.description}</p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className={`text-xs font-semibold ${checked ? 'text-white' : ''}`} style={!checked ? { color: addon.color } : {}}>
                                    +{formatPrice(Number(addon.price), addon.currency)}
                                  </p>
                                  <p className={`text-xs ${checked ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {formatDuration(addon.duration_minutes)}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => handleContinue(service)}
                          className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          {selectedAddons.length > 0
                            ? `Pokračovat (+${selectedAddons.length})`
                            : 'Pokračovat bez doplňků'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Total price preview when addons selected */}
      <AnimatePresence>
        {expandedService && selectedAddons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
          >
            <span className="text-sm text-blue-700 font-medium">
              Celkem ({1 + selectedAddons.length} {1 + selectedAddons.length === 1 ? 'služba' : selectedAddons.length <= 3 ? 'služby' : 'služeb'})
            </span>
            <span className="text-sm font-bold text-blue-800">
              {formatPrice(
                Number(expandedService.price) + selectedAddons.reduce((s, a) => s + Number(a.price), 0),
                expandedService.currency
              )}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
