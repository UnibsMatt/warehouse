import type { DiscountTier } from './types'

/**
 * Returns the discount percentage (0–100) applicable for the given quantity.
 * The highest-threshold tier that the quantity satisfies wins.
 */
export function calculateDiscount(tiers: DiscountTier[], quantity: number): number {
  if (!tiers || tiers.length === 0) return 0
  let applicable = 0
  for (const tier of [...tiers].sort((a, b) => a.min_quantity - b.min_quantity)) {
    if (quantity >= tier.min_quantity) applicable = tier.discount_percent
  }
  return applicable
}

/**
 * Returns the discounted unit price for the given quantity, rounded to 2 dp.
 */
export function discountedPrice(unitPrice: number, tiers: DiscountTier[], quantity: number): number {
  const pct = calculateDiscount(tiers, quantity)
  return Math.round(unitPrice * (1 - pct / 100) * 100) / 100
}
