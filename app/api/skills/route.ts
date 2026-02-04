import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listSkills, readFile } from '@/lib/stoa-api'

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

    const skills = await listSkills()

    const formattedSkills = skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      isActive: true, // API doesn't distinguish active/inactive
      path: skill.path,
      hasDocumentation: skill.description !== 'No SKILL.md found'
    }))

    return NextResponse.json({ skills: formattedSkills })
  } catch (error) {
    console.error('Error in skills API:', error)
    return NextResponse.json(
      { error: 'Failed to load skills', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get detailed info about a specific skill
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

    // Read SKILL.md via API
    let documentation = '# No Documentation\n\nThis skill does not have a SKILL.md file.'
    try {
      // The API doesn't have a direct endpoint for reading skill docs,
      // so we construct the path manually
      const skillPath = `/opt/homebrew/lib/node_modules/openclaw/skills/${skillName}/SKILL.md`
      // Note: This won't work with current API - need to add file read from absolute path
      // For now, return a placeholder
      documentation = `# ${skillName}\n\nView skill documentation on Mac mini at:\n${skillPath}`
    } catch (e) {
      // No documentation
    }

    return NextResponse.json({ documentation })
  } catch (error) {
    console.error('Error loading skill details:', error)
    return NextResponse.json(
      { error: 'Failed to load skill details', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
