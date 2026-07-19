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
    <div>
      {/* Nadpis */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-2">Doplňky</p>
        <h2 className="font-display text-3xl lg:text-4xl text-ink-900 leading-tight">Přidat něco navíc?</h2>
        <p className="text-sm text-ink-400 mt-2">
          Zvolili jste <strong className="text-ink-700">{mainService.name}</strong>.
        </p>
      </div>

      {/* Karty doplňků — div+onClick kvůli spolehlivému mobile touch */}
      <div className="space-y-3">
        {addons.map((addon) => {
          const isSelected = selectedAddons.some((a) => a.id === addon.id)
          return (
            <div
              key={addon.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggle(addon)}
              onKeyDown={(e) => e.key === 'Enter' && onToggle(addon)}
              className={`w-full text-left flex items-center gap-4 p-4 lg:p-5 rounded-2xl border cursor-pointer select-none transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? 'border-ink-900 bg-ink-900 text-cream shadow-ink-glow'
                  : 'border-ink-900/10 bg-cream shadow-soft hover:shadow-lift hover:border-ink-900/30'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-accent-500 border-accent-500' : 'border-ink-900/25 bg-cream'
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>

              {/* Ikona / obrázek */}
              <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                {addon.image_url ? (
                  <img src={addon.image_url} alt={addon.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'bg-cream/10' : 'bg-ink-900/5'}`}>
                    <svg className={`w-5 h-5 ${isSelected ? 'text-accent-300' : 'text-accent-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-display text-base leading-tight ${isSelected ? 'text-cream' : 'text-ink-900'}`}>{addon.name}</p>
                {addon.description && (
                  <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-cream/50' : 'text-ink-400'}`}>{addon.description}</p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                {Number(addon.price) > 0 && (
                  <p className={`text-sm font-bold ${isSelected ? 'text-accent-300' : 'text-accent-600'}`}>
                    +{Number(addon.price).toLocaleString('cs-CZ')} {addon.currency}
                  </p>
                )}
                <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-cream/50' : 'text-ink-400'}`}>{formatDuration(addon.duration_minutes)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Souhrn */}
      <AnimatePresence>
        {selectedAddons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-cream border border-ink-900/10 rounded-2xl px-5 py-4 shadow-soft flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-500">Celkem za vše</p>
                {totalDuration > 0 && (
                  <p className="text-xs text-ink-400 mt-0.5">
                    Délka: {formatDuration(mainService.duration_minutes + totalDuration)}
                  </p>
                )}
              </div>
              <span className="font-display text-xl text-ink-900">
                {grandTotal > 0 ? `${grandTotal.toLocaleString('cs-CZ')} ${mainService.currency}` : 'Zdarma'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tlačítka */}
      <div className="mt-5 space-y-2">
        <button
          onClick={onContinue}
          className="btn-primary w-full"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {selectedAddons.length > 0
            ? `Pokračovat (${selectedAddons.length} doplněk přidán)`
            : 'Pokračovat bez doplňků'}
        </button>
        <button
          onClick={onSkip}
          className="w-full py-2.5 text-ink-400 text-sm font-medium hover:text-ink-700 transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Přeskočit
        </button>
      </div>
    </div>
  )
}
