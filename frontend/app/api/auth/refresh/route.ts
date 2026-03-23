import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
const ACCESS_TOKEN_MAX_AGE = 15 * 60 // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json({ detail: 'Refresh token missing' }, { status: 401 })
    }

    // Forward to FastAPI with the refresh_token cookie
    const fastapiResponse = await fetch(`${FASTAPI_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
    })

    if (!fastapiResponse.ok) {
      const error = await fastapiResponse.json().catch(() => ({
        detail: 'Token refresh failed',
      }))
      return NextResponse.json(error, { status: fastapiResponse.status })
    }

    const data = await fastapiResponse.json()
    const newAccessToken: string = data.access_token

    // Read new refresh_token from FastAPI response cookies
    const setCookieHeader = fastapiResponse.headers.get('set-cookie') || ''
    const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/)
    const newRefreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null

    const response = NextResponse.json({ message: 'Token refreshed' })

    // Update access_token cookie
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    // Update refresh_token cookie
    if (newRefreshToken) {
      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (err) {
    console.error('Refresh error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
