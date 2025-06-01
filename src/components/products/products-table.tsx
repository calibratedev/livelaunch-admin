import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";

interface ProductsTableProps {
  products?: AppTypes.PaginatedResponse<AppTypes.Product>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onDeleteProduct: (id: string) => void;
  isDeleting: boolean;
  isSearching?: boolean;
}

export default function ProductsTable({
  products,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onDeleteProduct,
  isDeleting,
  isSearching,
}: ProductsTableProps) {
  // Get unique categories and statuses from actual data
  const uniqueCategories = [
    "All",
    ...new Set(products?.records?.map((p) => p.category).filter(Boolean) || []),
  ];
  const uniqueStatuses = [
    "All",
    ...new Set(products?.records?.map((p) => p.status).filter(Boolean) || []),
  ];

  const filteredProducts =
    products?.records?.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "All" || product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "pending":
        return "outline";
      case "archived":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Products</CardTitle>
        <CardDescription>
          A list of all products across all brands on your platform
        </CardDescription>
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
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {uniqueStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Created:{" "}
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.brand?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category || "N/A"}</Badge>
                  </TableCell>
                  <TableCell>${product.price || 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusColor(product.status) as
                          | "default"
                          | "secondary"
                          | "destructive"
                          | "outline"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.handle || "N/A"}</TableCell>
                  <TableCell>{product.product_type || "N/A"}</TableCell>
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Product
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the product and all
                                associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteProduct(product.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
  );
}
