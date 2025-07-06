'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import ProductsTable from '@/components/products/products-table'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const {
    data: products,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: api.paginateProducts.getQueryKey({
      keyword: debouncedSearchTerm,
      page: currentPage,
      limit: 10,
    }),
    queryFn: () =>
      api.paginateProducts<AppTypes.PaginatedResponse<AppTypes.Product>>({
        keyword: debouncedSearchTerm,
        page: currentPage,
        limit: 10,
      }),
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
      />
    </div>
  )
}
