export async function checkAuthStatus(): Promise<AppTypes.User | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return await response.json() as AppTypes.User;
    }
    return null;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return null;
  }
}

