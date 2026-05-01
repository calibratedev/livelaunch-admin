'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getCookie } from 'cookies-next/client'
import config from '@/config'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface QRExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProductIds: string[]
  onComplete?: () => void
}

interface QRExportJob {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  job_id: string
  download_url?: string
  total: number
  processed: number
  error_message?: string
}

export function QRExportDialog({ open, onOpenChange, selectedProductIds, onComplete }: QRExportDialogProps) {
  const [jobId, setJobId] = useState<string | null>(null)

  const startExportMutation = useMutation({
    mutationFn: async () => {
      const result = await api.bulkExportQRCodes<{ job_id: string }>({
        product_ids: selectedProductIds,
      })
      return result.data
    },
    onSuccess: (data) => {
      setJobId(data.job_id)
      toast.success('QR code export started')
    },
    onError: () => {
      toast.error('Failed to start QR code export')
    },
  })

  // Poll for job status using raw fetch (endpoint uses URL path param :job_id)
  const { data: jobData } = useQuery({
    queryKey: ['bulkExportQRCodesJob', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const token = getCookie('token')
      const resp = await fetch(`${config.apiUrl}/api/admin/brand_products/batch_qr_codes/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await resp.json()
      return json.data as QRExportJob
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'pending' || status === 'processing' ? 2000 : false
    },
  })

  const reset = () => {
    setJobId(null)
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      if (jobData?.status === 'completed' || jobData?.status === 'failed') {
        reset()
      }
    }
    onOpenChange(open)
  }

  const handleDownload = () => {
    if (jobData?.download_url) {
      window.open(jobData.download_url, '_blank')
      onComplete?.()
      handleClose(false)
    }
  }

  const progress = jobData?.total ? Math.round((jobData.processed / jobData.total) * 100) : 0

  const isComplete = jobData?.status === 'completed' || jobData?.status === 'failed'
  const isProcessing = jobData?.status === 'processing' || jobData?.status === 'pending'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export QR Codes</DialogTitle>
          <DialogDescription>
            {jobData?.status === 'completed'
              ? `${jobData.processed} QR codes ready for download`
              : jobId
                ? `Processing ${selectedProductIds.length} products...`
                : `Export QR codes for ${selectedProductIds.length} selected products`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!jobId && !startExportMutation.isPending && (
            <Button
              className="w-full"
              onClick={() => startExportMutation.mutate()}
              disabled={selectedProductIds.length === 0}
            >
              Start Export ({selectedProductIds.length} products)
            </Button>
          )}

          {startExportMutation.isPending && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Starting export...</span>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{jobData?.status ?? 'Processing'}...</span>
                <span className="text-muted-foreground">
                  {jobData?.processed ?? 0}/{jobData?.total ?? '...'}
                </span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {jobData?.status === 'completed' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Export complete</span>
              </div>
              <Button className="w-full" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download ZIP
              </Button>
            </div>
          )}

          {jobData?.status === 'failed' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                <span>Export failed. Please try again.</span>
              </div>
              {jobData.error_message && (
                <p className="text-xs text-red-500 text-center">{jobData.error_message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {!isComplete ? (
              <Button variant="outline" onClick={() => handleClose(false)} disabled={startExportMutation.isPending}>
                Cancel
              </Button>
            ) : (
              <Button onClick={() => handleClose(false)}>Done</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
