-- Event Horizon Seed Data: Event Categories
-- Version: 1.0.0
-- Description: Initial seed data for event categories

-- ============================================================================
-- EVENT CATEGORIES
-- Core categories as defined in MVP requirements
-- ============================================================================

INSERT INTO public.event_categories (name, slug, description, icon) VALUES
    ('Conference', 'conference', 'Space industry conferences, symposiums, and professional gatherings', 'users'),
    ('Workshop', 'workshop', 'Hands-on workshops, training sessions, and educational labs', 'wrench'),
    ('Networking', 'networking', 'Professional networking events, meetups, and social gatherings', 'share-2'),
    ('Entertainment', 'entertainment', 'Stargazing sessions, planetarium shows, and space-themed entertainment', 'star'),
    ('Community', 'community', 'Community events, club meetings, and public outreach programs', 'heart'),
    ('Charity', 'charity', 'Fundraisers, charity events, and space-related philanthropy', 'hand-heart'),
    ('Sports', 'sports', 'Zero-gravity sports, space fitness challenges, and athletic events', 'trophy'),
    ('Other', 'other', 'Other space-related events that do not fit standard categories', 'more-horizontal')
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================

-- This query can be run to verify categories were inserted correctly
-- SELECT id, name, slug, description, icon FROM public.event_categories ORDER BY id;
