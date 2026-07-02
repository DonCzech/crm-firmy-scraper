'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ServiceForm from '@/components/admin/ServiceForm'
import type { Service } from '@/types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)

  const fetchServices = useCallback(async () => {
    const res = await fetch('/api/services')
    if (res.ok) {
      const data = await res.json()
      setServices(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  async function handleToggle(service: Service) {
    await fetch(`/api/services/${service.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !service.is_active }),
    })
    fetchServices()
  }

  async function handleDelete(serviceId: string) {
    if (!confirm('Opravdu chcete smazat tuto službu?')) return
    await fetch(`/api/services/${serviceId}`, { method: 'DELETE' })
    fetchServices()
  }

  function handleEdit(service: Service) {
    setEditService(service)
    setShowForm(true)
  }

  function handleClose() {
    setShowForm(false)
    setEditService(null)
  }

  async function handleSaved() {
    handleClose()
    fetchServices()
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Služby</h1>
          <p className="text-gray-500 mt-1 text-sm">Spravujte nabízené služby</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Přidat službu
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : services.length === 0 ? (
        <div className="card py-16 text-center">
          <div className="text-4xl mb-3">🛠</div>
          <p className="text-gray-500 mb-4">Zatím žádné služby</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Přidat první službu
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {services.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`card p-5 ${!service.is_active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: service.color + '20' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{service.name}</h3>
                      <span className={`text-xs ${service.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {service.is_active ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Délka</p>
                      <p className="text-sm font-medium text-gray-900">{service.duration_minutes} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Cena</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Number(service.price) === 0 ? 'Zdarma' : `${Number(service.price).toLocaleString('cs-CZ')} ${service.currency}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggle(service)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      service.is_active ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        service.is_active ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <ServiceForm
            service={editService}
            onClose={handleClose}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
