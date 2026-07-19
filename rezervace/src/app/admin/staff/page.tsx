'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isBefore, startOfDay, isSameDay,
} from 'date-fns'
import { cs } from 'date-fns/locale'
import type { Staff, StaffAvailability } from '@/types'

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
const DAY_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

const STAFF_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
]

// ─── Availability Editor ──────────────────────────────────────────────────────

interface Override {
  id: string
  date: string
  is_available: boolean
  start_time: string | null
  end_time: string | null
  note: string
}

function AvailabilityEditor({ staffId, onClose }: { staffId: string; onClose: () => void }) {
  const [tab, setTab] = useState<'schedule' | 'calendar'>('schedule')
  const [schedule, setSchedule] = useState<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }[]>(
    Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, start_time: '09:00', end_time: '17:00', is_active: i >= 1 && i <= 5 }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [overrides, setOverrides] = useState<Override[]>([])
  const [calMonth, setCalMonth] = useState(new Date())
  const [togglingDate, setTogglingDate] = useState<string | null>(null)
  const [calError, setCalError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/staff/${staffId}/availability`).then((r) => r.json()),
      fetch(`/api/staff/${staffId}/overrides`).then((r) => r.json()),
    ]).then(([avData, ovData]: [StaffAvailability[], Override[]]) => {
      if (Array.isArray(avData) && avData.length > 0) {
        setSchedule(
          Array.from({ length: 7 }, (_, i) => {
            const existing = avData.find((d) => d.day_of_week === i)
            return {
              day_of_week: i,
              start_time: existing ? String(existing.start_time).substring(0, 5) : '09:00',
              end_time: existing ? String(existing.end_time).substring(0, 5) : '17:00',
              is_active: existing ? Boolean(existing.is_active) : (i >= 1 && i <= 5),
            }
          })
        )
      }
      if (Array.isArray(ovData)) {
        // Normalize date field — Postgres DATE might come as "YYYY-MM-DD" or timestamp
        setOverrides(ovData.map((o) => ({ ...o, date: String(o.date).substring(0, 10) })))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [staffId])

  async function handleSaveSchedule() {
    setSaving(true)
    await fetch(`/api/staff/${staffId}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    })
    setSaving(false)
    onClose()
  }

  async function toggleDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const today = startOfDay(new Date())
    if (isBefore(date, today)) return

    setTogglingDate(dateStr)
    const existing = overrides.find((o) => o.date === dateStr)
    const dow = date.getDay()
    const normallyWorking = schedule.find((s) => s.day_of_week === dow)?.is_active ?? false

    if (existing) {
      // Remove override → revert to normal schedule
      await fetch(`/api/staff/${staffId}/overrides?date=${dateStr}`, { method: 'DELETE' })
      setOverrides((prev) => prev.filter((o) => o.date !== dateStr))
    } else {
      // Add override: flip the normal state
      const newIsAvailable = !normallyWorking
      const schedDay = schedule.find((s) => s.day_of_week === dow)
      const res = await fetch(`/api/staff/${staffId}/overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          is_available: newIsAvailable,
          start_time: newIsAvailable ? (schedDay?.start_time || '09:00') : null,
          end_time: newIsAvailable ? (schedDay?.end_time || '17:00') : null,
          note: '',
        }),
      })
      const saved = await res.json()
      const normalized = { ...saved, date: String(saved.date).substring(0, 10) }
      setOverrides((prev) => [...prev.filter((o) => o.date !== dateStr), normalized])
    }
    setTogglingDate(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <svg className="animate-spin h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  // Calendar helpers
  const today = startOfDay(new Date())
  const monthStart = startOfMonth(calMonth)
  const monthEnd = endOfMonth(calMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDow = getDay(monthStart)
  const paddingStart = firstDow === 0 ? 6 : firstDow - 1

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-ink-50 p-1 rounded-lg mb-4">
        <button
          onClick={() => setTab('schedule')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === 'schedule' ? 'bg-cream text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-700'}`}
        >
          Týdenní rozvrh
        </button>
        <button
          onClick={() => { setCalError(false); setTab('calendar') }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${tab === 'calendar' ? 'bg-cream text-ink-900 shadow-sm' : 'text-ink-400 hover:text-ink-700'}`}
        >
          Výjimky v kalendáři
        </button>
      </div>

      {tab === 'schedule' ? (
        <>
          <div className="space-y-2">
            {schedule.map((day) => (
              <div
                key={day.day_of_week}
                className={`flex items-center gap-2 p-2.5 rounded-lg border transition-colors ${day.is_active ? 'border-accent-200 bg-accent-50' : 'border-ink-900/10 bg-paper'}`}
              >
                <button
                  onClick={() => setSchedule((prev) => prev.map((d) => d.day_of_week === day.day_of_week ? { ...d, is_active: !d.is_active } : d))}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${day.is_active ? 'bg-ink-900 border-ink-900' : 'border-ink-200 bg-cream'}`}
                >
                  {day.is_active && (
                    <svg className="w-3 h-3 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span className="w-7 text-xs font-semibold text-ink-600 flex-shrink-0">{DAY_SHORT[day.day_of_week]}</span>
                <span className="text-xs text-ink-400 flex-1 hidden sm:block">{DAY_NAMES[day.day_of_week]}</span>
                {day.is_active ? (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <input
                      type="time"
                      value={day.start_time}
                      onChange={(e) => setSchedule((prev) => prev.map((d) => d.day_of_week === day.day_of_week ? { ...d, start_time: e.target.value } : d))}
                      className="text-xs border border-ink-900/15 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-ink-900 w-24"
                    />
                    <span className="text-ink-300 text-xs">–</span>
                    <input
                      type="time"
                      value={day.end_time}
                      onChange={(e) => setSchedule((prev) => prev.map((d) => d.day_of_week === day.day_of_week ? { ...d, end_time: e.target.value } : d))}
                      className="text-xs border border-ink-900/15 rounded-lg px-1.5 py-1 focus:outline-none focus:ring-2 focus:ring-ink-900 w-24"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-ink-300 italic flex-shrink-0">Volno</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-ink-900/10">
            <button onClick={onClose} className="px-4 py-2 text-sm text-ink-600 hover:text-ink-800 transition-colors">
              Zrušit
            </button>
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="px-4 py-2 bg-ink-900 text-cream rounded-lg text-sm font-medium hover:bg-ink-800 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Ukládám...' : 'Uložit rozvrh'}
            </button>
          </div>
        </>
      ) : calError ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-500 mb-2">Nastala chyba při zobrazení kalendáře.</p>
          <button onClick={() => setCalError(false)} className="text-xs text-accent-600 underline">Zkusit znovu</button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-ink-400 mb-2">
            Kliknutím na den přidáte výjimku. <span className="text-accent-600">Modrá</span> = pracovní den,{' '}
            <span className="text-ink-300">Šedá</span> = volno,{' '}
            <span className="text-red-500">Červená</span> = výjimka volno,{' '}
            <span className="text-green-600">Zelená</span> = výjimka pracovní den
          </p>
          {/* "On-demand" mode: set all days off so admin can open only selected days */}
          {schedule.some((d) => d.is_active) && (
            <button
              onClick={async () => {
                if (!confirm('Nastavit pracovníka do režimu „pouze vybrané dny"? Týdenní rozvrh se nastaví na vše zavřeno a vy pak klikáním otevřete konkrétní dny.')) return
                const allOff = schedule.map((d) => ({ ...d, is_active: false }))
                setSchedule(allOff)
                await fetch(`/api/staff/${staffId}/availability`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(allOff),
                })
              }}
              className="mb-3 w-full text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 hover:bg-green-100 transition-colors text-left"
            >
              🟢 Přepnout na režim „Pracuji jen ve vybrané dny" — klikáním otevřu konkrétní termíny
            </button>
          )}
          {!schedule.some((d) => d.is_active) && (
            <div className="mb-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Režim „vybrané dny": všechny dny jsou zavřeny. Klikněte na den v kalendáři pro otevření.
            </div>
          )}

          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCalMonth((m) => subMonths(m, 1))}
              disabled={isBefore(endOfMonth(subMonths(calMonth, 1)), today)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-ink-900 capitalize">
              {format(calMonth, 'LLLL yyyy', { locale: cs })}
            </span>
            <button
              onClick={() => setCalMonth((m) => addMonths(m, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ink-50"
            >
              <svg className="w-4 h-4 text-ink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-ink-300 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingStart }).map((_, i) => <div key={`p-${i}`} />)}
            {days.map((date) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const isPast = isBefore(date, today)
              const isToday = isSameDay(date, today)
              const override = overrides.find((o) => o.date === dateStr)
              const dow = date.getDay()
              const normallyWorking = schedule.find((s) => s.day_of_week === dow)?.is_active ?? false
              const isToggling = togglingDate === dateStr

              let cellClass = ''
              let label = ''
              if (override) {
                if (override.is_available) {
                  cellClass = 'bg-green-100 border-green-400 text-green-800'
                  label = 'P'
                } else {
                  cellClass = 'bg-red-100 border-red-300 text-red-700'
                  label = 'V'
                }
              } else if (normallyWorking) {
                cellClass = isPast ? 'bg-accent-50 border-accent-100 text-accent-300' : 'bg-accent-50 border-accent-200 text-accent-700'
              } else {
                cellClass = 'bg-paper border-ink-900/15 text-ink-200'
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && toggleDay(date)}
                  disabled={isPast || isToggling}
                  className={`relative h-9 flex flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-all
                    ${cellClass}
                    ${isPast ? 'opacity-40 cursor-default' : 'hover:opacity-80 cursor-pointer active:scale-95'}
                    ${isToday ? 'ring-2 ring-offset-1 ring-ink-400' : ''}
                  `}
                >
                  {isToggling ? (
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <span>{format(date, 'd')}</span>
                      {label && <span className="text-[9px] leading-none">{label === 'P' ? 'práce' : 'volno'}</span>}
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-ink-900/10">
            <p className="text-xs font-medium text-ink-400 mb-2">Výjimky tento měsíc:</p>
            {overrides.filter((o) => o.date.startsWith(format(calMonth, 'yyyy-MM'))).length === 0 ? (
              <p className="text-xs text-ink-300 italic">Žádné výjimky</p>
            ) : (
              <div className="space-y-1">
                {overrides
                  .filter((o) => o.date.startsWith(format(calMonth, 'yyyy-MM')))
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((o) => (
                    <div key={o.id} className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs ${o.is_available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <span className="font-medium">{format(new Date(o.date + 'T00:00:00'), 'd. MMMM', { locale: cs })}</span>
                      <span>–</span>
                      <span>{o.is_available ? `Pracovní den (${String(o.start_time || '').substring(0, 5)}–${String(o.end_time || '').substring(0, 5)})` : 'Volno'}</span>
                      <button
                        onClick={async () => {
                          await fetch(`/api/staff/${staffId}/overrides?date=${o.date}`, { method: 'DELETE' })
                          setOverrides((prev) => prev.filter((x) => x.date !== o.date))
                        }}
                        className="ml-auto text-ink-300 hover:text-red-500"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 pt-3 border-t border-ink-900/10">
            <button onClick={onClose} className="px-4 py-2 text-sm text-ink-600 hover:text-ink-800 transition-colors">
              Zavřít
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Staff Form ───────────────────────────────────────────────────────────────

function StaffForm({ initial, onSave, onClose }: { initial?: Staff | null; onSave: () => void; onClose: () => void }) {
  const [name, setName] = useState(initial?.name || '')
  const [color, setColor] = useState(initial?.color || STAFF_COLORS[0])
  const [bio, setBio] = useState(initial?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url || '')
  const [avatarPreview, setAvatarPreview] = useState(initial?.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5_000_000) { setError('Foto je příliš velké. Maximum 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        // Resize to max 300×300 px, compress to jpeg 80%
        const MAX = 300
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        const compressed = canvas.toDataURL('image/jpeg', 0.8)
        setAvatarPreview(compressed)
        setAvatarUrl(compressed)
        setError('')
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Jméno je povinné'); return }
    setSaving(true)
    setError('')

    const res = await fetch(initial ? `/api/staff/${initial.id}` : '/api/staff', {
      method: initial ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color, bio, avatar_url: avatarUrl }),
    })

    setSaving(false)
    if (res.ok) { onSave() } else {
      const data = await res.json()
      setError(data.error || 'Chyba při ukládání')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-ink-900/15" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-cream text-xl font-bold border-2 border-ink-900/15" style={{ backgroundColor: color }}>
              {name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) : '?'}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-ink-900 rounded-full flex items-center justify-center text-cream hover:bg-ink-800 transition-colors shadow"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-700">Fotografie</p>
          <p className="text-xs text-ink-300 mt-0.5">Klikněte na ikonu fotoaparátu (max 2 MB)</p>
          {avatarPreview && (
            <button type="button" onClick={() => { setAvatarPreview(''); setAvatarUrl('') }} className="text-xs text-red-500 hover:text-red-700 mt-1">
              Odstranit foto
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Jméno *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Např. Adam Novák"
          className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">Bio / specializace</label>
        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Např. specialista na pánské střihy"
          className="w-full border border-ink-900/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-2">Barva profilu</label>
        <div className="flex flex-wrap gap-2">
          {STAFF_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-all"
              style={{ backgroundColor: c, borderColor: color === c ? '#1e293b' : 'transparent', outline: color === c ? '2px solid #1e293b' : 'none', outlineOffset: '2px' }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-ink-600 hover:text-ink-800 transition-colors">
          Zrušit
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-ink-900 text-cream rounded-lg text-sm font-medium hover:bg-ink-800 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Ukládám...' : initial ? 'Uložit změny' : 'Přidat pracovníka'}
        </button>
      </div>
    </form>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'availability'

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ mode: ModalMode; staff?: Staff } | null>(null)

  const fetchStaff = useCallback(async () => {
    const res = await fetch('/api/staff')
    if (res.ok) setStaff(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  async function handleToggle(member: Staff) {
    await fetch(`/api/staff/${member.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !member.is_active }),
    })
    fetchStaff()
  }

  async function handleDelete(member: Staff) {
    if (!confirm(`Opravdu smazat pracovníka ${member.name}? Stávající rezervace zůstanou zachovány.`)) return
    await fetch(`/api/staff/${member.id}`, { method: 'DELETE' })
    fetchStaff()
  }

  function handleSaved() {
    setModal(null)
    fetchStaff()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-paper border-b border-ink-900/15 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink-900">Pracovníci</h1>
          <p className="text-xs text-ink-400 mt-0.5 hidden sm:block">Správa pracovníků, fotek a rozvrhů</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'add' })}
          className="flex items-center gap-1.5 px-3 py-2 bg-ink-900 text-cream rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Přidat pracovníka</span>
          <span className="sm:hidden">Přidat</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-16 bg-cream rounded-2xl border border-ink-900/10">
            <div className="w-14 h-14 bg-ink-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-ink-400 text-sm font-medium">Zatím žádní pracovníci</p>
            <p className="text-ink-300 text-xs mt-1">Přidejte pracovníka a nastavte mu rozvrh a fotku</p>
            <button
              onClick={() => setModal({ mode: 'add' })}
              className="mt-4 px-4 py-2 bg-ink-900 text-cream rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors"
            >
              Přidat prvního pracovníka
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {staff.map((member) => {
              const activeDays = (member.availability || [])
                .filter((a) => a.is_active)
                .map((a) => DAY_SHORT[a.day_of_week])
                .join(', ')

              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-cream rounded-xl border border-ink-900/10 p-3 sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-cream font-semibold text-sm flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-ink-900 text-sm truncate">{member.name}</p>
                        {!member.is_active && (
                          <span className="text-xs bg-ink-50 text-ink-400 px-1.5 py-0.5 rounded-full">Neaktivní</span>
                        )}
                      </div>
                      {member.bio && <p className="text-xs text-ink-400 truncate">{member.bio}</p>}
                      <p className="text-xs text-ink-300 mt-0.5">
                        {activeDays ? `Pracuje: ${activeDays}` : 'Rozvrh nenastavený'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => setModal({ mode: 'availability', staff: member })}
                        title="Nastavit rozvrh"
                        className="p-2 text-ink-300 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setModal({ mode: 'edit', staff: member })}
                        title="Upravit"
                        className="p-2 text-ink-300 hover:text-ink-700 hover:bg-ink-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggle(member)}
                        title={member.is_active ? 'Deaktivovat' : 'Aktivovat'}
                        className={`p-2 rounded-lg transition-colors ${member.is_active ? 'text-green-600 hover:bg-green-50' : 'text-ink-300 hover:bg-ink-50'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={member.is_active ? 'M5 13l4 4L19 7' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'} />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        title="Smazat"
                        className="p-2 text-ink-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full sm:max-w-md bg-cream rounded-t-2xl sm:rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-900/10 flex-shrink-0">
                <h2 className="font-semibold text-ink-900">
                  {modal.mode === 'add' && 'Přidat pracovníka'}
                  {modal.mode === 'edit' && 'Upravit pracovníka'}
                  {modal.mode === 'availability' && `Rozvrh – ${modal.staff?.name}`}
                </h2>
                {/* Drag handle on mobile */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-ink-100 rounded-full sm:hidden" />
                <button onClick={() => setModal(null)} className="text-ink-300 hover:text-ink-600 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-5">
                {modal.mode === 'availability' && modal.staff ? (
                  <AvailabilityEditor staffId={modal.staff.id} onClose={handleSaved} />
                ) : (
                  <StaffForm
                    initial={modal.mode === 'edit' ? modal.staff : null}
                    onSave={handleSaved}
                    onClose={() => setModal(null)}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
