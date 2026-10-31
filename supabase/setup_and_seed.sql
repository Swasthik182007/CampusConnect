-- ==============================================================================
-- CampusConnect: Complete Supabase Database & Auth Setup
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    city TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    usn TEXT,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    branch TEXT,
    year INT DEFAULT 1,
    bio TEXT,
    avatar_url TEXT,
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INT DEFAULT 1,
    phone TEXT,
    show_phone BOOLEAN DEFAULT FALSE,
    show_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOGIN ATTEMPTS (Brute-force protection for Admin Portal)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    ip TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. BLOCKED WORDS (Marketplace anti-spam filter)
CREATE TABLE IF NOT EXISTS public.blocked_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.blocked_words (word) VALUES
('scam'), ('fraud'), ('counterfeit'), ('stolen'), ('leak'), ('cheating'), ('proxy')
ON CONFLICT (word) DO NOTHING;

-- 7. MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Books', 'Notes', 'Lab Equipment', 'Electronics', 'Furniture', 'Others')),
    condition TEXT NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Used')),
    price NUMERIC NOT NULL CHECK (price >= 0 AND price <= 100000),
    negotiable BOOLEAN DEFAULT FALSE,
    images TEXT[] NOT NULL DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search tsvector column
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS search_tsv tsvector 
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_search_tsv ON public.listings USING gin(search_tsv);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON public.listings USING gin(title gin_trgm_ops);

-- 8. LISTING VIEWS
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    view_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (listing_id, viewer_id, view_date)
);

-- 9. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- 10. CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'listing')),
    ref_type TEXT,
    ref_id UUID,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REPORTS & BLOCKS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'message', 'post', 'community')),
    target_id UUID NOT NULL,
    target_title TEXT,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocks (
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id)
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Colleges: Public readable
DROP POLICY IF EXISTS "Colleges are readable by everyone" ON public.colleges;
CREATE POLICY "Colleges are readable by everyone" ON public.colleges FOR SELECT USING (true);

-- Profiles: Public readable, editable by owner
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Active viewable by all, seller can insert/update
DROP POLICY IF EXISTS "Active listings viewable by all" ON public.listings;
CREATE POLICY "Active listings viewable by all" ON public.listings FOR SELECT USING (
    (status != 'removed' AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = listings.seller_id AND p.is_suspended = false))
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

DROP POLICY IF EXISTS "Users can insert listings" ON public.listings;
CREATE POLICY "Users can insert listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can update own listings" ON public.listings;
CREATE POLICY "Sellers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);

-- Wishlists: Authenticated users can manage own wishlist
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER: AUTH.USERS -> PUBLIC.PROFILES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_college_id UUID;
BEGIN
    SELECT id INTO default_college_id FROM public.colleges LIMIT 1;

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
        CASE 
            WHEN (NEW.raw_user_meta_data->>'college_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'college_id') ~ '^[0-9a-fA-F-]{36}$'
            THEN (NEW.raw_user_meta_data->>'college_id')::uuid 
            ELSE default_college_id 
        END,
        COALESCE(NEW.raw_user_meta_data->>'branch', 'Computer Science & Engineering'),
        COALESCE((NEW.raw_user_meta_data->>'year')::int, 3),
        'student', -- Enforce student role on public signups (Never allow admin self-assignment)
        (NEW.email_confirmed_at IS NOT NULL),
        false,
        1
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        is_verified = (NEW.email_confirmed_at IS NOT NULL);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET: listing-images
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    true,
    3145728, -- 3 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 3145728,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS: Public read, authenticated folder upload
DROP POLICY IF EXISTS "Public listing image access" ON storage.objects;
CREATE POLICY "Public listing image access"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Authenticated users upload listing images" ON storage.objects;
CREATE POLICY "Authenticated users upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'listing-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ==============================================================================
-- RPC: SEARCH_LISTINGS
-- ==============================================================================
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
        SELECT college_id INTO caller_college FROM public.profiles WHERE id = caller_id;
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
            (NOT p.is_suspended OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = caller_id AND role IN ('admin', 'moderator')))
            AND (l.status IN ('active', 'sold') OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = caller_id AND role IN ('admin', 'moderator')))
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

-- ==============================================================================
-- SEED DATA: KARNATAKA COLLEGES
-- ==============================================================================
INSERT INTO public.colleges (id, name, short_name, city, domain, logo_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Vidyavardhaka College of Engineering', 'VVCE', 'Mysuru', 'vvce.ac.in', 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&q=80'),
('22222222-2222-2222-2222-222222222222', 'R.V. College of Engineering', 'RVCE', 'Bengaluru', 'rvce.edu.in', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&q=80'),
('33333333-3333-3333-3333-333333333333', 'B.M.S. College of Engineering', 'BMSCE', 'Bengaluru', 'bmsce.ac.in', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80'),
('44444444-4444-4444-4444-444444444444', 'Ramaiah Institute of Technology', 'MSRIT', 'Bengaluru', 'msrit.edu', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&q=80'),
('55555555-5555-5555-5555-555555555555', 'PES University', 'PESU', 'Bengaluru', 'pes.edu', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=128&q=80'),
('66666666-6666-6666-6666-666666666666', 'National Institute of Technology Karnataka', 'NITK', 'Surathkal', 'nitk.edu.in', 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=128&q=80')
ON CONFLICT (domain) DO UPDATE SET name = EXCLUDED.name;

