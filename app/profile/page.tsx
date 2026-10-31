"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  BadgeCheck,
  School,
  Mail,
  Phone,
  Edit,
  Save,
  CheckCircle2,
  Calendar,
  ShoppingBag,
  BookOpen,
  FolderGit2,
  Award,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";
import { dataStore } from "@/lib/data-store";

export default function MyProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [branch, setBranch] = useState(user?.branch || "Computer Science");
  const [year, setYear] = useState(user?.year || 3);
  const [phone, setPhone] = useState(user?.phone || "+91 98450 12345");
  const [showPhone, setShowPhone] = useState(user?.show_phone ?? true);
  const [showEmail, setShowEmail] = useState(user?.show_email ?? true);
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80"
  );
  const [skillsStr, setSkillsStr] = useState((user?.skills || []).join(", "));
  const [interestsStr, setInterestsStr] = useState((user?.interests || []).join(", "));

  const listings = dataStore.getListings().filter((l) => l.seller_id === user?.id);
  const events = dataStore.getEvents().filter((e) => e.is_registered);
  const sessions = dataStore.getTutoringSessions().filter((s) => s.student_id === user?.id || s.tutor_id === user?.id);
  const projects = dataStore.getProjects().filter((p) => p.is_member);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      bio,
      branch,
      year,
      phone,
      show_phone: showPhone,
      show_email: showEmail,
      avatar_url: avatarUrl,
      skills: skillsStr.split(",").map((s) => s.trim()).filter(Boolean),
      interests: interestsStr.split(",").map((i) => i.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  return (
    <AppShell title="Student Profile" subtitle="Manage your academic portfolio, verified credentials, and privacy controls">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-indigo-100 text-indigo-700 font-extrabold text-2xl flex items-center justify-center overflow-hidden border-2 border-indigo-200 shadow-md">
                  {user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                  ) : (
                    user?.full_name?.charAt(0) || "U"
                  )}
                </div>
                {user?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {user?.full_name}
                  </h1>
                  {user?.is_verified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified Student
                    </span>
                  )}
                  {user?.role === "admin" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Campus Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {user?.college?.name} ({user?.college?.short_name}) • {user?.branch}
                </p>
                <p className="text-xs font-mono text-slate-500">
                  USN: {user?.usn || "4VV21CS042"} • Year {user?.year || 3}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-sm self-start"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>

          {/* Activity Counts Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                {listings.length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Items Listed</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                {events.length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Events Registered</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                {sessions.length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Tutoring Sessions</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl">
              <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                {projects.length}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">Project Squads</p>
            </div>
          </div>

          {/* Edit Form OR View Details */}
          {isEditing ? (
            <form onSubmit={handleSave} className="pt-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Edit Profile & Privacy Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bio / Student Intro
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Current Year
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <p className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  Privacy Toggles
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={showPhone}
                    onChange={(e) => setShowPhone(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Show phone number on public marketplace listings</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={showEmail}
                    onChange={(e) => setShowEmail(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Show verified college email on public profile</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Interests & Domains (Comma separated)
                </label>
                <input
                  type="text"
                  value={interestsStr}
                  onChange={(e) => setInterestsStr(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About Me
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {user?.bio || "Engineering student at Karnataka campus."}
                </p>
              </div>

              {/* Skills & Interests Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Verified Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.skills?.map((sk) => (
                      <span
                        key={sk}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Focus Areas & Interests
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {user?.interests?.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievements & Certifications */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Academic Achievements & Badges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">Karnataka Hackathon 2024 Finalist</p>
                      <p className="text-[11px] text-slate-500">Issued by VTU Center for Innovation</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">CampusConnect Verified Contributor</p>
                      <p className="text-[11px] text-slate-500">Peer verified notes & code syndication</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
