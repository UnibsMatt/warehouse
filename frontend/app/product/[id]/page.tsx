import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import DiscountEditor from '@/components/DiscountEditor'
import type { Product } from '@/lib/types'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const role = cookieStore.get('user_role')?.value

  if (!accessToken) {
    redirect('/login')
  }

  const res = await fetch(`${FASTAPI_URL}/api/products/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (res.status === 401) redirect('/login')
  if (res.status === 404) notFound()

  const product: Product = await res.json()

  const stockColor =
    product.quantity === 0
      ? 'text-brand-red'
      : product.quantity <= 5
      ? 'text-yellow-600'
      : 'text-brand-teal'

  const sortedTiers = [...(product.discount_tiers ?? [])].sort(
    (a, b) => a.min_quantity - b.min_quantity
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-dark/50 mb-6">
          <Link href="/dashboard" className="hover:text-brand-blue transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-brand-dark">{product.name}</span>
        </div>

        <div className="card">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">{product.name}</h1>
              <p className="text-sm text-brand-dark/50 mt-1 font-mono">{product.code}</p>
            </div>
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-brand-dark/10 text-brand-dark/70">
              {product.type}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-brand-cream rounded-lg p-4">
              <p className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1">
                In Stock
              </p>
              <p className={`text-3xl font-bold ${stockColor}`}>{product.quantity}</p>
            </div>
            <div className="bg-brand-cream rounded-lg p-4">
              <p className="text-xs font-medium text-brand-dark/50 uppercase tracking-wider mb-1">
                Product ID
              </p>
              <p className="text-3xl font-bold text-brand-dark">#{product.id}</p>
            </div>
          </div>

          {/* Details */}
          <div className="border-t border-brand-dark/10 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/50">Name</span>
              <span className="font-medium text-brand-dark">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/50">Code</span>
              <span className="font-mono font-medium text-brand-dark">{product.code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/50">Type</span>
              <span className="font-medium text-brand-dark">{product.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-dark/50">Quantity</span>
              <span className={`font-bold ${stockColor}`}>{product.quantity}</span>
            </div>
          </div>

          {/* Discount section */}
          <div className="border-t border-brand-dark/10 pt-6 mt-6">
            {role === 'admin' ? (
              <DiscountEditor productId={product.id} initialTiers={sortedTiers} />
            ) : sortedTiers.length > 0 ? (
              <div>
                <h3 className="text-sm font-semibold text-brand-dark mb-3">Volume Discounts</h3>
                <div className="space-y-2">
                  {sortedTiers.map((tier) => (
                    <div
                      key={tier.min_quantity}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-brand-blue/5 border border-brand-blue/15"
                    >
                      <span className="text-brand-dark/70">
                        Order <span className="font-semibold text-brand-dark">{tier.min_quantity}+</span> units
                      </span>
                      <span className="font-semibold text-brand-blue">{tier.discount_percent}% off</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-brand-dark/10">
            <Link href="/dashboard" className="btn-secondary">
              ← Back
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
