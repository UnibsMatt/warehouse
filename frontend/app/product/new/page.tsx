import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import NewProductForm from '@/components/NewProductForm'

export default async function NewProductPage() {
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
          <h1 className="text-2xl font-bold text-brand-dark">New Product</h1>
          <p className="text-brand-dark/60 mt-1">Add a new product to the warehouse.</p>
        </div>
        <NewProductForm />
      </main>
    </div>
  )
}
