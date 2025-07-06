'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import api, { ApiResponse } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/use-debounce'
import DeviceSessionsTable from '@/components/device-sessions/device-sessions-table'

export default function DeviceSessionsPage() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const queryKey = api.paginateDeviceSessions.getQueryKey({
    keyword: debouncedSearchTerm,
    page: currentPage,
    limit: 10,
  })

  const {
    data: deviceSessions,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey,
    queryFn: () =>
      api.paginateDeviceSessions<AppTypes.PaginatedResponse<AppTypes.DeviceSession>>({
        keyword: debouncedSearchTerm,
        page: 1,
        limit: 10,
      }),
    select: (data) => data?.data,
  })

  const { mutate: deleteDeviceSession, isPending: isDeleting } = useMutation({
    mutationFn: (deviceSessionId: string) =>
      api.deleteDeviceSession<AppTypes.DeviceSession>({
        device_session_id: deviceSessionId,
      }),
    onSuccess: (data, deviceSessionId) => {
      queryClient.setQueryData(
        queryKey,
        (oldData: ApiResponse<AppTypes.PaginatedResponse<AppTypes.DeviceSession>>) => {
          if (!oldData) {
            queryClient.invalidateQueries({ queryKey })
            return oldData
          }
          return {
            ...(oldData || {}),
            data: {
              ...oldData.data,
              records: oldData.data.records.filter((session) => session.id !== deviceSessionId),
              total_page: Math.ceil((oldData.data.total_record - 1) / 10),
              total_record: oldData.data.total_record - 1,
            },
          } satisfies ApiResponse<AppTypes.PaginatedResponse<AppTypes.DeviceSession>>
        },
      )
    },
  })

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false)
    }
  }, [isLoading, isFirstLoad])

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
        <p className="text-red-500">Error loading device sessions: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Sessions</h1>
          <p className="text-muted-foreground">
            Monitor and view all device sessions on your platform
          </p>
        </div>
      </div>

      {/* Table */}
      <DeviceSessionsTable
        deviceSessions={deviceSessions}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isSearching={isSearching}
        onDeleteSession={deleteDeviceSession}
        isDeleting={isDeleting}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
