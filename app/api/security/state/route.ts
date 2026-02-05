import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.STOA_API_URL || 'http://localhost:3001'
const API_TOKEN = process.env.STOA_API_TOKEN || ''

// GET /api/security/state - Get security checklist state
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/api/security/state`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch security state' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Security state fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to API server' },
      { status: 500 }
    )
  }
}

// POST /api/security/state - Save security checklist state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/security/state`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to save security state' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Security state save error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to API server' },
      { status: 500 }
    )
  }
}
