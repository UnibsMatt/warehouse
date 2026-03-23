import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

async function getAuthHeader(request: NextRequest): Promise<HeadersInit> {
  const accessToken = request.cookies.get('access_token')?.value
  return {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const headers = await getAuthHeader(request)
    const response = await fetch(`${FASTAPI_URL}/api/clients/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('GET /api/clients/[id] error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const headers = await getAuthHeader(request)
    const body = await request.json()
    const response = await fetch(`${FASTAPI_URL}/api/clients/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('PUT /api/clients/[id] error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const headers = await getAuthHeader(request)
    const response = await fetch(`${FASTAPI_URL}/api/clients/${id}`, {
      method: 'DELETE',
      headers,
    })
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error('DELETE /api/clients/[id] error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
