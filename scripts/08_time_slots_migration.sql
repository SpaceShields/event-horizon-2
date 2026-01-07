-- ============================================================================
-- EVENT TIME SLOTS MIGRATION
-- Add optional time slots to events for granular registration
-- Version: 1.0.0
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENSURE update_updated_at_column function exists
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- NEW TABLE: event_time_slots
-- ============================================================================

CREATE TABLE public.event_time_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
    price DECIMAL(10, 2) CHECK (price IS NULL OR price >= 0),
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT time_slots_end_after_start
        CHECK (end_datetime > start_datetime)
);

-- Enable RLS on time_slots
ALTER TABLE public.event_time_slots ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX time_slots_event_id_idx ON public.event_time_slots(event_id);
CREATE INDEX time_slots_start_datetime_idx ON public.event_time_slots(start_datetime);
CREATE INDEX time_slots_sort_order_idx ON public.event_time_slots(event_id, sort_order);

-- Add comments
COMMENT ON TABLE public.event_time_slots IS 'Optional time slots within events for granular registration';
COMMENT ON COLUMN public.event_time_slots.title IS 'Title of the time slot (e.g., "Morning Session", "Networking Hour")';
COMMENT ON COLUMN public.event_time_slots.capacity IS 'Optional capacity limit for this specific slot';
COMMENT ON COLUMN public.event_time_slots.price IS 'Optional price override for this slot';
COMMENT ON COLUMN public.event_time_slots.sort_order IS 'Display order within the event';

-- ============================================================================
-- MODIFY TABLE: event_registrations
-- Add time_slot_id for slot-specific registrations
-- ============================================================================

-- Add time_slot_id column
ALTER TABLE public.event_registrations
    ADD COLUMN time_slot_id UUID REFERENCES public.event_time_slots(id) ON DELETE CASCADE;

-- Drop old unique constraint
ALTER TABLE public.event_registrations
    DROP CONSTRAINT IF EXISTS event_registrations_unique_user_event;

-- Add new composite unique constraint (allows NULL time_slot_id for legacy registrations)
-- Using partial unique indexes for proper NULL handling
CREATE UNIQUE INDEX event_registrations_unique_user_event_slot
    ON public.event_registrations(event_id, user_id, time_slot_id)
    WHERE time_slot_id IS NOT NULL;

CREATE UNIQUE INDEX event_registrations_unique_user_event_no_slot
    ON public.event_registrations(event_id, user_id)
    WHERE time_slot_id IS NULL;

-- Index for time_slot queries
CREATE INDEX event_registrations_time_slot_id_idx ON public.event_registrations(time_slot_id);

-- Add comment
COMMENT ON COLUMN public.event_registrations.time_slot_id IS 'Optional reference to specific time slot. NULL means whole-event registration (legacy)';

-- ============================================================================
-- CREATE VIEW: time_slots_with_stats
-- Time slots with registration statistics
-- ============================================================================

CREATE OR REPLACE VIEW public.time_slots_with_stats AS
SELECT
    ts.id,
    ts.event_id,
    ts.title,
    ts.description,
    ts.start_datetime,
    ts.end_datetime,
    ts.capacity,
    ts.price,
    ts.sort_order,
    ts.created_at,
    ts.updated_at,
    -- Registration count (number of unique registrations, excluding cancelled)
    COALESCE(
        (SELECT COUNT(*)
         FROM public.event_registrations r
         WHERE r.time_slot_id = ts.id
         AND r.attendance_status != 'cancelled'),
        0
    )::INTEGER AS registration_count,
    -- Total attendees (registrants + their guests, excluding cancelled)
    COALESCE(
        (SELECT SUM(1 + COALESCE(r.guest_count, 0))
         FROM public.event_registrations r
         WHERE r.time_slot_id = ts.id
         AND r.attendance_status != 'cancelled'),
        0
    )::INTEGER AS total_attendees,
    -- Remaining capacity
    CASE
        WHEN ts.capacity IS NULL THEN NULL
        ELSE ts.capacity - COALESCE(
            (SELECT SUM(1 + COALESCE(r.guest_count, 0))
             FROM public.event_registrations r
             WHERE r.time_slot_id = ts.id
             AND r.attendance_status != 'cancelled'),
            0
        )::INTEGER
    END AS remaining_capacity,
    -- Is full?
    CASE
        WHEN ts.capacity IS NULL THEN false
        ELSE COALESCE(
            (SELECT SUM(1 + COALESCE(r.guest_count, 0))
             FROM public.event_registrations r
             WHERE r.time_slot_id = ts.id
             AND r.attendance_status != 'cancelled'),
            0
        ) >= ts.capacity
    END AS is_full
FROM public.event_time_slots ts;

COMMENT ON VIEW public.time_slots_with_stats IS 'Time slots with computed registration statistics';

-- Grant permissions on view
GRANT SELECT ON public.time_slots_with_stats TO anon, authenticated;

-- ============================================================================
-- UPDATE VIEW: events_with_stats
-- Add has_time_slots column
-- ============================================================================

DROP VIEW IF EXISTS public.upcoming_events;
DROP VIEW IF EXISTS public.events_with_stats;

CREATE OR REPLACE VIEW public.events_with_stats AS
SELECT
    e.id,
    e.title,
    e.slug,
    e.description,
    e.organization_name,
    e.owner_id,
    e.category_id,
    e.location_type,
    e.address,
    e.meeting_url,
    e.start_datetime,
    e.end_datetime,
    e.timezone,
    e.capacity,
    e.ticket_price,
    e.registration_instructions,
    e.status,
    e.image_url,
    e.created_at,
    e.updated_at,
    -- Registration count (number of unique registrations, excluding cancelled)
    COALESCE(
        (SELECT COUNT(*)
         FROM public.event_registrations r
         WHERE r.event_id = e.id
         AND r.attendance_status != 'cancelled'),
        0
    )::INTEGER AS registration_count,
    -- Total attendees (registrants + their guests, excluding cancelled)
    COALESCE(
        (SELECT SUM(1 + COALESCE(r.guest_count, 0))
         FROM public.event_registrations r
         WHERE r.event_id = e.id
         AND r.attendance_status != 'cancelled'),
        0
    )::INTEGER AS total_attendees,
    -- Is the event at capacity?
    CASE
        WHEN e.capacity IS NULL THEN false
        ELSE COALESCE(
            (SELECT SUM(1 + COALESCE(r.guest_count, 0))
             FROM public.event_registrations r
             WHERE r.event_id = e.id
             AND r.attendance_status != 'cancelled'),
            0
        ) >= e.capacity
    END AS is_full,
    -- Does the event have time slots?
    (SELECT COUNT(*) > 0
     FROM public.event_time_slots ts
     WHERE ts.event_id = e.id)::BOOLEAN AS has_time_slots
FROM public.events e;

COMMENT ON VIEW public.events_with_stats IS 'Events with computed registration statistics and time slot info';
COMMENT ON COLUMN public.events_with_stats.has_time_slots IS 'True if the event has defined time slots';

-- Re-grant permissions
GRANT SELECT ON public.events_with_stats TO anon, authenticated;

-- Recreate upcoming_events view
CREATE OR REPLACE VIEW public.upcoming_events AS
SELECT
    ews.*,
    c.name AS category_name,
    c.slug AS category_slug,
    c.icon AS category_icon,
    p.full_name AS owner_name,
    p.avatar_url AS owner_avatar_url
FROM public.events_with_stats ews
JOIN public.event_categories c ON c.id = ews.category_id
JOIN public.profiles p ON p.id = ews.owner_id
WHERE ews.status IN ('published', 'ongoing')
AND ews.end_datetime > NOW()
ORDER BY ews.start_datetime ASC;

COMMENT ON VIEW public.upcoming_events IS 'Published upcoming events with category and owner info';

GRANT SELECT ON public.upcoming_events TO anon, authenticated;

-- ============================================================================
-- RLS POLICIES FOR event_time_slots
-- ============================================================================

-- Policy: Public can view time slots for published/ongoing/completed events
CREATE POLICY "Public can view time slots for published events"
ON public.event_time_slots FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND status IN ('published', 'ongoing', 'completed')
    )
);

-- Policy: Event owners can insert time slots
CREATE POLICY "Event owners can insert time slots"
ON public.event_time_slots FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND owner_id = auth.uid()
    )
);

-- Policy: Event owners can update their time slots
CREATE POLICY "Event owners can update time slots"
ON public.event_time_slots FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND owner_id = auth.uid()
    )
);

-- Policy: Event owners can delete their time slots
CREATE POLICY "Event owners can delete time slots"
ON public.event_time_slots FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND owner_id = auth.uid()
    )
);

-- ============================================================================
-- TRIGGER: Update updated_at on time_slots
-- ============================================================================

CREATE TRIGGER update_event_time_slots_updated_at
    BEFORE UPDATE ON public.event_time_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
