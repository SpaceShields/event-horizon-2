import { RegistrationButton } from '@/components/registration-button'
import { EventDetailsCard } from '@/components/event-details-card'
import { Sparkles } from 'lucide-react'

import type { TimeSlotWithStats } from '@/lib/types/database'

interface EventRegistrationSectionProps {
  event: {
    id: string
    slug: string
    title: string
    start_datetime: string
    end_datetime: string
    location_type: 'physical' | 'virtual' | 'hybrid'
    address?: string | null
    meeting_url?: string | null
    timezone: string
    capacity?: number | null
    total_attendees?: number
    registration_count?: number
    has_time_slots: boolean
    ticket_price?: number | null
    status: string
    is_full: boolean
  }
  timeSlots: TimeSlotWithStats[]
  user: { id: string } | null
  isOwner: boolean
  isRegistered: boolean
  existingSlotRegistrations: string[]
}

export function EventRegistrationSection({
  event,
  timeSlots,
  user,
  isOwner,
  isRegistered,
  existingSlotRegistrations,
}: EventRegistrationSectionProps) {
  // Show sign in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="space-y-6">
        {/* Sign In CTA */}
        <div className="flex justify-center">
          <a
            href={`/auth/login?redirectTo=/events/${event.slug}`}
            className="w-full max-w-2xl mx-auto py-4 px-8 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Sign in to Register
          </a>
        </div>

        {/* Event Details Card */}
        <EventDetailsCard
          event={event}
          timeSlots={timeSlots}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Prominent Registration Button */}
      <RegistrationButton
        eventId={event.id}
        eventSlug={event.slug}
        eventTitle={event.title}
        eventStartDatetime={event.start_datetime}
        eventEndDatetime={event.end_datetime}
        isRegistered={isRegistered}
        isFull={event.is_full}
        isOwner={isOwner}
        eventStatus={event.status}
        hasTimeSlots={event.has_time_slots}
        timeSlots={timeSlots}
        existingSlotRegistrations={existingSlotRegistrations}
        variant="prominent"
      />

      {/* Event Details Card - Non-interactive, purely informational */}
      <EventDetailsCard
        event={event}
        timeSlots={timeSlots}
      />
    </div>
  )
}
