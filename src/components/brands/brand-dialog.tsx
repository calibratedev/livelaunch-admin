'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Image, Palette, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { DragDropFileUpload } from '@/components/drag-drop-file-upload'
import { uploadFile } from '@/lib/api/upload'
import Link from 'next/link'

// Zod schema for brand validation
const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').trim(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  shopify_shop_name: z
    .string()
    .min(1, 'Shopify shop name is required')
    .min(3, 'Shop name must be at least 3 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Shop name must contain only letters, numbers, and hyphens'),
  primary_color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Please enter a valid hex color (e.g., #FF5733)'),
  get_started_image_attachment: z.any().nullable().optional(),
  logo_image_attachment: z.any().nullable().optional(),
  background_image_attachment: z.any().nullable().optional(),
  frame_image_attachment: z.any().nullable().optional(),
})

type BrandFormData = z.infer<typeof brandSchema>

interface BrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  brand?: AppTypes.Brand
  onSuccess?: () => void
}

export function BrandDialog({ open, onOpenChange, mode, brand, onSuccess }: BrandDialogProps) {
  const queryClient = useQueryClient()
  const [shopifyDomain, setShopifyDomain] = useState('')

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
      name: '',
      email: '',
      shopify_shop_name: '',
      primary_color: '#000000',
      get_started_image_attachment: null,
      logo_image_attachment: null,
      background_image_attachment: null,
      frame_image_attachment: null,
    },
  })

  // Watch shopify shop name for domain preview
  const shopifyShopName = watch('shopify_shop_name')

  // Update form when brand data changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && brand) {
      const shopifyShopName = brand.shopify_domain?.replace('.myshopify.com', '') || ''
      reset({
        name: brand.name || '',
        email: brand.email || '',
        shopify_shop_name: shopifyShopName,
        primary_color: brand.primary_color || '#000000',
        get_started_image_attachment: brand.get_started_image_attachment,
        logo_image_attachment: brand.logo_image_attachment,
        background_image_attachment: brand.background_image_attachment,
        frame_image_attachment: brand.frame_image_attachment,
      })
    } else if (mode === 'create') {
      reset({
        name: '',
        email: '',
        shopify_shop_name: '',
        primary_color: '#000000',
        get_started_image_attachment: null,
        logo_image_attachment: null,
        background_image_attachment: null,
        frame_image_attachment: null,
      })
    }
  }, [mode, brand, reset])

  // Update domain when shop name changes
  useEffect(() => {
    if (shopifyShopName) {
      setShopifyDomain(`${shopifyShopName}.myshopify.com`)
    } else {
      setShopifyDomain('')
    }
  }, [shopifyShopName])

  // Helper function to handle file uploads
  const handleFileUpload = async (file: File): Promise<AppTypes.Attachment> => {
    try {
      const resp = await uploadFile(file, 'brand')
      return resp.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // Create brand mutation
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      // Handle file uploads
      const processedData = { ...brandData }

      if (brandData.get_started_image_attachment instanceof File) {
        processedData.get_started_image_attachment = await handleFileUpload(
          brandData.get_started_image_attachment,
        )
      }

      if (brandData.logo_image_attachment instanceof File) {
        processedData.logo_image_attachment = await handleFileUpload(
          brandData.logo_image_attachment,
        )
      }

      if (brandData.background_image_attachment instanceof File) {
        processedData.background_image_attachment = await handleFileUpload(
          brandData.background_image_attachment,
        )
      }

      if (brandData.frame_image_attachment instanceof File) {
        processedData.frame_image_attachment = await handleFileUpload(
          brandData.frame_image_attachment,
        )
      }

      return await api.createBrand<AppTypes.Brand>({
        ...processedData,
        shopify_domain: shopifyDomain,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.paginateBrands.getQueryKey(),
      })
      handleClose()
      onSuccess?.()
    },
  })

  // Update brand mutation
  const updateBrandMutation = useMutation({
    mutationFn: async (brandData: BrandFormData) => {
      if (!brand?.id) throw new Error('Brand ID is required for update')

      // Handle file uploads
      const processedData = { ...brandData }

      if (brandData.get_started_image_attachment instanceof File) {
        processedData.get_started_image_attachment = await handleFileUpload(
          brandData.get_started_image_attachment,
        )
      }

      if (brandData.logo_image_attachment instanceof File) {
        processedData.logo_image_attachment = await handleFileUpload(
          brandData.logo_image_attachment,
        )
      }

      if (brandData.background_image_attachment instanceof File) {
        processedData.background_image_attachment = await handleFileUpload(
          brandData.background_image_attachment,
        )
      }

      if (brandData.frame_image_attachment instanceof File) {
        processedData.frame_image_attachment = await handleFileUpload(
          brandData.frame_image_attachment,
        )
      }

      console.log('*** processedData', processedData)
      return await api.updateBrand<AppTypes.Brand>({
        ...processedData,
        brand_id: brand.id,
        shopify_domain: shopifyDomain,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.paginateBrands.getQueryKey(),
      })
      handleClose()
      onSuccess?.()
    },
  })

  const onSubmit = (data: BrandFormData) => {
    if (mode === 'create') {
      createBrandMutation.mutate(data)
    } else {
      updateBrandMutation.mutate(data)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
    setShopifyDomain('')
  }

  const isLoading = createBrandMutation.isPending || updateBrandMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Brand' : 'Edit Brand'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new brand profile with complete setup including Shopify integration and branding assets.'
              : 'Update the brand profile including Shopify integration and branding assets.'}
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
                    {...register('name')}
                    placeholder="Enter brand name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="contact@brand.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    This should match the Shopify store owner&apos;s email
                  </p>
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
            </div>

            {/* Shopify Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shopify Integration</h3>

              <div className="space-y-2">
                <Label htmlFor="shopify_shop_name">Shopify Shop Name *</Label>
                <Input
                  id="shopify_shop_name"
                  {...register('shopify_shop_name')}
                  placeholder="joe-live-launch"
                  className={errors.shopify_shop_name ? 'border-red-500' : ''}
                  disabled={mode === 'edit' && !!brand?.shopify_id}
                />
                {shopifyDomain && (
                  <p className="text-sm text-primary">
                    Shopify Domain: <strong>{shopifyDomain}</strong>
                  </p>
                )}
                {mode === 'edit' && brand?.shopify_id ? (
                  <p className="text-xs text-amber-600 font-medium">
                    ⚠️ Shopify shop name cannot be changed once connected.
                    <Link href="mailto:support@livelaunch.io">Contact support</Link> if you need to
                    change this.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Enter your Shopify store name. We&apos;ll verify if this store exists.
                  </p>
                )}
                {errors.shopify_shop_name && (
                  <p className="text-sm text-red-500">{errors.shopify_shop_name.message}</p>
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
                    {...register('primary_color')}
                    className="w-16 h-10 p-1 border rounded-md"
                  />
                  <Input
                    {...register('primary_color')}
                    placeholder="#000000"
                    className={`flex-1 ${errors.primary_color ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.primary_color && (
                  <p className="text-sm text-red-500">{errors.primary_color.message}</p>
                )}
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand Assets</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Logo Upload */}
                <DragDropFileUpload
                  id="logo_image_attachment"
                  label="Logo Image"
                  currentFile={watch('logo_image_attachment')}
                  onFileChange={(file) => setValue('logo_image_attachment', file)}
                  icon={Image}
                />

                {/* Get Started Image Upload */}
                <DragDropFileUpload
                  id="get_started_image_attachment"
                  label="Get Started Image"
                  currentFile={watch('get_started_image_attachment')}
                  onFileChange={(file) => setValue('get_started_image_attachment', file)}
                  icon={Upload}
                  description="Recommended: 1024x1366 (iPad ratio)"
                />

                {/* Background Image Upload */}
                <DragDropFileUpload
                  id="background_image_attachment"
                  label="Background Image"
                  currentFile={watch('background_image_attachment')}
                  onFileChange={(file) => setValue('background_image_attachment', file)}
                  icon={Palette}
                  description="Recommended: 1024x1366 (iPad ratio)"
                />

                {/* Frame Image Upload */}
                <DragDropFileUpload
                  id="frame_image_attachment"
                  label="Frame Image"
                  currentFile={watch('frame_image_attachment')}
                  onFileChange={(file) => setValue('frame_image_attachment', file)}
                  icon={Image}
                  description="Recommended: 1024x1366 (iPad ratio)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create Brand' : 'Update Brand'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
