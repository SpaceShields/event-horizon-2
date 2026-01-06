'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  isCustomImageUrl,
  extractStoragePath,
  deleteCustomImage,
} from '@/lib/storage-helpers'

interface DeleteEventButtonProps {
  eventId: string
  eventTitle: string
  /** Optional image URL - if provided and is a custom upload, will be deleted */
  imageUrl?: string | null
}

export function DeleteEventButton({
  eventId,
  eventTitle,
  imageUrl,
}: DeleteEventButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`
      )
    ) {
      return
    }

    setLoading(true)

    try {
      // If the event has a custom uploaded image, delete it from storage first
      if (imageUrl && isCustomImageUrl(imageUrl)) {
        const storagePath = extractStoragePath(imageUrl)
        if (storagePath) {
          try {
            await deleteCustomImage(supabase, storagePath)
          } catch (err) {
            // Log but don't fail the event deletion if image cleanup fails
            console.error('Failed to delete custom image:', err)
          }
        }
      }

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) {
        throw error
      }

      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      alert(`Error deleting event: ${message}`)
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-400 hover:text-red-300"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  )
}
