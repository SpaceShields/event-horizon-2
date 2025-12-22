import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { EventForm } from '@/components/event-form'
import { redirect, notFound } from 'next/navigation'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get event
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) {
    notFound()
  }

  // Check ownership
  if (event.owner_id !== user.id) {
    redirect('/dashboard')
  }

  // Get categories
  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Edit Event</h1>
        <EventForm categories={categories || []} event={event} />
      </div>
    </div>
  )
}
