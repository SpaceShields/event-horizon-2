import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { EventForm } from '@/components/event-form'
import { redirect } from 'next/navigation'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/events/new')
  }

  const { data: categories } = await supabase
    .from('event_categories')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Create New Event</h1>
        <EventForm categories={categories || []} />
      </div>
    </div>
  )
}
