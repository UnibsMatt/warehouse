import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Order } from '@/lib/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    redirect('/login')
  }

  const res = await fetch(`${FASTAPI_URL}/api/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()

  const order: Order = await res.json()

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-dark/50 mb-6">
          <Link href="/history" className="hover:text-brand-blue transition-colors">
            Order History
          </Link>
          <span>/</span>
          <span className="text-brand-dark">Order #{order.id}</span>
        </div>

        <div className="card">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Order #{order.id}</h1>
              <p className="text-sm text-brand-dark/50 mt-1">
                {new Date(order.created_at).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
                <span className="ml-1">
                  {new Date(order.created_at).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-teal/15 text-brand-teal">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
              Completed
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-cream rounded-lg p-4">
              <p className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1">
                Total Items
              </p>
              <p className="text-3xl font-bold text-brand-dark">{totalItems}</p>
            </div>
            <div className="bg-brand-cream rounded-lg p-4">
              <p className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1">
                Product Lines
              </p>
              <p className="text-3xl font-bold text-brand-dark">{order.items.length}</p>
            </div>
          </div>

          {/* Client */}
          <div className="border-t border-brand-dark/10 pt-6 mb-6">
            <h2 className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider mb-3">
              Client
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-dark/50">Name</span>
                <span className="font-medium text-brand-dark">
                  {order.client.name} {order.client.surname}
                </span>
              </div>
              {order.client.azienda && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-dark/50">Company</span>
                  <span className="font-medium text-brand-dark">{order.client.azienda}</span>
                </div>
              )}
              {order.client.partita_iva && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand-dark/50">P. IVA</span>
                  <span className="font-mono font-medium text-brand-dark">
                    {order.client.partita_iva}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-brand-dark/50">Email</span>
                <span className="font-medium text-brand-dark">{order.client.email}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-brand-dark/10 pt-6">
            <h2 className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider mb-3">
              Items
            </h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-brand-cream"
                >
                  <div>
                    <p className="font-medium text-brand-dark text-sm">{item.product.name}</p>
                    <p className="text-xs text-brand-dark/50 font-mono">{item.product.code}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-dark/50 bg-brand-dark/10 px-2 py-0.5 rounded-full">
                      {item.product.type}
                    </span>
                    <span className="text-sm font-bold text-brand-dark">×{item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-brand-dark/10">
            <Link href="/history" className="btn-secondary">
              ← Back to History
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
