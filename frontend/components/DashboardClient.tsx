'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Product, Client } from '@/lib/types'
import OrderConfirmModal from './OrderConfirmModal'

const PAGE_SIZE = 10
const CART_STORAGE_KEY = 'warehouse_cart'
const CLIENT_STORAGE_KEY = 'warehouse_selected_client'

interface CartItem {
  product: Product
  quantity: number
}

interface DashboardClientProps {
  products: Product[]
  clients: Client[]
  isClientUser: boolean
}

function cartToStorage(cart: Map<number, CartItem>): string {
  return JSON.stringify(Array.from(cart.entries()))
}

function cartFromStorage(raw: string | null): Map<number, CartItem> {
  if (!raw) return new Map()
  try {
    const entries = JSON.parse(raw) as [number, CartItem][]
    return new Map(entries)
  } catch {
    return new Map()
  }
}

export default function DashboardClient({ products, clients, isClientUser }: DashboardClientProps) {
  const router = useRouter()

  const [cart, setCart] = useState<Map<number, CartItem>>(() => {
    if (typeof window === 'undefined') return new Map()
    return cartFromStorage(localStorage.getItem(CART_STORAGE_KEY))
  })

  const [selectedClientId, setSelectedClientId] = useState<string>(() => {
    if (isClientUser && clients.length === 1) return String(clients[0].id)
    if (typeof window === 'undefined') return ''
    return localStorage.getItem(CLIENT_STORAGE_KEY) ?? ''
  })

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, cartToStorage(cart))
  }, [cart])

  // Sync selected client to localStorage whenever it changes
  useEffect(() => {
    if (!isClientUser) {
      localStorage.setItem(CLIENT_STORAGE_KEY, selectedClientId)
    }
  }, [selectedClientId, isClientUser])

  // Poll for stock updates every 30 seconds
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 30_000)
    return () => clearInterval(id)
  }, [router])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(product.id)
      if (existing) {
        if (existing.quantity < product.quantity) {
          newCart.set(product.id, { product, quantity: existing.quantity + 1 })
        }
      } else {
        if (product.quantity > 0) {
          newCart.set(product.id, { product, quantity: 1 })
        }
      }
      return newCart
    })
  }, [])

  const removeFromCart = useCallback((product: Product) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(product.id)
      if (existing) {
        if (existing.quantity > 1) {
          newCart.set(product.id, { product, quantity: existing.quantity - 1 })
        } else {
          newCart.delete(product.id)
        }
      }
      return newCart
    })
  }, [])

  const cartTotal = Array.from(cart.values()).reduce((sum, item) => sum + item.quantity, 0)

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handlePlaceOrder() {
    if (!selectedClientId) {
      setErrorMsg('Please select a client.')
      return
    }
    if (cart.size === 0) {
      setErrorMsg('Your cart is empty.')
      return
    }
    setErrorMsg('')
    setSuccessMsg('')
    setShowModal(true)
  }

  async function handleConfirmOrder() {
    setLoading(true)

    const items = Array.from(cart.values()).map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }))

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: parseInt(selectedClientId),
          items,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setShowModal(false)
        setErrorMsg(data.detail || 'Failed to place order.')
        return
      }

      setShowModal(false)
      setSuccessMsg(`Order #${data.id} placed successfully!`)
      setCart(new Map())
      localStorage.removeItem(CART_STORAGE_KEY)
      const defaultClient = isClientUser && clients.length === 1 ? String(clients[0].id) : ''
      setSelectedClientId(defaultClient)
      if (!isClientUser) localStorage.removeItem(CLIENT_STORAGE_KEY)
      router.refresh()
    } catch {
      setShowModal(false)
      setErrorMsg('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedClient = clients.find((c) => String(c.id) === selectedClientId)

  return (
    <>
      {showModal && selectedClient && (
        <OrderConfirmModal
          cartItems={Array.from(cart.values())}
          client={selectedClient}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Products Table */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-brand-dark">
              Products
              <span className="ml-2 text-sm font-normal text-brand-dark/50">
                ({filteredProducts.length}
                {filteredProducts.length !== products.length ? ` of ${products.length}` : ''} items)
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-dark/40 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="input-field pl-8 pr-3 py-1.5 text-sm w-48"
                />
              </div>
              {/* Chart button (placeholder) */}
              <button
                disabled
                title="Charts coming soon"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-dark/20 text-brand-dark/40 text-sm cursor-not-allowed select-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Chart
              </button>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-brand-dark/50">No products available.</p>
            </div>
          ) : (
            <>
              <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-dark/10 bg-brand-dark/5">
                        <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Code</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-dark/60">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-brand-dark/60 hidden sm:table-cell">
                          Type
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-brand-dark/60">
                          Stock
                        </th>
                        <th className="text-right px-4 py-3 font-medium text-brand-dark/60">Qty</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-brand-dark/40">
                            No products match your search.
                          </td>
                        </tr>
                      ) : (
                        pagedProducts.map((product) => {
                          const cartItem = cart.get(product.id)
                          const cartQty = cartItem?.quantity ?? 0
                          const availableQty = product.quantity - cartQty

                          return (
                            <tr
                              key={product.id}
                              className={`border-b border-brand-dark/5 last:border-0 hover:bg-brand-dark/[0.02] transition-colors ${
                                product.quantity === 0 ? 'opacity-60' : ''
                              }`}
                            >
                              <td className="px-4 py-3 text-brand-dark/50 font-mono text-xs whitespace-nowrap">
                                {product.code}
                              </td>
                              <td className="px-4 py-3">
                                <Link
                                  href={`/product/${product.id}`}
                                  className="font-medium text-brand-dark hover:text-brand-blue transition-colors"
                                >
                                  {product.name}
                                </Link>
                              </td>
                              <td className="px-4 py-3 hidden sm:table-cell">
                                <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-brand-dark/10 text-brand-dark/70">
                                  {product.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`font-bold ${
                                    availableQty === 0
                                      ? 'text-brand-red'
                                      : availableQty <= 5
                                        ? 'text-yellow-600'
                                        : 'text-brand-teal'
                                  }`}
                                >
                                  {availableQty}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {cartQty > 0 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-blue text-white text-xs font-bold rounded-full">
                                    {cartQty}
                                  </span>
                                ) : (
                                  <span className="text-brand-dark/20">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => removeFromCart(product)}
                                    disabled={cartQty === 0}
                                    className="w-7 h-7 rounded-lg bg-brand-dark/10 hover:bg-brand-dark/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-brand-dark font-bold transition-colors"
                                    aria-label="Remove from cart"
                                  >
                                    −
                                  </button>
                                  <button
                                    onClick={() => addToCart(product)}
                                    disabled={availableQty === 0}
                                    className="w-7 h-7 rounded-lg bg-brand-blue hover:bg-brand-blue/85 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold transition-colors"
                                    aria-label="Add to cart"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 text-sm text-brand-dark/60">
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2.5 py-1 rounded-lg border border-brand-dark/20 hover:bg-brand-dark/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹ Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg border transition-colors ${
                          p === page
                            ? 'bg-brand-blue text-white border-brand-blue font-semibold'
                            : 'border-brand-dark/20 hover:bg-brand-dark/5'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2.5 py-1 rounded-lg border border-brand-dark/20 hover:bg-brand-dark/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="card sticky top-24">
            <h2 className="text-lg font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-brand-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cart
              {cartTotal > 0 && (
                <span className="ml-auto text-sm font-normal text-brand-dark/50">
                  {cartTotal} item{cartTotal !== 1 ? 's' : ''}
                </span>
              )}
            </h2>

            {/* Cart Items */}
            {cart.size === 0 ? (
              <div className="text-center py-8">
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
                    d="M3 3h2l.4 2M7 13h10l4-4H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm text-brand-dark/40">Your cart is empty</p>
                <p className="text-xs text-brand-dark/40 mt-1">Add products using the + button</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {Array.from(cart.values()).map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between py-2 border-b border-brand-dark/10 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-dark truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-brand-dark/50">{item.product.code}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => removeFromCart(item.product)}
                        className="w-6 h-6 rounded bg-brand-dark/10 hover:bg-brand-dark/20 flex items-center justify-center text-brand-dark/60 text-xs font-bold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-brand-dark">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item.product)}
                        disabled={item.quantity >= item.product.quantity}
                        className="w-6 h-6 rounded bg-brand-blue hover:bg-brand-blue/85 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-xs font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Client Selector */}
            {isClientUser ? (
              clients.length === 1 && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-brand-dark/5 text-sm text-brand-dark/70">
                  Ordering as{' '}
                  <span className="font-medium text-brand-dark">
                    {clients[0].name} {clients[0].surname}
                  </span>
                  {clients[0].azienda && ` — ${clients[0].azienda}`}
                </div>
              )
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-brand-dark mb-1">Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={String(client.id)}>
                      {client.name} {client.surname}
                      {client.azienda ? ` — ${client.azienda}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Messages */}
            {successMsg && (
              <div className="mb-4 bg-brand-teal/10 border border-brand-teal/30 text-brand-teal px-4 py-3 rounded-lg text-sm">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-4 bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || cart.size === 0 || !selectedClientId}
              className="w-full btn-primary py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
                  Placing order...
                </span>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
