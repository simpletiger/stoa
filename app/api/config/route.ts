import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { readConfig, writeConfig } from '@/lib/stoa-api'

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

    const config = await readConfig()
    const configString = JSON.stringify(config, null, 2)

    return NextResponse.json({ config: configString, valid: true })
  } catch (error) {
    console.error('Error reading config:', error)
    return NextResponse.json(
      { error: 'Failed to read config', config: '', valid: false, message: error instanceof Error ? error.message : 'Unknown error' },
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

    const { content } = await request.json()

    // Validate JSON before saving
    let configObj
    try {
      configObj = JSON.parse(content)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    await writeConfig(configObj)

    // Log the change
    await supabase.from('file_changes').insert({
      file_path: '~/.openclaw/config.json',
      file_type: 'config',
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save config', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
