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
  DollarSign,
  ShoppingCart,
  Activity,
  Calendar,
} from 'lucide-react'
import { getFullName } from '@/lib/text'

const statsCards = [
  {
    title: 'Total Users',
    value: '2,543',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    title: 'Active Brands',
    value: '156',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Building2,
  },
  {
    title: 'Total Products',
    value: '1,249',
    change: '+23%',
    changeType: 'positive' as const,
    icon: Package,
  },
  {
    title: 'Revenue',
    value: '$45,239',
    change: '+15%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
]

const recentBrands = [
  {
    id: 1,
    name: 'TechFlow Inc',
    status: 'active',
    products: 23,
    joinedDate: '2024-01-15',
    revenue: '$12,450',
  },
  {
    id: 2,
    name: 'Creative Studio',
    status: 'pending',
    products: 8,
    joinedDate: '2024-01-20',
    revenue: '$3,200',
  },
  {
    id: 3,
    name: 'Fashion Forward',
    status: 'active',
    products: 45,
    joinedDate: '2024-01-10',
    revenue: '$8,900',
  },
  {
    id: 4,
    name: 'Food & Co',
    status: 'active',
    products: 12,
    joinedDate: '2024-01-25',
    revenue: '$5,600',
  },
]

const recentProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    brand: 'TechFlow Inc',
    category: 'Electronics',
    price: '$99.99',
    status: 'active',
  },
  {
    id: 2,
    name: 'Coffee Mug',
    brand: 'Creative Studio',
    category: 'Lifestyle',
    price: '$19.99',
    status: 'draft',
  },
  {
    id: 3,
    name: 'Running Shoes',
    brand: 'Fashion Forward',
    category: 'Fashion',
    price: '$129.99',
    status: 'active',
  },
  {
    id: 4,
    name: 'Organic Coffee Beans',
    brand: 'Food & Co',
    category: 'Food',
    price: '$24.99',
    status: 'active',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back{getFullName(user) || ''}! Here&apos;s what&apos;s happening with your
          platform.
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
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {card.change}
                </span>{' '}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    New brand &ldquo;TechFlow Inc&rdquo; registered
                  </p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">New</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Product &ldquo;Wireless Headphones&rdquo; approved
                  </p>
                  <p className="text-sm text-muted-foreground">4 hours ago</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge>Approved</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Monthly revenue report generated
                  </p>
                  <p className="text-sm text-muted-foreground">1 day ago</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="outline">Report</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>This month&apos;s performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Active Sessions</span>
                </div>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Orders Today</span>
                </div>
                <span className="font-medium">89</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Pending Reviews</span>
                </div>
                <span className="font-medium">12</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="brands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="brands">Recent Brands</TabsTrigger>
          <TabsTrigger value="products">Recent Products</TabsTrigger>
        </TabsList>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Brands</CardTitle>
              <CardDescription>Latest brands that joined your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Joined Date</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium">{brand.name}</TableCell>
                      <TableCell>
                        <Badge variant={brand.status === 'active' ? 'default' : 'secondary'}>
                          {brand.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{brand.products}</TableCell>
                      <TableCell>{brand.joinedDate}</TableCell>
                      <TableCell>{brand.revenue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Latest products added to the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
