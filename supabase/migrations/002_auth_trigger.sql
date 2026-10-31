-- ==============================================================================
-- Auto-create public.profiles entry when a user registers in auth.users
-- ==============================================================================

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
        is_verified
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        COALESCE(new.raw_user_meta_data->>'usn', '4VV21CS001'),
        COALESCE((new.raw_user_meta_data->>'college_id')::UUID, college_record_id),
        COALESCE(new.raw_user_meta_data->>'branch', 'Computer Science'),
        COALESCE((new.raw_user_meta_data->>'year')::INT, 1),
        COALESCE(new.raw_user_meta_data->>'role', 'student'),
        TRUE
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
