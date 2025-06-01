import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";

interface ProductsStatsProps {
  products?: AppTypes.PaginatedResponse<AppTypes.Product>;
}

export default function ProductsStats({ products }: ProductsStatsProps) {
  const getTotalValue = () => {
    return (
      products?.records?.reduce((acc, product) => {
        return acc + (product.price || 0);
      }, 0) || 0
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {products?.records?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {products?.records?.filter((p) => p.status === "active").length}{" "}
            active
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">From Shopify</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {products?.records?.filter((p) => p.shopify_id).length || 0}
          </div>
          <p className="text-xs text-muted-foreground">Synced from Shopify</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${getTotalValue().toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Sum of all prices</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Has Images</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {products?.records?.filter((p) => p.image).length || 0}
          </div>
          <p className="text-xs text-muted-foreground">Products with images</p>
        </CardContent>
      </Card>
    </div>
  );
}
