'use client'

import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null)

  useEffect(() => {
    // Check health on mount
    checkHealth()

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const response = await fetch('/api/health', { cache: 'no-store' })
      const data = await response.json()
      setApiHealthy(data.healthy)
    } catch (error) {
      setApiHealthy(false)
    }
  }

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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-elevated border border-border">
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  apiHealthy === null 
                    ? 'bg-gray-400 animate-pulse' 
                    : apiHealthy 
                    ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
                    : 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                }`}
              />
              <span className={`text-xs font-medium ${
                apiHealthy === null 
                  ? 'text-gray-400' 
                  : apiHealthy 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {apiHealthy === null ? 'Checking' : apiHealthy ? 'Healthy' : 'Offline'}
              </span>
            </div>
            <span className="text-foreground-muted text-xs hidden md:inline font-mono uppercase tracking-wider">
              Shared System
            </span>
          </div>
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
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
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
