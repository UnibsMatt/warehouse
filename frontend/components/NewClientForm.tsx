'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [partitaIva, setPartitaIva] = useState('')
  const [azienda, setAzienda] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          email,
          partita_iva: partitaIva || null,
          azienda: azienda || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Failed to create client.')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">First Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Marco"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-1">Last Name</label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              placeholder="Rossi"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="marco.rossi@example.com"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">
            Company <span className="text-brand-dark/40 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={azienda}
            onChange={(e) => setAzienda(e.target.value)}
            placeholder="Acme S.r.l."
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-1">
            Partita IVA <span className="text-brand-dark/40 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={partitaIva}
            onChange={(e) => setPartitaIva(e.target.value)}
            placeholder="IT12345678901"
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
              'Create Client'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
