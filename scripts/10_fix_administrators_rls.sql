-- ============================================================================
-- FIX: Infinite recursion in event_administrators RLS policy
-- The SELECT policy was querying event_administrators directly, causing recursion
-- Solution: Use the SECURITY DEFINER helper function instead
-- ============================================================================

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view event administrators" ON public.event_administrators;

-- Recreate with simplified logic that doesn't cause recursion
CREATE POLICY "Users can view event administrators"
ON public.event_administrators FOR SELECT
USING (
    -- Event owner can view all admins for their event
    EXISTS (
        SELECT 1 FROM public.events
        WHERE id = event_administrators.event_id
        AND owner_id = auth.uid()
    )
    -- Admins can view their own record
    OR user_id = auth.uid()
    -- Other admins of same event can view (uses SECURITY DEFINER function to avoid recursion)
    OR public.is_event_admin(event_administrators.event_id, auth.uid())
);

COMMENT ON POLICY "Users can view event administrators" ON public.event_administrators
IS 'Event owners and admins can view administrator records. Uses SECURITY DEFINER function to prevent infinite recursion.';
