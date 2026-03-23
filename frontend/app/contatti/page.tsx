import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Contatti – Warehouse',
}

export default function ContattiPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Contatti</h1>
        <div className="w-12 h-1 bg-brand-blue rounded-full mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <p className="text-brand-dark/70 leading-relaxed">
              Hai domande, suggerimenti o hai bisogno di supporto? Il nostro team è a
              disposizione per aiutarti. Contattaci attraverso uno dei canali qui sotto
              e ti risponderemo al più presto.
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  label: 'Email',
                  value: 'info@warehouse.it',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                  label: 'Telefono',
                  value: '+39 02 1234567',
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  label: 'Indirizzo',
                  value: 'Via della Logistica 12, 20100 Milano (MI)',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-brand-blue/10 text-brand-blue rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-dark/40 uppercase tracking-wide">{item.label}</p>
                    <p className="text-brand-dark font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick contact form */}
          <div className="card">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Inviaci un messaggio</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark/70 mb-1">Nome</label>
                <input type="text" placeholder="Mario Rossi" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark/70 mb-1">Email</label>
                <input type="email" placeholder="mario@esempio.it" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark/70 mb-1">Messaggio</label>
                <textarea
                  rows={4}
                  placeholder="Scrivi il tuo messaggio..."
                  className="input-field resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Invia messaggio
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
