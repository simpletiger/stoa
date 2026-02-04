'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
      user_name?: string
    }
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = 
    user.user_metadata?.full_name || 
    user.user_metadata?.user_name || 
    user.email?.split('@')[0] || 
    'User'

  return (
    <header className="bg-[#1e1f29] border-b border-dark-100">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Stoa</h1>
          <span className="text-dark-200 text-sm hidden sm:inline">
            Shared Nervous System
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center">
                <User className="w-5 h-5 text-[#282a36]" />
              </div>
            )}
            <span className="text-foreground hidden sm:inline">{displayName}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:text-foreground hover:bg-dark-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
