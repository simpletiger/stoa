import UserEditor from './UserEditor'
import { readFile } from '@/lib/stoa-api'

export default async function UserPage() {
  const filePath = 'USER.md'
  
  let content = ''
  try {
    content = await readFile(filePath)
  } catch (error) {
    console.error('Error reading USER.md:', error)
    content = '# USER.md\n\nError loading file. Check that the Stoa API server is running.'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">User Profile</h1>
        <p className="text-foreground-muted">
          Information about Jeremiah
        </p>
      </div>
      
      <UserEditor initialContent={content} filePath={filePath} />
    </div>
  )
}
