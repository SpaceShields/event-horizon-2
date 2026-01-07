import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, DollarSign, User, Edit } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { EventRegistrationSection } from '@/components/event-registration-section'
import { SlotRegistrations, WholeEventRegistrations } from '@/components/slot-registrations'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { checkEventPermissions } from '@/lib/auth-helpers'
import { getRegistrationsBySlot, type GroupedRegistrations } from '@/lib/registration-helpers'

import type { TimeSlotWithStats } from '@/lib/types/database'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Get event data
  const { data: event } = await supabase
    .from('events_with_stats')
    .select('*, event_categories(name, slug, icon), profiles(full_name, avatar_url)')
    .eq('slug', slug)
    .single()

  if (!event) {
    notFound()
  }

  // Check if user is registered
  const { data: { user } } = await supabase.auth.getUser()
  let userRegistration = null
  const existingSlotRegistrations: string[] = []

  const { data: registeredAttendees } = await supabase
    .from('event_registrations')
    .select('*, profiles(full_name, avatar_url), event_time_slots(title)')
    .eq('event_id', event.id).limit(50)

  registeredAttendees?.forEach((registeredProfile) => {
    if(registeredProfile.user_id == user?.id) {
      userRegistration = registeredProfile
      if (registeredProfile.time_slot_id) {
        existingSlotRegistrations.push(registeredProfile.time_slot_id)
      }
    }
  })

  // Fetch time slots if event has them
  let timeSlots: TimeSlotWithStats[] = []
  if (event.has_time_slots) {
    const { data: slotsData } = await supabase
      .from('time_slots_with_stats')
      .select('*')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
      .order('start_datetime', { ascending: true })

    timeSlots = slotsData || []
  }

  // Check permissions for event management
  const permissions = await checkEventPermissions(event.id)
  const isOwner = permissions.isOwner
  const canManage = permissions.canManage

  // Fetch grouped registrations for admins/owners
  let registrationsBySlot: GroupedRegistrations | null = null
  if (canManage && event.has_time_slots) {
    registrationsBySlot = await getRegistrationsBySlot(event.id)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Badge variant="secondary">{event.event_categories?.name}</Badge>
            {event.has_time_slots && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Multiple Sessions
              </Badge>
            )}
            {event.is_full && <Badge variant="destructive">Full</Badge>}
            {event.status === 'ongoing' && <Badge className="bg-green-500">Ongoing</Badge>}
            {event.status === 'completed' && <Badge className="bg-gray-500">Completed</Badge>}
            {event.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">{event.title}</h1>
          {event.organization_name && (
            <p className="text-lg sm:text-xl text-gray-400">Organized by {event.organization_name}</p>
          )}
        </div>

        {/* Edit Button - Visible to event owner and administrators */}
        {canManage && (
          <div className="mb-6">
            <Link href={`/events/edit/${event.slug}`}>
              <Button
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
            </Link>
          </div>
        )}

        {/* Event Image */}
        {event.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-8">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              priority
            />
          </div>
        )}

        {/* Single Column Layout */}
        <div className="space-y-8">
          {/* Registration Section - Prominent at top */}
          <EventRegistrationSection
            event={{
              id: event.id,
              slug: event.slug,
              title: event.title,
              start_datetime: event.start_datetime,
              end_datetime: event.end_datetime,
              location_type: event.location_type,
              address: event.address,
              meeting_url: event.meeting_url,
              timezone: event.timezone,
              capacity: event.capacity,
              total_attendees: event.total_attendees,
              registration_count: event.registration_count,
              has_time_slots: event.has_time_slots,
              ticket_price: event.ticket_price,
              status: event.status,
              is_full: event.is_full,
            }}
            timeSlots={timeSlots}
            user={user}
            isOwner={isOwner}
            isRegistered={!!userRegistration}
            existingSlotRegistrations={existingSlotRegistrations}
          />

          {/* About Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">About This Event</h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          {/* Time Slots Section */}
          {event.has_time_slots && timeSlots.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Sessions</h2>
              <div className="space-y-4">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{slot.title}</h3>
                          {slot.is_full && (
                            <Badge variant="destructive" className="text-xs">
                              Full
                            </Badge>
                          )}
                          {existingSlotRegistrations.includes(slot.id) && (
                            <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                              Registered
                            </Badge>
                          )}
                        </div>

                        {slot.description && (
                          <p className="text-sm text-gray-400 mb-3">{slot.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(slot.start_datetime)}
                          </span>

                          {slot.capacity ? (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {slot.remaining_capacity !== null && slot.remaining_capacity > 0
                                ? `${slot.remaining_capacity} spots left`
                                : `${slot.total_attendees} / ${slot.capacity}`}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {slot.total_attendees} registered
                            </span>
                          )}

                          {slot.price !== null && slot.price > 0 && (
                            <span className="flex items-center gap-1.5 text-green-400 font-medium">
                              <DollarSign className="w-4 h-4" />
                              {formatPrice(slot.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Slot Registrations - Visible to owners/admins */}
                    {canManage && registrationsBySlot && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <SlotRegistrations
                          slotId={slot.id}
                          registrations={registrationsBySlot.bySlot[slot.id] || []}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.registration_instructions && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Registration Instructions</h2>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{event.registration_instructions}</p>
            </div>
          )}

          {/* Organizer Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="font-semibold text-xl mb-4">Organized By</h3>
            <div className="flex items-center gap-4">
              {event.profiles?.avatar_url ? (
                <Image
                  src={event.profiles.avatar_url}
                  alt={event.profiles.full_name || 'Organizer avatar'}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">{event.profiles?.full_name?.[0] || 'U'}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-lg">{event.profiles?.full_name || 'Anonymous'}</p>
                {event.organization_name && (
                  <p className="text-gray-400">{event.organization_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Legacy Whole Event Registrations - Only for slotted events with legacy registrations */}
          {canManage && event.has_time_slots && registrationsBySlot && registrationsBySlot.wholeEvent.length > 0 && (
            <WholeEventRegistrations registrations={registrationsBySlot.wholeEvent} />
          )}

          {/* Registered Attendees - Only for non-slotted events, visible to owner and administrators */}
          {canManage && !event.has_time_slots && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Registered Attendees</h2>
              {registeredAttendees && registeredAttendees.length > 0 ? (
                <div className="space-y-4">
                  {registeredAttendees.map((attendee) => (
                    <div key={attendee.id} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-lg truncate">{attendee.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-400">
                            Registered {formatDateTime(attendee.created_at)}
                          </p>
                          
                        </div>
                      </div>
                      {attendee.special_notes && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-sm text-gray-400">
                            <span className="font-medium text-gray-300">Note:</span> {attendee.special_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No registered attendees yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
