'use client'

import { useState } from 'react'
import { Save, Eye, Edit3, CheckCircle, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface HeartbeatEditorProps {
  initialContent: string
  filePath: string
}

export default function HeartbeatEditor({ initialContent, filePath }: HeartbeatEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: filePath,
          content,
          type: 'heartbeat'
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Editor</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || content === initialContent}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all
              ${
                isSaving || content === initialContent
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
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 p-6 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none"
          placeholder="# HEARTBEAT.md - Task Checklist..."
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
              em: ({ children }) => (
                <em className="italic text-foreground/80">{children}</em>
              ),
              hr: () => (
                <hr className="my-6 border-border" />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-white pl-4 italic text-foreground-muted mb-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
