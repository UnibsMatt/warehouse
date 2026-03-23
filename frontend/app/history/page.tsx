import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { Order } from '@/lib/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
const PAGE_SIZE = 20

interface PaginatedOrderResponse {
  orders: Order[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    redirect('/login')
  }

  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  let data: PaginatedOrderResponse = {
    orders: [],
    total: 0,
    page: 1,
    page_size: PAGE_SIZE,
    total_pages: 1,
  }

  try {
    const res = await fetch(
      `${FASTAPI_URL}/api/orders/history?page=${page}&page_size=${PAGE_SIZE}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (res.status === 401) {
      redirect('/login')
    }

    if (res.ok) {
      data = await res.json()
    }
  } catch (err) {
    console.error('History page fetch error:', err)
  }

  const { orders, total, total_pages } = data

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Order History</h1>
            <p className="text-brand-dark/60 mt-1">Completed orders — {total} total</p>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <svg
                className="w-12 h-12 text-brand-dark/25 mx-auto mb-3"
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
              <p className="text-brand-dark/50">No completed orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-dark/5 border-b border-brand-dark/10">
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">
                      Order #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">
                      Products
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">Items</th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-dark/70">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => {
                    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
                    return (
                      <tr
                        key={order.id}
                        className={`border-b border-brand-dark/5 hover:bg-brand-dark/[0.04] transition-colors cursor-pointer ${
                          idx % 2 === 0 ? '' : 'bg-brand-dark/[0.02]'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-brand-dark">
                          <Link href={`/history/${order.id}`} className="block">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-brand-dark/60 whitespace-nowrap">
                          <Link href={`/history/${order.id}`} className="block">
                            {new Date(order.created_at).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                            <span className="ml-1 text-xs text-brand-dark/40">
                              {new Date(order.created_at).toLocaleTimeString('it-IT', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/history/${order.id}`} className="block">
                            <p className="font-medium text-brand-dark">
                              {order.client.name} {order.client.surname}
                            </p>
                            {order.client.azienda && (
                              <p className="text-xs text-brand-dark/50">{order.client.azienda}</p>
                            )}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/history/${order.id}`} className="block">
                            <div className="flex flex-wrap gap-1">
                              {order.items.map((item) => (
                                <span
                                  key={item.id}
                                  className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark/70"
                                >
                                  {item.product.name}
                                  <span className="ml-1 font-semibold">×{item.quantity}</span>
                                </span>
                              ))}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-brand-dark">
                          <Link href={`/history/${order.id}`} className="block">
                            {totalItems}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/history/${order.id}`} className="block">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-teal/15 text-brand-teal">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal"></span>
                              Completed
                            </span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total_pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-brand-dark/50">
              Page {page} of {total_pages} — {total} orders
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/history?page=${page - 1}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-dark/20 text-brand-dark/70 hover:bg-brand-dark/5 transition-colors"
                >
                  ← Previous
                </Link>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: total_pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === total_pages || Math.abs(p - page) <= 2)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-brand-dark/40 text-sm">
                        …
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={`/history?page=${p}`}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-brand-blue text-white'
                            : 'text-brand-dark/70 hover:bg-brand-dark/5'
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
              </div>

              {page < total_pages && (
                <Link
                  href={`/history?page=${page + 1}`}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-brand-dark/20 text-brand-dark/70 hover:bg-brand-dark/5 transition-colors"
                >
                  Next →
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
