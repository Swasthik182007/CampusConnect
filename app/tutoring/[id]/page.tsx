"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
  School,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";
import { formatINR, formatDate } from "@/lib/utils";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TutorDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading tutor profile...</div>}>
      <TutorDetailContent />
    </Suspense>
  );
}

function TutorDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params?.id as string;
  const reviewSessionId = searchParams.get("reviewSession");

  const tutor = dataStore.getTutorById(userId);
  const currentUserId = dataStore.getCurrentUserId();

  // Booking form state
  const [selectedSubject, setSelectedSubject] = useState(tutor?.subjects[0] || "Data Structures");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [note, setNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  if (!tutor) {
    return (
      <AppShell title="Tutor Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Tutor Not Found</h2>
          <Link
            href="/tutoring"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Tutors
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedDate || !selectedSlot) {
      setBookingError("Please select a date and an available time slot.");
      return;
    }

    setBookingLoading(true);
    const [startHour, endHour] = selectedSlot.split("-");
    const startAt = new Date(`${selectedDate}T${startHour.trim()}:00`).toISOString();
    const endAt = new Date(`${selectedDate}T${endHour.trim()}:00`).toISOString();

    const res = dataStore.bookSession({
      tutor_id: tutor.user_id,
      subject: selectedSubject,
      start_at: startAt,
      end_at: endAt,
      mode,
      note,
    });

    setBookingLoading(false);
    if (res.success) {
      setBookingSuccess(true);
    } else {
      setBookingError(res.message);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewSessionId) return;

    dataStore.addTutorReview(reviewSessionId, tutor.user_id, rating, reviewComment);
    setReviewSubmitted(true);
  };

  const handleChat = () => {
    const convId = dataStore.startOrGetDirectConversation(
      tutor.user_id,
      tutor.profile?.full_name || "Tutor",
      "tutor",
      tutor.user_id
    );
    router.push(`/messages?conv=${convId}`);
  };

  return (
    <AppShell title={tutor.profile?.full_name || "Peer Tutor"} subtitle="Verified Senior Peer Mentor">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/tutoring"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tutor Directory</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleChat}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Chat</span>
            </button>
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-extrabold text-2xl flex items-center justify-center overflow-hidden border border-indigo-200 shrink-0">
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
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {tutor.profile?.full_name}
                  </h1>
                  {tutor.profile?.is_verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {tutor.profile?.college?.name} ({tutor.profile?.college?.short_name}) • {tutor.profile?.branch}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs font-semibold">
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{tutor.rating_avg}</span>
                    <span className="opacity-80">({tutor.rating_count} reviews)</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-900 font-extrabold tabular-nums">
                    {formatINR(tutor.hourly_rate)} / hr
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-1 text-xs">
              <span className="text-slate-400 block font-medium">Session Mode</span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                {tutor.mode === "both" ? "Online & Campus" : tutor.mode}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                About & Teaching Methodology
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {tutor.bio}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Available Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((sub) => (
                  <span
                    key={sub}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Weekly Availability Windows */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Regular Weekly Availability Slots
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {tutor.availability?.map((av) => (
                  <div
                    key={av.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">
                      {WEEKDAYS[av.weekday]}
                    </span>
                    <span className="text-indigo-600 font-mono text-[11px] font-bold">
                      {av.start_time} - {av.end_time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form or Review Submission */}
        {reviewSessionId && !reviewSubmitted ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-card space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              Leave a Review for Your Completed Session
            </h3>
            <p className="text-xs text-slate-500">
              Your rating helps fellow VTU & Karnataka students find quality peer mentors.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-2 text-amber-500 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= rating ? "fill-amber-500" : "text-slate-300"}`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-slate-800">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Review & Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the conceptual explanation? Did it help for college exams or placement coding?"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md"
              >
                Submit Review →
              </button>
            </form>
          </div>
        ) : reviewSubmitted ? (
          <div className="bg-emerald-50 rounded-3xl p-6 text-center border border-emerald-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900">Review Submitted!</h4>
            <p className="text-xs text-emerald-700">Tutor rating has been updated dynamically.</p>
          </div>
        ) : (
          /* Main Booking Section */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 tracking-tight">
                  Schedule 1-on-1 Tutoring Session
                </h3>
                <p className="text-xs text-slate-500">
                  Select your subject, date, and preferred slot from tutor's availability.
                </p>
              </div>
              <span className="text-sm font-extrabold text-indigo-600 tabular-nums">
                {formatINR(tutor.hourly_rate)} / hr
              </span>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">
                  Booking Request Sent to {tutor.profile?.full_name}!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  The tutor has been notified. You can track confirmation under "My Sessions" or
                  send a direct message in the meantime.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/tutoring"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  >
                    Back to Directory
                  </Link>
                  <button
                    onClick={handleChat}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm"
                  >
                    Open Chat with Tutor
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                {bookingError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Subject *
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {tutor.subjects.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Mode *
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="online">Online (Google Meet / Zoom link provided)</option>
                      <option value="offline">Offline (Campus Library / Study Center)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Choose Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                      Available Slot *
                    </label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      required
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="">-- Select Time Slot --</option>
                      <option value="17:00 - 18:00">5:00 PM - 6:00 PM</option>
                      <option value="18:00 - 19:00">6:00 PM - 7:00 PM</option>
                      <option value="19:00 - 20:00">7:00 PM - 8:00 PM</option>
                      <option value="10:00 - 11:00">10:00 AM - 11:00 AM (Weekend)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Specific doubts or topics for the session (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Need help with Dynamic Programming memoization, VTU M2 Fourier coefficients, or LeetCode graph problems..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
                  >
                    {bookingLoading ? "Checking Availability..." : "Confirm & Send Booking Request →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Student Reviews ({tutor.reviews?.length || 0})
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              ★ {tutor.rating_avg} Overall Average
            </span>
          </div>

          {tutor.reviews && tutor.reviews.length > 0 ? (
            <div className="space-y-3">
              {tutor.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(rev.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No public reviews submitted yet.</p>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="user"
        targetId={tutor.user_id}
        targetTitle={tutor.profile?.full_name}
      />
    </AppShell>
  );
}
