import HeartbeatEditor from './HeartbeatEditor'
import { readFile } from '@/lib/stoa-api'

export default async function HeartbeatPage() {
  const filePath = 'HEARTBEAT.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading HEARTBEAT.md:', error)
    content = '# HEARTBEAT.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Heartbeat</h1>
        <p className="text-foreground-muted">
          Periodic task checklist
        </p>
      </div>
      
      <HeartbeatEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
