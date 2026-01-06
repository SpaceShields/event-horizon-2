-- Event Horizon Database Views
-- Version: 1.0.0
-- Description: Views for computed data and common query patterns

-- ============================================================================
-- EVENTS_WITH_STATS VIEW
-- Events with registration count, total attendees, and capacity status
-- ============================================================================

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
        (SELECT SUM(1 + r.guest_count)
         FROM public.event_registrations r
         WHERE r.event_id = e.id
         AND r.attendance_status != 'cancelled'),
        0
    )::INTEGER AS total_attendees,
    -- Is the event at capacity?
    CASE
        WHEN e.capacity IS NULL THEN false
        ELSE COALESCE(
            (SELECT SUM(1 + r.guest_count)
             FROM public.event_registrations r
             WHERE r.event_id = e.id
             AND r.attendance_status != 'cancelled'),
            0
        ) >= e.capacity
    END AS is_full
FROM public.events e;

COMMENT ON VIEW public.events_with_stats IS 'Events with computed registration statistics';
COMMENT ON COLUMN public.events_with_stats.registration_count IS 'Number of active registrations (excluding cancelled)';
COMMENT ON COLUMN public.events_with_stats.total_attendees IS 'Total expected attendees including guests';
COMMENT ON COLUMN public.events_with_stats.is_full IS 'True if total_attendees >= capacity';

-- Enable RLS on the view by granting appropriate permissions
GRANT SELECT ON public.events_with_stats TO anon, authenticated;

-- ============================================================================
-- UPCOMING_EVENTS VIEW
-- Published events that haven't ended yet, sorted by start date
-- ============================================================================

DROP VIEW IF EXISTS public.upcoming_events;
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
-- USER_EVENT_REGISTRATIONS VIEW
-- User registrations with event details for the dashboard
-- ============================================================================

DROP VIEW IF EXISTS public.user_event_registrations;
CREATE OR REPLACE VIEW public.user_event_registrations AS
SELECT
    r.id AS registration_id,
    r.user_id,
    r.guest_count,
    r.special_notes,
    r.registration_date,
    r.attendance_status,
    e.id AS event_id,
    e.title AS event_title,
    e.slug AS event_slug,
    e.start_datetime AS event_start,
    e.end_datetime AS event_end,
    e.location_type AS event_location_type,
    e.address AS event_address,
    e.meeting_url AS event_meeting_url,
    e.status AS event_status,
    e.image_url AS event_image_url,
    c.name AS category_name,
    c.slug AS category_slug,
    p.full_name AS organizer_name,
    p.email AS organizer_email
FROM public.event_registrations r
JOIN public.events e ON e.id = r.event_id
JOIN public.event_categories c ON c.id = e.category_id
JOIN public.profiles p ON p.id = e.owner_id
ORDER BY r.registration_date DESC;

COMMENT ON VIEW public.user_event_registrations IS 'User registrations with full event and organizer details';

GRANT SELECT ON public.user_event_registrations TO authenticated;

-- ============================================================================
-- EVENT_ATTENDEES VIEW
-- List of attendees for event owners to manage
-- ============================================================================

DROP VIEW IF EXISTS public.event_attendees;
CREATE OR REPLACE VIEW public.event_attendees AS
SELECT
    r.id AS registration_id,
    r.event_id,
    r.guest_count,
    r.special_notes,
    r.registration_date,
    r.attendance_status,
    p.id AS user_id,
    p.email AS attendee_email,
    p.full_name AS attendee_name,
    p.avatar_url AS attendee_avatar
FROM public.event_registrations r
JOIN public.profiles p ON p.id = r.user_id
ORDER BY r.registration_date ASC;

COMMENT ON VIEW public.event_attendees IS 'Attendee list for event management';

GRANT SELECT ON public.event_attendees TO authenticated;
