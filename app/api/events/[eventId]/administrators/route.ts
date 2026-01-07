import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  checkEventPermissions,
  canAddMoreAdministrators,
  findUserByEmail,
} from '@/lib/auth-helpers'
import type { EventAdministratorWithProfile } from '@/lib/types/database'

interface RouteParams {
  params: Promise<{ eventId: string }>
}

/**
 * GET /api/events/[eventId]/administrators
 * List all administrators for an event.
 * Requires: Event owner or admin
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions
    const permissions = await checkEventPermissions(eventId)
    if (!permissions.canManage) {
      return NextResponse.json(
        { error: 'You do not have permission to view administrators for this event' },
        { status: 403 }
      )
    }

    // Fetch administrators with profile data
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
      console.error('Error fetching administrators:', error)
      return NextResponse.json(
        { error: 'Failed to fetch administrators' },
        { status: 500 }
      )
    }

    // Get event owner info as well
    const { data: event } = await supabase
      .from('events')
      .select(`
        owner_id,
        profiles!events_owner_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('id', eventId)
      .single()

    return NextResponse.json({
      administrators: data as unknown as EventAdministratorWithProfile[],
      owner: event?.profiles,
      isOwner: permissions.isOwner,
      canAddMore: permissions.isOwner && (data?.length ?? 0) < 2,
    })
  } catch (error) {
    console.error('Unexpected error in GET administrators:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events/[eventId]/administrators
 * Add a new administrator to an event.
 * Requires: Event owner only
 * Body: { email: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - must be owner to add admins
    const permissions = await checkEventPermissions(eventId)
    if (!permissions.isOwner) {
      return NextResponse.json(
        { error: 'Only the event owner can add administrators' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if under the admin limit
    const canAdd = await canAddMoreAdministrators(eventId)
    if (!canAdd) {
      return NextResponse.json(
        { error: 'Maximum of 2 administrators per event reached' },
        { status: 400 }
      )
    }

    // Find user by email
    const userToAdd = await findUserByEmail(normalizedEmail)
    if (!userToAdd) {
      return NextResponse.json(
        { error: 'No user found with that email address' },
        { status: 404 }
      )
    }

    // Get event owner to check if trying to add owner as admin
    const { data: event } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single()

    if (userToAdd.id === event?.owner_id) {
      return NextResponse.json(
        { error: 'Cannot add the event owner as an administrator' },
        { status: 400 }
      )
    }

    // Check if user is already an admin
    const { data: existingAdmin } = await supabase
      .from('event_administrators')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userToAdd.id)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'This user is already an administrator' },
        { status: 400 }
      )
    }

    // Add the administrator
    const { data: newAdmin, error: insertError } = await supabase
      .from('event_administrators')
      .insert({
        event_id: eventId,
        user_id: userToAdd.id,
        added_by: user.id,
        role: 'admin',
      })
      .select(`
        *,
        profiles!event_administrators_user_id_fkey (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (insertError) {
      console.error('Error adding administrator:', insertError)
      return NextResponse.json(
        { error: 'Failed to add administrator' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      administrator: newAdmin as unknown as EventAdministratorWithProfile,
      message: 'Administrator added successfully',
    })
  } catch (error) {
    console.error('Unexpected error in POST administrators:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
