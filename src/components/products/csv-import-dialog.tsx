'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Loader2, CheckCircle2, XCircle, FileSpreadsheet, Trash2, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { uploadFile } from '@/lib/api/upload'
import { toast } from 'sonner'
import { getCookie } from 'cookies-next/client'
import config from '@/config'

interface CSVImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brands: AppTypes.Brand[]
  preselectedBrandId?: string
}

export function CSVImportDialog({ open, onOpenChange, brands, preselectedBrandId }: CSVImportDialogProps) {
  const queryClient = useQueryClient()
  const [selectedBrandId, setSelectedBrandId] = useState(preselectedBrandId || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const [showCreateBrand, setShowCreateBrand] = useState(false)
  const [newBrandName, setNewBrandName] = useState('')
  const [newBrandEmail, setNewBrandEmail] = useState('')
  const [newBrandShopName, setNewBrandShopName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Poll for job status
  const { data: jobData } = useQuery({
    queryKey: ['csvImportJob', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const token = getCookie('token')
      const resp = await fetch(`${config.apiUrl}/api/admin/csv_imports/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await resp.json()
      return json.data as AppTypes.CSVImportJob
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'pending' || status === 'processing' ? 2000 : false
    },
  })

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async ({ name, email, shopify_shop_name }: { name: string; email: string; shopify_shop_name: string }) => {
      return api.createBrand<AppTypes.Brand>({
        name,
        email,
        shopify_shop_name,
        shopify_domain: `${shopify_shop_name}.myshopify.com`,
        instagram_handles: [],
        primary_color: '#000000',
      })
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: api.paginateBrands.getQueryKey() })
      setSelectedBrandId(response.data.id)
      setShowCreateBrand(false)
      setNewBrandName('')
      setNewBrandEmail('')
      setNewBrandShopName('')
      toast.success('Brand created')
    },
    onError: (error) => {
      toast.error(`Failed to create brand: ${error.message}`)
    },
  })

  // Use the existing API client for consistency
  const createImportMutation = useMutation({
    mutationFn: async ({ brandId, file }: { brandId: string; file: File }) => {
      // Step 1: Upload CSV to S3
      const uploadResult = await uploadFile(file, 'brand_product')

      // Step 2: Create import job via API
      return api.csvImports<AppTypes.CSVImportJob>({
        brand_id: brandId,
        file_key: uploadResult.data.file_key,
        file_name: file.name,
      })
    },
    onSuccess: (response) => {
      setJobId(response.data.id)
      toast.success('CSV import started')
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`)
    },
  })

  const handleImport = useCallback(() => {
    if (!selectedBrandId || !selectedFile) return
    createImportMutation.mutate({ brandId: selectedBrandId, file: selectedFile })
  }, [selectedBrandId, selectedFile, createImportMutation])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) {
      setSelectedFile(file)
    } else {
      toast.error('Please upload a CSV file')
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }, [])

  const reset = useCallback(() => {
    setSelectedFile(null)
    setJobId(null)
    setSelectedBrandId(preselectedBrandId || '')
    setShowCreateBrand(false)
  }, [preselectedBrandId])

  const handleClose = useCallback((open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }, [onOpenChange, reset])

  const job = jobData
  const isComplete = job?.status === 'completed' || job?.status === 'failed'
  const isUploading = createImportMutation.isPending
  const isProcessing = job?.status === 'processing' || job?.status === 'pending'

  const progressPercent = job && job.total_rows > 0
    ? Math.round((job.processed_rows / job.total_rows) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a Shopify product CSV export to import products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Brand Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <div className="flex gap-2">
              <Select value={selectedBrandId} onValueChange={setSelectedBrandId} disabled={isUploading || !!jobId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!jobId && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowCreateBrand(!showCreateBrand)}
                  disabled={isUploading}
                  title="Create new brand"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Inline brand creation */}
            {showCreateBrand && !jobId && (
              <div className="border rounded-lg p-3 space-y-3 bg-muted/50">
                <p className="text-sm font-medium">Create New Brand</p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input
                      placeholder="Brand name"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Email *</Label>
                    <Input
                      type="email"
                      placeholder="contact@brand.com"
                      value={newBrandEmail}
                      onChange={(e) => setNewBrandEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Shopify Shop Name *</Label>
                    <Input
                      placeholder="my-store"
                      value={newBrandShopName}
                      onChange={(e) => setNewBrandShopName(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    />
                    {newBrandShopName && (
                      <p className="text-xs text-muted-foreground">
                        {newBrandShopName}.myshopify.com
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateBrand(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!newBrandName || !newBrandEmail || !newBrandShopName || createBrandMutation.isPending}
                      onClick={() => createBrandMutation.mutate({
                        name: newBrandName,
                        email: newBrandEmail,
                        shopify_shop_name: newBrandShopName,
                      })}
                    >
                      {createBrandMutation.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File Upload */}
          {!jobId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">CSV File</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                      className="ml-2 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isDragOver ? 'Drop CSV here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground">Shopify CSV export files only</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {jobId && job && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{job.status}</span>
                <Badge variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>

              {(isProcessing) && (
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {job.processed_rows} / {job.total_rows || '...'} products
                  </p>
                </div>
              )}

              {isComplete && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {job.created_rows > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> {job.created_rows} created
                    </div>
                  )}
                  {job.updated_rows > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" /> {job.updated_rows} updated
                    </div>
                  )}
                  {job.skipped_rows > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <XCircle className="h-4 w-4" /> {job.skipped_rows} skipped
                    </div>
                  )}
                  {job.error_rows > 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-4 w-4" /> {job.error_rows} errors
                    </div>
                  )}
                </div>
              )}

              {job.error_message && (
                <p className="text-xs text-red-500">{job.error_message}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {!isComplete ? (
              <>
                <Button variant="outline" onClick={() => handleClose(false)} disabled={isUploading}>
                  Cancel
                </Button>
                {!jobId && (
                  <Button
                    onClick={handleImport}
                    disabled={!selectedBrandId || !selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" /> Import</>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => handleClose(false)}>Done</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
