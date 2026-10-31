-- ==============================================================================
-- CampusConnect: Fix Auth Trigger & Seed Demo Accounts
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dpwutedtrhuhgbjmpjxs/sql/new
-- ==============================================================================

-- 1. FIX PROFILES RLS FOR AUTH INSERTION
-- Allows the auth.users trigger (where auth.uid() is null during signup) to insert profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow trigger and auth to insert profile" ON public.profiles;

CREATE POLICY "Allow trigger and auth to insert profile"
ON public.profiles FOR INSERT
WITH CHECK (
    auth.uid() = id OR auth.uid() IS NULL
);

-- 2. FIX PROFILE PRIVILEGED COLUMNS TRIGGER
-- Ensures it doesn't block system triggers or service role updates (when auth.uid() is null)
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If called by system trigger or service role, allow
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    -- If user is already an admin or moderator, allow
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ) THEN
        RETURN NEW;
    END IF;

    -- For normal students, prevent changing privileged columns
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Security Violation: Only trusted administrators can modify the account role.';
    END IF;

    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
        RAISE EXCEPTION 'Security Violation: Cannot modify "is_verified".';
    END IF;

    IF NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
        RAISE EXCEPTION 'Security Violation: Cannot modify "is_suspended".';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. HARDEN HANDLE_NEW_USER AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    college_record_id UUID;
    user_email_domain TEXT;
BEGIN
    user_email_domain := split_part(NEW.email, '@', 2);
    SELECT id INTO college_record_id FROM public.colleges WHERE domain = user_email_domain LIMIT 1;
    IF college_record_id IS NULL THEN
        SELECT id INTO college_record_id FROM public.colleges LIMIT 1;
    END IF;

    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        usn,
        college_id,
        branch,
        year,
        role,
        is_verified,
        is_suspended,
        onboarding_completed,
        onboarding_step
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'usn', '4VV21CS001'),
        college_record_id,
        COALESCE(NEW.raw_user_meta_data->>'branch', 'Computer Science & Engineering'),
        COALESCE((NEW.raw_user_meta_data->>'year')::int, 3),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        (NEW.email_confirmed_at IS NOT NULL),
        false,
        false,
        1
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. AUTO-SYNC EMAIL CONFIRMATION TO PROFILES
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at != NEW.email_confirmed_at) THEN
        UPDATE public.profiles
        SET is_verified = true
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
    AFTER UPDATE OF email_confirmed_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- 5. FIX AMBIGUOUS ID IN SEARCH_LISTINGS RPC
CREATE OR REPLACE FUNCTION public.search_listings(
    q text DEFAULT NULL,
    categories text[] DEFAULT NULL,
    conditions text[] DEFAULT NULL,
    min_price numeric DEFAULT NULL,
    max_price numeric DEFAULT NULL,
    college uuid DEFAULT NULL,
    sort_by text DEFAULT 'newest',
    page_size int DEFAULT 12,
    page_offset int DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    college_id UUID,
    title TEXT,
    description TEXT,
    category TEXT,
    condition TEXT,
    price NUMERIC,
    negotiable BOOLEAN,
    images TEXT[],
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    seller_name TEXT,
    seller_avatar TEXT,
    seller_verified BOOLEAN,
    college_short_name TEXT,
    is_wishlisted BOOLEAN,
    views_count BIGINT,
    total_count BIGINT
) AS $$
DECLARE
    caller_id UUID := auth.uid();
    caller_college UUID;
    clean_q TEXT := TRIM(q);
BEGIN
    IF caller_id IS NOT NULL THEN
        SELECT p.college_id INTO caller_college FROM public.profiles p WHERE p.id = caller_id;
    END IF;

    RETURN QUERY
    WITH filtered AS (
        SELECT 
            l.id,
            l.seller_id,
            l.college_id,
            l.title,
            l.description,
            l.category,
            l.condition,
            l.price,
            l.negotiable,
            l.images,
            l.status,
            l.created_at,
            l.updated_at,
            p.full_name AS seller_name,
            p.avatar_url AS seller_avatar,
            p.is_verified AS seller_verified,
            c.short_name AS college_short_name,
            CASE 
                WHEN caller_id IS NOT NULL THEN 
                    EXISTS (SELECT 1 FROM public.wishlists w WHERE w.listing_id = l.id AND w.user_id = caller_id)
                ELSE FALSE 
            END AS is_wishlisted,
            COALESCE((SELECT COUNT(*) FROM public.listing_views lv WHERE lv.listing_id = l.id), 0) AS views_count
        FROM public.listings l
        JOIN public.profiles p ON p.id = l.seller_id
        LEFT JOIN public.colleges c ON c.id = l.college_id
        WHERE 
            (NOT p.is_suspended OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = caller_id AND p2.role IN ('admin', 'moderator')))
            AND (l.status IN ('active', 'sold') OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles p3 WHERE p3.id = caller_id AND p3.role IN ('admin', 'moderator')))
            AND (clean_q IS NULL OR clean_q = '' OR l.search_tsv @@ plainto_tsquery('english', clean_q) OR l.title ILIKE '%' || clean_q || '%')
            AND (categories IS NULL OR array_length(categories, 1) IS NULL OR l.category = ANY(categories))
            AND (conditions IS NULL OR array_length(conditions, 1) IS NULL OR l.condition = ANY(conditions))
            AND (min_price IS NULL OR l.price >= min_price)
            AND (max_price IS NULL OR l.price <= max_price)
            AND (college IS NULL OR l.college_id = college)
    ),
    counted AS (
        SELECT COUNT(*) AS total FROM filtered
    )
    SELECT 
        f.id,
        f.seller_id,
        f.college_id,
        f.title,
        f.description,
        f.category,
        f.condition,
        f.price,
        f.negotiable,
        f.images,
        f.status,
        f.created_at,
        f.updated_at,
        f.seller_name,
        f.seller_avatar,
        f.seller_verified,
        f.college_short_name,
        f.is_wishlisted,
        f.views_count,
        counted.total AS total_count
    FROM filtered f, counted
    ORDER BY
        CASE WHEN f.status = 'sold' THEN 1 ELSE 0 END ASC,
        CASE WHEN sort_by = 'price_low_high' THEN f.price END ASC,
        CASE WHEN sort_by = 'price_high_low' THEN f.price END DESC,
        CASE WHEN sort_by = 'same_college_first' THEN (f.college_id = caller_college) END DESC NULLS LAST,
        f.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

