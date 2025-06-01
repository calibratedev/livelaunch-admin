import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Shield, Globe, User } from "lucide-react";

interface DeviceSessionsStatsProps {
  deviceSessions?: AppTypes.PaginatedResponse<AppTypes.DeviceSession>;
}

export default function DeviceSessionsStats({
  deviceSessions,
}: DeviceSessionsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Monitor className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {deviceSessions?.total_record}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Consent</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {deviceSessions?.records?.filter((s) => s.accept_consent).length}
          </div>
          <p className="text-xs text-muted-foreground">Accepted consent</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Devices</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(deviceSessions?.records?.map((s) => s.device_id)).size}
          </div>
          <p className="text-xs text-muted-foreground">Different devices</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {
              new Set(
                deviceSessions?.records
                  ?.filter((s) => s.email)
                  .map((s) => s.email)
              ).size
            }
          </div>
          <p className="text-xs text-muted-foreground">Different emails</p>
        </CardContent>
      </Card>
    </div>
  );
}
