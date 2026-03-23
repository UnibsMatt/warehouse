import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') ?? '1'
    const page_size = searchParams.get('page_size') ?? '20'

    const response = await fetch(
      `${FASTAPI_URL}/api/orders/history?page=${page}&page_size=${page_size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        cache: 'no-store',
      }
    )
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('GET /api/orders/history error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
