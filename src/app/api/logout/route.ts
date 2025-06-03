import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    const cookieStore = await cookies()
    cookieStore.delete('token')

    return NextResponse.redirect('/login', {
      status: 301,
    })
  } catch (error) {
    console.log('***** error', error)
    return NextResponse.redirect('/login', {
      status: 301,
    })
  }
}
