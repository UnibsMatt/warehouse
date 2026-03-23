'use client'

import { useEffect } from 'react'
import type { Product, Client } from '@/lib/types'
import { calculateDiscount, discountedPrice } from '@/lib/discount'

interface CartItem {
  product: Product
  quantity: number
}

interface OrderConfirmModalProps {
  cartItems: CartItem[]
  client: Client
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function fmt(n: number): string {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function OrderConfirmModal({
  cartItems,
  client,
  onConfirm,
  onCancel,
  loading,
}: OrderConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  const rows = cartItems.map((item) => {
    const unit = Number(item.product.price)
    const discPct = calculateDiscount(item.product.discount_tiers, item.quantity)
    const discUnit = discountedPrice(unit, item.product.discount_tiers, item.quantity)
    const lineTotal = Math.round(discUnit * item.quantity * 100) / 100
    return { item, unit, discPct, discUnit, lineTotal }
  })

  const grandTotal = rows.reduce((sum, r) => sum + r.lineTotal, 0)
  const originalTotal = rows.reduce((sum, r) => sum + r.unit * r.item.quantity, 0)
  const totalSaving = Math.round((originalTotal - grandTotal) * 100) / 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-dark/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-brand-dark">Confirm Order</h2>
            <p className="text-sm text-brand-dark/50 mt-0.5">
              For{' '}
              <span className="font-medium text-brand-dark">
                {client.name} {client.surname}
              </span>
              {client.azienda && ` — ${client.azienda}`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-brand-cream/90 backdrop-blur-sm">
              <tr className="border-b border-brand-dark/10">
                <th className="px-6 py-3 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Unit price
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Discount
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {rows.map(({ item, unit, discPct, discUnit, lineTotal }) => (
                <tr key={item.product.id} className="hover:bg-brand-dark/[0.02]">
                  <td className="px-6 py-3">
                    <p className="font-medium text-brand-dark">{item.product.name}</p>
                    <p className="text-xs text-brand-dark/40 font-mono">{item.product.code}</p>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-brand-dark">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-3 text-right text-brand-dark/60">
                    {discPct > 0 ? (
                      <span className="line-through text-brand-dark/35">€{fmt(unit)}</span>
                    ) : (
                      <span>€{fmt(unit)}</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {discPct > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue">
                        −{discPct}%
                        <span className="text-brand-dark/60 font-normal">→ €{fmt(discUnit)}</span>
                      </span>
                    ) : (
                      <span className="text-brand-dark/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-brand-dark">
                    €{fmt(lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-dark/10 bg-brand-cream/60">
          {/* Totals */}
          <div className="flex flex-col items-end gap-1 mb-4">
            {totalSaving > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-brand-dark/50">You save</span>
                <span className="font-semibold text-brand-teal">−€{fmt(totalSaving)}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-dark/60">Grand total</span>
              <span className="text-2xl font-bold text-brand-dark">€{fmt(grandTotal)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading} className="flex-1 btn-secondary py-2.5">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-[2] btn-primary py-2.5">
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
                'Confirm & Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
