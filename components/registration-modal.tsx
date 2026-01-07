'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  Clock,
  Users,
  DollarSign,
  Check,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

import type { TimeSlotWithStats } from '@/lib/types/database'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  eventSlug: string
  eventTitle?: string
  eventStartDatetime: string
  eventEndDatetime: string
  hasTimeSlots: boolean
  timeSlots?: TimeSlotWithStats[]
  existingSlotRegistrations?: string[]
  onSuccess: () => void
}

export function RegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventSlug,
  eventTitle,
  eventStartDatetime,
  eventEndDatetime,
  hasTimeSlots,
  timeSlots = [],
  existingSlotRegistrations = [],
  onSuccess,
}: RegistrationModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [loading, setLoading] = useState(false)
  const [guestCount, setGuestCount] = useState(1)
  const [specialNotes, setSpecialNotes] = useState('')
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, loading, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Get available slots (not full and not already registered)
  const availableSlots = useMemo(() => {
    return timeSlots.filter(
      (slot) => !slot.is_full && !existingSlotRegistrations.includes(slot.id)
    )
  }, [timeSlots, existingSlotRegistrations])

  // Calculate total price for selected slots
  const totalPrice = useMemo(() => {
    return timeSlots
      .filter((slot) => selectedSlotIds.includes(slot.id))
      .reduce((sum, slot) => sum + (slot.price || 0), 0)
  }, [timeSlots, selectedSlotIds])

  const handleSlotToggle = (slotId: string) => {
    if (loading) return

    const slot = timeSlots.find((s) => s.id === slotId)
    if (!slot || slot.is_full || existingSlotRegistrations.includes(slotId)) return

    if (selectedSlotIds.includes(slotId)) {
      setSelectedSlotIds(selectedSlotIds.filter((id) => id !== slotId))
    } else {
      setSelectedSlotIds([...selectedSlotIds, slotId])
    }
  }

  const handleSelectAll = () => {
    if (loading) return
    const allAvailableIds = availableSlots.map((slot) => slot.id)
    setSelectedSlotIds(allAvailableIds)
  }

  const handleClearSelection = () => {
    if (loading) return
    setSelectedSlotIds([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?redirectTo=/events/${eventSlug}`)
      return
    }

    // Validate slot selection for events with time slots
    if (hasTimeSlots && selectedSlotIds.length === 0) {
      setError('Please select at least one time slot')
      setLoading(false)
      return
    }

    try {
      if (hasTimeSlots && selectedSlotIds.length > 0) {
        // Insert one registration per selected slot
        const registrations = selectedSlotIds.map((slotId) => ({
          event_id: eventId,
          user_id: user.id,
          time_slot_id: slotId,
          guest_count: guestCount,
          special_notes: specialNotes || null,
        }))

        const { error: regError } = await supabase
          .from('event_registrations')
          .insert(registrations)

        if (regError) throw regError
      } else {
        // Legacy whole-event registration (no time slots)
        const { error: regError } = await supabase
          .from('event_registrations')
          .insert({
            event_id: eventId,
            user_id: user.id,
            guest_count: guestCount,
            special_notes: specialNotes || null,
          })

        if (regError) throw regError
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      setLoading(false)
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <div
        ref={modalRef}
        className="flex-1 flex flex-col w-full h-full overflow-hidden"
      >
        {/* Header - Full Width */}
        <div className="flex-shrink-0 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 group"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <h2 id="registration-modal-title" className="text-lg sm:text-xl font-bold text-center flex-1 px-4">
                {hasTimeSlots ? 'Select Sessions' : 'Register for Event'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 p-1"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {eventTitle && (
              <p className="text-center text-gray-400 text-sm mt-2 truncate max-w-2xl mx-auto">
                {eventTitle}
              </p>
            )}
          </div>
        </div>

        {/* Success State */}
        {success ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center ring-4 ring-green-500/10">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Registration Successful!</h3>
              <p className="text-gray-400 text-lg">
                {hasTimeSlots
                  ? `You have been registered for ${selectedSlotIds.length} session${selectedSlotIds.length !== 1 ? 's' : ''}.`
                  : 'You have been registered for this event.'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Content - Centered with max width */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
              {/* Timeline View for events with slots */}
              {hasTimeSlots && timeSlots.length > 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Available Sessions</h3>
                      <p className="text-sm text-gray-400">
                        Select the sessions you want to attend
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {availableSlots.length > 0 && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={loading || selectedSlotIds.length === availableSlots.length}
                          >
                            Select All
                          </Button>
                          {selectedSlotIds.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleClearSelection}
                              disabled={loading}
                            >
                              Clear
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timeline Container */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {/* Event Start Marker */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-500/20 to-transparent border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Event Starts</p>
                          <p className="text-base text-white mt-0.5">
                            {formatDateHeader(eventStartDatetime)} at {formatTimeOnly(eventStartDatetime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="relative py-3">
                      {/* Vertical Timeline Line */}
                      <div className="absolute left-6 sm:left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/30 via-blue-500/20 to-purple-500/30" />

                      {timeSlots.map((slot) => {
                        const isSelected = selectedSlotIds.includes(slot.id)
                        const isAlreadyRegistered = existingSlotRegistrations.includes(slot.id)
                        const isUnavailable = slot.is_full || isAlreadyRegistered

                        return (
                          <div key={slot.id} className="relative">
                            <div className="pl-12 sm:pl-14 pr-4 sm:pr-6 py-2">
                              {/* Timeline Dot */}
                              <div
                                className={`absolute left-4 sm:left-5 top-6 w-4 h-4 rounded-full z-10 transition-all duration-200 ${
                                  isSelected
                                    ? 'bg-blue-500 ring-4 ring-blue-500/30 scale-110'
                                    : isAlreadyRegistered
                                      ? 'bg-green-500/60 ring-4 ring-green-500/20'
                                      : isUnavailable
                                        ? 'bg-gray-600'
                                        : 'bg-gray-700 border-2 border-white/20'
                                }`}
                              />

                              {/* Slot Card */}
                              <button
                                type="button"
                                onClick={() => handleSlotToggle(slot.id)}
                                disabled={loading || isUnavailable}
                                className={`
                                  w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200
                                  ${isSelected
                                    ? 'bg-blue-500/15 border-blue-500/50 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10'
                                    : isUnavailable
                                      ? 'bg-white/5 border-white/5 opacity-60 cursor-not-allowed'
                                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 hover:shadow-md'
                                  }
                                `}
                                aria-pressed={isSelected}
                                aria-disabled={isUnavailable}
                                aria-label={`${slot.title}${isUnavailable ? (isAlreadyRegistered ? ', already registered' : ', full') : ''}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    {/* Slot Header */}
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <span className="font-semibold text-base sm:text-lg truncate">{slot.title}</span>
                                      {isAlreadyRegistered && (
                                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                          Registered
                                        </Badge>
                                      )}
                                      {slot.is_full && !isAlreadyRegistered && (
                                        <Badge variant="destructive" className="text-xs">
                                          Full
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Time Range */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {formatTimeOnly(slot.start_datetime)} - {formatTimeOnly(slot.end_datetime)}
                                      </span>

                                      {slot.capacity ? (
                                        <span className="flex items-center gap-1.5">
                                          <Users className="w-4 h-4" />
                                          {slot.remaining_capacity !== null && slot.remaining_capacity > 0
                                            ? `${slot.remaining_capacity} spots left`
                                            : `${slot.total_attendees} / ${slot.capacity}`}
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1.5">
                                          <Users className="w-4 h-4" />
                                          Unlimited
                                        </span>
                                      )}

                                      {slot.price !== null && slot.price > 0 ? (
                                        <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                          <DollarSign className="w-4 h-4" />
                                          {formatPrice(slot.price)}
                                        </span>
                                      ) : (
                                        <span className="text-green-400 font-medium">Free</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Checkbox */}
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div
                                      className={`
                                        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                                        ${isSelected
                                          ? 'bg-blue-500 border-blue-500 scale-110'
                                          : isAlreadyRegistered
                                            ? 'border-green-500/50 bg-green-500/20'
                                            : isUnavailable
                                              ? 'border-white/20 bg-white/5'
                                              : 'border-white/30 hover:border-white/50'
                                        }
                                      `}
                                    >
                                      {isSelected && <Check className="w-4 h-4 text-white" />}
                                      {isAlreadyRegistered && !isSelected && (
                                        <Check className="w-4 h-4 text-green-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Event End Marker */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-500/20 to-transparent border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-500/20 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Event Ends</p>
                          <p className="text-base text-white mt-0.5">
                            {formatDateHeader(eventEndDatetime)} at {formatTimeOnly(eventEndDatetime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* No Available Slots Warning */}
                  {availableSlots.length === 0 && (
                    <div className="flex items-center gap-3 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                      <AlertCircle className="w-6 h-6 flex-shrink-0" />
                      <span className="text-base">
                        {existingSlotRegistrations.length > 0 && existingSlotRegistrations.length === timeSlots.length
                          ? 'You are already registered for all available sessions.'
                          : 'All sessions are currently full.'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Count & Notes (shown for both slotted and non-slotted events) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-6">
                <h3 className="text-lg font-semibold">Additional Information</h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="guestCount" className="text-base">Number of Additional Guests</Label>
                    <Input
                      id="guestCount"
                      type="number"
                      min="0"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-white/5 border-white/10 h-12 text-lg"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500">Not including yourself</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialNotes" className="text-base">Special Notes (Optional)</Label>
                    <Textarea
                      id="specialNotes"
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="Any dietary restrictions, accessibility needs, etc."
                      rows={3}
                      className="bg-white/5 border-white/10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              </div>
            </div>

            {/* Footer with Summary and Actions - Fixed at bottom */}
            <div className="flex-shrink-0 border-t border-white/10 bg-gray-900/95 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Summary for slotted events */}
                {hasTimeSlots && selectedSlotIds.length > 0 && (
                  <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-base">
                        {selectedSlotIds.length} session{selectedSlotIds.length !== 1 ? 's' : ''} selected
                      </span>
                      <span className="font-bold text-xl">
                        {totalPrice > 0 ? formatPrice(totalPrice) : 'Free'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 h-12 text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || (hasTimeSlots && selectedSlotIds.length === 0) || (hasTimeSlots && availableSlots.length === 0)}
                    className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                  >
                    {loading
                      ? 'Registering...'
                      : hasTimeSlots
                        ? `Register for ${selectedSlotIds.length} Session${selectedSlotIds.length !== 1 ? 's' : ''}`
                        : 'Register Now'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
