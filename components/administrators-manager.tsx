'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, X, Crown, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import type { EventAdministratorWithProfile, Profile } from '@/lib/types/database'

interface AdministratorsManagerProps {
  eventId: string
}

interface AdministratorsData {
  administrators: EventAdministratorWithProfile[]
  owner: Profile | null
  isOwner: boolean
  canAddMore: boolean
}

export function AdministratorsManager({ eventId }: AdministratorsManagerProps) {
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [data, setData] = useState<AdministratorsData | null>(null)

  const fetchAdministrators = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/events/${eventId}/administrators`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch administrators')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch administrators')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Fetch administrators on mount
  useEffect(() => {
    fetchAdministrators()
  }, [fetchAdministrators])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  async function handleAddAdministrator(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setAdding(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`/api/events/${eventId}/administrators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add administrator')
      }

      setEmail('')
      setSuccessMessage('Administrator added successfully')
      await fetchAdministrators()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add administrator')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemoveAdministrator(adminId: string) {
    try {
      setRemovingId(adminId)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch(`/api/events/${eventId}/administrators/${adminId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove administrator')
      }

      setSuccessMessage('Administrator removed successfully')
      await fetchAdministrators()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove administrator')
    } finally {
      setRemovingId(null)
    }
  }

  const totalManagers = 1 + (data?.administrators.length ?? 0) // 1 owner + admins
  const maxManagers = 3

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          <span className="text-gray-400">Loading administrators...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">
            Event Administrators ({totalManagers}/{maxManagers})
          </h3>
          <p className="text-gray-400 text-sm">
            Add up to 2 administrators who can edit this event, manage time slots, and view registrations.
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
          <p className="text-green-400 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Owner Section */}
      <div className="space-y-3">
        <Label className="text-gray-400 text-xs uppercase tracking-wider">Owner</Label>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3">
          {data?.owner?.avatar_url ? (
            <Image
              src={data.owner.avatar_url}
              alt={data.owner.full_name || 'Owner'}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {data?.owner?.full_name || 'Unknown'}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {data?.owner?.email}
            </p>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
            Owner
          </span>
        </div>
      </div>

      {/* Administrators Section */}
      <div className="space-y-3">
        <Label className="text-gray-400 text-xs uppercase tracking-wider">
          Administrators ({data?.administrators.length ?? 0}/2)
        </Label>

        {data?.administrators.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No administrators added yet.</p>
        ) : (
          <div className="space-y-2">
            {data?.administrators.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3"
              >
                {admin.profiles?.avatar_url ? (
                  <Image
                    src={admin.profiles.avatar_url}
                    alt={admin.profiles.full_name || 'Admin'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {admin.profiles?.full_name?.[0]?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {admin.profiles?.full_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {admin.profiles?.email}
                  </p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                  Admin
                </span>
                {data?.isOwner && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleRemoveAdministrator(admin.id)}
                    disabled={removingId === admin.id}
                  >
                    {removingId === admin.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Administrator Form - Only visible to owner when under limit */}
      {data?.isOwner && data.canAddMore && (
        <form onSubmit={handleAddAdministrator} className="space-y-3">
          <Label className="text-gray-400 text-xs uppercase tracking-wider">
            Add Administrator
          </Label>
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="bg-white/5 border-white/10 flex-1"
              required
            />
            <Button
              type="submit"
              variant="outline"
              disabled={adding || !email.trim()}
              className="flex-shrink-0"
            >
              {adding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            The user must have an existing account on Event Horizon.
          </p>
        </form>
      )}

      {/* Info when at max capacity */}
      {data?.isOwner && !data.canAddMore && (
        <p className="text-sm text-gray-500 italic">
          Maximum number of administrators reached. Remove an administrator to add a new one.
        </p>
      )}

      {/* Info for non-owners */}
      {!data?.isOwner && (
        <p className="text-sm text-gray-500 italic">
          Only the event owner can add or remove administrators.
        </p>
      )}
    </div>
  )
}
