'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Api from '@/lib/api'
import { uploadFile } from '@/lib/api/upload'

const authenticatedRoutes = ['/dashboard']

type UpdateMeData = Partial<Omit<AppTypes.User, 'id' | 'role'>>
interface AuthContextType {
  user: AppTypes.User | undefined
  isLoading: boolean
  isAuthenticated: boolean
  refetchUser: () => Promise<void>
  updateMe: (data: UpdateMeData) => Promise<AppTypes.User>
  setUser: (user: Partial<AppTypes.User> | undefined) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: Api.me.getQueryKey(),
    queryFn: () => Api.me<AppTypes.User>(),
    select: (data) => data?.data,
  })
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
      queryClient.setQueryData(Api.me.getQueryKey(), data)
    },
  })

  const handleUpdateMe = async (data: UpdateMeData) => await updateMe(data)

  useEffect(() => {
    if (!isLoading) {
      const handleRedirect = (loggedUser: AppTypes.User | undefined) => {
        console.log('***** handleRedirect handleRedirect', loggedUser, pathname)
        if (!loggedUser) {
          if (authenticatedRoutes.some((route) => pathname.includes(route)) || pathname === '/') {
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
  }, [user, isLoading, pathname, router])

  const refetchUser = async () => {
    await refetch()
  }

  const handleSetUser = (user: Partial<AppTypes.User> | undefined) => {
    queryClient.setQueryData(Api.me.getQueryKey(), user)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetchUser,
    updateMe: handleUpdateMe,
    setUser: handleSetUser,
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
