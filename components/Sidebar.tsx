'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Brain, 
  Users, 
  FolderOpen, 
  Puzzle, 
  Settings,
  Menu,
  X,
  UserCircle,
  Wrench,
  Fingerprint,
  Activity,
  Edit,
  Shield,
  LogOut,
  User
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Tasks', href: '/', icon: LayoutDashboard },
  { name: 'Soul', href: '/soul', icon: Brain },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'User', href: '/user', icon: UserCircle },
  { name: 'Tools', href: '/tools', icon: Wrench },
  { name: 'Identity', href: '/identity', icon: Fingerprint },
  { name: 'Heartbeat', href: '/heartbeat', icon: Activity },
  { name: 'Memory', href: '/memory', icon: FolderOpen },
  { name: 'Skills', href: '/skills', icon: Puzzle },
  { name: 'Skill Editor', href: '/skill-editor', icon: Edit },
  { name: 'Config', href: '/config', icon: Settings },
  { name: 'Security', href: '/security', icon: Shield },
]

interface SidebarProps {
  user: {
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
      user_name?: string
    }
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <>
      {/* Mobile menu hamburger button - always visible on mobile, right side */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-6 right-4 z-[60] p-2.5 rounded-lg bg-surface border border-white/20 hover:bg-surface-elevated shadow-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 z-40 h-screen w-64 bg-surface/95 backdrop-blur-xl border-white/10
          transition-transform duration-300 ease-in-out
          right-0 border-l
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:left-0 lg:right-auto lg:border-l-0 lg:border-r lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="mb-3">
              <h1 className="text-xl font-semibold tracking-tight">
                Stoa
              </h1>
            </div>
            <p className="text-sm text-foreground-muted">
              Marcus Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? 'bg-white text-black'
                        : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-3">
            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>

            {/* System status */}
            <div className="text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green rounded-full animate-pulse" />
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
