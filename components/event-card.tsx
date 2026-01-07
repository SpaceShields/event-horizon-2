import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, DollarSign, Video, Building, Clock } from 'lucide-react'
import { formatDateTime, formatPrice } from '@/lib/utils'

import type { Database } from '@/lib/types/database'

type EventWithStats = Database['public']['Views']['events_with_stats']['Row'] & {
  event_categories?: { name: string; slug: string } | null
}

interface EventCardProps {
  event: EventWithStats
}

export function EventCard({ event }: EventCardProps) {
  const LocationIcon = event.location_type === 'virtual' ? Video : event.location_type === 'physical' ? Building : MapPin

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="h-full hover:border-blue-500/50 transition-colors bg-white/5 backdrop-blur-sm border-white/10">
        {event.image_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
            <Image
              src={event.image_url}
              alt={event.title ?? 'Event image'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {event.event_categories?.name}
            </Badge>
            <div className="flex gap-1">
              {event.has_time_slots && (
                <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Sessions
                </Badge>
              )}
              {event.is_full && (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          {event.organization_name && (
            <p className="text-sm text-gray-400">by {event.organization_name}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(event.start_datetime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <LocationIcon className="w-4 h-4" />
            <span className="capitalize">{event.location_type}</span>
          </div>
          {event.has_time_slots ? (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Clock className="w-4 h-4" />
              <span>Multiple time slots available</span>
            </div>
          ) : event.capacity ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                {event.total_attendees} / {event.capacity} registered
              </span>
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            <span>{formatPrice(event.ticket_price)}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
