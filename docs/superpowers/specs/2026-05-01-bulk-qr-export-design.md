# Bulk QR Code Export

## Summary
Allow admins to select multiple products in the products table and bulk-export QR code images as a zip file. QR codes are generated server-side, zipped, uploaded to S3, and downloaded via presigned URL.

## Backend (Go/Echo)

### Endpoints
- `POST /api/admin/brand_products/batch_qr_codes` — Accepts `{product_ids: string[]}`, enqueues Asynq task, returns `{job_id: string}`
- `GET /api/admin/brand_products/batch_qr_codes/:job_id` — Polls job status. Returns `{status: "pending"|"processing"|"completed"|"failed", download_url?: string, total?: int, processed?: int}`

### Asynq Task: BulkExportQRCodesTask
1. Fetch products by IDs, preload Brand
2. For each product:
   - Generate scan URL (same logic as `GetBrandProductScanUrl`)
   - Render QR code PNG using `github.com/skip2/go-qrcode` (300x300)
   - Add to in-memory zip as `{brand.shopify_domain}_{product.handle}.png`
3. Upload zip to S3 at `exports/qr_codes/{job_id}.zip`
4. Generate presigned download URL (1hr expiry)
5. Store result in task payload/state

### Job State
- Stored in Asynq task result (ResultWriter pattern, matching existing CSV import)
- Status: pending → processing → completed/failed

## Frontend (Next.js)

### Table Selection
- Add checkbox column to `products-table.tsx`
- Header checkbox: select/deselect all filtered products
- Individual row checkboxes
- Selection state managed with `Set<string>` of product IDs
- "X products selected" count display

### Export Button
- In toolbar area above table (alongside existing filters)
- Enabled when ≥1 row selected
- Shows "Export QR Codes (N)"

### Export Flow
1. Click Export → POST to bulk endpoint → get job_id
2. Show progress dialog (reuse CSV import dialog pattern)
3. Poll GET endpoint every 2-3s
4. On completion: auto-download presigned URL zip
5. On failure: show error toast

## File Naming
- Format: `{brand.shopify_domain}_{product.handle}.png`
- Example: `my-store.myshopify.com_blue-t-shirt.png`
- Zip filename: `qr-codes-{timestamp}.zip`

## Dependencies
- Backend: `github.com/skip2/go-qrcode` (Go QR code generation library)
- Frontend: No new dependencies (uses existing patterns)

## Scope
- Checkbox column + select all in products table
- Export button in toolbar
- Backend bulk QR generation + zip + S3 upload
- Progress polling dialog
- Auto-download on completion
