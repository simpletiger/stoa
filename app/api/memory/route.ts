import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

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

    const memoryPath = join(process.env.HOME || '', 'clawd', 'memory')

    // List all memory files
    if (action === 'list') {
      const files = await readdir(memoryPath)
      const memoryFiles = files.filter(f => f.endsWith('.md'))
        .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)

      const filesWithStats = await Promise.all(
        memoryFiles.map(async (filename) => {
          const filePath = join(memoryPath, filename)
          const content = await readFile(filePath, 'utf-8')
          const lines = content.split('\n').length
          const chars = content.length

          return {
            filename,
            path: filePath,
            lines,
            chars,
            size: `${(chars / 1024).toFixed(1)} KB`
          }
        })
      )

      return NextResponse.json({ files: filesWithStats })
    }

    // Read a specific file
    if (action === 'read' && file) {
      const filePath = join(memoryPath, file)
      const content = await readFile(filePath, 'utf-8')
      
      return NextResponse.json({ 
        filename: file,
        content 
      })
    }

    // Search across all memory files
    if (action === 'search') {
      const query = searchParams.get('query')?.toLowerCase()
      if (!query) {
        return NextResponse.json({ results: [] })
      }

      const files = await readdir(memoryPath)
      const memoryFiles = files.filter(f => f.endsWith('.md'))

      const results = []
      for (const filename of memoryFiles) {
        const filePath = join(memoryPath, filename)
        const content = await readFile(filePath, 'utf-8')
        const lines = content.split('\n')

        // Find matching lines
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            results.push({
              filename,
              lineNumber: index + 1,
              line: line.trim(),
              context: lines.slice(Math.max(0, index - 1), index + 2).join('\n')
            })
          }
        })
      }

      return NextResponse.json({ results: results.slice(0, 50) }) // Limit to 50 results
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in memory API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
