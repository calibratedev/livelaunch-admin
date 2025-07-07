import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/date'
import { Search, Loader2, ExternalLink, MoreHorizontal, Share2, RefreshCw, Eye } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import Image from 'next/image'
import { toast } from 'sonner'

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
  const [rawDataModal, setRawDataModal] = useState<{
    open: boolean
    scan?: AppTypes.Scan
  }>({
    open: false,
    scan: undefined,
  })

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

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Helper function to determine scan type (placeholder logic)
  const getScanType = (scan: AppTypes.Scan): 'Photo' | 'Story' => {
    return scan.is_story ? 'Story' : 'Photo'
  }

  // Get the appropriate image URLs based on scan type
  const getImageUrls = (scan: AppTypes.Scan): { thumbnail?: string; asset?: string } => {
    if (scan.is_story) {
      // For stories (videos), show both thumbnail and asset
      return {
        thumbnail: scan.thumbnail_attachment?.file_url,
        asset: scan.asset_attachment?.file_url,
      }
    } else {
      // For photos, show thumbnail
      return {
        thumbnail: scan.thumbnail_attachment?.file_url,
      }
    }
  }

  const handleGetShareLink = async (scan: AppTypes.Scan) => {
    // TODO: Implement share link generation API call
    try {
      // Placeholder - replace with actual API call
      const shareLink = `${window.location.origin}/scan/${scan.id}`
      await navigator.clipboard.writeText(shareLink)
      toast.success('Share link copied to clipboard!')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to copy share link')
    }
  }

  const handleSyncStatus = async (scan: AppTypes.Scan) => {
    try {
      console.log(scan)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to sync status')
    }
  }

  const handleViewRawData = (scan: AppTypes.Scan) => {
    setRawDataModal({
      open: true,
      scan,
    })
  }

  return (
    <>
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
                  <TableHead>Asset</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Device Session</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans?.records?.map((scan) => {
                  const imageUrls = getImageUrls(scan)
                  return (
                    <TableRow key={scan.id}>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Thumbnail */}
                          {imageUrls.thumbnail && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 relative">
                              <div
                                className="cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
                                onClick={() => window.open(imageUrls.thumbnail!, '_blank')}
                                title="Click to view thumbnail"
                              >
                                <Image
                                  src={imageUrls.thumbnail}
                                  alt="Thumbnail preview"
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                                <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                  <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              {scan.is_story && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5">
                                  Thumbnail
                                </div>
                              )}
                            </div>
                          )}

                          {/* Asset (for stories) */}
                          {scan.is_story && imageUrls.asset && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 relative">
                              <div
                                className="cursor-pointer hover:opacity-80 transition-opacity w-full h-full"
                                onClick={() => window.open(imageUrls.asset!, '_blank')}
                                title="Click to view asset"
                              >
                                <Image
                                  src={imageUrls.asset}
                                  alt="Asset preview"
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                                <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                                  <ExternalLink className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-1 py-0.5">
                                Video
                              </div>
                            </div>
                          )}

                          {/* No image fallback */}
                          {!imageUrls.thumbnail && !imageUrls.asset && (
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 relative">
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-xs">No Image</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {scan.product?.title || 'Unknown Product'}
                          </div>
                          <div className="text-sm text-muted-foreground">{scan?.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{scan.product?.brand?.name || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              getStatusColor(scan.status) as
                                | 'default'
                                | 'secondary'
                                | 'destructive'
                                | 'outline'
                            }
                          >
                            {capitalizeWords(scan.status || 'Unknown')}
                          </Badge>
                          <div className="font-mono text-xs text-muted-foreground">
                            {scan.job_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getScanType(scan)}</div>
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
                      <TableCell>{formatDate(scan.created_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                      <TableCell>{formatDate(scan.updated_at, 'MMM DD, YYYY HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleGetShareLink(scan)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Get Share Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSyncStatus(scan)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewRawData(scan)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Raw Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
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

      {/* Raw Data Modal */}
      <Dialog
        open={rawDataModal.open}
        onOpenChange={(open) => setRawDataModal({ open, scan: undefined })}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Raw Scan Data</DialogTitle>
            <DialogDescription>View the complete JSON data for this scan</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
              <code>{JSON.stringify(rawDataModal.scan, null, 2)}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
