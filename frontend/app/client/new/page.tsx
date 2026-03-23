import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NewClientForm from '@/components/NewClientForm'

export default async function NewClientPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  const role = cookieStore.get('user_role')?.value

  if (!accessToken) {
    redirect('/login')
  }

  if (role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-dark">New Client</h1>
          <p className="text-brand-dark/60 mt-1">Register a new client.</p>
        </div>
        <NewClientForm />
      </main>
    </div>
  )
}
