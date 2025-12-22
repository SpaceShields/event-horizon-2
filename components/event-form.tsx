'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'

interface EventFormProps {
  categories: Array<{ id: number; name: string; slug: string }>
  event?: any
}

export function EventForm({ categories, event }: EventFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [organizationName, setOrganizationName] = useState(event?.organization_name || '')
  const [categoryId, setCategoryId] = useState(event?.category_id?.toString() || '')
  const [locationType, setLocationType] = useState(event?.location_type || 'physical')
  const [address, setAddress] = useState(event?.address || '')
  const [meetingUrl, setMeetingUrl] = useState(event?.meeting_url || '')
  const [startDatetime, setStartDatetime] = useState(
    event?.start_datetime ? event.start_datetime.slice(0, 16) : ''
  )
  const [endDatetime, setEndDatetime] = useState(
    event?.end_datetime ? event.end_datetime.slice(0, 16) : ''
  )
  const [timezone, setTimezone] = useState(event?.timezone || 'UTC')
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || '')
  const [ticketPrice, setTicketPrice] = useState(event?.ticket_price?.toString() || '')
  const [registrationInstructions, setRegistrationInstructions] = useState(
    event?.registration_instructions || ''
  )
  const [imageUrl, setImageUrl] = useState(event?.image_url || '')

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const eventData = {
      title,
      description,
      organization_name: organizationName || null,
      owner_id: user.id,
      category_id: parseInt(categoryId),
      location_type: locationType,
      address: locationType !== 'virtual' ? address : null,
      meeting_url: locationType !== 'physical' ? meetingUrl : null,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: new Date(endDatetime).toISOString(),
      timezone,
      capacity: capacity ? parseInt(capacity) : null,
      ticket_price: ticketPrice ? parseFloat(ticketPrice) : null,
      registration_instructions: registrationInstructions || null,
      image_url: imageUrl || null,
      status,
    }

    let result

    if (event) {
      // Update existing event
      result = await supabase
        .from('events')
        .update(eventData)
        .eq('id', event.id)
        .select()
        .single()
    } else {
      // Create new event
      result = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
    } else {
      router.push(`/events/${result.data.slug}`)
      router.refresh()
    }
  }

  return (
    <form className="space-y-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Mars Rover Workshop"
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={6}
          placeholder="Describe your event..."
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name (Optional)</Label>
        <Input
          id="organizationName"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="NASA, SpaceX, etc."
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="bg-white/5 border-white/10"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Location Type */}
      <div className="space-y-2">
        <Label htmlFor="locationType">Location Type *</Label>
        <Select
          id="locationType"
          value={locationType}
          onChange={(e) => setLocationType(e.target.value as any)}
          required
          className="bg-white/5 border-white/10"
        >
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Hybrid</option>
        </Select>
      </div>

      {/* Address */}
      {locationType !== 'virtual' && (
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required={locationType !== 'virtual'}
            placeholder="123 Space Center Dr, Houston, TX"
            className="bg-white/5 border-white/10"
          />
        </div>
      )}

      {/* Meeting URL */}
      {locationType !== 'physical' && (
        <div className="space-y-2">
          <Label htmlFor="meetingUrl">Meeting URL *</Label>
          <Input
            id="meetingUrl"
            type="url"
            value={meetingUrl}
            onChange={(e) => setMeetingUrl(e.target.value)}
            required={locationType !== 'physical'}
            placeholder="https://zoom.us/j/..."
            className="bg-white/5 border-white/10"
          />
        </div>
      )}

      {/* Date & Time */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDatetime">Start Date & Time *</Label>
          <Input
            id="startDatetime"
            type="datetime-local"
            value={startDatetime}
            onChange={(e) => setStartDatetime(e.target.value)}
            required
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDatetime">End Date & Time *</Label>
          <Input
            id="endDatetime"
            type="datetime-local"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            required
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone *</Label>
        <Input
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
          placeholder="UTC, EST, PST, etc."
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Capacity & Price */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity (Optional)</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Leave empty for unlimited"
            className="bg-white/5 border-white/10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ticketPrice">Ticket Price (Optional)</Label>
          <Input
            id="ticketPrice"
            type="number"
            min="0"
            step="0.01"
            value={ticketPrice}
            onChange={(e) => setTicketPrice(e.target.value)}
            placeholder="0.00 for free"
            className="bg-white/5 border-white/10"
          />
        </div>
      </div>

      {/* Registration Instructions */}
      <div className="space-y-2">
        <Label htmlFor="registrationInstructions">Registration Instructions (Optional)</Label>
        <Textarea
          id="registrationInstructions"
          value={registrationInstructions}
          onChange={(e) => setRegistrationInstructions(e.target.value)}
          rows={3}
          placeholder="Special instructions for attendees..."
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Event Image URL (Optional)</Label>
        <Input
          id="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="bg-white/5 border-white/10"
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, 'draft')}
          variant="outline"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, 'published')}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Publishing...' : event ? 'Update Event' : 'Publish Event'}
        </Button>
      </div>
    </form>
  )
}
