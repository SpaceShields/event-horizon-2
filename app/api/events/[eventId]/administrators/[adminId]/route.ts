import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkEventPermissions } from '@/lib/auth-helpers'

interface RouteParams {
  params: Promise<{ eventId: string; adminId: string }>
}

/**
 * DELETE /api/events/[eventId]/administrators/[adminId]
 * Remove an administrator from an event.
 * Requires: Event owner only
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { eventId, adminId } = await params
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - must be owner to remove admins
    const permissions = await checkEventPermissions(eventId)
    if (!permissions.isOwner) {
      return NextResponse.json(
        { error: 'Only the event owner can remove administrators' },
        { status: 403 }
      )
    }

    // Verify the admin record exists and belongs to this event
    const { data: adminRecord, error: fetchError } = await supabase
      .from('event_administrators')
      .select('id, event_id')
      .eq('id', adminId)
      .single()

    if (fetchError || !adminRecord) {
      return NextResponse.json(
        { error: 'Administrator not found' },
        { status: 404 }
      )
    }

    if (adminRecord.event_id !== eventId) {
      return NextResponse.json(
        { error: 'Administrator does not belong to this event' },
        { status: 400 }
      )
    }

    // Delete the administrator
    const { error: deleteError } = await supabase
      .from('event_administrators')
      .delete()
      .eq('id', adminId)

    if (deleteError) {
      console.error('Error removing administrator:', deleteError)
      return NextResponse.json(
        { error: 'Failed to remove administrator' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Administrator removed successfully',
    })
  } catch (error) {
    console.error('Unexpected error in DELETE administrator:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
