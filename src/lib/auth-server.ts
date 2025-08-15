import { cookies } from 'next/headers'

const COOKIE_NAME = 'token'

export async function getServerSession(): Promise<AppTypes.User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return null
  }
  console.log("**** token", token)
  return null
}

export async function setServerAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function removeServerAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
} 