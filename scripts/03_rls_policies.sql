-- Event Horizon Row Level Security Policies
-- Version: 1.0.0
-- Description: RLS policies to secure data access at the row level

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Allow users to view all profiles (for displaying event organizer info)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for manual profile creation if needed)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- EVENT_CATEGORIES POLICIES
-- ============================================================================

-- Categories are readable by everyone (including anonymous users)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.event_categories;
CREATE POLICY "Categories are viewable by everyone"
    ON public.event_categories
    FOR SELECT
    USING (true);

-- Only admins can modify categories (handled via service role key)
-- No INSERT/UPDATE/DELETE policies for regular users

-- ============================================================================
-- EVENTS POLICIES
-- ============================================================================

-- Published events are viewable by everyone
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
CREATE POLICY "Published events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (
        status = 'published'
        OR status = 'ongoing'
        OR status = 'completed'
        OR owner_id = auth.uid()
    );

-- Authenticated users can create events
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
CREATE POLICY "Authenticated users can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND owner_id = auth.uid()
    );

-- Event owners can update their events
DROP POLICY IF EXISTS "Event owners can update their events" ON public.events;
CREATE POLICY "Event owners can update their events"
    ON public.events
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Event owners can delete their events
DROP POLICY IF EXISTS "Event owners can delete their events" ON public.events;
CREATE POLICY "Event owners can delete their events"
    ON public.events
    FOR DELETE
    USING (owner_id = auth.uid());

-- ============================================================================
-- EVENT_REGISTRATIONS POLICIES
-- ============================================================================

-- Event owners can view all registrations for their events
-- Users can view their own registrations
DROP POLICY IF EXISTS "Users can view relevant registrations" ON public.event_registrations;
CREATE POLICY "Users can view relevant registrations"
    ON public.event_registrations
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_registrations.event_id
            AND events.owner_id = auth.uid()
        )
    );

-- Authenticated users can register for published events
DROP POLICY IF EXISTS "Authenticated users can register for events" ON public.event_registrations;
CREATE POLICY "Authenticated users can register for events"
    ON public.event_registrations
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_registrations.event_id
            AND (events.status = 'published' OR events.status = 'ongoing')
        )
    );

-- Users can update their own registrations (e.g., cancel)
DROP POLICY IF EXISTS "Users can update own registrations" ON public.event_registrations;
CREATE POLICY "Users can update own registrations"
    ON public.event_registrations
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own registrations
DROP POLICY IF EXISTS "Users can delete own registrations" ON public.event_registrations;
CREATE POLICY "Users can delete own registrations"
    ON public.event_registrations
    FOR DELETE
    USING (user_id = auth.uid());

-- Event owners can update registration status (e.g., mark attended)
DROP POLICY IF EXISTS "Event owners can update registration status" ON public.event_registrations;
CREATE POLICY "Event owners can update registration status"
    ON public.event_registrations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = event_registrations.event_id
            AND events.owner_id = auth.uid()
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

GRANT SELECT ON public.event_categories TO anon, authenticated;

GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;

GRANT SELECT ON public.event_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;

-- Grant access to sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
