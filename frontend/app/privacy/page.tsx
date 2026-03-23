import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Privacy Policy – Warehouse',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Privacy Policy</h1>
        <div className="w-12 h-1 bg-brand-blue rounded-full mb-2" />
        <p className="text-sm text-brand-dark/40 mb-8">Ultimo aggiornamento: marzo 2026</p>

        <div className="space-y-8 text-brand-dark/70 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali è <strong className="text-brand-dark">Warehouse S.r.l.</strong>,
              con sede legale in Via della Logistica 12, 20100 Milano (MI), P.IVA 01234567890.
              Per qualsiasi richiesta relativa alla privacy puoi contattarci all'indirizzo{' '}
              <span className="text-brand-blue">privacy@warehouse.it</span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">2. Dati raccolti</h2>
            <p>
              Raccogliamo i dati strettamente necessari al funzionamento della piattaforma:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Dati di accesso (email, password in forma cifrata)</li>
              <li>Dati anagrafici e aziendali dei clienti</li>
              <li>Dati relativi agli ordini e alle transazioni</li>
              <li>Log di accesso per la sicurezza del sistema</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">3. Finalità del trattamento</h2>
            <p>I dati sono trattati per le seguenti finalità:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
              <li>Erogazione del servizio di gestione magazzino</li>
              <li>Gestione degli ordini e della fatturazione</li>
              <li>Adempimenti legali e fiscali</li>
              <li>Sicurezza e prevenzione delle frodi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">4. Base giuridica</h2>
            <p>
              Il trattamento si basa sull'esecuzione del contratto di servizio (art. 6, par. 1,
              lett. b del GDPR), sugli obblighi legali (art. 6, par. 1, lett. c) e, ove
              applicabile, sul legittimo interesse del titolare (art. 6, par. 1, lett. f).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">5. Conservazione dei dati</h2>
            <p>
              I dati vengono conservati per il tempo necessario all'erogazione del servizio e,
              successivamente, per il periodo previsto dagli obblighi di legge (di norma 10 anni
              per i dati fiscali). I log di accesso sono conservati per 12 mesi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">6. Diritti dell'interessato</h2>
            <p>
              In conformità al GDPR hai diritto di accedere ai tuoi dati, rettificarli,
              cancellarli, limitarne il trattamento, opporti al trattamento e richiederne
              la portabilità. Per esercitare questi diritti scrivi a{' '}
              <span className="text-brand-blue">privacy@warehouse.it</span>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">7. Cookie</h2>
            <p>
              La piattaforma utilizza cookie tecnici essenziali (sessione autenticata) e non
              installa cookie di profilazione o di terze parti a fini pubblicitari.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-dark mb-3">8. Modifiche alla policy</h2>
            <p>
              Ci riserviamo di aggiornare questa policy per adeguarla a modifiche normative o
              funzionali. Le modifiche rilevanti saranno comunicate via email agli utenti registrati.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
