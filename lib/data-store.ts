"use client";

import {
  College,
  Profile,
  Listing,
  Event,
  Tutor,
  TutoringSession,
  Community,
  CommunityPost,
  Project,
  Message,
  Conversation,
  Notification,
  Report,
  AdminAuditLog,
  LoginAttempt,
  OnboardingProgress,
} from "./types";
import {
  INITIAL_COLLEGES,
  INITIAL_PROFILES,
  INITIAL_LISTINGS,
  INITIAL_EVENTS,
  INITIAL_TUTORS,
  INITIAL_COMMUNITIES,
  INITIAL_PROJECTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  ALLOWED_COLLEGE_DOMAINS,
} from "./mock-data";

const STORAGE_KEYS = {
  CURRENT_USER_ID: "campus_connect_current_user_id",
  COLLEGES: "campus_connect_colleges",
  PROFILES: "campus_connect_profiles",
  LISTINGS: "campus_connect_listings",
  WISHLISTS: "campus_connect_wishlists",
  EVENTS: "campus_connect_events",
  EVENT_REGS: "campus_connect_event_regs",
  TUTORS: "campus_connect_tutors",
  SESSIONS: "campus_connect_sessions",
  COMMUNITIES: "campus_connect_communities",
  COMMUNITY_MEMBERS: "campus_connect_comm_members",
  POSTS: "campus_connect_posts",
  PROJECTS: "campus_connect_projects",
  PROJECT_REQS: "campus_connect_project_reqs",
  CONVERSATIONS: "campus_connect_conversations",
  MESSAGES: "campus_connect_messages",
  NOTIFICATIONS: "campus_connect_notifications",
  REPORTS: "campus_connect_reports",
  BLOCKS: "campus_connect_blocks",
  ALLOWED_DOMAINS: "campus_connect_domains",
  LOGIN_ATTEMPTS: "campus_connect_login_attempts",
  ADMIN_AUDIT_LOGS: "campus_connect_admin_audit_logs",
  ONBOARDING_PROGRESS: "campus_connect_onboarding_progress",
};

class DataStore {
  private static instance: DataStore;
  private listeners: Set<() => void> = new Set();
  private memoryStore: Map<string, any> = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  private getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      return this.memoryStore.has(key) ? this.memoryStore.get(key) : fallback;
    }
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T) {
    if (typeof window === "undefined") {
      this.memoryStore.set(key, JSON.parse(JSON.stringify(value)));
      this.notify();
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error("Storage error:", e);
    }
  }

  public resetForTesting() {
    this.memoryStore.clear();
    this.memoryStore.set(STORAGE_KEYS.PROFILES, JSON.parse(JSON.stringify(INITIAL_PROFILES)));
    this.memoryStore.set(STORAGE_KEYS.COLLEGES, JSON.parse(JSON.stringify(INITIAL_COLLEGES)));
    this.memoryStore.set(STORAGE_KEYS.ALLOWED_DOMAINS, [...ALLOWED_COLLEGE_DOMAINS]);
    this.memoryStore.set(STORAGE_KEYS.LOGIN_ATTEMPTS, []);
    this.memoryStore.set(STORAGE_KEYS.ADMIN_AUDIT_LOGS, []);
    this.memoryStore.set(STORAGE_KEYS.ONBOARDING_PROGRESS, {});
  }

  private init() {
    if (typeof window === "undefined") {
      this.resetForTesting();
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      this.setItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COLLEGES)) {
      this.setItem(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALLOWED_DOMAINS)) {
      this.setItem(STORAGE_KEYS.ALLOWED_DOMAINS, ALLOWED_COLLEGE_DOMAINS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LISTINGS)) {
      this.setItem(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
      this.setItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TUTORS)) {
      this.setItem(STORAGE_KEYS.TUTORS, INITIAL_TUTORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNITIES)) {
      this.setItem(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.setItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      this.setItem(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER_ID, "usr-demo-student");
    }

    // Default sample messages & conversations
    if (!localStorage.getItem(STORAGE_KEYS.CONVERSATIONS)) {
      const demoConvs: Conversation[] = [
        {
          id: "conv-1",
          type: "direct",
          ref_type: "tutor",
          ref_id: "usr-rohan",
          title: "Rohan Kumar",
          participants: [
            INITIAL_PROFILES[0], // Darshan
            INITIAL_PROFILES[2], // Rohan
          ],
          last_message: {
            id: "msg-1",
            conversation_id: "conv-1",
            sender_id: "usr-rohan",
            content: "Hey Darshan! Looking forward to our DSA session on Dynamic Programming on Monday.",
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          unread_count: 1,
          updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "conv-2",
          type: "direct",
          ref_type: "listing",
          ref_id: "list-1",
          title: "Introduction to Algorithms (CLRS Book)",
          participants: [
            INITIAL_PROFILES[0],
            INITIAL_PROFILES[3], // Aishwarya
          ],
          last_message: {
            id: "msg-2",
            conversation_id: "conv-2",
            sender_id: "usr-aishwarya",
            content: "Is this book still available? Can we meet near the BMSCE library?",
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          },
          unread_count: 0,
          updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
      ];
      this.setItem(STORAGE_KEYS.CONVERSATIONS, demoConvs);

      const demoMsgs: Message[] = [
        {
          id: "msg-0",
          conversation_id: "conv-1",
          sender_id: "usr-demo-student",
          content: "Hi Rohan, I booked a slot for DSA Graphs & DP this Monday at 6 PM.",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: "msg-1",
          conversation_id: "conv-1",
          sender_id: "usr-rohan",
          content: "Hey Darshan! Looking forward to our DSA session on Dynamic Programming on Monday.",
          is_read: false,
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "msg-2",
          conversation_id: "conv-2",
          sender_id: "usr-aishwarya",
          content: "Is this book still available? Can we meet near the BMSCE library?",
          is_read: true,
          created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
      ];
      this.setItem(STORAGE_KEYS.MESSAGES, demoMsgs);
    }

    // Default sample posts
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      const demoPosts: CommunityPost[] = [
        {
          id: "post-1",
          community_id: "comm-1",
          author_id: "usr-rohan",
          content: "🚀 LeetCode Daily Challenge Tip: When tackling Graph Cycle detection in directed graphs, 3-state coloring (White, Gray, Black) using DFS prevents O(N^2) stack overflows. What's your go-to approach?",
          is_pinned: true,
          likes_count: 42,
          comments_count: 5,
          is_liked: true,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          comments: [
            {
              id: "comm-c-1",
              post_id: "post-1",
              author_id: "usr-demo-student",
              content: "Kahn's Topological Sort algorithm with in-degree array is super clean for this too!",
              created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            },
          ],
        },
        {
          id: "post-2",
          community_id: "comm-2",
          author_id: "usr-demo-student",
          content: "Excited to welcome student developers from RVCE, BMSCE, MSRIT, PES, and NITK Surathkal to Mysuru for the upcoming Karnataka Student Hackathon 2025! Free shuttle buses will operate from Mysuru Suburban Bus Stand and Railway Station.",
          image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
          is_pinned: true,
          likes_count: 88,
          comments_count: 12,
          is_liked: false,
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        },
      ];
      this.setItem(STORAGE_KEYS.POSTS, demoPosts);
    }
  }

  // --- CURRENT USER & AUTH ---
  public getCurrentUserId(): string {
    return this.getItem(STORAGE_KEYS.CURRENT_USER_ID, "usr-demo-student");
  }

  public setCurrentUserId(id: string) {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  public getCurrentProfile(): Profile {
    const id = this.getCurrentUserId();
    const profiles = this.getProfiles();
    const p = profiles.find((prof) => prof.id === id);
    if (p) {
      const colleges = this.getColleges();
      p.college = colleges.find((c) => c.id === p.college_id);
      return p;
    }
    if (id && id !== "usr-demo-student" && id !== "") {
      return {
        id,
        full_name: "Student",
        email: "",
        usn: "",
        branch: "Engineering",
        year: 1,
        role: "student",
        is_verified: true,
        is_suspended: false,
        interests: [],
        skills: [],
        show_phone: false,
        show_email: true,
      };
    }
    return profiles[0] || INITIAL_PROFILES[0];
  }

  public getProfiles(): Profile[] {
    return this.getItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  }

  public updateProfile(updated: Partial<Profile>) {
    const profiles = this.getProfiles();
    const currentId = this.getCurrentUserId();
    const idx = profiles.findIndex((p) => p.id === currentId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updated, updated_at: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.PROFILES, profiles);
    } else if (currentId) {
      const newP: Profile = {
        id: currentId,
        full_name: "Student",
        email: "",
        usn: "",
        branch: "Engineering",
        year: 1,
        role: "student",
        is_verified: true,
        is_suspended: false,
        interests: [],
        skills: [],
        show_phone: false,
        show_email: true,
        ...updated,
      };
      profiles.push(newP);
      this.setItem(STORAGE_KEYS.PROFILES, profiles);
    }
  }

  public updateProfileById(id: string, updated: Partial<Profile>) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updated, updated_at: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.PROFILES, profiles);
    }
  }

  public upsertProfile(profile: Profile) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id || p.email?.toLowerCase() === profile.email?.toLowerCase());
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...profile, updated_at: new Date().toISOString() };
    } else {
      profiles.push(profile);
    }
    this.setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  public addProfile(newProfile: Profile) {
    const profiles = this.getProfiles();
    profiles.push(newProfile);
    this.setItem(STORAGE_KEYS.PROFILES, profiles);
  }

  public getColleges(): College[] {
    return this.getItem(STORAGE_KEYS.COLLEGES, INITIAL_COLLEGES);
  }

  public addCollege(college: College) {
    const list = this.getColleges();
    list.push(college);
    this.setItem(STORAGE_KEYS.COLLEGES, list);
  }

  public getAllowedDomains(): string[] {
    return this.getItem(STORAGE_KEYS.ALLOWED_DOMAINS, ALLOWED_COLLEGE_DOMAINS);
  }

  public addAllowedDomain(domain: string) {
    const list = this.getAllowedDomains();
    if (!list.includes(domain.toLowerCase())) {
      list.push(domain.toLowerCase());
      this.setItem(STORAGE_KEYS.ALLOWED_DOMAINS, list);
    }
  }

  public removeAllowedDomain(domain: string) {
    let list = this.getAllowedDomains();
    list = list.filter((d) => d.toLowerCase() !== domain.toLowerCase());
    this.setItem(STORAGE_KEYS.ALLOWED_DOMAINS, list);
  }

  // --- MARKETPLACE ---
  public getListings(): Listing[] {
    const list = this.getItem(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    const profiles = this.getProfiles();
    const colleges = this.getColleges();
    const wishlists = this.getWishlists();
    const userId = this.getCurrentUserId();

    return list.map((item) => ({
      ...item,
      seller: profiles.find((p) => p.id === item.seller_id),
      college: colleges.find((c) => c.id === item.college_id),
      is_wishlisted: wishlists.includes(item.id),
    }));
  }

  public getListingById(id: string): Listing | undefined {
    return this.getListings().find((l) => l.id === id);
  }

  public createListing(data: Omit<Listing, "id" | "seller_id" | "created_at"> & { id?: string }): Listing {
    const currentProfile = this.getCurrentProfile();
    const listings = this.getItem<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    const newListing: Listing = {
      ...data,
      id: data.id || `list-${Date.now()}`,
      seller_id: currentProfile.id,
      college_id: currentProfile.college_id,
      created_at: new Date().toISOString(),
    };
    listings.unshift(newListing);
    this.setItem(STORAGE_KEYS.LISTINGS, listings);
    return newListing;
  }

  public updateListing(id: string, updates: Partial<Listing>) {
    const listings = this.getItem<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    const idx = listings.findIndex((l) => l.id === id);
    if (idx !== -1) {
      listings[idx] = { ...listings[idx], ...updates };
      this.setItem(STORAGE_KEYS.LISTINGS, listings);
    }
  }

  public deleteListing(id: string) {
    const listings = this.getItem<Listing[]>(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    const item = listings.find((l) => l.id === id);
    if (item) {
      item.status = "removed";
      this.setItem(STORAGE_KEYS.LISTINGS, listings);
    }
  }

  public getWishlists(): string[] {
    return this.getItem(STORAGE_KEYS.WISHLISTS, ["list-1", "list-3"]);
  }

  public toggleWishlist(listingId: string): boolean {
    const wishlists = this.getWishlists();
    const exists = wishlists.includes(listingId);
    let updated: string[];
    if (exists) {
      updated = wishlists.filter((id) => id !== listingId);
    } else {
      updated = [...wishlists, listingId];
    }
    this.setItem(STORAGE_KEYS.WISHLISTS, updated);
    return !exists;
  }

  // --- EVENTS ---
  public getEvents(): Event[] {
    const events = this.getItem(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const profiles = this.getProfiles();
    const colleges = this.getColleges();
    const regs = this.getEventRegistrations();
    const userId = this.getCurrentUserId();

    return events.map((evt) => ({
      ...evt,
      organizer: profiles.find((p) => p.id === evt.organizer_id),
      college: colleges.find((c) => c.id === evt.college_id),
      is_registered: regs.some((r) => r.event_id === evt.id && r.user_id === userId && r.status === "confirmed"),
    }));
  }

  public getEventById(id: string): Event | undefined {
    return this.getEvents().find((e) => e.id === id);
  }

  public registerForEvent(eventId: string): { success: boolean; message: string } {
    const userId = this.getCurrentUserId();
    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return { success: false, message: "Event not found." };

    const regs = this.getEventRegistrations();
    const alreadyReg = regs.find((r) => r.event_id === eventId && r.user_id === userId && r.status === "confirmed");
    if (alreadyReg) return { success: false, message: "You are already registered for this event." };

    const currentCount = evt.registered_count || 0;
    if (currentCount >= evt.capacity) {
      return { success: false, message: "Sorry, this event has reached full capacity." };
    }

    // Add registration
    regs.push({
      id: `reg-${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      status: "confirmed",
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.EVENT_REGS, regs);

    // Increment count
    evt.registered_count = currentCount + 1;
    this.setItem(STORAGE_KEYS.EVENTS, events);

    // Send notification
    this.addNotification({
      user_id: userId,
      type: "registration_confirmed",
      payload: {
        event_title: evt.title,
        venue: evt.venue,
        date: new Date(evt.start_at).toLocaleDateString("en-IN"),
      },
    });

    return { success: true, message: "Successfully registered for event!" };
  }

  public cancelEventRegistration(eventId: string): { success: boolean; message: string } {
    const userId = this.getCurrentUserId();
    const regs = this.getEventRegistrations();
    const idx = regs.findIndex((r) => r.event_id === eventId && r.user_id === userId);
    if (idx !== -1) {
      regs[idx].status = "cancelled";
      this.setItem(STORAGE_KEYS.EVENT_REGS, regs);

      const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
      const evt = events.find((e) => e.id === eventId);
      if (evt && evt.registered_count && evt.registered_count > 0) {
        evt.registered_count -= 1;
        this.setItem(STORAGE_KEYS.EVENTS, events);
      }
      return { success: true, message: "Registration cancelled." };
    }
    return { success: false, message: "Registration not found." };
  }

  public getEventRegistrations(): { id: string; event_id: string; user_id: string; status: "confirmed" | "cancelled"; created_at: string }[] {
    return this.getItem(STORAGE_KEYS.EVENT_REGS, [
      { id: "reg-1", event_id: "evt-1", user_id: "usr-demo-student", status: "confirmed", created_at: new Date().toISOString() },
      { id: "reg-2", event_id: "evt-4", user_id: "usr-demo-student", status: "confirmed", created_at: new Date().toISOString() },
    ]);
  }

  public createEvent(data: Omit<Event, "id" | "organizer_id" | "created_at" | "registered_count" | "status">): Event {
    const currentProfile = this.getCurrentProfile();
    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const newEvent: Event = {
      ...data,
      id: `evt-${Date.now()}`,
      organizer_id: currentProfile.id,
      college_id: currentProfile.college_id,
      registered_count: 1,
      status: currentProfile.role === "admin" ? "approved" : "pending",
      created_at: new Date().toISOString(),
    };
    events.unshift(newEvent);
    this.setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  public approveEvent(id: string) {
    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const evt = events.find((e) => e.id === id);
    if (evt) {
      evt.status = "approved";
      this.setItem(STORAGE_KEYS.EVENTS, events);
    }
  }

  public rejectEvent(id: string) {
    const events = this.getItem<Event[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const evt = events.find((e) => e.id === id);
    if (evt) {
      evt.status = "rejected";
      this.setItem(STORAGE_KEYS.EVENTS, events);
    }
  }

  // --- TUTORS & BOOKINGS ---
  public getTutors(): Tutor[] {
    const tutors = this.getItem(STORAGE_KEYS.TUTORS, INITIAL_TUTORS);
    const profiles = this.getProfiles();
    return tutors.map((t) => ({
      ...t,
      profile: profiles.find((p) => p.id === t.user_id),
    }));
  }

  public getTutorById(userId: string): Tutor | undefined {
    return this.getTutors().find((t) => t.user_id === userId);
  }

  public becomeTutor(data: Omit<Tutor, "user_id" | "rating_avg" | "rating_count">) {
    const currentProfile = this.getCurrentProfile();
    const tutors = this.getItem<Tutor[]>(STORAGE_KEYS.TUTORS, INITIAL_TUTORS);
    const existingIdx = tutors.findIndex((t) => t.user_id === currentProfile.id);
    const newTutor: Tutor = {
      ...data,
      user_id: currentProfile.id,
      rating_avg: 5.0,
      rating_count: 0,
      created_at: new Date().toISOString(),
    };
    if (existingIdx !== -1) {
      tutors[existingIdx] = { ...tutors[existingIdx], ...newTutor };
    } else {
      tutors.push(newTutor);
    }
    this.setItem(STORAGE_KEYS.TUTORS, tutors);
    return newTutor;
  }

  public getTutoringSessions(): TutoringSession[] {
    const sessions = this.getItem<TutoringSession[]>(STORAGE_KEYS.SESSIONS, [
      {
        id: "sess-1",
        tutor_id: "usr-rohan",
        student_id: "usr-demo-student",
        subject: "Data Structures & Algorithms",
        start_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        end_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 2).toISOString(),
        mode: "online",
        note: "Dynamic Programming questions and LeetCode graph traversal practice.",
        status: "confirmed",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: "sess-completed",
        tutor_id: "usr-aishwarya",
        student_id: "usr-demo-student",
        subject: "Engineering Mathematics (M2)",
        start_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        end_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60 * 2).toISOString(),
        mode: "online",
        note: "Fourier transform series for internals.",
        status: "completed",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      },
    ]);
    const profiles = this.getProfiles();
    const tutors = this.getTutors();
    return sessions.map((s) => ({
      ...s,
      student: profiles.find((p) => p.id === s.student_id),
      tutor: tutors.find((t) => t.user_id === s.tutor_id),
    }));
  }

  public bookSession(data: {
    tutor_id: string;
    subject: string;
    start_at: string;
    end_at: string;
    mode: "online" | "offline";
    note?: string;
  }): { success: boolean; message: string; session?: TutoringSession } {
    const studentId = this.getCurrentUserId();
    const sessions = this.getItem<TutoringSession[]>(STORAGE_KEYS.SESSIONS, []);

    // Check double-booking slot conflict
    const reqStart = new Date(data.start_at).getTime();
    const reqEnd = new Date(data.end_at).getTime();

    const hasConflict = sessions.some((s) => {
      if (s.tutor_id === data.tutor_id && s.status !== "cancelled") {
        const sStart = new Date(s.start_at).getTime();
        const sEnd = new Date(s.end_at).getTime();
        return Math.max(reqStart, sStart) < Math.min(reqEnd, sEnd);
      }
      return false;
    });

    if (hasConflict) {
      return { success: false, message: "This slot is already booked for this tutor. Please select another time." };
    }

    const newSession: TutoringSession = {
      id: `sess-${Date.now()}`,
      tutor_id: data.tutor_id,
      student_id: studentId,
      subject: data.subject,
      start_at: data.start_at,
      end_at: data.end_at,
      mode: data.mode,
      note: data.note,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    sessions.push(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);

    // Notify tutor
    this.addNotification({
      user_id: data.tutor_id,
      type: "booking_request",
      payload: {
        student_name: this.getCurrentProfile().full_name,
        subject: data.subject,
        time: new Date(data.start_at).toLocaleString("en-IN"),
      },
    });

    return { success: true, message: "Booking request sent to tutor!", session: newSession };
  }

  public updateSessionStatus(sessionId: string, status: "confirmed" | "completed" | "cancelled") {
    const sessions = this.getItem<TutoringSession[]>(STORAGE_KEYS.SESSIONS, []);
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx].status = status;
      this.setItem(STORAGE_KEYS.SESSIONS, sessions);

      // Notify student
      const sess = sessions[idx];
      this.addNotification({
        user_id: sess.student_id,
        type: status === "confirmed" ? "booking_accepted" : "booking_rejected",
        payload: {
          session_id: sess.id,
          subject: sess.subject,
          status,
        },
      });
    }
  }

  public addTutorReview(sessionId: string, tutorId: string, rating: number, comment: string) {
    const currentId = this.getCurrentUserId();
    const tutors = this.getItem<Tutor[]>(STORAGE_KEYS.TUTORS, INITIAL_TUTORS);
    const tutor = tutors.find((t) => t.user_id === tutorId);
    if (tutor) {
      if (!tutor.reviews) tutor.reviews = [];
      tutor.reviews.push({
        id: `rev-${Date.now()}`,
        session_id: sessionId,
        tutor_id: tutorId,
        student_id: currentId,
        rating,
        comment,
        created_at: new Date().toISOString(),
      });
      // Recalculate average
      const total = tutor.reviews.reduce((acc, r) => acc + r.rating, 0);
      tutor.rating_count = tutor.reviews.length;
      tutor.rating_avg = Number((total / tutor.reviews.length).toFixed(2));
      this.setItem(STORAGE_KEYS.TUTORS, tutors);
    }
  }

  // --- COMMUNITIES ---
  public getCommunities(): Community[] {
    const comms = this.getItem(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const userId = this.getCurrentUserId();
    const memberMap = this.getItem<Record<string, boolean>>(STORAGE_KEYS.COMMUNITY_MEMBERS, {
      "comm-1": true,
      "comm-2": true,
      "comm-4": true,
      "comm-6": true,
    });
    return comms.map((c) => ({
      ...c,
      is_member: !!memberMap[c.id],
      is_admin: c.created_by === userId,
    }));
  }

  public getCommunityById(id: string): Community | undefined {
    return this.getCommunities().find((c) => c.id === id);
  }

  public toggleCommunityMembership(communityId: string): boolean {
    const memberMap = this.getItem<Record<string, boolean>>(STORAGE_KEYS.COMMUNITY_MEMBERS, {});
    const isMember = !!memberMap[communityId];
    memberMap[communityId] = !isMember;
    this.setItem(STORAGE_KEYS.COMMUNITY_MEMBERS, memberMap);

    // Update community member count
    const comms = this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const c = comms.find((item) => item.id === communityId);
    if (c) {
      c.member_count = (c.member_count || 1) + (isMember ? -1 : 1);
      this.setItem(STORAGE_KEYS.COMMUNITIES, comms);
    }
    return !isMember;
  }

  public createCommunity(data: Omit<Community, "id" | "created_by" | "member_count" | "status">): Community {
    const currentId = this.getCurrentUserId();
    const comms = this.getItem<Community[]>(STORAGE_KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
    const newComm: Community = {
      ...data,
      id: `comm-${Date.now()}`,
      created_by: currentId,
      status: "approved",
      member_count: 1,
      is_member: true,
      is_admin: true,
    };
    comms.push(newComm);
    this.setItem(STORAGE_KEYS.COMMUNITIES, comms);

    const memberMap = this.getItem<Record<string, boolean>>(STORAGE_KEYS.COMMUNITY_MEMBERS, {});
    memberMap[newComm.id] = true;
    this.setItem(STORAGE_KEYS.COMMUNITY_MEMBERS, memberMap);

    return newComm;
  }

  public getPostsByCommunity(communityId: string): CommunityPost[] {
    const posts = this.getItem<CommunityPost[]>(STORAGE_KEYS.POSTS, []);
    const profiles = this.getProfiles();
    return posts
      .filter((p) => p.community_id === communityId)
      .map((p) => ({
        ...p,
        author: profiles.find((prof) => prof.id === p.author_id),
        comments: (p.comments || []).map((c) => ({
          ...c,
          author: profiles.find((prof) => prof.id === c.author_id),
        })),
      }))
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }

  public createPost(communityId: string, content: string, image_url?: string): CommunityPost {
    const currentProfile = this.getCurrentProfile();
    const posts = this.getItem<CommunityPost[]>(STORAGE_KEYS.POSTS, []);
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      community_id: communityId,
      author_id: currentProfile.id,
      content,
      image_url,
      is_pinned: false,
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      comments: [],
      created_at: new Date().toISOString(),
    };
    posts.unshift(newPost);
    this.setItem(STORAGE_KEYS.POSTS, posts);
    return newPost;
  }

  public toggleLikePost(postId: string) {
    const posts = this.getItem<CommunityPost[]>(STORAGE_KEYS.POSTS, []);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.is_liked = !post.is_liked;
      post.likes_count = (post.likes_count || 0) + (post.is_liked ? 1 : -1);
      this.setItem(STORAGE_KEYS.POSTS, posts);
    }
  }

  public addPostComment(postId: string, content: string) {
    const currentProfile = this.getCurrentProfile();
    const posts = this.getItem<CommunityPost[]>(STORAGE_KEYS.POSTS, []);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      if (!post.comments) post.comments = [];
      post.comments.push({
        id: `pcomm-${Date.now()}`,
        post_id: postId,
        author_id: currentProfile.id,
        content,
        created_at: new Date().toISOString(),
      });
      post.comments_count = post.comments.length;
      this.setItem(STORAGE_KEYS.POSTS, posts);
    }
  }

  public togglePinPost(postId: string) {
    const posts = this.getItem<CommunityPost[]>(STORAGE_KEYS.POSTS, []);
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.is_pinned = !post.is_pinned;
      this.setItem(STORAGE_KEYS.POSTS, posts);
    }
  }

  // --- PROJECTS ---
  public getProjects(): Project[] {
    const projs = this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const userId = this.getCurrentUserId();
    const profiles = this.getProfiles();

    return projs.map((p) => {
      const isMember = (p.members || []).some((m) => m.user_id === userId) || p.owner_id === userId;
      const hasReq = (p.requests || []).some((r) => r.user_id === userId && r.status === "pending");
      return {
        ...p,
        owner: profiles.find((prof) => prof.id === p.owner_id),
        current_members_count: (p.members || []).length,
        is_member: isMember,
        has_requested: hasReq,
        members: (p.members || []).map((m) => ({
          ...m,
          user: profiles.find((prof) => prof.id === m.user_id),
        })),
        requests: (p.requests || []).map((r) => ({
          ...r,
          user: profiles.find((prof) => prof.id === r.user_id),
        })),
      };
    });
  }

  public getProjectById(id: string): Project | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  public createProject(data: {
    title: string;
    description: string;
    skills: string[];
    tags: string[];
    team_size: number;
    hackathon_url?: string;
  }): Project {
    const currentProfile = this.getCurrentProfile();
    const projects = this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      owner_id: currentProfile.id,
      status: "active",
      created_at: new Date().toISOString(),
      members: [{ project_id: `proj-${Date.now()}`, user_id: currentProfile.id, role: "Project Lead", created_at: new Date().toISOString() }],
      requests: [],
    };
    projects.unshift(newProject);
    this.setItem(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  }

  public requestToJoinProject(projectId: string, message: string) {
    const currentProfile = this.getCurrentProfile();
    const projects = this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      if (!proj.requests) proj.requests = [];
      proj.requests.push({
        id: `preq-${Date.now()}`,
        project_id: projectId,
        user_id: currentProfile.id,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
      });
      this.setItem(STORAGE_KEYS.PROJECTS, projects);

      // Notify owner
      this.addNotification({
        user_id: proj.owner_id,
        type: "join_request",
        payload: {
          applicant_name: currentProfile.full_name,
          project_title: proj.title,
        },
      });
    }
  }

  public respondToProjectRequest(projectId: string, requestId: string, accept: boolean) {
    const projects = this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const proj = projects.find((p) => p.id === projectId);
    if (proj && proj.requests) {
      const req = proj.requests.find((r) => r.id === requestId);
      if (req) {
        req.status = accept ? "accepted" : "rejected";
        if (accept) {
          if (!proj.members) proj.members = [];
          proj.members.push({
            project_id: projectId,
            user_id: req.user_id,
            role: "Collaborator",
            created_at: new Date().toISOString(),
          });
        }
        this.setItem(STORAGE_KEYS.PROJECTS, projects);
      }
    }
  }

  // --- MESSAGES & CONVERSATIONS ---
  public getConversations(): Conversation[] {
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const userId = this.getCurrentUserId();
    const profiles = this.getProfiles();

    return convs
      .filter((c) => c.participants.some((p) => p.id === userId))
      .map((c) => ({
        ...c,
        participants: c.participants.map((p) => profiles.find((prof) => prof.id === p.id) || p),
      }))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  }

  public getMessages(conversationId: string): Message[] {
    const msgs = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const profiles = this.getProfiles();
    return msgs
      .filter((m) => m.conversation_id === conversationId)
      .map((m) => ({
        ...m,
        sender: profiles.find((p) => p.id === m.sender_id),
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  public sendMessage(conversationId: string, content: string, attachment_url?: string): Message {
    const currentId = this.getCurrentUserId();
    const msgs = this.getItem<Message[]>(STORAGE_KEYS.MESSAGES, []);
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentId,
      content,
      attachment_url,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    msgs.push(newMsg);
    this.setItem(STORAGE_KEYS.MESSAGES, msgs);

    // Update conversation last message
    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const conv = convs.find((c) => c.id === conversationId);
    if (conv) {
      conv.last_message = newMsg;
      conv.updated_at = newMsg.created_at;
      this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
    }
    return newMsg;
  }

  public startOrGetDirectConversation(otherUserId: string, title?: string, ref_type?: any, ref_id?: string): string {
    const currentProfile = this.getCurrentProfile();
    const otherProfile = this.getProfiles().find((p) => p.id === otherUserId);
    if (!otherProfile) return "conv-1";

    const convs = this.getItem<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const existing = convs.find(
      (c) =>
        c.type === "direct" &&
        c.participants.some((p) => p.id === currentProfile.id) &&
        c.participants.some((p) => p.id === otherUserId)
    );

    if (existing) return existing.id;

    const newConvId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      type: "direct",
      ref_type,
      ref_id,
      title: title || otherProfile.full_name,
      participants: [currentProfile, otherProfile],
      updated_at: new Date().toISOString(),
    };
    convs.unshift(newConv);
    this.setItem(STORAGE_KEYS.CONVERSATIONS, convs);
    return newConvId;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(): Notification[] {
    const list = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const userId = this.getCurrentUserId();
    return list
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNotification(data: Omit<Notification, "id" | "created_at" | "is_read">) {
    const list = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.unshift({
      ...data,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  public markNotificationAsRead(id: string) {
    const list = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif = list.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  public markAllNotificationsAsRead() {
    const list = this.getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const userId = this.getCurrentUserId();
    list.forEach((n) => {
      if (n.user_id === userId) n.is_read = true;
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // --- REPORTS & MODERATION ---
  public getReports(): Report[] {
    const list = this.getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const profiles = this.getProfiles();
    return list.map((r) => ({
      ...r,
      reporter: profiles.find((p) => p.id === r.reporter_id),
    }));
  }

  public createReport(data: {
    target_type: "listing" | "user" | "message" | "post" | "community";
    target_id: string;
    target_title?: string;
    reason: string;
  }) {
    const currentId = this.getCurrentUserId();
    const list = this.getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    list.unshift({
      id: `rep-${Date.now()}`,
      reporter_id: currentId,
      target_type: data.target_type,
      target_id: data.target_id,
      target_title: data.target_title,
      reason: data.reason,
      status: "pending",
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.REPORTS, list);
  }

  public resolveReport(reportId: string, action: "resolve" | "remove_content" | "suspend_user") {
    const list = this.getItem<Report[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const rep = list.find((r) => r.id === reportId);
    if (rep) {
      rep.status = "resolved";
      rep.action_taken = action;
      this.setItem(STORAGE_KEYS.REPORTS, list);

      if (action === "remove_content") {
        if (rep.target_type === "listing") {
          this.deleteListing(rep.target_id);
        }
      } else if (action === "suspend_user") {
        const profiles = this.getProfiles();
        const p = profiles.find((prof) => prof.id === rep.target_id);
        if (p) {
          p.is_suspended = true;
          this.setItem(STORAGE_KEYS.PROFILES, profiles);
        }
      }
    }
  }

  // --- BLOCKS ---
  public blockUser(targetUserId: string) {
    const currentId = this.getCurrentUserId();
    const blocks = this.getItem<string[]>(STORAGE_KEYS.BLOCKS, []);
    const key = `${currentId}:${targetUserId}`;
    if (!blocks.includes(key)) {
      blocks.push(key);
      this.setItem(STORAGE_KEYS.BLOCKS, blocks);
    }
  }

  // --- BRUTE-FORCE PROTECTION & LOGIN ATTEMPTS ---
  public checkAdminLockout(identifier: string, ip: string = "127.0.0.1"): { locked: boolean; remainingMinutes?: number } {
    const attempts = this.getItem<LoginAttempt[]>(STORAGE_KEYS.LOGIN_ATTEMPTS, []);
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    const cleanIdent = identifier.toLowerCase().trim();

    // Filter failed attempts for this email or IP in the last 15 minutes
    const recentFailed = attempts.filter((a) => {
      const attemptTime = new Date(a.created_at).getTime();
      if (attemptTime < fifteenMinutesAgo) return false;
      if (a.success) return false;
      const emailMatch = a.email && a.email.toLowerCase() === cleanIdent;
      const ipMatch = a.ip && a.ip === ip;
      return emailMatch || ipMatch;
    });

    if (recentFailed.length >= 5) {
      // Find oldest of the 5 failed attempts to compute remaining lockout time
      const oldestAttempt = recentFailed.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
      const expiry = new Date(oldestAttempt.created_at).getTime() + 15 * 60 * 1000;
      const remainingMinutes = Math.max(1, Math.ceil((expiry - now) / (60 * 1000)));
      return { locked: true, remainingMinutes };
    }

    return { locked: false };
  }

  public recordLoginAttempt(email: string, ip: string = "127.0.0.1", success: boolean) {
    const attempts = this.getItem<LoginAttempt[]>(STORAGE_KEYS.LOGIN_ATTEMPTS, []);
    attempts.push({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase().trim(),
      ip,
      success,
      created_at: new Date().toISOString(),
    });
    // Keep only last 200 attempts
    if (attempts.length > 200) attempts.splice(0, attempts.length - 200);
    this.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, attempts);
  }

  // --- ADMIN AUDIT LOG ---
  public logAdminAudit(adminId: string, action: string, details?: Record<string, any>, ip: string = "127.0.0.1") {
    const logs = this.getItem<AdminAuditLog[]>(STORAGE_KEYS.ADMIN_AUDIT_LOGS, []);
    const entry: AdminAuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      admin_id: adminId,
      action,
      details: details || {},
      ip_address: ip,
      created_at: new Date().toISOString(),
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop();
    this.setItem(STORAGE_KEYS.ADMIN_AUDIT_LOGS, logs);
    return entry;
  }

  public getAdminAuditLogs(): AdminAuditLog[] {
    return this.getItem<AdminAuditLog[]>(STORAGE_KEYS.ADMIN_AUDIT_LOGS, []);
  }

  // --- ONBOARDING STEP PERSISTENCE ---
  public saveOnboardingProgress(userId: string, progress: Partial<OnboardingProgress>) {
    const map = this.getItem<Record<string, OnboardingProgress>>(STORAGE_KEYS.ONBOARDING_PROGRESS, {});
    const existing = map[userId] || { step: 1 };
    map[userId] = { ...existing, ...progress };
    this.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, map);
  }

  public getOnboardingProgress(userId: string): OnboardingProgress | null {
    const map = this.getItem<Record<string, OnboardingProgress>>(STORAGE_KEYS.ONBOARDING_PROGRESS, {});
    return map[userId] || null;
  }

  public clearOnboardingProgress(userId: string) {
    const map = this.getItem<Record<string, OnboardingProgress>>(STORAGE_KEYS.ONBOARDING_PROGRESS, {});
    delete map[userId];
    this.setItem(STORAGE_KEYS.ONBOARDING_PROGRESS, map);
  }
}

export const dataStore = DataStore.getInstance();
