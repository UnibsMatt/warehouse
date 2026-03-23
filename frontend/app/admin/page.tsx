import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import AdminClient from '@/components/AdminClient'
import type { Order } from '@/lib/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const role = cookieStore.get('user_role')?.value

  if (!accessToken) {
    redirect('/login')
  }

  if (role !== 'admin') {
    redirect('/dashboard')
  }

  let allOrders: Order[] = []

  try {
    const res = await fetch(`${FASTAPI_URL}/api/orders/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (res.status === 401) {
      redirect('/login')
    }

    if (res.ok) {
      allOrders = await res.json()
    }
  } catch (err) {
    console.error('Admin page fetch error:', err)
  }

  const pendingCount = allOrders.filter((o) => o.status === 'pending').length

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Admin Panel</h1>
            <p className="text-brand-dark/60 mt-1">
              All orders — {allOrders.length} total
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-brand-red/10 border border-brand-red/25 px-4 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-brand-red"></span>
              <span className="text-sm font-medium text-brand-red">
                {pendingCount} pending order{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <AdminClient initialOrders={allOrders} />
      </main>
    </div>
  )
}
