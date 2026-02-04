import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listMemoryFiles, searchMemory, readFile } from '@/lib/stoa-api'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const file = searchParams.get('file')

    // List all memory files
    if (action === 'list') {
      const files = await listMemoryFiles()
      
      const filesWithStats = files.map((f) => ({
        filename: f.name,
        path: f.path,
        lines: 0, // Not calculated by API
        chars: f.size,
        size: `${(f.size / 1024).toFixed(1)} KB`
      }))

      return NextResponse.json({ files: filesWithStats })
    }

    // Read a specific file
    if (action === 'read' && file) {
      const content = await readFile(`memory/${file}`)
      
      return NextResponse.json({ 
        filename: file,
        content 
      })
    }

    // Search across all memory files
    if (action === 'search') {
      const query = searchParams.get('query')
      if (!query) {
        return NextResponse.json({ results: [] })
      }

      const results = await searchMemory(query, 50)

      const formattedResults = results.map((r) => ({
        filename: r.file,
        lineNumber: r.line,
        line: r.content,
        context: r.context
      }))

      return NextResponse.json({ results: formattedResults })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in memory API:', error)
    return NextResponse.json(
      { error: 'Failed to process request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
