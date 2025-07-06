'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import ScansTable from '@/components/scans/scans-table'

export default function ScansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const {
    data: scans,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: api.paginateScans.getQueryKey({
      keyword: debouncedSearchTerm,
      page: currentPage,
      limit: 10,
    }),
    queryFn: () =>
      api.paginateScans<AppTypes.PaginatedResponse<AppTypes.Scan>>({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scans</h1>
          <p className="text-muted-foreground">
            Monitor and view all product scans on your platform
          </p>
        </div>
      </div>

      {/* Table */}
      <ScansTable
        scans={scans}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearching={isSearching}
        // Pagination props
        currentPage={currentPage}
        totalPages={scans?.total_page || 1}
        hasNext={scans?.has_next || false}
        hasPrev={scans?.has_prev || false}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
