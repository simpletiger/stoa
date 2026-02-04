'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, CheckCircle, AlertCircle, Eye, Edit3 } from 'lucide-react'

export default function ConfigEditor() {
  const [config, setConfig] = useState('')
  const [originalConfig, setOriginalConfig] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isValid, setIsValid] = useState(true)
  const [validationError, setValidationError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    validateJSON(config)
  }, [config])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      
      if (data.config) {
        // Pretty print the JSON
        const formatted = JSON.stringify(JSON.parse(data.config), null, 2)
        setConfig(formatted)
        setOriginalConfig(formatted)
      }
    } catch (error) {
      console.error('Error loading config:', error)
      setConfig('{\n  "error": "Failed to load config"\n}')
    } finally {
      setIsLoading(false)
    }
  }

  const validateJSON = (value: string) => {
    try {
      JSON.parse(value)
      setIsValid(true)
      setValidationError('')
    } catch (error) {
      setIsValid(false)
      setValidationError(error instanceof Error ? error.message : 'Invalid JSON')
    }
  }

  const handleSave = async () => {
    if (!isValid) return

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: config })
      })

      if (!response.ok) throw new Error('Failed to save')

      setOriginalConfig(config)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving config:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(config)
      const formatted = JSON.stringify(parsed, null, 2)
      setConfig(formatted)
    } catch (error) {
      // Invalid JSON, can't format
    }
  }

  const renderPreview = () => {
    try {
      const parsed = JSON.parse(config)
      return (
        <div className="space-y-4">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="border-l-2 border-white/20 pl-4">
              <div className="text-sm font-semibold text-white mb-2 font-mono">{key}</div>
              <pre className="text-xs text-foreground-muted overflow-x-auto bg-surface-elevated p-3 rounded">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )
    } catch (error) {
      return (
        <div className="text-center text-foreground-muted">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p>Invalid JSON - cannot render preview</p>
        </div>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground-muted">Loading configuration...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Editor</span>
            {!isValid && (
              <span className="text-xs text-red-400 ml-2">⚠ Invalid JSON</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={formatJSON}
              disabled={!isValid}
              className="px-3 py-1.5 text-xs font-medium text-foreground-muted hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Format
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving || !isValid || config === originalConfig}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-all
                ${
                  isSaving || !isValid || config === originalConfig
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
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          className="flex-1 p-6 bg-transparent text-foreground font-mono text-xs resize-none focus:outline-none"
          placeholder='{\n  "your": "config"\n}'
          spellCheck={false}
          style={{ minHeight: '600px' }}
        />
        
        <div className="p-3 border-t border-border bg-surface-elevated">
          <div className="flex items-center justify-between text-xs">
            <div className="text-foreground-muted">
              {config.split('\n').length} lines · {config.length} characters
            </div>
            {!isValid && (
              <div className="text-red-400 font-mono">
                {validationError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Preview</span>
          </div>
          
          {isValid && (
            <div className="flex items-center gap-1">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs text-green-500">Valid JSON</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 overflow-auto" style={{ minHeight: '600px' }}>
          {renderPreview()}
        </div>
      </div>
    </div>
  )
}
