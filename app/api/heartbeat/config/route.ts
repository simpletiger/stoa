import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getHeartbeatConfig, updateHeartbeatInterval } from '@/lib/stoa-api'

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

    const config = await getHeartbeatConfig()

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Error reading heartbeat config:', error)
    return NextResponse.json(
      { error: 'Failed to read heartbeat config', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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

    const { intervalMinutes } = await request.json()

    if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 1440) {
      return NextResponse.json(
        { error: 'intervalMinutes must be between 1 and 1440 (24 hours)' },
        { status: 400 }
      )
    }

    await updateHeartbeatInterval(intervalMinutes)

    // Log the change
    await supabase.from('file_changes').insert({
      file_path: '~/.openclaw/config.json',
      file_type: 'config',
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating heartbeat config:', error)
    return NextResponse.json(
      { error: 'Failed to update heartbeat config', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
