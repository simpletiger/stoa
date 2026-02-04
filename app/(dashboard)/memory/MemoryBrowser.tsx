'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Eye, Folder, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface MemoryFile {
  filename: string
  path: string
  lines: number
  chars: number
  size: string
}

interface SearchResult {
  filename: string
  lineNumber: number
  line: string
  context: string
}

export default function MemoryBrowser() {
  const [files, setFiles] = useState<MemoryFile[]>([])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load file list on mount
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/memory?action=list')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFile = async (filename: string) => {
    try {
      const response = await fetch(`/api/memory?action=read&file=${encodeURIComponent(filename)}`)
      const data = await response.json()
      setFileContent(data.content || '')
      setSelectedFile(filename)
    } catch (error) {
      console.error('Error loading file:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/memory?action=search&query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setFileContent('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar - File List & Search */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Search size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Search</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search memory..."
              className="flex-1 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm focus:outline-none focus:border-white/30"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '...' : 'Go'}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  onClick={() => loadFile(result.filename)}
                  className="p-3 bg-surface-elevated rounded-lg cursor-pointer hover:bg-surface-elevated/80 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={12} className="text-foreground-muted" />
                    <span className="text-xs font-medium">{result.filename}</span>
                    <span className="text-xs text-foreground-muted">:{result.lineNumber}</span>
                  </div>
                  <p className="text-xs text-foreground-muted line-clamp-2">{result.line}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File List */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Folder size={16} className="text-foreground-muted" />
            <span className="text-sm font-medium">Memory Files</span>
            <span className="text-xs text-foreground-muted ml-auto">{files.length}</span>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-foreground-muted text-sm">
                Loading files...
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-foreground-muted text-sm">
                No memory files found
              </div>
            ) : (
              <div className="divide-y divide-border">
                {files.map((file) => (
                  <button
                    key={file.filename}
                    onClick={() => loadFile(file.filename)}
                    className={`
                      w-full p-4 text-left hover:bg-surface-elevated transition-colors
                      ${selectedFile === file.filename ? 'bg-surface-elevated' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText size={14} className="text-foreground-muted flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{file.filename}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground-muted">
                      <span>{file.lines} lines</span>
                      <span>•</span>
                      <span>{file.size}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="lg:col-span-2">
        <div className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col h-[800px]">
          {selectedFile ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-foreground-muted" />
                  <span className="text-sm font-medium">{selectedFile}</span>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-surface-elevated rounded-lg transition-colors"
                >
                  <X size={16} className="text-foreground-muted" />
                </button>
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
                  {fileContent}
                </ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText size={48} className="text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-muted">Select a file to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
