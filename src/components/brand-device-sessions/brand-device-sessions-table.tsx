import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/date'
import { Search, Loader2 } from 'lucide-react'

interface BrandDeviceSessionsTableProps {
  brandDeviceSessions?: AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearching?: boolean
}

export default function BrandDeviceSessionsTable({
  brandDeviceSessions,
  searchTerm,
  onSearchChange,
  isSearching,
}: BrandDeviceSessionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Brand Device Sessions</CardTitle>
        <CardDescription>A list of all brand device sessions on your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Info</TableHead>
                <TableHead>App Version</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandDeviceSessions?.records?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {session.device_name || 'Unknown Device'}
                      </div>
                      <div className="text-sm text-muted-foreground">{session.device_id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {session.app_version || 'Unknown'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{session.region_code || 'N/A'}</div>
                      {session.latitude && session.longitude && (
                        <div className="text-sm text-muted-foreground">
                          {session.latitude.toFixed(2)}, {session.longitude.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{session.ip_address || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{session.timezone || 'N/A'}</span>
                  </TableCell>
                  <TableCell>{formatDate(session.created_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                  <TableCell>{formatDate(session.updated_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
