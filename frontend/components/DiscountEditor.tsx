'use client'

import { useState } from 'react'
import type { DiscountTier } from '@/lib/types'

interface DiscountEditorProps {
  productId: number
  initialTiers: DiscountTier[]
}

export default function DiscountEditor({ productId, initialTiers }: DiscountEditorProps) {
  const [tiers, setTiers] = useState<DiscountTier[]>(
    [...initialTiers].sort((a, b) => a.min_quantity - b.min_quantity)
  )
  const [newMinQty, setNewMinQty] = useState('')
  const [newPct, setNewPct] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function addTier() {
    const minQty = parseInt(newMinQty)
    const pct = parseFloat(newPct)

    if (!Number.isInteger(minQty) || minQty < 1) {
      setErrorMsg('Minimum quantity must be a positive integer.')
      return
    }
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setErrorMsg('Discount must be between 0 and 100.')
      return
    }
    if (tiers.some((t) => t.min_quantity === minQty)) {
      setErrorMsg(`A tier for quantity ${minQty} already exists.`)
      return
    }

    setErrorMsg('')
    setTiers((prev) =>
      [...prev, { min_quantity: minQty, discount_percent: pct }].sort(
        (a, b) => a.min_quantity - b.min_quantity
      )
    )
    setNewMinQty('')
    setNewPct('')
  }

  function removeTier(minQty: number) {
    setTiers((prev) => prev.filter((t) => t.min_quantity !== minQty))
  }

  async function saveTiers() {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discount_tiers: tiers }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.detail || 'Failed to save discount tiers.')
        return
      }

      setSuccessMsg('Discount tiers saved successfully.')
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-brand-dark">Discount Tiers</h3>
        <span className="text-xs text-brand-dark/40">Admin only</span>
      </div>

      {/* Existing tiers */}
      {tiers.length === 0 ? (
        <p className="text-sm text-brand-dark/40 mb-4">No discount tiers configured.</p>
      ) : (
        <div className="mb-4 rounded-lg overflow-hidden border border-brand-dark/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-dark/5 border-b border-brand-dark/10">
                <th className="px-3 py-2 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Min Qty
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-brand-dark/50 uppercase tracking-wide">
                  Discount
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-dark/5">
              {tiers.map((tier) => (
                <tr key={tier.min_quantity} className="hover:bg-brand-dark/[0.02]">
                  <td className="px-3 py-2 font-medium text-brand-dark">
                    ≥ {tier.min_quantity} units
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-blue/15 text-brand-blue">
                      {tier.discount_percent}% off
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeTier(tier.min_quantity)}
                      className="text-brand-red/60 hover:text-brand-red transition-colors text-xs font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add new tier */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="block text-xs text-brand-dark/50 mb-1">Min quantity</label>
          <input
            type="number"
            min={1}
            value={newMinQty}
            onChange={(e) => setNewMinQty(e.target.value)}
            placeholder="e.g. 10"
            className="input-field text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-brand-dark/50 mb-1">Discount %</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={newPct}
            onChange={(e) => setNewPct(e.target.value)}
            placeholder="e.g. 10"
            className="input-field text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={addTier}
            className="px-3 py-2 rounded-lg bg-brand-dark/10 hover:bg-brand-dark/15 text-brand-dark text-sm font-medium transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="mb-3 bg-brand-red/10 border border-brand-red/30 text-brand-red px-3 py-2 rounded-lg text-xs">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 bg-brand-teal/10 border border-brand-teal/30 text-brand-teal px-3 py-2 rounded-lg text-xs">
          {successMsg}
        </div>
      )}

      <button onClick={saveTiers} disabled={saving} className="w-full btn-primary py-2 text-sm">
        {saving ? 'Saving...' : 'Save Discount Tiers'}
      </button>
    </div>
  )
}
