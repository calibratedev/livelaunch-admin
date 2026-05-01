import { Button } from '@/components/ui/button'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Eye, Loader2, QrCode, Download, Link } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { toTitleCase } from '@/lib/text'
import { formatMoney } from '@/lib/money'
import { useState } from 'react'
import api from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductQRModal } from './product-qr-modal'
import { Pagination } from '@/components/ui/pagination'
import { Checkbox } from '@/components/ui/checkbox'
import { BrandFilter, ProductStatusFilter } from './product-filters'

interface ProductsTableProps {
  products?: AppTypes.PaginatedResponse<AppTypes.Product>
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearching?: boolean
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
  brands?: AppTypes.Brand[]
  selectedBrandIds: string[]
  onBrandFilterChange: (ids: string[]) => void
  selectedStatuses: string[]
  onStatusFilterChange: (statuses: string[]) => void
  selectedProductIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onExportQRCodes: () => void
  selectAllFiltered: boolean
  onSelectAllFiltered: (value: boolean) => void
  totalRecords: number
}

export default function ProductsTable({
  products,
  searchTerm,
  onSearchChange,
  isSearching,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  brands = [],
  selectedBrandIds,
  onBrandFilterChange,
  selectedStatuses,
  onStatusFilterChange,
  selectedProductIds,
  onSelectionChange,
  onExportQRCodes,
  selectAllFiltered,
  onSelectAllFiltered,
  totalRecords,
}: ProductsTableProps) {
  const [qrModalState, setQrModalState] = useState<{
    open: boolean
    product?: AppTypes.Product
  }>({
    open: false,
    product: undefined,
  })

  const queryClient = useQueryClient()
  const [editingPreviewUrl, setEditingPreviewUrl] = useState<{
    productId: string
    value: string
  } | null>(null)

  const updatePreviewUrlMutation = useMutation({
    mutationFn: async ({ productId, previewUrl }: { productId: string; previewUrl: string }) => {
      return await api.updateProductPreviewUrl<AppTypes.Product>({
        product_id: productId,
        preview_url: previewUrl || null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.paginateProducts.getQueryKey() })
      setEditingPreviewUrl(null)
    },
  })

  const filteredProducts = products?.records || []

  // Cross-page checkbox selection state
  const currentPageIds = filteredProducts.map((p) => p.id)
  const selectedOnCurrentPage = currentPageIds.filter((id) => selectedProductIds.has(id))
  const allCurrentPageSelected = selectedOnCurrentPage.length === filteredProducts.length && filteredProducts.length > 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'archived':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleQRClick = (product: AppTypes.Product) => {
    setQrModalState({
      open: true,
      product,
    })
  }

  const handleQRModalClose = () => {
    setQrModalState({
      open: false,
      product: undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Products</CardTitle>
        <CardDescription>A list of all products across all brands on your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <BrandFilter
            brands={brands}
            selected={selectedBrandIds}
            onChange={onBrandFilterChange}
          />
          <ProductStatusFilter
            selected={selectedStatuses}
            onChange={onStatusFilterChange}
          />
          {selectedProductIds.size > 0 || selectAllFiltered ? (
            <Button variant="outline" size="sm" onClick={onExportQRCodes}>
              <Download className="mr-2 h-4 w-4" />
              Export QR Codes ({selectAllFiltered ? totalRecords : selectedProductIds.size})
            </Button>
          ) : null}
        </div>

        {/* Select all filtered prompt */}
        {selectAllFiltered && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-muted/50 rounded-md text-sm">
            <span>All {totalRecords} products are selected.</span>
            <button
              type="button"
              className="text-primary underline hover:no-underline"
              onClick={() => {
                onSelectAllFiltered(false)
                onSelectionChange(new Set())
              }}
            >
              Clear selection
            </button>
          </div>
        )}
        {!selectAllFiltered && allCurrentPageSelected && totalRecords > filteredProducts.length && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 bg-muted/50 rounded-md text-sm">
            <span>All {filteredProducts.length} products on this page are selected.</span>
            <button
              type="button"
              className="text-primary underline hover:no-underline"
              onClick={() => onSelectAllFiltered(true)}
            >
              Select all {totalRecords} products
            </button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectAllFiltered
                        ? true
                        : selectedOnCurrentPage.length === 0
                          ? false
                          : allCurrentPageSelected
                            ? true
                            : "indeterminate"
                    }
                    onCheckedChange={(checked) => {
                      if (selectAllFiltered) {
                        onSelectAllFiltered(false)
                        onSelectionChange(new Set())
                        return
                      }
                      if (checked) {
                        const next = new Set(selectedProductIds)
                        currentPageIds.forEach((id) => next.add(id))
                        onSelectionChange(next)
                      } else {
                        const next = new Set(selectedProductIds)
                        currentPageIds.forEach((id) => next.delete(id))
                        onSelectionChange(next)
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectAllFiltered || selectedProductIds.has(product.id)}
                      onCheckedChange={(checked) => {
                        if (selectAllFiltered) {
                          onSelectAllFiltered(false)
                          const next = new Set(currentPageIds)
                          next.delete(product.id)
                          onSelectionChange(next)
                          return
                        }
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
                  <TableCell>
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(product.image, '_blank')}
                          title="Click to preview image"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {formatDate(product.created_at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category?.name || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {product.variants && product.variants.length > 0
                      ? formatMoney(parseFloat(product.variants[0].price) || 0)
                      : formatMoney(product.price || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 flex-wrap">
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          {product.variants.slice(0, 2).map((variant) => (
                            <Badge key={variant.id} variant="outline" className="text-xs">
                              {variant.title || 'Variant'}
                            </Badge>
                          ))}
                          {product.variants.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.variants.length - 2}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No variants
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(product.status) as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                          | 'outline'
                      }
                    >
                      {toTitleCase(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.updated_at, 'MMM D, YYYY h:mm A')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleQRClick(product)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setEditingPreviewUrl({
                              productId: product.id,
                              value: product.preview_url || '',
                            })
                          }
                        >
                          <Link className="mr-2 h-4 w-4" />
                          {product.preview_url ? 'Edit Preview URL' : 'Set Preview URL'}
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
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={onPageChange}
          />
        </div>

        {/* QR Modal */}
        <ProductQRModal
          open={qrModalState.open}
          onOpenChange={handleQRModalClose}
          product={qrModalState.product}
        />

        {/* Preview URL Edit Dialog */}
        {editingPreviewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
              <h3 className="text-lg font-semibold">Preview URL</h3>
              <p className="text-sm text-muted-foreground">
                Set a custom URL to use for QR codes instead of the generated scan URL.
              </p>
              <Input
                value={editingPreviewUrl.value}
                onChange={(e) =>
                  setEditingPreviewUrl({ ...editingPreviewUrl, value: e.target.value })
                }
                placeholder="https://example.com/products/my-product"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingPreviewUrl(null)}
                  disabled={updatePreviewUrlMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    updatePreviewUrlMutation.mutate({
                      productId: editingPreviewUrl.productId,
                      previewUrl: editingPreviewUrl.value,
                    })
                  }
                  disabled={updatePreviewUrlMutation.isPending}
                >
                  {updatePreviewUrlMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
