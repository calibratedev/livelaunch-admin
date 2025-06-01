import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Globe, Smartphone } from "lucide-react";

interface BrandDeviceSessionsStatsProps {
  brandDeviceSessions?: AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>;
}

export default function BrandDeviceSessionsStats({
  brandDeviceSessions,
}: BrandDeviceSessionsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {brandDeviceSessions?.total_record}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Brands</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Set(brandDeviceSessions?.records?.map((s) => s.brand_id)).size}
          </div>
          <p className="text-xs text-muted-foreground">Different brands</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Devices</CardTitle>
          <Smartphone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {
              new Set(brandDeviceSessions?.records?.map((s) => s.device_id))
                .size
            }
          </div>
          <p className="text-xs text-muted-foreground">Different devices</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Regions</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {
              new Set(
                brandDeviceSessions?.records
                  ?.filter((s) => s.region_code)
                  .map((s) => s.region_code)
              ).size
            }
          </div>
          <p className="text-xs text-muted-foreground">Different regions</p>
        </CardContent>
      </Card>
    </div>
  );
}
