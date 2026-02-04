import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile } from '@/lib/stoa-api'

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

    const { path, content, type } = await request.json()

    if (!path || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Write file via Stoa API
    await writeFile(path, content)

    // Log the change in Supabase for Marcus to track
    await supabase.from('file_changes').insert({
      file_path: path,
      file_type: type,
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json(
      { error: 'Failed to save file', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
