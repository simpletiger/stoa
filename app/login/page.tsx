import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Stoa</h1>
          <p className="text-dark-200">Shared Nervous System</p>
        </div>

        <div className="bg-[#1e1f29] rounded-lg border border-dark-100 p-8 shadow-xl animate-slide-up">
          <LoginForm />
        </div>

        <p className="text-center text-dark-200 text-sm mt-6">
          A meditative space where thought becomes action
        </p>
      </div>
    </div>
  )
}
