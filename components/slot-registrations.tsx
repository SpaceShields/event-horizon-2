'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import Image from 'next/image'
import type { RegistrationWithProfile } from '@/lib/registration-helpers'

interface SlotRegistrationsProps {
  slotId: string
  slotTitle?: string
  registrations: RegistrationWithProfile[]
  isOpen?: boolean
}

/**
 * Collapsible component to display registrations for a specific time slot.
 * Shows attendee avatars, names, guest counts, notes, and registration times.
 */
export function SlotRegistrations({
  slotId,
  registrations,
  isOpen: defaultOpen = false,
}: SlotRegistrationsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  // Calculate totals
  const registrationCount = registrations.length
  const totalWithGuests = registrations.reduce(
    (sum, reg) => sum + 1 + (reg.guest_count || 0),
    0
  )

  const toggleNote = (regId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(regId)) {
        newSet.delete(regId)
      } else {
        newSet.add(regId)
      }
      return newSet
    })
  }

  // Get initials from name
  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || '?'
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Check if note is long enough to need truncation
  const isLongNote = (note: string | null): boolean => {
    return (note?.length || 0) > 100
  }

  if (registrationCount === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
        No registrations yet
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header - Collapsible Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full text-left py-1"
        aria-expanded={isOpen}
        aria-controls={`slot-registrations-${slotId}`}
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="font-medium">
          {registrationCount} registered
          {totalWithGuests > registrationCount && (
            <span className="text-gray-500">
              {' '}({totalWithGuests} total with guests)
            </span>
          )}
        </span>
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div
          id={`slot-registrations-${slotId}`}
          className="mt-3 space-y-3"
        >
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {registration.profiles?.avatar_url ? (
                  <Image
                    src={registration.profiles.avatar_url}
                    alt={registration.profiles.full_name || 'Attendee avatar'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-400">
                      {getInitials(registration.profiles?.full_name ?? null)}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <p className="font-medium text-white truncate">
                    {registration.profiles?.full_name || 'Anonymous'}
                  </p>

                  {/* Guest count */}
                  {registration.guest_count > 0 && (
                    <p className="text-sm text-gray-400">
                      +{registration.guest_count} guest{registration.guest_count > 1 ? 's' : ''}
                    </p>
                  )}

                  {/* Registration timestamp */}
                  <p className="text-xs text-gray-500 mt-1">
                    Registered {formatDateTime(registration.created_at)}
                  </p>
                </div>
              </div>

              {/* Special Notes */}
              {registration.special_notes && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-sm">
                    <span className="text-gray-400 font-medium">Note: </span>
                    {isLongNote(registration.special_notes) &&
                    !expandedNotes.has(registration.id) ? (
                      <>
                        <span className="text-gray-300">
                          {registration.special_notes.slice(0, 100)}...
                        </span>
                        <button
                          onClick={() => toggleNote(registration.id)}
                          className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                        >
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-300">
                          {registration.special_notes}
                        </span>
                        {isLongNote(registration.special_notes) && (
                          <button
                            onClick={() => toggleNote(registration.id)}
                            className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Component to display whole-event (legacy) registrations.
 * Used when an event has time slots but some registrations
 * have no time_slot_id assigned.
 */
interface WholeEventRegistrationsProps {
  registrations: RegistrationWithProfile[]
  isOpen?: boolean
}

export function WholeEventRegistrations({
  registrations,
  isOpen: defaultOpen = false,
}: WholeEventRegistrationsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

  const registrationCount = registrations.length
  const totalWithGuests = registrations.reduce(
    (sum, reg) => sum + 1 + (reg.guest_count || 0),
    0
  )

  const toggleNote = (regId: string) => {
    setExpandedNotes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(regId)) {
        newSet.delete(regId)
      } else {
        newSet.add(regId)
      }
      return newSet
    })
  }

  const getInitials = (name: string | null): string => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || '?'
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const isLongNote = (note: string | null): boolean => {
    return (note?.length || 0) > 100
  }

  if (registrationCount === 0) {
    return null
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-lg font-semibold text-white hover:text-gray-200 transition-colors w-full text-left"
        aria-expanded={isOpen}
        aria-controls="whole-event-registrations"
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 flex-shrink-0" />
        )}
        <span>
          Whole Event Registrations (Legacy)
          <span className="text-sm font-normal text-gray-400 ml-2">
            {registrationCount} registered
            {totalWithGuests > registrationCount && (
              <span> ({totalWithGuests} total with guests)</span>
            )}
          </span>
        </span>
      </button>

      {isOpen && (
        <div id="whole-event-registrations" className="mt-4 space-y-3">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-start gap-3">
                {registration.profiles?.avatar_url ? (
                  <Image
                    src={registration.profiles.avatar_url}
                    alt={registration.profiles.full_name || 'Attendee avatar'}
                    width={40}
                    height={40}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-400">
                      {getInitials(registration.profiles?.full_name ?? null)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {registration.profiles?.full_name || 'Anonymous'}
                  </p>

                  {registration.guest_count > 0 && (
                    <p className="text-sm text-gray-400">
                      +{registration.guest_count} guest{registration.guest_count > 1 ? 's' : ''}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Registered {formatDateTime(registration.created_at)}
                  </p>
                </div>
              </div>

              {registration.special_notes && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-sm">
                    <span className="text-gray-400 font-medium">Note: </span>
                    {isLongNote(registration.special_notes) &&
                    !expandedNotes.has(registration.id) ? (
                      <>
                        <span className="text-gray-300">
                          {registration.special_notes.slice(0, 100)}...
                        </span>
                        <button
                          onClick={() => toggleNote(registration.id)}
                          className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                        >
                          Show more
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-300">
                          {registration.special_notes}
                        </span>
                        {isLongNote(registration.special_notes) && (
                          <button
                            onClick={() => toggleNote(registration.id)}
                            className="text-blue-400 hover:text-blue-300 ml-1 text-xs"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
