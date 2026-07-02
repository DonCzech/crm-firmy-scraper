import { getUser } from '@/lib/auth'
import { sql } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'

async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const monthStart = new Date()
  monthStart.setDate(1)

  const [totalRes, todayRes, weekRes, monthRevenueRes, clientsRes, recentRes] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM rez_bookings WHERE provider_id = ${userId} AND status != 'cancelled'`,
    sql`SELECT COUNT(*) as count FROM rez_bookings WHERE provider_id = ${userId} AND booking_date = ${today} AND status != 'cancelled'`,
    sql`SELECT COUNT(*) as count FROM rez_bookings WHERE provider_id = ${userId} AND booking_date >= ${weekStart.toISOString().split('T')[0]} AND status != 'cancelled'`,
    sql`SELECT COALESCE(SUM(price), 0) as revenue FROM rez_bookings WHERE provider_id = ${userId} AND booking_date >= ${monthStart.toISOString().split('T')[0]} AND status = 'confirmed'`,
    sql`SELECT COUNT(DISTINCT client_email) as count FROM rez_bookings WHERE provider_id = ${userId}`,
    sql`
      SELECT b.*, s.name as service_name, s.color as service_color
      FROM rez_bookings b
      JOIN rez_services s ON b.service_id = s.id
      WHERE b.provider_id = ${userId}
      ORDER BY b.created_at DESC
      LIMIT 5
    `,
  ])

  return {
    totalBookings: parseInt(totalRes[0].count),
    todayBookings: parseInt(todayRes[0].count),
    weekBookings: parseInt(weekRes[0].count),
    monthRevenue: parseFloat(monthRevenueRes[0].revenue),
    totalClients: parseInt(clientsRes[0].count),
    recentBookings: recentRes,
  }
}

function StatusBadge({ status }: { status: string }) {
  const classes = {
    confirmed: 'badge-confirmed',
    cancelled: 'badge-cancelled',
    completed: 'badge-completed',
    pending: 'badge-pending',
  }[status] || 'badge-pending'

  const labels = {
    confirmed: 'Potvrzeno',
    cancelled: 'Zrušeno',
    completed: 'Dokončeno',
    pending: 'Čekající',
  }[status] || status

  return <span className={classes}>{labels}</span>
}

export default async function AdminDashboard() {
  const user = await getUser()
  if (!user) return null

  const data = await getDashboardData(user.userId)

  const stats = [
    {
      label: 'Celkem rezervací',
      value: data.totalBookings,
      icon: '📅',
      color: 'bg-blue-50 text-blue-600',
      change: null,
    },
    {
      label: 'Dnes',
      value: data.todayBookings,
      icon: '🕐',
      color: 'bg-green-50 text-green-600',
      change: null,
    },
    {
      label: 'Tento týden',
      value: data.weekBookings,
      icon: '📊',
      color: 'bg-purple-50 text-purple-600',
      change: null,
    },
    {
      label: 'Příjmy tento měsíc',
      value: `${data.monthRevenue.toLocaleString('cs-CZ')} Kč`,
      icon: '💰',
      color: 'bg-yellow-50 text-yellow-600',
      change: null,
    },
    {
      label: 'Celkem klientů',
      value: data.totalClients,
      icon: '👥',
      color: 'bg-indigo-50 text-indigo-600',
      change: null,
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dobrý den, {user.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {format(new Date(), "EEEE, d. MMMM yyyy", { locale: cs })}
        </p>
      </div>

      {/* Booking link banner */}
      <div className="card p-4 mb-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Vaše rezervační stránka</p>
            <p className="text-xs text-blue-600">/book/{user.slug}</p>
          </div>
        </div>
        <a
          href={`/book/${user.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Otevřít
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Poslední rezervace</h2>
          <Link href="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700">
            Zobrazit vše →
          </Link>
        </div>

        {data.recentBookings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-500">Zatím žádné rezervace</p>
            <p className="text-sm text-gray-400 mt-1">
              Sdílejte odkaz na vaši rezervační stránku a začněte přijímat rezervace.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recentBookings.map((booking: Record<string, unknown>) => (
              <div key={booking.id as string} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div
                  className="w-2 h-10 rounded-full flex-shrink-0"
                  style={{ backgroundColor: (booking.service_color as string) || '#006bff' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{booking.client_name as string}</p>
                  <p className="text-xs text-gray-400">{booking.service_name as string}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {format(new Date(booking.booking_date as string), 'd. M. yyyy')}
                  </p>
                  <p className="text-xs text-gray-400">{(booking.start_time as string).substring(0, 5)}</p>
                </div>
                <StatusBadge status={booking.status as string} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
