-- ============================================================================
-- EVENT ADMINISTRATORS MIGRATION
-- Add administrators table to allow multiple users to manage events
-- Version: 1.0.0
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- NEW TABLE: event_administrators
-- Junction table linking events to admin users (max 2 admins + 1 owner = 3)
-- ============================================================================

CREATE TABLE public.event_administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    added_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Each user can only be an admin for an event once
    CONSTRAINT event_administrators_unique_user_event
        UNIQUE (event_id, user_id)
);

-- Enable RLS on event_administrators
ALTER TABLE public.event_administrators ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX event_administrators_event_id_idx ON public.event_administrators(event_id);
CREATE INDEX event_administrators_user_id_idx ON public.event_administrators(user_id);

-- Add comments
COMMENT ON TABLE public.event_administrators IS 'Junction table for event administrators (max 2 admins per event, plus owner)';
COMMENT ON COLUMN public.event_administrators.event_id IS 'Reference to the event';
COMMENT ON COLUMN public.event_administrators.user_id IS 'Reference to the user profile who is an admin';
COMMENT ON COLUMN public.event_administrators.added_by IS 'Reference to the user who added this admin (must be owner)';
COMMENT ON COLUMN public.event_administrators.role IS 'Role of the administrator (default: admin)';

-- ============================================================================
-- HELPER FUNCTION: Check if user is an admin of an event
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_event_admin(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.event_administrators
        WHERE event_id = p_event_id
        AND user_id = p_user_id
    );
END;
$$;

COMMENT ON FUNCTION public.is_event_admin IS 'Returns true if the user is an administrator of the event';

-- ============================================================================
-- HELPER FUNCTION: Check if user can manage an event (owner or admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_manage_event(p_event_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if owner
    IF EXISTS (
        SELECT 1 FROM public.events
        WHERE id = p_event_id
        AND owner_id = p_user_id
    ) THEN
        RETURN TRUE;
    END IF;

    -- Check if admin
    RETURN public.is_event_admin(p_event_id, p_user_id);
END;
$$;

COMMENT ON FUNCTION public.can_manage_event IS 'Returns true if the user is the owner or an administrator of the event';

-- ============================================================================
-- RLS POLICIES FOR event_administrators
-- ============================================================================

-- Policy: Event owners, admins themselves, and other admins can view administrators
CREATE POLICY "Users can view event administrators"
ON public.event_administrators FOR SELECT
USING (
    -- Event owner can view
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_administrators.event_id
        AND owner_id = auth.uid()
    )
    -- Admin themselves can view
    OR user_id = auth.uid()
    -- Other admins of same event can view
    OR EXISTS (
        SELECT 1 FROM public.event_administrators ea2
        WHERE ea2.event_id = event_administrators.event_id
        AND ea2.user_id = auth.uid()
    )
);

-- Policy: Only event owners can add administrators
CREATE POLICY "Event owners can add administrators"
ON public.event_administrators FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_administrators.event_id
        AND owner_id = auth.uid()
    )
    -- Ensure added_by is the authenticated user
    AND added_by = auth.uid()
);

-- Policy: Only event owners can remove administrators
CREATE POLICY "Event owners can remove administrators"
ON public.event_administrators FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_administrators.event_id
        AND owner_id = auth.uid()
    )
);

-- ============================================================================
-- UPDATE RLS POLICIES: events table
-- Allow admins to UPDATE events (but NOT delete - owner-only)
-- ============================================================================

-- Drop existing update policy
DROP POLICY IF EXISTS "Event owners can update their events" ON public.events;

-- Create new update policy that includes admins
CREATE POLICY "Event owners and admins can update events"
ON public.events FOR UPDATE
USING (
    owner_id = auth.uid()
    OR public.is_event_admin(id, auth.uid())
)
WITH CHECK (
    owner_id = auth.uid()
    OR public.is_event_admin(id, auth.uid())
);

-- Note: Delete policy remains owner-only (unchanged)
-- "Event owners can delete their events" stays as-is

-- ============================================================================
-- UPDATE RLS POLICIES: event_registrations table
-- Allow admins to SELECT and UPDATE registrations
-- ============================================================================

-- Drop existing relevant policy
DROP POLICY IF EXISTS "Users can view relevant registrations" ON public.event_registrations;

-- Create new select policy that includes admins
CREATE POLICY "Users can view relevant registrations"
ON public.event_registrations FOR SELECT
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_registrations.event_id
        AND events.owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

-- Drop existing owner update policy
DROP POLICY IF EXISTS "Event owners can update registration status" ON public.event_registrations;

-- Create new update policy that includes admins
CREATE POLICY "Event owners and admins can update registration status"
ON public.event_registrations FOR UPDATE
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = event_registrations.event_id
        AND events.owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

-- ============================================================================
-- UPDATE RLS POLICIES: event_time_slots table
-- Allow admins to INSERT, UPDATE, DELETE time slots
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Event owners can insert time slots" ON public.event_time_slots;
DROP POLICY IF EXISTS "Event owners can update time slots" ON public.event_time_slots;
DROP POLICY IF EXISTS "Event owners can delete time slots" ON public.event_time_slots;

-- Create new policies that include admins
CREATE POLICY "Event owners and admins can insert time slots"
ON public.event_time_slots FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_time_slots.event_id
        AND owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

CREATE POLICY "Event owners and admins can update time slots"
ON public.event_time_slots FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_time_slots.event_id
        AND owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

CREATE POLICY "Event owners and admins can delete time slots"
ON public.event_time_slots FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_time_slots.event_id
        AND owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

-- Also update the SELECT policy to allow admins to view time slots for draft events
DROP POLICY IF EXISTS "Public can view time slots for published events" ON public.event_time_slots;

CREATE POLICY "Users can view time slots"
ON public.event_time_slots FOR SELECT
USING (
    -- Public can view slots for published/ongoing/completed events
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND status IN ('published', 'ongoing', 'completed')
    )
    -- Owners and admins can view all slots for their events
    OR EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_id
        AND owner_id = auth.uid()
    )
    OR public.is_event_admin(event_id, auth.uid())
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to the new table
GRANT SELECT ON public.event_administrators TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.event_administrators TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.is_event_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_event TO authenticated;
