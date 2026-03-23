import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
const ACCESS_TOKEN_MAX_AGE = 15 * 60 // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 })
    }

    // Forward to FastAPI
    const fastapiResponse = await fetch(`${FASTAPI_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!fastapiResponse.ok) {
      const error = await fastapiResponse.json().catch(() => ({
        detail: 'Authentication failed',
      }))
      return NextResponse.json(error, { status: fastapiResponse.status })
    }

    const data = await fastapiResponse.json()
    const accessToken: string = data.access_token

    // Read refresh_token from FastAPI response cookies
    const setCookieHeader = fastapiResponse.headers.get('set-cookie') || ''
    const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/)
    const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null

    // Decode JWT to get user info (without verification — already verified by FastAPI)
    let userInfo: { id?: string; email?: string; role?: string; client_id?: number } = {}
    try {
      const payloadBase64 = accessToken.split('.')[1]
      const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf-8'))
      userInfo = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        client_id: decoded.client_id ?? undefined,
      }
    } catch {
      // ignore decode error
    }

    const response = NextResponse.json({
      message: 'Login successful',
      user: userInfo,
    })

    // Set access_token as httpOnly cookie
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    })

    // Set refresh_token as httpOnly cookie
    if (refreshToken) {
      response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    // Set non-httpOnly user_role cookie for client-side role checks
    if (userInfo.role) {
      response.cookies.set('user_role', userInfo.role, {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: ACCESS_TOKEN_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    // Set non-httpOnly client_id cookie (if user is linked to a client)
    if (userInfo.client_id !== undefined) {
      response.cookies.set('client_id', String(userInfo.client_id), {
        httpOnly: false,
        sameSite: 'lax',
        maxAge: ACCESS_TOKEN_MAX_AGE,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 })
  }
}
