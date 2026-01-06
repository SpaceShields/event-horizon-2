-- ============================================================================
-- Event Horizon Database Indexes
-- ============================================================================
-- This migration creates performance indexes for frequently queried columns.
-- Run this after the initial schema is created.
--
-- Index Naming Convention:
--   idx_{table}_{column(s)}
--
-- Guidelines:
--   - Indexes improve read performance but add overhead to writes
--   - Only index columns that are frequently used in WHERE, JOIN, or ORDER BY
--   - Consider query patterns when choosing which columns to index
-- ============================================================================

-- ============================================================================
-- EVENTS TABLE INDEXES
-- ============================================================================

-- idx_events_owner_id
-- Purpose: Speed up queries for "My Events" dashboard where we filter by owner
-- Usage: SELECT * FROM events WHERE owner_id = ? ORDER BY created_at DESC
-- Benefit: O(log n) lookup instead of full table scan for user's events
CREATE INDEX IF NOT EXISTS idx_events_owner_id
ON events (owner_id);

-- idx_events_category_id
-- Purpose: Speed up event filtering by category on the browse/discover page
-- Usage: SELECT * FROM events WHERE category_id = ? AND status = 'published'
-- Benefit: Enables fast category-based filtering for event discovery
CREATE INDEX IF NOT EXISTS idx_events_category_id
ON events (category_id);

-- idx_events_status
-- Purpose: Speed up queries that filter by event status (published, draft, etc.)
-- Usage: SELECT * FROM events WHERE status = 'published' ORDER BY start_datetime
-- Benefit: Published events are the most commonly queried; index avoids scanning drafts/cancelled
CREATE INDEX IF NOT EXISTS idx_events_status
ON events (status);

-- idx_events_start_datetime
-- Purpose: Speed up chronological ordering and date-range queries
-- Usage: SELECT * FROM events WHERE start_datetime > NOW() ORDER BY start_datetime ASC
-- Benefit: Essential for "upcoming events" queries and calendar views
CREATE INDEX IF NOT EXISTS idx_events_start_datetime
ON events (start_datetime);

-- idx_events_slug
-- Purpose: Speed up event lookup by URL slug (unique constraint already creates index)
-- Usage: SELECT * FROM events WHERE slug = 'space-symposium-2026'
-- Benefit: O(1) lookup for event detail pages; slug is used in every event URL
-- Note: If slug has a UNIQUE constraint, this index may already exist
CREATE INDEX IF NOT EXISTS idx_events_slug
ON events (slug);

-- idx_events_composite_browse
-- Purpose: Composite index for the main event browse query pattern
-- Usage: SELECT * FROM events WHERE status = 'published' AND start_datetime > NOW()
--        ORDER BY start_datetime ASC
-- Benefit: Single index covers the most common browse pattern (published, future, ordered)
CREATE INDEX IF NOT EXISTS idx_events_status_start_datetime
ON events (status, start_datetime)
WHERE status = 'published';

-- idx_events_location_type
-- Purpose: Speed up filtering events by location type (physical, virtual, hybrid)
-- Usage: SELECT * FROM events WHERE location_type = 'virtual' AND status = 'published'
-- Benefit: Users often filter for virtual-only or in-person events
CREATE INDEX IF NOT EXISTS idx_events_location_type
ON events (location_type);

-- ============================================================================
-- EVENT_REGISTRATIONS TABLE INDEXES
-- ============================================================================

-- idx_registrations_event_id
-- Purpose: Speed up queries to get all attendees for a specific event
-- Usage: SELECT * FROM event_registrations WHERE event_id = ? ORDER BY created_at
-- Benefit: Essential for event detail page and attendee list; O(log n) lookup
CREATE INDEX IF NOT EXISTS idx_registrations_event_id
ON event_registrations (event_id);

-- idx_registrations_user_id
-- Purpose: Speed up queries for "My Registrations" on user dashboard
-- Usage: SELECT * FROM event_registrations WHERE user_id = ? ORDER BY registration_date DESC
-- Benefit: Users frequently view their registered events; avoids full table scan
CREATE INDEX IF NOT EXISTS idx_registrations_user_id
ON event_registrations (user_id);

-- idx_registrations_status
-- Purpose: Speed up filtering registrations by attendance status
-- Usage: SELECT * FROM event_registrations WHERE event_id = ? AND attendance_status = 'registered'
-- Benefit: Quickly count/list only confirmed registrations, exclude cancelled
CREATE INDEX IF NOT EXISTS idx_registrations_status
ON event_registrations (attendance_status);

-- idx_registrations_composite_user_event
-- Purpose: Composite index for checking if a user is registered for an event
-- Usage: SELECT * FROM event_registrations WHERE user_id = ? AND event_id = ?
-- Benefit: O(1) lookup for registration status check; used on every event detail page
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_user_event
ON event_registrations (user_id, event_id);

-- idx_registrations_event_status
-- Purpose: Composite index for getting registered attendees count per event
-- Usage: SELECT COUNT(*) FROM event_registrations WHERE event_id = ? AND attendance_status = 'registered'
-- Benefit: Fast count for capacity tracking on event cards and detail pages
CREATE INDEX IF NOT EXISTS idx_registrations_event_status
ON event_registrations (event_id, attendance_status);

-- ============================================================================
-- PROFILES TABLE INDEXES (if not already indexed by auth.users FK)
-- ============================================================================

-- idx_profiles_updated_at
-- Purpose: Speed up queries for recently updated profiles (admin/moderation)
-- Usage: SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 50
-- Benefit: Useful for admin dashboards showing recent profile updates
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at
ON profiles (updated_at);

-- ============================================================================
-- EVENT_CATEGORIES TABLE INDEXES
-- ============================================================================

-- idx_categories_slug
-- Purpose: Speed up category lookup by URL slug
-- Usage: SELECT * FROM event_categories WHERE slug = 'conference'
-- Benefit: Categories are looked up by slug in URLs for filtered views
CREATE INDEX IF NOT EXISTS idx_categories_slug
ON event_categories (slug);

-- ============================================================================
-- FULL-TEXT SEARCH INDEX (Optional - for future search feature)
-- ============================================================================

-- Uncomment when implementing search functionality:
--
-- CREATE INDEX IF NOT EXISTS idx_events_search
-- ON events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(organization_name, '')));
--
-- Usage: SELECT * FROM events
--        WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('space conference')

-- ============================================================================
-- MAINTENANCE NOTES
-- ============================================================================
--
-- 1. Monitor index usage with: SELECT * FROM pg_stat_user_indexes;
-- 2. Rebuild indexes if needed: REINDEX INDEX idx_name;
-- 3. Consider adding indexes for new query patterns as they emerge
-- 4. Remove unused indexes to reduce write overhead
--
-- Query to find unused indexes:
--   SELECT indexrelname, idx_scan, idx_tup_read, idx_tup_fetch
--   FROM pg_stat_user_indexes
--   WHERE idx_scan = 0;
--
-- ============================================================================
