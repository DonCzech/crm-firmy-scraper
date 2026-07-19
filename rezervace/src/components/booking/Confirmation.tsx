'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Service, BookingFormData } from '@/types'

interface PaymentInfo {
  bank_iban: string
  bank_owner: string
  payment_note: string
}

interface Props {
  service: Service
  date: string
  time: string
  formData: BookingFormData
  providerName: string
  providerSlug: string
  paymentMethod: string
  totalPrice?: number
}

function buildGoogleCalendarUrl(params: {
  title: string
  date: string
  startTime: string
  duration: number
}): string {
  const start = new Date(`${params.date}T${params.startTime}:00`)
  const end = new Date(start.getTime() + params.duration * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(params.title)}&dates=${fmt(start)}/${fmt(end)}`
}

function buildICSData(params: {
  title: string
  date: string
  startTime: string
  duration: number
  description: string
}): string {
  const start = new Date(`${params.date}T${params.startTime}:00`)
  const end = new Date(start.getTime() + params.duration * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') + 'Z'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${params.title}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `DESCRIPTION:${params.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function buildSPD(iban: string, amount: number, currency: string, message: string): string {
  const am = amount > 0 ? `*AM:${amount.toFixed(2)}` : ''
  const msg = message ? `*MSG:${message.substring(0, 60)}` : ''
  return `SPD*1.0*ACC:${iban}${am}*CC:${currency}${msg}`
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hour, minute] = time.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  const endHour = Math.floor(total / 60) % 24
  const endMinute = total % 60
  return `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
}

export default function Confirmation({ service, date, time, formData, providerName, providerSlug, paymentMethod, totalPrice = 0 }: Props) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)

  useEffect(() => {
    if (paymentMethod === 'transfer') {
      fetch(`/api/users/${providerSlug}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.bank_iban) {
            setPaymentInfo({
              bank_iban: data.user.bank_iban,
              bank_owner: data.user.bank_owner || '',
              payment_note: data.user.payment_note || '',
            })
          }
        })
        .catch(() => {})
    }
  }, [providerSlug, paymentMethod])

  const formattedDate = format(new Date(date + 'T00:00:00'), "EEEE, d. MMMM yyyy", { locale: cs })
  const endTime = addMinutesToTime(time, service.duration_minutes)

  const googleUrl = buildGoogleCalendarUrl({
    title: `${service.name} s ${providerName}`,
    date,
    startTime: time,
    duration: service.duration_minutes,
  })

  function downloadICS() {
    const ics = buildICSData({
      title: `${service.name} s ${providerName}`,
      date,
      startTime: time,
      duration: service.duration_minutes,
      description: `Rezervace: ${service.name}\nPoskytovatel: ${providerName}`,
    })
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rezervace.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1, opacity: 1,
      transition: { type: 'spring' as const, stiffness: 350, damping: 20, delay: 0.1 },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.4 + i * 0.1, type: 'spring' as const, stiffness: 300, damping: 28 },
    }),
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero — inkoustový panel */}
      <div className="relative bg-ink-900 text-cream rounded-t-3xl p-10 text-center overflow-hidden grain">
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-accent-500/25 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-56 h-56 rounded-full bg-sage-500/15 blur-2xl pointer-events-none" />

        <motion.div
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
          className="w-20 h-20 bg-accent-500 rounded-full flex items-center justify-center mx-auto shadow-lift relative"
        >
          <svg className="w-10 h-10 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2
          custom={0} variants={textVariants} initial="hidden" animate="visible"
          className="font-display text-3xl lg:text-4xl mt-6"
        >
          Rezervace potvrzena
        </motion.h2>

        <motion.p
          custom={1} variants={textVariants} initial="hidden" animate="visible"
          className="text-cream/60 mt-3 text-sm"
        >
          Potvrzení bylo zasláno na <strong className="text-cream">{formData.clientEmail}</strong>
        </motion.p>
      </div>

      {/* Ticket — perforovaný předěl */}
      <div className="relative bg-cream rounded-b-3xl shadow-soft border border-t-0 border-ink-900/10">
        <div className="absolute -top-3 left-0 right-0 flex items-center px-2" aria-hidden>
          <div className="w-6 h-6 rounded-full bg-paper -ml-5" />
          <div className="flex-1 border-t-2 border-dashed border-ink-900/15 mt-3" />
          <div className="w-6 h-6 rounded-full bg-paper -mr-5" />
        </div>

        <div className="p-6 lg:p-8 pt-8">
          {/* Detaily */}
          <motion.div
            custom={2} variants={textVariants} initial="hidden" animate="visible"
            className="text-left"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent-600 font-bold mb-2">Vaše rezervace</p>
            <p className="font-display text-2xl text-ink-900 leading-tight mb-5">{service.name}</p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-ink-700 capitalize font-medium">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-ink-700 font-medium">{time} – {endTime} ({service.duration_minutes} min)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-ink-700 font-medium">{providerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="text-ink-700 font-medium">{formData.clientEmail}</span>
              </div>
              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 text-ink-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-ink-700 font-medium">Platba hotově na místě</span>
                </div>
              )}
              {totalPrice > 0 && (
                <div className="pt-3 mt-3 border-t border-ink-900/10 flex items-center justify-between">
                  <span className="text-sm text-ink-400 font-medium">Celkem</span>
                  <span className="font-display text-xl text-ink-900">{totalPrice.toLocaleString('cs-CZ')} {service.currency}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* QR platba převodem */}
          {paymentMethod === 'transfer' && paymentInfo?.bank_iban && (
            <motion.div
              custom={3} variants={textVariants} initial="hidden" animate="visible"
              className="mt-6"
            >
              <div className="bg-ink-900/[0.03] border border-ink-900/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="font-display text-lg text-ink-900">Platba převodem</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="bg-white rounded-xl p-3 shadow-soft border border-ink-900/10 flex-shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&ecc=M&data=${encodeURIComponent(buildSPD(paymentInfo.bank_iban, totalPrice, service.currency, `Rezervace ${service.name}`))}`}
                      alt="QR platba"
                      className="w-40 h-40"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left space-y-2.5 flex-1">
                    {totalPrice > 0 && (
                      <div>
                        <p className="text-[10px] text-ink-400 font-bold uppercase tracking-[0.2em]">Částka</p>
                        <p className="font-display text-2xl text-ink-900">{totalPrice.toLocaleString('cs-CZ')} {service.currency}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-ink-400 font-bold uppercase tracking-[0.2em]">IBAN</p>
                      <p className="text-sm font-mono text-ink-800 break-all">{paymentInfo.bank_iban}</p>
                    </div>
                    {paymentInfo.bank_owner && (
                      <div>
                        <p className="text-[10px] text-ink-400 font-bold uppercase tracking-[0.2em]">Příjemce</p>
                        <p className="text-sm text-ink-800">{paymentInfo.bank_owner}</p>
                      </div>
                    )}
                    {paymentInfo.payment_note && (
                      <p className="text-xs text-ink-700 bg-ink-900/5 rounded-lg px-3 py-2">{paymentInfo.payment_note}</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ink-400 mt-3 text-center">Naskenujte QR kód mobilní aplikací vaší banky</p>
              </div>
            </motion.div>
          )}

          {/* Přidat do kalendáře */}
          <motion.div
            custom={paymentMethod === 'transfer' ? 4 : 3} variants={textVariants} initial="hidden" animate="visible"
            className="mt-7 text-center"
          >
            <p className="text-[11px] uppercase tracking-[0.25em] text-ink-400 font-bold mb-3">Přidat do kalendáře</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-cream border border-ink-900/15 rounded-full text-sm font-semibold text-ink-800 hover:bg-ink-900 hover:text-cream hover:border-ink-900 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Google Calendar
              </a>
              <button
                onClick={downloadICS}
                className="flex items-center gap-2 px-5 py-2.5 bg-cream border border-ink-900/15 rounded-full text-sm font-semibold text-ink-800 hover:bg-ink-900 hover:text-cream hover:border-ink-900 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Apple / Outlook (.ics)
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
