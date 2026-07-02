'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Service, BookingFormData } from '@/types'

interface PaymentOptions {
  payment_cash: boolean
  payment_transfer: boolean
  bank_iban: string
  bank_owner: string
  payment_note: string
}

interface Props {
  service: Service
  addons?: Service[]
  date: string
  time: string
  staffName?: string
  providerSlug: string
  onSubmit: (data: BookingFormData, paymentMethod: string) => Promise<void>
  onBack: () => void
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  const endHour = Math.floor(total / 60) % 24
  const endMinute = total % 60
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

export default function BookingForm({ service, addons = [], date, time, staffName, providerSlug, onSubmit, onBack }: Props) {
  const [form, setForm] = useState<BookingFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientNotes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentOptions, setPaymentOptions] = useState<PaymentOptions | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | ''>('')

  useEffect(() => {
    fetch(`/api/users/${providerSlug}`)
      .then((r) => r.json())
      .then((data) => {
        const u = data.user
        if (u) {
          const opts: PaymentOptions = {
            payment_cash: u.payment_cash ?? true,
            payment_transfer: u.payment_transfer ?? false,
            bank_iban: u.bank_iban || '',
            bank_owner: u.bank_owner || '',
            payment_note: u.payment_note || '',
          }
          setPaymentOptions(opts)
          // Auto-select if only one method enabled
          if (opts.payment_cash && !opts.payment_transfer) setPaymentMethod('cash')
          else if (!opts.payment_cash && opts.payment_transfer) setPaymentMethod('transfer')
        }
      })
      .catch(() => {})
  }, [providerSlug])

  const multiplePaymentMethods = paymentOptions
    ? (paymentOptions.payment_cash ? 1 : 0) + (paymentOptions.payment_transfer ? 1 : 0) > 1
    : false

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (multiplePaymentMethods && !paymentMethod) {
      setError('Vyberte způsob platby')
      return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit(form, paymentMethod)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba. Zkuste to prosím znovu.')
    } finally {
      setLoading(false)
    }
  }

  const formattedDate = format(new Date(date + 'T00:00:00'), "EEEE, d. MMMM yyyy", { locale: cs })
  const totalDuration = service.duration_minutes + addons.reduce((s, a) => s + a.duration_minutes, 0)
  const endTime = addMinutesToTime(time, totalDuration)
  const totalPrice = Number(service.price) + addons.reduce((s, a) => s + Number(a.price), 0)

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
          <h2 className="font-semibold text-gray-900">Vaše údaje</h2>
          <p className="text-sm text-gray-500">Vyplňte kontaktní informace</p>
        </div>
      </div>

      <div className="p-6">
        {/* Booking summary */}
        <div
          className="rounded-xl p-4 mb-6 border"
          style={{
            backgroundColor: service.color + '10',
            borderColor: service.color + '30',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: service.color + '20' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={service.color} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
              {addons.length > 0 && (
                <div className="mt-0.5 space-y-0.5">
                  {addons.map((a) => (
                    <p key={a.id} className="text-xs text-blue-600">+ {a.name}</p>
                  ))}
                </div>
              )}
              {staffName && <p className="text-xs text-gray-500 mt-0.5">Pracovník: {staffName}</p>}
              <p className="text-sm text-gray-600 capitalize mt-0.5">{formattedDate}</p>
              <p className="text-sm text-gray-600">{time} – {endTime} ({totalDuration} min)</p>
              {totalPrice > 0 && (
                <p className="text-sm font-medium mt-0.5" style={{ color: service.color }}>
                  {totalPrice.toLocaleString('cs-CZ')} {service.currency}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Celé jméno <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                className="input-field"
                placeholder="Jan Novák"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                E-mailová adresa <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="clientEmail"
                value={form.clientEmail}
                onChange={handleChange}
                className="input-field"
                placeholder="jan@email.cz"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefonní číslo <span className="text-gray-400 font-normal text-xs">(nepovinné)</span>
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={form.clientPhone}
              onChange={handleChange}
              className="input-field"
              placeholder="+420 777 123 456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Poznámky <span className="text-gray-400 font-normal text-xs">(nepovinné)</span>
            </label>
            <textarea
              name="clientNotes"
              value={form.clientNotes}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="Co byste chtěli probrat nebo jiné informace..."
            />
          </div>

          {/* Payment method selection */}
          {paymentOptions && multiplePaymentMethods && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Způsob platby <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentOptions.payment_cash && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                      paymentMethod === 'cash'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cash' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-green-800' : 'text-gray-700'}`}>Hotově</p>
                      <p className="text-xs text-gray-500">Na místě</p>
                    </div>
                  </button>
                )}
                {paymentOptions.payment_transfer && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left ${
                      paymentMethod === 'transfer'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'transfer' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${paymentMethod === 'transfer' ? 'text-blue-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${paymentMethod === 'transfer' ? 'text-blue-800' : 'text-gray-700'}`}>Převodem</p>
                      <p className="text-xs text-gray-500">QR kód v potvrzení</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Rezervuji...
              </>
            ) : 'Potvrdit rezervaci'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Po potvrzení obdržíte e-mail s detaily rezervace.
        </p>
      </div>
    </div>
  )
}
