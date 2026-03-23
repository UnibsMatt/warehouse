'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Login failed. Please try again.')
        return
      }

      // Redirect based on role
      const role = data.user?.role
      if (role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-blue rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-brand-dark">Warehouse</h1>
          <p className="text-brand-dark/60 mt-1">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/30 text-brand-red px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-white rounded-xl border border-brand-dark/10 p-5 shadow-sm">
          <p className="text-xs font-semibold text-brand-dark/50 uppercase tracking-wider mb-3">
            Demo credentials
          </p>
          <div className="space-y-3">
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-brand-cream rounded-lg p-2 -m-2 transition-colors"
              onClick={() => {
                setEmail('admin@warehouse.com')
                setPassword('admin123')
              }}
            >
              <div>
                <p className="text-sm font-medium text-brand-dark">Admin</p>
                <p className="text-xs text-brand-dark/50">admin@warehouse.com / admin123</p>
              </div>
              <span className="text-xs bg-brand-blue/15 text-brand-blue px-2 py-1 rounded-full font-medium">
                Admin
              </span>
            </div>
            <div className="border-t border-brand-dark/10" />
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-brand-cream rounded-lg p-2 -m-2 transition-colors"
              onClick={() => {
                setEmail('marco.rossi@tecnoitalia.it')
                setPassword('client123')
              }}
            >
              <div>
                <p className="text-sm font-medium text-brand-dark">
                  Marco Rossi — TecnoItalia S.r.l.
                </p>
                <p className="text-xs text-brand-dark/50">marco.rossi@tecnoitalia.it / client123</p>
              </div>
              <span className="text-xs bg-brand-teal/15 text-brand-teal px-2 py-1 rounded-full font-medium">
                Client
              </span>
            </div>
            <div className="border-t border-brand-dark/10" />
            <div
              className="flex items-center justify-between cursor-pointer hover:bg-brand-cream rounded-lg p-2 -m-2 transition-colors"
              onClick={() => {
                setEmail('giulia.ferrari@innovagroup.it')
                setPassword('client123')
              }}
            >
              <div>
                <p className="text-sm font-medium text-brand-dark">
                  Giulia Ferrari — Innova Group S.p.A.
                </p>
                <p className="text-xs text-brand-dark/50">
                  giulia.ferrari@innovagroup.it / client123
                </p>
              </div>
              <span className="text-xs bg-brand-teal/15 text-brand-teal px-2 py-1 rounded-full font-medium">
                Client
              </span>
            </div>
          </div>
          <p className="text-xs text-brand-dark/40 mt-3 text-center">
            Click to auto-fill credentials
          </p>
        </div>
      </div>
    </div>
  )
}
