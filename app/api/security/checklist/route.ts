import { NextResponse } from 'next/server'
import { readFile } from '@/lib/stoa-api'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
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

    // Read the SECURITY-HARDENING.md file via Stoa API
    const content = await readFile('SECURITY-HARDENING.md')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error reading security checklist:', error)
    return NextResponse.json(
      { error: 'Failed to load security checklist' },
      { status: 500 }
    )
  }
}
