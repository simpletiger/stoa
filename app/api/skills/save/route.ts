import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveSkillContent } from '@/lib/stoa-api'

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

    const { skillName, content } = await request.json()

    if (!skillName || content === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await saveSkillContent(skillName, content)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving skill:', error)
    return NextResponse.json(
      { error: 'Failed to save skill', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
