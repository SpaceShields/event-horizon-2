'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, DollarSign, Check, AlertCircle } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'

import type { TimeSlotWithStats } from '@/lib/types/database'

interface TimeSlotSelectorProps {
  slots: TimeSlotWithStats[]
  selectedSlotIds: string[]
  onSelectionChange: (slotIds: string[]) => void
  existingRegistrations?: string[] // slot IDs user is already registered for
  disabled?: boolean
}

export function TimeSlotSelector({
  slots,
  selectedSlotIds,
  onSelectionChange,
  existingRegistrations = [],
  disabled = false,
}: TimeSlotSelectorProps) {
  // Calculate total price for selected slots
  const totalPrice = useMemo(() => {
    return slots
      .filter((slot) => selectedSlotIds.includes(slot.id))
      .reduce((sum, slot) => sum + (slot.price || 0), 0)
  }, [slots, selectedSlotIds])

  // Get available slots (not full and not already registered)
  const availableSlots = useMemo(() => {
    return slots.filter(
      (slot) => !slot.is_full && !existingRegistrations.includes(slot.id)
    )
  }, [slots, existingRegistrations])

  const handleSlotToggle = (slotId: string) => {
    if (disabled) return

    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.is_full || existingRegistrations.includes(slotId)) return

    if (selectedSlotIds.includes(slotId)) {
      onSelectionChange(selectedSlotIds.filter((id) => id !== slotId))
    } else {
      onSelectionChange([...selectedSlotIds, slotId])
    }
  }

  const handleSelectAll = () => {
    if (disabled) return
    const allAvailableIds = availableSlots.map((slot) => slot.id)
    onSelectionChange(allAvailableIds)
  }

  const handleClearSelection = () => {
    if (disabled) return
    onSelectionChange([])
  }

  if (slots.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Select Time Slots</h3>
        <div className="flex gap-2">
          {availableSlots.length > 0 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={disabled || selectedSlotIds.length === availableSlots.length}
              >
                Select All Available
              </Button>
              {selectedSlotIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={disabled}
                >
                  Clear
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => {
          const isSelected = selectedSlotIds.includes(slot.id)
          const isAlreadyRegistered = existingRegistrations.includes(slot.id)
          const isUnavailable = slot.is_full || isAlreadyRegistered

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => handleSlotToggle(slot.id)}
              disabled={disabled || isUnavailable}
              className={`
                w-full text-left p-4 rounded-lg border transition-all
                ${isSelected
                  ? 'bg-blue-500/20 border-blue-500/50 ring-1 ring-blue-500/50'
                  : isUnavailable
                    ? 'bg-white/5 border-white/5 opacity-60 cursor-not-allowed'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }
              `}
              aria-pressed={isSelected}
              aria-disabled={isUnavailable}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{slot.title}</span>
                    {isAlreadyRegistered && (
                      <Badge variant="secondary" className="text-xs">
                        Already Registered
                      </Badge>
                    )}
                    {slot.is_full && !isAlreadyRegistered && (
                      <Badge variant="destructive" className="text-xs">
                        Full
                      </Badge>
                    )}
                  </div>

                  {slot.description && (
                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                      {slot.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(slot.start_datetime)}
                    </span>

                    {slot.capacity ? (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {slot.remaining_capacity !== null
                          ? `${slot.remaining_capacity} spots left`
                          : `${slot.total_attendees} / ${slot.capacity}`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Unlimited
                      </span>
                    )}

                    {slot.price !== null && slot.price > 0 && (
                      <span className="flex items-center gap-1 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        {formatPrice(slot.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`
                      w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors
                      ${isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : isUnavailable
                          ? 'border-white/20 bg-white/5'
                          : 'border-white/30 hover:border-white/50'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                    {isAlreadyRegistered && !isSelected && (
                      <Check className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Summary */}
      {selectedSlotIds.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">
              {selectedSlotIds.length} slot{selectedSlotIds.length !== 1 ? 's' : ''} selected
            </span>
            <span className="font-semibold text-lg">
              {totalPrice > 0 ? formatPrice(totalPrice) : 'Free'}
            </span>
          </div>
        </div>
      )}

      {availableSlots.length === 0 && (
        <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">
            {existingRegistrations.length > 0 && existingRegistrations.length === slots.length
              ? 'You are already registered for all time slots.'
              : 'All time slots are currently full.'}
          </span>
        </div>
      )}
    </div>
  )
}
