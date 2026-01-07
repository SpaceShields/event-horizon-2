import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/navigation'
import { AdministratorsManager } from '@/components/administrators-manager'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkEventPermissions } from '@/lib/auth-helpers'

interface EventAdministratorsPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventAdministratorsPage({ params }: EventAdministratorsPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirectTo=/events/${slug}/administrators`)
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

  // Check permissions - ONLY owners can manage administrators (not admins)
  const permissions = await checkEventPermissions(event.id)
  if (!permissions.isOwner) {
    redirect(`/events/${slug}`)
  }

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
          <h1 className="text-3xl font-bold mb-2">Manage Administrators</h1>
          <p className="text-gray-400">
            Add and manage administrators for <span className="text-white font-medium">{event.title}</span>
          </p>
        </div>

        {/* Administrators Manager */}
        <AdministratorsManager eventId={event.id} />
      </div>
    </div>
  )
}
