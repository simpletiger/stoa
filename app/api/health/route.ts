import { NextResponse } from 'next/server'
import { healthCheck } from '@/lib/stoa-api'

export async function GET() {
  try {
    const healthy = await healthCheck()
    return NextResponse.json({ healthy })
  } catch (error) {
    return NextResponse.json({ healthy: false }, { status: 503 })
  }
}
