import { useState } from 'react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Edit, Trash2, Eye, Search, Loader2, Link, Check } from 'lucide-react'
import { formatDate } from '@/lib/date'
import { DeleteBrandDialog } from './delete-brand-dialog'
import { Pagination } from '@/components/ui/pagination'
import api from '@/lib/api'
import { toast } from 'sonner'

interface BrandsTableProps {
  brands: AppTypes.Brand[]
  onEditBrand: (brand: AppTypes.Brand) => void
  onDeleteBrand: (id: string) => void
  isDeleting: boolean
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  isSearching?: boolean
  // Pagination props
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  onPageChange: (page: number) => void
}

export function BrandsTable({
  brands,
  onEditBrand,
  onDeleteBrand,
  isDeleting,
  searchTerm,
  isSearching,
  setSearchTerm,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: BrandsTableProps) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean
    brand?: AppTypes.Brand
  }>({
    open: false,
    brand: undefined,
  })

  const [copiedBrandId, setCopiedBrandId] = useState<string | null>(null)
  const [generatingOAuthId, setGeneratingOAuthId] = useState<string | null>(null)

  const filteredBrands = brands?.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteClick = (brand: AppTypes.Brand) => {
    setDeleteDialogState({
      open: true,
      brand,
    })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogState.brand) {
      onDeleteBrand(deleteDialogState.brand.id)
      setDeleteDialogState({ open: false, brand: undefined })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogState({ open: false, brand: undefined })
  }

  const handleCopyOAuthUrl = async (brand: AppTypes.Brand) => {
    try {
      setGeneratingOAuthId(brand.id)

      console.log('brand', brand)
      // Make API call to generate OAuth URL on server
      const response = await api.getShopifyOauthUrl<{ url: string }>({
        brand_id: brand.id,
      })

      const oauthUrl = response.data.url
      await navigator.clipboard.writeText(oauthUrl)
      setCopiedBrandId(brand.id)

      setCopiedBrandId(null)
      toast.success('OAuth URL copied to clipboard')
    } catch (err) {
      console.error('Failed to generate or copy OAuth URL:', err)
      toast.error('Failed to generate or copy OAuth URL')
      // You might want to show a toast notification here for error feedback
    } finally {
      setGeneratingOAuthId(null)
    }
  }

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableHead>Brand</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Instagram Handles</TableHead>
              <TableHead>Shopify Store</TableHead>
              <TableHead>Products Fetched</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands?.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{brand.name}</div>
                    <div className="text-sm text-muted-foreground">{brand.email}</div>
                  </div>
                </TableCell>
                <TableCell>{brand.domain || brand.shopify_domain || 'N/A'}</TableCell>
                <TableCell>
                  {brand.instagram_handles && brand.instagram_handles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {brand.instagram_handles.map((handle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          @{handle}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No handles</span>
                  )}
                </TableCell>
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
                <TableCell>{formatDate(brand.updated_at)}</TableCell>
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
                      <DropdownMenuItem onClick={() => onEditBrand(brand)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Brand
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleCopyOAuthUrl(brand)}
                        disabled={generatingOAuthId === brand.id}
                        className="text-blue-600"
                      >
                        {generatingOAuthId === brand.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : copiedBrandId === brand.id ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Link className="mr-2 h-4 w-4" />
                        )}
                        {generatingOAuthId === brand.id
                          ? 'Generating...'
                          : copiedBrandId === brand.id
                          ? 'Copied!'
                          : 'Copy OAuth URL'}
                      </DropdownMenuItem>
                      <div className="px-2 py-1">
                        <p className="text-xs text-muted-foreground">
                          Generate secure integration URL for brand authorization
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(brand)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Brand
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

      {/* Delete Dialog */}
      <DeleteBrandDialog
        open={deleteDialogState.open}
        brand={deleteDialogState.brand}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </>
  )
}
