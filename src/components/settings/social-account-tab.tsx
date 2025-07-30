import React from 'react'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import TiktokIcon from '../../../public/tiktok.svg'
import InstagramIcon from '../../../public/instagram.svg'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { env } from '@/env'

export default function SocialAccountTab() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: async (): Promise<AppTypes.SocialAccount[]> => {
      const resp = await api.getSocialAccounts<AppTypes.Records<AppTypes.SocialAccount>>()

      return resp.data.records
    },
  })

  const { mutate: disconnectPlatform, isPending: isDisconnecting } = useMutation({
    mutationFn: async (platform: string) => {
      return await api.removeSocialAccount({ platform })
    },
    onSuccess: (_, platform) => {
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account is removed`)
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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Social Account</h2>
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
                ) : (
                  <Button size="sm" asChild>
                    <a href={`${env.NEXT_PUBLIC_API_URL}/api/oauth/${account.platform}`}>Connect</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
