"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Building2,
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  Globe,
  Smartphone,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery } from "@tanstack/react-query";

export default function BrandDeviceSessionsPage() {
  const {
    data: brandDeviceSessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.brandDeviceSessions,
    queryFn: () =>
      api.paginateBrandDeviceSessions<
        AppTypes.PaginatedResponse<AppTypes.BrandDeviceSession>
      >(),
    select: (data) => data?.data,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = brandDeviceSessions?.records?.filter(
    (session) =>
      session.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.app_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.region_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
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
            Error loading brand device sessions: {error.message}
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
              Brand Device Sessions
            </h1>
            <p className="text-muted-foreground">
              Monitor and view all brand device sessions on your platform
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brandDeviceSessions?.total_record}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Brands
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(brandDeviceSessions?.records?.map((s) => s.brand_id))
                    .size
                }
              </div>
              <p className="text-xs text-muted-foreground">Different brands</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Devices
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(brandDeviceSessions?.records?.map((s) => s.device_id))
                    .size
                }
              </div>
              <p className="text-xs text-muted-foreground">Different devices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(
                    brandDeviceSessions?.records
                      ?.filter((s) => s.region_code)
                      .map((s) => s.region_code)
                  ).size
                }
              </div>
              <p className="text-xs text-muted-foreground">Different regions</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Brand Device Sessions</CardTitle>
            <CardDescription>
              A list of all brand device sessions on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Info</TableHead>
                    <TableHead>App & Platform</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions?.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {session.device_name || "Unknown Device"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.device_id?.substring(0, 16)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {session.app_name || "N/A"} v
                            {session.app_version || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.app_platform || "Unknown"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {session.region_code || "N/A"}
                          </div>
                          {session.latitude && session.longitude && (
                            <div className="text-sm text-muted-foreground">
                              {session.latitude.toFixed(2)},{" "}
                              {session.longitude.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {session.ip_address || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {session.timezone || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(
                          session.created_at * 1000
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
