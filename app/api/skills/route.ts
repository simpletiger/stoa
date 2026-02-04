import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile, stat } from 'fs/promises'
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

    const skillsPath = '/opt/homebrew/lib/node_modules/openclaw/skills'

    // List all skills
    const skillDirs = await readdir(skillsPath)
    
    const skills = await Promise.all(
      skillDirs.map(async (skillName) => {
        const skillPath = join(skillsPath, skillName)
        const skillStats = await stat(skillPath)

        if (!skillStats.isDirectory()) {
          return null
        }

        // Try to read SKILL.md for description
        let description = 'No description available'
        let fullContent = ''
        try {
          const skillMdPath = join(skillPath, 'SKILL.md')
          fullContent = await readFile(skillMdPath, 'utf-8')
          
          // Extract first paragraph as description
          const lines = fullContent.split('\n').filter(l => l.trim())
          const firstParagraph = lines.find(l => !l.startsWith('#') && l.trim().length > 0)
          if (firstParagraph) {
            description = firstParagraph.substring(0, 150)
            if (firstParagraph.length > 150) description += '...'
          }
        } catch (e) {
          // No SKILL.md file
        }

        // Check if skill has a package.json (indicates active skill)
        let isActive = false
        try {
          await stat(join(skillPath, 'package.json'))
          isActive = true
        } catch (e) {
          // No package.json
        }

        return {
          name: skillName,
          description,
          isActive,
          path: skillPath,
          hasDocumentation: fullContent.length > 0
        }
      })
    )

    const validSkills = skills.filter(s => s !== null)
      .sort((a, b) => {
        // Active skills first, then alphabetical
        if (a!.isActive && !b!.isActive) return -1
        if (!a!.isActive && b!.isActive) return 1
        return a!.name.localeCompare(b!.name)
      })

    return NextResponse.json({ skills: validSkills })
  } catch (error) {
    console.error('Error in skills API:', error)
    return NextResponse.json(
      { error: 'Failed to load skills' },
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
    const skillPath = join('/opt/homebrew/lib/node_modules/openclaw/skills', skillName)

    // Read SKILL.md
    let documentation = '# No Documentation\n\nThis skill does not have a SKILL.md file.'
    try {
      documentation = await readFile(join(skillPath, 'SKILL.md'), 'utf-8')
    } catch (e) {
      // No documentation
    }

    return NextResponse.json({ documentation })
  } catch (error) {
    console.error('Error loading skill details:', error)
    return NextResponse.json(
      { error: 'Failed to load skill details' },
      { status: 500 }
    )
  }
}
