import SoulEditor from './SoulEditor'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default async function SoulPage() {
  const soulPath = join(process.env.HOME || '', 'clawd', 'SOUL.md')
  
  let content = ''
  try {
    content = await readFile(soulPath, 'utf-8')
  } catch (error) {
    console.error('Error reading SOUL.md:', error)
    content = '# SOUL.md\n\nError loading file.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Soul</h1>
        <p className="text-foreground-muted">
          Your core identity and principles. Edit and save changes in real-time.
        </p>
      </div>
      
      <SoulEditor initialContent={content} filePath={soulPath} />
    </div>
  )
}
