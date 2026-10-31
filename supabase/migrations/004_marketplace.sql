-- ==============================================================================
-- Migration 004: CampusConnect Student Marketplace & Storage Security
-- ==============================================================================

-- Enable pg_trgm for fuzzy search on listing titles
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. STORAGE BUCKET: listing-images
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

-- Storage RLS Policies:
DROP POLICY IF EXISTS "Listing images are publicly readable" ON storage.objects;
CREATE POLICY "Listing images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

DROP POLICY IF EXISTS "Users can upload listing images to own folder" ON storage.objects;
CREATE POLICY "Users can upload listing images to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'listing-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'listing-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;
CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'listing-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. BLOCKED WORDS TABLE & CONTENT FILTER
CREATE TABLE IF NOT EXISTS public.blocked_words (
    id SERIAL PRIMARY KEY,
    word TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blocked_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can manage blocked words" ON public.blocked_words;
CREATE POLICY "Staff can manage blocked words"
ON public.blocked_words FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

DROP POLICY IF EXISTS "Public can view blocked words" ON public.blocked_words;
CREATE POLICY "Public can view blocked words"
ON public.blocked_words FOR SELECT
USING (true);

-- Seed initial blocked terms
INSERT INTO public.blocked_words (word) VALUES
('scam'), ('counterfeit'), ('drugs'), ('weed'), ('hack'), ('exam leak'), ('pyramid')
ON CONFLICT (word) DO NOTHING;

CREATE OR REPLACE FUNCTION public.contains_blocked_words(input_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    found BOOLEAN;
BEGIN
    IF input_text IS NULL OR TRIM(input_text) = '' THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.blocked_words bw
        WHERE input_text ~* ('\y' || bw.word || '\y')
    ) INTO found;

    RETURN found;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PUBLIC PROFILES VIEW (Safe representation with privacy toggles)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.college_id,
    p.branch,
    p.year,
    p.bio,
    p.interests,
    p.skills,
    p.role,
    p.is_verified,
    p.is_suspended,
    CASE WHEN p.show_phone THEN p.phone ELSE NULL END AS phone,
    CASE WHEN p.show_email THEN p.email ELSE NULL END AS email,
    p.created_at
FROM public.profiles p;

-- 4. LISTINGS SEARCH_TSV & INDEXES
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS search_tsv tsvector 
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
) STORED;

CREATE INDEX IF NOT EXISTS idx_listings_search_tsv ON public.listings USING gin(search_tsv);
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON public.listings USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON public.listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_college_id ON public.listings(college_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);

-- 5. LISTING VIEWS TABLE
CREATE TABLE IF NOT EXISTS public.listing_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    view_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (listing_id, viewer_id, view_date)
);

ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can record views" ON public.listing_views;
CREATE POLICY "Authenticated users can record views"
ON public.listing_views FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = viewer_id);

DROP POLICY IF EXISTS "Sellers can view own listing view counts" ON public.listing_views;
CREATE POLICY "Sellers can view own listing view counts"
ON public.listing_views FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_views.listing_id AND seller_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- 6. LISTINGS INTEGRITY & DAILY POSTING LIMIT TRIGGER
CREATE OR REPLACE FUNCTION public.check_listing_integrity()
RETURNS TRIGGER AS $$
DECLARE
    seller_college_id UUID;
    daily_count INT;
    is_staff BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ) INTO is_staff;

    -- ON INSERT
    IF TG_OP = 'INSERT' THEN
        -- Force college_id from seller's profile
        SELECT college_id INTO seller_college_id FROM public.profiles WHERE id = NEW.seller_id;
        NEW.college_id := seller_college_id;
        NEW.status := 'active';

        -- Enforce daily posting limit: max 10 per 24 hours
        SELECT COUNT(*) INTO daily_count 
        FROM public.listings 
        WHERE seller_id = NEW.seller_id AND created_at > NOW() - INTERVAL '24 hours';

        IF daily_count >= 10 THEN
            RAISE EXCEPTION 'Daily posting limit reached (10 per day)';
        END IF;

        -- Validate images count (1 to 5)
        IF NEW.images IS NULL OR array_length(NEW.images, 1) IS NULL OR array_length(NEW.images, 1) = 0 THEN
            RAISE EXCEPTION 'At least 1 image is required for a listing.';
        END IF;

        IF array_length(NEW.images, 1) > 5 THEN
            RAISE EXCEPTION 'A listing cannot have more than 5 images.';
        END IF;

        -- Validate price (0 to 1,00,000)
        IF NEW.price < 0 OR NEW.price > 100000 THEN
            RAISE EXCEPTION 'Price must be between 0 and 1,00,000.';
        END IF;

        -- Validate title length (5 to 100 chars)
        IF length(trim(NEW.title)) < 5 OR length(NEW.title) > 100 THEN
            RAISE EXCEPTION 'Title must be between 5 and 100 characters.';
        END IF;

        -- Validate description length (10 to 1000 chars)
        IF length(trim(NEW.description)) < 10 OR length(NEW.description) > 1000 THEN
            RAISE EXCEPTION 'Description must be between 10 and 1000 characters.';
        END IF;

        -- Content filter check
        IF public.contains_blocked_words(NEW.title) OR public.contains_blocked_words(NEW.description) THEN
            RAISE EXCEPTION 'Your listing contains words that are not allowed.';
        END IF;

        NEW.created_at := NOW();
        NEW.updated_at := NOW();

    -- ON UPDATE
    ELSIF TG_OP = 'UPDATE' THEN
        IF NOT is_staff THEN
            -- Non-staff cannot change seller_id, college_id, or created_at
            IF NEW.seller_id IS DISTINCT FROM OLD.seller_id THEN
                RAISE EXCEPTION 'Unauthorized: Cannot change seller_id.';
            END IF;

            IF NEW.college_id IS DISTINCT FROM OLD.college_id THEN
                RAISE EXCEPTION 'Unauthorized: Cannot change college_id.';
            END IF;

            IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
                RAISE EXCEPTION 'Unauthorized: Cannot change created_at.';
            END IF;

            -- Non-staff cannot restore a removed listing
            IF OLD.status = 'removed' AND NEW.status != 'removed' THEN
                RAISE EXCEPTION 'Unauthorized: Only staff can restore a removed listing.';
            END IF;

            -- Allowed status values for seller
            IF NEW.status NOT IN ('active', 'sold', 'removed') THEN
                RAISE EXCEPTION 'Invalid status specified.';
            END IF;
        END IF;

        -- Validate updated fields
        IF array_length(NEW.images, 1) IS NULL OR array_length(NEW.images, 1) = 0 THEN
            RAISE EXCEPTION 'At least 1 image is required for a listing.';
        END IF;

        IF array_length(NEW.images, 1) > 5 THEN
            RAISE EXCEPTION 'A listing cannot have more than 5 images.';
        END IF;

        IF NEW.price < 0 OR NEW.price > 100000 THEN
            RAISE EXCEPTION 'Price must be between 0 and 1,00,000.';
        END IF;

        IF length(trim(NEW.title)) < 5 OR length(NEW.title) > 100 THEN
            RAISE EXCEPTION 'Title must be between 5 and 100 characters.';
        END IF;

        IF length(trim(NEW.description)) < 10 OR length(NEW.description) > 1000 THEN
            RAISE EXCEPTION 'Description must be between 10 and 1000 characters.';
        END IF;

        IF public.contains_blocked_words(NEW.title) OR public.contains_blocked_words(NEW.description) THEN
            RAISE EXCEPTION 'Your listing contains words that are not allowed.';
        END IF;

        NEW.updated_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_listing_integrity ON public.listings;
CREATE TRIGGER trg_check_listing_integrity
    BEFORE INSERT OR UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.check_listing_integrity();

-- 7. RLS ADJUSTMENTS FOR LISTINGS
-- Hide listings from suspended sellers (unless viewer is seller or staff)
DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.listings;
CREATE POLICY "Active listings are viewable by everyone" 
ON public.listings FOR SELECT 
USING (
    (
        status != 'removed' AND 
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = listings.seller_id AND p.is_suspended = false)
    )
    OR seller_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Delete policy: hard-delete restricted to staff; sellers use soft-delete (status = 'removed')
DROP POLICY IF EXISTS "Sellers can delete their listings" ON public.listings;
CREATE POLICY "Staff can hard delete listings" 
ON public.listings FOR DELETE 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- 8. SEARCH_LISTINGS RPC FUNCTION
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
            -- Suspended seller check
            (NOT p.is_suspended OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = caller_id AND role IN ('admin', 'moderator')))
            -- Status filter: active or sold (removed only visible to seller or staff)
            AND (l.status IN ('active', 'sold') OR l.seller_id = caller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = caller_id AND role IN ('admin', 'moderator')))
            -- Search query
            AND (clean_q IS NULL OR clean_q = '' OR l.search_tsv @@ plainto_tsquery('english', clean_q) OR l.title ILIKE '%' || clean_q || '%')
            -- Category filter
            AND (categories IS NULL OR array_length(categories, 1) IS NULL OR l.category = ANY(categories))
            -- Condition filter
            AND (conditions IS NULL OR array_length(conditions, 1) IS NULL OR l.condition = ANY(conditions))
            -- Price filter
            AND (min_price IS NULL OR l.price >= min_price)
            AND (max_price IS NULL OR l.price <= max_price)
            -- College filter
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
        -- Sold items always appear at the end
        CASE WHEN f.status = 'sold' THEN 1 ELSE 0 END ASC,
        -- Sorting options
        CASE WHEN sort_by = 'price_low_high' THEN f.price END ASC,
        CASE WHEN sort_by = 'price_high_low' THEN f.price END DESC,
        CASE WHEN sort_by = 'same_college_first' THEN (f.college_id = caller_college) END DESC NULLS LAST,
        f.created_at DESC
    LIMIT page_size
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. START DIRECT CONVERSATION FUNCTION
CREATE OR REPLACE FUNCTION public.start_direct_conversation(
    other_user_id UUID,
    ref_type TEXT DEFAULT NULL,
    ref_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    caller_id UUID := auth.uid();
    existing_conv_id UUID;
    new_conv_id UUID;
    listing_rec RECORD;
BEGIN
    IF caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF caller_id = other_user_id THEN
        RAISE EXCEPTION 'Cannot start conversation with yourself';
    END IF;

    -- Block check
    IF EXISTS (
        SELECT 1 FROM public.blocks 
        WHERE (blocker_id = caller_id AND blocked_id = other_user_id) 
           OR (blocker_id = other_user_id AND blocked_id = caller_id)
    ) THEN
        RAISE EXCEPTION 'Communication is blocked between these users.';
    END IF;

    -- Look for existing direct conversation for this reference
    SELECT c.id INTO existing_conv_id
    FROM public.conversations c
    JOIN public.conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = caller_id
    JOIN public.conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = other_user_id
    WHERE c.type = 'direct'
      AND (ref_id IS NULL OR c.ref_id = ref_id)
    LIMIT 1;

    IF existing_conv_id IS NOT NULL THEN
        RETURN existing_conv_id;
    END IF;

    -- Create new direct conversation
    INSERT INTO public.conversations (type, ref_type, ref_id)
    VALUES ('direct', ref_type, ref_id)
    RETURNING id INTO new_conv_id;

    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (new_conv_id, caller_id),
        (new_conv_id, other_user_id);

    -- Notify seller if this is a listing chat
    IF ref_type = 'listing' AND ref_id IS NOT NULL THEN
        SELECT title INTO listing_rec FROM public.listings WHERE id = ref_id;
        INSERT INTO public.notifications (user_id, type, payload)
        VALUES (
            other_user_id,
            'listing_chat',
            jsonb_build_object(
                'listing_id', ref_id,
                'listing_title', COALESCE(listing_rec.title, 'Marketplace item'),
                'buyer_id', caller_id,
                'conversation_id', new_conv_id
            )
        );
    END IF;

    RETURN new_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. REMOVE LISTING (Soft delete & notification)
CREATE OR REPLACE FUNCTION public.remove_listing(
    target_listing_id UUID,
    removal_reason TEXT DEFAULT 'Violation of community guidelines'
)
RETURNS VOID AS $$
DECLARE
    caller_id UUID := auth.uid();
    listing_rec RECORD;
    is_staff BOOLEAN;
BEGIN
    SELECT * INTO listing_rec FROM public.listings WHERE id = target_listing_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Listing not found';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = caller_id AND role IN ('admin', 'moderator')
    ) INTO is_staff;

    -- Caller must be owner or staff
    IF listing_rec.seller_id != caller_id AND NOT is_staff THEN
        RAISE EXCEPTION 'Unauthorized to remove this listing.';
    END IF;

    -- Soft delete
    UPDATE public.listings
    SET status = 'removed', updated_at = NOW()
    WHERE id = target_listing_id;

    -- Notify seller if removed by staff
    IF is_staff AND listing_rec.seller_id != caller_id THEN
        INSERT INTO public.notifications (user_id, type, payload)
        VALUES (
            listing_rec.seller_id,
            'listing_removed',
            jsonb_build_object(
                'listing_id', target_listing_id,
                'listing_title', listing_rec.title,
                'reason', removal_reason
            )
        );

        INSERT INTO public.admin_audit_log (admin_id, action, details)
        VALUES (
            caller_id,
            'listing_removed',
            jsonb_build_object('listing_id', target_listing_id, 'reason', removal_reason)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

