import IdentityEditor from './IdentityEditor'
import { readFile } from '@/lib/stoa-api'

export default async function IdentityPage() {
  const filePath = 'IDENTITY.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading IDENTITY.md:', error)
    content = '# IDENTITY.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Identity</h1>
        <p className="text-foreground-muted">
          Marcus&apos;s identity and metadata
        </p>
      </div>
      
      <IdentityEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
