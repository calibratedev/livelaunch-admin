'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BarChart3,
  Building2,
  LogOut,
  Menu,
  Package,
  Settings,
  User,
  Users,
  Monitor,
  Smartphone,
  ScanLine,
} from 'lucide-react'
import Link from 'next/link'
import { getFullName, getInitials, toTitleCase } from '@/lib/text'
import { getAttachmentUrl } from '@/lib/attachment'
import { formatDate } from '@/lib/date'
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query'
import Api from '@/lib/api'
import { deleteCookie } from 'cookies-next/client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: BarChart3 },
  { name: 'Brand Management', href: '/dashboard/brands', icon: Building2 },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Scans', href: '/dashboard/scans', icon: ScanLine },
  {
    name: 'Device Sessions',
    href: '/dashboard/device-sessions',
    icon: Monitor,
  },
  {
    name: 'Brand Device Sessions',
    href: '/dashboard/brand-device-sessions',
    icon: Smartphone,
  },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const logoutMutation = useMutation({
    mutationFn: () => Api.logout(),
    onSuccess: () => {
      deleteCookie('token')
      router.replace('/login')
    },
  })

  const Sidebar = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center px-6 py-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8">
            <Image src="/logo.png" alt="LiveLaunch" width={32} height={32} />
          </div>
          <span className="text-xl font-bold">LiveLaunch</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button key={item.name} asChild variant={isActive ? 'default' : 'ghost'}>
              <Link
                href={item.href}
                className="w-full justify-start"
                onClick={() => {
                  setSidebarOpen(false)
                }}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          )
        })}
      </nav>
      {process.env.BUILD_DATE && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(process.env.BUILD_DATE, 'MMM DD, HH:mm')}
            </p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden sm:flex">
                <Users className="w-3 h-3 mr-1" />
                {toTitleCase(user?.role)}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="cursor-pointer relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getAttachmentUrl(user?.avatar)} alt="Admin" />
                      <AvatarFallback>
                        {getInitials(user?.first_name, user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getFullName(user)}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@livelaunch.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
