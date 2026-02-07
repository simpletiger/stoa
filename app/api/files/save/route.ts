import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readFile, writeFile } from '@/lib/stoa-api'

export async function POST(request: NextRequest) {
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

    const { action, path, filePath, content, type } = await request.json()
    const finalPath = filePath || path

    if (!finalPath) {
      return NextResponse.json(
        { error: 'Missing file path' },
        { status: 400 }
      )
    }

    // Handle read action
    if (action === 'read') {
      const fileContent = await readFile(finalPath)
      return NextResponse.json({ success: true, filePath: finalPath, content: fileContent })
    }

    // Handle write action (default if no action specified)
    if (content === undefined) {
      return NextResponse.json(
        { error: 'Content is required for write operation' },
        { status: 400 }
      )
    }

    // Write file via Stoa API
    await writeFile(finalPath, content)

    // Log the change in Supabase for Marcus to track
    await supabase.from('file_changes').insert({
      file_path: finalPath,
      file_type: type || 'workspace',
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true, filePath: finalPath })
  } catch (error) {
    console.error('Error in file operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform file operation', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
