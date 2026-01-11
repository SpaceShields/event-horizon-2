import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Edit, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { DeleteEventButton } from '@/components/delete-event-button'
import { AddToCalendarButtons } from '@/components/add-to-calendar-buttons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard')
  }

  // Get user's events
  const { data: myEvents } = await supabase
    .from('events_with_stats')
    .select('*, event_categories(name, slug)')
    .eq('owner_id', user.id)
    .order('start_datetime', { ascending: true })

  // Get user's registrations with time slot info
  const { data: myRegistrations } = await supabase
    .from('event_registrations')
    .select('*, events(*, event_categories(name, slug)), event_time_slots(id, title, start_datetime, end_datetime)')
    .eq('user_id', user.id)
    .eq('attendance_status', 'registered')
    .order('registration_date', { ascending: false })

  // Define types for grouped registrations
  type RegistrationType = NonNullable<typeof myRegistrations>[0]
  type GroupedRegistration = {
    event: RegistrationType['events']
    registrations: RegistrationType[]
  }

  // Group registrations by event for display
  const groupedRegistrations = myRegistrations?.reduce<Record<string, GroupedRegistration>>((acc, reg) => {
    const eventId = reg.events?.id
    if (!eventId) return acc

    if (!acc[eventId]) {
      acc[eventId] = {
        event: reg.events,
        registrations: []
      }
    }
    acc[eventId].registrations.push(reg)
    return acc
  }, {})

  const groupedArray: GroupedRegistration[] = groupedRegistrations ? Object.values(groupedRegistrations) : []

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || 'User avatar'}
                width={80}
                height={80}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center text-3xl">
                {profile?.full_name?.[0] || user.email?.[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold">{profile?.full_name || 'Welcome'}</h1>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* My Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">My Events</h2>
              <Link href="/events/new">
                <Button size="sm">Create Event</Button>
              </Link>
            </div>

            <div className="space-y-4">
              {myEvents && myEvents.length > 0 ? (
                myEvents.map((event) => (
                  <Card key={event.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {event.event_categories?.name}
                            </Badge>
                            <Badge variant={
                              event.status === 'published' ? 'default' :
                              event.status === 'draft' ? 'outline' :
                              event.status === 'cancelled' ? 'destructive' : 'secondary'
                            } className="text-xs">
                              {event.status}
                            </Badge>
                            {event.has_time_slots && (
                              <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Sessions
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">
                            <Link href={`/events/${event.slug}`} className="hover:text-blue-400">
                              {event.title}
                            </Link>
                          </CardTitle>
                        </div>
                        <div className="flex gap-1">
                          <Link href={`/events/${event.slug}/slots`}>
                            <Button size="sm" variant="ghost" title="Manage Time Slots">
                              <Clock className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/events/edit/${event.slug}`}>
                            <Button size="sm" variant="ghost" title="Edit Event">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteEventButton eventId={event.id} eventTitle={event.title} imageUrl={event.image_url} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(event.start_datetime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.registration_count} registrations
                            {event.capacity && ` / ${event.capacity} capacity`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">You haven&apos;t created any events yet.</p>
                    <Link href="/events/new">
                      <Button className="mt-4">Create Your First Event</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* My Registrations */}
          <div>
            <h2 className="text-2xl font-bold mb-4">My Registrations</h2>

            <div className="space-y-4">
              {groupedArray && groupedArray.length > 0 ? (
                groupedArray.map((group) => (
                  <Card key={group.event?.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {group.event?.event_categories?.name}
                        </Badge>
                        {group.registrations.length > 1 && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {group.registrations.length} sessions
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/events/${group.event?.slug}`}
                          className="hover:text-blue-400"
                        >
                          {group.event?.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {group.registrations.map((registration) => (
                          <div key={registration.id} className="text-sm text-gray-400">
                            {registration.time_slot_id && registration.event_time_slots ? (
                              <div className="flex items-start gap-2 p-2 bg-white/5 rounded-lg">
                                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-white">
                                    {registration.event_time_slots.title}
                                  </p>
                                  <p>
                                    {formatDateTime(registration.event_time_slots.start_datetime)}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDateTime(group.event?.start_datetime)}</span>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add to Calendar buttons */}
                        {group.event && (
                          <AddToCalendarButtons
                            event={{
                              title: group.event.title,
                              description: group.event.description,
                              start_datetime: group.event.start_datetime,
                              end_datetime: group.event.end_datetime,
                              timezone: group.event.timezone,
                              location_type: group.event.location_type,
                              address: group.event.address,
                              meeting_url: group.event.meeting_url,
                              organization_name: group.event.organization_name,
                              slug: group.event.slug,
                            }}
                            registeredSlots={
                              group.registrations
                                .filter((r) => r.time_slot_id && r.event_time_slots)
                                .map((r) => ({
                                  id: r.event_time_slots!.id,
                                  title: r.event_time_slots!.title,
                                  start_time: r.event_time_slots!.start_datetime,
                                  end_time: r.event_time_slots!.end_datetime,
                                }))
                            }
                            variant="compact"
                            className="mt-3 pt-3 border-t border-white/10"
                          />
                        )}

                        {/* Show first registration's guest count and notes */}
                        {group.registrations[0].guest_count > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{group.registrations[0].guest_count} guest(s)</span>
                          </div>
                        )}
                        {group.registrations[0].special_notes && (
                          <div className="mt-2 p-2 bg-white/5 rounded text-sm">
                            <p className="text-xs text-gray-500">Note:</p>
                            <p className="text-gray-400">{group.registrations[0].special_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">You haven&apos;t registered for any events yet.</p>
                    <Link href="/events">
                      <Button className="mt-4">Browse Events</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
