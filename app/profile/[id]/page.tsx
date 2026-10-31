"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  MessageSquare,
  ShieldAlert,
  School,
  Mail,
  Phone,
  Award,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";
import { formatINR } from "@/lib/utils";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const profiles = dataStore.getProfiles();
  const colleges = dataStore.getColleges();
  const profile = profiles.find((p) => p.id === id);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!profile) {
    return (
      <AppShell title="Profile Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Student Profile Not Found</h2>
          <Link
            href="/dashboard"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  const college = colleges.find((c) => c.id === profile.college_id);
  const userListings = dataStore.getListings().filter((l) => l.seller_id === profile.id);

  const handleStartMessage = () => {
    const convId = dataStore.startOrGetDirectConversation(
      profile.id,
      profile.full_name,
      "tutor",
      profile.id
    );
    router.push(`/messages?conv=${convId}`);
  };

  return (
    <AppShell title={profile.full_name} subtitle="Verified Karnataka Student Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartMessage}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Report User</span>
            </button>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-2xl flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  profile.full_name.charAt(0)
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile.full_name}
                  </h1>
                  {profile.is_verified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified Student
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {college?.name} ({college?.short_name}) • {profile.branch}
                </p>
                <p className="text-xs font-mono text-slate-500">
                  USN: {profile.usn || "Verified"} • Year {profile.year || 3}
                </p>
              </div>
            </div>

            {/* Contact details if allowed by privacy settings */}
            <div className="text-xs text-slate-600 sm:text-right space-y-1 sm:border-l sm:border-slate-100 sm:pl-6">
              {profile.show_email && (
                <p className="flex items-center sm:justify-end gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </p>
              )}
              {profile.show_phone && profile.phone && (
                <p className="flex items-center sm:justify-end gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Bio & Background
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {profile.bio || "Engineering student at Karnataka accredited institution."}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Verified Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.skills || []).map((sk) => (
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
                Interests & Focus Areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(profile.interests || []).map((it) => (
                  <span
                    key={it}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Listings by this student */}
        {userListings.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              Listings by {profile.full_name} ({userListings.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.id}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card card-hover-lift block space-y-2"
                >
                  <p className="font-bold text-xs text-slate-900 truncate">{item.title}</p>
                  <p className="text-xs font-extrabold text-indigo-600 tabular-nums">
                    {formatINR(item.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="user"
        targetId={profile.id}
        targetTitle={profile.full_name}
      />
    </AppShell>
  );
}
