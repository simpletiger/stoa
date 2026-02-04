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
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Tasks', href: '/', icon: LayoutDashboard },
  { name: 'Soul', href: '/soul', icon: Brain },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Memory', href: '/memory', icon: FolderOpen },
  { name: 'Skills', href: '/skills', icon: Puzzle },
  { name: 'Config', href: '/config', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-surface border border-border hover:bg-surface-elevated"
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
          fixed top-0 left-0 z-40 h-screen w-64 bg-surface/80 backdrop-blur-xl border-r border-white/10
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              Stoa
            </h1>
            <p className="text-xs text-foreground-muted mt-1.5 tracking-wide">
              Marcus Dashboard
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                        : 'text-foreground-muted hover:text-foreground hover:bg-white/5'
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
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-foreground-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green rounded-full animate-pulse shadow-lg shadow-green/50" />
                <span className="font-medium">System Active</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
