'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X } from 'lucide-react'

import type { TimeSlot, TimeSlotInsert, TimeSlotUpdate } from '@/lib/types/database'

interface TimeSlotFormProps {
  eventId: string
  eventStartDatetime: string
  eventEndDatetime: string
  slot?: TimeSlot | null
  onSave: (slot: TimeSlotInsert | TimeSlotUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function TimeSlotForm({
  eventId,
  eventStartDatetime,
  eventEndDatetime,
  slot,
  onSave,
  onCancel,
  isLoading = false,
}: TimeSlotFormProps) {
  const [title, setTitle] = useState(slot?.title || '')
  const [description, setDescription] = useState(slot?.description || '')
  const [startDatetime, setStartDatetime] = useState(
    slot?.start_datetime ? slot.start_datetime.slice(0, 16) : ''
  )
  const [endDatetime, setEndDatetime] = useState(
    slot?.end_datetime ? slot.end_datetime.slice(0, 16) : ''
  )
  const [capacity, setCapacity] = useState(slot?.capacity?.toString() || '')
  const [price, setPrice] = useState(slot?.price?.toString() || '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Format event bounds for datetime-local input
  const eventStartLocal = eventStartDatetime.slice(0, 16)
  const eventEndLocal = eventEndDatetime.slice(0, 16)

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!startDatetime) {
      newErrors.startDatetime = 'Start date and time is required'
    }

    if (!endDatetime) {
      newErrors.endDatetime = 'End date and time is required'
    }

    if (startDatetime && endDatetime) {
      const start = new Date(startDatetime)
      const end = new Date(endDatetime)
      const eventStart = new Date(eventStartDatetime)
      const eventEnd = new Date(eventEndDatetime)

      if (start >= end) {
        newErrors.endDatetime = 'End time must be after start time'
      }

      if (start < eventStart) {
        newErrors.startDatetime = 'Slot cannot start before the event starts'
      }

      if (end > eventEnd) {
        newErrors.endDatetime = 'Slot cannot end after the event ends'
      }
    }

    if (capacity && (parseInt(capacity) <= 0 || isNaN(parseInt(capacity)))) {
      newErrors.capacity = 'Capacity must be a positive number'
    }

    if (price && (parseFloat(price) < 0 || isNaN(parseFloat(price)))) {
      newErrors.price = 'Price must be zero or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const slotData: TimeSlotInsert | TimeSlotUpdate = {
      event_id: eventId,
      title: title.trim(),
      description: description.trim() || null,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: new Date(endDatetime).toISOString(),
      capacity: capacity ? parseInt(capacity) : null,
      price: price ? parseFloat(price) : null,
    }

    if (slot?.id) {
      (slotData as TimeSlotUpdate).id = slot.id
    }

    await onSave(slotData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">
            {slot ? 'Edit Time Slot' : 'Add Time Slot'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="slotTitle">Title *</Label>
            <Input
              id="slotTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Session, Networking Hour"
              className="bg-white/5 border-white/10"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-400 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="slotDescription">Description (Optional)</Label>
            <Textarea
              id="slotDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happens during this time slot..."
              rows={3}
              className="bg-white/5 border-white/10"
              disabled={isLoading}
            />
          </div>

          {/* Start DateTime */}
          <div className="space-y-2">
            <Label htmlFor="slotStartDatetime">Start Date & Time *</Label>
            <Input
              id="slotStartDatetime"
              type="datetime-local"
              value={startDatetime}
              onChange={(e) => setStartDatetime(e.target.value)}
              min={eventStartLocal}
              max={eventEndLocal}
              className="bg-white/5 border-white/10"
              disabled={isLoading}
            />
            {errors.startDatetime && (
              <p className="text-red-400 text-sm">{errors.startDatetime}</p>
            )}
            <p className="text-gray-500 text-xs">
              Event starts: {new Date(eventStartDatetime).toLocaleString()}
            </p>
          </div>

          {/* End DateTime */}
          <div className="space-y-2">
            <Label htmlFor="slotEndDatetime">End Date & Time *</Label>
            <Input
              id="slotEndDatetime"
              type="datetime-local"
              value={endDatetime}
              onChange={(e) => setEndDatetime(e.target.value)}
              min={startDatetime || eventStartLocal}
              max={eventEndLocal}
              className="bg-white/5 border-white/10"
              disabled={isLoading}
            />
            {errors.endDatetime && (
              <p className="text-red-400 text-sm">{errors.endDatetime}</p>
            )}
            <p className="text-gray-500 text-xs">
              Event ends: {new Date(eventEndDatetime).toLocaleString()}
            </p>
          </div>

          {/* Capacity & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotCapacity">Capacity (Optional)</Label>
              <Input
                id="slotCapacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Unlimited"
                className="bg-white/5 border-white/10"
                disabled={isLoading}
              />
              {errors.capacity && (
                <p className="text-red-400 text-sm">{errors.capacity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slotPrice">Price (Optional)</Label>
              <Input
                id="slotPrice"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Free"
                className="bg-white/5 border-white/10"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : slot ? 'Update Slot' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
