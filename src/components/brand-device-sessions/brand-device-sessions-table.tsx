import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/date'
import { Search, Loader2, MoreHorizontal, Trash2 } from 'lucide-react'
import { DeleteBrandDeviceSessionDialog } from './delete-brand-device-session-dialog'
import { Pagination } from '@/components/ui/pagination'

interface BrandDeviceSessionsTableProps {
  brandDeviceSessions?: AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>
  searchTerm: string
  onSearchChange: (value: string) => void
  onDeleteSession: (id: string) => void
  isSearching?: boolean
  isDeleting?: boolean
  currentPage: number
  onPageChange: (page: number) => void
}

export default function BrandDeviceSessionsTable({
  brandDeviceSessions,
  searchTerm,
  onSearchChange,
  onDeleteSession,
  isSearching,
  isDeleting,
  currentPage,
  onPageChange,
}: BrandDeviceSessionsTableProps) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean
    brandDeviceSession?: AppTypes.BrandDeviceSession
  }>({
    open: false,
    brandDeviceSession: undefined,
  })

  const handleDeleteClick = (brandDeviceSession: AppTypes.BrandDeviceSession) => {
    setDeleteDialogState({
      open: true,
      brandDeviceSession,
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogState.brandDeviceSession) {
      onDeleteSession(deleteDialogState.brandDeviceSession.id)
      setDeleteDialogState({ open: false, brandDeviceSession: undefined })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogState({ open: false, brandDeviceSession: undefined })
  }

  return (
    <>
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
                  <TableHead>Last Update</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDeleteClick(session)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {brandDeviceSessions && (
            <Pagination
              currentPage={currentPage}
              totalPages={brandDeviceSessions.total_page}
              hasNext={brandDeviceSessions.has_next}
              hasPrev={brandDeviceSessions.has_prev}
              onPageChange={onPageChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      <DeleteBrandDeviceSessionDialog
        open={deleteDialogState.open}
        brandDeviceSession={deleteDialogState.brandDeviceSession}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting || false}
      />
    </>
  )
}
