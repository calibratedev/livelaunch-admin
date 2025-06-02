'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Save } from 'lucide-react'

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
  })

  const handleNotificationSave = () => {
    // Handle notification settings save
    console.log('Notifications saved:', notifications)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified about important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Button
              variant={notifications.emailNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setNotifications({
                  ...notifications,
                  emailNotifications: !notifications.emailNotifications,
                })
              }
            >
              {notifications.emailNotifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Button
              variant={notifications.pushNotifications ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setNotifications({
                  ...notifications,
                  pushNotifications: !notifications.pushNotifications,
                })
              }
            >
              {notifications.pushNotifications ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
            </div>
            <Button
              variant={notifications.weeklyReports ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setNotifications({
                  ...notifications,
                  weeklyReports: !notifications.weeklyReports,
                })
              }
            >
              {notifications.weeklyReports ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Alerts</p>
              <p className="text-sm text-muted-foreground">Receive alerts about security events</p>
            </div>
            <Button
              variant={notifications.securityAlerts ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setNotifications({
                  ...notifications,
                  securityAlerts: !notifications.securityAlerts,
                })
              }
            >
              {notifications.securityAlerts ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button onClick={handleNotificationSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
