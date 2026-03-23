import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Navbar() {
  const cookieStore = await cookies()
  const role = cookieStore.get('user_role')?.value

  return (
    <nav className="bg-white border-b border-brand-dark/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-xl text-brand-dark hover:text-brand-blue transition-colors"
            >
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              Warehouse
            </Link>

            {/* Nav links */}
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brand-dark/60 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="px-3 py-2 rounded-lg text-sm font-medium text-brand-dark/60 hover:text-brand-blue hover:bg-brand-blue/10 transition-colors"
              >
                History
              </Link>
              {role === 'admin' && (
                <>
                  <Link
                    href="/product/new"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-brand-dark/60 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                  >
                    Product
                  </Link>
                  <Link
                    href="/client/new"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-brand-dark/60 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                  >
                    Client
                  </Link>
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-brand-dark/60 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                  >
                    Admin Panel
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {role && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  role === 'admin'
                    ? 'bg-brand-blue/15 text-brand-blue'
                    : 'bg-brand-teal/15 text-brand-teal'
                }`}
              >
                {role === 'admin' ? 'Admin' : 'User'}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
