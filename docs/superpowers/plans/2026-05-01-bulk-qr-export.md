# Bulk QR Code Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to select multiple products and bulk-export QR code images as a downloadable zip.

**Architecture:** Backend Asynq task generates QR codes server-side with `skip2/go-qrcode`, zips them, uploads to S3, returns presigned URL. Frontend adds checkbox column to products table, export button, and polling progress dialog.

**Tech Stack:** Go (Echo + Asynq + GORM), Next.js 15 (React 19 + TanStack Query + shadcn/ui)

---

## File Structure

### Backend (livelaunch-backend)
| File | Action | Responsibility |
|------|--------|---------------|
| `go.mod`, `go.sum` | Modify | Add `github.com/skip2/go-qrcode/v2` dependency |
| `pkg/repo/brand_product_repo.go` | Modify | Add `GetBrandProductScanUrls` batch method |
| `services/consumer/tasks/bulk_export_qr_codes.go` | **Create** | Asynq task: generate QRs, zip, upload to S3 |
| `services/consumer/tasks/tasks.go` | Modify | Register new task handler |
| `services/backend/controllers/admin/brand_product.go` | Modify | Add `CreateBulkExportQRCodes` and `GetBulkExportQRCodesJob` controllers |
| `services/backend/routes/admin.go` | Modify | Add 2 new routes |

### Frontend (livelaunch-admin)
| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/api/endpoints.ts` | Modify | Add 2 new endpoint definitions |
| `src/components/products/products-table.tsx` | Modify | Add checkbox column, selection state, export button |
| `src/components/products/qr-export-dialog.tsx` | **Create** | Export progress dialog with polling |
| `src/app/dashboard/products/page.tsx` | Modify | Wire up selection state + export dialog |

---

## Task 1: Add Go QR Code Dependency

**Files:**
- Modify: `livelaunch-backend/go.mod`

- [ ] **Step 1: Install the qrcode library**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-backend && go get github.com/skip2/go-qrcode/v2
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-backend && go build ./...
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add go.mod go.sum
git commit -m "chore: add go-qrcode dependency for bulk QR export"
```

---

## Task 2: Add Batch Scan URL Repo Method

**Files:**
- Modify: `livelaunch-backend/pkg/repo/brand_product_repo.go`

- [ ] **Step 1: Add the batch method at the end of the file (before the closing of the repo struct methods)**

Add this method to `BrandProductRepo`:

```go
type GetBrandProductScanUrlsParams struct {
    ProductIDs []string `json:"product_ids" validate:"required"`
}

type BrandProductScanUrlResult struct {
    ProductID     string `json:"product_id"`
    Handle        string `json:"handle"`
    ShopifyDomain string `json:"shopify_domain"`
    ScanUrl       string `json:"scan_url"`
}

func (r *BrandProductRepo) GetBrandProductScanUrls(params GetBrandProductScanUrlsParams) ([]BrandProductScanUrlResult, error) {
    var brandProducts []models.BrandProduct
    if err := r.db.Preload("Brand").Where("id IN ?", params.ProductIDs).Find(&brandProducts).Error; err != nil {
        return nil, err
    }

    results := make([]BrandProductScanUrlResult, 0, len(brandProducts))
    for _, bp := range brandProducts {
        url := fmt.Sprintf("%s?product_id=%s", r.db.Configuration.ScanUrl, bp.ID)
        url = appendAttributionParams(url, bp.Brand.StorefrontAccessToken)
        results = append(results, BrandProductScanUrlResult{
            ProductID:     bp.ID,
            Handle:        bp.Handle,
            ShopifyDomain: bp.Brand.ShopifyDomain,
            ScanUrl:       url,
        })
    }
    return results, nil
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-backend && go build ./pkg/repo/...
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add pkg/repo/brand_product_repo.go
git commit -m "feat: add batch scan URL repo method for bulk QR export"
```

---

## Task 3: Create Bulk Export QR Codes Asynq Task

**Files:**
- Create: `livelaunch-backend/services/consumer/tasks/bulk_export_qr_codes.go`

- [ ] **Step 1: Create the task file**

```go
package tasks

import (
    "archive/zip"
    "bytes"
    "context"
    "encoding/json"
    "fmt"
    "time"

    "github.com/calibratedev/livelaunch-backend/pkg/aws"
    "github.com/calibratedev/livelaunch-backend/pkg/logger"
    "github.com/calibratedev/livelaunch-backend/pkg/repo"
    "github.com/hibiken/asynq"
    "github.com/skip2/go-qrcode/v2"
)

type BulkExportQRCodesTask struct {
    JobID      string   `json:"job_id" validate:"required"`
    ProductIDs []string `json:"product_ids" validate:"required"`
}

type BulkExportResult struct {
    Status      string `json:"status"`
    DownloadURL string `json:"download_url,omitempty"`
    Total       int    `json:"total"`
    Processed   int    `json:"processed"`
}

func (task BulkExportQRCodesTask) TaskName() string {
    return "bulk_export_qr_codes"
}

func (task BulkExportQRCodesTask) GetPayload() []byte {
    data, _ := json.Marshal(&task)
    return data
}

func (task BulkExportQRCodesTask) Handler(ctx context.Context, t *asynq.Task) error {
    if err := workerInstance.BindAndValidate(t.Payload(), &task); err != nil {
        return err
    }

    log := logger.GetInstance()
    cfg := workerInstance.App.DB.Configuration
    s3Client := workerInstance.App.AwsClient

    // Write initial state
    task.writeResult(BulkExportResult{Status: "processing", Total: len(task.ProductIDs), Processed: 0})

    // Fetch scan URLs for all products
    scanUrls, err := repo.NewBrandProductRepo(workerInstance.App.DB).GetBrandProductScanUrls(repo.GetBrandProductScanUrlsParams{
        ProductIDs: task.ProductIDs,
    })
    if err != nil {
        task.writeResult(BulkExportResult{Status: "failed", Total: len(task.ProductIDs), Processed: 0})
        return err
    }

    // Generate QR codes and zip
    var buf bytes.Buffer
    zw := zip.NewWriter(&buf)

    for i, item := range scanUrls {
        qr, err := qrcode.New(item.ScanUrl, qrcode.WithQRWidth(8))
        if err != nil {
            log.Error(fmt.Sprintf("Failed to generate QR for product %s: %v", item.ProductID, err))
            continue
        }

        filename := fmt.Sprintf("%s_%s.png", item.ShopifyDomain, item.Handle)
        w, err := zw.Create(filename)
        if err != nil {
            log.Error(fmt.Sprintf("Failed to create zip entry for %s: %v", filename, err))
            continue
        }

        if err := qr.Save(w); err != nil {
            log.Error(fmt.Sprintf("Failed to write QR for %s: %v", filename, err))
            continue
        }

        task.writeResult(BulkExportResult{Status: "processing", Total: len(task.ProductIDs), Processed: i + 1})
    }

    if err := zw.Close(); err != nil {
        task.writeResult(BulkExportResult{Status: "failed", Total: len(task.ProductIDs), Processed: 0})
        return err
    }

    // Upload zip to S3
    s3Key := fmt.Sprintf("exports/qr_codes/%s.zip", task.JobID)
    _, err = s3Client.UploadBytes(aws.UploadBytesParams{
        Data:        buf.Bytes(),
        Bucket:      cfg.AwsS3StorageBucket,
        Key:         s3Key,
        ContentType: "application/zip",
    })
    if err != nil {
        task.writeResult(BulkExportResult{Status: "failed", Total: len(task.ProductIDs), Processed: 0})
        return err
    }

    // Generate presigned download URL
    presignedResult, err := s3Client.GeneratePresignedDownloadURL(aws.GeneratePresignedDownloadURLParams{
        Bucket:             cfg.AwsS3StorageBucket,
        Key:                s3Key,
        Filename:           fmt.Sprintf("qr-codes-%s.zip", time.Now().Format("2006-01-02")),
        ContentType:        "application/zip",
        ExpirationDuration: 1 * time.Hour,
    })
    if err != nil {
        task.writeResult(BulkExportResult{Status: "failed", Total: len(task.ProductIDs), Processed: 0})
        return err
    }

    task.writeResult(BulkExportResult{
        Status:      "completed",
        DownloadURL: presignedResult.URL,
        Total:       len(task.ProductIDs),
        Processed:   len(scanUrls),
    })

    return nil
}

func (task BulkExportQRCodesTask) Dispatch(ctx context.Context, opts ...asynq.Option) (*asynq.TaskInfo, error) {
    return workerInstance.SendTaskWithContext(ctx, task, opts...)
}

func (task BulkExportQRCodesTask) writeResult(result BulkExportResult) {
    key := fmt.Sprintf("bulk_qr_export:%s", task.JobID)
    data, _ := json.Marshal(result)
    _ = workerInstance.App.Cache.Set(key, string(data), 2*time.Hour)
}

// GetBulkExportResult reads the job result from cache
func GetBulkExportResult(jobID string) (*BulkExportResult, error) {
    key := fmt.Sprintf("bulk_qr_export:%s", jobID)
    data, err := workerInstance.App.Cache.Get(key)
    if err != nil || data == "" {
        return nil, err
    }
    var result BulkExportResult
    if err := json.Unmarshal([]byte(data), &result); err != nil {
        return nil, err
    }
    return &result, nil
}
```

- [ ] **Step 2: Check if `UploadBytes` method exists on the AWS client. If not, add it to `pkg/aws/utils.go`**

Add to `pkg/aws/utils.go`:

```go
type UploadBytesParams struct {
    Data        []byte
    Bucket      string
    Key         string
    ContentType string
    ACL         string
}

type UploadBytesResult struct {
    URL  string
    Key  string
    Size int64
}

func (client *Client) UploadBytes(params UploadBytesParams) (*UploadBytesResult, error) {
    if params.ACL == "" {
        params.ACL = "public-read"
    }
    if params.ContentType == "" {
        params.ContentType = "application/octet-stream"
    }

    s3Client := s3.NewFromConfig(client.awsConfig)
    _, err := s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
        Bucket:      aws.String(params.Bucket),
        Key:         aws.String(params.Key),
        Body:        bytes.NewReader(params.Data),
        ContentType: aws.String(params.ContentType),
        ACL:         types.ObjectCannedACL(params.ACL),
    })
    if err != nil {
        return nil, eris.Wrap(err, "failed to upload bytes to S3")
    }

    url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", params.Bucket, client.cfg.AwsRegion, params.Key)
    return &UploadBytesResult{URL: url, Key: params.Key, Size: int64(len(params.Data))}, nil
}
```

Also ensure the necessary imports exist at the top of `utils.go`: `"bytes"`, `"context"`, `github.com/aws/aws-sdk-go-v2/service/s3`, `github.com/aws/aws-sdk-go-v2/aws`, `github.com/aws/aws-sdk-go-v2/service/s3/types`. Check what's already imported before adding.

- [ ] **Step 3: Verify compilation**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-backend && go build ./...
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add services/consumer/tasks/bulk_export_qr_codes.go pkg/aws/utils.go
git commit -m "feat: add bulk QR codes export Asynq task"
```

---

## Task 4: Register Task + Add Controller + Add Routes

**Files:**
- Modify: `livelaunch-backend/services/consumer/tasks/tasks.go`
- Modify: `livelaunch-backend/services/backend/controllers/admin/brand_product.go`
- Modify: `livelaunch-backend/services/backend/routes/admin.go`

- [ ] **Step 1: Register the task in tasks.go**

Add `BulkExportQRCodesTask{}` to the `CreateTaskHandler(...)` call:

```go
workerInstance.CreateTaskHandler(
    TrackActivity{},
    SendEmail{},
    ShopifyCreateWebhooksTask{},
    ShopifyFetchProductsTask{},
    PublishInstagramMediaTask{},
    TrackTiktokPostTask{},
    RefreshInstagramAccountTokenTask{},
    RefreshTiktokAccountTokenTask{},
    ProcessMediaConversionTask{},
    SyncProductsToInstagramTask{},
    CheckInstagramBatchStatusTask{},
    CSVImportProductsTask{},
    BulkExportQRCodesTask{},
)
```

- [ ] **Step 2: Add controller functions to brand_product.go**

```go
type CreateBulkExportQRCodesRequest struct {
    ProductIDs []string `json:"product_ids" validate:"required"`
}

func CreateBulkExportQRCodes(c echo.Context) error {
    var cc = c.(*models.CustomContext)
    var req CreateBulkExportQRCodesRequest
    if err := cc.BindAndValidate(&req); err != nil {
        return eris.Wrap(err, "Invalid request")
    }

    jobID := fmt.Sprintf("%d", time.Now().UnixNano())
    task := tasks.BulkExportQRCodesTask{
        JobID:      jobID,
        ProductIDs: req.ProductIDs,
    }

    if _, err := task.Dispatch(c.Request().Context()); err != nil {
        return eris.Wrap(err, "Failed to dispatch export task")
    }

    return cc.Success(models.M{
        "job_id": jobID,
    })
}

func GetBulkExportQRCodesJob(c echo.Context) error {
    var cc = c.(*models.CustomContext)
    jobID := c.Param("job_id")

    result, err := tasks.GetBulkExportResult(jobID)
    if err != nil {
        return cc.Success(models.M{
            "status":    "pending",
            "job_id":    jobID,
            "total":     0,
            "processed": 0,
        })
    }

    return cc.Success(models.M{
        "status":       result.Status,
        "job_id":       jobID,
        "download_url": result.DownloadURL,
        "total":        result.Total,
        "processed":    result.Processed,
    })
}
```

Also add required imports at the top of `brand_product.go` if not present: `"fmt"`, `"time"`, `"github.com/calibratedev/livelaunch-backend/services/consumer/tasks"`.

- [ ] **Step 3: Add routes in admin.go**

Add these lines in `SetupAdminRoutes` inside the admin group:

```go
adminGroup.POST("/brand_products/batch_qr_codes", controllers.CreateBulkExportQRCodes)
adminGroup.GET("/brand_products/batch_qr_codes/:job_id", controllers.GetBulkExportQRCodesJob)
```

**Important:** Add these BEFORE the `:brand_product_id` routes to avoid path parameter conflicts:

```go
// Brand Product routes
adminGroup.GET("/brand_products", controllers.GetBrandProducts)
adminGroup.POST("/brand_products/batch_qr_codes", controllers.CreateBulkExportQRCodes)
adminGroup.GET("/brand_products/batch_qr_codes/:job_id", controllers.GetBulkExportQRCodesJob)
adminGroup.GET("/brand_products/:brand_product_id", controllers.GetBrandProductByID)
adminGroup.POST("/brand_products/:brand_product_id/scan_url", controllers.GetBrandProductScanUrl)
```

- [ ] **Step 4: Verify compilation**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-backend && go build ./...
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add services/consumer/tasks/tasks.go services/backend/controllers/admin/brand_product.go services/backend/routes/admin.go
git commit -m "feat: add bulk QR export API endpoints and task registration"
```

---

## Task 5: Add Frontend API Endpoints

**Files:**
- Modify: `livelaunch-admin/src/lib/api/endpoints.ts`

- [ ] **Step 1: Add the two new endpoint definitions**

Add to the `endpoints` object:

```ts
bulkExportQRCodes: 'POST /api/admin/brand_products/batch_qr_codes',
bulkExportQRCodesJob: 'GET /api/admin/brand_products/batch_qr_codes/:job_id',
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/api/endpoints.ts
git commit -m "feat: add bulk QR export API endpoints"
```

---

## Task 6: Create QR Export Progress Dialog

**Files:**
- Create: `livelaunch-admin/src/components/products/qr-export-dialog.tsx`

- [ ] **Step 1: Create the dialog component**

This follows the exact same pattern as `csv-import-dialog.tsx` — polling with `useQuery` + `refetchInterval`.

```tsx
'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle, Download } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { getCookie } from '@/lib/cookies'
import config from '@/lib/config'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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

  const { data: jobData } = useQuery({
    queryKey: ['bulkExportQRCodesJob', jobId],
    queryFn: async () => {
      if (!jobId) return null
      const result = await api.bulkExportQRCodesJob<QRExportJob>({}, { params: { job_id: jobId } })
      return result.data
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'pending' || status === 'processing' ? 2000 : false
    },
  })

  const handleClose = (open: boolean) => {
    if (!open) {
      if (jobData?.status === 'completed' || jobData?.status === 'failed') {
        setJobId(null)
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

  const isTerminal = jobData?.status === 'completed' || jobData?.status === 'failed'
  const progress = jobData?.total ? Math.round((jobData.processed / jobData.total) * 100) : 0

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

          {jobData?.status === 'pending' && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Queued...</span>
            </div>
          )}

          {jobData?.status === 'processing' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{jobData.processed}/{jobData.total}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
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
            <div className="flex items-center justify-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <span>Export failed. Please try again.</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors (manual check: imports resolve)**

Check that `@/lib/cookies` and `@/lib/config` exist — if not, check the csv-import-dialog for the correct import paths.

- [ ] **Step 3: Commit**

```bash
git add src/components/products/qr-export-dialog.tsx
git commit -m "feat: add QR code export progress dialog"
```

---

## Task 7: Add Checkbox Column + Export Button to Products Table

**Files:**
- Modify: `livelaunch-admin/src/components/products/products-table.tsx`

- [ ] **Step 1: Add selection props and checkbox column**

Add to `ProductsTableProps`:

```ts
selectedProductIds: Set<string>
onSelectionChange: (ids: Set<string>) => void
onExportQRCodes: () => void
```

Add a new first column in the table header:

```tsx
<TableHead className="w-12">
  <Checkbox
    checked={filteredProducts.length > 0 && selectedProductIds.size === filteredProducts.length}
    onCheckedChange={(checked) => {
      if (checked) {
        onSelectionChange(new Set(filteredProducts.map((p) => p.id)))
      } else {
        onSelectionChange(new Set())
      }
    }}
  />
</TableHead>
```

Add a new first cell in each table row:

```tsx
<TableCell>
  <Checkbox
    checked={selectedProductIds.has(product.id)}
    onCheckedChange={(checked) => {
      const next = new Set(selectedProductIds)
      if (checked) {
        next.add(product.id)
      } else {
        next.delete(product.id)
      }
      onSelectionChange(next)
    }}
  />
</TableCell>
```

Add the `Checkbox` import from `@/components/ui/checkbox` and the `Download` icon from `lucide-react`.

- [ ] **Step 2: Add Export button in the filters/actions area**

In the filters row area (where the search input and filters are), add an export button:

```tsx
{selectedProductIds.size > 0 && (
  <Button variant="outline" size="sm" onClick={onExportQRCodes}>
    <Download className="mr-2 h-4 w-4" />
    Export QR Codes ({selectedProductIds.size})
  </Button>
)}
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-admin && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/products/products-table.tsx
git commit -m "feat: add checkbox column and export button to products table"
```

---

## Task 8: Wire Everything Together in Products Page

**Files:**
- Modify: `livelaunch-admin/src/app/dashboard/products/page.tsx`

- [ ] **Step 1: Add selection state and export dialog**

Add state and dialog wiring to the page component:

```tsx
import { QRExportDialog } from '@/components/products/qr-export-dialog'

// Inside the component:
const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
const [qrExportOpen, setQrExportOpen] = useState(false)
```

Pass to `ProductsTable`:

```tsx
<ProductsTable
  // ... existing props ...
  selectedProductIds={selectedProductIds}
  onSelectionChange={setSelectedProductIds}
  onExportQRCodes={() => setQrExportOpen(true)}
/>
```

Add the dialog:

```tsx
<QRExportDialog
  open={qrExportOpen}
  onOpenChange={setQrExportOpen}
  selectedProductIds={Array.from(selectedProductIds)}
  onComplete={() => {
    setSelectedProductIds(new Set())
  }}
/>
```

Reset selection when filters change (add to existing `useEffect` that resets page):

```tsx
useEffect(() => {
  setCurrentPage(1)
  setSelectedProductIds(new Set())
}, [debouncedSearchTerm, selectedBrandIds, selectedStatuses])
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/loithai/Projects/livelaunch/livelaunch-admin && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/products/page.tsx
git commit -m "feat: wire up bulk QR export in products page"
```

---

## Task 9: Check shadcn Checkbox Component Exists

**Files:**
- Possibly create: `livelaunch-admin/src/components/ui/checkbox.tsx`

- [ ] **Step 1: Check if Checkbox exists**

```bash
ls src/components/ui/checkbox.tsx
```

If it doesn't exist, install it:

```bash
npx shadcn@latest add checkbox
```

- [ ] **Step 2: Commit if new**

```bash
git add src/components/ui/checkbox.tsx
git commit -m "chore: add shadcn checkbox component"
```
