'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Save, User } from 'lucide-react'
import { DragDropFileUpload } from '@/components/drag-drop-file-upload'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/providers/auth'
import { toTitleCase } from '@/lib/text'
import { useEffect } from 'react'
import { toast } from 'sonner'

// Define the form schema
const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  avatar: z.any().nullable().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileTab() {
  const { user, updateMe } = useAuth()
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email,
      avatar: user?.avatar,
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar: user.avatar,
      })
    }
  }, [form, user])

  const { handleSubmit, watch, setValue } = form
  const watchedAvatar = watch('avatar')

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateMe({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        avatar: data.avatar,
      })
      toast.success('Profile updated ')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    }
  }

  const handleAvatarChange = (file: File | null) => {
    setValue('avatar', file, { shouldValidate: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and contact details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <DragDropFileUpload
                  id="avatar"
                  label="Profile Picture"
                  currentFile={watchedAvatar}
                  onFileChange={handleAvatarChange}
                  accept="image/*"
                  icon={User}
                  description="Upload a profile picture (JPG, PNG, GIF, WEBP)"
                  showRemoveButton={true}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{toTitleCase(user?.role || '')}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button loading={form.formState.isSubmitting} type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
