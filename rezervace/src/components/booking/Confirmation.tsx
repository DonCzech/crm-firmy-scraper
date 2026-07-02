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
    <div className="card overflow-hidden text-center">
      <div className="bg-gradient-to-b from-green-50 to-white p-10 border-b border-gray-100">
        <motion.div
          variants={checkmarkVariants}
          initial="hidden"
          animate="visible"
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-200"
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <motion.h2
          custom={0} variants={textVariants} initial="hidden" animate="visible"
          className="text-2xl font-bold text-gray-900 mt-5"
        >
          Rezervace potvrzena!
        </motion.h2>

        <motion.p
          custom={1} variants={textVariants} initial="hidden" animate="visible"
          className="text-gray-500 mt-2"
        >
          Potvrzení bylo zasláno na <strong>{formData.clientEmail}</strong>
        </motion.p>
      </div>

      <div className="p-6">
        {/* Event details */}
        <motion.div
          custom={2} variants={textVariants} initial="hidden" animate="visible"
          className="bg-gray-50 rounded-xl p-5 mb-6 text-left"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
            <span className="font-semibold text-gray-900">{service.name}</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700 capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">{time} – {endTime} ({service.duration_minutes} min)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-gray-700">{providerName}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="text-gray-700">{formData.clientEmail}</span>
            </div>
            {paymentMethod === 'cash' && (
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-700">Platba hotově na místě</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* QR code for bank transfer */}
        {paymentMethod === 'transfer' && paymentInfo?.bank_iban && (
          <motion.div
            custom={3} variants={textVariants} initial="hidden" animate="visible"
            className="mb-6"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="font-semibold text-blue-900">Platba převodem</p>
              </div>

              {/* QR code */}
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white rounded-xl p-3 shadow-sm border border-blue-100 flex-shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&ecc=M&data=${encodeURIComponent(buildSPD(paymentInfo.bank_iban, totalPrice, service.currency, `Rezervace ${service.name}`))}`}
                    alt="QR platba"
                    className="w-40 h-40"
                    loading="lazy"
                  />
                </div>
                <div className="text-left space-y-2 flex-1">
                  {totalPrice > 0 && (
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Částka</p>
                      <p className="text-2xl font-bold text-blue-900">{totalPrice.toLocaleString('cs-CZ')} {service.currency}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">IBAN</p>
                    <p className="text-sm font-mono text-blue-800 break-all">{paymentInfo.bank_iban}</p>
                  </div>
                  {paymentInfo.bank_owner && (
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Příjemce</p>
                      <p className="text-sm text-blue-800">{paymentInfo.bank_owner}</p>
                    </div>
                  )}
                  {paymentInfo.payment_note && (
                    <p className="text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">{paymentInfo.payment_note}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3 text-center">Naskenujte QR kód mobilní aplikací vaší banky</p>
            </div>
          </motion.div>
        )}

        {/* Add to calendar buttons */}
        <motion.div
          custom={paymentMethod === 'transfer' ? 4 : 3} variants={textVariants} initial="hidden" animate="visible"
          className="space-y-3"
        >
          <p className="text-sm text-gray-500 font-medium">Přidat do kalendáře</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Google Calendar
            </a>
            <button
              onClick={downloadICS}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Apple / Outlook (.ics)
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
