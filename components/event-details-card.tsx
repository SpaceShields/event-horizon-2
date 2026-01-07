'use client'

import { Calendar, MapPin, Users, Clock, Globe, Video, Building, ArrowRight, DollarSign } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'

import type { TimeSlotWithStats } from '@/lib/types/database'

interface EventDetailsCardProps {
  event: {
    start_datetime: string
    end_datetime: string
    location_type: 'physical' | 'virtual' | 'hybrid'
    address?: string | null
    meeting_url?: string | null
    timezone: string
    capacity?: number | null
    total_attendees?: number
    registration_count?: number
    has_time_slots: boolean
    ticket_price?: number | null
  }
  timeSlots: TimeSlotWithStats[]
  onClick: () => void
  disabled?: boolean
}

export function EventDetailsCard({ event, timeSlots, onClick, disabled = false }: EventDetailsCardProps) {
  const LocationIcon = event.location_type === 'virtual' ? Video : event.location_type === 'physical' ? Building : MapPin

  // Calculate price display
  const getPriceDisplay = () => {
    if (event.has_time_slots && timeSlots.length > 0) {
      const hasPaidSlots = timeSlots.some(s => s.price && s.price > 0)
      if (hasPaidSlots) {
        const minPrice = Math.min(...timeSlots.filter(s => s.price && s.price > 0).map(s => s.price!))
        const maxPrice = Math.max(...timeSlots.map(s => s.price || 0))
        if (minPrice === maxPrice) {
          return formatPrice(minPrice)
        }
        return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
      }
      return 'Free'
    }
    return formatPrice(event.ticket_price ?? null)
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-2xl p-6
        transition-all duration-300 group
        ${disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-blue-500/50 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer'
        }
      `}
    >
      {/* Price Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <p className="text-sm text-gray-400 mb-1">Price</p>
          <p className="text-2xl font-bold text-white">{getPriceDisplay()}</p>
        </div>
        <div className={`
          p-3 rounded-full bg-blue-500/10 text-blue-400
          transition-all duration-300
          ${!disabled && 'group-hover:bg-blue-500/20 group-hover:scale-110'}
        `}>
          <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${!disabled && 'group-hover:translate-x-1'}`} />
        </div>
      </div>

      {/* Event Details Grid */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white">Date & Time</p>
            <p className="text-sm text-gray-400">{formatDateTime(event.start_datetime)}</p>
            <p className="text-sm text-gray-400">to {formatDateTime(event.end_datetime)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <LocationIcon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white capitalize">{event.location_type} Event</p>
            {event.address && (
              <p className="text-sm text-gray-400">{event.address}</p>
            )}
            {event.meeting_url && (
              <p className="text-sm text-blue-400">Online meeting link available</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-white">Timezone</p>
            <p className="text-sm text-gray-400">{event.timezone}</p>
          </div>
        </div>

        {!event.has_time_slots && (
          event.capacity ? (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Attendees</p>
                <p className="text-sm text-gray-400">
                  {event.total_attendees} / {event.capacity} spots filled
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Unlimited Capacity</p>
                <p className="text-sm text-gray-400">
                  {event.registration_count} registered
                </p>
              </div>
            </div>
          )
        )}

        {event.has_time_slots && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Sessions</p>
              <p className="text-sm text-gray-400">
                {timeSlots.length} time slot{timeSlots.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Click Hint */}
      {!disabled && (
        <div className={`
          mt-6 pt-4 border-t border-white/10 flex items-center justify-between
          text-sm text-gray-500 transition-colors duration-300
          group-hover:text-blue-400
        `}>
          <span>Click to register</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      )}
    </button>
  )
}
