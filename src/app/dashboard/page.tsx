'use client'

import { useAuth } from '@/providers/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Building2,
  Package,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { getFullName, toTitleCase } from '@/lib/text'
import { formatDate } from '@/lib/date'
import { formatMoney } from '@/lib/money'
import api from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

// Define stat interfaces based on what we expect from the API
interface StatResponse {
  total: number
  growth?: number
  growth_type?: 'stable' | 'decrease' | 'increase'
}

export default function DashboardPage() {
  const { user } = useAuth()

  // Stats API calls
  const {
    data: deviceStats,
    isLoading: isLoadingDeviceStats,
    error: deviceStatsError,
  } = useQuery({
    queryKey: api.getDeviceStats.getQueryKey(),
    queryFn: () => api.getDeviceStats<StatResponse>(),
    select: (data) => data?.data,
  })

  const {
    data: sessionStats,
    isLoading: isLoadingSessionStats,
    error: sessionStatsError,
  } = useQuery({
    queryKey: api.getSessionStats.getQueryKey(),
    queryFn: () => api.getSessionStats<StatResponse>(),
    select: (data) => data?.data,
  })

  const {
    data: productStats,
    isLoading: isLoadingProductStats,
    error: productStatsError,
  } = useQuery({
    queryKey: api.getProductStats.getQueryKey(),
    queryFn: () => api.getProductStats<StatResponse>(),
    select: (data) => data?.data,
  })

  const {
    data: brandStats,
    isLoading: isLoadingBrandStats,
    error: brandStatsError,
  } = useQuery({
    queryKey: api.getBrandStats.getQueryKey(),
    queryFn: () => api.getBrandStats<StatResponse>(),
    select: (data) => data?.data,
  })

  // Recent brands API call (get first 10 newest records)
  const {
    data: recentBrands,
    isLoading: isLoadingBrands,
    error: brandsError,
  } = useQuery({
    queryKey: api.paginateBrands.getQueryKey({
      page: 1,
      limit: 10,
      keyword: '',
    }),
    queryFn: () =>
      api.paginateBrands<AppTypes.PaginatedResponse<AppTypes.Brand>>({
        page: 1,
        limit: 10,
        keyword: '',
      }),
    select: (data) => data?.data,
  })

  // Recent products API call (get first 10 newest records)
  const {
    data: recentProducts,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: api.paginateProducts.getQueryKey({
      page: 1,
      limit: 10,
      keyword: '',
    }),
    queryFn: () =>
      api.paginateProducts<AppTypes.PaginatedResponse<AppTypes.Product>>({
        page: 1,
        limit: 10,
        keyword: '',
      }),
    select: (data) => data?.data,
  })

  // Build stats cards from API data
  const statsCards = [
    {
      title: 'Total Devices',
      value: isLoadingDeviceStats ? '...' : deviceStats?.total?.toLocaleString() || '0',
      change: deviceStats?.growth ? `${deviceStats?.growth}%` : 'No change',
      changeType: deviceStats?.growth_type || 'stable',
      icon: Users,
      error: deviceStatsError,
    },
    {
      title: 'Active Brands',
      value: isLoadingBrandStats ? '...' : brandStats?.total?.toLocaleString() || '0',
      change: brandStats?.growth ? `${brandStats?.growth}%` : 'No change',
      changeType: brandStats?.growth_type || 'stable',
      icon: Building2,
      error: brandStatsError,
    },
    {
      title: 'Total Products',
      value: isLoadingProductStats ? '...' : productStats?.total?.toLocaleString() || '0',
      change: productStats?.growth ? `${productStats?.growth}%` : 'No change',
      changeType: productStats?.growth_type || 'stable',
      icon: Package,
      error: productStatsError,
    },
    {
      title: 'Total Sessions',
      value: isLoadingSessionStats ? '...' : sessionStats?.total?.toLocaleString() || '0',
      change: sessionStats?.growth ? `${sessionStats?.growth}%` : 'No change',
      changeType: sessionStats?.growth_type || 'stable',
      icon: DollarSign,
      error: sessionStatsError,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back{getFullName(user) ? `, ${getFullName(user)}` : ''}! Here&apos;s what&apos;s
          happening with your platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.error ? <span className="text-red-500 text-sm">Error</span> : card.value}
              </div>
              {!card.error && (
                <p className="text-xs text-muted-foreground">
                  <span
                    className={`inline-flex items-center ${
                      card.changeType === 'increase'
                        ? 'text-green-600'
                        : card.changeType === 'decrease'
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="mr-1 h-3 w-3" />
                    ) : card.changeType === 'decrease' ? (
                      <TrendingDown className="mr-1 h-3 w-3" />
                    ) : null}
                    {card.change}
                  </span>{' '}
                  from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables */}
      <Tabs defaultValue="brands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brands">Recent Brands</TabsTrigger>
          <TabsTrigger value="products">Recent Products</TabsTrigger>
        </TabsList>
        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Brands</CardTitle>
              <CardDescription>Latest brand registrations and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBrands ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : brandsError ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-red-500">Error loading brands</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Shopify Store</TableHead>
                      <TableHead>Products Fetched</TableHead>
                      <TableHead>Created Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBrands?.records?.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{brand.name}</div>
                            <div className="text-sm text-muted-foreground">{brand.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{brand.domain || brand.shopify_domain || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={brand.shopify_id ? 'default' : 'secondary'}>
                            {brand.shopify_id ? 'Connected' : 'Not connected'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={brand.has_fetched_products ? 'default' : 'secondary'}>
                            {brand.has_fetched_products ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(brand.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Latest product submissions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : productsError ? (
                <div className="flex items-center justify-center h-32">
                  <p className="text-red-500">Error loading products</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentProducts?.records?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.title}</TableCell>
                        <TableCell>{product.brand?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          {product.variants && product.variants.length > 0
                            ? formatMoney(parseFloat(product.variants[0].price) || 0)
                            : formatMoney(product.price || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === 'active'
                                ? 'default'
                                : product.status === 'draft'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {toTitleCase(product.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
