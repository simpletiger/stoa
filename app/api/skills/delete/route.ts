import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteSkill } from '@/lib/stoa-api'

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

    const { skillName } = await request.json()

    if (!skillName) {
      return NextResponse.json(
        { error: 'Missing skill name' },
        { status: 400 }
      )
    }

    await deleteSkill(skillName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting skill:', error)
    return NextResponse.json(
      { error: 'Failed to delete skill', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
