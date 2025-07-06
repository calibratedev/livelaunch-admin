'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api, { ApiResponse } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import BrandDeviceSessionsTable from '@/components/brand-device-sessions/brand-device-sessions-table'

export default function BrandDeviceSessionsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const queryKey = api.paginateBrandDeviceSessions.getQueryKey({
    keyword: debouncedSearchTerm,
    page: currentPage,
    limit: 10,
  })

  const {
    data: brandDeviceSessions,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey,
    queryFn: () =>
      api.paginateBrandDeviceSessions<AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>>({
        keyword: debouncedSearchTerm,
        page: currentPage,
        limit: 10,
      }),
    select: (data) => data?.data,
  })

  const { mutate: deleteBrandDeviceSession, isPending: isDeleting } = useMutation({
    mutationFn: (sessionId: string) =>
      api.deleteBrandDeviceSession<AppTypes.BrandDeviceSession>({
        session_id: sessionId,
      }),
    onSuccess: (data, sessionId) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: ApiResponse<AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>>) => {
          if (!oldData) {
            queryClient.invalidateQueries({ queryKey })
            return oldData
          }
          return {
            ...(oldData || {}),
            data: {
              ...oldData.data,
              records: oldData.data.records.filter(
                (session: AppTypes.BrandDeviceSession) => session.id !== sessionId,
              ),
              total_page: Math.ceil((oldData.data.total_record - 1) / 10),
              total_record: oldData.data.total_record - 1,
            },
          } satisfies ApiResponse<AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>>
        },
      )
    },
  })

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, searchTerm])

  const isSearching = !isFirstLoad && isFetching && debouncedSearchTerm !== searchTerm

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
        <p className="text-red-500">Error loading brand device sessions: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Device Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and view all brand device sessions on your platform
          </p>
        </div>
      </div>

      {/* Table */}
      <BrandDeviceSessionsTable
        brandDeviceSessions={brandDeviceSessions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDeleteSession={deleteBrandDeviceSession}
        isSearching={isSearching}
        isDeleting={isDeleting}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
