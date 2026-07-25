'use client'

import { useEffect, useState } from 'react'

interface Series {
  id: string
  client_name: string
  day_of_week: number
  start_time: string
  interval_weeks: number
  until_date: string | null
  is_active: boolean
  service_name: string
  staff_name: string | null
  booking_count: number
}
interface Service { id: string; name: string }
interface Staff { id: string; name: string }

const WEEKDAYS = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']

export default function RecurringPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    serviceId: '', staffId: '', clientName: '', clientEmail: '', clientPhone: '',
    dayOfWeek: '1', startTime: '09:00', intervalWeeks: '1', untilDate: '',
  })
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  function load() {
    Promise.all([
      fetch('/api/recurring').then((r) => r.json()),
      fetch('/api/services').then((r) => r.json()),
      fetch('/api/staff').then((r) => r.json()),
    ]).then(([se, sv, st]) => {
      setSeries(Array.isArray(se) ? se : [])
      setServices(Array.isArray(sv) ? sv : [])
      setStaff(Array.isArray(st) ? st : [])
      if (Array.isArray(sv) && sv.length) setForm((f) => ({ ...f, serviceId: f.serviceId || sv[0].id }))
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(''); setMsg('')
    const res = await fetch('/api/recurring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dayOfWeek: Number(form.dayOfWeek), intervalWeeks: Number(form.intervalWeeks) }),
    })
    const d = await res.json()
    if (res.ok) {
      setMsg(`Série vytvořena, vygenerováno ${d.created} termínů.`)
      setShowForm(false)
      setForm((f) => ({ ...f, clientName: '', clientEmail: '', clientPhone: '' }))
      load()
    } else setErr(d.error || 'Chyba')
  }

  async function end(id: string, future: boolean) {
    if (!confirm(future ? 'Ukončit sérii a zrušit budoucí termíny?' : 'Ukončit sérii (termíny ponechat)?')) return
    await fetch(`/api/recurring/${id}${future ? '?future=1' : ''}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink-900 mb-1">Opakované termíny</h1>
          <p className="text-ink-400">Stálí klienti se stejným termínem — např. každý čtvrtek</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary px-4 py-2.5">
          {showForm ? 'Zavřít' : '+ Nová série'}
        </button>
      </div>

      {msg && <div className="card p-3 mb-4 bg-green-50 border-green-100 text-green-700 text-sm">{msg}</div>}

      {showForm && (
        <form onSubmit={submit} className="card p-6 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Služba</label>
              <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })} className="input-field w-full" required>
                {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Pracovník (nepovinné)</label>
              <select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} className="input-field w-full">
                <option value="">— bez přiřazení —</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Klient</label>
              <input value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="input-field w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">E-mail / telefon</label>
              <input value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} placeholder="E-mail" className="input-field w-full mb-2" />
              <input value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder="Telefon" className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Den v týdnu</label>
              <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })} className="input-field w-full">
                {WEEKDAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Čas</label>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Po (týdnů)</label>
                <input type="number" min="1" value={form.intervalWeeks} onChange={(e) => setForm({ ...form, intervalWeeks: e.target.value })} className="input-field w-full" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Do data (nepovinné)</label>
              <input type="date" value={form.untilDate} onChange={(e) => setForm({ ...form, untilDate: e.target.value })} className="input-field w-full" />
            </div>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button className="btn-primary px-5 py-2.5">Vytvořit sérii</button>
        </form>
      )}

      {loading ? <p className="text-ink-400">Načítám…</p> : series.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">🔁</div>
          <p className="text-ink-400">Zatím žádné opakované termíny.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {series.map((s) => (
            <div key={s.id} className={`card p-5 flex items-center gap-4 ${!s.is_active ? 'opacity-50' : ''}`}>
              <div className="flex-1">
                <p className="font-semibold text-ink-900">{s.client_name}</p>
                <p className="text-sm text-ink-400">
                  {s.service_name}{s.staff_name ? ` · ${s.staff_name}` : ''} · {WEEKDAYS[s.day_of_week]} {String(s.start_time).substring(0, 5)}
                  {s.interval_weeks > 1 ? ` · po ${s.interval_weeks} týdnech` : ' · týdně'}
                  {' · '}{s.booking_count} termínů
                </p>
              </div>
              {s.is_active && (
                <div className="flex gap-1">
                  <button onClick={() => end(s.id, false)} className="text-xs px-2 py-1 rounded text-ink-500 hover:bg-paper">Ukončit</button>
                  <button onClick={() => end(s.id, true)} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50">Ukončit + zrušit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
