'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RegistrationModal } from '@/components/registration-modal'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

import type { TimeSlotWithStats } from '@/lib/types/database'

interface RegistrationButtonProps {
  eventId: string
  eventSlug: string
  eventTitle?: string
  eventStartDatetime: string
  eventEndDatetime: string
  isRegistered: boolean
  isFull: boolean
  isOwner: boolean
  eventStatus: string
  hasTimeSlots?: boolean
  timeSlots?: TimeSlotWithStats[]
  existingSlotRegistrations?: string[] // slot IDs user is already registered for
  variant?: 'default' | 'prominent'
}

export function RegistrationButton({
  eventId,
  eventSlug,
  eventTitle,
  eventStartDatetime,
  eventEndDatetime,
  isRegistered,
  isFull,
  isOwner,
  eventStatus,
  hasTimeSlots = false,
  timeSlots = [],
  existingSlotRegistrations = [],
  variant = 'default',
}: RegistrationButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate if all available slots are registered
  const allSlotsRegistered = useMemo(() => {
    if (!hasTimeSlots || timeSlots.length === 0) return false
    return timeSlots.every(
      (slot) => slot.is_full || existingSlotRegistrations.includes(slot.id)
    )
  }, [hasTimeSlots, timeSlots, existingSlotRegistrations])

  const handleCancelRegistration = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // Delete all registrations for this event (including all slots)
    const { error: cancelError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)

    if (cancelError) {
      setError(cancelError.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  const handleModalSuccess = () => {
    setShowModal(false)
  }

  const handleOpenModal = () => {
    setShowModal(true)
  }

  // Helper function to get button styles based on variant
  const getButtonClasses = (baseClasses: string = '') => {
    if (variant === 'prominent') {
      return `w-full max-w-2xl mx-auto py-4 px-8 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] ${baseClasses}`
    }
    return `w-full ${baseClasses}`
  }

  const getProminentGradient = () => {
    return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl'
  }

  if (isOwner) {
    return (
      <div className={variant === 'prominent' ? 'flex justify-center' : ''}>
        <Button className={getButtonClasses()} variant="outline" disabled>
          You are the organizer
        </Button>
      </div>
    )
  }

  if (eventStatus === 'cancelled') {
    return (
      <div className={variant === 'prominent' ? 'flex justify-center' : ''}>
        <Button className={getButtonClasses()} variant="destructive" disabled>
          Event Cancelled
        </Button>
      </div>
    )
  }

  if (eventStatus === 'completed') {
    return (
      <div className={variant === 'prominent' ? 'flex justify-center' : ''}>
        <Button className={getButtonClasses()} variant="outline" disabled>
          Event Completed
        </Button>
      </div>
    )
  }

  // For events with time slots, show registered state differently
  if (hasTimeSlots && existingSlotRegistrations.length > 0) {
    return (
      <>
        <div className={`space-y-3 ${variant === 'prominent' ? 'max-w-2xl mx-auto' : ''}`}>
          <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-4 ${variant === 'prominent' ? 'text-center' : ''}`}>
            <p className={`text-green-400 font-medium ${variant === 'prominent' ? 'text-lg' : 'text-sm'}`}>
              Registered for {existingSlotRegistrations.length} session{existingSlotRegistrations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {!allSlotsRegistered && (
            <Button
              className={getButtonClasses(variant === 'prominent' ? getProminentGradient() : '')}
              variant={variant === 'prominent' ? 'default' : 'outline'}
              onClick={handleOpenModal}
            >
              {variant === 'prominent' && <Sparkles className="w-5 h-5 mr-2" />}
              Register for More Sessions
            </Button>
          )}

          <Button
            className={getButtonClasses()}
            variant="destructive"
            onClick={handleCancelRegistration}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel All Registrations'}
          </Button>

          {error && <p className={`text-red-400 ${variant === 'prominent' ? 'text-center' : 'text-sm'}`}>{error}</p>}
        </div>

        <RegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          eventId={eventId}
          eventSlug={eventSlug}
          eventTitle={eventTitle}
          eventStartDatetime={eventStartDatetime}
          eventEndDatetime={eventEndDatetime}
          hasTimeSlots={hasTimeSlots}
          timeSlots={timeSlots}
          existingSlotRegistrations={existingSlotRegistrations}
          onSuccess={handleModalSuccess}
        />
      </>
    )
  }

  // Legacy whole-event registration
  if (isRegistered && !hasTimeSlots) {
    return (
      <div className={`space-y-3 ${variant === 'prominent' ? 'max-w-2xl mx-auto' : ''}`}>
        <div className={`bg-green-500/10 border border-green-500/30 rounded-xl p-4 ${variant === 'prominent' ? 'text-center' : ''}`}>
          <p className={`text-green-400 font-medium ${variant === 'prominent' ? 'text-lg' : 'text-sm'}`}>
            You are registered for this event
          </p>
        </div>
        <Button
          className={getButtonClasses()}
          variant="destructive"
          onClick={handleCancelRegistration}
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Cancel Registration'}
        </Button>
        {error && <p className={`text-red-400 ${variant === 'prominent' ? 'text-center' : 'text-sm'}`}>{error}</p>}
      </div>
    )
  }

  // Check if event (without slots) is full
  if (isFull && !hasTimeSlots) {
    return (
      <div className={variant === 'prominent' ? 'flex justify-center' : ''}>
        <Button className={getButtonClasses()} variant="destructive" disabled>
          Event Full
        </Button>
      </div>
    )
  }

  // Check if all slots are full or registered
  if (hasTimeSlots && allSlotsRegistered) {
    return (
      <div className={variant === 'prominent' ? 'flex justify-center' : ''}>
        <Button className={getButtonClasses()} variant="destructive" disabled>
          All Sessions Full or Registered
        </Button>
      </div>
    )
  }

  // Default: Show register button
  if (variant === 'prominent') {
    return (
      <>
        <div className="flex justify-center">
          <button
            onClick={handleOpenModal}
            className={`${getButtonClasses(getProminentGradient())} flex items-center justify-center gap-2`}
          >
            <Sparkles className="w-5 h-5" />
            {hasTimeSlots ? 'Select Sessions to Register' : 'Register for Event'}
          </button>
        </div>

        <RegistrationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          eventId={eventId}
          eventSlug={eventSlug}
          eventTitle={eventTitle}
          eventStartDatetime={eventStartDatetime}
          eventEndDatetime={eventEndDatetime}
          hasTimeSlots={hasTimeSlots}
          timeSlots={timeSlots}
          existingSlotRegistrations={existingSlotRegistrations}
          onSuccess={handleModalSuccess}
        />
      </>
    )
  }

  return (
    <>
      <Button className="w-full" onClick={handleOpenModal}>
        {hasTimeSlots ? 'Select Sessions' : 'Register for Event'}
      </Button>

      <RegistrationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        eventId={eventId}
        eventSlug={eventSlug}
        eventTitle={eventTitle}
        eventStartDatetime={eventStartDatetime}
        eventEndDatetime={eventEndDatetime}
        hasTimeSlots={hasTimeSlots}
        timeSlots={timeSlots}
        existingSlotRegistrations={existingSlotRegistrations}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}

// Export a function to allow external components to trigger the modal
export function useRegistrationModal() {
  const [showModal, setShowModal] = useState(false)
  return {
    isOpen: showModal,
    open: () => setShowModal(true),
    close: () => setShowModal(false),
  }
}
