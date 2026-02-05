'use client'

import { useState } from 'react'
import { Plus, Edit3, Eye, Save, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Skill {
  name: string
  title: string
  path: string
  description: string
}

interface SkillEditorDashboardProps {
  initialSkills: Skill[]
}

const SKILL_TEMPLATE = `# Skill Name

Brief description of what this skill does.

## When to Use

- Use this skill when...
- Relevant for tasks involving...

## Core Knowledge

### Key Concepts
- Concept 1: explanation
- Concept 2: explanation

### Important Context
Background information and domain knowledge that's essential.

## Procedures

### Standard Workflow
1. Step 1
2. Step 2
3. Step 3

### Best Practices
- Best practice 1
- Best practice 2

## Examples

### Example 1: [Task Name]
**Input:** What the user asked for
**Process:** How you handled it
**Output:** Result delivered

## References & Resources

- [Resource 1](url)
- [Resource 2](url)

## Notes

Additional notes, gotchas, or tips.
`

export default function SkillEditorDashboard({ initialSkills }: SkillEditorDashboardProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillDescription, setNewSkillDescription] = useState('')
  const [validationError, setValidationError] = useState('')

  const loadSkillContent = async (skillName: string) => {
    setIsLoading(true)
    setSelectedSkill(skillName)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/skills/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName })
      })
      
      if (!response.ok) throw new Error('Failed to load skill content')
      
      const data = await response.json()
      setContent(data.content || SKILL_TEMPLATE)
    } catch (error) {
      console.error('Error loading skill:', error)
      setContent('# Error\n\nFailed to load skill content.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedSkill) return
    
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/skills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: selectedSkill,
          content
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const validateSkillName = (name: string): boolean => {
    // Only lowercase letters, numbers, and hyphens
    const regex = /^[a-z0-9-]+$/
    if (!regex.test(name)) {
      setValidationError('Skill name can only contain lowercase letters, numbers, and hyphens')
      return false
    }
    
    // Check if skill already exists
    if (skills.some(s => s.name === name)) {
      setValidationError('A skill with this name already exists')
      return false
    }
    
    setValidationError('')
    return true
  }

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) {
      setValidationError('Skill name is required')
      return
    }
    
    if (!validateSkillName(newSkillName.trim())) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/skills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName.trim(),
          description: newSkillDescription.trim() || 'New skill'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create skill')
      }

      const data = await response.json()
      
      // Add new skill to list
      const newSkill: Skill = {
        name: data.skillName,
        title: data.skillName,
        path: data.path,
        description: newSkillDescription.trim() || 'New skill'
      }
      
      setSkills([...skills, newSkill].sort((a, b) => a.name.localeCompare(b.name)))
      
      // Reset modal
      setIsCreateModalOpen(false)
      setNewSkillName('')
      setNewSkillDescription('')
      setValidationError('')
      
      // Load the new skill
      loadSkillContent(data.skillName)
    } catch (error) {
      console.error('Error creating skill:', error)
      setValidationError(error instanceof Error ? error.message : 'Failed to create skill')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSkill = async () => {
    if (!selectedSkill) return
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/skills/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillName: selectedSkill })
      })

      if (!response.ok) throw new Error('Failed to delete skill')

      // Remove from list
      setSkills(skills.filter(s => s.name !== selectedSkill))
      setSelectedSkill(null)
      setContent('')
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error('Error deleting skill:', error)
      alert('Failed to delete skill. See console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills List */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={16} className="text-foreground-muted" />
                <span className="text-sm font-medium">Skills</span>
                <span className="text-xs text-foreground-muted">
                  {skills.length}
                </span>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                <Plus size={14} />
                New
              </button>
            </div>

            <div className="max-h-[700px] overflow-y-auto">
              {skills.length === 0 ? (
                <div className="p-8 text-center text-foreground-muted text-sm">
                  No skills found
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {skills.map((skill) => (
                    <button
                      key={skill.name}
                      onClick={() => loadSkillContent(skill.name)}
                      className={`
                        w-full p-4 text-left hover:bg-surface-elevated transition-colors
                        ${selectedSkill === skill.name ? 'bg-surface-elevated' : ''}
                      `}
                    >
                      <div className="font-mono text-sm font-medium mb-1">
                        {skill.name}
                      </div>
                      <p className="text-xs text-foreground-muted line-clamp-2">
                        {skill.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="lg:col-span-2">
          {selectedSkill ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor Panel */}
              <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} className="text-foreground-muted" />
                    <span className="text-sm font-medium font-mono">{selectedSkill}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                      title="Delete skill"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-all
                        ${
                          isSaving
                            ? 'bg-surface-elevated text-foreground-muted cursor-not-allowed'
                            : 'bg-white text-black hover:bg-accent-hover'
                        }
                      `}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : saveStatus === 'success' ? (
                        <>
                          <CheckCircle size={16} />
                          Saved
                        </>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle size={16} />
                          Error
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 p-6 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none min-h-[600px]"
                  placeholder="# Skill Name..."
                  spellCheck={false}
                />
                
                <div className="p-3 border-t border-border bg-surface-elevated text-xs text-foreground-muted">
                  {content.length} characters · {content.split('\n').length} lines
                </div>
              </div>

              {/* Preview Panel */}
              <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <Eye size={16} className="text-foreground-muted" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                
                <div className="flex-1 p-6 overflow-auto prose prose-invert prose-sm max-w-none">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
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
                      {content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-lg overflow-hidden flex items-center justify-center h-[700px]">
              <div className="text-center">
                <Edit3 size={48} className="text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted mb-4">Select a skill to edit</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors mx-auto"
                >
                  <Plus size={16} />
                  Create New Skill
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Skill Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Skill</h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setNewSkillName('')
                  setNewSkillDescription('')
                  setValidationError('')
                }}
                className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
              >
                <X size={16} className="text-foreground-muted" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Skill Name
                </label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => {
                    setNewSkillName(e.target.value.toLowerCase())
                    setValidationError('')
                  }}
                  placeholder="my-custom-skill"
                  className="w-full px-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-white/20"
                />
                <p className="text-xs text-foreground-muted mt-1">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={newSkillDescription}
                  onChange={(e) => setNewSkillDescription(e.target.value)}
                  placeholder="Brief description of the skill"
                  className="w-full px-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm focus:outline-none focus:border-white/20"
                />
              </div>

              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{validationError}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setNewSkillName('')
                  setNewSkillDescription('')
                  setValidationError('')
                }}
                className="px-4 py-2 bg-surface-elevated rounded-lg text-sm font-medium hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSkill}
                disabled={isLoading || !newSkillName.trim()}
                className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Delete Skill</h2>
            </div>

            <div className="p-6">
              <p className="text-foreground-muted mb-4">
                Are you sure you want to delete <span className="font-mono text-white">{selectedSkill}</span>?
              </p>
              <p className="text-sm text-red-500">
                This action cannot be undone. The skill folder and all its contents will be permanently deleted.
              </p>
            </div>

            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-surface-elevated rounded-lg text-sm font-medium hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSkill}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Delete Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
