'use client'

import { createClient } from '@/lib/supabase/client'
import { Github } from 'lucide-react'

export default function LoginForm() {
  const supabase = createClient()

  const handleGitHubLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error logging in:', error.message)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGitHubLogin}
        className="w-full flex items-center justify-center gap-3 bg-purple text-[#282a36] font-semibold py-3 px-4 rounded-lg hover:bg-purple/90 transition-all"
      >
        <Github className="w-5 h-5" />
        Sign in with GitHub
      </button>

      <p className="text-sm text-dark-200 text-center">
        Authenticate with your GitHub account to access Stoa
      </p>
    </div>
  )
}
