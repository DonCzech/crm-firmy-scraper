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
  require_email: boolean
  require_phone: boolean
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
            require_email: u.require_email ?? true,
            require_phone: u.require_phone ?? false,
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

  // Povinnost kontaktů řídí poskytovatel v adminu; server validuje totéž znovu.
  const requireEmail = paymentOptions?.require_email !== false
  const requirePhone = paymentOptions?.require_phone === true

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
    if (!form.clientEmail.trim() && !form.clientPhone.trim()) {
      setError('Zadejte e-mail nebo telefon, abychom vás mohli kontaktovat')
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
          <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-1">Poslední krok</p>
          <h2 className="font-display text-3xl lg:text-4xl text-ink-900 leading-tight">Vaše údaje</h2>
          <p className="text-sm text-ink-400 mt-1.5">Vyplňte kontaktní informace</p>
        </div>
      </div>

      <div className="card p-5 lg:p-7">
        {/* Souhrn rezervace — mobilní (na desktopu je v levém panelu) */}
        <div className="lg:hidden bg-ink-900 text-cream rounded-2xl p-5 mb-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-accent-500/20 blur-xl pointer-events-none" />
          <p className="font-display text-lg leading-snug">{service.name}</p>
          {addons.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {addons.map((a) => (
                <p key={a.id} className="text-xs text-cream/60">+ {a.name}</p>
              ))}
            </div>
          )}
          {staffName && <p className="text-xs text-cream/60 mt-1.5">s {staffName}</p>}
          <p className="text-sm text-cream/80 capitalize mt-2">{formattedDate}</p>
          <p className="text-sm text-cream/80">{time} – {endTime} ({totalDuration} min)</p>
          {totalPrice > 0 && (
            <p className="text-lg font-bold mt-2 text-accent-300">
              {totalPrice.toLocaleString('cs-CZ')} {service.currency}
            </p>
          )}
        </div>

        {/* Formulář */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                Celé jméno <span className="text-accent-600">*</span>
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
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">
                E-mailová adresa {requireEmail
                  ? <span className="text-accent-600">*</span>
                  : <span className="text-ink-400 font-normal text-xs">(nepovinné)</span>}
              </label>
              <input
                type="email"
                name="clientEmail"
                value={form.clientEmail}
                onChange={handleChange}
                className="input-field"
                placeholder="jan@email.cz"
                required={requireEmail}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">
              Telefonní číslo {requirePhone
                ? <span className="text-accent-600">*</span>
                : <span className="text-ink-400 font-normal text-xs">(nepovinné)</span>}
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={form.clientPhone}
              onChange={handleChange}
              className="input-field"
              placeholder="+420 777 123 456"
              required={requirePhone}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">
              Poznámky <span className="text-ink-400 font-normal text-xs">(nepovinné)</span>
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

          {/* Způsob platby */}
          {paymentOptions && multiplePaymentMethods && (
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                Způsob platby <span className="text-accent-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentOptions.payment_cash && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      paymentMethod === 'cash'
                        ? 'border-ink-900 bg-ink-900 text-cream shadow-soft'
                        : 'border-ink-900/15 bg-cream hover:border-ink-900/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'cash' ? 'bg-accent-500' : 'bg-ink-900/5'
                    }`}>
                      <svg className={`w-4 h-4 ${paymentMethod === 'cash' ? 'text-cream' : 'text-ink-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'cash' ? 'text-cream' : 'text-ink-800'}`}>Hotově</p>
                      <p className={`text-xs ${paymentMethod === 'cash' ? 'text-cream/60' : 'text-ink-400'}`}>Na místě</p>
                    </div>
                  </button>
                )}
                {paymentOptions.payment_transfer && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      paymentMethod === 'transfer'
                        ? 'border-ink-900 bg-ink-900 text-cream shadow-soft'
                        : 'border-ink-900/15 bg-cream hover:border-ink-900/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === 'transfer' ? 'bg-accent-500' : 'bg-ink-900/5'
                    }`}>
                      <svg className={`w-4 h-4 ${paymentMethod === 'transfer' ? 'text-cream' : 'text-ink-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${paymentMethod === 'transfer' ? 'text-cream' : 'text-ink-800'}`}>Převodem</p>
                      <p className={`text-xs ${paymentMethod === 'transfer' ? 'text-cream/60' : 'text-ink-400'}`}>QR kód v potvrzení</p>
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
              className="bg-accent-50 border border-accent-200 text-accent-700 px-4 py-3 rounded-xl text-sm font-medium"
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
            ) : (
              <>
                Potvrdit rezervaci
                {totalPrice > 0 && (
                  <span className="text-cream/60 font-medium">· {totalPrice.toLocaleString('cs-CZ')} {service.currency}</span>
                )}
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-ink-400 mt-4 text-center">
          Po potvrzení obdržíte e-mail s detaily rezervace.
        </p>
      </div>
    </div>
  )
}
