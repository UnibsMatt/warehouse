import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value

    // Notify FastAPI to invalidate session (best-effort)
    if (refreshToken) {
      await fetch(`${FASTAPI_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${refreshToken}`,
        },
      }).catch(() => {
        // Ignore FastAPI errors — we still clear local cookies
      })
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Delete all auth cookies
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    response.cookies.delete('user_role')

    return response
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
