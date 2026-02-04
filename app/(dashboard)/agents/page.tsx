import AgentsEditor from './AgentsEditor'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default async function AgentsPage() {
  const agentsPath = join(process.env.HOME || '', 'clawd', 'AGENTS.md')
  
  let content = ''
  try {
    content = await readFile(agentsPath, 'utf-8')
  } catch (error) {
    console.error('Error reading AGENTS.md:', error)
    content = '# AGENTS.md\n\nError loading file.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Agents</h1>
        <p className="text-foreground-muted">
          Operational procedures, protocols, and workspace guidelines.
        </p>
      </div>
      
      <AgentsEditor initialContent={content} filePath={agentsPath} />
    </div>
  )
}
