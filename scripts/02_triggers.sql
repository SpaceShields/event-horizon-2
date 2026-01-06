-- Event Horizon Database Triggers
-- Version: 1.0.0
-- Description: Triggers for automatic data management

-- ============================================================================
-- PROFILE AUTO-CREATION TRIGGER
-- Automatically creates a profile record when a new user signs up via auth.users
-- ============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
END;
$$;

-- Create trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile record when a new user signs up';

-- ============================================================================
-- UPDATED_AT TIMESTAMP TRIGGERS
-- Automatically update updated_at column on record modification
-- ============================================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at column to current timestamp';

-- Apply to profiles table
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to events table
DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to event_registrations table
DROP TRIGGER IF EXISTS event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER event_registrations_updated_at
    BEFORE UPDATE ON public.event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- EVENT SLUG AUTO-GENERATION TRIGGER
-- Automatically generates URL-friendly slugs for events
-- ============================================================================

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Only generate slug if not provided or if title changed
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        -- Convert title to lowercase, replace spaces with hyphens, remove special chars
        base_slug := LOWER(REGEXP_REPLACE(
            REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
            '\s+', '-', 'g'
        ));

        -- Trim leading/trailing hyphens and limit length
        base_slug := TRIM(BOTH '-' FROM base_slug);
        base_slug := LEFT(base_slug, 80);

        new_slug := base_slug;

        -- Check for uniqueness and append counter if needed
        WHILE EXISTS (SELECT 1 FROM public.events WHERE slug = new_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
            counter := counter + 1;
            new_slug := base_slug || '-' || counter::text;
        END LOOP;

        NEW.slug := new_slug;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.generate_event_slug() IS 'Generates unique URL-friendly slug from event title';

-- Apply slug generation trigger
DROP TRIGGER IF EXISTS events_generate_slug ON public.events;
CREATE TRIGGER events_generate_slug
    BEFORE INSERT OR UPDATE OF title ON public.events
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION public.generate_event_slug();
