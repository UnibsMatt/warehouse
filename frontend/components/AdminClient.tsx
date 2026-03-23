'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, OrderItem } from '@/lib/types'

function orderTotal(order: Order): number {
  return order.items.reduce((sum, item: OrderItem) => {
    const tier = item.product.discount_tiers
      .filter((t) => t.min_quantity <= item.quantity)
      .sort((a, b) => b.min_quantity - a.min_quantity)[0]
    const discount = tier?.discount_percent ?? 0
    return sum + Number(item.product.price) * (1 - discount / 100) * item.quantity
  }, 0)
}

interface AdminClientProps {
  initialOrders: Order[]
}

export default function AdminClient({ initialOrders }: AdminClientProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [completing, setCompleting] = useState<Set<number>>(new Set())
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function markComplete(orderId: number) {
    setCompleting((prev) => new Set(prev).add(orderId))
    setErrorMsg('')

    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ detail: 'Failed to update order' }))
        setErrorMsg(data.detail || 'Failed to update order status.')
        return
      }

      // Update status in-place
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o)))
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setCompleting((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      {errorMsg && (
        <div className="mb-4 bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-brand-dark/8 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-dark/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-brand-dark mb-1">No orders yet</h3>
          <p className="text-brand-dark/60">Orders will appear here once clients place them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-brand-dark/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-cream border-b border-brand-dark/10">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-dark/10">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/history/${order.id}`)}
                    className="hover:bg-brand-cream/60 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-brand-dark">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-brand-dark">
                          {order.client.name} {order.client.surname}
                        </p>
                        {order.client.azienda && (
                          <p className="text-xs text-brand-dark/50">{order.client.azienda}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 max-w-xs">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span className="text-xs bg-brand-dark/10 text-brand-dark px-2 py-0.5 rounded font-mono">
                              ×{item.quantity}
                            </span>
                            <span className="text-sm text-brand-dark/70 truncate">
                              {item.product.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-brand-dark/50">
                        {formatDate(order.created_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-brand-dark">
                        €{orderTotal(order).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-red/10 text-brand-red">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-teal/15 text-brand-teal">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                          Completed
                        </span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {order.status === 'pending' && (
                        <button
                          onClick={() => markComplete(order.id)}
                          disabled={completing.has(order.id)}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completing.has(order.id) ? (
                            <>
                              <svg
                                className="animate-spin h-3.5 w-3.5"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Mark Complete
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
