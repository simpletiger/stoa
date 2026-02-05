'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Shield
} from 'lucide-react'
import { useState } from 'react'

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

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
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
          fixed top-0 left-0 z-40 h-screen w-64 bg-surface/95 backdrop-blur-xl border-r border-white/10
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold tracking-tight">
                Stoa
              </h1>
              {/* Mobile menu button - inside sidebar */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-surface-elevated"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-foreground-muted">
              Marcus Dashboard
            </p>
          </div>

          {/* Mobile menu open button - below header */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden fixed top-20 left-4 z-50 p-2.5 rounded-lg bg-surface border border-white/20 hover:bg-surface-elevated shadow-lg"
            >
              <Menu size={20} />
            </button>
          )}

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
          <div className="p-4 border-t border-border">
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
