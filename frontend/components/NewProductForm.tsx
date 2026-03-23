'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [code, setCode] = useState('')
  const [quantity, setQuantity] = useState('0')
  const [price, setPrice] = useState('0.00')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          code,
          quantity: parseInt(quantity),
          price: parseFloat(price),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Failed to create product.')
        return
      }

      router.push(`/product/${data.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Laptop Dell XPS 15"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Type / Category</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="e.g. Elettronica"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder="e.g. DELL-XPS-15"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Unit Price (€)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Initial Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="0"
            className="input-field"
          />
        </div>

        {error && (
          <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
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
                Creating...
              </span>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
