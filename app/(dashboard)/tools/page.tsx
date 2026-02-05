import ToolsEditor from './ToolsEditor'
import { readFile } from '@/lib/stoa-api'

export default async function ToolsPage() {
  const filePath = 'TOOLS.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading TOOLS.md:', error)
    content = '# TOOLS.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Tools</h1>
        <p className="text-foreground-muted">
          Tool-specific configurations and notes
        </p>
      </div>
      
      <ToolsEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
