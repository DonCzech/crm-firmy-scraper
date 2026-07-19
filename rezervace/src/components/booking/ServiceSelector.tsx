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
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

export default function ServiceSelector({ services, addonServices, user, staff = [], onSelect }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Service[]>([])

  function handleServiceClick(service: Service) {
    if (addonServices.length > 0) {
      if (expandedId === service.id) {
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
      {/* Editorial nadpis */}
      <div className="mb-6 lg:mb-8">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-2">Krok 1</p>
        <h2 className="font-display text-3xl lg:text-5xl text-ink-900 leading-[1.05]">
          Vyberte si<br className="hidden lg:block" /> službu
        </h2>
      </div>

      {/* Tým */}
      {staff.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-bold text-ink-400 uppercase tracking-[0.2em] mb-3">Náš tým</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center gap-2.5 flex-shrink-0 bg-cream border border-ink-900/10 rounded-full pl-1.5 pr-4 py-1.5 shadow-soft">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-cream font-bold text-xs"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-ink-800 leading-tight">{member.name.split(' ')[0]}</p>
                  {member.bio && <p className="text-[10px] text-ink-400 leading-tight max-w-[110px] truncate">{member.bio}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Služby */}
      {services.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-ink-400">Momentálně nejsou k dispozici žádné služby.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {services.map((service, index) => {
            const isExpanded = expandedId === service.id
            return (
              <motion.div
                key={service.id}
                variants={item}
                className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isExpanded
                    ? 'bg-ink-900 border-ink-900 shadow-ink-glow'
                    : 'bg-cream border-ink-900/10 shadow-soft hover:shadow-lift hover:border-ink-900/30'
                }`}
              >
                {/* Řádek služby */}
                <button
                  onClick={() => handleServiceClick(service)}
                  className="p-5 lg:p-6 w-full text-left flex items-center gap-4 lg:gap-5 group"
                >
                  <span
                    className={`font-display text-xl lg:text-2xl w-9 flex-shrink-0 transition-colors ${
                      isExpanded ? 'text-accent-400' : 'text-ink-300 group-hover:text-accent-600'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {service.image_url && (
                    <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden hidden sm:block">
                      <img src={service.image_url} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-display text-lg lg:text-xl leading-snug transition-colors ${
                        isExpanded ? 'text-cream' : 'text-ink-900'
                      }`}
                    >
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className={`text-sm mt-1 line-clamp-2 leading-snug ${isExpanded ? 'text-cream/50' : 'text-ink-400'}`}>
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${isExpanded ? 'text-cream/60' : 'text-ink-400'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className={`text-xs font-bold ${isExpanded ? 'text-accent-300' : 'text-accent-600'}`}>
                        {formatPrice(Number(service.price), service.currency)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                      isExpanded
                        ? 'bg-accent-500 text-cream rotate-90'
                        : 'bg-ink-900/5 text-ink-400 group-hover:bg-ink-900 group-hover:text-cream group-hover:translate-x-0.5'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Inline doplňky */}
                <AnimatePresence>
                  {isExpanded && addonServices.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-cream/10 px-5 lg:px-6 py-5">
                        <p className="text-[11px] font-bold text-cream/40 uppercase tracking-[0.2em] mb-3">
                          Doplňkové služby
                        </p>
                        <div className="space-y-2 mb-4">
                          {addonServices.map((addon) => {
                            const checked = selectedAddons.some((a) => a.id === addon.id)
                            return (
                              <button
                                key={addon.id}
                                onClick={() => toggleAddon(addon)}
                                className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all duration-200 border ${
                                  checked
                                    ? 'bg-accent-500 border-accent-500 text-cream'
                                    : 'bg-cream/5 border-cream/15 text-cream/80 hover:border-cream/40'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                  checked ? 'bg-cream border-cream' : 'border-cream/30'
                                }`}>
                                  {checked && (
                                    <svg className="w-3 h-3 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold">{addon.name}</p>
                                  {addon.description && (
                                    <p className={`text-xs mt-0.5 ${checked ? 'text-cream/70' : 'text-cream/40'}`}>{addon.description}</p>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs font-bold">
                                    +{formatPrice(Number(addon.price), addon.currency)}
                                  </p>
                                  <p className={`text-[11px] ${checked ? 'text-cream/70' : 'text-cream/40'}`}>
                                    {formatDuration(addon.duration_minutes)}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <button
                          onClick={() => handleContinue(service)}
                          className="w-full py-3 bg-cream text-ink-900 rounded-full text-sm font-bold hover:bg-accent-100 transition-colors active:scale-[0.98]"
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

      {/* Souhrn ceny při vybraných doplňcích */}
      <AnimatePresence>
        {expandedService && selectedAddons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 px-5 py-3.5 bg-cream rounded-2xl border border-ink-900/10 shadow-soft flex items-center justify-between"
          >
            <span className="text-sm text-ink-500 font-medium">
              Celkem ({1 + selectedAddons.length} {1 + selectedAddons.length === 1 ? 'služba' : selectedAddons.length <= 3 ? 'služby' : 'služeb'})
            </span>
            <span className="font-display text-lg text-ink-900">
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
