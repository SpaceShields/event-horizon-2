import { createClient } from '@/lib/supabase/server'
import type { EventAdministratorWithProfile, Profile } from '@/lib/types/database'

/**
 * Event permissions result returned by checkEventPermissions
 */
export interface EventPermissions {
  /** Whether the current user is the event owner */
  isOwner: boolean
  /** Whether the current user is an event administrator */
  isAdmin: boolean
  /** Whether the current user can manage the event (owner OR admin) */
  canManage: boolean
  /** The current user's ID, or null if not authenticated */
  userId: string | null
}

/**
 * Check the current user's permissions for an event.
 * Works with both event ID and event slug.
 *
 * @param eventIdOrSlug - Either the event UUID or slug
 * @returns EventPermissions object with permission flags
 */
export async function checkEventPermissions(
  eventIdOrSlug: string
): Promise<EventPermissions> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      isOwner: false,
      isAdmin: false,
      canManage: false,
      userId: null,
    }
  }

  // Determine if we're working with a UUID or slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventIdOrSlug)

  // Fetch event to check ownership
  const eventQuery = supabase
    .from('events')
    .select('id, owner_id')

  const { data: event } = isUuid
    ? await eventQuery.eq('id', eventIdOrSlug).single()
    : await eventQuery.eq('slug', eventIdOrSlug).single()

  if (!event) {
    return {
      isOwner: false,
      isAdmin: false,
      canManage: false,
      userId: user.id,
    }
  }

  const isOwner = event.owner_id === user.id

  // If owner, no need to check admin status
  if (isOwner) {
    return {
      isOwner: true,
      isAdmin: false,
      canManage: true,
      userId: user.id,
    }
  }

  // Check if user is an admin
  const { data: adminRecord } = await supabase
    .from('event_administrators')
    .select('id')
    .eq('event_id', event.id)
    .eq('user_id', user.id)
    .single()

  const isAdmin = !!adminRecord

  return {
    isOwner: false,
    isAdmin,
    canManage: isAdmin,
    userId: user.id,
  }
}

/**
 * Fetch all administrators for an event with their profile data.
 * Returns administrators ordered by creation date.
 *
 * @param eventId - The event UUID
 * @returns Array of administrators with profile data
 */
export async function getEventAdministrators(
  eventId: string
): Promise<EventAdministratorWithProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_administrators')
    .select(`
      *,
      profiles!event_administrators_user_id_fkey (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching event administrators:', error)
    return []
  }

  // Type assertion needed due to Supabase's join type inference
  return (data as unknown as EventAdministratorWithProfile[]) || []
}

/**
 * Check if more administrators can be added to an event.
 * Maximum is 2 administrators (plus the owner = 3 total managers).
 *
 * @param eventId - The event UUID
 * @returns true if under the 2 admin limit
 */
export async function canAddMoreAdministrators(eventId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('event_administrators')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if (error) {
    console.error('Error counting administrators:', error)
    return false
  }

  return (count ?? 0) < 2
}

/**
 * Look up a user by email address.
 * Used when adding a new administrator.
 *
 * @param email - The email address to search for
 * @returns The profile if found, null otherwise
 */
export async function findUserByEmail(email: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Get the event owner's profile.
 *
 * @param eventId - The event UUID
 * @returns The owner's profile or null
 */
export async function getEventOwner(eventId: string): Promise<Profile | null> {
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('owner_id')
    .eq('id', eventId)
    .single()

  if (!event) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', event.owner_id)
    .single()

  return profile
}
