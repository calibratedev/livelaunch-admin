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
import { Download, Loader2, AlertCircle } from 'lucide-react'
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

  // Generate brand link mutation
  const generateBrandLinkMutation = useMutation({
    mutationFn: async (productId: string) => {
      // Replace with your actual API endpoint for generating brand links
      return await api.generateProductScanUrl<string>({
        product_id: productId,
      })
    },
    onSuccess: (response) => {
      setQrCodeDataUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
          response.data,
        )}`,
      )
      toast.success('Scan URL generated!')
    },
    onError: (error) => {
      console.error('Failed to generate brand link:', error)
      toast.error('Failed to generate brand link')
    },
  })
  // Generate QR code when modal opens and has valid branch link
  useEffect(() => {
    if (product) {
      generateBrandLinkMutation.mutate(product.id)
    }
  }, [product])

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
    // setQrCodeDataUrl('')
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
            {/* // No valid branch link */}
            <div className="space-y-4">
              {!!qrCodeDataUrl ? (
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
              ) : generateBrandLinkMutation.isPending ? (
                <div className="flex flex-col items-center space-y-2 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No valid scan URL found</span>
                </div>
              )}
            </div>
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
