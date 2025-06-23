import React, { useState } from 'react'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import TiktokIcon from '../../../public/tiktok.svg'
import InstagramIcon from '../../../public/instagram.svg'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { env } from '@/env'

type FormData = {
  account_id: string
  account_name: string
  access_token: string
}
export default function SocialAccountTab() {
  const [showInstagramDialog, setShowInstagramDialog] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(
      z.object({
        account_id: z.string().min(1, 'Account ID is required'),
        account_name: z.string().min(1, 'Account Name is required'),
        access_token: z.string().min(1, 'Access Token is required'),
      }),
    ),
    defaultValues: {
      account_id: '',
      account_name: '',
      access_token: '',
    },
  })
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async (): Promise<AppTypes.SocialAccount[]> => {
      const resp = await api.getSocialAccounts<AppTypes.Records<AppTypes.SocialAccount>>()

      return resp.data.records
    },
  })
  const { mutate: connectInstagram, isPending: isConnecting } = useMutation({
    mutationFn: async (data: FormData) => {
      return await api.createSocialAccount({ ...data, platform: 'instagram' })
    },
    onSuccess: () => {
      toast.success('Instagram account connected successfully')
      setShowInstagramDialog(false)
      reset()
      refetch()
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to connect Instagram account')
    },
  })
  const { mutate: disconnectPlatform, isPending: isDisconnecting } = useMutation({
    mutationFn: async (platform: string) => {
      return await api.removeSocialAccount({ platform })
    },
    onSuccess: (_, platform) => {
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account is removed`)
      setShowInstagramDialog(false)
      reset()
      refetch()
    },
    onError: (error: unknown, platform: string) => {
      toast.error(error instanceof Error ? error.message : `Failed to remove ${platform} account`)
    },
  })

  const socialAccounts = ['instagram', 'tiktok'].map((item) => {
    const account = data?.find((acc) => acc.platform === item)
    return {
      platform: item,
      icon: item === 'instagram' ? InstagramIcon : TiktokIcon,
      connected: !!account,
      connectedAccount: account?.account_name || null,
    }
  })

  // Handle Instagram connect
  const onSubmit = (formData: FormData) => {
    connectInstagram(formData)
  }
  const handleCloseDialog = (value: boolean) => {
    setShowInstagramDialog(value)
    reset()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Social Accounts</h2>
      <p className="text-sm text-muted-foreground">Connect your social media accounts</p>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isError ? (
        <p className="text-sm">Can not load social accounts</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {socialAccounts.map((account) => (
            <div
              key={account.platform}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center space-x-3">
                <Image src={account.icon} alt={account.platform} />
                <span className="font-medium">
                  {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                </span>
                <Badge
                  variant={account.connected ? 'default' : 'secondary'}
                  className="flex items-center space-x-1"
                >
                  {account.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                  <span>{account.connected ? 'Connected' : 'Not Connected'}</span>
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                {account.connectedAccount && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {account.connectedAccount}
                  </span>
                )}
                {account.connected ? (
                  <Button
                    size="sm"
                    onClick={() => disconnectPlatform(account.platform)}
                    disabled={isDisconnecting}
                  >
                    Disconnect
                  </Button>
                ) : account.platform === 'instagram' ? (
                  <Button
                    size="sm"
                    onClick={() => setShowInstagramDialog(true)}
                    disabled={isConnecting}
                  >
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" asChild>
                    <a href={`${env.NEXT_PUBLIC_API_URL}/api/oauth/tiktok`}>Connect</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instagram Connect Dialog */}
      <Dialog open={showInstagramDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Connect Instagram Account</DialogTitle>
            </DialogHeader>
            <div>
              <Input
                placeholder="Account ID"
                {...register('account_id')}
                className={errors.account_id ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.account_id && (
                <p className="mt-1 text-xs text-red-500">{errors.account_id.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Account Name"
                {...register('account_name')}
                className={errors.account_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.account_name && (
                <p className="mt-1 text-xs text-red-500">{errors.account_name.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Access Token"
                {...register('access_token')}
                className={errors.access_token ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.access_token && (
                <p className="mt-1 text-xs text-red-500">{errors.access_token.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isConnecting}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
