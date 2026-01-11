/**
 * Calendar utility functions for generating Google Calendar URLs and ICS file content
 * Used for event registration calendar integration
 */

export interface CalendarEventData {
  title: string
  description: string | null
  startDatetime: string // ISO 8601 string
  endDatetime: string // ISO 8601 string
  timezone: string
  location: string | null // Physical address
  meetingUrl: string | null // Virtual meeting URL
  locationType: 'physical' | 'virtual' | 'hybrid'
  organizationName?: string | null
  eventSlug: string // For generating UID
  slotId?: string // Optional slot ID for multi-session
  slotTitle?: string // Optional slot title
}

/**
 * Convert ISO datetime to Google Calendar format: YYYYMMDDTHHmmssZ
 * Google Calendar expects UTC time with Z suffix
 */
export function formatDateForGoogleCalendar(isoDate: string): string {
  const date = new Date(isoDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Convert ISO datetime to ICS format: YYYYMMDDTHHmmss
 * Returns local time representation for use with TZID parameter
 */
export function formatDateForICS(isoDate: string, timezone: string): string {
  const date = new Date(isoDate)

  // Use Intl.DateTimeFormat to get the date parts in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const getPart = (type: string): string => {
    const part = parts.find((p) => p.type === type)
    return part?.value ?? '00'
  }

  const year = getPart('year')
  const month = getPart('month')
  const day = getPart('day')
  let hours = getPart('hour')
  const minutes = getPart('minute')
  const seconds = getPart('second')

  // Handle midnight edge case (some locales return 24:00)
  if (hours === '24') {
    hours = '00'
  }

  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Build location string based on location type
 * For physical: return address
 * For virtual: return meeting URL
 * For hybrid: return both combined
 */
export function buildLocation(data: CalendarEventData): string {
  const { locationType, location, meetingUrl } = data

  switch (locationType) {
    case 'physical':
      return location ?? ''
    case 'virtual':
      return meetingUrl ?? ''
    case 'hybrid': {
      const parts: string[] = []
      if (location) {
        parts.push(location)
      }
      if (meetingUrl) {
        parts.push(`Online: ${meetingUrl}`)
      }
      return parts.join(' | ')
    }
    default:
      return location ?? meetingUrl ?? ''
  }
}

/**
 * Escape text for ICS format
 * Escapes commas, semicolons, backslashes, and newlines
 */
export function escapeICSText(text: string | null | undefined): string {
  if (text == null) {
    return ''
  }

  return text
    .replace(/\\/g, '\\\\') // Escape backslashes first
    .replace(/;/g, '\\;') // Escape semicolons
    .replace(/,/g, '\\,') // Escape commas
    .replace(/\r\n/g, '\\n') // Convert CRLF to escaped newline
    .replace(/\r/g, '\\n') // Convert CR to escaped newline
    .replace(/\n/g, '\\n') // Convert LF to escaped newline
}

/**
 * Fold long lines for ICS format (lines should not exceed 75 octets)
 * Continuation lines begin with a space
 */
function foldICSLine(line: string): string {
  const maxLength = 75
  if (line.length <= maxLength) {
    return line
  }

  const result: string[] = []
  let currentLine = line

  // First line can be full length
  result.push(currentLine.slice(0, maxLength))
  currentLine = currentLine.slice(maxLength)

  // Continuation lines start with space, so effective max is 74
  while (currentLine.length > 0) {
    result.push(' ' + currentLine.slice(0, maxLength - 1))
    currentLine = currentLine.slice(maxLength - 1)
  }

  return result.join('\r\n')
}

/**
 * Generate unique ID for ICS VEVENT
 * Format: {eventSlug}-{slotId}@event-horizon.app
 */
export function generateUID(eventSlug: string, slotId?: string): string {
  if (slotId) {
    return `${eventSlug}-${slotId}@event-horizon.app`
  }
  return `${eventSlug}@event-horizon.app`
}

/**
 * Generate Google Calendar URL with encoded parameters
 * URL format: https://www.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=...&ctz=...
 */
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const baseUrl = 'https://www.google.com/calendar/render'

  // Build event title with optional slot title
  let title = event.title
  if (event.slotTitle) {
    title = `${event.title} - ${event.slotTitle}`
  }

  // Build description with organization name if available
  let description = ''
  if (event.organizationName) {
    description += `Organized by: ${event.organizationName}\n\n`
  }
  if (event.description) {
    description += event.description
  }
  if (event.meetingUrl && event.locationType !== 'physical') {
    description += `\n\nJoin online: ${event.meetingUrl}`
  }

  // Truncate description if needed (URL length limit ~2000 chars)
  // Reserve ~500 chars for other URL parameters
  const maxDescriptionLength = 1500
  if (description.length > maxDescriptionLength) {
    description = description.slice(0, maxDescriptionLength - 3) + '...'
  }

  // Format dates for Google Calendar
  const startDate = formatDateForGoogleCalendar(event.startDatetime)
  const endDate = formatDateForGoogleCalendar(event.endDatetime)
  const dates = `${startDate}/${endDate}`

  // Build location
  const location = buildLocation(event)

  // Build URL parameters
  const params = new URLSearchParams()
  params.set('action', 'TEMPLATE')
  params.set('text', title)
  params.set('dates', dates)

  if (description) {
    params.set('details', description)
  }

  if (location) {
    params.set('location', location)
  }

  // Set timezone
  params.set('ctz', event.timezone)

  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate valid ICS file content
 * Supports multiple VEVENTs for multi-session events
 */
export function generateICSContent(events: CalendarEventData[]): string {
  const lines: string[] = []

  // ICS header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Event Horizon//Event Horizon App//EN')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')

  // Generate timestamp for DTSTAMP (current UTC time)
  const now = new Date()
  const dtstamp = formatDateForGoogleCalendar(now.toISOString())

  // Generate VEVENT for each event
  for (const event of events) {
    lines.push('BEGIN:VEVENT')

    // UID - unique identifier
    const uid = generateUID(event.eventSlug, event.slotId)
    lines.push(foldICSLine(`UID:${uid}`))

    // DTSTAMP - timestamp when this ICS was created
    lines.push(`DTSTAMP:${dtstamp}`)

    // DTSTART and DTEND with timezone
    const startDate = formatDateForICS(event.startDatetime, event.timezone)
    const endDate = formatDateForICS(event.endDatetime, event.timezone)
    lines.push(foldICSLine(`DTSTART;TZID=${event.timezone}:${startDate}`))
    lines.push(foldICSLine(`DTEND;TZID=${event.timezone}:${endDate}`))

    // SUMMARY - event title with optional slot title
    let summary = event.title
    if (event.slotTitle) {
      summary = `${event.title} - ${event.slotTitle}`
    }
    lines.push(foldICSLine(`SUMMARY:${escapeICSText(summary)}`))

    // DESCRIPTION - event description with organization name
    let description = ''
    if (event.organizationName) {
      description += `Organized by: ${event.organizationName}\\n\\n`
    }
    if (event.description) {
      description += escapeICSText(event.description)
    }
    if (event.meetingUrl && event.locationType !== 'physical') {
      description += `\\n\\nJoin online: ${event.meetingUrl}`
    }
    if (description) {
      lines.push(foldICSLine(`DESCRIPTION:${description}`))
    }

    // LOCATION
    const location = buildLocation(event)
    if (location) {
      lines.push(foldICSLine(`LOCATION:${escapeICSText(location)}`))
    }

    // URL - meeting URL for virtual/hybrid events
    if (event.meetingUrl && event.locationType !== 'physical') {
      lines.push(foldICSLine(`URL:${event.meetingUrl}`))
    }

    lines.push('END:VEVENT')
  }

  // ICS footer
  lines.push('END:VCALENDAR')

  // Join with CRLF as per ICS spec
  return lines.join('\r\n')
}
