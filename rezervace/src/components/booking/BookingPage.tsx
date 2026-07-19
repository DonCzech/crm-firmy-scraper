'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import ServiceSelector from './ServiceSelector'
import AddOnSelector from './AddOnSelector'
import BookingCalendar from './BookingCalendar'
import TimeSlots from './TimeSlots'
import BookingForm from './BookingForm'
import Confirmation from './Confirmation'
import type { User, Service, Staff, BookingFormData } from '@/types'

interface Props {
  user: User
  services: Service[]
  staff?: Staff[]
}

const slideVariants = {
  enterForward: { x: 48, opacity: 0 },
  enterBack: { x: -48, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitForward: { x: -48, opacity: 0 },
  exitBack: { x: 48, opacity: 0 },
}

// Steps: 0=Služba, 1=Doplňky, 2=Datum, 3=Čas, 4=Údaje, 5=Hotovo
const PROGRESS_LABELS = ['Služba', 'Datum', 'Čas', 'Údaje']
function visualStep(step: number) {
  if (step <= 1) return 0
  if (step === 2) return 1
  if (step === 3) return 2
  return 3
}

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Zdarma'
  return `${Number(price).toLocaleString('cs-CZ')} ${currency}`
}

export default function BookingPage({ user, services, staff = [] }: Props) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedAddons, setSelectedAddons] = useState<Service[]>([])
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<{
    service: Service
    addons: Service[]
    date: string
    time: string
    formData: BookingFormData
    staffName?: string
    paymentMethod: string
  } | null>(null)

  const addonServices = services.filter((s) => s.is_addon)
  const mainServices = services.filter((s) => !s.is_addon)

  function goTo(nextStep: number) {
    setDirection(nextStep > step ? 1 : -1)
    setStep(nextStep)
  }

  function handleServiceSelect(service: Service, addons: Service[] = []) {
    setSelectedService(service)
    setSelectedAddons(addons)
    goTo(2)
  }

  function handleAddonToggle(addon: Service) {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  function handleDateSelect(date: string) {
    setSelectedDate(date)
    goTo(3)
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time)
    goTo(4)
  }

  async function handleFormSubmit(formData: BookingFormData, paymentMethod: string) {
    if (!selectedService || !selectedDate || !selectedTime) return

    const addonNote = selectedAddons.length > 0
      ? `\n[Doplňky: ${selectedAddons.map((a) => `${a.name} (+${Number(a.price)} ${a.currency})`).join(', ')}]`
      : ''
    const combinedNotes = (formData.clientNotes || '') + addonNote

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: selectedService.id,
        providerSlug: user.slug,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientNotes: combinedNotes,
        bookingDate: selectedDate,
        startTime: selectedTime,
        staffId: selectedStaff?.id || null,
        paymentMethod,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Rezervace selhala')
    }

    setConfirmedBooking({
      service: selectedService,
      addons: selectedAddons,
      date: selectedDate,
      time: selectedTime,
      formData,
      staffName: selectedStaff?.name,
      paymentMethod,
    })
    goTo(5)
  }

  const vStep = visualStep(step)
  const totalPrice = selectedService
    ? Number(selectedService.price) + selectedAddons.reduce((s, a) => s + Number(a.price), 0)
    : 0

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-10 lg:grid lg:grid-cols-[340px_1fr] lg:gap-8 lg:items-start">

        {/* ── Levý panel: identita + živý souhrn (desktop) ── */}
        <aside className="hidden lg:block sticky top-10">
          <div className="relative bg-ink-900 text-cream rounded-3xl p-8 shadow-ink-glow overflow-hidden grain">
            {/* dekorativní kruh */}
            <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-accent-500/20 blur-2xl pointer-events-none" />

            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover mb-5 ring-1 ring-cream/20"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-cream text-xl font-bold mb-5 ring-1 ring-cream/20"
                style={{ backgroundColor: user.avatar_color }}
              >
                {initials}
              </div>
            )}

            <h1 className="font-display text-3xl leading-tight">{user.name}</h1>
            {user.bio && <p className="text-sm text-cream/60 mt-2 leading-relaxed">{user.bio}</p>}

            {/* kroky */}
            <div className="mt-8 space-y-1 relative">
              {PROGRESS_LABELS.map((label, i) => {
                const done = i < vStep && step < 5
                const active = i === vStep && step < 5
                const finished = step === 5
                return (
                  <div key={label} className="flex items-center gap-3 py-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                        done || finished
                          ? 'bg-accent-500 text-cream'
                          : active
                          ? 'bg-cream text-ink-900'
                          : 'bg-cream/10 text-cream/40'
                      }`}
                    >
                      {done || finished ? (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${
                        active ? 'text-cream' : done || finished ? 'text-cream/70' : 'text-cream/35'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* živý souhrn */}
            <AnimatePresence>
              {selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="mt-8 pt-6 border-t border-cream/15"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-3">Vaše rezervace</p>
                  <p className="font-display text-lg leading-snug">{selectedService.name}</p>
                  {selectedAddons.map((a) => (
                    <p key={a.id} className="text-xs text-cream/60 mt-1">+ {a.name}</p>
                  ))}
                  {selectedStaff && (
                    <p className="text-xs text-cream/60 mt-2">s {selectedStaff.name}</p>
                  )}
                  {selectedDate && (
                    <p className="text-sm text-cream/80 mt-2 capitalize">
                      {format(new Date(selectedDate + 'T00:00:00'), 'EEEE d. M. yyyy', { locale: cs })}
                      {selectedTime ? ` · ${selectedTime}` : ''}
                    </p>
                  )}
                  <p className="text-xl font-bold mt-3 text-accent-300">
                    {formatPrice(totalPrice, selectedService.currency)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[11px] text-ink-400 text-center mt-4 tracking-wide">
            Zabezpečená rezervace · potvrzení e-mailem
          </p>
        </aside>

        {/* ── Mobilní hlavička ── */}
        {step < 5 && (
          <div className="lg:hidden mb-5">
            <div className="bg-ink-900 text-cream rounded-2xl px-5 py-4 flex items-center gap-4 shadow-ink-glow relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-accent-500/20 blur-xl pointer-events-none" />
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-11 h-11 rounded-xl object-cover ring-1 ring-cream/20" />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-cream font-bold ring-1 ring-cream/20"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg leading-tight truncate">{user.name}</p>
                <p className="text-[11px] text-cream/50 mt-0.5">
                  {PROGRESS_LABELS[vStep]} · krok {vStep + 1} ze {PROGRESS_LABELS.length}
                </p>
              </div>
              <div className="flex gap-1">
                {PROGRESS_LABELS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === vStep ? 'w-5 bg-accent-400' : i < vStep ? 'w-2 bg-cream/70' : 'w-2 bg-cream/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Obsah kroků ── */}
        <div className="w-full min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial={direction > 0 ? 'enterForward' : 'enterBack'}
              animate="center"
              exit={direction > 0 ? 'exitForward' : 'exitBack'}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {step === 0 && (
                <ServiceSelector
                  services={mainServices}
                  addonServices={addonServices}
                  user={user}
                  staff={staff}
                  onSelect={handleServiceSelect}
                />
              )}

              {step === 1 && selectedService && (
                <AddOnSelector
                  mainService={selectedService}
                  addons={addonServices}
                  selectedAddons={selectedAddons}
                  onToggle={handleAddonToggle}
                  onContinue={() => goTo(2)}
                  onSkip={() => goTo(2)}
                />
              )}

              {step === 2 && selectedService && (
                <BookingCalendar
                  service={selectedService}
                  providerSlug={user.slug}
                  staff={staff}
                  selectedStaff={selectedStaff}
                  onStaffSelect={setSelectedStaff}
                  onDateSelect={handleDateSelect}
                  onBack={() => addonServices.length > 0 ? goTo(1) : goTo(0)}
                  onChangeService={() => goTo(0)}
                />
              )}

              {step === 3 && selectedService && selectedDate && (
                <TimeSlots
                  service={selectedService}
                  providerSlug={user.slug}
                  date={selectedDate}
                  staffId={selectedStaff?.id}
                  onTimeSelect={handleTimeSelect}
                  onBack={() => goTo(2)}
                />
              )}

              {step === 4 && selectedService && selectedDate && selectedTime && (
                <BookingForm
                  service={selectedService}
                  addons={selectedAddons}
                  date={selectedDate}
                  time={selectedTime}
                  staffName={selectedStaff?.name}
                  providerSlug={user.slug}
                  onSubmit={handleFormSubmit}
                  onBack={() => goTo(3)}
                />
              )}

              {step === 5 && confirmedBooking && (
                <Confirmation
                  service={confirmedBooking.service}
                  date={confirmedBooking.date}
                  time={confirmedBooking.time}
                  formData={confirmedBooking.formData}
                  providerName={user.name}
                  providerSlug={user.slug}
                  paymentMethod={confirmedBooking.paymentMethod}
                  totalPrice={Number(confirmedBooking.service.price) + confirmedBooking.addons.reduce((s, a) => s + Number(a.price), 0)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
