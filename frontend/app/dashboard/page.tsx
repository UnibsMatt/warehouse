import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import DashboardClient from '@/components/DashboardClient'
import type { Product, Client } from '@/lib/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

async function fetchWithToken<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${FASTAPI_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 401) {
    redirect('/login')
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`)
  }

  return res.json()
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const role = cookieStore.get('user_role')?.value
  const clientIdCookie = cookieStore.get('client_id')?.value

  if (!accessToken) {
    redirect('/login')
  }

  const isClientUser = role !== 'admin' && !!clientIdCookie

  let products: Product[] = []
  let clients: Client[] = []

  try {
    ;[products, clients] = await Promise.all([
      fetchWithToken<Product[]>('/api/products/', accessToken),
      fetchWithToken<Client[]>('/api/clients/', accessToken),
    ])

    // Client users only see their own client in the order form
    if (isClientUser) {
      const ownClientId = parseInt(clientIdCookie!)
      clients = clients.filter((c) => c.id === ownClientId)
    }
  } catch (err) {
    console.error('Dashboard fetch error:', err)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
          <p className="text-brand-dark/60 mt-1">Browse products and place orders.</p>
        </div>

        <DashboardClient products={products} clients={clients} isClientUser={isClientUser} />
      </main>
    </div>
  )
}
