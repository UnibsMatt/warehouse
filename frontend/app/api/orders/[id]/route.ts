import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const accessToken = request.cookies.get('access_token')?.value
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    }

    const response = await fetch(`${FASTAPI_URL}/api/orders/${id}`, { headers })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
