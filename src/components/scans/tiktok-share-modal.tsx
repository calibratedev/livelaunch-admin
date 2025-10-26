'use client'

import { useImperativeHandle, useState, forwardRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

// TikTok username validation schema
const tiktokUsernameSchema = z.object({
  tiktok_username: z
    .string()
    .min(1, 'TikTok username is required')
    .refine(
      (val) => {
        const trimmed = val.trim()

        // Reject if starts with @
        if (trimmed.startsWith('@')) {
          return false
        }

        // Check length (TikTok usernames are max 24 characters)
        if (trimmed.length > 24) {
          return false
        }

        // Check minimum length
        if (trimmed.length < 1) {
          return false
        }

        // Check pattern: letters, numbers, underscores, and periods
        // Cannot start or end with period or have consecutive periods
        if (!/^[a-zA-Z0-9_]([a-zA-Z0-9_]|\.(?!\.))*[a-zA-Z0-9_]$/.test(trimmed)) {
          return false
        }

        return true
      },
      (val) => {
        const trimmed = val.trim()

        // Check for @ symbol first
        if (trimmed.startsWith('@')) {
          return { message: 'TikTok username should not start with @. Enter the username only.' }
        }

        if (trimmed.length > 24) {
          return { message: 'TikTok username must be 24 characters or less' }
        }

        if (trimmed.length < 1) {
          return { message: 'TikTok username is required' }
        }

        if (!/^[a-zA-Z0-9_]([a-zA-Z0-9_]|\.(?!\.))*[a-zA-Z0-9_]$/.test(trimmed)) {
          return {
            message:
              'TikTok username can only contain letters, numbers, underscores, and periods. Cannot start or end with a period or have consecutive periods.',
          }
        }

        return { message: '' }
      },
    ),
})

type TikTokUsernameFormData = z.infer<typeof tiktokUsernameSchema>

type Options = {
  scan: AppTypes.Scan
  onShare?: (scanId: string, tiktokUsername: string) => Promise<void>
}
export interface TikTokShareModalRef {
  open: (options?: Options) => void
  close: () => void
  isOpen: boolean
}

export const TikTokShareModal = forwardRef<TikTokShareModalRef>((_props, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<Options | null>(null)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TikTokUsernameFormData>({
    resolver: zodResolver(tiktokUsernameSchema),
    defaultValues: {
      tiktok_username: '',
    },
  })

  useImperativeHandle(
    ref,
    () => ({
      open: (options?: Options) => {
        setOptions(options || null)
        reset({ tiktok_username: '' })
        setIsOpen(true)
      },
      close: () => {
        setIsOpen(false)
        setOptions(null)
        reset({ tiktok_username: '' })
      },
      isOpen,
    }),
    [isOpen, reset],
  )

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset({ tiktok_username: '' })
    }
  }, [isOpen, reset])

  const onSubmit = async (data: TikTokUsernameFormData) => {
    if (!options?.scan) {
      toast.error('No scan selected')
      return
    }

    try {
      if (options?.onShare) {
        await options.onShare(options.scan.id, data.tiktok_username.trim())
      } else {
        // Default implementation if no onShare handler provided
        const shareData = {
          scanId: options.scan.id,
          tiktokUsername: data.tiktok_username.trim(),
        }

        console.log('Sharing to TikTok:', shareData)
      }

      toast.success(`Successfully shared to TikTok user: @${data.tiktok_username}`)

      // Close modal and reset
      setIsOpen(false)
      setOptions(null)
      reset({ tiktok_username: '' })
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to share to TikTok')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false)
      setOptions(null)
      reset({ tiktok_username: '' })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share to TikTok</DialogTitle>
          <DialogDescription>Enter the TikTok username to share this scan with</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tiktok_username">TikTok Username</Label>
              <Input
                id="tiktok_username"
                placeholder="username"
                {...register('tiktok_username')}
                className={errors.tiktok_username ? 'border-red-500' : ''}
                autoFocus
                disabled={isSubmitting}
              />
              {errors.tiktok_username && (
                <p className="text-sm text-red-500">{errors.tiktok_username.message}</p>
              )}
            </div>
            {options?.scan && (
              <div className="text-sm text-muted-foreground">
                <p>Scan ID: {options.scan.id}</p>
                <p>Product: {options.scan.product?.title || 'Unknown'}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Sharing...' : 'Share'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
})

TikTokShareModal.displayName = 'TikTokShareModal'
