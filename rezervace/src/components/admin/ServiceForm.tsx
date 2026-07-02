'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Service } from '@/types'

interface Props {
  service: Service | null
  onClose: () => void
  onSaved: () => void
}

const COLORS = [
  '#006bff',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#6366f1',
]

const NAME_MAX_LENGTH = 80
const DESCRIPTION_MAX_LENGTH = 250

export default function ServiceForm({ service, onClose, onSaved }: Props) {
  const isEdit = !!service

  const [form, setForm] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    currency: 'CZK',
    color: '#006bff',
    image_url: '',
    sort_order: '',
    is_addon: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        description: service.description,
        duration_minutes: service.duration_minutes,
        price: Number(service.price),
        currency: service.currency,
        color: service.color,
        image_url: service.image_url || '',
        sort_order: (service.sort_order ?? 0) > 0 ? String(service.sort_order) : '',
        is_addon: service.is_addon || false,
      })
      setImagePreview(service.image_url || '')
    }
  }, [service])

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1_500_000) {
      setError('Obrázek je příliš velký. Maximum je 1,5 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setImagePreview(base64)
      setForm((p) => ({ ...p, image_url: base64 }))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImagePreview('')
    setForm((p) => ({ ...p, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    const nextValue =
      name === 'description'
        ? value.slice(0, DESCRIPTION_MAX_LENGTH)
        : name === 'name'
        ? value.slice(0, NAME_MAX_LENGTH)
        : value
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'sort_order'
        ? nextValue
        : name === 'duration_minutes' || name === 'price'
        ? Number(nextValue)
        : nextValue,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/services/${service!.id}` : '/api/services'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = {
        ...form,
        sort_order: form.sort_order === '' ? null : Number(form.sort_order),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Nastala chyba')
        return
      }

      onSaved()
    } catch {
      setError('Nastala chyba. Zkuste to prosím znovu.')
    } finally {
      setLoading(false)
    }
  }

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
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[calc(100vh-1rem)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-900">
            {isEdit ? 'Upravit službu' : 'Přidat službu'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-5 gap-y-4 overflow-y-auto lg:overflow-visible flex-1">
          <div className="lg:col-span-2 grid grid-cols-[minmax(0,1fr)_96px] sm:grid-cols-[minmax(0,1fr)_128px] lg:grid-cols-[minmax(0,1fr)_144px] gap-4 sm:gap-5 items-start">
            <div>
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Název <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-400">
                    Zbývá {NAME_MAX_LENGTH - form.name.length} znaků
                  </span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Osobní konzultace"
                  maxLength={NAME_MAX_LENGTH}
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-400">Maximum {NAME_MAX_LENGTH} znaků.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Obrázek</label>
              {imagePreview ? (
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100">
                  <img src={imagePreview} alt="Náhled" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square w-full border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="px-2 text-center text-[11px] leading-tight">Nahrát</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                className="hidden"
              />
            </div>

            <div className="col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-gray-700">Popis</label>
                <span className="text-xs text-gray-400">
                  Zbývá {DESCRIPTION_MAX_LENGTH - form.description.length} znaků
                </span>
              </div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field resize-none min-h-[92px] sm:min-h-[116px]"
                rows={3}
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Krátký popis služby..."
              />
              <p className="mt-1 text-xs text-gray-400">Maximum {DESCRIPTION_MAX_LENGTH} znaků.</p>
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Délka (minuty) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="duration_minutes"
                  value={form.duration_minutes}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10"
                  required
                >
                  {[15, 20, 30, 45, 60, 75, 90, 120, 180].map((min) => (
                    <option key={min} value={min}>{min} min</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Pořadí</label>
              <input
                type="number"
                name="sort_order"
                value={form.sort_order}
                onChange={handleChange}
                className="input-field"
                min={1}
                placeholder="Automaticky"
              />
              <p className="mt-1 text-xs text-gray-400">Prázdné = podle času přidání.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cena</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                min={0}
                step={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Měna</label>
              <div className="relative">
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="input-field appearance-none pr-10"
                >
                  <option value="CZK">CZK</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative">
            <button
              type="button"
              onClick={() => setShowMoreOptions((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              aria-expanded={showMoreOptions}
            >
              Další služby
              {form.is_addon && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Zapnuto
                </span>
              )}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMoreOptions && (
              <div className="absolute left-0 top-full z-10 mt-2 w-full max-w-md rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    name="is_addon"
                    checked={form.is_addon}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 accent-blue-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">Nabízet jako doplňkovou službu</span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                      Zákazník ji uvidí jako volitelnou nabídku po výběru hlavní služby.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="lg:col-span-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="lg:col-span-2 flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-label={`Vybrat barvu ${color}`}
                >
                  {form.color === color && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary min-w-32">
                Zrušit
              </button>
              <button type="submit" disabled={loading} className="btn-primary min-w-40">
                {loading ? 'Ukládám...' : isEdit ? 'Uložit změny' : 'Přidat službu'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
