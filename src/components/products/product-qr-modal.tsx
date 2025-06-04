'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'sonner'

interface ProductQRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: AppTypes.Product
}

export function ProductQRModal({ open, onOpenChange, product }: ProductQRModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  // Check if brand_link is valid
  const isValidUrl = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const hasValidBranchLink = product?.branch_link && isValidUrl(product.branch_link)

  // Generate QR Code using a client-side library or API
  const generateQRCode = async (text: string) => {
    setIsGeneratingQR(true)
    try {
      // Using QR Server API (free service) - you can replace with your preferred QR library
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        text,
      )}`

      // Convert to data URL for download functionality
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })

      setQrCodeDataUrl(dataUrl)
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      toast.error('Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  // Generate brand link mutation
  const generateBrandLinkMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Replace with your actual API endpoint for generating brand links
      return await api.generateProductScanUrl<AppTypes.GenerateProductScanUrlResponse>({
        product_id: productId,
      })
    },
    onSuccess: (response) => {
      const brandLink = response.data.link
      generateQRCode(brandLink)
      toast.success('Scan URL generated!')
    },
    onError: (error) => {
      console.error('Failed to generate brand link:', error)
      toast.error('Failed to generate brand link')
    },
  })

  // Generate QR code when modal opens and has valid branch link
  useEffect(() => {
    if (open && product && hasValidBranchLink) {
      generateQRCode(product.branch_link)
    } else if (open) {
      setQrCodeDataUrl('')
    }
  }, [open, product, hasValidBranchLink])

  const handleGenerateBrandLink = () => {
    if (product?.id) {
      generateBrandLinkMutation.mutate(product.id)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.href = qrCodeDataUrl
      link.download = `${product?.title || 'product'}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('QR code downloaded!')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setQrCodeDataUrl('')
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Product QR Code</DialogTitle>
          <DialogDescription>Generate and download QR code for {product.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">{product.brand?.name}</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="text-center space-y-4">
            {hasValidBranchLink ? (
              // Valid branch link exists
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <LinkIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Valid brand link found</span>
                </div>

                {qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="border rounded-lg"
                        width={200}
                        height={200}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground break-all px-4">
                      {product.branch_link}
                    </div>
                  </div>
                ) : isGeneratingQR ? (
                  <div className="flex flex-col items-center space-y-2 py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Generating QR code...</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <Button onClick={() => generateQRCode(product.branch_link)}>
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // No valid branch link
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No valid scan URL found</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Generate a scan URL first to create the QR code
                </p>

                {qrCodeDataUrl ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="border rounded-lg"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateBrandLink}
                    disabled={generateBrandLinkMutation.isPending}
                  >
                    {generateBrandLinkMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Scan URL & QR Code
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {qrCodeDataUrl && (
            <div className="flex justify-center space-x-2">
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
