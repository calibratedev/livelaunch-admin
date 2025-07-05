'use client'

import ProfileTab from '@/components/settings/profile-tab'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (!!error) {
      toast.error(error)
    }
  }, [])

  return <ProfileTab />
}
