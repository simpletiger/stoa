import SoulEditor from './SoulEditor'
import { readFile } from '@/lib/stoa-api'

export default async function SoulPage() {
  const filePath = 'SOUL.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading SOUL.md:', error)
    content = '# SOUL.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Soul</h1>
        <p className="text-foreground-muted">
          Your core identity and principles. Edit and save changes in real-time.
        </p>
      </div>
      
      <SoulEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
