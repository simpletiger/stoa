import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { restartGateway, getGatewayStatus } from '@/lib/stoa-api'

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

    const { reason } = await request.json()

    const result = await restartGateway(reason || 'Restarted from Stoa dashboard')

    // Log the action
    await supabase.from('file_changes').insert({
      file_path: 'gateway',
      file_type: 'system',
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true,
      message: result.message,
      output: result.output
    })
  } catch (error) {
    console.error('Error restarting gateway:', error)
    return NextResponse.json(
      { error: 'Failed to restart gateway', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

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

    const status = await getGatewayStatus()

    return NextResponse.json({ 
      success: true,
      running: status.running,
      output: status.output
    })
  } catch (error) {
    console.error('Error getting gateway status:', error)
    return NextResponse.json(
      { error: 'Failed to get gateway status', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
