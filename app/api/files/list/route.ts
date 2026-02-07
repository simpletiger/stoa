import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listFiles } from '@/lib/stoa-api'

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
    const dir = searchParams.get('dir') || undefined

    const files = await listFiles(dir)

    return NextResponse.json({ success: true, files })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
