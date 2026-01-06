'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { validateImageFile, uploadCustomImage } from '@/lib/storage-helpers'
import { STORAGE_CONFIG } from '@/lib/types/storage'

interface CustomImageUploadProps {
  /** Currently uploaded image URL */
  uploadedImageUrl: string | null
  /** Path of the uploaded image (for cleanup) */
  uploadedImagePath: string | null
  /** Callback when upload succeeds */
  onUploadSuccess: (url: string, path: string) => void
  /** Callback when upload fails or is cleared */
  onUploadError: (error: string | null) => void
  /** Callback when image is cleared */
  onClear: () => void
  /** Optional className for the container */
  className?: string
}

type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error'

export function CustomImageUpload({
  uploadedImageUrl,
  uploadedImagePath: _uploadedImagePath,
  onUploadSuccess,
  onUploadError,
  onClear,
  className,
}: CustomImageUploadProps) {
  // Note: uploadedImagePath is received for potential future use in cleanup
  void _uploadedImagePath
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeMB = STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)

  const handleFile = useCallback(
    async (file: File) => {
      // Reset state
      setErrorMessage(null)
      setUploadProgress(0)

      // Validate file
      setUploadState('validating')
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file')
        setUploadState('error')
        onUploadError(validation.error || 'Invalid file')
        return
      }

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Get user and upload
      setUploadState('uploading')
      try {
        const supabase = createClient()

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error('You must be logged in to upload images')
        }

        // Simulate progress (actual upload doesn't provide progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 100)

        // Upload the file
        const result = await uploadCustomImage(supabase, file, user.id)

        clearInterval(progressInterval)
        setUploadProgress(100)

        // Clean up preview URL
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(null)

        setUploadState('success')
        onUploadSuccess(result.url, result.path)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Upload failed. Please try again.'
        setErrorMessage(message)
        setUploadState('error')
        onUploadError(message)

        // Clean up preview URL on error
        URL.revokeObjectURL(objectUrl)
        setPreviewUrl(null)
      }
    },
    [onUploadSuccess, onUploadError]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClear = () => {
    setUploadState('idle')
    setErrorMessage(null)
    setUploadProgress(0)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    onClear()
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Show uploaded image
  if (uploadedImageUrl && uploadState !== 'uploading') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5">
          <div className="relative aspect-video">
            <Image
              src={uploadedImageUrl}
              alt="Uploaded event image"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="bg-green-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleClear}
              className="h-6 w-6 rounded-full"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Custom image uploaded successfully
        </p>
      </div>
    )
  }

  // Show preview during upload
  if (previewUrl && uploadState === 'uploading') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="relative rounded-lg overflow-hidden border border-white/10 bg-white/5">
          <div className="relative aspect-video">
            <Image
              src={previewUrl}
              alt="Upload preview"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover opacity-50"
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
            <p className="text-white text-sm mb-2">Uploading...</p>
            <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload custom image"
      />
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center py-10 px-6 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10',
          uploadState === 'error' && 'border-red-500/50 bg-red-500/10'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        {uploadState === 'error' ? (
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        ) : (
          <Upload
            className={cn(
              'w-10 h-10 mb-3 transition-colors',
              isDragging ? 'text-blue-400' : 'text-gray-400'
            )}
          />
        )}
        <p className="text-sm text-center">
          {isDragging ? (
            <span className="text-blue-400 font-medium">Drop your image here</span>
          ) : (
            <>
              <span className="text-white font-medium">Click to upload</span>
              <span className="text-gray-400"> or drag and drop</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, GIF, WebP up to {maxSizeMB}MB
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}
