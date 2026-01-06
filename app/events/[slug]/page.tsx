import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, DollarSign, Video, Building, Clock, Globe, User } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'
import { RegistrationButton } from '@/components/registration-button'
import { notFound } from 'next/navigation'
import Image from 'next/image'

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

  const { data: registeredAttendees } = await supabase
    .from('event_registrations')
    .select('*, profiles(full_name, avatar_url)')
    .eq('event_id', event.id).limit(10)
    // .eq('user_id', user.id)
    // .single()

  registeredAttendees?.forEach((registeredProfile) => {
    if(registeredProfile.user_id == user?.id) {
      userRegistration = registeredProfile
    }
  })

  const LocationIcon = event.location_type === 'virtual' ? Video : event.location_type === 'physical' ? Building : MapPin
  const isOwner = user?.id === event.owner_id

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary">{event.event_categories?.name}</Badge>
            {event.is_full && <Badge variant="destructive">Full</Badge>}
            {event.status === 'ongoing' && <Badge className="bg-green-500">Ongoing</Badge>}
            {event.status === 'completed' && <Badge className="bg-gray-500">Completed</Badge>}
            {event.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <h1 className="text-2xl md:text-5xl font-bold mb-4">{event.title}</h1>
          {event.organization_name && (
            <p className="text-xl text-gray-400">Organized by {event.organization_name}</p>
          )}
        </div>

        {/* Event Image */}
        {event.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-8">
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

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>

            {event.registration_instructions && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Registration Instructions</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{event.registration_instructions}</p>
              </div>
            )}

            {/* Registered Attendees - Only visible to event owner */}
            {isOwner && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Registered Attendees</h2>
                {registeredAttendees && registeredAttendees.length > 0 ? (
                  <div className="space-y-3">
                    {registeredAttendees.map((attendee) => (
                      <div key={attendee.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{attendee.profiles?.full_name || 'Anonymous'}</p>
                            <p className="text-sm text-gray-400">
                              Registered {formatDateTime(attendee.created_at)}
                            </p>
                            {attendee.guest_count && attendee.guest_count > 1 && (
                              <p className="text-sm text-gray-400">
                                +{attendee.guest_count - 1} guest{attendee.guest_count > 2 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        {attendee.special_notes && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-sm text-gray-400">
                              <span className="font-medium">Note:</span> {attendee.special_notes}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatPrice(event.ticket_price)}</span>
              </div>

              {user && (
                <RegistrationButton
                  eventId={event.id}
                  eventSlug={event.slug}
                  isRegistered={!!userRegistration}
                  isFull={event.is_full}
                  isOwner={isOwner}
                  eventStatus={event.status}
                />
              )}

              {!user && (
                <a href="/auth/login?redirectTo=/events/${event.slug}">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Sign in to Register
                  </button>
                </a>
              )}

              {event.capacity && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Capacity</span>
                    <span className="font-medium">
                      {event.total_attendees} / {event.capacity}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Event Details Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">Event Details</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-gray-400">{formatDateTime(event.start_datetime)}</p>
                    <p className="text-sm text-gray-400">to {formatDateTime(event.end_datetime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <LocationIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium capitalize">{event.location_type} Event</p>
                    {event.address && (
                      <p className="text-sm text-gray-400">{event.address}</p>
                    )}
                    {event.meeting_url && (
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:underline"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Timezone</p>
                    <p className="text-sm text-gray-400">{event.timezone}</p>
                  </div>
                </div>

                {event.capacity ? (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Attendees</p>
                      <p className="text-sm text-gray-400">
                        {event.total_attendees} registered
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Unlimited Capacity</p>
                      <p className="text-sm text-gray-400">
                        {event.registration_count} registered
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Organized By</h3>
              <div className="flex items-center gap-3">
                {event.profiles?.avatar_url ? (
                  <Image
                    src={event.profiles.avatar_url}
                    alt={event.profiles.full_name || 'Organizer avatar'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xl">{event.profiles?.full_name?.[0] || 'U'}</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{event.profiles?.full_name || 'Anonymous'}</p>
                  {event.organization_name && (
                    <p className="text-sm text-gray-400">{event.organization_name}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
