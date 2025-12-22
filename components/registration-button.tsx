'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface RegistrationButtonProps {
  eventId: string
  eventSlug: string
  isRegistered: boolean
  isFull: boolean
  isOwner: boolean
  eventStatus: string
}

export function RegistrationButton({
  eventId,
  eventSlug,
  isRegistered,
  isFull,
  isOwner,
  eventStatus,
}: RegistrationButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [guestCount, setGuestCount] = useState(0)
  const [specialNotes, setSpecialNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?redirectTo=/events/${eventSlug}`)
      return
    }

    const { error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        guest_count: guestCount,
        special_notes: specialNotes || null,
      })

    if (regError) {
      setError(regError.message)
      setLoading(false)
    } else {
      router.refresh()
      setShowForm(false)
    }
  }

  const handleCancelRegistration = async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error: cancelError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)

    if (cancelError) {
      setError(cancelError.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (isOwner) {
    return (
      <Button className="w-full" variant="outline" disabled>
        You are the organizer
      </Button>
    )
  }

  if (eventStatus === 'cancelled') {
    return (
      <Button className="w-full" variant="destructive" disabled>
        Event Cancelled
      </Button>
    )
  }

  if (eventStatus === 'completed') {
    return (
      <Button className="w-full" variant="outline" disabled>
        Event Completed
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <div className="space-y-2">
        <Button className="w-full" variant="outline" disabled>
          Registered
        </Button>
        <Button
          className="w-full"
          variant="destructive"
          onClick={handleCancelRegistration}
          disabled={loading}
        >
          {loading ? 'Cancelling...' : 'Cancel Registration'}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    )
  }

  if (isFull) {
    return (
      <Button className="w-full" variant="destructive" disabled>
        Event Full
      </Button>
    )
  }

  if (!showForm) {
    return (
      <Button className="w-full" onClick={() => setShowForm(true)}>
        Register for Event
      </Button>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guestCount">Number of Guests (Optional)</Label>
        <Input
          id="guestCount"
          type="number"
          min="0"
          value={guestCount}
          onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
        <Textarea
          id="specialNotes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          placeholder="Any dietary restrictions, accessibility needs, etc."
          rows={3}
          className="bg-white/5 border-white/10"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Registering...' : 'Confirm Registration'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowForm(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
