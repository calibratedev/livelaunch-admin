'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import ProfileTab from '@/components/settings/profile-tab'
import SecurityTab from '@/components/settings/security-tab'
import NotificationsTab from '@/components/settings/notifications-tab'
import SystemTab from '@/components/settings/system-tab'
import { User, Bell, Shield, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
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
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
