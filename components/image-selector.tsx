'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ImageIcon, Upload, AlertTriangle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { StockImageCarousel } from '@/components/stock-image-carousel'
import { CustomImageUpload } from '@/components/custom-image-upload'
import { createClient } from '@/lib/supabase/client'
import {
  isSupabaseStorageUrl,
  isStockImageUrl,
  isCustomImageUrl,
  deleteCustomImage,
  extractStoragePath,
} from '@/lib/storage-helpers'
import type { ImageSource } from '@/lib/types/storage'

interface ImageSelectorProps {
  /** Initial image URL (for edit mode) */
  initialImageUrl?: string | null
  /** Callback when image selection changes */
  onImageSelected: (url: string | null, path: string | null) => void
  /** Optional className for the container */
  className?: string
}

type MigrationChoice = 'keep' | 'replace' | null

export function ImageSelector({
  initialImageUrl,
  onImageSelected,
  className,
}: ImageSelectorProps) {
  // Determine initial image source based on URL
  const getInitialSource = (): ImageSource => {
    if (!initialImageUrl) return 'stock'
    if (isStockImageUrl(initialImageUrl)) return 'stock'
    if (isCustomImageUrl(initialImageUrl)) return 'custom'
    // External URL - default to stock for replacement
    return 'stock'
  }

  const [imageSource, setImageSource] = useState<ImageSource>(getInitialSource)
  const [selectedStockUrl, setSelectedStockUrl] = useState<string | null>(
    initialImageUrl && isStockImageUrl(initialImageUrl) ? initialImageUrl : null
  )
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(
    initialImageUrl && isCustomImageUrl(initialImageUrl) ? initialImageUrl : null
  )
  const [customImagePath, setCustomImagePath] = useState<string | null>(
    initialImageUrl && isCustomImageUrl(initialImageUrl)
      ? extractStoragePath(initialImageUrl)
      : null
  )
  const [migrationChoice, setMigrationChoice] = useState<MigrationChoice>(null)
  const [pendingUploadPath, setPendingUploadPath] = useState<string | null>(null)

  // Check if the initial URL is an external (non-Supabase) URL
  const isExternalUrl = initialImageUrl
    ? !isSupabaseStorageUrl(initialImageUrl)
    : false

  // Compute the currently selected image URL
  const getCurrentImageUrl = useCallback((): string | null => {
    // If keeping external URL, return it
    if (isExternalUrl && migrationChoice === 'keep') {
      return initialImageUrl || null
    }

    // Return based on selected source
    if (imageSource === 'stock') {
      return selectedStockUrl
    } else {
      return customImageUrl
    }
  }, [
    imageSource,
    selectedStockUrl,
    customImageUrl,
    isExternalUrl,
    migrationChoice,
    initialImageUrl,
  ])

  // Notify parent when selection changes
  useEffect(() => {
    const url = getCurrentImageUrl()
    const path = imageSource === 'custom' ? customImagePath : null
    onImageSelected(url, path)
  }, [
    getCurrentImageUrl,
    customImagePath,
    imageSource,
    onImageSelected,
  ])

  // Handle stock image selection
  const handleStockSelect = (_name: string, url: string) => {
    setSelectedStockUrl(url)
    if (isExternalUrl) {
      setMigrationChoice('replace')
    }
  }

  // Handle custom upload success
  const handleUploadSuccess = (url: string, path: string) => {
    setCustomImageUrl(url)
    setCustomImagePath(path)
    setPendingUploadPath(path)
    if (isExternalUrl) {
      setMigrationChoice('replace')
    }
  }

  // Handle upload error
  const handleUploadError = (error: string | null) => {
    if (error) {
      console.error('Upload error:', error)
    }
  }

  // Handle clear custom image
  const handleClearCustom = async () => {
    // If there's a pending upload that hasn't been submitted, delete it
    if (pendingUploadPath) {
      try {
        const supabase = createClient()
        await deleteCustomImage(supabase, pendingUploadPath)
      } catch (err) {
        console.error('Failed to delete pending upload:', err)
      }
    }
    setCustomImageUrl(null)
    setCustomImagePath(null)
    setPendingUploadPath(null)
  }

  // Handle tab change
  const handleSourceChange = (source: ImageSource) => {
    setImageSource(source)
  }

  // Handle migration choice
  const handleMigrationChoice = (choice: MigrationChoice) => {
    setMigrationChoice(choice)
    if (choice === 'replace') {
      // User wants to replace - keep the current tab active
    }
  }

  // Show migration warning for external URLs
  const showMigrationWarning =
    isExternalUrl && migrationChoice === null

  return (
    <div className={cn('space-y-4', className)}>
      <Label className="text-base">Event Image *</Label>

      {/* Migration warning for external URLs */}
      {showMigrationWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-amber-200">
                This event uses an external image URL. For better reliability and
                performance, we recommend using a stock image or uploading your
                own.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate max-w-[300px]">{initialImageUrl}</span>
              </div>
            </div>
          </div>

          {/* Current external image preview */}
          {initialImageUrl && (
            <div className="relative aspect-video w-48 rounded-lg overflow-hidden border border-white/10">
              <Image
                src={initialImageUrl}
                alt="Current event image"
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMigrationChoice('keep')}
              className="text-gray-300 border-white/20"
            >
              Keep Existing
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleMigrationChoice('replace')}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Choose New Image
            </Button>
          </div>
        </div>
      )}

      {/* Show selector when not in migration warning mode or after choosing to replace */}
      {(!showMigrationWarning || migrationChoice === 'replace') && (
        <>
          {/* Tab navigation */}
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              type="button"
              onClick={() => handleSourceChange('stock')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200',
                imageSource === 'stock'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Stock Images
            </button>
            <button
              type="button"
              onClick={() => handleSourceChange('custom')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200',
                imageSource === 'custom'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
              )}
            >
              <Upload className="w-4 h-4" />
              Upload Custom
            </button>
          </div>

          {/* Content based on selected tab */}
          <div className="min-h-[200px]">
            {imageSource === 'stock' ? (
              <StockImageCarousel
                selectedImageUrl={selectedStockUrl}
                onSelect={handleStockSelect}
              />
            ) : (
              <CustomImageUpload
                uploadedImageUrl={customImageUrl}
                uploadedImagePath={customImagePath}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onClear={handleClearCustom}
              />
            )}
          </div>

          {/* Selected image preview */}
          {getCurrentImageUrl() && (
            <div className="bg-white/5 rounded-lg border border-white/10 p-4">
              <p className="text-sm text-gray-400 mb-3">Selected Image Preview:</p>
              <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-white/10">
                <Image
                  src={getCurrentImageUrl()!}
                  alt="Selected event image"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Show kept external image */}
      {migrationChoice === 'keep' && initialImageUrl && (
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">Keeping existing image:</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMigrationChoice(null)}
              className="text-gray-400 hover:text-white text-xs"
            >
              Change
            </Button>
          </div>
          <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-white/10">
            <Image
              src={initialImageUrl}
              alt="Current event image"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </div>
  )
}
