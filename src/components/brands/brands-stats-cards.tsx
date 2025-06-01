import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, DollarSign, Package } from "lucide-react";

interface BrandsStatsCardsProps {
  brands?: AppTypes.PaginatedResponse<AppTypes.Brand>;
}

export function BrandsStatsCards({ brands }: BrandsStatsCardsProps) {
  const totalBrands = brands?.total_record || 0;
  const brandsWithShopify =
    brands?.records?.filter((b) => b.shopify_id).length || 0;
  const brandsWithFetchedProducts =
    brands?.records?.filter((b) => b.has_fetched_products).length || 0;
  const brandsWithDomains =
    brands?.records?.filter((b) => b.domain).length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBrands}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">With Shopify</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{brandsWithShopify}</div>
          <p className="text-xs text-muted-foreground">Connected to Shopify</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Fetched Products
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{brandsWithFetchedProducts}</div>
          <p className="text-xs text-muted-foreground">Have fetched products</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Domains Set</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{brandsWithDomains}</div>
          <p className="text-xs text-muted-foreground">Have custom domain</p>
        </CardContent>
      </Card>
    </div>
  );
}
