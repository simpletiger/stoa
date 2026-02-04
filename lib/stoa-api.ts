/**
 * Stoa API Client
 * 
 * Client for connecting to the local Stoa API server running on Mac mini.
 * This server provides access to ~/clawd files, memory, config, and skills.
 */

const STOA_API_URL = process.env.STOA_API_URL || 'http://localhost:3001'
const STOA_API_TOKEN = process.env.STOA_API_TOKEN || ''

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

interface FileReadResponse {
  success: boolean
  content: string
  filePath: string
}

interface FileWriteResponse {
  success: boolean
  filePath: string
  size: number
}

interface MemoryFile {
  name: string
  path: string
  size: number
  modified: string
}

interface MemoryListResponse {
  success: boolean
  files: MemoryFile[]
}

interface SearchResult {
  file: string
  path: string
  line: number
  content: string
  context: string
}

interface MemorySearchResponse {
  success: boolean
  query: string
  results: SearchResult[]
}

interface Skill {
  name: string
  title: string
  path: string
  description: string
}

interface SkillsListResponse {
  success: boolean
  skills: Skill[]
}

interface ConfigResponse {
  success: boolean
  config: any
}

/**
 * Make a request to the Stoa API server
 */
async function apiRequest<T>(
  method: string,
  path: string,
  body?: any
): Promise<T> {
  const url = `${STOA_API_URL}${path}`
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${STOA_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  const options: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `API request failed: ${response.status}`)
  }

  return response.json()
}

/**
 * Read a file from ~/clawd
 */
export async function readFile(filePath: string): Promise<string> {
  const response = await apiRequest<FileReadResponse>('POST', '/api/file/read', {
    filePath
  })
  return response.content
}

/**
 * Write a file to ~/clawd
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await apiRequest<FileWriteResponse>('POST', '/api/file/write', {
    filePath,
    content
  })
}

/**
 * List all memory files
 */
export async function listMemoryFiles(): Promise<MemoryFile[]> {
  const response = await apiRequest<MemoryListResponse>('GET', '/api/memory/list')
  return response.files
}

/**
 * Search across memory files
 */
export async function searchMemory(query: string, limit = 50): Promise<SearchResult[]> {
  const response = await apiRequest<MemorySearchResponse>(
    'GET',
    `/api/memory/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  return response.results
}

/**
 * List all skills
 */
export async function listSkills(): Promise<Skill[]> {
  const response = await apiRequest<SkillsListResponse>('GET', '/api/skills/list')
  return response.skills
}

/**
 * Read OpenClaw config
 */
export async function readConfig(): Promise<any> {
  const response = await apiRequest<ConfigResponse>('GET', '/api/config')
  return response.config
}

/**
 * Write OpenClaw config
 */
export async function writeConfig(config: any): Promise<void> {
  await apiRequest<ConfigResponse>('POST', '/api/config', { config })
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${STOA_API_URL}/health`, { cache: 'no-store' })
    return response.ok
  } catch (error) {
    return false
  }
}
