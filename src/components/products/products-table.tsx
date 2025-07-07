import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MoreHorizontal, Eye, Loader2, QrCode } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { toTitleCase } from '@/lib/text'
import { formatMoney } from '@/lib/money'
import { useState } from 'react'
import { ProductQRModal } from './product-qr-modal'
import { Pagination } from '@/components/ui/pagination'

interface ProductsTableProps {
  products?: AppTypes.PaginatedResponse<AppTypes.Product>
  searchTerm: string
  onSearchChange: (value: string) => void
  isSearching?: boolean
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}

export default function ProductsTable({
  products,
  searchTerm,
  onSearchChange,
  isSearching,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: ProductsTableProps) {
  const [qrModalState, setQrModalState] = useState<{
    open: boolean
    product?: AppTypes.Product
  }>({
    open: false,
    product: undefined,
  })

  const filteredProducts =
    products?.records?.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    }) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'archived':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleQRClick = (product: AppTypes.Product) => {
    setQrModalState({
      open: true,
      product,
    })
  }

  const handleQRModalClose = () => {
    setQrModalState({
      open: false,
      product: undefined,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Products</CardTitle>
        <CardDescription>A list of all products across all brands on your platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
            {isSearching && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(product.image, '_blank')}
                          title="Click to preview image"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Created: {formatDate(product.created_at)}
                      </div>
                    </div>
                  </TableCell>
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
                    <div className="flex items-center gap-1 flex-wrap">
                      {product.variants && product.variants.length > 0 ? (
                        <>
                          {product.variants.slice(0, 2).map((variant) => (
                            <Badge key={variant.id} variant="outline" className="text-xs">
                              {variant.title || 'Variant'}
                            </Badge>
                          ))}
                          {product.variants.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.variants.length - 2}
                            </Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No variants
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(product.status) as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                          | 'outline'
                      }
                    >
                      {toTitleCase(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.updated_at, 'MMM D, YYYY h:mm A')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleQRClick(product)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          QR Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={onPageChange}
          />
        </div>

        {/* QR Modal */}
        <ProductQRModal
          open={qrModalState.open}
          onOpenChange={handleQRModalClose}
          product={qrModalState.product}
        />
      </CardContent>
    </Card>
  )
}
