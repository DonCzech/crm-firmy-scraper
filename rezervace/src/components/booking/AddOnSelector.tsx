'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Service } from '@/types'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

interface Props {
  mainService: Service
  addons: Service[]
  selectedAddons: Service[]
  onToggle: (addon: Service) => void
  onContinue: () => void
  onSkip: () => void
}

export default function AddOnSelector({ mainService, addons, selectedAddons, onToggle, onContinue, onSkip }: Props) {
  const totalExtra = selectedAddons.reduce((sum, a) => sum + Number(a.price), 0)
  const totalDuration = selectedAddons.reduce((sum, a) => sum + a.duration_minutes, 0)
  const grandTotal = Number(mainService.price) + totalExtra

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✨</span>
          <h2 className="font-semibold text-gray-900">Přidat k rezervaci?</h2>
        </div>
        <p className="text-sm text-gray-500">
          Zvolili jste <strong>{mainService.name}</strong>. Chcete přidat něco dalšího?
        </p>
      </div>

      {/* Addon cards — plain div+onClick for reliable mobile touch */}
      <div className="p-4 space-y-3">
        {addons.map((addon) => {
          const isSelected = selectedAddons.some((a) => a.id === addon.id)
          return (
            <div
              key={addon.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(addon)}
              onKeyDown={(e) => e.key === 'Enter' && onToggle(addon)}
              className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer select-none transition-colors active:scale-[0.98] ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 bg-gray-50 active:bg-gray-100'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Service icon */}
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                {addon.image_url ? (
                  <img src={addon.image_url} alt={addon.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: addon.color + '20' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={addon.color} strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{addon.name}</p>
                {addon.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addon.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{formatDuration(addon.duration_minutes)}</span>
                  {Number(addon.price) > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: addon.color }}>
                      +{Number(addon.price).toLocaleString('cs-CZ')} {addon.currency}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <AnimatePresence>
        {selectedAddons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 overflow-hidden"
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Celkem za vše</span>
                <span className="text-sm font-bold text-green-900">
                  {grandTotal > 0 ? `${grandTotal.toLocaleString('cs-CZ')} ${mainService.currency}` : 'Zdarma'}
                </span>
              </div>
              {totalDuration > 0 && (
                <p className="text-xs text-green-700 mt-0.5">
                  Celková délka: {formatDuration(mainService.duration_minutes + totalDuration)}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="px-4 pb-5 space-y-2">
        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {selectedAddons.length > 0
            ? `Pokračovat (${selectedAddons.length} doplněk přidán)`
            : 'Pokračovat bez doplňků'}
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-gray-400 text-sm hover:text-gray-600 transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Přeskočit
        </button>
      </div>
    </div>
  )
}
