'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import { parseSecurityChecklist, type SecurityItem, type SecuritySection } from './securityParser'

const priorityColors = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-500',
    dot: 'bg-red-500'
  },
  high: {
    bg: '',
    border: '',
    text: 'text-orange-500',
    dot: 'bg-orange-500'
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-500',
    dot: 'bg-yellow-500'
  },
  lower: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-500',
    dot: 'bg-green-500'
  }
}

function ChecklistItem({ 
  item, 
  isChecked, 
  onToggle 
}: { 
  item: SecurityItem
  isChecked: boolean
  onToggle: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-border rounded-lg p-4 bg-surface hover:bg-surface-elevated transition-colors">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`
            mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
            transition-colors
            ${isChecked 
              ? 'bg-green border-green-600' 
              : 'border-border hover:border-foreground-muted'
            }
          `}
        >
          {isChecked && <Check size={14} className="text-black" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className={`font-medium ${isChecked ? 'line-through text-foreground-muted' : ''}`}>
              {item.title}
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-foreground-muted hover:text-foreground transition-colors shrink-0"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="space-y-4 mt-4">
              {item.why && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Why</h4>
                  <p className="text-sm text-foreground-muted">{item.why}</p>
                </div>
              )}
              
              {item.steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Steps</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-foreground-muted">
                    {item.steps.map((step, idx) => (
                      <li key={idx} className="pl-2">{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {item.code.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Commands</h4>
                  <div className="space-y-2">
                    {item.code.map((code, idx) => (
                      <pre key={idx} className="bg-black/50 border border-border rounded p-3 text-xs overflow-x-auto">
                        <code className="text-foreground">{code}</code>
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              {item.verification && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Verification</h4>
                  <p className="text-sm text-foreground-muted">{item.verification}</p>
                </div>
              )}

              {item.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">⚠️ Warnings</h4>
                  <ul className="space-y-1">
                    {item.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-orange-500">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ 
  section, 
  checkedItems, 
  onToggle 
}: { 
  section: SecuritySection
  checkedItems: Set<string>
  onToggle: (itemId: string) => void
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const colors = priorityColors[section.priority]
  const completedCount = section.items.filter(item => checkedItems.has(item.id)).length
  const totalCount = section.items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={`border rounded-lg ${colors.border} ${colors.bg}`}>
      {/* Section header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full p-6 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <div className="text-left">
            <h2 className="text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="text-sm text-foreground-muted mt-1">
              {completedCount} of {totalCount} completed ({progress}%)
            </p>
          </div>
        </div>
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Progress bar */}
      {!isCollapsed && (
        <div className="px-6 pb-4">
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.dot} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      {!isCollapsed && (
        <div className="px-6 pb-6 space-y-3">
          {section.items.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              isChecked={checkedItems.has(item.id)}
              onToggle={() => onToggle(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SecurityChecklist() {
  const [sections, setSections] = useState<SecuritySection[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load checklist data and saved state
  useEffect(() => {
    async function loadData() {
      try {
        // Fetch the markdown file
        const response = await fetch('/api/security/checklist')
        if (!response.ok) throw new Error('Failed to load checklist')
        
        const markdown = await response.text()
        const parsedSections = parseSecurityChecklist(markdown)
        setSections(parsedSections)

        // Load saved state from API (with localStorage fallback)
        try {
          const stateResponse = await fetch('/api/security/state')
          if (stateResponse.ok) {
            const data = await stateResponse.json()
            setCheckedItems(new Set(data.checkedItems || []))
          } else {
            // Fallback to localStorage if API fails
            const saved = localStorage.getItem('security-checklist-state')
            if (saved) {
              setCheckedItems(new Set(JSON.parse(saved)))
            }
          }
        } catch (apiError) {
          // Fallback to localStorage if API fails
          const saved = localStorage.getItem('security-checklist-state')
          if (saved) {
            setCheckedItems(new Set(JSON.parse(saved)))
          }
        }

        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checklist')
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save state to API and localStorage whenever it changes
  useEffect(() => {
    if (sections.length > 0) {
      const items = Array.from(checkedItems)
      
      // Save to localStorage as backup
      localStorage.setItem('security-checklist-state', JSON.stringify(items))
      
      // Save to API for cross-device sync
      fetch('/api/security/state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkedItems: items }),
      }).catch(err => {
        console.error('Failed to sync security state to API:', err)
      })
    }
  }, [checkedItems, sections])

  function toggleItem(itemId: string) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-foreground-muted">Loading checklist...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 border border-red-500/30 bg-red-500/10 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0)
  const completedItems = Array.from(checkedItems).filter(id => 
    sections.some(section => section.items.some(item => item.id === id))
  ).length
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="p-6 bg-surface border border-border rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-2xl font-bold">{overallProgress}%</span>
        </div>
        <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-foreground-muted mt-2">
          {completedItems} of {totalItems} tasks completed
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map(section => (
          <Section
            key={section.priority}
            section={section}
            checkedItems={checkedItems}
            onToggle={toggleItem}
          />
        ))}
      </div>
    </div>
  )
}
