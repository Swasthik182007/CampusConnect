"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShoppingBag,
  Calendar,
  BookOpen,
  Users,
  FolderGit2,
  ArrowRight,
  Heart,
  BadgeCheck,
  MapPin,
  Clock,
  PlusCircle,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";
import { computeRecommendations, RecommendationItem } from "@/lib/recommendations";
import { formatINR, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "events" | "marketplace" | "tutors">("all");

  // Client-side authentication guard
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login?next=/dashboard");
      } else if (user.role === "student" && user.onboarding_completed === false) {
        router.replace("/onboarding");
      }
    }
  }, [user, isLoading, router]);

  const listings = dataStore.getListings();
  const events = dataStore.getEvents();
  const tutors = dataStore.getTutors();
  const communities = dataStore.getCommunities();
  const sessions = dataStore.getTutoringSessions();
  const conversations = dataStore.getConversations();

  // Compute stat metrics
  const registeredEvents = events.filter((e) => e.is_registered);
  const upcomingSessions = sessions.filter((s) => s.status === "confirmed");
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  useEffect(() => {
    if (user) {
      const recs = computeRecommendations(user, listings, events, tutors, communities);
      setRecommendations(recs);
    }
  }, [user, listings.length, events.length, tutors.length, communities.length]);

  const handleToggleWishlist = (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dataStore.toggleWishlist(listingId);
  };

  const handleRegisterEvent = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = dataStore.registerForEvent(eventId);
    alert(res.message);
  };

  const filteredRecs = recommendations.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "events") return item.type === "event";
    if (activeTab === "marketplace") return item.type === "listing";
    if (activeTab === "tutors") return item.type === "tutor";
    return true;
  });

  return (
    <AppShell
      title={`Namaskara, ${user?.full_name?.split(" ")[0] || "Student"}! 👋`}
      subtitle={`${user?.college?.name || "VVCE Mysuru"} • ${user?.branch || "Computer Science"}`}
    >
      <div className="space-y-7">
        {/* 1. Personalized Welcome Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-700/40">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Campus Verified • Academic Year 2025-2026</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Connect. Learn. Share. Grow Together.
            </h2>

            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Find syllabus textbook deals from seniors, sign up for Karnataka Student Hackathon 2025,
              and book peer tutoring sessions with top rank holders.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Link
                href="/marketplace/new"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post Textbook or Gear
              </Link>
              <Link
                href="/events"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-700/80 hover:bg-indigo-700 text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Browse State Hackathons
              </Link>
              <Link
                href="/tutoring"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-700/80 hover:bg-indigo-700 text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Find Peer Tutor
              </Link>
            </div>
          </div>
        </div>

        {/* Peer Tutoring Onboarding Tip */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-amber-950 block">Peer Tutoring Tip:</span>
              You selected interest in peer tutoring during onboarding! When you're ready, list your subject expertise to help juniors and earn credits.
            </div>
          </div>
          <Link
            href="/tutoring/become-a-tutor"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm transition-all self-start sm:self-auto"
          >
            Become Tutor
          </Link>
        </div>

        {/* 2. Stat Cards Grid (Live Data) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card card-hover-lift">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Registered Events</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {registeredEvents.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Next: {registeredEvents[0]?.title.slice(0, 24) || "None upcoming"}...
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card card-hover-lift">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Tutoring Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {upcomingSessions.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Confirmed 1-on-1 peer sessions
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card card-hover-lift">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">My Active Listings</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {listings.filter((l) => l.seller_id === user?.id).length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Items on campus marketplace
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card card-hover-lift">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Joined Communities</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {communities.filter((c) => c.is_member).length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Guilds across Karnataka
            </p>
          </div>
        </div>

        {/* 3. Recommended for You (AI & Scoring Engine) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Recommended for You
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Smart Branch Match
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ranked by your college ({user?.college?.short_name}), engineering stream, and enrolled interests.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "all" ? "bg-white text-indigo-700 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "events" ? "bg-white text-indigo-700 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab("marketplace")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "marketplace" ? "bg-white text-indigo-700 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab("tutors")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "tutors" ? "bg-white text-indigo-700 font-bold shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tutors
              </button>
            </div>
          </div>

          {/* Recommendations Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredRecs.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card card-hover-lift flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual / Header */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50/50 text-indigo-600">
                        {item.type === "community" ? (
                          <Users className="w-10 h-10" />
                        ) : (
                          <Sparkles className="w-10 h-10" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm border border-slate-200/80">
                        {item.badge}
                      </span>
                    </div>

                    {item.type === "listing" && (
                      <button
                        onClick={(e) => handleToggleWishlist(item.id, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/95 shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {item.subtitle}
                    </p>

                    {/* AI / Scoring Rationale */}
                    <div className="pt-1">
                      <p className="text-[11px] text-indigo-700 bg-indigo-50/80 p-2 rounded-xl border border-indigo-100 flex items-start gap-1.5 font-medium leading-tight">
                        <Sparkles className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{item.whyRecommended}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="p-4 pt-0">
                  {item.type === "event" ? (
                    <button
                      onClick={(e) => handleRegisterEvent(item.id, e)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                    >
                      {item.actionText}
                    </button>
                  ) : (
                    <Link
                      href={item.link}
                      className="w-full py-2 rounded-xl text-xs font-bold text-center block text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      {item.actionText} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Two-Column Live Activity & Quick Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Recent Campus Discussions */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Trending Community Posts
                </h3>
                <p className="text-xs text-slate-500">Live feed across Karnataka guilds</p>
              </div>
              <Link
                href="/communities"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all communities →
              </Link>
            </div>

            <div className="space-y-3">
              {dataStore.getPostsByCommunity("comm-1").slice(0, 2).map((post) => (
                <div
                  key={post.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2 hover:bg-white hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-800 font-bold text-[10px] flex items-center justify-center">
                        {post.author?.full_name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-slate-900">
                        {post.author?.full_name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        • {post.author?.college?.short_name || "RVCE"}
                      </span>
                    </div>
                    {post.is_pinned && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{post.content}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>❤️ {post.likes_count} likes</span>
                    <span>💬 {post.comments_count} comments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hackathon Squad Recruitment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  Project Collaboration
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Recruiting
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Join a squad for the upcoming Karnataka Student Hackathon 2025.
              </p>

              {dataStore.getProjects().slice(0, 2).map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl border border-slate-200 space-y-2 bg-slate-50/50"
                >
                  <p className="font-bold text-xs text-slate-900">{proj.title}</p>
                  <div className="flex flex-wrap gap-1">
                    {proj.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-600"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>
                      Squad: {proj.current_members_count}/{proj.team_size} members
                    </span>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/projects/new"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-center block text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
            >
              + Create a Project Squad
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
