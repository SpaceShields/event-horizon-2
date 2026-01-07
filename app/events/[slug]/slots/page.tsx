import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { TimelineManager } from '@/components/timeline-manager'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EventSlotsPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventSlotsPage({ params }: EventSlotsPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirectTo=/events/${slug}/slots`)
  }

  // Fetch event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Check if user is the owner
  if (event.owner_id !== user.id) {
    redirect(`/events/${slug}`)
  }

  // Fetch time slots with stats
  const { data: slots } = await supabase
    .from('time_slots_with_stats')
    .select('*')
    .eq('event_id', event.id)
    .order('sort_order', { ascending: true })
    .order('start_datetime', { ascending: true })

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/events/edit/${slug}`}>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Time Slots</h1>
          <p className="text-gray-400">
            Add and manage time slots for <span className="text-white font-medium">{event.title}</span>
          </p>
        </div>

        {/* Timeline Manager */}
        <TimelineManager
          event={event}
          initialSlots={slots || []}
        />
      </div>
    </div>
  )
}
