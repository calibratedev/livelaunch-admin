import { redirect } from 'next/navigation'

export async function checkAuthStatus(): Promise<AppTypes.User | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('***** response', response.status)
    if (response.ok) {
      return (await response.json()) as AppTypes.User
    }

    if (response.status === 401) {
      return redirect('/login')
    }

    return null
  } catch (error) {
    console.error('Error checking auth status:', error)
    return null
  }
}
