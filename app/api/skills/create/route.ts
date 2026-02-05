import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSkill } from '@/lib/stoa-api'

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

    const { name, description } = await request.json()

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await createSkill(name, description)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating skill:', error)
    return NextResponse.json(
      { error: 'Failed to create skill', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
