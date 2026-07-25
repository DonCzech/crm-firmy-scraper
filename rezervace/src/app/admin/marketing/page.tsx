'use client'

import { useEffect, useState } from 'react'

interface Coupon {
  id: string; code: string; type: string; value: number
  max_uses: number | null; used_count: number; valid_until: string | null; is_active: boolean
}
interface Voucher {
  id: string; code: string; initial_amount: number; remaining_amount: number
  currency: string; recipient_name: string; valid_until: string | null; is_active: boolean
}

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)

  // Nový kupón
  const [cCode, setCCode] = useState('')
  const [cType, setCType] = useState('percent')
  const [cValue, setCValue] = useState('')
  const [cMax, setCMax] = useState('')
  const [cUntil, setCUntil] = useState('')
  const [cErr, setCErr] = useState('')

  // Nový poukaz
  const [vAmount, setVAmount] = useState('')
  const [vName, setVName] = useState('')
  const [vUntil, setVUntil] = useState('')

  function load() {
    Promise.all([
      fetch('/api/coupons').then((r) => r.json()),
      fetch('/api/vouchers').then((r) => r.json()),
    ]).then(([c, v]) => {
      setCoupons(Array.isArray(c) ? c : [])
      setVouchers(Array.isArray(v) ? v : [])
    }).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function addCoupon(e: React.FormEvent) {
    e.preventDefault()
    setCErr('')
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cCode, type: cType, value: Number(cValue), maxUses: cMax || null, validUntil: cUntil || null }),
    })
    const d = await res.json()
    if (res.ok) { setCoupons((p) => [d, ...p]); setCCode(''); setCValue(''); setCMax(''); setCUntil('') }
    else setCErr(d.error || 'Chyba')
  }

  async function deleteCoupon(id: string) {
    setCoupons((p) => p.filter((x) => x.id !== id))
    await fetch(`/api/coupons/${id}`, { method: 'DELETE' })
  }
  async function toggleCoupon(c: Coupon) {
    setCoupons((p) => p.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)))
    await fetch(`/api/coupons/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !c.is_active }) })
  }

  async function addVoucher(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/vouchers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(vAmount), recipientName: vName, validUntil: vUntil || null }),
    })
    const d = await res.json()
    if (res.ok) { setVouchers((p) => [d, ...p]); setVAmount(''); setVName(''); setVUntil('') }
  }
  async function deleteVoucher(id: string) {
    setVouchers((p) => p.filter((x) => x.id !== id))
    await fetch(`/api/vouchers/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-ink-900 mb-1">Marketing</h1>
      <p className="text-ink-400 mb-6">Slevové kódy a dárkové poukazy</p>

      {loading ? <p className="text-ink-400">Načítám…</p> : (
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Kupóny */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Slevové kódy</h2>
          <form onSubmit={addCoupon} className="space-y-3 mb-5">
            <div className="flex gap-2">
              <input value={cCode} onChange={(e) => setCCode(e.target.value.toUpperCase())} placeholder="KÓD" className="input-field flex-1" />
              <select value={cType} onChange={(e) => setCType(e.target.value)} className="input-field w-28">
                <option value="percent">%</option>
                <option value="fixed">Kč</option>
              </select>
              <input value={cValue} onChange={(e) => setCValue(e.target.value)} type="number" placeholder="Sleva" className="input-field w-24" />
            </div>
            <div className="flex gap-2">
              <input value={cMax} onChange={(e) => setCMax(e.target.value)} type="number" placeholder="Max použití (nepovinné)" className="input-field flex-1" />
              <input value={cUntil} onChange={(e) => setCUntil(e.target.value)} type="date" className="input-field w-40" />
            </div>
            {cErr && <p className="text-red-600 text-sm">{cErr}</p>}
            <button className="btn-primary w-full py-2.5">Přidat kupón</button>
          </form>

          <div className="divide-y divide-ink-900/5">
            {coupons.length === 0 ? <p className="text-sm text-ink-300 py-2">Zatím žádné kupóny.</p> : coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-mono font-semibold text-ink-900">{c.code}</span>
                  <span className="text-sm text-ink-400 ml-2">
                    {c.type === 'percent' ? `${c.value} %` : `${c.value} Kč`}
                    {c.max_uses ? ` · ${c.used_count}/${c.max_uses}` : ''}
                    {!c.is_active ? ' · vypnuto' : ''}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleCoupon(c)} className="text-xs px-2 py-1 rounded text-ink-500 hover:bg-paper">{c.is_active ? 'Vypnout' : 'Zapnout'}</button>
                  <button onClick={() => deleteCoupon(c.id)} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50">Smazat</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Poukazy */}
        <div className="card p-6">
          <h2 className="font-semibold text-ink-900 mb-4">Dárkové poukazy</h2>
          <form onSubmit={addVoucher} className="space-y-3 mb-5">
            <div className="flex gap-2">
              <input value={vAmount} onChange={(e) => setVAmount(e.target.value)} type="number" placeholder="Částka (Kč)" className="input-field w-32" />
              <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Pro koho (nepovinné)" className="input-field flex-1" />
            </div>
            <input value={vUntil} onChange={(e) => setVUntil(e.target.value)} type="date" className="input-field w-full" />
            <button className="btn-primary w-full py-2.5">Vystavit poukaz</button>
          </form>

          <div className="divide-y divide-ink-900/5">
            {vouchers.length === 0 ? <p className="text-sm text-ink-300 py-2">Zatím žádné poukazy.</p> : vouchers.map((v) => (
              <div key={v.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-mono font-semibold text-ink-900">{v.code}</span>
                  <span className="text-sm text-ink-400 ml-2">
                    {Math.round(Number(v.remaining_amount))}/{Math.round(Number(v.initial_amount))} {v.currency}
                    {v.recipient_name ? ` · ${v.recipient_name}` : ''}
                  </span>
                </div>
                <button onClick={() => deleteVoucher(v.id)} className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50">Smazat</button>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
