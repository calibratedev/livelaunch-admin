'use client'

import { useState, useEffect } from 'react'
import { Loader2, Upload } from 'lucide-react'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import ProductsTable from '@/components/products/products-table'
import { CSVImportDialog } from '@/components/products/csv-import-dialog'
import { QRExportDialog } from '@/components/products/qr-export-dialog'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['active'])
  const [importOpen, setImportOpen] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [selectAllFiltered, setSelectAllFiltered] = useState(false)
  const [qrExportOpen, setQrExportOpen] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: brandsData } = useQuery({
    queryKey: api.paginateBrands.getQueryKey({ page: 1, limit: 100 }),
    queryFn: () => api.paginateBrands<AppTypes.PaginatedResponse<AppTypes.Brand>>({ page: 1, limit: 100 }),
    select: (data) => data?.data,
  })

  const brands = brandsData?.records || []

  const queryParams: Record<string, unknown> = {
    keyword: debouncedSearchTerm,
    page: currentPage,
    limit: 10,
    include_count: true,
  }
  if (selectedBrandIds.length > 0) {
    queryParams.brand_ids = selectedBrandIds.join(',')
  }
  if (selectedStatuses.length > 0) {
    queryParams.statuses = selectedStatuses.join(',')
  }

  const {
    data: products,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: api.paginateProducts.getQueryKey(queryParams),
    queryFn: () => api.paginateProducts<AppTypes.PaginatedResponse<AppTypes.Product>>(queryParams),
    select: (data) => data?.data,
  })

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedProductIds(new Set())
    setSelectAllFiltered(false)
  }, [debouncedSearchTerm, selectedBrandIds, selectedStatuses])

  const isSearching = !isFirstLoad && isFetching && debouncedSearchTerm !== searchTerm

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isLoading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading products: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all products across your platform
          </p>
        </div>
        <Button onClick={() => setImportOpen(true)} variant="outline">
          <Upload className="h-4 w-4 mr-2" /> Import CSV
        </Button>
      </div>

      {/* Table */}
      <ProductsTable
        products={products}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearching={isSearching}
        currentPage={currentPage}
        totalPages={products?.total_page || 1}
        hasNext={products?.has_next || false}
        hasPrev={products?.has_prev || false}
        onPageChange={handlePageChange}
        brands={brands}
        selectedBrandIds={selectedBrandIds}
        onBrandFilterChange={setSelectedBrandIds}
        selectedStatuses={selectedStatuses}
        onStatusFilterChange={setSelectedStatuses}
        selectedProductIds={selectedProductIds}
        onSelectionChange={setSelectedProductIds}
        onExportQRCodes={() => setQrExportOpen(true)}
        selectAllFiltered={selectAllFiltered}
        onSelectAllFiltered={setSelectAllFiltered}
        totalRecords={products?.total_record || 0}
      />

      <CSVImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        brands={brands}
      />

      <QRExportDialog
        open={qrExportOpen}
        onOpenChange={setQrExportOpen}
        selectedProductIds={Array.from(selectedProductIds)}
        onComplete={() => {
          setSelectedProductIds(new Set())
        }}
        selectAllFiltered={selectAllFiltered}
        totalRecords={products?.total_record || 0}
        currentFilters={{
          brand_ids: selectedBrandIds.join(','),
          statuses: selectedStatuses.join(','),
          keyword: debouncedSearchTerm,
        }}
      />
    </div>
  )
}
