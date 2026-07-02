'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  enterForward: { x: 60, opacity: 0 },
  enterBack: { x: -60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitForward: { x: -60, opacity: 0 },
  exitBack: { x: 60, opacity: 0 },
}

// Steps: 0=Služba, 1=Doplňky, 2=Datum, 3=Čas, 4=Údaje, 5=Hotovo
// Visual progress bar steps: Služba(0), Datum(2), Čas(3), Údaje(4)
const PROGRESS_LABELS = ['Služba', 'Datum', 'Čas', 'Údaje']
function visualStep(step: number) {
  if (step <= 1) return 0
  if (step === 2) return 1
  if (step === 3) return 2
  return 3
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

  // Addon services (non-addon services available as extras)
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

    // Build notes with addon info appended
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      {/* Progress bar (visible until confirmation) */}
      {step < 5 && (
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-1">
            {PROGRESS_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className={`flex items-center gap-1.5 ${i <= vStep ? 'text-blue-600' : 'text-gray-300'}`}>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      i < vStep
                        ? 'bg-blue-600 text-white'
                        : i === vStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < vStep ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{label}</span>
                </div>
                {i < PROGRESS_LABELS.length - 1 && (
                  <div className={`h-px flex-1 w-8 sm:w-12 mx-1 ${i < vStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center p-4 py-6">
        <div className="w-full max-w-4xl">
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
