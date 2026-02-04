import AgentsEditor from './AgentsEditor'
import { readFile } from '@/lib/stoa-api'

export default async function AgentsPage() {
  const filePath = 'AGENTS.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading AGENTS.md:', error)
    content = '# AGENTS.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Agents</h1>
        <p className="text-foreground-muted">
          Operational procedures, protocols, and workspace guidelines.
        </p>
      </div>
      
      <AgentsEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
