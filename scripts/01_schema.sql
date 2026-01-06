-- Event Horizon Database Schema
-- Version: 1.0.0
-- Description: Core tables for the Event Horizon space event management platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- User profiles extending Supabase Auth (auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add unique constraint on email
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth users';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.email IS 'User email address';
COMMENT ON COLUMN public.profiles.full_name IS 'User display name';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';
COMMENT ON COLUMN public.profiles.location IS 'User location (city, country, etc.)';

-- ============================================================================
-- EVENT_CATEGORIES TABLE
-- Predefined categories for space-related events
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.event_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on slug for URL lookups
CREATE INDEX IF NOT EXISTS event_categories_slug_idx ON public.event_categories(slug);

COMMENT ON TABLE public.event_categories IS 'Predefined categories for events';
COMMENT ON COLUMN public.event_categories.slug IS 'URL-friendly category identifier';
COMMENT ON COLUMN public.event_categories.icon IS 'Icon identifier (e.g., lucide icon name)';

-- ============================================================================
-- EVENTS TABLE
-- Core event data with all event details
-- ============================================================================

-- Create enum types for constrained fields
DO $$ BEGIN
    CREATE TYPE public.location_type AS ENUM ('physical', 'virtual', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    organization_name TEXT,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES public.event_categories(id) ON DELETE RESTRICT,
    location_type public.location_type NOT NULL DEFAULT 'physical',
    address TEXT,
    meeting_url TEXT,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
    ticket_price DECIMAL(10, 2) CHECK (ticket_price IS NULL OR ticket_price >= 0),
    registration_instructions TEXT,
    status public.event_status DEFAULT 'draft' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Validation constraints
    CONSTRAINT events_end_after_start CHECK (end_datetime > start_datetime),
    CONSTRAINT events_physical_requires_address CHECK (
        location_type = 'virtual' OR address IS NOT NULL
    ),
    CONSTRAINT events_virtual_requires_url CHECK (
        location_type = 'physical' OR meeting_url IS NOT NULL
    )
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS events_owner_id_idx ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS events_category_id_idx ON public.events(category_id);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_start_datetime_idx ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS events_slug_idx ON public.events(slug);
CREATE INDEX IF NOT EXISTS events_location_type_idx ON public.events(location_type);

-- Composite index for common event listing queries
CREATE INDEX IF NOT EXISTS events_status_start_idx ON public.events(status, start_datetime);

COMMENT ON TABLE public.events IS 'Core event data for space-related events';
COMMENT ON COLUMN public.events.slug IS 'SEO-friendly URL identifier';
COMMENT ON COLUMN public.events.owner_id IS 'User who created and owns this event';
COMMENT ON COLUMN public.events.location_type IS 'Physical, virtual, or hybrid event';
COMMENT ON COLUMN public.events.capacity IS 'Maximum attendees (NULL = unlimited)';
COMMENT ON COLUMN public.events.ticket_price IS 'Ticket price in USD (NULL or 0 = free)';
COMMENT ON COLUMN public.events.status IS 'Event lifecycle status';

-- ============================================================================
-- EVENT_REGISTRATIONS TABLE
-- User RSVPs and attendance tracking
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE public.attendance_status AS ENUM ('registered', 'attended', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_count INTEGER DEFAULT 0 NOT NULL CHECK (guest_count >= 0),
    special_notes TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    attendance_status public.attendance_status DEFAULT 'registered' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Prevent duplicate registrations
    CONSTRAINT event_registrations_unique_user_event UNIQUE (event_id, user_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS event_registrations_event_id_idx ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS event_registrations_user_id_idx ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS event_registrations_status_idx ON public.event_registrations(attendance_status);

COMMENT ON TABLE public.event_registrations IS 'User event registrations and attendance tracking';
COMMENT ON COLUMN public.event_registrations.guest_count IS 'Number of additional guests (not including the registrant)';
COMMENT ON COLUMN public.event_registrations.special_notes IS 'Special requests or notes from registrant';
COMMENT ON COLUMN public.event_registrations.attendance_status IS 'Current registration/attendance status';
