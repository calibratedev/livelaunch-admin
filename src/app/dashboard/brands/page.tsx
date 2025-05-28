"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import DashboardLayout from "@/components/dashboard-layout";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  Upload,
  Image,
  Palette,
} from "lucide-react";
import api from "@/lib/api";
import { queryKeys } from "@/lib/api/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

// Zod schema for brand validation
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  shopify_shop_name: z
    .string()
    .min(1, "Shopify shop name is required")
    .min(3, "Shop name must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9-]+$/,
      "Shop name must contain only letters, numbers, and hyphens"
    ),
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, "Please enter a valid hex color (e.g., #FF5733)"),
  get_started_image_attachment: z.instanceof(File).nullable().optional(),
  logo_image_attachment: z.instanceof(File).nullable().optional(),
  background_image_attachment: z.instanceof(File).nullable().optional(),
  frame_image_attachment: z.instanceof(File).nullable().optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const {
    data: brands,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.brands,
    queryFn: () =>
      api.paginateBrands<AppTypes.PaginatedResponse<AppTypes.Brand>>(),
    select: (data) => data?.data,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState("");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      email: "",
      shopify_shop_name: "",
      primary_color: "#000000",
      get_started_image_attachment: null,
      logo_image_attachment: null,
      background_image_attachment: null,
      frame_image_attachment: null,
    },
  });

  // Watch shopify shop name for domain preview
  const shopifyShopName = watch("shopify_shop_name");

  // Update domain when shop name changes
  useEffect(() => {
    if (shopifyShopName) {
      setShopifyDomain(`${shopifyShopName}.myshopify.com`);
    } else {
      setShopifyDomain("");
    }
  }, [shopifyShopName]);

  // Mutations for brand operations
  const createBrandMutation = useMutation({
    mutationFn: (brandData: FormData) => {
      return api.createBrand<AppTypes.Brand>(brandData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands });
      reset();
      setShopifyDomain("");
      setIsCreateDialogOpen(false);
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => api.deleteBrand({ brand_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands });
    },
  });

  const onSubmit = (data: BrandFormData) => {
    // Create FormData for file uploads
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("shopify_shop_name", data.shopify_shop_name);
    formData.append("shopify_domain", shopifyDomain);
    formData.append("primary_color", data.primary_color);

    if (data.get_started_image_attachment) {
      formData.append(
        "get_started_image_attachment",
        data.get_started_image_attachment
      );
    }
    if (data.logo_image_attachment) {
      formData.append("logo_image_attachment", data.logo_image_attachment);
    }
    if (data.background_image_attachment) {
      formData.append(
        "background_image_attachment",
        data.background_image_attachment
      );
    }
    if (data.frame_image_attachment) {
      formData.append("frame_image_attachment", data.frame_image_attachment);
    }

    console.log("**** formData", formData);

    createBrandMutation.mutate(formData);
  };

  const handleDeleteBrand = (id: string) => {
    deleteBrandMutation.mutate(id);
  };

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
          <p className="text-red-500">Error loading brands: {error.message}</p>
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
              Brand Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all brands on your platform
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
                <DialogDescription>
                  Create a new brand profile with complete setup including
                  Shopify integration and branding assets.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 py-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Brand Name *</Label>
                        <Input
                          id="name"
                          {...register("name")}
                          placeholder="Enter brand name"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          placeholder="contact@brand.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        <p className="text-xs text-muted-foreground">
                          This should match the Shopify store owner&apos;s email
                        </p>
                        {errors.email && (
                          <p className="text-sm text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shopify Integration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Shopify Integration</h3>

                    <div className="space-y-2">
                      <Label htmlFor="shopify_shop_name">
                        Shopify Shop Name *
                      </Label>
                      <Input
                        id="shopify_shop_name"
                        {...register("shopify_shop_name")}
                        placeholder="joe-live-launch"
                        className={
                          errors.shopify_shop_name ? "border-red-500" : ""
                        }
                      />
                      {shopifyDomain && (
                        <p className="text-sm text-primary">
                          Shopify Domain: <strong>{shopifyDomain}</strong>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Enter your Shopify store name. We&apos;ll verify if this
                        store exists.
                      </p>
                      {errors.shopify_shop_name && (
                        <p className="text-sm text-red-500">
                          {errors.shopify_shop_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Brand Styling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Brand Styling</h3>

                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Color *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary_color"
                          type="color"
                          {...register("primary_color")}
                          className="w-16 h-10 p-1 border rounded-md"
                        />
                        <Input
                          {...register("primary_color")}
                          placeholder="#000000"
                          className={`flex-1 ${
                            errors.primary_color ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.primary_color && (
                        <p className="text-sm text-red-500">
                          {errors.primary_color.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Image Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Brand Assets</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="logo_image_attachment">
                          Logo Image
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            id="logo_image_attachment"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setValue("logo_image_attachment", file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="logo_image_attachment"
                            className="cursor-pointer"
                          >
                            <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {watch("logo_image_attachment")?.name ||
                                "Click to upload logo"}
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Get Started Image Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="get_started_image_attachment">
                          Get Started Image
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            id="get_started_image_attachment"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setValue("get_started_image_attachment", file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="get_started_image_attachment"
                            className="cursor-pointer"
                          >
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {watch("get_started_image_attachment")?.name ||
                                "Click to upload image"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 1024x1366 (iPad ratio)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Background Image Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="background_image_attachment">
                          Background Image
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            id="background_image_attachment"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setValue("background_image_attachment", file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="background_image_attachment"
                            className="cursor-pointer"
                          >
                            <Palette className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {watch("background_image_attachment")?.name ||
                                "Click to upload background"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 1024x1366 (iPad ratio)
                            </p>
                          </label>
                        </div>
                      </div>

                      {/* Frame Image Upload */}
                      <div className="space-y-2">
                        <Label htmlFor="frame_image_attachment">
                          Frame Image
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                          <input
                            id="frame_image_attachment"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setValue("frame_image_attachment", file);
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="frame_image_attachment"
                            className="cursor-pointer"
                          >
                            <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">
                              {watch("frame_image_attachment")?.name ||
                                "Click to upload frame"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Recommended: 1024x1366 (iPad ratio)
                            </p>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || createBrandMutation.isPending}
                  >
                    {(isSubmitting || createBrandMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Brand
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Brands
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brands?.total_record}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                With Shopify
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brands?.records?.filter((b) => b.shopify_id).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Connected to Shopify
              </p>
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
              <div className="text-2xl font-bold">
                {brands?.records?.filter((b) => b.has_fetched_products).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Have fetched products
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Domains Set</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brands?.records?.filter((b) => b.domain).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Have custom domain
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>All Brands</CardTitle>
            <CardDescription>
              A list of all brands registered on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
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
                    <TableHead>Brand</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Shopify Store</TableHead>
                    <TableHead>Products Fetched</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands?.records?.map((brand) => (
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
                        <Badge
                          variant={brand.shopify_id ? "default" : "secondary"}
                        >
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
                      <TableCell>
                        {new Date(brand.created_at).toLocaleDateString()}
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
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Brand
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Brand
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the brand and all
                                    associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBrand(brand.id)}
                                    disabled={deleteBrandMutation.isPending}
                                  >
                                    {deleteBrandMutation.isPending && (
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
      </div>
    </DashboardLayout>
  );
}
