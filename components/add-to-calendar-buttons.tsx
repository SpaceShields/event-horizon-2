'use client'

import { Calendar, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  generateGoogleCalendarUrl,
  generateICSContent,
  type CalendarEventData,
} from '@/lib/calendar-utils'

interface AddToCalendarButtonsProps {
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
  // For events with time slots - pass the specific slots user registered for
  registeredSlots?: Array<{
    id: string
    title: string
    start_time: string
    end_time: string
  }>
  // For single slot calendar buttons - pass a specific slot
  slot?: {
    id: string
    title: string
    start_time: string
    end_time: string
  }
  variant?: 'default' | 'compact' | 'icon'
  className?: string
}

/**
 * Map event data to CalendarEventData format
 */
function mapToCalendarEventData(
  event: AddToCalendarButtonsProps['event'],
  slot?: {
    id: string
    title: string
    start_time: string
    end_time: string
  }
): CalendarEventData {
  return {
    title: event.title,
    description: event.description,
    startDatetime: slot?.start_time ?? event.start_datetime,
    endDatetime: slot?.end_time ?? event.end_datetime,
    timezone: event.timezone,
    location: event.address,
    meetingUrl: event.meeting_url,
    locationType: event.location_type,
    organizationName: event.organization_name,
    eventSlug: event.slug,
    slotId: slot?.id,
    slotTitle: slot?.title,
  }
}

export function AddToCalendarButtons({
  event,
  registeredSlots,
  slot,
  variant = 'default',
  className,
}: AddToCalendarButtonsProps) {
  const hasSlots = registeredSlots && registeredSlots.length > 0

  /**
   * Handle Google Calendar button click
   * For single slot: generate URL for that specific slot
   * For events with slots: generate URL for the first registered slot
   * For single events: generate URL for the main event
   */
  const handleGoogleCalendarClick = () => {
    let calendarData: CalendarEventData

    if (slot) {
      // Single specific slot
      calendarData = mapToCalendarEventData(event, slot)
    } else if (hasSlots) {
      // Use first registered slot
      calendarData = mapToCalendarEventData(event, registeredSlots[0])
    } else {
      // Single event without slots
      calendarData = mapToCalendarEventData(event)
    }

    const url = generateGoogleCalendarUrl(calendarData)
    window.open(url, '_blank')
  }

  /**
   * Handle ICS download
   * For single slot: generate ICS with one VEVENT for that slot
   * For single events: generate ICS with one VEVENT
   * For events with multiple slots: generate ICS with all registered sessions
   */
  const handleICSDownload = () => {
    let calendarEvents: CalendarEventData[]

    if (slot) {
      // Single specific slot
      calendarEvents = [mapToCalendarEventData(event, slot)]
    } else if (hasSlots) {
      // Generate VEVENT for each registered slot
      calendarEvents = registeredSlots.map((s) =>
        mapToCalendarEventData(event, s)
      )
    } else {
      // Single event without slots
      calendarEvents = [mapToCalendarEventData(event)]
    }

    const icsContent = generateICSContent(calendarEvents)

    // Create Blob and trigger download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    // Include slot ID in filename if applicable
    const filename = slot ? `${event.slug}-${slot.id.slice(0, 8)}.ics` : `${event.slug}.ics`
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isCompact = variant === 'compact'
  const isIcon = variant === 'icon'

  // Icon-only variant for inline display on slot cards
  if (isIcon) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoogleCalendarClick}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          title="Add to Google Calendar"
        >
          <Calendar className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleICSDownload}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10"
          title="Download ICS file"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex',
        isCompact ? 'flex-row gap-2' : 'flex-col sm:flex-row gap-3',
        className
      )}
    >
      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'default'}
        onClick={handleGoogleCalendarClick}
        className={cn('text-sm', isCompact && 'px-3')}
      >
        <Calendar className="w-4 h-4" />
        {isCompact ? 'Google' : 'Add to Google Calendar'}
      </Button>

      <Button
        variant="outline"
        size={isCompact ? 'sm' : 'default'}
        onClick={handleICSDownload}
        className={cn('text-sm', isCompact && 'px-3')}
      >
        <Download className="w-4 h-4" />
        {isCompact ? 'ICS' : 'Download ICS'}
      </Button>
    </div>
  )
}
