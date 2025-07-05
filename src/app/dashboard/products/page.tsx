'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import ProductsTable from '@/components/products/products-table'

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const queryClient = useQueryClient()
  const {
    data: products,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: api.paginateProducts.getQueryKey({
      keyword: debouncedSearchTerm,
    }),
    queryFn: () =>
      api.paginateProducts<AppTypes.PaginatedResponse<AppTypes.Product>>({
        keyword: debouncedSearchTerm,
        page: 1,
        limit: 10,
      }),
    select: (data) => data?.data,
  })

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  const isSearching = !isFirstLoad && isFetching && debouncedSearchTerm !== searchTerm

  // Mutations for product operations
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.deleteBrandProduct({ product_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.paginateProducts.getQueryKey(),
      })
    },
  })

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id)
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
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onDeleteProduct={handleDeleteProduct}
        isDeleting={deleteProductMutation.isPending}
        isSearching={isSearching}
      />
    </div>
  )
}
