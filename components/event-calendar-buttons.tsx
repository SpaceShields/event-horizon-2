'use client'

import { AddToCalendarButtons } from '@/components/add-to-calendar-buttons'

interface EventCalendarButtonsProps {
  event: {
    title: string
    description: string | null
    start_datetime: string
    end_datetime: string
    timezone: string
    location_type: 'physical' | 'virtual' | 'hybrid'
    address: string | null
    meeting_url: string | null
    organization_name: string | null
    slug: string
  }
}

/**
 * Client component wrapper for calendar buttons on the event details card.
 * Used for non-slot events when the user is registered.
 */
export function EventCalendarButtons({ event }: EventCalendarButtonsProps) {
  return (
    <AddToCalendarButtons
      event={event}
      variant="icon"
    />
  )
}
