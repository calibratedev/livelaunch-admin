'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatDate } from '@/lib/date'
import { toTitleCase } from '@/lib/text'
import { Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'

interface QRExportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total: number
  processed: number
  download_url?: string
  error_message?: string
  filter_brand_ids?: string
  filter_statuses?: string
  filter_keyword?: string
  created_at: number
  updated_at: number
  completed_at?: number
}

interface CSVImportJob {
  id: string
  brand_id: string
  brand?: { name: string; shopify_domain: string }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  file_name: string
  total_rows: number
  processed_rows: number
  created_rows: number
  updated_rows: number
  skipped_rows: number
  error_rows: number
  error_message?: string
  created_at: number
  updated_at: number
  completed_at?: number
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed': return 'default' as const
    case 'failed': return 'destructive' as const
    case 'processing':
    case 'pending': return 'secondary' as const
    default: return 'secondary' as const
  }
}

export default function ExportsPage() {
  const [qrPage, setQrPage] = useState(1)
  const [csvPage, setCsvPage] = useState(1)

  // Fetch QR exports
  const { data: qrData } = useQuery({
    queryKey: api.qrExportJobs.getQueryKey({ page: qrPage, limit: 20 }),
    queryFn: () => api.qrExportJobs<AppTypes.PaginatedResponse<QRExportJob>>({ page: qrPage, limit: 20 }),
    select: (data) => data?.data,
    refetchInterval: (query) => {
      const records = query.state.data?.data?.records || []
      return records.some((j: QRExportJob) => j.status === 'pending' || j.status === 'processing') ? 5000 : false
    },
  })

  // Fetch CSV imports
  const { data: csvData } = useQuery({
    queryKey: api.csvImportJobs.getQueryKey({ page: csvPage, limit: 20 }),
    queryFn: () => api.csvImportJobs<AppTypes.PaginatedResponse<CSVImportJob>>({ page: csvPage, limit: 20 }),
    select: (data) => data?.data,
    refetchInterval: (query) => {
      const records = query.state.data?.data?.records || []
      return records.some((j: CSVImportJob) => j.status === 'pending' || j.status === 'processing') ? 5000 : false
    },
  })

  const qrJobs = qrData?.records || []
  const csvJobs = csvData?.records || []

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qr">
        <TabsList>
          <TabsTrigger value="qr">QR Exports</TabsTrigger>
          <TabsTrigger value="csv">CSV Imports</TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Filters</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qrJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No QR exports yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    qrJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{formatDate(job.created_at, 'MMM D, YYYY h:mm A')}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(job.status)}>
                            {toTitleCase(job.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {job.processed || 0} / {job.total || 0}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.filter_brand_ids || job.filter_statuses || job.filter_keyword ? (
                            <div className="flex gap-1 flex-wrap">
                              {job.filter_brand_ids && <Badge variant="outline" className="text-xs">Brands</Badge>}
                              {job.filter_statuses && <Badge variant="outline" className="text-xs">{job.filter_statuses}</Badge>}
                              {job.filter_keyword && <span>&quot;{job.filter_keyword}&quot;</span>}
                            </div>
                          ) : (
                            <span>Manual selection</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {job.status === 'completed' && job.download_url ? (
                            <Button variant="outline" size="sm" onClick={() => window.open(job.download_url, '_blank')}>
                              <Download className="mr-1 h-3 w-3" />
                              Download
                            </Button>
                          ) : job.status === 'processing' || job.status === 'pending' ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : job.error_message ? (
                            <span className="text-xs text-destructive">{job.error_message}</span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination
                  currentPage={qrData?.current_page || 1}
                  totalPages={qrData?.total_page || 1}
                  hasNext={qrData?.has_next || false}
                  hasPrev={qrData?.has_prev || false}
                  onPageChange={setQrPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Imports</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No CSV imports yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    csvJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{formatDate(job.created_at, 'MMM D, YYYY h:mm A')}</TableCell>
                        <TableCell>{job.brand?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(job.status)}>
                            {toTitleCase(job.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span>{job.processed_rows || 0} / {job.total_rows || 0}</span>
                            <div className="text-muted-foreground text-xs">
                              +{job.created_rows || 0} created, {job.updated_rows || 0} updated, {job.skipped_rows || 0} skipped
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {job.file_name || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination
                  currentPage={csvData?.current_page || 1}
                  totalPages={csvData?.total_page || 1}
                  hasNext={csvData?.has_next || false}
                  hasPrev={csvData?.has_prev || false}
                  onPageChange={setCsvPage}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
