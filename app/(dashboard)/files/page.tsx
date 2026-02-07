'use client'

import { useEffect, useState } from 'react'
import { FolderOpen, File, Plus, Save, CheckCircle, AlertCircle, Trash2, Edit3 } from 'lucide-react'

interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  size: number
  modified: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files/list')
      const data = await response.json()
      
      if (data.files) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFile = async (filePath: string) => {
    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', filePath })
      })
      
      const data = await response.json()
      
      if (data.content !== undefined) {
        setFileContent(data.content)
        setOriginalContent(data.content)
        setSelectedFile(filePath)
      }
    } catch (error) {
      console.error('Error loading file:', error)
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'write',
          filePath: selectedFile,
          content: fileContent 
        })
      })

      if (!response.ok) throw new Error('Failed to save')

      setOriginalContent(fileContent)
      setSaveStatus('success')
      await loadFiles() // Refresh file list
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving file:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateFile = async () => {
    if (!newFileName.trim()) return

    const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`

    try {
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'write',
          filePath: fileName,
          content: `# ${fileName.replace('.md', '')}\n\nYour content here...\n`
        })
      })

      if (!response.ok) throw new Error('Failed to create file')

      setShowNewFileModal(false)
      setNewFileName('')
      await loadFiles()
      loadFile(fileName)
    } catch (error) {
      console.error('Error creating file:', error)
      alert('Failed to create file')
    }
  }

  const hasChanges = fileContent !== originalContent

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Workspace Files</h1>
          <p className="text-foreground-muted">
            Browse, edit, and create files in your ~/clawd workspace
          </p>
        </div>

        <button
          onClick={() => setShowNewFileModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-accent-hover font-medium text-sm transition-colors"
        >
          <Plus size={16} />
          New File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Browser */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-foreground-muted" />
              <span className="text-sm font-medium">Files</span>
            </div>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {files
              .filter(f => !f.isDirectory)
              .map((file) => (
                <button
                  key={file.path}
                  onClick={() => loadFile(file.path)}
                  className={`
                    w-full flex items-start gap-3 p-4 text-left transition-colors
                    ${
                      selectedFile === file.path
                        ? 'bg-white/5'
                        : 'hover:bg-surface-elevated'
                    }
                  `}
                >
                  <File size={16} className="mt-0.5 text-foreground-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{file.name}</div>
                    <div className="text-xs text-foreground-muted mt-1">
                      {(file.size / 1024).toFixed(1)} KB · {new Date(file.modified).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* File Editor */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 size={16} className="text-foreground-muted" />
                  <span className="text-sm font-medium">{selectedFile}</span>
                  {hasChanges && (
                    <span className="text-xs text-yellow-500">• Unsaved changes</span>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all
                    ${
                      isSaving || !hasChanges
                        ? 'bg-surface-elevated text-foreground-muted cursor-not-allowed'
                        : saveStatus === 'success'
                        ? 'bg-green/20 text-green'
                        : saveStatus === 'error'
                        ? 'bg-red-500/20 text-red-400'
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
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 p-6 bg-transparent text-foreground font-mono text-sm resize-none focus:outline-none"
                placeholder="Start typing..."
                spellCheck={false}
                style={{ minHeight: '600px' }}
              />

              <div className="p-3 border-t border-border bg-surface-elevated">
                <div className="flex items-center justify-between text-xs text-foreground-muted">
                  <div>
                    {fileContent.split('\n').length} lines · {fileContent.length} characters
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-12">
              <div>
                <File size={48} className="mx-auto mb-4 text-foreground-muted opacity-50" />
                <p className="text-foreground-muted">Select a file to edit</p>
                <p className="text-sm text-foreground-muted mt-2">Or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Create New File</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">File Name</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="SHIELD.md"
                className="w-full px-4 py-2 bg-surface-elevated border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile()
                  if (e.key === 'Escape') setShowNewFileModal(false)
                }}
              />
              <p className="text-xs text-foreground-muted mt-2">
                Will be created in ~/clawd/{newFileName || 'filename.md'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="flex-1 px-4 py-2 bg-surface-elevated text-foreground rounded-lg hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-accent-hover font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
