'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Info } from 'lucide-react'

import type { TimeSlot, TimeSlotInsert, TimeSlotUpdate } from '@/lib/types/database'

interface InlineTimeSlotFormProps {
  eventId: string
  eventStartDatetime: string
  eventEndDatetime: string
  slot?: TimeSlot | null
  onSave: (slot: TimeSlotInsert | TimeSlotUpdate) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function InlineTimeSlotForm({
  eventId,
  eventStartDatetime,
  eventEndDatetime,
  slot,
  onSave,
  onCancel,
  isLoading = false,
}: InlineTimeSlotFormProps) {
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

  const formatEventTime = (datetime: string) => {
    return new Date(datetime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

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
    e.stopPropagation()

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Event Time Bounds Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-blue-300">
          <p>
            Time slots must be within the event bounds:
          </p>
          <p className="text-blue-400 font-medium mt-1">
            {formatEventTime(eventStartDatetime)} - {formatEventTime(eventEndDatetime)}
          </p>
        </div>
      </div>

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
          rows={2}
          className="bg-white/5 border-white/10"
          disabled={isLoading}
        />
      </div>

      {/* Date/Time Row */}
      <div className="grid sm:grid-cols-2 gap-4">
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
        </div>
      </div>

      {/* Capacity & Price */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slotCapacity">Capacity (Optional)</Label>
          <Input
            id="slotCapacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Leave empty for unlimited"
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
            placeholder="Leave empty for free"
            className="bg-white/5 border-white/10"
            disabled={isLoading}
          />
          {errors.price && (
            <p className="text-red-400 text-sm">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
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
  )
}
