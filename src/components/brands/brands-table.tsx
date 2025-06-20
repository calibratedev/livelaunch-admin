import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/api/date";
import { DeleteBrandDialog } from "./delete-brand-dialog";

interface BrandsTableProps {
  brands: AppTypes.Brand[];
  onEditBrand: (brand: AppTypes.Brand) => void;
  onDeleteBrand: (id: string) => void;
  isDeleting: boolean;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  isSearching?: boolean;
}

export function BrandsTable({
  brands,
  onEditBrand,
  onDeleteBrand,
  isDeleting,
  searchTerm,
  isSearching,
  setSearchTerm,
}: BrandsTableProps) {
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    brand?: AppTypes.Brand;
  }>({
    open: false,
    brand: undefined,
  });

  const filteredBrands = brands?.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (brand: AppTypes.Brand) => {
    setDeleteDialogState({
      open: true,
      brand,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogState.brand) {
      onDeleteBrand(deleteDialogState.brand.id);
      setDeleteDialogState({ open: false, brand: undefined });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogState({ open: false, brand: undefined });
  };

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
              <TableHead>Shopify Store</TableHead>
              <TableHead>Products Fetched</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands?.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{brand.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {brand.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {brand.domain || brand.shopify_domain || "N/A"}
                </TableCell>
                <TableCell>
                  <Badge variant={brand.shopify_id ? "default" : "secondary"}>
                    {brand.shopify_id ? "Connected" : "Not connected"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      brand.has_fetched_products ? "default" : "secondary"
                    }
                  >
                    {brand.has_fetched_products ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(brand.created_at)}</TableCell>
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
                        onClick={() => handleDeleteClick(brand)}
                      >
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

      <DeleteBrandDialog
        open={deleteDialogState.open}
        brand={deleteDialogState.brand}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </>
  );
}
