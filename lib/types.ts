export type UserRole = "student" | "moderator" | "admin";

export interface College {
  id: string;
  name: string;
  short_name: string;
  city: string;
  domain: string;
  logo_url?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  usn?: string;
  college_id?: string;
  college?: College;
  branch?: string;
  year?: number;
  bio?: string;
  avatar_url?: string;
  interests: string[];
  skills: string[];
  role: UserRole;
  is_verified: boolean;
  is_suspended: boolean;
  onboarding_completed?: boolean;
  phone?: string;
  show_phone: boolean;
  show_email: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface LoginAttempt {
  id: string;
  email?: string;
  ip?: string;
  success: boolean;
  created_at: string;
}

export interface OnboardingProgress {
  step: number;
  avatar_url?: string;
  branch?: string;
  year?: number;
  bio?: string;
  interests?: string[];
  skills?: string[];
  communities?: string[];
  peer_tutoring?: boolean;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  date: string;
  file_url?: string;
}

export type ListingCategory = "Books" | "Notes" | "Lab Equipment" | "Electronics" | "Furniture" | "Others";
export type ItemCondition = "New" | "Like New" | "Good" | "Used";
export type ListingStatus = "active" | "sold" | "removed";

export interface Listing {
  id: string;
  seller_id: string;
  seller?: Profile;
  college_id?: string;
  college?: College;
  title: string;
  description: string;
  category: ListingCategory;
  condition: ItemCondition;
  price: number;
  negotiable: boolean;
  images: string[];
  status: ListingStatus;
  created_at: string;
  is_wishlisted?: boolean;
}

export type EventType = "College Events" | "State Level" | "Workshops" | "Hackathons" | "Cultural" | "Tech";
export type EventLevel = "college" | "state";
export type EventStatus = "pending" | "approved" | "rejected";

export interface Event {
  id: string;
  organizer_id: string;
  organizer?: Profile;
  college_id?: string;
  college?: College;
  title: string;
  description: string;
  type: EventType;
  level: EventLevel;
  venue: string;
  city: string;
  start_at: string;
  end_at: string;
  capacity: number;
  registered_count?: number;
  registration_deadline: string;
  poster_url?: string;
  status: EventStatus;
  is_registered?: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user?: Profile;
  status: "confirmed" | "cancelled";
  created_at: string;
}

export type TutoringMode = "online" | "offline" | "both";
export type SessionStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  weekday: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string;
  end_time: string;
}

export interface TutorReview {
  id: string;
  session_id: string;
  tutor_id: string;
  student_id: string;
  student?: Profile;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Tutor {
  user_id: string;
  profile?: Profile;
  subjects: string[];
  hourly_rate: number;
  mode: TutoringMode;
  bio: string;
  rating_avg: number;
  rating_count: number;
  availability?: TutorAvailability[];
  reviews?: TutorReview[];
  created_at?: string;
}

export interface TutoringSession {
  id: string;
  tutor_id: string;
  tutor?: Tutor;
  student_id: string;
  student?: Profile;
  subject: string;
  start_at: string;
  end_at: string;
  mode: "online" | "offline";
  note?: string;
  status: SessionStatus;
  created_at: string;
  review?: TutorReview;
}

export type CommunityCategory = "Academics" | "Tech" | "Cultural" | "Sports" | "Career" | "Clubs";

export interface Community {
  id: string;
  name: string;
  description: string;
  category: CommunityCategory;
  icon_url?: string;
  created_by: string;
  status: "pending" | "approved" | "rejected";
  member_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
  created_at?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author?: Profile;
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  author?: Profile;
  content: string;
  image_url?: string;
  is_pinned?: boolean;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  comments?: PostComment[];
  created_at: string;
}

export interface ProjectRequest {
  id: string;
  project_id: string;
  user_id: string;
  user?: Profile;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  user?: Profile;
  role: string;
  created_at?: string;
}

export interface Project {
  id: string;
  owner_id: string;
  owner?: Profile;
  title: string;
  description: string;
  skills: string[];
  tags: string[];
  team_size: number;
  current_members_count?: number;
  hackathon_url?: string;
  status: "active" | "completed" | "closed";
  members?: ProjectMember[];
  requests?: ProjectRequest[];
  is_member?: boolean;
  has_requested?: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: Profile;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  ref_type?: "listing" | "tutor" | "project" | "community";
  ref_id?: string;
  title?: string;
  participants: Profile[];
  last_message?: Message;
  unread_count?: number;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "registration_confirmed"
    | "booking_request"
    | "booking_accepted"
    | "booking_rejected"
    | "join_request"
    | "post_like"
    | "post_comment"
    | "event_approved"
    | "new_message";
  payload: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter?: Profile;
  target_type: "listing" | "user" | "message" | "post" | "community";
  target_id: string;
  target_title?: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  action_taken?: string;
  created_at: string;
}
