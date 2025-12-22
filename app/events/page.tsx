import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { EventCard } from '@/components/event-card'
import { EventFilters } from '@/components/event-filters'

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; location_type?: string; price?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('events_with_stats')
    .select('*, event_categories(name, slug, icon), profiles(full_name)')
    .eq('status', 'published')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })

  // Apply filters
  if (params.category) {
    const { data: category } = await supabase
      .from('event_categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (params.location_type) {
    query = query.eq('location_type', params.location_type)
  }

  if (params.price === 'free') {
    query = query.or('ticket_price.is.null,ticket_price.eq.0')
  } else if (params.price === 'paid') {
    query = query.gt('ticket_price', 0)
  }

  const { data: events } = await query
  const { data: categories } = await supabase.from('event_categories').select('*')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Events</h1>
          <p className="text-gray-400">Find space-related events near you or online</p>
        </div>

        <EventFilters categories={categories || []} />

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events && events.length > 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No events found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
