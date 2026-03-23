import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Chi Siamo – Warehouse',
}

export default function ChiSiamoPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Chi Siamo</h1>
        <div className="w-12 h-1 bg-brand-blue rounded-full mb-8" />

        <div className="space-y-6 text-brand-dark/70 leading-relaxed">
          <p>
            Siamo un team dedicato allo sviluppo di soluzioni gestionali moderne e intuitive per il
            settore del magazzino e della logistica. Il nostro obiettivo è semplificare i processi
            aziendali attraverso tecnologie all'avanguardia, mettendo sempre al centro le esigenze
            dei nostri clienti.
          </p>
          <p>
            La nostra piattaforma nasce dall'esperienza diretta nel settore: anni di confronto con
            operatori, magazzinieri e responsabili acquisti ci hanno permesso di costruire uno
            strumento che risponde a problemi reali, con un'interfaccia chiara e un flusso di lavoro
            efficiente.
          </p>
          <p>
            Crediamo nella trasparenza, nella collaborazione e nell'innovazione continua. Ogni
            aggiornamento del sistema è guidato dal feedback della nostra comunità di utenti, perché
            il nostro successo è il loro successo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            {[
              { label: 'Anni di esperienza', value: '10+' },
              { label: 'Clienti attivi', value: '200+' },
              { label: 'Ordini gestiti', value: '50k+' },
            ].map((stat) => (
              <div key={stat.label} className="card text-center">
                <p className="text-3xl font-bold text-brand-blue">{stat.value}</p>
                <p className="text-sm text-brand-dark/60 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
