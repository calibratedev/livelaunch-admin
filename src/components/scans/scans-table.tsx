import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Pagination } from '@/components/ui/pagination'

interface ScansTableProps {
  scans?: AppTypes.PaginatedResponse<AppTypes.Scan>
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearching?: boolean
  // Pagination props
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}

export default function ScansTable({
  scans,
  searchTerm,
  onSearchChange,
  isSearching,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: ScansTableProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Scans</CardTitle>
        <CardDescription>
          A list of all product scans across all brands on your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scans..."
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
                <TableHead>Job ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Device Session</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Updated At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scans?.records?.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>
                    <div className="font-mono text-sm">{scan.job_id}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {scan.product?.title || 'Unknown Product'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scan.product?.id || scan.product_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{scan.product?.brand?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(scan.status) as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                          | 'outline'
                      }
                    >
                      {scan.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">
                        {scan.brand_device_session?.device_name || 'Unknown Device'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scan.brand_device_session?.device_id || scan.brand_device_session_id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {scan.detail?.length || 0} files
                      {scan.detail && scan.detail.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {scan.detail.slice(0, 2).map((detail, index) => (
                            <div key={index} className="truncate max-w-[120px]">
                              {detail.file_name}
                            </div>
                          ))}
                          {scan.detail.length > 2 && (
                            <div className="text-muted-foreground">
                              +{scan.detail.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(scan.created_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                  <TableCell>{formatDate(scan.updated_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={onPageChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
