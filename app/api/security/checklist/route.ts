import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Read the SECURITY-HARDENING.md file from clawd workspace
    const filePath = join(process.env.HOME || '', 'clawd', 'SECURITY-HARDENING.md')
    const content = await readFile(filePath, 'utf-8')
    
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
