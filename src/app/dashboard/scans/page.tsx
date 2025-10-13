'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import ScansTable from '@/components/scans/scans-table'
import Api from '@/lib/api'
import { toast } from 'sonner'

export default function ScansPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const queryParams = {
    keyword: debouncedSearchTerm,
    page: currentPage,
    limit: 10,
    include_count: true,
  }
  const queryKey = api.paginateScans.getQueryKey(queryParams)

  const { mutate: syncScan } = useMutation({
    mutationFn: (scan: AppTypes.Scan) => {
      return Api.syncScan<AppTypes.Scan>({
        scan_id: scan.id,
      })
    },
    onSuccess: (data, variables) => {
      toast.success('Scan status synced successfully')
      queryClient.setQueriesData(
        {
          queryKey: queryKey,
          pageParam: currentPage,
        },
        (oldData) => {
          console.log('*** syncScan oldData', oldData)
          if (!oldData) {
            return oldData
          }

          queryClient.setQueryData(
            queryKey,
            (oldData: AppTypes.PaginatedResponse<AppTypes.Scan>) => {
              return {
                ...oldData,
                records: oldData.records.map((record) => {
                  if (record.id === variables.id) {
                    return {
                      ...record,
                      status: data.data.status,
                      asset_attachment: data.data.asset_attachment,
                      thumbnail_attachment: data.data.thumbnail_attachment,
                    }
                  }
                  return record
                }),
              }
            },
          )
        },
      )
    },
    onError: () => {
      toast.error('Failed to sync scan status')
    },
  })

  const queryClient = useQueryClient()
  const {
    data: scans,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey,
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
        currentPage={currentPage}
        totalPages={scans?.total_page || 1}
        hasNext={scans?.has_next || false}
        hasPrev={scans?.has_prev || false}
        onPageChange={handlePageChange}
        onSyncStatus={syncScan}
      />
    </div>
  )
}
