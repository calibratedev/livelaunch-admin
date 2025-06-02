import { useRef, useState, useEffect } from 'react'
import { Label } from './ui/label'
import { Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import { getAttachmentUrl, getAttachmentFileName } from '@/lib/attachment'

// Add this new component for drag and drop file upload
export const DragDropFileUpload = ({
  id,
  label,
  currentFile,
  onFileChange,
  accept = 'image/*',
  icon: Icon = ImageIcon,
  description,
  showRemoveButton = true,
}: {
  id: string
  label: string
  currentFile?: AppTypes.AttachmentFile | null
  onFileChange: (file: File | null) => void
  accept?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  description?: string
  showRemoveButton?: boolean
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create preview URL when file changes
  useEffect(() => {
    console.log('currentFile:', currentFile) // Debug log

    if (currentFile) {
      if (currentFile instanceof File && currentFile?.type?.startsWith('image/')) {
        const url = URL.createObjectURL(currentFile as File)
        console.log('File URL created:', url) // Debug log
        setPreviewUrl(url)

        // Cleanup URL on unmount or file change
        return () => {
          URL.revokeObjectURL(url)
        }
      } else {
        const url = getAttachmentUrl(currentFile as AppTypes.Attachment)
        console.log('Attachment URL:', url) // Debug log
        setPreviewUrl(url)
      }
    } else {
      console.log('No current file, setting previewUrl to null') // Debug log
      setPreviewUrl(undefined)
    }
  }, [currentFile])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        onFileChange(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onFileChange(file)
  }

  const handleClick = (e: React.MouseEvent) => {
    // If clicking on preview image, open in new tab
    if (previewUrl && (e.target as HTMLElement).tagName === 'IMG') {
      e.stopPropagation()
      window.open(previewUrl, '_blank')
      return
    }

    // Otherwise, trigger file input
    fileInputRef.current?.click()
  }

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFileChange(null)
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 min-h-[200px] flex flex-col justify-center ${
          isDragOver
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-2">
            <div className="relative inline-block max-w-full">
              <div
                className="relative cursor-pointer hover:opacity-80 transition-opacity h-48 w-full max-w-md mx-auto"
                onClick={handlePreviewClick}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={400}
                  height={300}
                  className="object-contain rounded border w-full h-48"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    console.error('Image failed to load:', e)
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully')
                  }}
                />
              </div>
              {showRemoveButton && (
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors duration-200 shadow-md z-10"
                  title="Remove image"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">{getAttachmentFileName(currentFile)}</p>
            <p className="text-xs text-muted-foreground">
              Click image to view full size in new tab
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <Icon
              className={`mx-auto h-8 w-8 mb-2 ${isDragOver ? 'text-primary' : 'text-gray-400'}`}
            />
            <p className={`text-sm ${isDragOver ? 'text-primary font-medium' : 'text-gray-600'}`}>
              {isDragOver
                ? 'Drop image here'
                : `Click to upload ${label.toLowerCase()} or drag and drop`}
            </p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {isDragOver && (
              <p className="text-xs text-primary mt-1 font-medium">Release to upload</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
