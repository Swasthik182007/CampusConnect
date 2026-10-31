-- ==============================================================================
-- Migration 003: Login Security, Admin Audit Log & Onboarding System
-- ==============================================================================

-- 1. ADD onboarding_completed TO PROFILES
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Admins and moderators do not need student onboarding
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE role IN ('admin', 'moderator');

-- 2. CREATE LOGIN ATTEMPTS TABLE (For brute-force protection in Admin mode)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    ip TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast 15-minute window rate limit queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created 
ON public.login_attempts(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created 
ON public.login_attempts(ip, created_at DESC);

-- Enable RLS: Accessible ONLY to the service role (default deny to authenticated/anon users)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- 3. CREATE ADMIN AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created 
ON public.admin_audit_log(created_at DESC);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins and moderators can view the audit log
CREATE POLICY "Admins can view audit log" 
ON public.admin_audit_log FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- Service role or Admins can insert audit log records
CREATE POLICY "Admins can insert audit log" 
ON public.admin_audit_log FOR INSERT 
WITH CHECK (
    auth.uid() = admin_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- 4. PRIVILEGED COLUMNS TRIGGER ON PROFILES
-- Ensures non-admin users cannot elevate role or change is_verified / is_suspended,
-- but ARE freely permitted to update onboarding_completed, interests, skills, branch, year, bio, avatar_url, etc.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If user is an admin or moderator, allow updates
    IF EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    ) THEN
        RETURN NEW;
    END IF;

    -- For normal students, prevent changing privileged columns
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update privileged column "role".';
    END IF;

    IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update privileged column "is_verified".';
    END IF;

    IF NEW.is_suspended IS DISTINCT FROM OLD.is_suspended THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update privileged column "is_suspended".';
    END IF;

    -- Normal students CAN update: onboarding_completed, interests, skills, branch, year, bio, avatar_url, full_name, phone, show_phone, show_email
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- 5. PUBLIC STORAGE BUCKET: AVATARS
-- Create avatars bucket in Supabase Storage with 2MB limit and image types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true, 
    2097152, -- 2 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies:
-- Anyone can view avatar images
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated user can upload inside folder named after their own user id
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated user can update inside folder named after their own user id
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated user can delete inside folder named after their own user id
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);
