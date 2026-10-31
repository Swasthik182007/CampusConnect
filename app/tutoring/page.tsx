"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Star,
  Clock,
  MapPin,
  Calendar,
  BadgeCheck,
  CheckCircle2,
  DollarSign,
  School,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { dataStore } from "@/lib/data-store";
import { Tutor, TutoringMode } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const SUBJECT_PRESETS = [
  "All Subjects",
  "Data Structures & Algorithms",
  "Engineering Mathematics",
  "Machine Learning",
  "Microcontrollers & Embedded C",
  "System Design",
  "Java OOPs",
  "SolidWorks & CAD",
];

export default function TutoringPage() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedMode, setSelectedMode] = useState<"all" | TutoringMode>("all");
  const [selectedCollege, setSelectedCollege] = useState("All");
  const [minRating, setMinRating] = useState<number>(4.0);
  const [maxRate, setMaxRate] = useState<number>(1000);
  const [viewTab, setViewTab] = useState<"tutors" | "my-sessions">("tutors");

  const tutors = dataStore.getTutors();
  const colleges = dataStore.getColleges();
  const sessions = dataStore.getTutoringSessions();
  const currentUserId = dataStore.getCurrentUserId();

  const mySessions = sessions.filter(
    (s) => s.student_id === currentUserId || s.tutor_id === currentUserId
  );

  const filteredTutors = tutors.filter((t) => {
    if (selectedMode !== "all" && t.mode !== "both" && t.mode !== selectedMode) return false;
    if (t.rating_avg < minRating) return false;
    if (t.hourly_rate > maxRate) return false;

    if (selectedCollege !== "All" && t.profile?.college_id !== selectedCollege) return false;

    if (selectedSubject !== "All Subjects") {
      const matchSub = t.subjects.some((s) =>
        s.toLowerCase().includes(selectedSubject.toLowerCase())
      );
      if (!matchSub) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.profile?.full_name.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <AppShell
      title="Peer Tutoring Hub"
      subtitle="Learn directly from top senior rank holders and placement achievers in Karnataka"
    >
      <div className="space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewTab("tutors")}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewTab === "tutors"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse Tutors ({tutors.length})
            </button>
            <button
              onClick={() => setViewTab("my-sessions")}
              className={`px-4 py-2 rounded-xl transition-all ${
                viewTab === "my-sessions"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Sessions ({mySessions.length})
            </button>
          </div>

          <Link
            href="/tutoring/become-a-tutor"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Become a Peer Tutor</span>
          </Link>
        </div>

        {viewTab === "tutors" ? (
          <>
            {/* Search and Filters Strip */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by tutor name, subject (DSA, M1/M2/M3, IoT, VLSI), or syllabus topic..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject Area
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    {SUBJECT_PRESETS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="all">All Modes (Online & Offline)</option>
                    <option value="online">Online (Google Meet / Zoom)</option>
                    <option value="offline">Offline (Campus Study Room / Library)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    College Campus
                  </label>
                  <select
                    value={selectedCollege}
                    onChange={(e) => setSelectedCollege(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="All">All Karnataka Colleges</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.short_name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span>Max Hourly Rate</span>
                    <span className="text-indigo-600 font-bold tabular-nums">
                      {formatINR(maxRate)}/hr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    step="50"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Tutor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTutors.map((tutor) => (
                <div
                  key={tutor.user_id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-card card-hover-lift overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Avatar, Name, Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-base flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                          {tutor.profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={tutor.profile.avatar_url}
                              alt={tutor.profile.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            tutor.profile?.full_name?.charAt(0) || "T"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-base truncate">
                              {tutor.profile?.full_name}
                            </h4>
                            {tutor.profile?.is_verified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {tutor.profile?.college?.short_name || "VVCE"} • Year {tutor.profile?.year || 4}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 font-bold text-xs shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{tutor.rating_avg}</span>
                        <span className="text-[10px] text-amber-600 opacity-80">
                          ({tutor.rating_count})
                        </span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {tutor.bio}
                    </p>

                    {/* Subject Tags */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Specialized Subjects
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects.map((sub) => (
                          <span
                            key={sub}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rate & Mode Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-base font-extrabold text-slate-900 tabular-nums">
                          {formatINR(tutor.hourly_rate)}
                        </span>
                        <span className="text-slate-400 font-medium"> / hour</span>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {tutor.mode === "both" ? "Online & Offline" : tutor.mode}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="p-6 pt-0">
                    <Link
                      href={`/tutoring/${tutor.user_id}`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs text-center block text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01]"
                    >
                      Book 1-on-1 Session →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* My Tutoring Sessions (Upcoming & Past) */
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Your Scheduled Tutoring Sessions
            </h3>
            {mySessions.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-xs text-slate-500">You don't have any tutoring sessions booked yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mySessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {sess.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          sess.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : sess.status === "completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {sess.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p>
                        <strong>Tutor:</strong> {sess.tutor?.profile?.full_name || "Senior Tutor"}
                      </p>
                      <p>
                        <strong>Mode:</strong> <span className="capitalize">{sess.mode}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(sess.start_at).toLocaleString("en-IN")}</span>
                      </p>
                      {sess.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1">
                          "{sess.note}"
                        </p>
                      )}
                    </div>

                    {sess.status === "completed" && (
                      <div className="pt-2 border-t border-slate-100">
                        <Link
                          href={`/tutoring/${sess.tutor_id}?reviewSession=${sess.id}`}
                          className="w-full py-2 rounded-xl text-xs font-bold text-center block bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                        >
                          ★ Leave Tutor Review
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
