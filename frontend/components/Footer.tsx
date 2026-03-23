import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-brand-dark/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 font-bold text-brand-dark">
            <div className="w-6 h-6 bg-brand-blue rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-brand-dark/60">
            <Link href="/chi-siamo" className="hover:text-brand-blue transition-colors">
              Chi Siamo
            </Link>
            <Link href="/contatti" className="hover:text-brand-blue transition-colors">
              Contatti
            </Link>
            <Link href="/privacy" className="hover:text-brand-blue transition-colors">
              Privacy Policy
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-brand-dark/40">
            &copy; {year} Warehouse. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  )
}
