'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Settings } from 'lucide-react'

export default function SystemTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
        <CardDescription>View system status and configuration details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-medium">Application Version</p>
            <p className="text-sm text-muted-foreground">v1.0.0</p>
          </div>
          <div>
            <p className="font-medium">Database Status</p>
            <Badge variant="default">Connected</Badge>
          </div>
          <div>
            <p className="font-medium">Last Backup</p>
            <p className="text-sm text-muted-foreground">2024-01-28 03:00 AM</p>
          </div>
          <div>
            <p className="font-medium">Server Status</p>
            <Badge variant="default">Online</Badge>
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="font-medium">Maintenance Mode</p>
          <p className="text-sm text-muted-foreground">
            Enable maintenance mode to perform system updates
          </p>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Enable Maintenance Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
