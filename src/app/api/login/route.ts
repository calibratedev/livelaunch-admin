import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = (await resp.json()) as AppTypes.LoginResponse

    console.log('***** response', response)
    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('token', response.token, {
      httpOnly: true,
      domain: '.livelaunch.io	',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    // Return response with user data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: response,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 },
    )
  }
}
