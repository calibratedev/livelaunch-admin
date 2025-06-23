'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import ProfileTab from '@/components/settings/profile-tab'
import SecurityTab from '@/components/settings/security-tab'
import NotificationsTab from '@/components/settings/notifications-tab'
import SystemTab from '@/components/settings/system-tab'
import { User, Bell, Shield, Database, Instagram } from 'lucide-react'
import SocialAccountTab from '@/components/settings/social-account-tab'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab') || 'profile'

  useEffect(() => {
    const error = searchParams.get('error')
    if (!!error) {
      toast.error(error)
    }
  }, [])

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set('tab', value)
      router.replace(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system">
              <Database className="mr-2 h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="social">
              <Instagram className="mr-2 h-4 w-4" />
              Social Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecurityTab />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <SystemTab />
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <SocialAccountTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
export default function Page() {
  return (
    <Suspense>
      <SettingsPage />
    </Suspense>
  )
}
