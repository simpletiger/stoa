'use client'

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

  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Stoa</h1>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface-elevated border border-border">
              <div 
                className={`w-2.5 h-2.5 rounded-full ${
                  apiHealthy === null 
                    ? 'bg-gray-400 animate-pulse' 
                    : apiHealthy 
                    ? 'bg-green-500 animate-status-pulse' 
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
      </div>
    </header>
  )
}
