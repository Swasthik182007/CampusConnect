-- ==============================================================================
-- CampusConnect Supabase Schema & Row-Level Security
-- Targeted for Engineering & University Students in Karnataka, India
-- ==============================================================================

-- Enable UUID extension & pg_trgm for search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    city TEXT NOT NULL,
    domain TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PROFILES TABLE (Linked with auth.users)
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
    phone TEXT,
    show_phone BOOLEAN DEFAULT FALSE,
    show_email BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ACHIEVEMENTS & CERTIFICATES
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date DATE NOT NULL,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MARKETPLACE LISTINGS
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Books', 'Notes', 'Lab Equipment', 'Electronics', 'Furniture', 'Others')),
    condition TEXT NOT NULL CHECK (condition IN ('New', 'Like New', 'Good', 'Used')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    negotiable BOOLEAN DEFAULT FALSE,
    images TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WISHLISTS
CREATE TABLE IF NOT EXISTS public.wishlists (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- 6. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('College Events', 'State Level', 'Workshops', 'Hackathons', 'Cultural', 'Tech')),
    level TEXT NOT NULL CHECK (level IN ('college', 'state')),
    venue TEXT NOT NULL,
    city TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    registration_deadline TIMESTAMPTZ NOT NULL,
    poster_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- 8. PEER TUTORS
CREATE TABLE IF NOT EXISTS public.tutors (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    subjects TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate NUMERIC(8, 2) NOT NULL CHECK (hourly_rate >= 0),
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline', 'both')),
    bio TEXT,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TUTOR AVAILABILITY
CREATE TABLE IF NOT EXISTS public.tutor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(user_id) ON DELETE CASCADE,
    weekday INT NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TUTORING SESSIONS
CREATE TABLE IF NOT EXISTS public.tutoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES public.tutors(user_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('online', 'offline')),
    note TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TUTOR REVIEWS
CREATE TABLE IF NOT EXISTS public.tutor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.tutoring_sessions(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.tutors(user_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_id)
);

-- 12. COMMUNITIES
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Academics', 'Tech', 'Cultural', 'Sports', 'Career', 'Clubs')),
    icon_url TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- 14. COMMUNITY POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. POST LIKES & COMMENTS
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PROJECT COLLABORATION
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    team_size INT NOT NULL CHECK (team_size >= 2),
    hackathon_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.project_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- 17. CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
    ref_type TEXT CHECK (ref_type IN ('listing', 'tutor', 'project', 'community')),
    ref_id UUID,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
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

-- 18. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. REPORTS & BLOCKS (Safety)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'user', 'message', 'post', 'community')),
    target_id UUID NOT NULL,
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

-- ==============================================================================
-- INDEXES & FULL-TEXT SEARCH
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING gin(to_tsvector('english', title || ' ' || description || ' ' || venue || ' ' || city));
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON public.tutors USING gin(subjects);
CREATE INDEX IF NOT EXISTS idx_projects_skills ON public.projects USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ==============================================================================
-- FUNCTIONS & TRIGGERS
-- ==============================================================================

-- 1. Trigger to update tutor ratings automatically
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tutors
    SET 
        rating_avg = sub.avg_rating,
        rating_count = sub.cnt
    FROM (
        SELECT 
            tutor_id,
            ROUND(AVG(rating)::numeric, 2) AS avg_rating,
            COUNT(*) AS cnt
        FROM public.tutor_reviews
        WHERE tutor_id = NEW.tutor_id
        GROUP BY tutor_id
    ) sub
    WHERE public.tutors.user_id = sub.tutor_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_tutor_rating ON public.tutor_reviews;
CREATE TRIGGER trg_update_tutor_rating
AFTER INSERT OR UPDATE OR DELETE ON public.tutor_reviews
FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

-- 2. Trigger to prevent overbooking on events
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
    current_reg_count INT;
    max_cap INT;
BEGIN
    SELECT COUNT(*) INTO current_reg_count 
    FROM public.event_registrations 
    WHERE event_id = NEW.event_id AND status = 'confirmed';

    SELECT capacity INTO max_cap 
    FROM public.events 
    WHERE id = NEW.event_id;

    IF current_reg_count >= max_cap THEN
        RAISE EXCEPTION 'Event has reached its maximum registration capacity.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_event_capacity ON public.event_registrations;
CREATE TRIGGER trg_check_event_capacity
BEFORE INSERT ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION check_event_capacity();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Colleges: Read by all, modified by admins
CREATE POLICY "Colleges are viewable by all" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Colleges editable by admin" ON public.colleges FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Profiles: Public read, own update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Listings: Public read for active, owner can update/delete
CREATE POLICY "Active listings are viewable by everyone" ON public.listings FOR SELECT USING (status != 'removed' OR seller_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Verified users can create listings" ON public.listings FOR INSERT WITH CHECK (
    auth.uid() = seller_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = true AND is_suspended = false)
);
CREATE POLICY "Sellers can update their listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Sellers can delete their listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Wishlists: Own rows only
CREATE POLICY "Users can view own wishlist" ON public.wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- Events: Approved events viewable by all, verified users can submit
CREATE POLICY "Approved events are viewable by all" ON public.events FOR SELECT USING (status = 'approved' OR organizer_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));
CREATE POLICY "Verified users can create events" ON public.events FOR INSERT WITH CHECK (
    auth.uid() = organizer_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = true AND is_suspended = false)
);
CREATE POLICY "Organizers or moderators can update events" ON public.events FOR UPDATE USING (auth.uid() = organizer_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')));

-- Event Registrations:
CREATE POLICY "Users can see own registrations or organizers can see attendees" ON public.event_registrations FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.events WHERE id = event_registrations.event_id AND organizer_id = auth.uid())
);
CREATE POLICY "Verified users can register for events" ON public.event_registrations FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_verified = true AND is_suspended = false)
);
CREATE POLICY "Users can cancel own registration" ON public.event_registrations FOR UPDATE USING (auth.uid() = user_id);

-- Tutors & Availability:
CREATE POLICY "Tutors viewable by all" ON public.tutors FOR SELECT USING (true);
CREATE POLICY "Verified users can become tutors" ON public.tutors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Tutor availability viewable by all" ON public.tutor_availability FOR SELECT USING (true);
CREATE POLICY "Tutors can manage availability" ON public.tutor_availability FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tutors WHERE user_id = auth.uid() AND user_id = tutor_availability.tutor_id)
);

-- Tutoring Sessions:
CREATE POLICY "Participants can view sessions" ON public.tutoring_sessions FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);
CREATE POLICY "Students can request sessions" ON public.tutoring_sessions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update session status" ON public.tutoring_sessions FOR UPDATE USING (auth.uid() = tutor_id OR auth.uid() = student_id);

-- Tutor Reviews:
CREATE POLICY "Reviews viewable by all" ON public.tutor_reviews FOR SELECT USING (true);
CREATE POLICY "Students can create review for completed sessions" ON public.tutor_reviews FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM public.tutoring_sessions WHERE id = session_id AND student_id = auth.uid() AND status = 'completed')
);

-- Communities & Members:
CREATE POLICY "Communities viewable by all" ON public.communities FOR SELECT USING (status = 'approved' OR created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Verified users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can moderate communities" ON public.communities FOR UPDATE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Community members viewable by all" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join/leave communities" ON public.community_members FOR ALL USING (auth.uid() = user_id);

-- Posts, Likes, Comments:
CREATE POLICY "Posts viewable by all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Community members can post" ON public.posts FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = posts.community_id AND user_id = auth.uid())
);
CREATE POLICY "Authors or community admins can update/delete posts" ON public.posts FOR ALL USING (
    auth.uid() = author_id OR 
    EXISTS (SELECT 1 FROM public.community_members WHERE community_id = posts.community_id AND user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Likes viewable by all" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like/unlike posts" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Comments viewable by all" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment on posts" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Projects:
CREATE POLICY "Projects viewable by all" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Verified users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Project members viewable by all" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Owners can manage project members" ON public.project_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_members.project_id AND owner_id = auth.uid()) OR auth.uid() = user_id
);

CREATE POLICY "Project requests viewable by owner and requester" ON public.project_requests FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_requests.project_id AND owner_id = auth.uid())
);
CREATE POLICY "Users can request to join projects" ON public.project_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owners can accept/reject requests" ON public.project_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_requests.project_id AND owner_id = auth.uid())
);

-- Conversations & Messages:
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid())
);
CREATE POLICY "Users can join/create conversation participants" ON public.conversation_participants FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Participants can send messages unless blocked" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    NOT EXISTS (
        SELECT 1 FROM public.blocks b
        JOIN public.conversation_participants cp ON cp.user_id = b.blocker_id
        WHERE cp.conversation_id = messages.conversation_id AND b.blocked_id = auth.uid()
    )
);

-- Notifications:
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reports & Blocks:
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can review reports" ON public.reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
);

CREATE POLICY "Users can manage blocks" ON public.blocks FOR ALL USING (auth.uid() = blocker_id);
