import { createClient } from '@/lib/supabase/server'

/**
 * Registration data with profile information
 */
export interface RegistrationWithProfile {
  id: string
  event_id: string
  user_id: string
  time_slot_id: string | null
  guest_count: number
  special_notes: string | null
  registration_date: string
  attendance_status: 'registered' | 'attended' | 'cancelled' | 'no_show'
  created_at: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
  event_time_slots: {
    id: string
    title: string
    start_datetime: string
  } | null
}

/**
 * Registrations grouped by slot
 */
export interface GroupedRegistrations {
  /** Registrations for the whole event (time_slot_id IS NULL) */
  wholeEvent: RegistrationWithProfile[]
  /** Registrations keyed by slot ID */
  bySlot: Record<string, RegistrationWithProfile[]>
}

/**
 * Fetch all non-cancelled registrations for an event, grouped by slot.
 * Used for displaying registrations under each time slot for admins/owners.
 *
 * @param eventId - The event UUID
 * @returns Grouped registrations with profile data
 */
export async function getRegistrationsBySlot(
  eventId: string
): Promise<GroupedRegistrations> {
  const supabase = await createClient()

  const { data: registrations, error } = await supabase
    .from('event_registrations')
    .select(`
      id,
      event_id,
      user_id,
      time_slot_id,
      guest_count,
      special_notes,
      registration_date,
      attendance_status,
      created_at,
      profiles (
        full_name,
        avatar_url
      ),
      event_time_slots (
        id,
        title,
        start_datetime
      )
    `)
    .eq('event_id', eventId)
    .neq('attendance_status', 'cancelled')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching registrations by slot:', error)
    return { wholeEvent: [], bySlot: {} }
  }

  // Group registrations by slot
  const grouped: GroupedRegistrations = {
    wholeEvent: [],
    bySlot: {},
  }

  for (const reg of registrations || []) {
    // Type assertion due to Supabase join inference
    const registration = reg as unknown as RegistrationWithProfile

    if (registration.time_slot_id === null) {
      // Whole event registration (legacy or non-slotted)
      grouped.wholeEvent.push(registration)
    } else {
      // Slot-specific registration
      if (!grouped.bySlot[registration.time_slot_id]) {
        grouped.bySlot[registration.time_slot_id] = []
      }
      grouped.bySlot[registration.time_slot_id].push(registration)
    }
  }

  return grouped
}

/**
 * Calculate total attendees (registrations + guests) for an array of registrations
 */
export function calculateTotalAttendees(registrations: RegistrationWithProfile[]): number {
  return registrations.reduce((total, reg) => {
    // Each registration counts as 1, plus any guests
    return total + 1 + (reg.guest_count || 0)
  }, 0)
}
