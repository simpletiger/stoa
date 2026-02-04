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
    <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Stoa</h1>
          <span className="text-foreground-muted text-xs hidden sm:inline font-mono uppercase tracking-wider">
            Shared System
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={displayName}
                className="w-7 h-7 rounded-full ring-1 ring-border"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-foreground-muted hidden sm:inline text-sm">{displayName}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-md transition-colors border border-border"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
