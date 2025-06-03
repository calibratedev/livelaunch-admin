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
import { Search, Loader2 } from 'lucide-react'

interface DeviceSessionsTableProps {
  deviceSessions?: AppTypes.PaginatedResponse<AppTypes.DeviceSession>
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearching?: boolean
}

export default function DeviceSessionsTable({
  deviceSessions,
  searchTerm,
  onSearchChange,
  isSearching,
}: DeviceSessionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Device Sessions</CardTitle>
        <CardDescription>A list of all device sessions on your platform</CardDescription>
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
                <TableHead>Device & Email</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Created Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceSessions?.records?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{session.device_id}.</div>
                      <div className="text-sm text-muted-foreground">
                        {session.email || 'No email'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{session.ip_address || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm">
                      {session.user_agent || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(session.created_at * 1000).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
