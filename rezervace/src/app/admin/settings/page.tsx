'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

interface UserProfile {
  name: string
  email: string
  slug: string
  bio: string
  avatar_color: string
  avatar_url: string
  timezone: string
  min_booking_hours: number
  buffer_minutes: number
  payment_cash: boolean
  payment_transfer: boolean
  bank_iban: string
  bank_owner: string
  payment_note: string
}

interface AvailabilityOverride {
  id: string
  date: string
  is_available: boolean
  start_time: string | null
  end_time: string | null
  note: string
}

interface AvailabilityDay {
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const DAYS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
const COLORS = ['#c084fc', '#006bff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    slug: '',
    bio: '',
    avatar_color: '#c084fc',
    avatar_url: '',
    timezone: 'Europe/Prague',
    min_booking_hours: 0,
    buffer_minutes: 0,
    payment_cash: true,
    payment_transfer: false,
    bank_iban: '',
    bank_owner: '',
    payment_note: '',
  })
  const [paymentSaving, setPaymentSaving] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState('')
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [availability, setAvailability] = useState<AvailabilityDay[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '17:00',
      is_active: i >= 1 && i <= 5, // Mon-Fri
    }))
  )
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([])
  const [newOverride, setNewOverride] = useState({ date: '', is_available: false, start_time: '09:00', end_time: '17:00', note: '' })
  const [overrideSaving, setOverrideSaving] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [availabilitySaving, setAvailabilitySaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [availabilitySuccess, setAvailabilitySuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/availability/overrides').then((r) => r.json()),
    ])
      .then(([meData, ovData]) => {
        if (meData.user) {
          setProfile({
            name: meData.user.name || '',
            email: meData.user.email || '',
            slug: meData.user.slug || '',
            bio: meData.user.bio || '',
            avatar_color: meData.user.avatar_color || '#c084fc',
            avatar_url: meData.user.avatar_url || '',
            timezone: meData.user.timezone || 'Europe/Prague',
            min_booking_hours: Number(meData.user.min_booking_hours) || 0,
            buffer_minutes: Number(meData.user.buffer_minutes) || 0,
            payment_cash: meData.user.payment_cash ?? true,
            payment_transfer: meData.user.payment_transfer ?? false,
            bank_iban: meData.user.bank_iban || '',
            bank_owner: meData.user.bank_owner || '',
            payment_note: meData.user.payment_note || '',
          })
          setAvatarPreview(meData.user.avatar_url || '')
          if (meData.availability && meData.availability.length > 0) {
            setAvailability(meData.availability)
          }
        }
        if (Array.isArray(ovData)) setOverrides(ovData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function doSaveProfile() {
    setProfileSaving(true)
    setProfileError('')
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setProfileSuccess(true)
        setTimeout(() => setProfileSuccess(false), 3000)
      } else {
        const data = await res.json().catch(() => ({}))
        setProfileError(data.error || `Chyba ${res.status}`)
      }
    } catch {
      setProfileError('Síťová chyba, zkuste znovu.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    await doSaveProfile()
  }

  async function saveAvailability() {
    setAvailabilitySaving(true)
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })
      if (res.ok) {
        setAvailabilitySuccess(true)
        setTimeout(() => setAvailabilitySuccess(false), 3000)
      }
    } finally {
      setAvailabilitySaving(false)
    }
  }

  async function saveOverride() {
    if (!newOverride.date) return
    setOverrideSaving(true)
    try {
      const res = await fetch('/api/availability/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOverride),
      })
      if (res.ok) {
        const saved = await res.json()
        setOverrides((prev) => {
          const idx = prev.findIndex((o) => o.date === saved.date)
          return idx >= 0
            ? prev.map((o, i) => (i === idx ? saved : o))
            : [...prev, saved].sort((a, b) => a.date.localeCompare(b.date))
        })
        setNewOverride({ date: '', is_available: false, start_time: '09:00', end_time: '17:00', note: '' })
      }
    } finally {
      setOverrideSaving(false)
    }
  }

  async function deleteOverride(id: string) {
    await fetch(`/api/availability/overrides/${id}`, { method: 'DELETE' })
    setOverrides((prev) => prev.filter((o) => o.id !== id))
  }

  function updateAvailability(idx: number, field: string, value: string | boolean) {
    setAvailability((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1_500_000) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setAvatarPreview(base64)
      setProfile((p) => ({ ...p, avatar_url: base64 }))
    }
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    setAvatarPreview('')
    setProfile((p) => ({ ...p, avatar_url: '' }))
    if (avatarFileRef.current) avatarFileRef.current.value = ''
  }

  async function savePayment(e: React.FormEvent) {
    e.preventDefault()
    setPaymentSaving(true)
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_cash: profile.payment_cash,
          payment_transfer: profile.payment_transfer,
          bank_iban: profile.bank_iban,
          bank_owner: profile.bank_owner,
          payment_note: profile.payment_note,
        }),
      })
      setPaymentSuccess(true)
      setTimeout(() => setPaymentSuccess(false), 3000)
    } finally {
      setPaymentSaving(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (pwNew !== pwConfirm) {
      setPwError('Nová hesla se neshodují')
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      })
      const data = await res.json()
      if (res.ok) {
        setPwSuccess(true)
        setPwCurrent('')
        setPwNew('')
        setPwConfirm('')
        setTimeout(() => setPwSuccess(false), 3000)
      } else {
        setPwError(data.error || `Chyba ${res.status}`)
      }
    } catch {
      setPwError('Síťová chyba, zkuste znovu.')
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl overflow-x-hidden px-4 py-5 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nastavení</h1>
        <p className="text-gray-500 mt-1 text-sm">Spravujte svůj profil a dostupnost</p>
      </div>

      {/* Profile */}
      <div className="card p-4 sm:p-6 mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profil</h2>
        <form onSubmit={saveProfile} className="space-y-5">
          {/* Avatar image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profilová fotka</label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: profile.avatar_color }}
                  >
                    {profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => avatarFileRef.current?.click()}
                  className="btn-secondary text-sm py-1.5 px-3"
                >
                  {avatarPreview ? 'Změnit fotku' : 'Nahrát fotku'}
                </button>
                {avatarPreview && (
                  <button type="button" onClick={removeAvatar} className="text-sm text-red-500 hover:text-red-700 px-2">
                    Odebrat
                  </button>
                )}
              </div>
              <input ref={avatarFileRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Max 1,5 MB. Zobrazí se na vaší rezervační stránce.</p>
          </div>

          {/* Avatar color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Barva avatara <span className="text-gray-400 font-normal">(záloha bez fotky)</span></label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, avatar_color: color }))}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  {profile.avatar_color === color && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Jméno</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL slug</label>
            <div className="flex min-w-0 rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
              <span className="shrink-0 px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/book/</span>
              <input
                type="text"
                value={profile.slug}
                onChange={(e) => setProfile((p) => ({ ...p, slug: e.target.value }))}
                className="min-w-0 flex-1 px-3 py-2.5 text-sm focus:outline-none"
                pattern="[a-z0-9-]+"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio / popis</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Krátký popis..."
            />
          </div>

          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {profileError}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" disabled={profileSaving} className="btn-primary">
              {profileSaving ? 'Ukládám...' : 'Uložit profil'}
            </button>
            {profileSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-green-600"
              >
                ✓ Profil uložen
              </motion.span>
            )}
          </div>
        </form>
      </div>

      {/* Availability */}
      <div className="card p-4 sm:p-6 mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Dostupnost</h2>
        <p className="text-sm text-gray-500 mb-6">Výchozí pracovní hodiny pro každý den v týdnu</p>
        <div className="space-y-3">
          {availability.map((day, idx) => (
            <div key={idx} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg sm:flex-nowrap sm:gap-4 ${day.is_active ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <button
                type="button"
                onClick={() => updateAvailability(idx, 'is_active', !day.is_active)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                  day.is_active ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    day.is_active ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>

              <span className={`text-sm w-20 flex-shrink-0 ${day.is_active ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                {DAYS[idx]}
              </span>

              {day.is_active ? (
                <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2 basis-full sm:basis-auto">
                  <input
                    type="time"
                    value={day.start_time}
                    onChange={(e) => updateAvailability(idx, 'start_time', e.target.value)}
                    className="input-field min-w-0 py-1.5 text-sm"
                  />
                  <span className="text-gray-400 text-sm">–</span>
                  <input
                    type="time"
                    value={day.end_time}
                    onChange={(e) => updateAvailability(idx, 'end_time', e.target.value)}
                    className="input-field min-w-0 py-1.5 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-gray-400 flex-1">Nedostupný</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:items-center sm:gap-4">
          <button onClick={saveAvailability} disabled={availabilitySaving} className="btn-primary">
            {availabilitySaving ? 'Ukládám...' : 'Uložit dostupnost'}
          </button>
          {availabilitySuccess && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-600"
            >
              ✓ Dostupnost uložena
            </motion.span>
          )}
        </div>
      </div>

      {/* Booking settings */}
      <div className="card p-4 sm:p-6 mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Nastavení rezervací</h2>
        <p className="text-sm text-gray-500 mb-6">Pravidla pro přijímání nových rezervací</p>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Minimální předstih rezervace
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                max={168}
                value={profile.min_booking_hours}
                onChange={(e) => setProfile((p) => ({ ...p, min_booking_hours: Number(e.target.value) }))}
                className="input-field w-24 text-center"
              />
              <span className="text-sm text-gray-500">hodin předem</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Klient musí rezervovat alespoň X hodin předem. 0 = bez omezení.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Buffer čas mezi rezervacemi
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                max={120}
                step={5}
                value={profile.buffer_minutes}
                onChange={(e) => setProfile((p) => ({ ...p, buffer_minutes: Number(e.target.value) }))}
                className="input-field w-24 text-center"
              />
              <span className="text-sm text-gray-500">minut pauzy</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Automatická mezera mezi rezervacemi. 0 = bez pauzy.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-6 sm:flex-row sm:items-center sm:gap-4">
          <button onClick={doSaveProfile} disabled={profileSaving} className="btn-primary">
            {profileSaving ? 'Ukládám...' : 'Uložit nastavení'}
          </button>
          {profileSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-600"
            >
              ✓ Uloženo
            </motion.span>
          )}
        </div>
      </div>

      {/* Availability overrides */}
      <div className="card p-4 sm:p-6 mb-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Výjimky dostupnosti</h2>
        <p className="text-sm text-gray-500 mb-6">
          Zablokujte konkrétní dny nebo otevřete termíny jen pro vybrané dny. Výjimky mají přednost před týdenním rozvrhem.
        </p>

        {/* Add override form */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Přidat výjimku</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Datum</label>
              <input
                type="date"
                value={newOverride.date}
                onChange={(e) => setNewOverride((p) => ({ ...p, date: e.target.value }))}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Typ</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewOverride((p) => ({ ...p, is_available: false }))}
                  className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${
                    !newOverride.is_available
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Zablokovat
                </button>
                <button
                  type="button"
                  onClick={() => setNewOverride((p) => ({ ...p, is_available: true }))}
                  className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${
                    newOverride.is_available
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  Otevřít
                </button>
              </div>
            </div>
          </div>

          {newOverride.is_available && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Od</label>
                <input
                  type="time"
                  value={newOverride.start_time}
                  onChange={(e) => setNewOverride((p) => ({ ...p, start_time: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Do</label>
                <input
                  type="time"
                  value={newOverride.end_time}
                  onChange={(e) => setNewOverride((p) => ({ ...p, end_time: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Poznámka (volitelné)</label>
            <input
              type="text"
              value={newOverride.note}
              onChange={(e) => setNewOverride((p) => ({ ...p, note: e.target.value }))}
              placeholder="např. Dovolená, Státní svátek..."
              className="input-field text-sm"
            />
          </div>

          <button
            onClick={saveOverride}
            disabled={!newOverride.date || overrideSaving}
            className="btn-primary text-sm"
          >
            {overrideSaving ? 'Ukládám...' : 'Přidat výjimku'}
          </button>
        </div>

        {/* Overrides list */}
        {overrides.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Žádné výjimky</p>
        ) : (
          <div className="space-y-2">
            {overrides.map((ov) => (
              <div key={ov.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border sm:flex-nowrap ${
                ov.is_available ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'
              }`}>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  ov.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {ov.is_available ? 'Otevřeno' : 'Zablokováno'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(ov.date + 'T00:00:00'), 'EEEE d. MMMM yyyy', { locale: cs })}
                  </p>
                  {ov.is_available && ov.start_time && (
                    <p className="text-xs text-gray-500">
                      {String(ov.start_time).substring(0, 5)} – {String(ov.end_time).substring(0, 5)}
                    </p>
                  )}
                  {ov.note && <p className="text-xs text-gray-400">{ov.note}</p>}
                </div>
                <button
                  onClick={() => deleteOverride(ov.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment settings */}
      <div className="card p-4 sm:p-6 mt-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Způsoby platby</h2>
        <p className="text-sm text-gray-500 mb-6">Nastavte, jak mohou klienti platit za rezervace</p>
        <form onSubmit={savePayment} className="space-y-5">
          {/* Cash */}
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors hover:bg-gray-50 border-gray-200">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                profile.payment_cash ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}
              onClick={() => setProfile((p) => ({ ...p, payment_cash: !p.payment_cash }))}
            >
              {profile.payment_cash && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">Hotově na místě</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Klient zaplatí při návštěvě</p>
            </div>
          </label>

          {/* Bank transfer */}
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors hover:bg-gray-50 border-gray-200">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                profile.payment_transfer ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}
              onClick={() => setProfile((p) => ({ ...p, payment_transfer: !p.payment_transfer }))}
            >
              {profile.payment_transfer && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-sm font-medium text-gray-900">Bankovní převod (QR kód)</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Klient dostane QR kód s částkou po rezervaci</p>
            </div>
          </label>

          {/* Bank details — show when transfer enabled */}
          {profile.payment_transfer && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">Bankovní údaje</p>
              <div>
                <label className="block text-xs text-blue-700 mb-1">IBAN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={profile.bank_iban}
                  onChange={(e) => setProfile((p) => ({ ...p, bank_iban: e.target.value.replace(/\s/g, '').toUpperCase() }))}
                  placeholder="CZ6508000000192000145399"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                  required={profile.payment_transfer}
                />
                <p className="text-xs text-blue-600 mt-1">IBAN najdete ve své bankovní aplikaci nebo na výpisu</p>
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1">Jméno příjemce</label>
                <input
                  type="text"
                  value={profile.bank_owner}
                  onChange={(e) => setProfile((p) => ({ ...p, bank_owner: e.target.value }))}
                  placeholder="Jan Novák"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-700 mb-1">Poznámka pro klienta (nepovinné)</label>
                <input
                  type="text"
                  value={profile.payment_note}
                  onChange={(e) => setProfile((p) => ({ ...p, payment_note: e.target.value }))}
                  placeholder="Platbu proveďte do 24 hodin od rezervace"
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* QR preview */}
              {profile.bank_iban && (
                <div className="flex flex-col gap-3 pt-2 border-t border-blue-200 sm:flex-row sm:items-center sm:gap-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&ecc=M&data=${encodeURIComponent(`SPD*1.0*ACC:${profile.bank_iban}*AM:300.00*CC:CZK*MSG:Rezervace`)}`}
                    alt="QR náhled"
                    className="w-20 h-20 rounded-lg border border-blue-200 bg-white p-1"
                  />
                  <div>
                    <p className="text-xs font-medium text-blue-700">Náhled QR kódu</p>
                    <p className="text-xs text-blue-600 mt-0.5">Částka bude automaticky doplněna dle vybrané služby</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" disabled={paymentSaving} className="btn-primary">
              {paymentSaving ? 'Ukládám...' : 'Uložit platební nastavení'}
            </button>
            {paymentSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-600"
              >
                ✓ Uloženo
              </motion.span>
            )}
          </div>
        </form>
      </div>

      {/* Password change */}
      <div className="card p-4 sm:p-6 mt-6 min-w-0">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Změna hesla</h2>
        <p className="text-sm text-gray-500 mb-6">Nastavte nové přihlašovací heslo</p>
        <form onSubmit={changePassword} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Současné heslo</label>
            <input
              type="password"
              value={pwCurrent}
              onChange={(e) => setPwCurrent(e.target.value)}
              className="input-field"
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nové heslo</label>
            <input
              type="password"
              value={pwNew}
              onChange={(e) => setPwNew(e.target.value)}
              className="input-field"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Potvrdit nové heslo</label>
            <input
              type="password"
              value={pwConfirm}
              onChange={(e) => setPwConfirm(e.target.value)}
              className="input-field"
              required
              autoComplete="new-password"
            />
          </div>
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {pwError}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <button type="submit" disabled={pwSaving} className="btn-primary">
              {pwSaving ? 'Ukládám...' : 'Změnit heslo'}
            </button>
            {pwSuccess && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-green-600"
              >
                ✓ Heslo změněno
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
