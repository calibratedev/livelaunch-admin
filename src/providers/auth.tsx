'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { checkAuthStatus } from '@/lib/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import Api from '@/lib/api'
import { uploadFile } from '@/lib/api/upload'

const authenticatedRoutes = ['/dashboard']

type UpdateMeData = Partial<Omit<AppTypes.User, 'id' | 'role'>>
interface AuthContextType {
  user: AppTypes.User | null
  isLoading: boolean
  isAuthenticated: boolean
  refetchUser: () => Promise<void>
  setUser: (user: AppTypes.User | null) => void
  updateMe: (data: UpdateMeData) => Promise<AppTypes.User>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AppTypes.User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  const { mutateAsync: updateMe } = useMutation({
    mutationKey: Api.updateMe.getQueryKey(),
    mutationFn: async (data: UpdateMeData) => {
      if (data.avatar instanceof File) {
        const response = await uploadFile(data.avatar, 'user')
        data.avatar = response.data
      }
      const response = await Api.updateMe<AppTypes.User>(data)
      return response.data
    },
    onSuccess: (data) => {
      setUser(data)
    },
  })
  const fetchUser = async () => {
    try {
      setIsLoading(true)
      const authUser = await checkAuthStatus()
      setUser(authUser)
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setIsInitializing(false)
      setIsLoading(false)
    }
  }

  const handleUpdateMe = async (data: UpdateMeData) => await updateMe(data)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (!isInitializing) {
      const handleRedirect = (loggedUser: AppTypes.User | null) => {
        console.log('***** handleRedirect handleRedirect', loggedUser, pathname)
        if (!loggedUser) {
          if (authenticatedRoutes.includes(pathname) || pathname === '/') {
            router.push('/login?redirect=' + pathname)
          }
        } else {
          if (pathname == '/') {
            router.push('/dashboard')
          }
        }
      }
      handleRedirect(user)
    }
  }, [user, isInitializing, pathname, router])

  const refetchUser = async () => {
    await fetchUser()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetchUser,
    setUser,
    updateMe: handleUpdateMe,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

export default AuthProviderWrapper
