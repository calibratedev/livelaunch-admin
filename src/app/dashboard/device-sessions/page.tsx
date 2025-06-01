"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import DeviceSessionsStats from "@/components/device-sessions/device-sessions-stats";
import DeviceSessionsTable from "@/components/device-sessions/device-sessions-table";

export default function DeviceSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const {
    data: deviceSessions,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: api.paginateDeviceSessions.getQueryKey({
      keyword: debouncedSearchTerm,
      page: 1,
      limit: 10,
    }),
    queryFn: () =>
      api.paginateDeviceSessions<
        AppTypes.PaginatedResponse<AppTypes.DeviceSession>
      >({
        keyword: debouncedSearchTerm,
        page: 1,
        limit: 10,
      }),
    select: (data) => data?.data,
  });

  useEffect(() => {
    if (!isLoading && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isLoading, isFirstLoad]);

  const isSearching =
    !isFirstLoad && isFetching && debouncedSearchTerm !== searchTerm;

  if (isLoading && isFirstLoad) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            Error loading device sessions: {error.message}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Device Sessions
            </h1>
            <p className="text-muted-foreground">
              Monitor and view all device sessions on your platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <DeviceSessionsStats deviceSessions={deviceSessions} />

        {/* Table */}
        <DeviceSessionsTable
          deviceSessions={deviceSessions}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          isSearching={isSearching}
        />
      </div>
    </DashboardLayout>
  );
}
