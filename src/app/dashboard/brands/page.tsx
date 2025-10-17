'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BrandDialog } from '@/components/brands/brand-dialog'
import { BrandsTable } from '@/components/brands/brands-table'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'

export default function BrandsPage() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const [dialogState, setDialogState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    brand?: AppTypes.Brand
  }>({
    open: false,
    mode: 'create',
    brand: undefined,
  })

  const queryParams = {
    page: currentPage,
    limit: 10,
    include_count: true,
    keyword: debouncedSearchTerm,
  }

  const {
    data: brands,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: api.paginateBrands.getQueryKey(queryParams),
    queryFn: () => api.paginateBrands<AppTypes.PaginatedResponse<AppTypes.Brand>>(queryParams),
    select: (data) => data?.data,
  })

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const isSearching = !isFirstLoad && isFetching && debouncedSearchTerm !== searchTerm

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => api.deleteBrand({ brand_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.paginateBrands.getQueryKey(),
      })
    },
  })

  const handleDeleteBrand = (id: string) => {
    deleteBrandMutation.mutate(id)
  }

  const handleEditBrand = (brand: AppTypes.Brand) => {
    setDialogState({
      open: true,
      mode: 'edit',
      brand,
    })
  }

  const handleDialogClose = () => {
    setDialogState((prev) => ({ ...prev, open: false }))
  }

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
        <p className="text-red-500">Error loading brands: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Management</h1>
          <p className="text-muted-foreground">Manage and monitor all brands on your platform</p>
        </div>
        {/* <Button onClick={handleCreateBrand}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button> */}
      </div>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>A list of all brands registered on your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <BrandsTable
            brands={brands?.records || []}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
            isDeleting={deleteBrandMutation.isPending}
            isSearching={isSearching}
            // Pagination props
            currentPage={currentPage}
            totalPages={brands?.total_page || 1}
            hasNext={brands?.has_next || false}
            hasPrev={brands?.has_prev || false}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Brand Dialog */}
      <BrandDialog
        open={dialogState.open}
        onOpenChange={handleDialogClose}
        mode={dialogState.mode}
        brand={dialogState.brand}
      />
    </div>
  )
}
