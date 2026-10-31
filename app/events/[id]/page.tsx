"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  CalendarPlus,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  BadgeCheck,
  ShieldAlert,
  AlertCircle,
  School,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ReportModal } from "@/components/report-modal";
import { dataStore } from "@/lib/data-store";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const event = dataStore.getEventById(id);
  const currentUserId = dataStore.getCurrentUserId();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "attendees">("overview");

  if (!event) {
    return (
      <AppShell title="Event Not Found">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
          <Link
            href="/events"
            className="inline-flex px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            ← Back to Events
          </Link>
        </div>
      </AppShell>
    );
  }

  const isOrganizer = event.organizer_id === currentUserId;
  const percentage = Math.min(
    100,
    Math.round(((event.registered_count || 1) / event.capacity) * 100)
  );

  const handleRegister = () => {
    const res = dataStore.registerForEvent(event.id);
    alert(res.message);
  };

  const handleCancelRegistration = () => {
    if (confirm("Are you sure you want to cancel your event registration?")) {
      const res = dataStore.cancelEventRegistration(event.id);
      alert(res.message);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate .ics calendar file
  const handleDownloadICS = () => {
    const title = event.title.replace(/[,\n]/g, " ");
    const venue = event.venue.replace(/[,\n]/g, " ");
    const desc = event.description.replace(/[,\n]/g, " ");

    const formatDateForICS = (iso: string) => {
      const d = new Date(iso);
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusConnect//Karnataka//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${venue}
DTSTART:${formatDateForICS(event.start_at)}
DTEND:${formatDateForICS(event.end_at)}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title.slice(0, 20)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Attendees CSV for Organizers
  const handleExportCSV = () => {
    const attendees = [
      { name: "Darshan Gowda", email: "demo-student@vvce.ac.in", college: "VVCE", usn: "4VV21CS042" },
      { name: "Aishwarya M", email: "aishwarya.m@bmsce.ac.in", college: "BMSCE", usn: "1BM22EC015" },
      { name: "Rohan Kumar", email: "rohan.k@rvce.edu.in", college: "RVCE", usn: "1RV21IS088" },
      { name: "Sneha Rao", email: "sneha.rao@nitk.edu.in", college: "NITK", usn: "211EC142" },
      { name: "Chandan Bhat", email: "chandan.b@msrit.edu", college: "MSRIT", usn: "1MS21ME032" },
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Email,College,USN,Status"]
        .concat(attendees.map((a) => `${a.name},${a.email},${a.college},${a.usn},Confirmed`))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees-${event.title.slice(0, 15)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell title={event.title} subtitle={`${event.type} • ${event.city}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadICS}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <CalendarPlus className="w-4 h-4 text-indigo-600" />
              <span>Add to Calendar</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? "Link Copied!" : "Share"}</span>
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

        {/* Hero Poster */}
        <div className="relative aspect-[21/9] sm:aspect-[24/9] bg-slate-950 rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.poster_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                  {event.type}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs uppercase">
                  {event.level} Level
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {event.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Tabs: Overview & Organizer Attendees View */}
        {isOrganizer && (
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Event Overview
            </button>
            <button
              onClick={() => setActiveTab("attendees")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "attendees"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Attendee List ({event.registered_count})</span>
            </button>
          </div>
        )}

        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  About This Event
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Schedule & Timing
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-semibold text-slate-500 text-[11px]">Starts At</p>
                      <p className="font-bold text-slate-900 mt-0.5">{formatDateTime(event.start_at)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-semibold text-slate-500 text-[11px]">Concludes</p>
                      <p className="font-bold text-slate-900 mt-0.5">{formatDateTime(event.end_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Venue & Location
                  </h4>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{event.venue}, {event.city}, Karnataka</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card: RSVP & Organizer (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Registration Status
                  </span>
                  {event.is_registered ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Open to Verified Students
                    </span>
                  )}
                </div>

                {/* Capacity Tracker */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span>Current Capacity</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {event.registered_count} / {event.capacity} seats ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 95 ? "bg-rose-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Deadline: {formatDateTime(event.registration_deadline)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  {event.is_registered ? (
                    <>
                      <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          You're Registered for this Event!
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Show your student ID card or CampusConnect profile upon entry.
                        </p>
                      </div>
                      <button
                        onClick={handleCancelRegistration}
                        className="w-full py-2.5 rounded-xl font-bold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                      >
                        Cancel My Registration
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={event.registered_count! >= event.capacity}
                      className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
                    >
                      {event.registered_count! >= event.capacity
                        ? "Event Full (Max Capacity Reached)"
                        : "Register with 1-Click RSVP →"}
                    </button>
                  )}
                </div>
              </div>

              {/* Organizer Information */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                  Event Organizer
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center overflow-hidden border border-indigo-200">
                    {event.organizer?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.organizer.avatar_url}
                        alt={event.organizer.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      event.organizer?.full_name?.charAt(0) || "O"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {event.organizer?.full_name}
                      </p>
                      {event.organizer?.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {event.college?.name || "Karnataka College Host"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/profile/${event.organizer_id}`}
                  className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 block text-center transition-colors"
                >
                  View Organizer Profile →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Organizer Attendee Roster with CSV Export */
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Confirmed Attendee Roster
                </h3>
                <p className="text-xs text-slate-500">
                  {event.registered_count} verified students registered from across Karnataka.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Attendees to CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">USN</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Darshan Gowda</td>
                    <td className="py-3 px-4">VVCE Mysuru</td>
                    <td className="py-3 px-4 font-mono">4VV21CS042</td>
                    <td className="py-3 px-4">demo-student@vvce.ac.in</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">Confirmed</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Aishwarya M</td>
                    <td className="py-3 px-4">BMSCE Bengaluru</td>
                    <td className="py-3 px-4 font-mono">1BM22EC015</td>
                    <td className="py-3 px-4">aishwarya.m@bmsce.ac.in</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">Confirmed</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Rohan Kumar</td>
                    <td className="py-3 px-4">RVCE Bengaluru</td>
                    <td className="py-3 px-4 font-mono">1RV21IS088</td>
                    <td className="py-3 px-4">rohan.k@rvce.edu.in</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">Confirmed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="post"
        targetId={event.id}
        targetTitle={event.title}
      />
    </AppShell>
  );
}
