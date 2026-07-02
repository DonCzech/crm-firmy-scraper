import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
