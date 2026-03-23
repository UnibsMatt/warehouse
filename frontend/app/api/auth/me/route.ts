import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const dynamic = 'force-dynamic'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'change-me-in-production')

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
    }

    const { payload } = await jwtVerify(accessToken, JWT_SECRET)

    return NextResponse.json({
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    })
  } catch {
    return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 })
  }
}
