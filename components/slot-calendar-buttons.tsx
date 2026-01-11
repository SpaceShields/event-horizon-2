'use client'

import { AddToCalendarButtons } from '@/components/add-to-calendar-buttons'

interface SlotCalendarButtonsProps {
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
  slot: {
    id: string
    title: string
    start_datetime: string
    end_datetime: string
  }
}

/**
 * Client component wrapper for calendar buttons on individual time slot cards.
 * Used on the event detail page to add calendar buttons to registered slots.
 */
export function SlotCalendarButtons({ event, slot }: SlotCalendarButtonsProps) {
  return (
    <AddToCalendarButtons
      event={event}
      slot={{
        id: slot.id,
        title: slot.title,
        start_time: slot.start_datetime,
        end_time: slot.end_datetime,
      }}
      variant="icon"
    />
  )
}
