'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { fetchStockImages } from '@/lib/storage-helpers'
import type { StockImage } from '@/lib/types/storage'

interface StockImageCarouselProps {
  /** Currently selected stock image URL */
  selectedImageUrl: string | null
  /** Callback when a stock image is selected */
  onSelect: (imageName: string, imageUrl: string) => void
  /** Optional className for the container */
  className?: string
}

export function StockImageCarousel({
  selectedImageUrl,
  onSelect,
  className,
}: StockImageCarouselProps) {
  const [images, setImages] = useState<StockImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStockImages() {
      try {
        setLoading(true)
        setError(null)
        const supabase = createClient()
        const stockImages = await fetchStockImages(supabase)
        setImages(stockImages)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load stock images'
        )
      } finally {
        setLoading(false)
      }
    }

    loadStockImages()
  }, [])

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-12 bg-white/5 rounded-lg border border-white/10',
          className
        )}
      >
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-gray-400">Loading stock images...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-8 bg-red-500/10 rounded-lg border border-red-500/30',
          className
        )}
      >
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center py-8 bg-white/5 rounded-lg border border-white/10',
          className
        )}
      >
        <p className="text-gray-400 text-sm">No stock images available</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-sm text-gray-400">
        Select a space-themed image for your event
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((image) => {
          const isSelected = selectedImageUrl === image.url

          return (
            <button
              key={image.name}
              type="button"
              onClick={() => onSelect(image.name, image.url)}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border-2 transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/30 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
              )}
            >
              <Image
                src={image.url}
                alt={image.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover"
              />
              {/* Overlay on hover */}
              <div
                className={cn(
                  'absolute inset-0 bg-black/40 transition-opacity duration-200',
                  isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-50'
                )}
              />
              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1 shadow-lg">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              {/* Image name tooltip on hover */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity duration-200',
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              >
                <p className="text-xs text-white truncate">
                  {image.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
