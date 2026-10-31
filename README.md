# CampusConnect 🎓 (Karnataka Student Hub)

> An integrated, real-time student community and campus engagement platform for verified engineering and university college students in Karnataka, India.

---

## ⚡ Quick Evaluation & Demo Accounts

CampusConnect features built-in 1-click evaluation switchers directly in the top bar and sidebar, alongside support for Supabase Auth and credentials:

| Role | Email | Password | Campus & Branch | Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Verified Student** | `demo-student@vvce.ac.in` | `DemoStudent@2025` | VVCE Mysuru • CSE (3rd Year) | Post listings, RSVP events, book tutors, join squads, chat |
| **Admin / Faculty** | `demo-admin@vvce.ac.in` | `DemoAdmin@2025` | VVCE Mysuru • Faculty Advisor | Approve events, review safety reports, suspend users, manage domains |
| **Senior Peer Tutor** | `rohan.k@rvce.edu.in` | `DemoTutor@2025` | RVCE Bengaluru • ISE (4th Year) | Host DSA & System Design sessions, set availability |

---

## 🏗️ Architecture & System Topology

```
+---------------------------------------------------------------------------------------+
|                                    CAMPUSCONNECT                                      |
+---------------------------------------------------------------------------------------+
|  FRONTEND LAYER (Next.js 14+ App Router, TypeScript, Tailwind CSS, Lucide Icons)     |
|  - Landing Page (/)               - Dashboard (/dashboard)                            |
|  - Marketplace (/marketplace)     - Events & Hackathons (/events)                     |
|  - Peer Tutoring (/tutoring)      - Communities & Feeds (/communities)                |
|  - Collaboration (/projects)      - Realtime Messages (/messages)                     |
|  - Notifications (/notifications) - Profile & Privacy (/profile)                      |
|  - Admin Moderation (/admin)      - Onboarding (/onboarding)                          |
+---------------------------------------------------------------------------------------+
                                          |
                                          v
+---------------------------------------------------------------------------------------+
|  DATA & STATE SYNCHRONIZATION LAYER                                                  |
|  - lib/auth-context.tsx: Domain Allowlist Enforcement (.ac.in / .edu.in)             |
|  - lib/recommendations.ts: Smart Recommendation Engine (Branch & Interest Ranking)    |
|  - lib/data-store.ts: Reactive LocalStorage Store + Supabase Realtime Bridge          |
|  - lib/supabase/client.ts: SSR Supabase Client with graceful offline fallback         |
+---------------------------------------------------------------------------------------+
                                          |
                                          v
+---------------------------------------------------------------------------------------+
|  BACKEND & DATABASE LAYER (Supabase / PostgreSQL)                                     |
|  - 21 Normalized PostgreSQL Tables in /supabase/migrations/001_initial_schema.sql     |
|  - Row Level Security (RLS) on EVERY table                                            |
|  - Database Triggers: update_tutor_rating(), check_event_capacity()                   |
|  - Full-Text Search: GIN Indexes on Listings, Events, Tutors, and Projects            |
|  - Realistic Karnataka Seed Dataset (/supabase/seed.sql)                              |
+---------------------------------------------------------------------------------------+
```

---

## ✨ Core Features & Implementation Highlights

### 1. Auth, Domain Allowlist & Student Safety
- **Strict Accredited Domains**: Only institutional emails matching accredited Karnataka colleges are permitted:
  - `vvce.ac.in` (Vidyavardhaka College of Engineering, Mysuru)
  - `rvce.edu.in` (R.V. College of Engineering, Bengaluru)
  - `bmsce.ac.in` (B.M.S. College of Engineering, Bengaluru)
  - `msrit.edu` (Ramaiah Institute of Technology, Bengaluru)
  - `pes.edu` (PES University, Bengaluru)
  - `nitk.edu.in` (National Institute of Technology Karnataka, Surathkal)
- **Verified Student Badges**: Profiles show verified checks after email verification.
- **Privacy Toggles**: Students can selectively toggle visibility of their phone number and institutional email on marketplace listings.
- **Safety Reporting**: Universal report modal on every listing, profile, message, and community post.

### 2. Campus Marketplace & Listing Engine
- **Zero-Fee Peer Trading**: Buy and sell VTU engineering textbooks, drafters, calculators, and lab components across Karnataka colleges.
- **Client-Side Image Optimization**: Native HTML5 Canvas compression resizing to 1280px WebP, quality 0.8, and GPS EXIF metadata scrubbing for student privacy.
- **Multi-Photo Drag & Drop**: Upload 1 to 5 images with progress tracking, move-left/right reordering, cover photo designation, and Supabase Storage isolation (`{user_id}/{listing_id}/*`).
- **Post Item Flow with Live Card Preview**: Interactive live card preview mirroring form inputs in real-time, with unsaved change warnings before navigation.
- **Dynamic Browse & URL State Synchronization**: Debounced search (300ms), category pills, campus selector, condition chips, and price slider synced bidirectionally with URL query parameters.
- **Mobile Filter Drawer**: Responsive slide-in drawer for smartphone users with active filter badge counts.
- **Real-Time Notification Banner**: Supabase Realtime channel subscription notifying active shoppers when new items are posted by fellow students.
- **Listing Detail & Lightbox Gallery**: Full-screen image lightbox with arrow key navigation, seller contact reveal based on privacy permissions, and similar item recommendations.
- **Integrity & Anti-Abuse Rules**:
  - Daily posting limit: Maximum 10 listings per user per 24 hours.
  - Automated blocked words filter (`contains_blocked_words`).
  - Strict price bounds (₹0 to ₹1,00,000) and character limits.
  - Non-staff cannot tamper with `seller_id`, `college_id`, or restore removed listings.
- **Dedicated Management**:
  - `/marketplace/my-listings`: Tabs for Active, Sold, and Removed with view analytics.
  - `/marketplace/wishlist`: Saved items with instant remove and sold status flags.
  - Direct buyer-to-seller messaging via `start_direct_conversation` RPC.

### 3. State & Campus Events
- **Flagship Hackathons**: Karnataka Student Hackathon 2025, GenAI summits, and cultural fests.
- **Capacity Constraint**: Automatic database triggers and UI progress bars prevent overbooking.
- **1-Click RSVP & .ics Calendar Sync**: Instantly download `.ics` calendar invites for Google Calendar, Apple Calendar, or Outlook.
- **Organizer Attendee Roster**: Filter confirmed student participants and export to CSV.

### 4. Peer Tutoring & Booking Engine
- **Senior Mentorship**: 1-on-1 tutoring sessions with top rank holders (DSA, Engineering Math, IoT, Placement prep).
- **Slot Conflict Prevention**: Booking engine validates against tutor availability windows and prevents double-booking.
- **Dynamic Rating System**: Recalculates tutor rating average and review count upon completion.

### 5. Communities & Realtime Feeds
- **Specialized Guilds**: Computer Science & Coding Guild, Karnataka Students Network, Robotics & Hardware Hackers, GATE Aspirants, and Kannada Sahitya Sangha.
- **Interactive Feed**: Rich posts with image attachments, heart likes, nested comments, and pinned lead announcements.

### 6. Project Collaboration Squads
- **Hackathon Squad Matcher**: Assemble teams for SIH and state hackathons with skill requirement tags (AI, IoT, Next.js, Embedded C).
- **Squad Recruitment**: Owners receive join requests and can accept or decline applicants into the project workspace.

### 7. Realtime Messages & Notifications
- **Direct & Group Chats**: Instant messaging between buyers and sellers, students and tutors, and project squads.
- **Read Receipts & Attachments**: Image sharing, timestamping, blocking, and report buttons.
- **Activity Bell**: Real-time notifications for registration confirmations, booking requests, and squad acceptances.

### 8. Admin & Moderation Portal
- **Reports Queue**: Review reported content, dismiss reports, remove fraudulent listings, or suspend violating users.
- **Event Approvals**: Moderate and publish student-submitted event proposals.
- **Accreditation Management**: Add new college campuses and allowed `.ac.in` / `.edu.in` email domains dynamically.

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js v18+ (tested on Node v24.16.0)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd CampusConnect
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
GEMINI_API_KEY=your-gemini-key-optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
> *Note: CampusConnect contains a complete local mock and reactive data store that runs immediately out of the box even without external Supabase keys for offline testing!*

### 3. Run Automated Tests
```bash
npm test
```
Runs 22 comprehensive Vitest unit and integration tests covering:
- **Feature 1 & 2 Security & Onboarding Suite (14 tests)**:
  - Role toggle UI state, keyboard accessibility (`role="tablist"`, arrow keys), and URL sync (`?as=admin`)
  - Server-side role enforcement (rejection of student in Admin mode, rejection of admin in Student mode)
  - Admin audit trail generation (`admin_login_success`, `admin_login_failed`)
  - Admin brute-force lockout (5 failed attempts within 15 mins triggers lockout)
  - UI options visibility toggle (hiding Sign Up, Google SSO, College Email in Admin mode)
  - 4-step student onboarding progression, validation, and mid-way step recovery
  - Middleware route protection and redirect loops prevention
  - Safe `next` redirect parameter validation
  - Preservation of all original login behaviors (USN login, email login, suspended checks, unconfirmed email checks)
- **CampusConnect Core Platform Suite (8 tests)**:
  - College domain allowlist rejection and acceptance
  - Rupee currency formatting (`₹`) and date formatting
  - Event registration capacity enforcement & duplicate RSVP prevention
  - Tutor booking slot collision and double-booking prevention
  - Smart recommendation scoring by branch & interests

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

---

## 🔐 Login Security, Role Toggle & Brute-Force Protection (Feature 1)

CampusConnect features an in-place role toggle and hardened security rules on `/login`:
- **Segmented Role Toggle**: Switch between **Student** (GraduationCap icon) and **Admin** (Shield icon). Defaults to Student and persists the active state in the URL as `?as=admin` with full keyboard arrow key navigation (`role="tablist"`).
- **Zero Client Trust**: The toggle is merely a UI hint. After credentials authenticate, the server reads `profiles.role`:
  - **Student Mode**: If an administrator tries to log in through Student mode, they are signed out immediately with: `"This account is an administrator account. Please use the Admin login."`
  - **Admin Mode**: If a student tries to log in through Admin mode, they are signed out immediately with the generic message: `"These credentials can't be used for Admin login."` (No information about account existence or role is revealed).
- **Brute-Force Protection**: 5 failed login attempts from the same email or IP within 15 minutes triggers an automatic 15-minute lockout: `"Too many attempts. Try again in 15 minutes."` (Powered by the `login_attempts` table).
- **Admin Audit Trail**: Every successful and failed admin-mode login is logged to `admin_audit_log` (`admin_login_success`, `admin_login_failed`).
- **Safe Next Redirects**: Validates `next` query parameters against open redirects and ensures students cannot redirect to `/admin`.

---

## 🚀 4-Step Student Onboarding Wizard (Feature 2)

New confirmed students are automatically routed to `/onboarding` upon their first login:
1. **Step 1 — About You**: Avatar upload with a 2 MB file size limit and preview, engineering branch selection, academic year (1–4), and a short bio (max 160 characters with real-time counter).
2. **Step 2 — Interests**: 17 curated Karnataka engineering/tech chips (AI/ML, Web Dev, IoT, GATE, Placements, etc.) + custom additions. Minimum 3 required.
3. **Step 3 — Skills**: Tag input with suggestions (Python, Java, React, Docker, Figma, etc.) up to 10 skills.
4. **Step 4 — Join Communities**: Approved Karnataka student communities sorted dynamically so those matching the student's chosen interests come first, plus an optional toggle: *"I'd like to offer peer tutoring later"* (which unlocks a tutoring tip on the dashboard).
- **Step-by-Step Persistence**: Each step saves progress to Supabase / store on "Next", ensuring students who close their tab mid-way resume at the first incomplete step upon return.
- **Middleware Redirection**: Uncompleted students opening student pages (`/dashboard`, `/marketplace`, etc.) are redirected to `/onboarding`. Students who completed onboarding opening `/onboarding` are redirected to `/dashboard`.

---

## 🗄️ Database Migrations & Supabase Setup

### Available Migrations:
1. `001_initial_schema.sql`: 21 normalized PostgreSQL tables, RLS policies, full-text search indexes, and triggers.
2. `002_auth_trigger.sql`: Automatic profile creation trigger linking `auth.users` to `public.profiles`.
3. `003_login_and_onboarding.sql`:
   - Adds `onboarding_completed boolean DEFAULT false` to `profiles`.
   - Sets `onboarding_completed = true` for existing admins/moderators.
   - `protect_profile_privileged_columns` trigger preventing privilege escalation while permitting profile updates.
   - `login_attempts` table with RLS for brute-force mitigation.
   - `admin_audit_log` table with RLS policies.
   - `avatars` storage bucket with user folder upload RLS policies.

### Running Migrations via Supabase CLI or Dashboard
```bash
# Link to your Supabase project
supabase link --project-ref <your-project-ref>

# Apply the complete schema and RLS policies
supabase db push

# Or execute SQL files sequentially in Supabase SQL Editor:
# 1. /supabase/migrations/001_initial_schema.sql
# 2. /supabase/migrations/002_auth_trigger.sql
# 3. /supabase/migrations/003_login_and_onboarding.sql
# 4. /supabase/seed.sql
```

---

## 🌐 Deploying to Vercel + Supabase

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select your `CampusConnect` repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` (optional)
   - `NEXT_PUBLIC_APP_URL`
4. Deploy! Vercel automatically runs `next build` and generates the optimized production bundle.

---

## 📝 Design Tokens & Aesthetic Principles

Built in strict compliance with `DESIGN.md`:
- **Dual-Plane Palette**: High-contrast dark command rail (`#0F172A` to `#1E1B4B`) anchored on the left, paired with an airy paper-white operational workspace (`#F8FAFC`).
- **Primary Accent**: Electric Indigo (`#4F46E5` / Hover `#4338CA` / Soft wash `#EEF2FF`).
- **Typography**: Inter across all headings and metadata labels; tabular numerals (`font-variant-numeric: tabular-nums`) for currency prices.
- **Card Radius**: `16px` border-radius with `1px #E5E7EB` borders and soft ambient shadows.

---

## 🔒 Known Limitations & Future Enhancements

- **Realtime WebSockets in Offline Mode**: In local offline testing without Supabase credentials, realtime updates operate via event listeners and localStorage subscriptions; connecting a live Supabase project activates native PostgreSQL `pg_notify` and Supabase Realtime channels.
- **Payment Gateway**: Peer-to-peer textbook handoffs are currently cash/UPI handoffs on campus; razorpay/phonepe UPI escrow can be integrated for state-level transactions.
