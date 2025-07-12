'use client'

import { User, Shield, Instagram } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const settingsNavigation = [
  {
    name: 'Profile',
    href: '/dashboard/settings',
    icon: User,
  },
  {
    name: 'Security',
    href: '/dashboard/settings/security',
    icon: Shield,
  },
  {
    name: 'Social Accounts',
    href: '/dashboard/settings/social',
    icon: Instagram,
  },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {settingsNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Page Content */}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
