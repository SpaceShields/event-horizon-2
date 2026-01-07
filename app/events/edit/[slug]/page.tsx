import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { EventForm } from '@/components/event-form'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Users, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkEventPermissions } from '@/lib/auth-helpers'

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

  // Check permissions (owner or admin)
  const permissions = await checkEventPermissions(event.id)
  if (!permissions.canManage) {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Edit Event</h1>

          {/* Manage Administrators - Only visible to owner */}
          {permissions.isOwner && (
            <Link href={`/events/${event.slug}/administrators`}>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Administrators
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        <EventForm
          categories={categories || []}
          event={event}
        />
      </div>
    </div>
  )
}
