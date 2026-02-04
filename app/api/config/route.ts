import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { createClient } from '@/lib/supabase/server'

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

    const configPath = join(process.env.HOME || '', '.openclaw', 'openclaw.json')
    const content = await readFile(configPath, 'utf-8')
    
    // Parse and validate JSON
    const config = JSON.parse(content)

    return NextResponse.json({ config: content, valid: true })
  } catch (error) {
    console.error('Error reading config:', error)
    return NextResponse.json(
      { error: 'Failed to read config', config: '', valid: false },
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
    try {
      JSON.parse(content)
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    const configPath = join(process.env.HOME || '', '.openclaw', 'openclaw.json')
    await writeFile(configPath, content, 'utf-8')

    // Log the change
    await supabase.from('file_changes').insert({
      file_path: configPath,
      file_type: 'config',
      changed_by: user.id,
      changed_at: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Failed to save config' },
      { status: 500 }
    )
  }
}
