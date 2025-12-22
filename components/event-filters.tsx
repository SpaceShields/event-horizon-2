'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface EventFiltersProps {
  categories: Array<{ id: number; name: string; slug: string }>
}

export function EventFilters({ categories }: EventFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/events?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/events')
  }

  const hasFilters = searchParams.has('category') || searchParams.has('location_type') || searchParams.has('price')

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-2">Category</label>
        <Select
          value={searchParams.get('category') || 'all'}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="bg-white/5 border-white/10"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-2">Location Type</label>
        <Select
          value={searchParams.get('location_type') || 'all'}
          onChange={(e) => handleFilterChange('location_type', e.target.value)}
          className="bg-white/5 border-white/10"
        >
          <option value="all">All Types</option>
          <option value="physical">Physical</option>
          <option value="virtual">Virtual</option>
          <option value="hybrid">Hybrid</option>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium mb-2">Price</label>
        <Select
          value={searchParams.get('price') || 'all'}
          onChange={(e) => handleFilterChange('price', e.target.value)}
          className="bg-white/5 border-white/10"
        >
          <option value="all">All Prices</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium mb-2 invisible">Clear</label>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
