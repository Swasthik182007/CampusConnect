-- ==============================================================================
-- Migration 004: Hardened Supabase Authentication, Role Enforcement & RLS Security
-- Ensures public signups CANNOT assign administrator roles.
-- Ensures only existing trusted administrators can promote users or assign admin roles.
-- ==============================================================================

-- 1. HARDEN NEW USER AUTH TRIGGER
-- Guarantees that public signup through Supabase Auth (auth.users) ALWAYS receives
-- the 'student' role, ignoring any client-supplied 'role' in raw_user_meta_data.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    college_record_id UUID;
    user_email_domain TEXT;
BEGIN
    -- Extract domain from user email
    user_email_domain := split_part(new.email, '@', 2);
    
    -- Lookup college ID by domain
    SELECT id INTO college_record_id FROM public.colleges WHERE domain = user_email_domain LIMIT 1;

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
        onboarding_completed
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'usn', '4VV21CS001'),
        COALESCE((new.raw_user_meta_data->>'college_id')::UUID, college_record_id),
        COALESCE(new.raw_user_meta_data->>'branch', 'Computer Science'),
        COALESCE((new.raw_user_meta_data->>'year')::INT, 1),
        'student', -- STRICT ENFORCEMENT: Public signups are ALWAYS 'student'. Never trust client metadata.
        TRUE,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. HARDEN PROFILES RLS POLICIES
-- Normal authenticated users can only insert their own profile with role = 'student'
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (
    auth.uid() = id AND 
    (role IS NULL OR role = 'student')
);

-- Users can update their own profile; admins can update any profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

-- 3. HARDEN PRIVILEGED COLUMNS TRIGGER
-- Strictly prevents non-admins from changing the role, verification, or suspension status.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If user is already an admin or moderator, allow updates
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

    -- Students CAN update self-service fields:
    -- onboarding_completed, interests, skills, branch, year, bio, avatar_url, full_name, phone, show_phone, show_email
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- 4. SECURE ADMIN PROMOTION FUNCTION (For trusted administrator use only)
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
    -- Verify the caller is an active administrator
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin' AND is_suspended = false
    ) THEN
        RAISE EXCEPTION 'Access Denied: Only active administrators can assign user roles.';
    END IF;

    IF new_role NOT IN ('student', 'moderator', 'admin') THEN
        RAISE EXCEPTION 'Invalid role specified.';
    END IF;

    UPDATE public.profiles
    SET role = new_role, updated_at = NOW()
    WHERE id = target_user_id;

    -- Write to audit log
    INSERT INTO public.admin_audit_log (admin_id, action, details)
    VALUES (
        auth.uid(),
        'role_assigned',
        jsonb_build_object('target_user_id', target_user_id, 'new_role', new_role)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

