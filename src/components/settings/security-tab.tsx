'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Shield, Settings, Eye, EyeOff, Check, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import Api from '@/lib/api'
import { toast } from 'sonner'

// Password validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(11, 'Password must be more than 10 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one symbol'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

// Password validation checker component
function PasswordValidationChecker({ password }: { password: string }) {
  const validations = [
    { rule: 'More than 10 characters', check: password.length > 10 },
    { rule: 'Contains uppercase letter', check: /[A-Z]/.test(password) },
    { rule: 'Contains number', check: /[0-9]/.test(password) },
    { rule: 'Contains symbol', check: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <div className="mt-2 space-y-1">
      {validations.map((validation, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          {validation.check ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <X className="h-3 w-3 text-red-500" />
          )}
          <span className={validation.check ? 'text-green-600' : 'text-red-600'}>
            {validation.rule}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SecurityTab() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = form
  const newPassword = watch('newPassword')
  const currentPassword = watch('currentPassword')

  const updatePasswordMutation = useMutation({
    mutationKey: Api.updateMePassword.getQueryKey(),
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      const response = await Api.updateMePassword(data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Password updated!')
      reset()
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update password')
    },
  })

  const onSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      current_password: data.currentPassword,
      new_password: data.newPassword,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  {...register('currentPassword')}
                  placeholder="Enter current password"
                  className={errors.currentPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  placeholder="Enter new password"
                  className={errors.newPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
              )}
              {newPassword && newPassword !== currentPassword && (
                <PasswordValidationChecker password={newPassword} />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={!isValid || updatePasswordMutation.isPending}>
                <Shield className="mr-2 h-4 w-4" />
                {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">
                Use an authenticator app to generate verification codes
              </p>
            </div>
            <Badge variant="outline">Not Enabled</Badge>
          </div>
          <Separator className="my-4" />
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure 2FA
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
