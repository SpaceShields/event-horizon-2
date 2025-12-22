import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Edit, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { DeleteEventButton } from '@/components/delete-event-button'

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
    .order('start_datetime', { ascending: false })

  // Get user's registrations
  const { data: myRegistrations } = await supabase
    .from('event_registrations')
    .select('*, events(*, event_categories(name, slug))')
    .eq('user_id', user.id)
    .eq('attendance_status', 'registered')
    .order('registration_date', { ascending: false })

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
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-20 h-20 rounded-full"
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
                          </div>
                          <CardTitle className="text-lg">
                            <Link href={`/events/${event.slug}`} className="hover:text-blue-400">
                              {event.title}
                            </Link>
                          </CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/events/edit/${event.slug}`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DeleteEventButton eventId={event.id} eventTitle={event.title} />
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
                    <p className="text-gray-400">You haven't created any events yet.</p>
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
              {myRegistrations && myRegistrations.length > 0 ? (
                myRegistrations.map((registration) => (
                  <Card key={registration.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {registration.events?.event_categories?.name}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        <Link
                          href={`/events/${registration.events?.slug}`}
                          className="hover:text-blue-400"
                        >
                          {registration.events?.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDateTime(registration.events?.start_datetime)}</span>
                        </div>
                        {registration.guest_count > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{registration.guest_count} guest(s)</span>
                          </div>
                        )}
                        {registration.special_notes && (
                          <div className="mt-2 p-2 bg-white/5 rounded">
                            <p className="text-xs">Note: {registration.special_notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-400">You haven't registered for any events yet.</p>
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
