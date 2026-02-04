'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle, Circle, FileText, X, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Skill {
  name: string
  description: string
  isActive: boolean
  path: string
  hasDocumentation: boolean
}

export default function SkillsDashboard() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [documentation, setDocumentation] = useState<string>('')
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSkillDetails = async (skillName: string) => {
    setIsLoadingDoc(true)
    setSelectedSkill(skillName)
    
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName })
      })
      const data = await response.json()
      setDocumentation(data.documentation || '# No Documentation')
    } catch (error) {
      console.error('Error loading skill details:', error)
      setDocumentation('# Error\n\nFailed to load documentation.')
    } finally {
      setIsLoadingDoc(false)
    }
  }

  const filteredSkills = skills.filter(skill => {
    if (filter === 'all') return true
    if (filter === 'active') return skill.isActive
    if (filter === 'inactive') return !skill.isActive
    return true
  })

  const activeCount = skills.filter(s => s.isActive).length
  const inactiveCount = skills.filter(s => !s.isActive).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Skills List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-lg border transition-colors ${
              filter === 'all'
                ? 'bg-surface border-white/20'
                : 'bg-surface border-border hover:border-white/10'
            }`}
          >
            <div className="text-2xl font-semibold mb-1">{skills.length}</div>
            <div className="text-xs text-foreground-muted">Total</div>
          </button>
          
          <button
            onClick={() => setFilter('active')}
            className={`p-4 rounded-lg border transition-colors ${
              filter === 'active'
                ? 'bg-surface border-green-500/50'
                : 'bg-surface border-border hover:border-white/10'
            }`}
          >
            <div className="text-2xl font-semibold mb-1 text-green-500">{activeCount}</div>
            <div className="text-xs text-foreground-muted">Active</div>
          </button>
          
          <button
            onClick={() => setFilter('inactive')}
            className={`p-4 rounded-lg border transition-colors ${
              filter === 'inactive'
                ? 'bg-surface border-white/20'
                : 'bg-surface border-border hover:border-white/10'
            }`}
          >
            <div className="text-2xl font-semibold mb-1">{inactiveCount}</div>
            <div className="text-xs text-foreground-muted">Inactive</div>
          </button>
        </div>

        {/* Skills List */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Package size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Skills</span>
            <span className="text-xs text-foreground-muted ml-auto">
              {filteredSkills.length} / {skills.length}
            </span>
          </div>

          <div className="max-h-[700px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-foreground-muted text-sm">
                Loading skills...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted text-sm">
                No skills found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => loadSkillDetails(skill.name)}
                    className={`
                      w-full p-4 text-left hover:bg-surface-elevated transition-colors
                      ${selectedSkill === skill.name ? 'bg-surface-elevated' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {skill.isActive ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Circle size={16} className="text-foreground-muted" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium font-mono">{skill.name}</span>
                          {skill.hasDocumentation && (
                            <FileText size={12} className="text-foreground-muted" />
                          )}
                        </div>
                        <p className="text-xs text-foreground-muted line-clamp-2">
                          {skill.description}
                        </p>
                      </div>

                      <ChevronRight size={16} className="text-foreground-muted flex-shrink-0 mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documentation Viewer */}
      <div className="lg:col-span-2">
        <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col h-[800px]">
          {selectedSkill ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-foreground-muted" />
                  <span className="text-sm font-medium font-mono">{selectedSkill}</span>
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  <X size={16} className="text-foreground-muted" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                {isLoadingDoc ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-foreground-muted text-sm">Loading documentation...</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-semibold mb-4 mt-6 first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold mb-3 mt-6">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 text-foreground/90 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-foreground/90">{children}</li>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-surface-elevated px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-surface-elevated p-4 rounded-lg overflow-x-auto text-sm font-mono">
                              {children}
                            </code>
                          )
                        },
                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">{children}</strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-white pl-4 italic text-foreground-muted mb-4">
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr className="my-6 border-border" />
                        ),
                      }}
                    >
                      {documentation}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Package size={48} className="text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted">Select a skill to view its documentation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
