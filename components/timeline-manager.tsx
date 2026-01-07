'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InlineTimeSlotForm } from '@/components/inline-time-slot-form'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

import type { Database } from '@/lib/types/database'
import type { TimeSlotWithStats, TimeSlotInsert, TimeSlotUpdate } from '@/lib/types/database'

type EventRow = Database['public']['Tables']['events']['Row']

interface TimelineManagerProps {
  event: EventRow
  initialSlots: TimeSlotWithStats[]
}

export function TimelineManager({ event, initialSlots }: TimelineManagerProps) {
  const router = useRouter()
  const supabase = createClient()

  const [slots, setSlots] = useState<TimeSlotWithStats[]>(initialSlots)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // UI states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [deletingSlot, setDeletingSlot] = useState<TimeSlotWithStats | null>(null)
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null)

  const fetchSlots = async () => {
    const { data, error: fetchError } = await supabase
      .from('time_slots_with_stats')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
      .order('start_datetime', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setSlots(data || [])
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSaveSlot = async (slotData: TimeSlotInsert | TimeSlotUpdate) => {
    setSaving(true)
    setError(null)

    try {
      if ('id' in slotData && slotData.id) {
        // Update existing slot
        const { error: updateError } = await supabase
          .from('event_time_slots')
          .update({
            title: slotData.title,
            description: slotData.description,
            start_datetime: slotData.start_datetime,
            end_datetime: slotData.end_datetime,
            capacity: slotData.capacity,
            price: slotData.price,
          })
          .eq('id', slotData.id)

        if (updateError) throw updateError
        showSuccess('Time slot updated successfully')
      } else {
        // Insert new slot
        const maxSortOrder = slots.length > 0
          ? Math.max(...slots.map((s) => s.sort_order))
          : -1

        const { error: insertError } = await supabase
          .from('event_time_slots')
          .insert({
            ...slotData,
            sort_order: maxSortOrder + 1,
          } as TimeSlotInsert)

        if (insertError) throw insertError
        showSuccess('Time slot added successfully')
      }

      // Refresh slots list
      await fetchSlots()
      setShowAddForm(false)
      setEditingSlotId(null)
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save time slot'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (slot: TimeSlotWithStats) => {
    setSaving(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('event_time_slots')
        .delete()
        .eq('id', slot.id)

      if (deleteError) throw deleteError

      // Refresh slots list
      await fetchSlots()
      setDeletingSlot(null)
      showSuccess('Time slot deleted successfully')
      router.refresh()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete time slot'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const formatTimeOnly = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDateHeader = (datetime: string) => {
    return new Date(datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Timeline Container */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {/* Event Start Marker */}
        <div className="p-4 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-wide">Event Starts</p>
              <p className="text-white font-semibold">{formatDateHeader(event.start_datetime)}</p>
              <p className="text-gray-400 text-sm">{formatTimeOnly(event.start_datetime)}</p>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          {slots.length > 0 && (
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-blue-500/20 to-purple-500/30" />
          )}

          {/* Time Slots */}
          {slots.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Time Slots Yet</h3>
              <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                Add time slots to allow attendees to register for specific sessions within your event.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {slots.map((slot) => (
                <div key={slot.id} className="relative">
                  {/* Slot Card */}
                  <div className="pl-12 pr-4 py-3">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-gray-800 border-2 border-blue-500/50 z-10" />

                    {/* Slot Content */}
                    {editingSlotId === slot.id ? (
                      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                        <InlineTimeSlotForm
                          eventId={event.id}
                          eventStartDatetime={event.start_datetime}
                          eventEndDatetime={event.end_datetime}
                          slot={slot}
                          onSave={handleSaveSlot}
                          onCancel={() => setEditingSlotId(null)}
                          isLoading={saving}
                        />
                      </div>
                    ) : (
                      <div
                        className={`
                          bg-white/5 border border-white/10 rounded-lg
                          hover:border-white/20 hover:bg-white/[0.07] transition-all
                          ${expandedSlotId === slot.id ? 'border-white/20' : ''}
                        `}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Slot Header */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="font-semibold text-white">{slot.title}</h3>
                                {slot.is_full && (
                                  <Badge variant="destructive" className="text-xs">
                                    Full
                                  </Badge>
                                )}
                                {slot.price !== null && slot.price > 0 && (
                                  <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                    {formatPrice(slot.price)}
                                  </Badge>
                                )}
                              </div>

                              {/* Time Range */}
                              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  {formatTimeOnly(slot.start_datetime)} - {formatTimeOnly(slot.end_datetime)}
                                </span>
                              </div>

                              {/* Capacity */}
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span>
                                  {slot.capacity
                                    ? `${slot.total_attendees} / ${slot.capacity} registered`
                                    : `${slot.total_attendees} registered`}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {slot.description && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedSlotId(
                                    expandedSlotId === slot.id ? null : slot.id
                                  )}
                                  className="text-gray-400"
                                  aria-label={expandedSlotId === slot.id ? 'Collapse' : 'Expand'}
                                >
                                  {expandedSlotId === slot.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSlotId(slot.id)}
                                className="text-gray-400 hover:text-white"
                                aria-label={`Edit ${slot.title}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingSlot(slot)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                aria-label={`Delete ${slot.title}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Description */}
                          {expandedSlotId === slot.id && slot.description && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-sm text-gray-400">{slot.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event End Marker */}
        <div className="p-4 bg-gradient-to-r from-purple-500/20 to-transparent border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-500/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-purple-400 font-medium uppercase tracking-wide">Event Ends</p>
              <p className="text-white font-semibold">{formatDateHeader(event.end_datetime)}</p>
              <p className="text-gray-400 text-sm">{formatTimeOnly(event.end_datetime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Section */}
      {showAddForm ? (
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Time Slot</h3>
          <InlineTimeSlotForm
            eventId={event.id}
            eventStartDatetime={event.start_datetime}
            eventEndDatetime={event.end_datetime}
            onSave={handleSaveSlot}
            onCancel={() => setShowAddForm(false)}
            isLoading={saving}
          />
        </div>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/30 text-gray-400 hover:text-white"
          variant="outline"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Time Slot
        </Button>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingSlot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">Delete Time Slot</h3>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to delete <strong>{deletingSlot.title}</strong>?
            </p>

            {deletingSlot.registration_count > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm">
                  <strong>Warning:</strong> This slot has {deletingSlot.registration_count} registration{deletingSlot.registration_count !== 1 ? 's' : ''}.
                  Deleting it will cancel all registrations for this slot.
                </p>
              </div>
            )}

            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingSlot(null)}
                disabled={saving}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDeleteSlot(deletingSlot)}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Deleting...' : 'Delete Slot'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
